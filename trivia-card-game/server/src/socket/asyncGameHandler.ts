import { Server, Socket } from 'socket.io';
import { Level, Subject } from '../types/game';
import { AsyncAnswer } from '../types/season';
import { judgeAnswer } from '../services/judgeService';
import { generateQuestion } from '../services/questionService';
import { simulateAiTurn } from '../services/aiStrategyService';
import { processTurnEnd, getPlayerSeasonState } from '../services/seasonService';
import { createAsyncRoom, getAsyncRoom, getLatestAsyncRoom, updateAsyncRoom, refreshExpiresAt, abandonAsyncRoom } from '../services/asyncRoomService';

// 学科 ID 到中文名称的映射
const subjectMap: Record<string, Subject> = {
  sub_yuwen: '语文',
  sub_math: '数学',
  sub_english: '英语',
  sub_science: '科学',
  sub_history: '历史',
  sub_geography: '地理',
  sub_biology: '生物',
  sub_daofa: '道法',
};

const levelMap: Record<string, Level> = {
  lv_1: 'Lv1',
  lv_2: 'Lv2',
  lv_3: 'Lv3',
  lv_4: 'Lv4',
};

// 防止重复注册（Vite HMR 会导致多次调用）
let handlersRegistered = false;

export function setupAsyncGameHandlers(io: Server) {
  if (handlersRegistered) {
    console.log('[Async] Handlers already registered, skipping');
    return;
  }
  handlersRegistered = true;

  const playerAsyncRoom = new Map<string, string>(); // socketId -> roomId
  const lastQuestionTime = new Map<string, number>(); // playerClientId -> timestamp

  io.on('connection', (socket: Socket) => {
    console.log(`[Async] Client connected: ${socket.id}`);

    // 使用客户端传递的持久化 ID（页面刷新后不变），若无则退化为 socket.id
    const playerClientId = (socket.handshake.auth.playerClientId as string) || socket.id;

    // 页面刷新重连时，自动查找并恢复已有房间状态
    const existingRoom = getLatestAsyncRoom(playerClientId);
    if (existingRoom && (existingRoom.state === 'waiting' || existingRoom.state === 'playing')) {
      playerAsyncRoom.set(playerClientId, existingRoom.id);
      socket.emit('async_room_state', existingRoom);
      console.log('[Async] auto-restored existing room on reconnect:', existingRoom.id);

      // 同时推送赛季状态
      const seasonState = getPlayerSeasonState(playerClientId);
      if (seasonState) {
        socket.emit('season_state', {
          season: seasonState.season,
          stats: seasonState.stats,
        });
      }
    }

    socket.on('start_async_game', async (data: { maxTurns?: number }) => {
      console.log('[Async] start_async_game received from', playerClientId, 'socket:', socket.id, 'data:', data);
      const maxTurns = data.maxTurns ?? 3;

      // 检查是否已有进行中的异步房间（用持久化 ID 查找，刷新页面后仍能找到）
      const existing = getLatestAsyncRoom(playerClientId);
      console.log('[Async] existing room:', existing);
      if (existing && (existing.state === 'waiting' || existing.state === 'playing')) {
        // 已有进行中的对局，直接继续
        playerAsyncRoom.set(playerClientId, existing.id);
        socket.emit('async_room_state', existing);
        console.log('[Async] resuming existing room');
        return;
      }

      console.log('[Async] creating new room...');
      const room = createAsyncRoom(playerClientId, maxTurns);
      console.log('[Async] room created:', room);
      playerAsyncRoom.set(playerClientId, room.id);
      socket.join(room.id);

      // 推送赛季状态
      const seasonState = getPlayerSeasonState(playerClientId);
      if (seasonState) {
        socket.emit('season_state', {
          season: seasonState.season,
          stats: seasonState.stats,
        });
      }

      console.log('[Async] emitting async_room_state');
      socket.emit('async_room_state', room);
    });

    // 添加题目 - 服务端生成题目并发送给客户端
    socket.on('add_async_question', async (data: {
      subjectId: string;
      levelId: string;
    }) => {
      console.log('[Async] add_async_question received from', playerClientId, 'data:', data);
      const roomId = playerAsyncRoom.get(playerClientId);
      if (!roomId) {
        socket.emit('error', { message: '未找到异步房间' });
        return;
      }

      const room = getAsyncRoom(roomId);
      if (!room) {
        socket.emit('error', { message: '异步房间不存在' });
        return;
      }

      if (room.state !== 'waiting' && room.state !== 'playing') {
        socket.emit('error', { message: '对局已结束' });
        return;
      }

      // 防重复：检查最近是否在2秒内生成过题目
      const lastTime = lastQuestionTime.get(playerClientId) || 0;
      const now = Date.now();
      if (now - lastTime < 2000) {
        console.log('[Async] add_async_question blocked - too soon, last:', lastTime, 'now:', now);
        socket.emit('error', { message: '题目生成太频繁，请稍后再试' });
        return;
      }
      lastQuestionTime.set(playerClientId, now);

      const subject = subjectMap[data.subjectId];
      if (!subject) {
        socket.emit('error', { message: '无效的学科' });
        return;
      }

      const level = levelMap[data.levelId] ?? 'Lv1';

      try {
        console.log('[Async] generating question for', subject, level);
        const q = await generateQuestion(
          subject,
          level,
          process.env.MINIMAX_API_KEY!,
          process.env.MINIMAX_BASE_URL!,
          process.env.MINIMAX_MODEL!
        );
        console.log('[Async] question generated, emitting async_question_ready');

        socket.emit('async_question_ready', {
          tempId: `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          subjectId: data.subjectId,
          levelId: data.levelId,
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          timeLimit: q.timeLimit,
        });
        console.log('[Async] async_question_ready emitted');
      } catch (err) {
        console.error('生成题目失败:', err);
        socket.emit('error', { message: '生成题目失败' });
      }
    });

    socket.on('submit_async_turn', async (data: {
      questions: Array<{
        tempId: string;
        subjectId: string;
        levelId: string;
        question: string;
        options: string[];
        answer: string;
        explanation?: string;
        timeLimit: number;
        playerAnswer: string;
        timeUsed?: number;
      }>
    }) => {
      const roomId = playerAsyncRoom.get(playerClientId);
      if (!roomId) {
        socket.emit('error', { message: '未找到异步房间' });
        return;
      }

      const room = getAsyncRoom(roomId);
      if (!room) {
        socket.emit('error', { message: '异步房间不存在' });
        return;
      }

      if (room.state !== 'waiting' && room.state !== 'playing') {
        socket.emit('error', { message: '对局已结束' });
        return;
      }

      const playerAnswers: AsyncAnswer[] = [];
      let playerScoreThisTurn = 0;

      // 处理每道题
      for (const q of data.questions) {
        const level = levelMap[q.levelId] ?? 'Lv1';
        const isCorrect = judgeAnswer(q.playerAnswer, q.answer, q.subjectId);

        if (isCorrect) playerScoreThisTurn++;

        const xpLevelBonus = level === 'Lv4' ? 2 : level === 'Lv3' ? 1 : 0;

        playerAnswers.push({
          subject: q.subjectId,
          level,
          questionId: q.tempId,
          answer: q.playerAnswer,
          correct: isCorrect,
          xpEarned: isCorrect ? 3 + xpLevelBonus : 0,
          aiAnswer: '',
          aiQuestion: '',
          aiOptions: [],
        });
      }

      // 更新房间 - 先计算回合数
      const newTurnCount = room.turnCount + 1;

      // AI 代打 - 先通知前端 AI 开始思考
      socket.emit('ai_thinking_start', { turnCount: newTurnCount });

      // 为每道玩家题目并行生成对应的 AI 题目（相同科目+难度，内容不同）
      const aiQuestionPromises = data.questions.map(q => {
        const subjectName = subjectMap[q.subjectId as keyof typeof subjectMap] ?? '语文';
        const levelName = levelMap[q.levelId] ?? 'Lv1';
        return generateQuestion(
          subjectName as Subject,
          levelName as Level,
          process.env.MINIMAX_API_KEY ?? '',
          process.env.MINIMAX_BASE_URL ?? '',
          process.env.MINIMAX_MODEL ?? '',
        );
      });
      const aiQuestions = await Promise.all(aiQuestionPromises);

      // 模拟 AI 思考时间（3-5秒）
      const thinkTime = 3000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, thinkTime));

      const aiAnswers = simulateAiTurn(
        data.questions.map((q, i) => {
          const aiQ = aiQuestions[i];
          return {
            subject: q.subjectId,
            level: levelMap[q.levelId] ?? 'Lv1',
            questionId: `ai_${q.tempId}`,
            aiQuestion: aiQ.question,
            aiOptions: aiQ.options,
            aiCorrectAnswer: aiQ.answer,
          };
        })
      );

      // 逐题推送 AI 答案（让前端可以逐题显示）
      for (let i = 0; i < aiAnswers.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        socket.emit('ai_answer_reveal', {
          index: i,
          answer: aiAnswers[i],
          total: aiAnswers.length,
        });
      }

      // 通知前端 AI 思考结束
      socket.emit('ai_thinking_stop');

      await new Promise(resolve => setTimeout(resolve, 500));

      const aiScoreThisTurn = aiAnswers.filter(a => a.correct).length;
      const newPlayerScore = room.playerScore + playerScoreThisTurn;
      const newAiScore = room.aiScore + aiScoreThisTurn;
      const allPlayerAnswers = [...room.playerAnswers, ...playerAnswers];
      const allAiAnswers = [...room.aiAnswers, ...aiAnswers];

      // 检查胜负
      let newState: 'playing' | 'completed' = 'playing';
      let winner: 'player' | 'ai' | null = null;

      if (newTurnCount >= room.maxTurns) {
        newState = 'completed';
        if (newPlayerScore > newAiScore) winner = 'player';
        else if (newAiScore > newPlayerScore) winner = 'ai';
        else winner = 'ai'; // 平局默认 AI 获胜
      }

      updateAsyncRoom(roomId, {
        state: newState as 'waiting' | 'playing' | 'completed' | 'expired',
        playerAnswers: allPlayerAnswers,
        aiAnswers: allAiAnswers,
        turnCount: newTurnCount,
        playerScore: newPlayerScore,
        aiScore: newAiScore,
        winner,
      });

      if (winner === null) {
        refreshExpiresAt(roomId);
      }

      // 处理 XP 和段位
      const turnResult = processTurnEnd(playerClientId, playerAnswers, winner === 'player');

      // 推送结果
      const updatedRoom = getAsyncRoom(roomId)!;

      socket.emit('async_room_state', updatedRoom);
      socket.emit('ai_turn_result', {
        turnCount: newTurnCount,
        aiScore: newAiScore,
        aiAnswers,
      });
      socket.emit('xp_gained', {
        xpEarned: turnResult.xpEarned,
        totalXp: turnResult.totalXp,
        tier: turnResult.newTier,
        tierChanged: turnResult.tierChanged,
      });

      if (turnResult.tierChanged) {
        socket.emit('tier_up', { newTier: turnResult.newTier });
      }

      if (newState === 'completed') {
        socket.emit('async_game_over', {
          winner,
          finalScore: { player: newPlayerScore, ai: newAiScore },
        });

        const seasonStateFinal = getPlayerSeasonState(playerClientId);
        if (seasonStateFinal) {
          socket.emit('season_state', {
            season: seasonStateFinal.season,
            stats: seasonStateFinal.stats,
          });
        }
      }
    });

    // 放弃当前对局
    socket.on('abandon_async_game', () => {
      const roomId = playerAsyncRoom.get(playerClientId);
      if (roomId) {
        abandonAsyncRoom(roomId);
        playerAsyncRoom.delete(playerClientId);
        socket.emit('async_room_state', null);
        socket.emit('game_abandoned', { message: '已放弃当前对局' });
      }
    });

    socket.on('disconnect', () => {
      const roomId = playerAsyncRoom.get(playerClientId);
      if (roomId) {
        playerAsyncRoom.delete(playerClientId);
      }
      console.log(`[Async] Client disconnected: ${socket.id}`);
    });
  });
}

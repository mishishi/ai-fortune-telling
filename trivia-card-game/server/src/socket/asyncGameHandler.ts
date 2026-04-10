import { Server, Socket } from 'socket.io';
import { Level } from '../types/game';
import { AsyncAnswer } from '../types/season';
import { judgeAnswer } from '../services/judgeService';
import { generateQuestion } from '../services/questionService';
import { simulateAiTurn } from '../services/aiStrategyService';
import { processTurnEnd, getPlayerSeasonState } from '../services/seasonService';
import { createAsyncRoom, getAsyncRoom, updateAsyncRoom, refreshExpiresAt } from '../services/asyncRoomService';

export function setupAsyncGameHandlers(io: Server) {
  const playerAsyncRoom = new Map<string, string>(); // socketId -> roomId

  io.on('connection', (socket: Socket) => {
    console.log(`[Async] Client connected: ${socket.id}`);

    socket.on('start_async_game', async (data: { maxTurns?: number }) => {
      const playerId = socket.id;
      const maxTurns = data.maxTurns ?? 3;

      // 检查是否已有进行中的异步房间
      const existing = getLatestAsyncRoom(playerId);
      if (existing && (existing.state === 'waiting' || existing.state === 'playing')) {
        socket.emit('error', { message: '已有进行中的异步对战，请先完成当前对局' });
        socket.emit('async_room_state', existing);
        return;
      }

      const room = createAsyncRoom(playerId, maxTurns);
      playerAsyncRoom.set(socket.id, room.id);
      socket.join(room.id);

      // 推送赛季状态
      const seasonState = getPlayerSeasonState(playerId);
      if (seasonState) {
        socket.emit('season_state', {
          season: seasonState.season,
          stats: seasonState.stats,
        });
      }

      socket.emit('async_room_state', room);
    });

    socket.on('submit_async_turn', async (data: {
      answers: Array<{
        subjectId: string;
        levelId: string;
        questionId: string;
        answer: string;
        timeUsed?: number;
      }>
    }) => {
      const roomId = playerAsyncRoom.get(socket.id);
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

      const levelMap: Record<string, Level> = {
        lv_1: 'Lv1', lv_2: 'Lv2', lv_3: 'Lv3', lv_4: 'Lv4',
      };

      const playerAnswers: AsyncAnswer[] = [];
      let playerScoreThisTurn = 0;

      // 处理每道题
      for (const submitted of data.answers) {
        let q;
        try {
          q = await generateQuestion(
            submitted.subjectId as any,
            levelMap[submitted.levelId] ?? 'Lv1',
            process.env.MINIMAX_API_KEY!,
            process.env.MINIMAX_BASE_URL!,
            process.env.MINIMAX_MODEL!
          );
        } catch {
          q = null;
        }

        const questionId = q?.id ?? `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const correctAnswer = q?.answer ?? 'A';
        const isCorrect = judgeAnswer(submitted.answer, correctAnswer, submitted.subjectId);

        if (isCorrect) playerScoreThisTurn++;

        const level = levelMap[submitted.levelId] ?? 'Lv1';
        const xpLevelBonus = level === 'Lv4' ? 2 : level === 'Lv3' ? 1 : 0;

        playerAnswers.push({
          subject: submitted.subjectId,
          level,
          questionId,
          answer: submitted.answer,
          correct: isCorrect,
          xpEarned: isCorrect ? 3 + xpLevelBonus : 0,
        });
      }

      // AI 代打
      const aiAnswers = simulateAiTurn(
        data.answers.map(a => ({
          subject: a.subjectId,
          level: levelMap[a.levelId] ?? 'Lv1',
          questionId: a.questionId,
        }))
      );

      const aiScoreThisTurn = aiAnswers.filter(a => a.correct).length;

      // 更新房间
      const newTurnCount = room.turnCount + 1;
      const newPlayerScore = room.playerScore + playerScoreThisTurn;
      const newAiScore = room.aiScore + aiScoreThisTurn;
      const allPlayerAnswers = [...room.playerAnswers, ...playerAnswers];
      const allAiAnswers = [...room.aiAnswers, ...aiAnswers];

      // 检查胜负
      let newState: 'waiting' | 'playing' | 'completed' | 'expired' = 'playing';
      let winner: 'player' | 'ai' | 'expired' | null = null;

      if (newTurnCount >= room.maxTurns) {
        newState = 'completed';
        if (newPlayerScore > newAiScore) winner = 'player';
        else if (newAiScore > newPlayerScore) winner = 'ai';
        else winner = 'ai'; // 平局默认 AI 获胜
      }

      updateAsyncRoom(roomId, {
        state: newState,
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
      const turnResult = processTurnEnd(socket.id, playerAnswers, winner === 'player');

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

      if (newState === 'completed' || newState === 'expired') {
        socket.emit('async_game_over', {
          winner,
          finalScore: { player: newPlayerScore, ai: newAiScore },
        });

        const seasonStateFinal = getPlayerSeasonState(socket.id);
        if (seasonStateFinal) {
          socket.emit('season_state', {
            season: seasonStateFinal.season,
            stats: seasonStateFinal.stats,
          });
        }
      }
    });

    socket.on('disconnect', () => {
      const roomId = playerAsyncRoom.get(socket.id);
      if (roomId) {
        playerAsyncRoom.delete(socket.id);
      }
      console.log(`[Async] Client disconnected: ${socket.id}`);
    });
  });
}

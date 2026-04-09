import { Server, Socket } from 'socket.io';
import { generateQuestion } from '../services/questionService';
import { judgeAnswer } from '../services/judgeService';
import {
  GameState, GamePhase, Subject, Level,
  SUBJECT_CARDS, LEVEL_CARDS,
  WIN_SCORE_SIMPLE, WIN_SCORE_STANDARD
} from '../types/game';
import { getDb, saveDb } from '../db/sqlite';

interface Room {
  state: GameState;
  handSubjects: string[];   // 玩家手牌（学科卡ID列表）
  handLevels: string[];     // 玩家手牌（等级卡ID列表）
  deck: string[];           // 牌堆（格式: "subjectId__levelId"）
  discard: string[];        // 弃牌堆
  usedSubjectLevels: Set<string>; // 本局已用的学科+等级组合 (格式: "Subject__Level")
  winScore: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createDeck(): string[] {
  const cards: string[] = [];
  for (const sub of SUBJECT_CARDS) {
    for (const lv of LEVEL_CARDS) {
      cards.push(`${sub.id}__${lv.id}`);
    }
  }
  return shuffle(cards);
}

function buildRoom(roomId: string, winScore: number): Room {
  const deck = createDeck();
  // 发5张牌（每张牌含学科+等级，所以取前5个组合）
  const handCards = deck.splice(0, 5);
  const handSubjects = handCards.map(c => c.split('__')[0]);
  const handLevels = handCards.map(c => c.split('__')[1]);

  return {
    state: {
      roomId,
      phase: 'play_card',
      playerScore: 0,
      aiScore: 0,
      currentQuestion: null,
      usedSubjectLevels: [],
      winner: null,
    },
    handSubjects,
    handLevels,
    deck,
    discard: [],
    usedSubjectLevels: new Set(),
    winScore,
  };
}

function sendState(io: Server, room: Room) {
  io.to(room.state.roomId).emit('game_state', {
    roomId: room.state.roomId,
    phase: room.state.phase,
    playerScore: room.state.playerScore,
    aiScore: room.state.aiScore,
    currentQuestion: room.state.currentQuestion,
    winner: room.state.winner,
    handSubjects: room.handSubjects,
    handLevels: room.handLevels,
    deckCount: room.deck.length,
    discardCount: room.discard.length,
  });
}

export function setupGameHandlers(io: Server) {
  const rooms = new Map<string, Room>();
  const playerSockets = new Map<string, string>(); // socketId -> roomId

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('start_game', (data: { winScore?: number }) => {
      const roomId = `room_${socket.id}_${Date.now()}`;
      const winScore = data.winScore ?? WIN_SCORE_SIMPLE;
      const room = buildRoom(roomId, winScore);
      rooms.set(roomId, room);
      playerSockets.set(socket.id, roomId);
      socket.join(roomId);
      sendState(io, room);
    });

    socket.on('play_cards', async (data: {
      subjectCardId: string;
      levelCardId: string;
    }) => {
      const roomId = playerSockets.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room) return;
      if (room.state.phase !== 'play_card') {
        socket.emit('error', { message: '当前不是出牌阶段' });
        return;
      }

      const { subjectCardId, levelCardId } = data;

      // 找到对应的学科和等级
      const subCard = SUBJECT_CARDS.find(c => c.id === subjectCardId);
      const lvCard = LEVEL_CARDS.find(c => c.id === levelCardId);
      if (!subCard || !lvCard) {
        socket.emit('error', { message: '无效的卡牌' });
        return;
      }

      const subject = subCard.name as Subject;
      const level = lvCard.level as Level;
      const key = `${subject}__${level}`;

      // 防重复检查（不提前标记，留到出题成功后再添加）
      if (room.usedSubjectLevels.has(key)) {
        socket.emit('error', { message: '此学科+难度组合已在本题用过' });
        return;
      }

      // 从手牌移除这两张卡（通过ID找到对应的另一张）
      // 手牌中学科卡和等级卡是配对的，通过索引关联
      const subjectIdx = room.handSubjects.indexOf(subjectCardId);
      if (subjectIdx === -1) {
        socket.emit('error', { message: '你手牌中没有这张学科卡' });
        return;
      }
      // 找到对应的等级卡ID（同索引的等级卡）
      const correspondingLevelId = room.handLevels[subjectIdx];
      if (correspondingLevelId !== levelCardId) {
        socket.emit('error', { message: '学科卡和等级卡不匹配' });
        return;
      }

      // AI 出题（可能失败）
      let q;
      try {
        q = await generateQuestion(
          subject, level,
          process.env.MINIMAX_API_KEY!,
          process.env.MINIMAX_BASE_URL!,
          process.env.MINIMAX_MODEL!
        );
      } catch (e) {
        socket.emit('error', { message: `出题失败: ${(e as Error).message}` });
        room.state.phase = 'play_card';
        sendState(io, room);
        return; // 卡片没有移除，安全退出
      }

      // 出题成功后才修改状态
      room.usedSubjectLevels.add(key);

      // 从手牌移除（通过 splice 找到并移除）
      // 由于 handSubjects 和 handLevels 是配对的，用索引操作
      room.handSubjects.splice(subjectIdx, 1);
      room.handLevels.splice(subjectIdx, 1);

      // 加入弃牌堆
      room.discard.push(subjectCardId, levelCardId);

      // 补牌至 5 张
      while (room.handSubjects.length < 5 && room.deck.length > 0) {
        const card = room.deck.shift()!;
        const [subId, lvId] = card.split('__');
        room.handSubjects.push(subId);
        room.handLevels.push(lvId);
      }

      // 进入答题阶段
      room.state.phase = 'answering';
      room.state.currentQuestion = q;
      sendState(io, room);
    });

    socket.on('submit_answer', (data: { answer: string }) => {
      const roomId = playerSockets.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.state.phase !== 'answering') return;
      if (!room.state.currentQuestion) return;

      const q = room.state.currentQuestion;
      const isCorrect = judgeAnswer(data.answer, q.answer, q.subject);

      if (isCorrect) {
        room.state.playerScore += 1;
      }

      // 记录到数据库
      try {
        const db = getDb();
        db.run(
          `INSERT INTO questions_log (room_id, subject, level, question_hash, result) VALUES (?, ?, ?, ?, ?)`,
          [roomId, q.subject, q.level, q.id, isCorrect ? 'correct' : 'wrong']
        );
        saveDb();
      } catch (e) {
        console.error('Failed to log question:', e);
      }

      // 检查胜利条件
      if (room.state.playerScore >= room.winScore) {
        room.state.winner = 'player';
        room.state.phase = 'game_over';
      } else if (room.deck.length === 0) {
        // 牌堆耗尽，比较分数
        room.state.winner = room.state.playerScore > room.state.aiScore ? 'player' : 'ai';
        room.state.phase = 'game_over';
      } else {
        room.state.phase = 'play_card';
      }

      room.state.currentQuestion = null;
      sendState(io, room);

      // 游戏结束时记录对局
      if (room.state.phase === 'game_over') {
        try {
          const db = getDb();
          db.run(
            `INSERT INTO game_records (room_id, player_score, ai_score, winner, subject_cards_used, finished_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            [roomId, room.state.playerScore, room.state.aiScore, room.state.winner, JSON.stringify([...room.usedSubjectLevels])]
          );
          saveDb();
        } catch (e) {
          console.error('Failed to save game record:', e);
        }
        rooms.delete(roomId);
        playerSockets.delete(socket.id);
      }
    });

    socket.on('disconnect', () => {
      const roomId = playerSockets.get(socket.id);
      if (roomId) {
        const room = rooms.get(roomId);
        if (room && room.state.phase !== 'game_over') {
          room.state.winner = 'ai';
          room.state.phase = 'game_over';
          io.to(roomId).emit('game_state', {
            roomId: room.state.roomId,
            phase: room.state.phase,
            playerScore: room.state.playerScore,
            aiScore: room.state.aiScore,
            currentQuestion: null,
            winner: room.state.winner,
          });
        }
        rooms.delete(roomId);
        playerSockets.delete(socket.id);
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}
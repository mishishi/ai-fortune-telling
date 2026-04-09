import { Server, Socket } from 'socket.io';
import { generateQuestion, generateHint, generateExplanation } from '../services/questionService';
import { judgeAnswer } from '../services/judgeService';
import {
  GameState, GamePhase, Subject, Level,
  HandCard, GameMode,
  SUBJECT_CARDS, LEVEL_CARDS, SKILL_CARDS, EVENT_CARDS,
  WIN_SCORE_SIMPLE, WIN_SCORE_STANDARD
} from '../types/game';
import { getDb, saveDb } from '../db/sqlite';

interface Room {
  state: GameState;
  hand: HandCard[];           // 统一手牌数组（最多5张）
  deck: HandCard[];           // 牌堆
  discard: HandCard[];        // 弃牌堆
  usedSubjectLevels: Set<string>;
  winScore: number;
  // 技能卡每局使用次数记录
  skillUses: Record<string, number>;
  // 事件卡触发状态
  eventState: {
    combo: { answered: number; required: number } | null;
    coop: { aiAnswered: boolean; playerAnswered: boolean } | null;
    teaching: boolean;
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createMixedDeck(): HandCard[] {
  const deck: HandCard[] = [];

  // 8学科 × 4等级 = 32 张学科等级对
  for (const sub of SUBJECT_CARDS) {
    for (const lv of LEVEL_CARDS) {
      deck.push({ cardType: 'subject_level', subjectId: sub.id, levelId: lv.id });
    }
  }

  // 每种技能卡各2张
  for (const skill of SKILL_CARDS) {
    deck.push({ cardType: 'skill', skillId: skill.id });
    deck.push({ cardType: 'skill', skillId: skill.id });
  }

  // 每种事件卡各1张
  for (const event of EVENT_CARDS) {
    deck.push({ cardType: 'event', eventId: event.id });
  }

  return shuffle(deck);
}

function buildRoom(roomId: string, winScore: number, mode: GameMode): Room {
  const deck = createMixedDeck();
  const hand = deck.splice(0, 5);

  return {
    state: {
      roomId,
      phase: 'play_card',
      playerScore: 0,
      aiScore: 0,
      currentQuestion: null,
      usedSubjectLevels: [],
      winner: null,
      mode,
      activeSkillEffects: { double: false, noEnemySkill: false, swap: false },
      eventActive: null,
    },
    hand,
    deck,
    discard: [],
    usedSubjectLevels: new Set(),
    winScore,
    skillUses: {},
    eventState: { combo: null, coop: null, teaching: false },
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
    hand: room.hand,
    deckCount: room.deck.length,
    discardCount: room.discard.length,
    mode: room.state.mode,
    activeSkillEffects: room.state.activeSkillEffects,
    eventActive: room.state.eventActive,
  });
}

function replenishHand(room: Room) {
  while (room.hand.length < 5 && room.deck.length > 0) {
    const card = room.deck.shift()!;
    // 检查是否事件卡，事件卡自动触发（stub，Task 4 实现）
    if (card.cardType === 'event') {
      handleEventCard(room, card.eventId);
      room.discard.push(card);
    } else {
      room.hand.push(card);
    }
  }
  // 如果牌堆耗尽，重洗弃牌堆（非事件卡）
  if (room.deck.length === 0 && room.discard.length > 0) {
    const nonEventDiscard = room.discard.filter(c => c.cardType !== 'event');
    room.deck = shuffle(nonEventDiscard);
    room.discard = room.discard.filter(c => c.cardType === 'event');
  }
}

function checkWinCondition(room: Room) {
  if (room.state.playerScore >= room.winScore) {
    room.state.winner = 'player';
    room.state.phase = 'game_over';
  } else if (room.deck.length === 0 && room.hand.length === 0) {
    room.state.winner = room.state.playerScore > room.state.aiScore ? 'player' : 'ai';
    room.state.phase = 'game_over';
  }
}

function handleEventCard(room: Room, eventId: string) {
  const event = EVENT_CARDS.find(e => e.id === eventId);
  if (!event) return;

  room.state.eventActive = event.name;

  switch (event.name) {
    case '闪电快答':
      // 将当前题目时限强制设为10秒（如果正在答题）
      if (room.state.currentQuestion) {
        room.state.currentQuestion = {
          ...room.state.currentQuestion,
          timeLimit: 10
        };
      }
      break;

    case '双人合作':
      // 初始化合作状态
      room.eventState.coop = { aiAnswered: false, playerAnswered: false };
      break;

    case '知识连击':
      // 需要连续答对2题
      room.eventState.combo = { answered: 0, required: 2 };
      break;

    case '错题讲堂':
      // 标记为讲解模式
      room.eventState.teaching = true;
      break;
  }
}

export function setupGameHandlers(io: Server) {
  const rooms = new Map<string, Room>();
  const playerSockets = new Map<string, string>(); // socketId -> roomId

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('start_game', (data: { winScore?: number; mode?: GameMode }) => {
      const roomId = `room_${socket.id}_${Date.now()}`;
      const winScore = data.winScore ?? WIN_SCORE_SIMPLE;
      const mode = data.mode ?? 'pvp';
      const room = buildRoom(roomId, winScore, mode);
      rooms.set(roomId, room);
      playerSockets.set(socket.id, roomId);
      socket.join(roomId);
      sendState(io, room);
    });

    socket.on('play_cards', async (data: { cardIndex: number }) => {
      const roomId = playerSockets.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.state.phase !== 'play_card') {
        socket.emit('error', { message: '当前不是出牌阶段' });
        return;
      }

      const card = room.hand[data.cardIndex];
      if (!card || card.cardType !== 'subject_level') {
        socket.emit('error', { message: '请选择一张学科+难度组合卡' });
        return;
      }

      const { subjectId, levelId } = card;
      const subCard = SUBJECT_CARDS.find(c => c.id === subjectId);
      const lvCard = LEVEL_CARDS.find(c => c.id === levelId);
      if (!subCard || !lvCard) return;

      const subject = subCard.name as Subject;
      const level = lvCard.level as Level;
      const key = `${subject}__${level}`;

      // 防重复检查
      if (room.usedSubjectLevels.has(key)) {
        socket.emit('error', { message: '此学科+难度组合已在本题用过' });
        return;
      }

      // AI 出题
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
        return;
      }

      // Only mark as used if we're NOT swapping to a new question
      if (!room.state.activeSkillEffects.swap) {
        room.usedSubjectLevels.add(key);
      }

      // 从手牌移除
      room.hand.splice(data.cardIndex, 1);
      room.discard.push(card);

      // 补牌
      replenishHand(room);

      // 检查是否有换题卡效果
      if (room.state.activeSkillEffects.swap) {
        room.state.activeSkillEffects.swap = false;
        try {
          const newQ = await generateQuestion(subject, level,
            process.env.MINIMAX_API_KEY!,
            process.env.MINIMAX_BASE_URL!,
            process.env.MINIMAX_MODEL!
          );
          room.state.currentQuestion = newQ;
        } catch (e) {
          socket.emit('error', { message: '换题失败' });
          room.state.phase = 'play_card';
          sendState(io, room);
          return;
        }
      }

      room.state.phase = 'answering';
      sendState(io, room);
    });

    socket.on('submit_answer', async (data: { answer: string }) => {
      const roomId = playerSockets.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.state.phase !== 'answering') return;
      if (!room.state.currentQuestion) return;

      const q = room.state.currentQuestion;
      const isCorrect = judgeAnswer(data.answer, q.answer, q.subject);

      const points = room.state.activeSkillEffects.double ? 2 : 1;

      // 知识连击处理
      if (room.eventState.combo) {
        if (isCorrect) {
          room.eventState.combo.answered += 1;
          if (room.eventState.combo.answered >= room.eventState.combo.required) {
            // 连击完成，给分
            room.state.playerScore += points;
            room.eventState.combo = null;
          } else {
            // 第一题对了，等待第二题，不给分
          }
        } else {
          // 答错了，连击失败，不给分
          room.eventState.combo = null;
        }
        room.state.eventActive = null;
      }

      // 双人合作处理
      if (room.eventState.coop) {
        room.eventState.coop.playerAnswered = true;
        if (isCorrect) {
          room.state.playerScore += points;
        }
        // 等待AI答题（AI代答）
        if (!room.eventState.coop.aiAnswered) {
          // AI答题（简单模拟：50%正确率）
          const aiCorrect = Math.random() > 0.5;
          room.eventState.coop.aiAnswered = true;
          if (aiCorrect) {
            room.state.aiScore += 1;
          }
        }
        // 双方都答完了，清理状态
        if (room.eventState.coop.aiAnswered) {
          room.eventState.coop = null;
          room.state.eventActive = null;
        }
      }

      // 错题讲堂处理
      if (!isCorrect && room.eventState.teaching) {
        // 生成讲解
        const explanation = await generateExplanation(
          room.state.currentQuestion,
          process.env.MINIMAX_API_KEY!,
          process.env.MINIMAX_BASE_URL!,
          process.env.MINIMAX_MODEL!
        );
        socket.emit('explanation', { explanation });
        room.eventState.teaching = false;
        room.state.eventActive = null;
      }

      if (isCorrect && !room.eventState.combo) {
        room.state.playerScore += points;
      }
      // 清除双倍效果
      room.state.activeSkillEffects.double = false;

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

      room.state.currentQuestion = null;
      // 每回合开始时清理事件状态
      room.state.eventActive = null;
      checkWinCondition(room);
      const isGameOver = (room.state.phase as string) === 'game_over';
      if (!isGameOver) {
        room.state.phase = 'play_card';
      }
      sendState(io, room);

      // 游戏结束时记录对局
      if (isGameOver) {
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

    socket.on('request_hint', async () => {
      const roomId = playerSockets.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.state.phase !== 'answering') return;
      if (!room.state.currentQuestion) return;

      try {
        const hint = await generateHint(
          room.state.currentQuestion,
          process.env.MINIMAX_API_KEY!,
          process.env.MINIMAX_BASE_URL!,
          process.env.MINIMAX_MODEL!
        );
        socket.emit('hint_received', { hint });
      } catch (e) {
        socket.emit('error', { message: '获取提示失败' });
      }
    });

    socket.on('use_skill', (data: { cardIndex: number }) => {
      const roomId = playerSockets.get(socket.id);
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room || room.state.phase !== 'play_card') return;

      const card = room.hand[data.cardIndex];
      if (!card || card.cardType !== 'skill') {
        socket.emit('error', { message: '无效的技能卡' });
        return;
      }

      const skill = SKILL_CARDS.find(s => s.id === card.skillId);
      if (!skill) return;

      // 检查使用次数（每人每局最多2次）
      const currentUses = room.skillUses[skill.id] ?? 0;
      if (skill.maxUses > 0 && currentUses >= 2) {
        socket.emit('error', { message: `${skill.name}已达到使用上限` });
        return;
      }

      // 检查禁手效果
      if (room.state.activeSkillEffects.noEnemySkill) {
        socket.emit('error', { message: '本回合被禁手，无法使用技能' });
        return;
      }

      // 移除技能卡
      room.hand.splice(data.cardIndex, 1);
      room.discard.push(card);
      room.skillUses[skill.id] = (room.skillUses[skill.id] ?? 0) + 1;

      // 应用技能效果
      switch (skill.name) {
        case '双倍':
          room.state.activeSkillEffects.double = true;
          socket.emit('skill_activated', { skillName: skill.name, description: skill.description });
          break;
        case '禁手':
          room.state.activeSkillEffects.noEnemySkill = true;
          socket.emit('skill_activated', { skillName: skill.name, description: skill.description });
          break;
        case '先手':
          socket.emit('skill_activated', { skillName: skill.name, description: skill.description });
          break;
        case '跳过':
          // 直接结束回合
          replenishHand(room);
          checkWinCondition(room);
          const skipGameOver = (room.state.phase as string) === 'game_over';
          if (!skipGameOver) {
            room.state.phase = 'play_card';
          }
          sendState(io, room);
          return;
        case '求助':
        case '换题':
          // 在答题阶段处理（求助存标记，换题设置 swap 效果）
          if (skill.name === '换题') {
            room.state.activeSkillEffects.swap = true;
          }
          socket.emit('skill_activated', { skillName: skill.name, description: skill.description });
          break;
      }

      sendState(io, room);
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
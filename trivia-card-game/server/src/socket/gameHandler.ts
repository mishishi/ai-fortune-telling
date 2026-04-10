import { Server, Socket } from 'socket.io';
import { generateQuestion, generateQuestionStream, generateHint, generateExplanation } from '../services/questionService';
import { judgeAnswer } from '../services/judgeService';
import {
  GameState, GamePhase, Subject, Level, Question,
  HandCard, GameMode,
  SUBJECT_CARDS, LEVEL_CARDS, SKILL_CARDS, EVENT_CARDS,
  WIN_SCORE_SIMPLE, WIN_SCORE_STANDARD
} from '../types/game';
import { getDb, saveDb } from '../db/sqlite';

// ---------------------------------------------------------------------------
// 题库预取缓存 — 游戏开始时后台生成，保证出牌响应速度
// ---------------------------------------------------------------------------

/** 预取缓存：key = "学科__Lv等级" → 题目数组 */
const questionCache = new Map<string, Question[]>();

/** 每个 key 最多缓存几道题 */
const CACHE_MAX = 3;

/** 通用兜底题（选项经过充分打散，各学科通用） */
const FALLBACK_QUESTION: Question = {
  id: 'fallback',
  subject: '语文',
  level: 'Lv1',
  narrative: '知识闯关',
  question: '以下哪个是中国的首都？',
  options: ['A. 北京', 'B. 上海', 'C. 广州', 'D. 深圳'],
  answer: 'A',
  explanation: '北京是中华人民共和国的首都。',
  timeLimit: 15,
};

/**
 * 带超时的题目光生成（8秒超时，API 响应约 2s）
 */
function generateQuestionWithTimeout(
  subject: Subject,
  level: Level,
  apiKey: string,
  baseUrl: string,
  model: string,
  timeoutMs = 15000
): Promise<Question | null> {
  return new Promise((resolve) => {
    const tid = setTimeout(() => resolve(null), timeoutMs);
    generateQuestion(subject, level, apiKey, baseUrl, model)
      .then((q) => { clearTimeout(tid); resolve(q); })
      .catch(() => { clearTimeout(tid); resolve(null); });
  });
}

/**
 * 分批并行预取，限制并发数，避免 API 过载
 */
async function prefetchBatched(
  items: Array<{ subject: Subject; level: Level }>,
  apiKey: string,
  baseUrl: string,
  model: string,
  concurrency = 4,
  timeoutMs = 15000
): Promise<void> {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.allSettled(
      batch.map(({ subject, level }) =>
        generateQuestionWithTimeout(subject, level, apiKey, baseUrl, model, timeoutMs)
          .then((q) => {
            if (!q) return;
            const key = `${subject}__${level}`;
            const cached = questionCache.get(key) ?? [];
            if (cached.length < CACHE_MAX) {
              cached.push(q);
              questionCache.set(key, cached);
            }
          })
      )
    );
  }
}

/**
 * 游戏开始时批量预取所有 32 种学科+难度组合
 * 4并发，8秒超时，预计约 16 秒完成（8批×2秒）
 */
async function prefetchAll(apiKey: string, baseUrl: string, model: string): Promise<void> {
  const items: Array<{ subject: Subject; level: Level }> = [];
  for (const sub of SUBJECT_CARDS) {
    for (const lv of LEVEL_CARDS) {
      items.push({ subject: sub.name as Subject, level: lv.level as Level });
    }
  }
  await prefetchBatched(items, apiKey, baseUrl, model);
}

/**
 * 从缓存弹出一道题；缓存空时返回 null
 */
function popFromCache(subject: Subject, level: Level): Question | null {
  const key = `${subject}__${level}`;
  const cached = questionCache.get(key);
  if (!cached || cached.length === 0) return null;
  return cached.shift()!;
}

/**
 * 后台补充指定学科+难度的缓存
 */
async function refillCache(subject: Subject, level: Level): Promise<void> {
  const key = `${subject}__${level}`;
  const cached = questionCache.get(key) ?? [];
  if (cached.length >= CACHE_MAX) return;
  const q = await generateQuestionWithTimeout(
    subject, level,
    process.env.MINIMAX_API_KEY!,
    process.env.MINIMAX_BASE_URL!,
    process.env.MINIMAX_MODEL!
  );
  if (q && cached.length < CACHE_MAX) {
    cached.push(q);
    questionCache.set(key, cached);
  }
}

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
  // 挂起题：API慢时先用FALLBACK题响应，真实题目生成后替换
  pendingQuestion: { resolve: (q: Question) => void } | null;
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
      activeSkillEffects: { double: false, noEnemySkill: false, swap: false, hintAvailable: false },
      eventActive: null,
    },
    hand,
    deck,
    discard: [],
    usedSubjectLevels: new Set(),
    winScore,
    skillUses: {},
    eventState: { combo: null, coop: null, teaching: false },
    pendingQuestion: null,
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

      // 游戏开始时后台预取所有题库，1秒超时
      prefetchAll(
        process.env.MINIMAX_API_KEY!,
        process.env.MINIMAX_BASE_URL!,
        process.env.MINIMAX_MODEL!
      );
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

      if (room.usedSubjectLevels.has(key)) {
        socket.emit('error', { message: '此学科+难度组合已在本题用过' });
        return;
      }

      // 从缓存获取（同步路径，<1ms）
      const cachedQ = popFromCache(subject, level);

      if (cachedQ) {
        // --- 缓存命中：同步响应 ---
        room.hand.splice(data.cardIndex, 1);
        room.discard.push(card);
        replenishHand(room);
        room.usedSubjectLevels.add(key);
        room.state.currentQuestion = { ...cachedQ, narrative: `${subCard.name} · ${lvCard.level}` };
        room.state.phase = 'answering';
        sendState(io, room);
        refillCache(subject, level);
        return;
      }

      // --- 缓存未命中：流式生成，边推送思考过程边等待结果 ---
      room.hand.splice(data.cardIndex, 1);
      room.discard.push(card);
      replenishHand(room);
      room.usedSubjectLevels.add(key);

      if (room.state.activeSkillEffects.swap) {
        // 换题卡：直接 await（换题应快）
        room.state.activeSkillEffects.swap = false;
        const swapQ = await generateQuestionWithTimeout(
          subject, level,
          process.env.MINIMAX_API_KEY!,
          process.env.MINIMAX_BASE_URL!,
          process.env.MINIMAX_MODEL!,
          15000
        );
        room.state.currentQuestion = swapQ
          ? { ...swapQ, narrative: `${subCard.name} · ${lvCard.level}` }
          : { ...FALLBACK_QUESTION, subject, level, narrative: `${subCard.name} · ${lvCard.level}` };
        room.state.phase = 'answering';
        sendState(io, room);
        refillCache(subject, level);
        return;
      }

      // 发送思考中状态（保持 play_card 阶段，前端显示思考面板）
      // 立即发送，让前端立即显示"思考中..."（不等首批 chunk 到达）
      socket.emit('question_thinking', {
        narrative: `${subCard.name} · ${lvCard.level}`,
        chunk: '🤖 AI 正在思考中...\n\n',
      });

      let questionToUse: Question | null = null;
      try {
        questionToUse = await generateQuestionStream(
          subject, level,
          process.env.MINIMAX_API_KEY!,
          process.env.MINIMAX_BASE_URL!,
          process.env.MINIMAX_MODEL!,
          (chunk) => {
            // 每收到一块思考内容就推给前端
            socket.emit('question_thinking', { chunk, narrative: '' });
          }
        );
      } catch {
        questionToUse = null;
      }

      if (questionToUse) {
        room.state.currentQuestion = { ...questionToUse, narrative: `${subCard.name} · ${lvCard.level}` };
      } else {
        room.state.currentQuestion = {
          ...FALLBACK_QUESTION,
          subject,
          level,
          narrative: `${subCard.name} · ${lvCard.level}`,
        };
      }

      room.state.phase = 'answering';
      socket.emit('question_ready', { question: room.state.currentQuestion });
      sendState(io, room);
      refillCache(subject, level);
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
      let eventScored = false; // 标记事件是否已经给过分了

      // 知识连击处理
      if (room.eventState.combo) {
        if (isCorrect) {
          room.eventState.combo.answered += 1;
          if (room.eventState.combo.answered >= room.eventState.combo.required) {
            // 连击完成，给分
            room.state.playerScore += points;
            eventScored = true;
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
          eventScored = true;
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

      // 正常答对给分（如果事件没给过）
      if (isCorrect && !eventScored) {
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
      if (!room || room.state.phase !== 'play_card') {
        socket.emit('error', { message: '当前不是出牌阶段' });
        return;
      }

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
          // 直接结束回合，清除所有技能效果
          replenishHand(room);
          checkWinCondition(room);
          // 清除所有技能效果
          room.state.activeSkillEffects.double = false;
          room.state.activeSkillEffects.swap = false;
          room.state.activeSkillEffects.hintAvailable = false;
          const skipGameOver = (room.state.phase as string) === 'game_over';
          if (!skipGameOver) {
            room.state.phase = 'play_card';
          }
          sendState(io, room);
          return;
        case '求助':
          // 设置求助标记，允许请求提示
          room.state.activeSkillEffects.hintAvailable = true;
          socket.emit('skill_activated', { skillName: skill.name, description: skill.description });
          break;
        case '换题':
          // 设置换题效果
          room.state.activeSkillEffects.swap = true;
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
// ---------------------------------------------------------------------------
// 对话上下文管理：历史截断 + 低活跃用户自动清理
// ---------------------------------------------------------------------------

/** 单条对话消息 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** 玩家对话上下文 */
export interface PlayerContext {
  playerId: string;
  messages: ChatMessage[];
  lastActivity: number; // Date.now()
}

/** 最大历史消息条数（截断阈值） */
const MAX_HISTORY = 10;

/** 最大总 token 数（估算：超过则从头尾双向截断） */
const MAX_TOTAL_CHARS = 4000;

/** 低活跃阈值（毫秒）：超过此时间未活动则清除上下文 */
const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 分钟

// ---------------------------------------------------------------------------
// 内部状态
// ---------------------------------------------------------------------------

/** 所有玩家上下文 */
const playerContexts = new Map<string, PlayerContext>();

/** 定时清理 interval ID */
let cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

// ---------------------------------------------------------------------------
// 核心函数
// ---------------------------------------------------------------------------

/**
 * 获取或创建玩家的对话上下文
 */
export function getOrCreateContext(playerId: string): PlayerContext {
  const existing = playerContexts.get(playerId);
  if (existing) {
    existing.lastActivity = Date.now();
    return existing;
  }
  const ctx: PlayerContext = {
    playerId,
    messages: [],
    lastActivity: Date.now(),
  };
  playerContexts.set(playerId, ctx);
  return ctx;
}

/**
 * 向玩家上下文追加消息，并自动截断
 */
export function appendMessage(playerId: string, role: ChatMessage['role'], content: string): void {
  const ctx = getOrCreateContext(playerId);
  ctx.messages.push({ role, content });

  // 超过最大条数时，截断最旧的消息直到在限制内
  while (ctx.messages.length > MAX_HISTORY) {
    ctx.messages.shift();
  }

  // 超过总字符上限时，双向截断
  const totalChars = ctx.messages.reduce((sum, m) => sum + m.content.length, 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    truncateContext(ctx);
  }
}

/**
 * 获取玩家当前上下文消息数组
 */
export function getMessages(playerId: string): ChatMessage[] {
  const ctx = playerContexts.get(playerId);
  return ctx ? [...ctx.messages] : [];
}

/**
 * 手动清除指定玩家的上下文
 */
export function clearContext(playerId: string): void {
  playerContexts.delete(playerId);
}

/**
 * 双向截断：保留最新消息，逐步移除最旧消息直到总字符在限制内
 */
function truncateContext(ctx: PlayerContext): void {
  while (ctx.messages.length > 2 && calculateTotalChars(ctx) > MAX_TOTAL_CHARS) {
    // 从头部移除最旧的一条
    ctx.messages.shift();
  }
}

function calculateTotalChars(ctx: PlayerContext): number {
  return ctx.messages.reduce((sum, m) => sum + m.content.length, 0);
}

// ---------------------------------------------------------------------------
// 低活跃自动清理
// ---------------------------------------------------------------------------

/**
 * 启动低活跃用户上下文清理（定时任务）
 * 每分钟检查一次，清除超过 INACTIVE_THRESHOLD 未活动的玩家上下文
 */
export function startContextCleanup(): void {
  if (cleanupIntervalId !== null) return;

  cleanupIntervalId = setInterval(() => {
    const now = Date.now();
    let cleared = 0;
    for (const [playerId, ctx] of playerContexts) {
      if (now - ctx.lastActivity > INACTIVE_THRESHOLD) {
        playerContexts.delete(playerId);
        cleared++;
      }
    }
    if (cleared > 0) {
      console.log(`[Context] Cleared ${cleared} inactive player context(s)`);
    }
  }, 60 * 1000); // 每分钟检查
}

/**
 * 停止清理任务（测试用或服务器关闭时）
 */
export function stopContextCleanup(): void {
  if (cleanupIntervalId !== null) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
}

/**
 * 返回当前活跃上下文数量（可监控用）
 */
export function getActiveContextCount(): number {
  return playerContexts.size;
}

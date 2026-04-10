import { getDb, saveDb } from '../db/sqlite';
import { AsyncRoom, AsyncAnswer } from '../types/season';

const DEFAULT_TURN_HOURS = 48;

function rowToAsyncRoom(row: any[]): AsyncRoom {
  return {
    id: row[0] as string,
    playerId: row[1] as string,
    state: row[2] as AsyncRoom['state'],
    playerAnswers: JSON.parse(row[3] as string),
    aiAnswers: JSON.parse(row[4] as string),
    turnCount: row[5] as number,
    maxTurns: row[6] as number,
    playerScore: row[7] as number,
    aiScore: row[8] as number,
    winner: row[9] as AsyncRoom['winner'],
    expiresAt: new Date(row[10] as string),
    createdAt: new Date(row[11] as string),
  };
}

/**
 * 创建新的异步房间
 */
export function createAsyncRoom(playerId: string, maxTurns = 3): AsyncRoom {
  const db = getDb();
  const id = `async_${playerId}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + DEFAULT_TURN_HOURS * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO async_rooms (id, player_id, state, player_answers, ai_answers, turn_count, max_turns, player_score, ai_score, expires_at, created_at)
     VALUES (?, ?, 'waiting', '[]', '[]', 0, ?, 0, 0, ?, ?)`,
    [id, playerId, maxTurns, expiresAt, now]
  );
  saveDb();

  return {
    id,
    playerId,
    state: 'waiting',
    playerAnswers: [],
    aiAnswers: [],
    turnCount: 0,
    maxTurns,
    playerScore: 0,
    aiScore: 0,
    winner: null,
    expiresAt: new Date(expiresAt),
    createdAt: new Date(now),
  };
}

/**
 * 根据 ID 获取异步房间
 */
export function getAsyncRoom(roomId: string): AsyncRoom | null {
  const db = getDb();
  const result = db.exec(
    `SELECT id, player_id, state, player_answers, ai_answers, turn_count, max_turns, player_score, ai_score, winner, expires_at, created_at
     FROM async_rooms WHERE id = '${roomId.replace(/'/g, "''")}'`
  );
  if (result.length === 0 || result[0].values.length === 0) return null;
  return rowToAsyncRoom(result[0].values[0]);
}

/**
 * 根据 playerId 获取最新的异步房间
 */
export function getLatestAsyncRoom(playerId: string): AsyncRoom | null {
  const db = getDb();
  const safePlayerId = playerId.replace(/'/g, "''");
  const result = db.exec(
    `SELECT id, player_id, state, player_answers, ai_answers, turn_count, max_turns, player_score, ai_score, winner, expires_at, created_at
     FROM async_rooms WHERE player_id = '${safePlayerId}' ORDER BY created_at DESC LIMIT 1`
  );
  if (result.length === 0 || result[0].values.length === 0) return null;
  return rowToAsyncRoom(result[0].values[0]);
}

/**
 * 更新异步房间状态
 */
export function updateAsyncRoom(
  roomId: string,
  updates: Partial<Pick<AsyncRoom, 'state' | 'playerAnswers' | 'aiAnswers' | 'turnCount' | 'playerScore' | 'aiScore' | 'winner'>>
) {
  const db = getDb();
  const setClauses: string[] = [];
  const values: any[] = [];

  if (updates.state !== undefined) {
    setClauses.push('state = ?');
    values.push(updates.state);
  }
  if (updates.playerAnswers !== undefined) {
    setClauses.push('player_answers = ?');
    values.push(JSON.stringify(updates.playerAnswers));
  }
  if (updates.aiAnswers !== undefined) {
    setClauses.push('ai_answers = ?');
    values.push(JSON.stringify(updates.aiAnswers));
  }
  if (updates.turnCount !== undefined) {
    setClauses.push('turn_count = ?');
    values.push(updates.turnCount);
  }
  if (updates.playerScore !== undefined) {
    setClauses.push('player_score = ?');
    values.push(updates.playerScore);
  }
  if (updates.aiScore !== undefined) {
    setClauses.push('ai_score = ?');
    values.push(updates.aiScore);
  }
  if (updates.winner !== undefined) {
    setClauses.push('winner = ?');
    values.push(updates.winner);
  }

  if (setClauses.length === 0) return;

  values.push(roomId);
  db.run(`UPDATE async_rooms SET ${setClauses.join(', ')} WHERE id = ?`, values);
  saveDb();
}

/**
 * 重置异步房间到期时间
 */
export function refreshExpiresAt(roomId: string) {
  const db = getDb();
  const expiresAt = new Date(Date.now() + DEFAULT_TURN_HOURS * 60 * 60 * 1000).toISOString();
  db.run(`UPDATE async_rooms SET expires_at = ? WHERE id = ?`, [expiresAt, roomId]);
  saveDb();
}

/**
 * 将过期的异步房间标记为 expired
 */
export function expireOldRooms(): string[] {
  const db = getDb();
  const now = new Date().toISOString();
  const result = db.exec(
    `SELECT id FROM async_rooms WHERE state = 'playing' AND expires_at < '${now}'`
  );
  const expiredIds: string[] = [];
  if (result.length > 0) {
    for (const row of result[0].values) {
      const roomId = row[0] as string;
      db.run(`UPDATE async_rooms SET state = 'expired', winner = 'expired' WHERE id = ?`, [roomId]);
      expiredIds.push(roomId);
    }
    saveDb();
  }
  return expiredIds;
}

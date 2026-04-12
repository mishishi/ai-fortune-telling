import { getDb, saveDb } from './sqlite';
import { Season, PlayerSeasonStats, Tier, TIER_ORDER, BP_FREE_REWARDS } from '../types/season';

/**
 * 获取当前活跃赛季
 */
export function getActiveSeason(): Season | null {
  const db = getDb();
  const result = db.exec("SELECT id, name, start_at, end_at, is_active FROM seasons WHERE is_active = 1 LIMIT 1");
  if (result.length === 0 || result[0].values.length === 0) return null;
  const row = result[0].values[0];
  return {
    id: row[0] as number,
    name: row[1] as string,
    startAt: new Date(row[2] as string),
    endAt: new Date(row[3] as string),
    isActive: row[4] === 1,
  };
}

/**
 * 获取或创建玩家的赛季记录
 */
export function getOrCreatePlayerSeason(playerId: string, seasonId: number): PlayerSeasonStats {
  const db = getDb();
  const safePlayerId = playerId.replace(/'/g, "''");
  const existing = db.exec(
    `SELECT tier, xp, rank FROM player_tiers WHERE player_id = '${safePlayerId}' AND season_id = ${seasonId}`
  );
  if (existing.length > 0 && existing[0].values.length > 0) {
    const row = existing[0].values[0];
    return {
      playerId,
      seasonId,
      tier: row[0] as Tier,
      xp: row[1] as number,
      rank: row[2] as number,
      totalGames: 0,
      wins: 0,
    };
  }
  db.run(
    "INSERT INTO player_tiers (player_id, season_id, tier, xp, rank) VALUES (?, ?, 'bronze', 0, 0)",
    [playerId, seasonId]
  );
  saveDb();
  return { playerId, seasonId, tier: 'bronze', xp: 0, rank: 0, totalGames: 0, wins: 0 };
}

/**
 * 增加玩家 XP 并返回新的段位（自动晋升）
 */
export function addXpAndGetTier(playerId: string, seasonId: number, xpToAdd: number): { newXp: number; newTier: Tier; tierChanged: boolean } {
  const stats = getOrCreatePlayerSeason(playerId, seasonId);
  const oldTier = stats.tier;
  let newXp = stats.xp + xpToAdd;

  // 从高到低检查阈值
  let newTier: Tier = 'bronze';
  const thresholds = [0, 500, 1500, 3000, 5000];
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    if (newXp >= thresholds[i]) {
      newTier = TIER_ORDER[i];
      break;
    }
  }

  const db = getDb();
  db.run(
    "UPDATE player_tiers SET xp = ?, tier = ? WHERE player_id = ? AND season_id = ?",
    [newXp, newTier, playerId, seasonId]
  );
  saveDb();

  return {
    newXp,
    newTier,
    tierChanged: newTier !== oldTier,
  };
}

/**
 * 更新玩家排名（按 XP 降序）
 */
export function updatePlayerRank(seasonId: number): void {
  const db = getDb();
  // Use a subquery approach compatible with sql.js
  const allPlayers = db.exec(`SELECT player_id FROM player_tiers WHERE season_id = ${seasonId} ORDER BY xp DESC`);
  if (allPlayers.length === 0) return;
  const orderedIds = allPlayers[0].values.map(row => row[0] as string);
  orderedIds.forEach((pid, idx) => {
    const rank = idx + 1;
    db.run(`UPDATE player_tiers SET rank = ? WHERE player_id = ? AND season_id = ?`, [rank, pid, seasonId]);
  });
  saveDb();
}

/**
 * 获取赛季排行榜（top N）
 */
export function getLeaderboard(seasonId: number, limit = 20): PlayerSeasonStats[] {
  const db = getDb();
  const result = db.exec(`
    SELECT player_id, season_id, tier, xp, rank
    FROM player_tiers
    WHERE season_id = ${seasonId}
    ORDER BY rank ASC
    LIMIT ${limit}
  `);
  if (result.length === 0) return [];
  return result[0].values.map(row => ({
    playerId: row[0] as string,
    seasonId: row[1] as number,
    tier: row[2] as Tier,
    xp: row[3] as number,
    rank: row[4] as number,
    totalGames: 0,
    wins: 0,
  }));
}

/**
 * 获取玩家排名
 */
export function getPlayerRank(playerId: string, seasonId: number): number {
  const db = getDb();
  const safePlayerId = playerId.replace(/'/g, "''");
  const result = db.exec(
    `SELECT rank FROM player_tiers WHERE player_id = '${safePlayerId}' AND season_id = ${seasonId}`
  );
  if (result.length === 0 || result[0].values.length === 0) return 0;
  return result[0].values[0][0] as number;
}

/**
 * 获取或创建 Battle Pass 记录
 */
export function getOrCreateBattlePass(playerId: string, seasonId: number) {
  const db = getDb();
  const safePlayerId = playerId.replace(/'/g, "''");
  const existing = db.exec(
    `SELECT free_claimed, unlocked_tiers FROM battle_pass WHERE player_id = '${safePlayerId}' AND season_id = ${seasonId}`
  );
  if (existing.length > 0 && existing[0].values.length > 0) {
    const row = existing[0].values[0];
    return {
      freeClaimed: JSON.parse(row[0] as string) as string[],
      unlockedTiers: JSON.parse(row[1] as string) as string[],
    };
  }
  db.run(
    "INSERT INTO battle_pass (player_id, season_id, free_claimed, unlocked_tiers) VALUES (?, ?, '[]', '[]')",
    [playerId, seasonId]
  );
  saveDb();
  return { freeClaimed: [] as string[], unlockedTiers: [] as string[] };
}

/**
 * 解锁 Battle Pass 段位奖励（基于段位）
 */
export function unlockTierRewards(playerId: string, seasonId: number, tier: Tier): string[] {
  const bp = getOrCreateBattlePass(playerId, seasonId);
  const tierRewards = BP_FREE_REWARDS.filter(r => r.tier === tier);
  const newUnlocked = [...new Set([...bp.unlockedTiers, ...tierRewards.map(r => r.name)])];
  const db = getDb();
  db.run(
    "UPDATE battle_pass SET unlocked_tiers = ? WHERE player_id = ? AND season_id = ?",
    [JSON.stringify(newUnlocked), playerId, seasonId]
  );
  saveDb();
  return newUnlocked;
}

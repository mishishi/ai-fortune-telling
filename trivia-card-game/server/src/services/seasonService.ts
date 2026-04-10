import { Level } from '../types/game';
import { AsyncAnswer } from '../types/season';
import { addXpAndGetTier, updatePlayerRank, getActiveSeason, getOrCreatePlayerSeason, unlockTierRewards, getPlayerRank } from '../db/seasonDb';

const XP_BASE = 3;
const XP_LEVEL_BONUS: Record<Level, number> = { Lv1: 0, Lv2: 0, Lv3: 1, Lv4: 2 };
const XP_PERFECT_BONUS = 5;   // 本回合100%正确率
const XP_SPEED_BONUS = 3;      // 用时 < 50% 时限

/**
 * 计算本回合总 XP
 * - 每答对1题基础 +3 XP
 * - Lv4 +2，Lv3 +1
 * - 本回合100%正确率额外 +5
 * - 用时 < 50% 时限额外 +3
 */
export function calculateTurnXp(
  answers: Array<{ correct: boolean; level: Level; timeUsed?: number; timeLimit?: number }>
): { totalXp: number; perQuestion: number[] } {
  if (answers.length === 0) return { totalXp: 0, perQuestion: [] };

  const correctCount = answers.filter(a => a.correct).length;
  const isPerfect = correctCount === answers.length;

  const perQuestion = answers.map(a => {
    if (!a.correct) return 0;
    let xp = XP_BASE + XP_LEVEL_BONUS[a.level];
    if (isPerfect) xp += XP_PERFECT_BONUS;
    if (a.timeUsed !== undefined && a.timeLimit !== undefined && a.timeUsed < a.timeLimit * 0.5) {
      xp += XP_SPEED_BONUS;
    }
    return xp;
  });

  const totalXp = perQuestion.reduce((sum, x) => sum + x, 0);
  return { totalXp, perQuestion };
}

/**
 * 处理玩家回合结束：计算 XP，更新段位，解锁 BP 奖励
 */
export function processTurnEnd(
  playerId: string,
  answers: AsyncAnswer[],
  playerWon: boolean
): { xpEarned: number; totalXp: number; newTier: string; tierChanged: boolean; newRewards: string[] } {
  const season = getActiveSeason();
  if (!season) {
    return { xpEarned: 0, totalXp: 0, newTier: 'bronze', tierChanged: false, newRewards: [] };
  }

  const { totalXp } = calculateTurnXp(
    answers.map((a) => ({
      correct: a.correct,
      level: a.level as Level,
    }))
  );

  if (totalXp === 0) {
    return { xpEarned: 0, totalXp: 0, newTier: 'bronze', tierChanged: false, newRewards: [] };
  }

  const { newXp, newTier, tierChanged } = addXpAndGetTier(playerId, season.id, totalXp);
  updatePlayerRank(season.id);

  let newRewards: string[] = [];
  if (tierChanged) {
    newRewards = unlockTierRewards(playerId, season.id, newTier as any);
  }

  return {
    xpEarned: totalXp,
    totalXp: newXp,
    newTier,
    tierChanged,
    newRewards,
  };
}

/**
 * 获取玩家当前赛季完整状态
 */
export function getPlayerSeasonState(playerId: string) {
  const season = getActiveSeason();
  if (!season) return null;
  const stats = getOrCreatePlayerSeason(playerId, season.id);
  const rank = getPlayerRank(playerId, season.id);
  return { season, stats: { ...stats, rank } };
}

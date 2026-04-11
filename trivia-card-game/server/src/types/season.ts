export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export const TIER_ORDER: Tier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

export const TIER_THRESHOLDS: Record<Tier, number> = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 3000,
  diamond: 5000,
};

export interface Season {
  id: number;
  name: string;
  startAt: Date;
  endAt: Date;
  isActive: boolean;
}

export interface PlayerSeasonStats {
  playerId: string;
  seasonId: number;
  tier: Tier;
  xp: number;
  rank: number;
  totalGames: number;
  wins: number;
}

export interface AsyncAnswer {
  subject: string;
  level: string;
  questionId: string;
  answer: string;
  correct: boolean;
  xpEarned: number;
  // AI 专用字段
  aiAnswer: string;       // AI 选择的答案字母 A/B/C/D
  aiQuestion: string;      // AI 的题目文本
  aiOptions: string[];   // AI 题目的选项
  aiCorrectAnswer?: string; // AI 题目的正确答案（用于显示）
}

export interface AsyncRoom {
  id: string;
  playerId: string;
  state: 'waiting' | 'playing' | 'completed' | 'expired';
  playerAnswers: AsyncAnswer[];
  aiAnswers: AsyncAnswer[];
  turnCount: number;
  maxTurns: number;
  playerScore: number;
  aiScore: number;
  winner: 'player' | 'ai' | 'expired' | null;
  expiresAt: Date;
  createdAt: Date;
}

export const BP_FREE_REWARDS = [
  { tier: 'bronze' as Tier, type: 'card_back', name: 'S1 青铜卡背' },
  { tier: 'silver' as Tier, type: 'card_back', name: 'S1 白银卡背' },
  { tier: 'gold' as Tier, type: 'title', name: 'S1 黄金称号: 黄金黑客' },
  { tier: 'platinum' as Tier, type: 'card_back', name: 'S1 铂金卡背' },
  { tier: 'diamond' as Tier, type: 'title', name: 'S1 钻石称号: 钻石骑士' },
];

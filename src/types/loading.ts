// Shared loading stage types
export type LoadingStage = 'bazi' | 'ai' | 'report';

// AI analysis sub-stages for detailed progress hints
export type AIProgressStep =
  | 'analyzing'
  | 'career'
  | 'love'
  | 'wealth'
  | 'health'
  | 'mentor'
  | 'fortune'
  | 'yearly';

// AI progress hints displayed to user
export const AI_PROGRESS_HINTS: Record<AIProgressStep, string> = {
  analyzing: '解读命盘...',
  career: '分析事业运势...',
  love: '解析感情姻缘...',
  wealth: '推算财富走向...',
  health: '评估健康运势...',
  mentor: '寻找贵人方位...',
  fortune: '解读大运走势...',
  yearly: '分析流年吉凶...',
};

// Progress values at which each stage's animation completes
// These represent the overall progress percentage when the stage-specific animation finishes
export const STAGE_COMPLETE_PROGRESS: Record<LoadingStage, number> = {
  bazi: 50,
  ai: 70,
  report: 85,
};

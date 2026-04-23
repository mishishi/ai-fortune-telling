// Shared loading stage types
export type LoadingStage = 'bazi' | 'ai' | 'report';

// Progress values at which each stage's animation completes
// These represent the overall progress percentage when the stage-specific animation finishes
export const STAGE_COMPLETE_PROGRESS: Record<LoadingStage, number> = {
  bazi: 50,
  ai: 70,
  report: 85,
};

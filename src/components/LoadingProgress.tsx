'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { LoadingStage, AIProgressStep } from '@/types/loading';
import { AI_PROGRESS_HINTS } from '@/types/loading';

interface LoadingProgressProps {
  stage: LoadingStage;
  progress: number; // 0-100, represents overall progress
  aiHint?: AIProgressStep; // AI analysis sub-stage hint
  startTime?: number; // Loading start timestamp
  completedDimensions?: number; // Number of AI dimensions completed (0-5)
}

// Easing function for smooth progress interpolation
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

// Stage configuration with fixed percentages and colors
const STAGE_CONFIG = {
  bazi: {
    label: '八字计算',
    fixedPercent: 40,
    color: 'var(--color-loading-wood)',
    bgColor: 'rgba(74, 222, 128, 0.15)',
    ringColor: 'rgba(74, 222, 128, 0.4)',
    estimatedDuration: 2000, // 2 seconds typical
  },
  ai: {
    label: 'AI分析',
    fixedPercent: 60,
    color: 'var(--color-loading-fire)',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    ringColor: 'rgba(239, 68, 68, 0.4)',
    estimatedDuration: 15000, // 15 seconds typical for all 5 dimensions
  },
  report: {
    label: '报告生成',
    fixedPercent: 100,
    color: 'var(--color-loading-earth)',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    ringColor: 'rgba(234, 179, 8, 0.4)',
    estimatedDuration: 3000, // 3 seconds typical
  },
};

// Format seconds to Chinese style display
function formatRemainingTime(seconds: number): string {
  if (seconds < 5) return '即将完成';
  if (seconds < 60) return `约${Math.ceil(seconds)}秒`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.ceil(seconds % 60);
  if (minutes < 10) return `约${minutes}分${remainingSeconds}秒`;
  return `约${minutes}分钟`;
}

export default function LoadingProgress({ stage, progress, aiHint, startTime, completedDimensions = 0 }: LoadingProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [prevStage, setPrevStage] = useState(stage);
  const [stageTransitioning, setStageTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const progressRef = useRef({ from: 0, to: 0, startTime: 0 });

  // Track stage transitions for flash effect
  useEffect(() => {
    if (stage !== prevStage) {
      setStageTransitioning(true);
      setPrevStage(stage);
      const timer = setTimeout(() => setStageTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
  }, [stage, prevStage]);

  // Animate progress value with easing
  useEffect(() => {
    const targetProgress = progress;
    progressRef.current = {
      from: displayProgress,
      to: targetProgress,
      startTime: Date.now(),
    };

    const duration = 600; // Animation duration in ms

    const animate = () => {
      const elapsed = Date.now() - progressRef.current.startTime;
      const t = Math.min(elapsed / duration, 1);
      const easedT = easeOutQuart(t);
      const current = progressRef.current.from + (progressRef.current.to - progressRef.current.from) * easedT;

      setAnimatedProgress(Math.round(current));

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [progress]);

  // Update displayProgress from animatedProgress for width transition
  useEffect(() => {
    setDisplayProgress(animatedProgress);
  }, [animatedProgress]);

  // Track elapsed time
  useEffect(() => {
    if (!startTime) return;

    // Update elapsed time every 100ms
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedSeconds(elapsed);
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startTime]);

  // Calculate estimated remaining time
  const getEstimatedRemaining = (): string => {
    if (!startTime) return '';

    const config = STAGE_CONFIG[stage];
    const elapsed = elapsedSeconds;

    if (stage === 'bazi') {
      // BaZi stage: usually very fast, estimate based on typical duration
      const typicalDuration = config.estimatedDuration / 1000;
      const remaining = Math.max(0, typicalDuration - elapsed);
      return remaining < 1 ? '即将完成' : formatRemainingTime(remaining);
    }

    if (stage === 'ai') {
      // AI stage: estimate based on completed dimensions
      const totalDimensions = 5;
      const completed = completedDimensions;

      if (completed === 0) {
        // No dimensions done yet, use overall elapsed
        if (elapsed > 3) {
          // If already taking longer than expected, estimate based on typical
          const typicalPerDimension = config.estimatedDuration / 1000 / totalDimensions;
          const remaining = typicalPerDimension * totalDimensions;
          return formatRemainingTime(remaining);
        }
        return '分析中...';
      }

      // Calculate based on average time per completed dimension
      const avgTimePerDimension = elapsed / completed;
      const remainingDimensions = totalDimensions - completed;
      const estimatedRemaining = avgTimePerDimension * remainingDimensions;

      // Add buffer
      const bufferedEstimate = estimatedRemaining * 1.2;

      return formatRemainingTime(bufferedEstimate);
    }

    if (stage === 'report') {
      // Report stage: usually fast
      const remaining = Math.max(0, 3 - elapsed);
      return remaining < 1 ? '即将完成' : formatRemainingTime(remaining);
    }

    return '';
  };

  const estimatedRemaining = getEstimatedRemaining();

  const config = STAGE_CONFIG[stage];

  // Calculate overall progress based on stage - returns 0-100
  const getOverallProgress = (p: number) => {
    switch (stage) {
      case 'bazi':
        return Math.round((p / 100) * 40);
      case 'ai':
        return 40 + Math.round((p / 100) * 20);
      case 'report':
        return 70 + Math.round((p / 100) * 30);
      default:
        return 0;
    }
  };

  // Use animated progress for smooth display
  const overallProgress = getOverallProgress(progress);
  const showAiHint = stage === 'ai' && aiHint;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stage Label with flash effect on transition */}
      <div
        className="px-4 py-2 rounded-full text-sm font-medium"
        style={{
          background: stageTransitioning
            ? `linear-gradient(90deg, ${config.bgColor}, rgba(255,255,255,0.3), ${config.bgColor})`
            : config.bgColor,
          color: config.color,
          boxShadow: `0 0 12px ${config.ringColor}`,
          border: `1px solid ${config.ringColor}`,
          backgroundSize: stageTransitioning ? '200% 100%' : '100% 100%',
          animation: stageTransitioning ? 'stageFlash 0.3s ease-out' : 'none',
          transition: 'background 0.4s ease, color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        }}
      >
        {config.label}
      </div>

      {/* AI Progress Hint */}
      {showAiHint && (
        <div
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 animate-pulse"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--color-loading-fire)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {AI_PROGRESS_HINTS[aiHint]}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="w-64 relative">
        {/* Background track */}
        <div
          className="w-full rounded-full overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            height: '6px',
          }}
        >
          {/* Progress fill - uses displayProgress for smooth animation */}
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${displayProgress}%`,
              background: `linear-gradient(90deg, var(--color-primary), ${config.color})`,
              transition: 'width 0.3s ease-out, background 0.5s ease-out',
            }}
          >
            {/* Shimmer effect */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                animation: 'shimmer 1.5s linear infinite',
              }}
            />
          </div>
        </div>
      </div>

      {/* Percentage Display with Estimated Time - uses animatedProgress */}
      <div className="text-center">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{
            color: config.color,
            textShadow: `0 0 20px ${config.ringColor}`,
            transition: 'color 0.4s ease, text-shadow 0.4s ease',
          }}
        >
          {animatedProgress}
        </span>
        <span className="text-lg" style={{ color: 'var(--color-text-muted)' }}>%</span>
        {estimatedRemaining && (
          <div
            className="text-xs mt-1 transition-all duration-300"
            style={{ color: 'var(--color-text-muted)' }}
          >
            预计还需 {estimatedRemaining}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes stageFlash {
          0% { filter: brightness(1); }
          50% { filter: brightness(1.5); }
          100% { filter: brightness(1); }
        }
      `}</style>
    </div>
  );
}
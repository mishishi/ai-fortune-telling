'use client';

import { useEffect, useState } from 'react';
import type { LoadingStage } from '@/types/loading';

interface LoadingProgressProps {
  stage: LoadingStage;
  progress: number; // 0-100, represents overall progress
}

// Stage configuration with fixed percentages and colors
const STAGE_CONFIG = {
  bazi: {
    label: '八字计算',
    fixedPercent: 40,
    color: 'var(--color-loading-wood)',
    bgColor: 'rgba(74, 222, 128, 0.15)',
    ringColor: 'rgba(74, 222, 128, 0.4)',
  },
  ai: {
    label: 'AI分析',
    fixedPercent: 60,
    color: 'var(--color-loading-fire)',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    ringColor: 'rgba(239, 68, 68, 0.4)',
  },
  report: {
    label: '报告生成',
    fixedPercent: 100,
    color: 'var(--color-loading-earth)',
    bgColor: 'rgba(234, 179, 8, 0.15)',
    ringColor: 'rgba(234, 179, 8, 0.4)',
  },
};

export default function LoadingProgress({ stage, progress }: LoadingProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Animate progress value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const config = STAGE_CONFIG[stage];

  // Calculate overall progress based on stage
  const getOverallProgress = () => {
    switch (stage) {
      case 'bazi':
        return Math.round((progress / 100) * 40);
      case 'ai':
        return 40 + Math.round((progress / 100) * 20);
      case 'report':
        return 70 + Math.round((progress / 100) * 30);
      default:
        return 0;
    }
  };

  const overallProgress = getOverallProgress();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stage Label */}
      <div
        className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
        style={{
          background: config.bgColor,
          color: config.color,
          boxShadow: `0 0 12px ${config.ringColor}`,
          border: `1px solid ${config.ringColor}`,
        }}
      >
        {config.label}
      </div>

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
          {/* Progress fill */}
          <div
            className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{
              width: `${overallProgress}%`,
              background: `linear-gradient(90deg, var(--color-primary), ${config.color})`,
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

      {/* Percentage Display */}
      <div className="text-center">
        <span
          className="text-2xl font-bold tabular-nums"
          style={{
            color: config.color,
            textShadow: `0 0 20px ${config.ringColor}`,
          }}
        >
          {overallProgress}
        </span>
        <span className="text-lg" style={{ color: 'var(--color-text-muted)' }}>%</span>
      </div>
    </div>
  );
}
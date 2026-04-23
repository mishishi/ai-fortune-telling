'use client';

import { useState, useEffect } from 'react';
import type { LoadingStage } from '@/types/loading';

// Destiny Ring animation durations
const ANIMATION_DURATIONS = {
  outerRing: '3s',
  middleRing: '2s',
  innerRing: '1.5s',
} as const;

interface DestinyRingsProps {
  stage: LoadingStage;
  size?: number;
}

// Stage colors for the glow effect
const STAGE_COLORS = {
  bazi: {
    glow: 'rgba(74, 222, 128, 0.3)',
    shadow: 'rgba(74, 222, 128, 0.3)',
  },
  ai: {
    glow: 'rgba(239, 68, 68, 0.3)',
    shadow: 'rgba(239, 68, 68, 0.3)',
  },
  report: {
    glow: 'rgba(234, 179, 8, 0.3)',
    shadow: 'rgba(234, 179, 8, 0.3)',
  },
  idle: {
    glow: 'rgba(196, 30, 58, 0.3)',
    shadow: 'rgba(196, 30, 58, 0.3)',
  },
};

export default function DestinyRings({ stage, size = 160 }: DestinyRingsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: size, height: size }} />;
  }

  const colors = STAGE_COLORS[stage];

  return (
    <div className="relative mx-auto mb-10" style={{ width: size, height: size }}>
      {/* Radial Glow behind ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          animation: 'glow-pulse 2s ease-in-out infinite',
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          boxShadow: `0 0 24px ${colors.shadow}`,
        }}
      />

      {/* Outer Ring - Clockwise */}
      <div
        className="absolute inset-0 rounded-full border-2 destiny-ring-outer"
        style={{
          animation: `destiny-spin ${ANIMATION_DURATIONS.outerRing} linear infinite`,
          borderColor: 'rgba(196, 30, 58, 0.4)',
        }}
      />

      {/* Middle Ring - Counter-clockwise */}
      <div
        className="absolute rounded-full border-2 destiny-ring-middle"
        style={{
          animation: `destiny-spin ${ANIMATION_DURATIONS.middleRing} linear infinite reverse`,
          borderColor: 'rgba(212, 175, 55, 0.5)',
          top: '12.5%',
          left: '12.5%',
          right: '12.5%',
          bottom: '12.5%',
        }}
      />

      {/* Inner Ring - Pulse */}
      <div
        className="absolute rounded-full border destiny-ring-inner"
        style={{
          animation: `destiny-pulse ${ANIMATION_DURATIONS.innerRing} ease-in-out infinite`,
          borderColor: 'rgba(240, 198, 116, 0.4)',
          background: 'radial-gradient(circle, rgba(196, 30, 58, 0.1) 0%, transparent 70%)',
          top: '25%',
          left: '25%',
          right: '25%',
          bottom: '25%',
        }}
      />

      {/* Center ☯ Symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-4xl"
          style={{
            animation: 'destiny-pulse 1.5s ease-in-out infinite',
            textShadow: '0 0 20px rgba(196, 30, 58, 0.8)',
          }}
        >
          ☯
        </span>
      </div>
    </div>
  );
}
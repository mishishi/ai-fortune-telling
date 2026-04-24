'use client';

import { useState, useEffect } from 'react';
import type { LoadingStage } from '@/types/loading';

// Base Destiny Ring animation durations
const BASE_DURATIONS = {
  outerRing: 3000,
  middleRing: 2000,
  innerRing: 1500,
} as const;

interface DestinyRingsProps {
  stage: LoadingStage;
  size?: number;
  progress?: number; // 0-100, increases urgency as it grows
}

// Stage colors for the glow effect and rings
const STAGE_COLORS = {
  bazi: {
    glow: 'rgba(74, 222, 128, 0.4)',
    shadow: 'rgba(74, 222, 128, 0.5)',
    outer: 'rgba(74, 222, 128, 0.6)',
    middle: 'rgba(74, 222, 128, 0.5)',
    inner: 'rgba(74, 222, 128, 0.4)',
    symbol: 'rgba(74, 222, 128, 0.9)',
  },
  ai: {
    glow: 'rgba(239, 68, 68, 0.4)',
    shadow: 'rgba(239, 68, 68, 0.5)',
    outer: 'rgba(239, 68, 68, 0.6)',
    middle: 'rgba(239, 68, 68, 0.5)',
    inner: 'rgba(239, 68, 68, 0.4)',
    symbol: 'rgba(239, 68, 68, 0.9)',
  },
  report: {
    glow: 'rgba(234, 179, 8, 0.4)',
    shadow: 'rgba(234, 179, 8, 0.5)',
    outer: 'rgba(234, 179, 8, 0.6)',
    middle: 'rgba(234, 179, 8, 0.5)',
    inner: 'rgba(234, 179, 8, 0.4)',
    symbol: 'rgba(234, 179, 8, 0.9)',
  },
  idle: {
    glow: 'rgba(196, 30, 58, 0.4)',
    shadow: 'rgba(196, 30, 58, 0.5)',
    outer: 'rgba(196, 30, 58, 0.6)',
    middle: 'rgba(196, 30, 58, 0.5)',
    inner: 'rgba(196, 30, 58, 0.4)',
    symbol: 'rgba(196, 30, 58, 0.9)',
  },
};

export default function DestinyRings({ stage, size = 160, progress = 0 }: DestinyRingsProps) {
  const [mounted, setMounted] = useState(false);
  const [prevStage, setPrevStage] = useState(stage);
  const [currentColors, setCurrentColors] = useState(STAGE_COLORS[stage]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth color transitions when stage changes
  useEffect(() => {
    if (stage !== prevStage) {
      // Quick fade out then fade in for color transition
      const timer = setTimeout(() => {
        setCurrentColors(STAGE_COLORS[stage]);
        setPrevStage(stage);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [stage, prevStage]);

  if (!mounted) {
    return <div style={{ width: size, height: size }} />;
  }

  // Speed up as progress increases (urgency effect)
  // Progress 0-100 maps to duration multiplier 1.0 -> 0.5 (faster as we progress)
  const speedMultiplier = Math.max(0.5, 1 - (progress / 100) * 0.5);

  const durations = {
    outerRing: `${BASE_DURATIONS.outerRing * speedMultiplier}ms`,
    middleRing: `${BASE_DURATIONS.middleRing * speedMultiplier}ms`,
    innerRing: `${BASE_DURATIONS.innerRing * speedMultiplier}ms`,
  };

  return (
    <div className="relative mx-auto mb-10" style={{ width: size, height: size }}>
      {/* Radial Glow behind ring */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-300"
        style={{
          animation: 'glow-pulse 2s ease-in-out infinite',
          background: `radial-gradient(circle, ${currentColors.glow} 0%, transparent 70%)`,
          boxShadow: `0 0 24px ${currentColors.shadow}`,
        }}
      />

      {/* Outer Ring - Clockwise */}
      <div
        className="absolute inset-0 rounded-full border-2 destiny-ring-outer transition-all duration-300"
        style={{
          animation: `destiny-spin ${durations.outerRing} linear infinite`,
          borderColor: currentColors.outer,
        }}
      />

      {/* Middle Ring - Counter-clockwise */}
      <div
        className="absolute rounded-full border-2 destiny-ring-middle transition-all duration-300"
        style={{
          animation: `destiny-spin ${durations.middleRing} linear infinite reverse`,
          borderColor: currentColors.middle,
          top: '12.5%',
          left: '12.5%',
          right: '12.5%',
          bottom: '12.5%',
        }}
      />

      {/* Inner Ring - Pulse */}
      <div
        className="absolute rounded-full border destiny-ring-inner transition-all duration-300"
        style={{
          animation: `destiny-pulse ${durations.innerRing} ease-in-out infinite`,
          borderColor: currentColors.inner,
          background: `radial-gradient(circle, ${currentColors.glow.replace('0.4', '0.15')} 0%, transparent 70%)`,
          top: '25%',
          left: '25%',
          right: '25%',
          bottom: '25%',
        }}
      />

      {/* Center ☯ Symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-4xl transition-all duration-300"
          style={{
            animation: 'destiny-pulse 1.5s ease-in-out infinite',
            textShadow: `0 0 20px ${currentColors.symbol}`,
          }}
        >
          ☯
        </span>
      </div>
    </div>
  );
}
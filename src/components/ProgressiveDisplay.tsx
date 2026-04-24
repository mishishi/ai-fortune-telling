'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';
import WuXingCompass from './WuXingCompass';
import RadarChart from './RadarChart';
import type { AIProgressStep } from '@/types/loading';

interface ProgressiveDisplayProps {
  partialScores: Record<string, number>;
  partialAnalysis: Record<string, any>;
  currentHint: AIProgressStep;
  completedDimensions: string[];
}

const DIMENSION_LABELS: Record<string, string> = {
  career: '事业',
  love: '感情',
  wealth: '财运',
  health: '健康',
  mentor: '贵人',
  overview: '总览',
};

const DIMENSION_COLORS: Record<string, string> = {
  career: '#e74c3c',
  love: '#e91e63',
  wealth: '#f1c40f',
  health: '#2ecc71',
  mentor: '#3498db',
  overview: '#9b59b6',
};

const DIMENSION_HINTS: Record<string, string> = {
  career: '正在分析你的事业格局...',
  love: '正在测算你的情感姻缘...',
  wealth: '正在推演你的财富流向...',
  health: '正在审视你的健康运势...',
  mentor: '正在寻觅你的命中贵人...',
};

export default memo(function ProgressiveDisplay({
  partialScores,
  partialAnalysis,
  currentHint,
  completedDimensions,
}: ProgressiveDisplayProps) {
  // Track newly completed dimensions for explosion animation
  const [explodingDimensions, setExplodingDimensions] = useState<Set<string>>(new Set());
  const prevCompletedRef = useRef<string[]>([]);

  // Detect new completions and trigger explosion
  useEffect(() => {
    const prev = prevCompletedRef.current;
    const newCompleted = completedDimensions.filter(d => d !== 'overview' && !prev.includes(d));

    if (newCompleted.length > 0) {
      // Add to exploding set
      setExplodingDimensions(prev => new Set([...prev, ...newCompleted]));

      // Remove after animation completes (600ms)
      setTimeout(() => {
        setExplodingDimensions(prev => {
          const next = new Set(prev);
          newCompleted.forEach(d => next.delete(d));
          return next;
        });
      }, 600);
    }

    prevCompletedRef.current = completedDimensions;
  }, [completedDimensions]);

  // Filter out 'overview' from display dimensions (memoized)
  const displayDimensions = useMemo(
    () => completedDimensions.filter(d => d !== 'overview'),
    [completedDimensions]
  );

  // Memoize particle generation for explosions (stable per key)
  const explosionParticles = useMemo(() => {
    const particlesByKey: Record<string, Array<{ angle: number; distance: number; size: number }>> = {};
    explodingDimensions.forEach(key => {
      const particles = Array.from({ length: 8 }, (_, i) => ({
        angle: (i / 8) * 360,
        distance: 60 + Math.random() * 40,
        size: 4 + Math.random() * 4,
      }));
      particlesByKey[key] = particles;
    });
    return particlesByKey;
  }, [explodingDimensions]);

  // Determine which dimension is currently being analyzed
  const currentDimensionMap: Partial<Record<AIProgressStep, string>> = {
    analyzing: '',
    career: 'career',
    love: 'love',
    wealth: 'wealth',
    health: 'health',
    mentor: 'mentor',
  };
  const currentDimension = currentDimensionMap[currentHint] || '';

  // Get hint text for current dimension
  const hintText = currentHint && currentHint !== 'analyzing'
    ? DIMENSION_HINTS[currentHint] || `正在解读${DIMENSION_LABELS[currentHint]}...`
    : null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Top: WuXing Compass + Radar Chart overlay */}
      <div className="relative" style={{ width: 200, height: 200 }}>
        {/* Radar Chart as background (smaller) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <RadarChart
            scores={partialScores}
            size={160}
            animated={true}
            color="rgba(212, 175, 55, 0.4)"
          />
        </div>

        {/* Compass on top */}
        <div className="absolute inset-0 flex items-center justify-center">
          <WuXingCompass
            currentDimension={currentDimension}
            completedDimensions={displayDimensions}
            size={200}
          />
        </div>

        {/* Explosion effects */}
        {Array.from(explodingDimensions).map(key => {
          const color = DIMENSION_COLORS[key] || '#d4af37';
          const particles = explosionParticles[key] || [];

          return (
            <div
              key={key}
              className="absolute inset-0 pointer-events-none"
              style={{
                animation: 'dimensionExplode 0.6s ease-out forwards',
              }}
            >
              {/* Main explosion ring */}
              <div
                className="absolute rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  width: 160,
                  height: 160,
                  marginTop: -80,
                  marginLeft: -80,
                  border: `3px solid ${color}`,
                  boxShadow: `0 0 20px ${color}, inset 0 0 20px ${color}44`,
                  animation: 'explosionRing 0.6s ease-out forwards',
                }}
              />
              {/* Particle scattering */}
              {particles.map((p, i) => (
                <div
                  key={`particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: p.size,
                    height: p.size,
                    marginTop: -p.size / 2,
                    marginLeft: -p.size / 2,
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                    animation: `particleScatter 0.6s ease-out forwards`,
                    animationDelay: `${i * 20}ms`,
                    // Inline keyframes for particle movement
                    ['--angle' as string]: `${p.angle}deg`,
                    ['--distance' as string]: `${p.distance}px`,
                  }}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Bottom: Completed dimensions with preview */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-center mb-3" style={{ color: 'var(--color-accent, #d4af37)' }}>
          实时解析进度
        </p>

        {/* Latest preview - most recently completed dimension */}
        {displayDimensions.length > 0 && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-center"
            style={{
              background: `linear-gradient(135deg, ${DIMENSION_COLORS[displayDimensions[displayDimensions.length - 1]]}22, rgba(26,21,37,0.8))`,
              border: `1px solid ${DIMENSION_COLORS[displayDimensions[displayDimensions.length - 1]]}44`,
              animation: 'fadeInUp 0.4s ease-out',
            }}
          >
            <p className="text-xs mb-1" style={{ color: DIMENSION_COLORS[displayDimensions[displayDimensions.length - 1]] }}>
              {DIMENSION_LABELS[displayDimensions[displayDimensions.length - 1]]}
            </p>
            <p className="text-white text-sm font-medium leading-relaxed">
              {partialAnalysis[displayDimensions[displayDimensions.length - 1]]?.[displayDimensions[displayDimensions.length - 1]]?.slice(0, 30) || '解读中...'}
            </p>
          </div>
        )}

        {/* Dimension pills with scores */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {displayDimensions.map(key => {
            const score = partialScores[key] || 0;
            const color = DIMENSION_COLORS[key] || '#888';
            const isExploding = explodingDimensions.has(key);

            return (
              <div
                key={key}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{
                  background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                  border: `1px solid ${color}44`,
                  animation: isExploding ? 'pillPopIn 0.4s ease-out' : 'none',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span style={{ color }}>{DIMENSION_LABELS[key]}</span>
                  <span className="font-bold text-white">{score}分</span>
                </div>
              </div>
            );
          })}

          {/* Placeholder for pending dimensions */}
          {Array.from({ length: 5 - displayDimensions.length }).map((_, i) => (
            <div
              key={`pending-${i}`}
              className="px-3 py-2 rounded-lg text-xs"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px dashed rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-white/30">待解读</span>
              </div>
            </div>
          ))}
        </div>

        {/* Current hint text */}
        {hintText && (
          <p
            className="text-sm text-center"
            style={{
              color: DIMENSION_COLORS[currentHint as string] || 'rgba(255,255,255,0.4)',
              animation: 'fadeInUp 0.3s ease-out',
            }}
          >
            {hintText}
          </p>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes dimensionExplode {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes explosionRing {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes particleScatter {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance));
            opacity: 0;
          }
        }

        @keyframes pillPopIn {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
});

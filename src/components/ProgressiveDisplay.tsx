'use client';

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

export default function ProgressiveDisplay({
  partialScores,
  partialAnalysis,
  currentHint,
  completedDimensions,
}: ProgressiveDisplayProps) {
  // Filter out 'overview' from display dimensions
  const displayDimensions = completedDimensions.filter(d => d !== 'overview');

  // Extract keyword preview from analysis
  const getDimensionPreview = (key: string): string => {
    if (!partialAnalysis[key]) return '';
    const data = partialAnalysis[key];
    if (typeof data === 'string') {
      // Already a string, return first 20 chars
      return data.slice(0, 20) + (data.length > 20 ? '...' : '');
    }
    if (data[key]) {
      return String(data[key]).slice(0, 20) + (String(data[key]).length > 20 ? '...' : '');
    }
    return '';
  };

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
      </div>

      {/* Bottom: Completed dimensions with preview */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-center mb-3" style={{ color: 'var(--color-accent, #d4af37)' }}>
          实时解析进度
        </p>

        {/* Dimension pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {displayDimensions.map(key => {
            const score = partialScores[key] || 0;
            const preview = getDimensionPreview(key);
            const color = DIMENSION_COLORS[key] || '#888';

            return (
              <div
                key={key}
                className="px-3 py-2 rounded-lg text-xs"
                style={{
                  background: `linear-gradient(135deg, ${color}22, ${color}11)`,
                  border: `1px solid ${color}44`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span style={{ color }}>{DIMENSION_LABELS[key]}</span>
                  <span className="font-bold text-white">{score}分</span>
                </div>
                {preview && (
                  <p className="text-white/50 truncate max-w-32">{preview}</p>
                )}
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
        {currentHint && currentHint !== 'analyzing' && (
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
            正在解读{DIMENSION_LABELS[currentHint] || currentHint}...
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

interface MiniRadarProps {
  scores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  size?: number;
}

const DIMENSIONS = [
  { key: 'career', label: '事业', angle: 90 },
  { key: 'love', label: '感情', angle: 162 },
  { key: 'wealth', label: '财运', angle: 234 },
  { key: 'health', label: '健康', angle: 306 },
  { key: 'mentor', label: '贵人', angle: 18 },
];

const DIMENSION_COLORS: Record<string, string> = {
  career: 'var(--color-dimension-career)',
  love: 'var(--color-dimension-love)',
  wealth: 'var(--color-dimension-wealth)',
  health: 'var(--color-dimension-health)',
  mentor: 'var(--color-dimension-mentor)',
};

export default function MiniRadar({ scores, size = 80 }: MiniRadarProps) {
  // Multiple entries (one per axis) with dimension labels and single shared value per entry
  // This is the correct pattern: each Radar reads "value" but only one Radar renders
  const data = DIMENSIONS.map(d => ({
    dimension: d.label,
    value: scores[d.key as keyof typeof scores] || 0,
  }));

  // Single Radar reading "value" - shows one pentagon with correct shape
  // Multiple colored Radars would overlap identically; use one unified radar instead
  return (
    <div style={{ width: size, height: size, minWidth: 0, minHeight: 0 }}>
      <RadarChart
        width={size}
        height={size}
        data={data}
        cx="50%"
        cy="50%"
        outerRadius="85%"
      >
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#9ca3af', fontSize: 8 }} />
        <Radar
          name="Score"
          dataKey="value"
          stroke="var(--color-dimension-career)"
          fill="var(--color-dimension-career)"
          fillOpacity={0.3}
          strokeWidth={1.5}
        />
      </RadarChart>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface RadarChartProps {
  scores: {
    career: number;
    love: number;
    wealth: number;
    health: number;
    mentor: number;
  };
  onDimensionClick?: (dimension: string) => void;
  activeDimension?: string | null;
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

export default function RadarChartComponent({
  scores,
  onDimensionClick,
  activeDimension
}: RadarChartProps) {
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);

  const data = DIMENSIONS.map(d => ({
    dimension: d.label,
    value: scores[d.key as keyof typeof scores] || 0,
    key: d.key,
  }));

  const handleClick = (e: any) => {
    if (e && e.activePayload && e.activePayload[0]) {
      const key = e.activePayload[0].payload.key;
      onDimensionClick?.(key);
    }
  };

  const ariaLabel = `命盘分析雷达图：事业${scores.career}分、感情${scores.love}分、财运${scores.wealth}分、健康${scores.health}分、贵人${scores.mentor}分`;

  return (
    <div className="relative mx-auto" role="img" aria-label={ariaLabel} style={{ width: 300, height: 300 }}>
      <RadarChart
        width={300}
        height={300}
        cx="50%"
        cy="50%"
        outerRadius="70%"
        data={data}
        onClick={handleClick}
      >
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: '#9ca3af', fontSize: 13 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          tickCount={5}
        />
        {DIMENSIONS.map((d) => {
          const isActive = activeDimension === d.key;
          const isHovered = hoveredDimension === d.key;
          const color = DIMENSION_COLORS[d.key];

          return (
            <Radar
              key={d.key}
              name={d.label}
              dataKey="value"
              stroke={isActive ? color : isHovered ? color : 'rgba(123,104,238,0.5)'}
              fill={color}
              fillOpacity={isActive ? 0.5 : isHovered ? 0.3 : 0.15}
              strokeWidth={isActive ? 3 : 2}
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={() => setHoveredDimension(d.key)}
              onMouseLeave={() => setHoveredDimension(null)}
            />
          );
        })}
      </RadarChart>

      {/* Click hint */}
      <p className="text-center text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
        点击雷达图维度查看详细分析
      </p>
    </div>
  );
}

// src/components/RadarChart.tsx
'use client';

interface RadarChartProps {
  scores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  size?: number;
  color?: string;        // 雷达图填充色
  opponentScores?: {    // 对手的雷达图数据，用于叠加对比
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  opponentColor?: string;
}

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#e74c3c', angle: 90 },
  { key: 'love', label: '感情', color: '#e91e63', angle: 162 },
  { key: 'wealth', label: '财运', color: '#f1c40f', angle: 234 },
  { key: 'health', label: '健康', color: '#2ecc71', angle: 306 },
  { key: 'mentor', label: '贵人', color: '#3498db', angle: 18 },
];

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export { DIMENSIONS, polarToCartesian };

export default function RadarChart({ scores, size = 280, color = 'rgba(212, 175, 55, 0.3)', opponentScores, opponentColor = 'rgba(231, 76, 60, 0.3)' }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.38;
  const innerRadius = outerRadius * 0.2;

  const scorePoints = DIMENSIONS.map(dim => {
    const score = scores[dim.key as keyof RadarChartProps['scores']] || 0;
    const radius = innerRadius + (outerRadius - innerRadius) * (score / 100);
    return polarToCartesian(cx, cy, radius, dim.angle);
  });

  const opponentPoints = opponentScores ? DIMENSIONS.map(dim => {
    const score = opponentScores[dim.key as keyof RadarChartProps['scores']] || 0;
    const radius = innerRadius + (outerRadius - innerRadius) * (score / 100);
    return polarToCartesian(cx, cy, radius, dim.angle);
  }) : null;

  const axisLines = DIMENSIONS.map(dim => {
    const point = polarToCartesian(cx, cy, outerRadius, dim.angle);
    return { x1: cx, y1: cy, x2: point.x, y2: point.y };
  });

  const gridCircles = [0.25, 0.5, 0.75, 1].map(scale => (
    <circle key={scale} cx={cx} cy={cy} r={innerRadius + (outerRadius - innerRadius) * scale}
      fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
  ));

  const fillPath = scorePoints.length > 0 ? `M ${scorePoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z` : '';
  const opponentPath = opponentPoints && opponentPoints.length > 0 ? `M ${opponentPoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z` : '';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x="0" y="0" width={size} height={size} fill="rgba(26,21,37,1)" />
      {gridCircles}
      {axisLines.map((line, i) => (
        <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {opponentPath && <path d={opponentPath} fill={opponentColor} stroke={opponentColor} strokeWidth="2" />}
      <path d={fillPath} fill={color} stroke={color.replace(/[\d.]+$/, '0.8')} strokeWidth="2" />
      {scorePoints.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="4" fill="#d4af37" />
      ))}
      {DIMENSIONS.map(dim => {
        const labelRadius = outerRadius + 12;
        const pos = polarToCartesian(cx, cy, labelRadius, dim.angle);
        const score = scores[dim.key as keyof RadarChartProps['scores']] || 0;
        return (
          <g key={dim.key}>
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fill={dim.color} fontSize="12" fontWeight="bold">{dim.label}</text>
            <text x={pos.x} y={pos.y + 14} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,0.7)" fontSize="10">{score}分</text>
          </g>
        );
      })}
    </svg>
  );
}

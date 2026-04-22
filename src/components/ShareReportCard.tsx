'use client';

// Enhanced share card with SVG radar chart for better image generation
interface ShareReportCardProps {
  name: string;
  gender: string;
  birthYear?: number;
  radarScores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  overall?: string;
  zodiac?: string;
  element?: string;
  createdAt: string;
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

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function SvgRadarChart({ scores, size = 280 }: { scores: Record<string, number>; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.38;
  const innerRadius = outerRadius * 0.2;

  // Calculate score points
  const scorePoints = DIMENSIONS.map(dim => {
    const score = scores[dim.key] || 0;
    const radius = innerRadius + (outerRadius - innerRadius) * (score / 100);
    return polarToCartesian(cx, cy, radius, dim.angle);
  });

  // Axis lines and labels
  const axisLines = DIMENSIONS.map(dim => {
    const point = polarToCartesian(cx, cy, outerRadius, dim.angle);
    return { x1: cx, y1: cy, x2: point.x, y2: point.y };
  });

  // Grid circles
  const gridCircles = [0.25, 0.5, 0.75, 1].map(scale => (
    <circle
      key={scale}
      cx={cx}
      cy={cy}
      r={innerRadius + (outerRadius - innerRadius) * scale}
      fill="none"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="1"
    />
  ));

  // Score fill polygon
  const fillPath = scorePoints.length > 0
    ? `M ${scorePoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z`
    : '';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background */}
      <rect x="0" y="0" width={size} height={size} fill="rgba(26,21,37,1)" />
      {/* Grid circles */}
      {gridCircles}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
      ))}

      {/* Score fill */}
      <path
        d={fillPath}
        fill="rgba(212, 175, 55, 0.3)"
        stroke="rgba(212, 175, 55, 0.8)"
        strokeWidth="2"
      />

      {/* Score points */}
      {scorePoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#d4af37"
        />
      ))}

      {/* Dimension labels */}
      {DIMENSIONS.map(dim => {
        const labelRadius = outerRadius + 20;
        const pos = polarToCartesian(cx, cy, labelRadius, dim.angle);
        const score = scores[dim.key] || 0;
        return (
          <g key={dim.key}>
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={dim.color}
              fontSize="12"
              fontWeight="bold"
            >
              {dim.label}
            </text>
            <text
              x={pos.x}
              y={pos.y + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.7)"
              fontSize="10"
            >
              {score}分
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function ShareReportCard({
  name,
  gender,
  birthYear,
  radarScores,
  overall,
  zodiac,
  element,
  createdAt
}: ShareReportCardProps) {
  const genderText = gender === 'male' ? '男' : '女';
  const date = new Date(createdAt);

  return (
    <div
      style={{
        width: 420,
        minHeight: 420,
        padding: 32,
        background: 'linear-gradient(135deg, #1a1525 0%, #2d1f3d 50%, #1a1525 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
        boxSizing: 'border-box',
        display: 'inline-block',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#d4af37', marginBottom: 6, letterSpacing: 3 }}>
          AI 命理分析报告
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 'bold', margin: 0, color: '#fff' }}>
          {name} 的命盘
        </h2>
        <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
          {birthYear ? `${birthYear}年 · ` : ''}{genderText} · {zodiac || '生肖'} · {element || '五行'}
        </div>
      </div>

      {/* Radar Chart */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
        <SvgRadarChart scores={radarScores} size={240} />
      </div>

      {/* Score Bars */}
      <div style={{ marginBottom: 20, padding: '0 10px' }}>
        {DIMENSIONS.map(dim => {
          const score = radarScores[dim.key as keyof typeof radarScores] || 0;
          const fillWidth = (score / 100) * 100;
          return (
            <div key={dim.key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: dim.color }}>{dim.label}</span>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>{score}分</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  width: `${fillWidth}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${dim.color}, ${dim.color}88)`,
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Fortune */}
      {overall && (
        <div
          style={{
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, color: '#d4af37', marginBottom: 6, letterSpacing: 1 }}>整体运势</div>
          <p style={{ fontSize: 13, color: '#ccc', margin: 0, lineHeight: 1.6 }}>
            {overall.length > 120 ? overall.slice(0, 120) + '...' : overall}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 11, color: '#555', marginTop: 8 }}>
        AI命理分析 · {date.toLocaleDateString('zh-CN')}
      </div>
    </div>
  );
}

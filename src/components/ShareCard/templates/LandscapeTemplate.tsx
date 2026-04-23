'use client';

import { ShareCardData } from '../types';

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#2c2c2c', angle: 90 },
  { key: 'love', label: '感情', color: '#2c2c2c', angle: 162 },
  { key: 'wealth', label: '财运', color: '#2c2c2c', angle: 234 },
  { key: 'health', label: '健康', color: '#2c2c2c', angle: 306 },
  { key: 'mentor', label: '贵人', color: '#2c2c2c', angle: 18 },
];

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
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

  // Axis lines
  const axisLines = DIMENSIONS.map(dim => {
    const point = polarToCartesian(cx, cy, outerRadius, dim.angle);
    return { x1: cx, y1: cy, x2: point.x, y2: point.y };
  });

  // Pentagon grid
  const pentagonPoints = (scale: number) =>
    DIMENSIONS.map(dim =>
      polarToCartesian(cx, cy, innerRadius + (outerRadius - innerRadius) * scale, dim.angle)
    ).map(p => `${p.x} ${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid pentagons - thin ink lines */}
      <polygon
        points={pentagonPoints(0.25)}
        fill="none"
        stroke="#8b7355"
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
      <polygon
        points={pentagonPoints(0.5)}
        fill="none"
        stroke="#8b7355"
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />
      <polygon
        points={pentagonPoints(0.75)}
        fill="none"
        stroke="#8b7355"
        strokeWidth="0.5"
        strokeOpacity="0.5"
      />
      <polygon
        points={pentagonPoints(1)}
        fill="none"
        stroke="#8b7355"
        strokeWidth="0.8"
        strokeOpacity="0.6"
      />

      {/* Axis lines - subtle ink strokes */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#8b7355"
          strokeWidth="0.5"
          strokeOpacity="0.3"
        />
      ))}

      {/* Score fill - very light wash */}
      <polygon
        points={scorePoints.map(p => `${p.x} ${p.y}`).join(' ')}
        fill="#4a7c59"
        fillOpacity="0.08"
        stroke="#4a7c59"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />

      {/* Score points - small dots */}
      {scorePoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="3"
          fill="#4a7c59"
          fillOpacity="0.6"
        />
      ))}

      {/* Dimension labels */}
      {DIMENSIONS.map(dim => {
        const labelRadius = outerRadius + 22;
        const pos = polarToCartesian(cx, cy, labelRadius, dim.angle);
        const score = scores[dim.key] || 0;
        return (
          <g key={dim.key}>
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#2c2c2c"
              fontSize="11"
              fontWeight="500"
            >
              {dim.label}
            </text>
            <text
              x={pos.x}
              y={pos.y + 13}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#8b7355"
              fontSize="9"
            >
              {score}分
            </text>
          </g>
        );
      })}
    </svg>
  );
}

interface LandscapeTemplateProps {
  data: ShareCardData;
}

export default function LandscapeTemplate({ data }: LandscapeTemplateProps) {
  const genderText = data.gender === 'male' ? '男' : '女';

  return (
    <div
      style={{
        width: 420,
        minHeight: 480,
        padding: 32,
        background: '#f5f5f0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#2c2c2c',
        boxSizing: 'border-box',
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 顶部标题 */}
      <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative' }}>
        <div style={{ fontSize: 10, color: '#8b7355', marginBottom: 8, letterSpacing: 4 }}>
          · AI 命理分析报告 ·
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, color: '#2c2c2c', letterSpacing: 2 }}>
          {data.name} 的命盘
        </h2>
        <div style={{ fontSize: 12, color: '#8b7355', marginTop: 8 }}>
          {data.birthYear ? `${data.birthYear}年 · ` : ''}{genderText} · {data.zodiac || '生肖'} · {data.element || '五行'}
        </div>
      </div>

      {/* 雷达图区域 */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <SvgRadarChart scores={data.radarScores} size={220} />
      </div>

      {/* 进度条 - 细横线风格 */}
      <div style={{ marginBottom: 20, padding: '0 20px' }}>
        {DIMENSIONS.map(dim => {
          const score = data.radarScores[dim.key as keyof typeof data.radarScores] || 0;
          const fillWidth = (score / 100) * 100;
          return (
            <div key={dim.key} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#2c2c2c' }}>{dim.label}</span>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#4a7c59' }}>{score}分</span>
              </div>
              <div style={{ height: 2, background: '#e0ddd5', borderRadius: 1, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${fillWidth}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #8b7355, #4a7c59)',
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 运势摘要 */}
      {data.overall && (
        <div
          style={{
            background: 'rgba(139, 115, 85, 0.06)',
            borderLeft: '2px solid #8b7355',
            borderRadius: 4,
            padding: '12 16',
            margin: '0 20px 20px',
          }}
        >
          <div style={{ fontSize: 10, color: '#8b7355', marginBottom: 6, letterSpacing: 1 }}>整体运势</div>
          <p style={{ fontSize: 12, color: '#2c2c2c', margin: 0, lineHeight: 1.8 }}>
            {data.overall.length > 80 ? data.overall.slice(0, 80) + '...' : data.overall}
          </p>
        </div>
      )}

      {/* 水印 - 山水意境风格 */}
      <div style={{ position: 'absolute', bottom: 14, left: 20, fontSize: 9, color: '#8b7355', letterSpacing: 1, opacity: 0.7 }}>
        · 山水命盘 ·
      </div>
      <div style={{ position: 'absolute', bottom: 14, right: 20, fontSize: 9, color: '#4a7c59', fontStyle: 'italic', opacity: 0.6 }}>
        ai-fortune.app
      </div>
    </div>
  );
}

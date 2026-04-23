'use client';

import { ShareCardData } from '../types';

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#00ffff', angle: 90 },
  { key: 'love', label: '感情', color: '#ff00ff', angle: 162 },
  { key: 'wealth', label: '财运', color: '#ffff00', angle: 234 },
  { key: 'health', label: '健康', color: '#00ff00', angle: 306 },
  { key: 'mentor', label: '贵人', color: '#00ffff', angle: 18 },
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

  // Grid circles
  const gridCircles = [0.25, 0.5, 0.75, 1].map(scale => (
    <circle
      key={scale}
      cx={cx}
      cy={cy}
      r={innerRadius + (outerRadius - innerRadius) * scale}
      fill="none"
      stroke="rgba(0,255,255,0.15)"
      strokeWidth="1"
    />
  ));

  // Score fill path
  const fillPath = scorePoints.length > 0
    ? `M ${scorePoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z`
    : '';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,255,0.6)) drop-shadow(0 0 16px rgba(255,0,255,0.4))' }}>
      {/* Background */}
      <rect x="0" y="0" width={size} height={size} fill="transparent" />
      {/* Grid circles with cyan glow */}
      {gridCircles}

      {/* Axis lines with neon glow */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="rgba(0,255,255,0.3)"
          strokeWidth="1"
          style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.8))' }}
        />
      ))}

      {/* Score fill with gradient effect */}
      <path
        d={fillPath}
        fill="rgba(255,0,255,0.15)"
        stroke="rgba(255,0,255,0.9)"
        strokeWidth="2"
        style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }}
      />

      {/* Score points with neon glow */}
      {scorePoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="4"
          fill="#ff00ff"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,0,255,1))' }}
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
              style={{ filter: `drop-shadow(0 0 6px ${dim.color})` }}
            >
              {dim.label}
            </text>
            <text
              x={pos.x}
              y={pos.y + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.8)"
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

// Geometric line decoration component
function GeometricDecorations() {
  return (
    <svg
      width="420"
      height="480"
      viewBox="0 0 420 480"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Top left corner lines */}
      <path d="M 0 60 L 0 0 L 60 0" fill="none" stroke="rgba(0,255,255,0.5)" strokeWidth="2" />
      <path d="M 0 80 L 0 0 L 80 0" fill="none" stroke="rgba(255,0,255,0.3)" strokeWidth="1" />

      {/* Top right corner lines */}
      <path d="M 420 60 L 420 0 L 360 0" fill="none" stroke="rgba(0,255,255,0.5)" strokeWidth="2" />
      <path d="M 420 80 L 420 0 L 340 0" fill="none" stroke="rgba(255,0,255,0.3)" strokeWidth="1" />

      {/* Bottom left corner lines */}
      <path d="M 0 420 L 0 480 L 60 480" fill="none" stroke="rgba(0,255,255,0.5)" strokeWidth="2" />
      <path d="M 0 400 L 0 480 L 80 480" fill="none" stroke="rgba(255,0,255,0.3)" strokeWidth="1" />

      {/* Bottom right corner lines */}
      <path d="M 420 420 L 420 480 L 360 480" fill="none" stroke="rgba(0,255,255,0.5)" strokeWidth="2" />
      <path d="M 420 400 L 420 480 L 340 480" fill="none" stroke="rgba(255,0,255,0.3)" strokeWidth="1" />

      {/* Diagonal accent lines */}
      <line x1="0" y1="0" x2="40" y2="40" stroke="rgba(255,255,0,0.4)" strokeWidth="1" />
      <line x1="420" y1="0" x2="380" y2="40" stroke="rgba(255,255,0,0.4)" strokeWidth="1" />
      <line x1="0" y1="480" x2="40" y2="440" stroke="rgba(255,255,0,0.4)" strokeWidth="1" />
      <line x1="420" y1="480" x2="380" y2="440" stroke="rgba(255,255,0,0.4)" strokeWidth="1" />

      {/* Center crosshair decoration */}
      <circle cx="210" cy="240" r="180" fill="none" stroke="rgba(0,255,255,0.1)" strokeWidth="1" strokeDasharray="4 8" />
    </svg>
  );
}

interface NeonTemplateProps {
  data: ShareCardData;
}

export default function NeonTemplate({ data }: NeonTemplateProps) {
  const genderText = data.gender === 'male' ? '男' : '女';

  return (
    <div
      style={{
        width: 420,
        minHeight: 480,
        padding: 32,
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 50%, #0a0a0f 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
        boxSizing: 'border-box',
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Geometric decorations */}
      <GeometricDecorations />

      {/* 顶部标题 */}
      <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative', zIndex: 2 }}>
        <div style={{
          fontSize: 11,
          color: '#00ffff',
          marginBottom: 6,
          letterSpacing: 3,
          textShadow: '0 0 10px rgba(0,255,255,0.8), 0 0 20px rgba(0,255,255,0.4)',
        }}>
          ▸ AI 命理分析报告 ◂
        </div>
        <h2 style={{
          fontSize: 26,
          fontWeight: 'bold',
          margin: 0,
          color: '#fff',
          textShadow: '0 0 10px rgba(255,0,255,0.6), 0 0 20px rgba(255,0,255,0.4)',
        }}>
          {data.name} 的命盘
        </h2>
        <div style={{
          fontSize: 13,
          color: '#888',
          marginTop: 6,
          textShadow: '0 0 8px rgba(255,255,255,0.3)',
        }}>
          {data.birthYear ? `${data.birthYear}年 · ` : ''}{genderText} · {data.zodiac || '生肖'} · {data.element || '五行'}
        </div>
      </div>

      {/* 雷达图区域 */}
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
        zIndex: 2,
      }}>
        <div style={{
          position: 'absolute',
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,0,255,0.1) 0%, transparent 70%)',
          boxShadow: '0 0 40px rgba(0,255,255,0.2), inset 0 0 40px rgba(255,0,255,0.1)',
        }} />
        <SvgRadarChart scores={data.radarScores} size={240} />
      </div>

      {/* 进度条 - 霓虹渐变 */}
      <div style={{ marginBottom: 20, padding: '0 10px', position: 'relative', zIndex: 2 }}>
        {DIMENSIONS.map(dim => {
          const score = data.radarScores[dim.key as keyof typeof data.radarScores] || 0;
          const fillWidth = (score / 100) * 100;
          return (
            <div key={dim.key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{
                  fontSize: 13,
                  color: dim.color,
                  textShadow: `0 0 8px ${dim.color}`,
                }}>{dim.label}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 'bold',
                  color: '#fff',
                  textShadow: '0 0 6px rgba(255,255,255,0.5)',
                }}>{score}分</span>
              </div>
              <div style={{
                height: 6,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid rgba(0,255,255,0.3)',
              }}>
                <div
                  className="is-animating"
                  style={{
                    width: `${fillWidth}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, #00ffff, #ff00ff, #ffff00)`,
                    borderRadius: 3,
                    animation: 'shimmer 2s ease-in-out infinite',
                    boxShadow: '0 0 10px rgba(0,255,255,0.8), 0 0 20px rgba(255,0,255,0.6)',
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
            background: 'rgba(0,255,255,0.05)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            position: 'relative',
            zIndex: 2,
            boxShadow: '0 0 20px rgba(0,255,255,0.1), inset 0 0 20px rgba(255,0,255,0.05)',
          }}
        >
          <div style={{
            fontSize: 11,
            color: '#ff00ff',
            marginBottom: 6,
            letterSpacing: 1,
            textShadow: '0 0 8px rgba(255,0,255,0.8)',
          }}>整体运势</div>
          <p style={{
            fontSize: 13,
            color: '#ccc',
            margin: 0,
            lineHeight: 1.6,
            textShadow: '0 0 4px rgba(255,255,255,0.2)',
          }}>
            {data.overall.length > 100 ? data.overall.slice(0, 100) + '...' : data.overall}
          </p>
        </div>
      )}

      {/* 水印 */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 16,
        fontSize: 8,
        color: 'rgba(0,255,255,0.6)',
        textShadow: '0 0 8px rgba(0,255,255,0.8)',
        letterSpacing: 1,
      }}>
        ◈ 霓虹命盘
      </div>
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 16,
        fontSize: 10,
        color: 'rgba(255,0,255,0.6)',
        textShadow: '0 0 8px rgba(255,0,255,0.8)',
        fontStyle: 'italic',
      }}>
        ai-fortune.app
      </div>
    </div>
  );
}

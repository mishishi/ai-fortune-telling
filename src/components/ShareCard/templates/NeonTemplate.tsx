'use client';

import { ShareCardData } from '../types';
import { polarToCartesian } from '../utils/polarToCartesian';
import { BAGUA_SYMBOLS, ZODIAC_ANIMALS } from '../constants/bagua';

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#00ffff', angle: 90 },
  { key: 'love', label: '感情', color: '#ff00ff', angle: 162 },
  { key: 'wealth', label: '财运', color: '#ffff00', angle: 234 },
  { key: 'health', label: '健康', color: '#00ff00', angle: 306 },
  { key: 'mentor', label: '贵人', color: '#00ffff', angle: 18 },
];

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

// Ornate border decoration component
function OrnateBorder() {
  return (
    <svg
      width="460"
      height="520"
      viewBox="0 0 460 520"
      style={{
        position: 'absolute',
        top: -20,
        left: -20,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Outer golden border with neon glow */}
      <rect
        x="10"
        y="10"
        width="440"
        height="500"
        fill="none"
        stroke="url(#neonGoldGradient)"
        strokeWidth="3"
        rx="8"
        style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,255,0.4)) drop-shadow(0 0 16px rgba(255,0,255,0.3)' }}
      />

      {/* Inner decorative border */}
      <rect
        x="18"
        y="18"
        width="424"
        height="484"
        fill="none"
        stroke="rgba(0,255,255,0.25)"
        strokeWidth="1"
        strokeDasharray="4 2"
        rx="6"
      />

      {/* Corner ornaments - top left */}
      <g transform="translate(10, 10)">
        <path d="M 0 40 Q 0 0 40 0" fill="none" stroke="#00ffff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.8))' }} />
        <circle cx="8" cy="8" r="3" fill="#ff00ff" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
        <circle cx="20" cy="5" r="2" fill="#00ffff" opacity="0.6" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
        <circle cx="5" cy="20" r="2" fill="#ff00ff" opacity="0.6" style={{ filter: 'drop-shadow(0 0 3px rgba(255,0,255,0.6))' }} />
      </g>

      {/* Corner ornaments - top right */}
      <g transform="translate(450, 10) scale(-1, 1)">
        <path d="M 0 40 Q 0 0 40 0" fill="none" stroke="#00ffff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.8))' }} />
        <circle cx="8" cy="8" r="3" fill="#ff00ff" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
        <circle cx="20" cy="5" r="2" fill="#00ffff" opacity="0.6" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
        <circle cx="5" cy="20" r="2" fill="#ff00ff" opacity="0.6" style={{ filter: 'drop-shadow(0 0 3px rgba(255,0,255,0.6))' }} />
      </g>

      {/* Corner ornaments - bottom left */}
      <g transform="translate(10, 510) scale(1, -1)">
        <path d="M 0 40 Q 0 0 40 0" fill="none" stroke="#00ffff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.8))' }} />
        <circle cx="8" cy="8" r="3" fill="#ff00ff" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
        <circle cx="20" cy="5" r="2" fill="#00ffff" opacity="0.6" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
        <circle cx="5" cy="20" r="2" fill="#ff00ff" opacity="0.6" style={{ filter: 'drop-shadow(0 0 3px rgba(255,0,255,0.6))' }} />
      </g>

      {/* Corner ornaments - bottom right */}
      <g transform="translate(450, 510) scale(-1, -1)">
        <path d="M 0 40 Q 0 0 40 0" fill="none" stroke="#00ffff" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.8))' }} />
        <circle cx="8" cy="8" r="3" fill="#ff00ff" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
        <circle cx="20" cy="5" r="2" fill="#00ffff" opacity="0.6" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
        <circle cx="5" cy="20" r="2" fill="#ff00ff" opacity="0.6" style={{ filter: 'drop-shadow(0 0 3px rgba(255,0,255,0.6))' }} />
      </g>

      {/* Side decorative elements - left */}
      <g transform="translate(10, 260)">
        <line x1="0" y1="-60" x2="0" y2="60" stroke="rgba(0,255,255,0.5)" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
        <circle cx="0" cy="-40" r="2" fill="#00ffff" opacity="0.5" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
        <circle cx="0" cy="0" r="3" fill="#ff00ff" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
        <circle cx="0" cy="40" r="2" fill="#00ffff" opacity="0.5" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
      </g>

      {/* Side decorative elements - right */}
      <g transform="translate(450, 260)">
        <line x1="0" y1="-60" x2="0" y2="60" stroke="rgba(0,255,255,0.5)" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
        <circle cx="0" cy="-40" r="2" fill="#00ffff" opacity="0.5" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
        <circle cx="0" cy="0" r="3" fill="#ff00ff" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
        <circle cx="0" cy="40" r="2" fill="#00ffff" opacity="0.5" style={{ filter: 'drop-shadow(0 0 3px rgba(0,255,255,0.6))' }} />
      </g>

      {/* Top center ornament */}
      <g transform="translate(230, 10)">
        <path d="M -20 0 L 0 -15 L 20 0" fill="none" stroke="#00ffff" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.8))' }} />
        <circle cx="0" cy="-8" r="3" fill="#ff00ff" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
      </g>

      {/* Bottom center ornament */}
      <g transform="translate(230, 510)">
        <path d="M -20 0 L 0 15 L 20 0" fill="none" stroke="#00ffff" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.8))' }} />
        <circle cx="0" cy="8" r="3" fill="#ff00ff" style={{ filter: 'drop-shadow(0 0 6px rgba(255,0,255,0.8))' }} />
      </g>

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="neonGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="50%" stopColor="#ff00ff" />
          <stop offset="100%" stopColor="#00ffff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface NeonTemplateProps {
  data: ShareCardData;
}

// BaGua decoration ring for NeonTemplate
function NeonBaGuaRing() {
  const radius = 200;
  const centerX = 210;
  const centerY = 240;

  return (
    <svg
      width="460"
      height="520"
      viewBox="0 0 460 520"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {/* Outer ring with neon glow */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius + 30}
        fill="none"
        stroke="rgba(0,255,255,0.12)"
        strokeWidth="1"
        strokeDasharray="2 4"
        style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.3))' }}
      />

      {/* BaGua symbols positioned around the circle */}
      {BAGUA_SYMBOLS.map((symbol, i) => {
        const angle = (i * 45 - 90) * (Math.PI / 180);
        const x = centerX + (radius + 45) * Math.cos(angle);
        const y = centerY + (radius + 45) * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(0,255,255,0.35)"
            fontSize="14"
            fontFamily="serif"
            style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.5))' }}
          >
            {symbol}
          </text>
        );
      })}

      {/* Inner ring with zodiac animals */}
      {ZODIAC_ANIMALS.map((animal, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = centerX + (radius - 15) * Math.cos(angle);
        const y = centerY + (radius - 15) * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,0,255,0.2)"
            fontSize="9"
          >
            {animal}
          </text>
        );
      })}
    </svg>
  );
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
      {/* Animated gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(45deg, rgba(0,255,255,0.03) 0%, rgba(255,0,255,0.03) 50%, rgba(255,255,0,0.03) 100%)',
          animation: 'neonGradientShift 4s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Ornate border decoration */}
      <OrnateBorder />

      {/* BaGua ring decoration */}
      <NeonBaGuaRing />

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
        zIndex: 2,
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
        zIndex: 2,
      }}>
        ai-fortune.app
      </div>

      {/* CSS animations for this template */}
      <style>{`
        @keyframes neonGradientShift {
          0%, 100% { opacity: 0.5; transform: translateX(-3%) translateY(-3%); }
          50% { opacity: 1; transform: translateX(3%) translateY(3%); }
        }
      `}</style>
    </div>
  );
}

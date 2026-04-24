'use client';

import { ShareCardData } from '../types';
import GlowEffect from '../effects/GlowEffect';
import ParticleEffect from '../effects/ParticleEffect';
import { polarToCartesian } from '../utils/polarToCartesian';
import { BAGUA_SYMBOLS, ZODIAC_ANIMALS } from '../constants/bagua';

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#e74c3c', angle: 90 },
  { key: 'love', label: '感情', color: '#e91e63', angle: 162 },
  { key: 'wealth', label: '财运', color: '#f1c40f', angle: 234 },
  { key: 'health', label: '健康', color: '#2ecc71', angle: 306 },
  { key: 'mentor', label: '贵人', color: '#3498db', angle: 18 },
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
      <rect x="0" y="0" width={size} height={size} fill="transparent" />
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

// Ornate border decoration component
function OrnateBorder() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg
        width="420"
        height="480"
        viewBox="0 0 420 480"
        style={{ display: 'block' }}
      >
        {/* Outer golden border */}
        <rect
          x="8"
          y="8"
          width="404"
          height="464"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="2"
          rx="6"
        />

        {/* Inner decorative border */}
        <rect
          x="14"
          y="14"
          width="392"
          height="452"
          fill="none"
          stroke="rgba(212, 175, 55, 0.3)"
          strokeWidth="1"
          strokeDasharray="4 2"
          rx="4"
        />

        {/* Corner ornaments - top left */}
        <g transform="translate(8, 8)">
          <path d="M 0 30 Q 0 0 30 0" fill="none" stroke="#d4af37" strokeWidth="1.5" />
          <circle cx="6" cy="6" r="2.5" fill="#d4af37" />
          <circle cx="15" cy="4" r="1.5" fill="#d4af37" opacity="0.6" />
          <circle cx="4" cy="15" r="1.5" fill="#d4af37" opacity="0.6" />
        </g>

        {/* Corner ornaments - top right */}
        <g transform="translate(412, 8) scale(-1, 1)">
          <path d="M 0 30 Q 0 0 30 0" fill="none" stroke="#d4af37" strokeWidth="1.5" />
          <circle cx="6" cy="6" r="2.5" fill="#d4af37" />
          <circle cx="15" cy="4" r="1.5" fill="#d4af37" opacity="0.6" />
          <circle cx="4" cy="15" r="1.5" fill="#d4af37" opacity="0.6" />
        </g>

        {/* Corner ornaments - bottom left */}
        <g transform="translate(8, 472) scale(1, -1)">
          <path d="M 0 30 Q 0 0 30 0" fill="none" stroke="#d4af37" strokeWidth="1.5" />
          <circle cx="6" cy="6" r="2.5" fill="#d4af37" />
          <circle cx="15" cy="4" r="1.5" fill="#d4af37" opacity="0.6" />
          <circle cx="4" cy="15" r="1.5" fill="#d4af37" opacity="0.6" />
        </g>

        {/* Corner ornaments - bottom right */}
        <g transform="translate(412, 472) scale(-1, -1)">
          <path d="M 0 30 Q 0 0 30 0" fill="none" stroke="#d4af37" strokeWidth="1.5" />
          <circle cx="6" cy="6" r="2.5" fill="#d4af37" />
          <circle cx="15" cy="4" r="1.5" fill="#d4af37" opacity="0.6" />
          <circle cx="4" cy="15" r="1.5" fill="#d4af37" opacity="0.6" />
        </g>

        {/* Side decorative elements - left */}
        <g transform="translate(8, 240)">
          <line x1="0" y1="-40" x2="0" y2="40" stroke="#d4af37" strokeWidth="1" opacity="0.4" />
          <circle cx="0" cy="-30" r="1.5" fill="#d4af37" opacity="0.5" />
          <circle cx="0" cy="0" r="2" fill="#d4af37" />
          <circle cx="0" cy="30" r="1.5" fill="#d4af37" opacity="0.5" />
        </g>

        {/* Side decorative elements - right */}
        <g transform="translate(412, 240)">
          <line x1="0" y1="-40" x2="0" y2="40" stroke="#d4af37" strokeWidth="1" opacity="0.4" />
          <circle cx="0" cy="-30" r="1.5" fill="#d4af37" opacity="0.5" />
          <circle cx="0" cy="0" r="2" fill="#d4af37" />
          <circle cx="0" cy="30" r="1.5" fill="#d4af37" opacity="0.5" />
        </g>

        {/* Top center ornament */}
        <g transform="translate(210, 8)">
          <path d="M -15 0 L 0 -10 L 15 0" fill="none" stroke="#d4af37" strokeWidth="1" />
          <circle cx="0" cy="-5" r="2" fill="#d4af37" />
        </g>

        {/* Bottom center ornament */}
        <g transform="translate(210, 472)">
          <path d="M -15 0 L 0 10 L 15 0" fill="none" stroke="#d4af37" strokeWidth="1" />
          <circle cx="0" cy="5" r="2" fill="#d4af37" />
        </g>

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f0c674" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// BaGua decoration ring
function BaGuaRing() {
  // Scale down to fit 420x480 card (card padding is 32 on each side, so inner area is ~356x416)
  const scale = 0.85;
  const radius = 200 * scale;
  const centerX = 210;
  const centerY = 240;

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
      {/* Outer ring */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius + 25}
        fill="none"
        stroke="rgba(212, 175, 55, 0.12)"
        strokeWidth="1"
        strokeDasharray="2 4"
      />

      {/* BaGua symbols positioned around the circle */}
      {BAGUA_SYMBOLS.map((symbol, i) => {
        const angle = (i * 45 - 90) * (Math.PI / 180);
        const x = centerX + (radius + 38) * Math.cos(angle);
        const y = centerY + (radius + 38) * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(212, 175, 55, 0.35)"
            fontSize="12"
            fontFamily="serif"
            style={{ filter: 'drop-shadow(0 0 3px rgba(212, 175, 55, 0.25))' }}
          >
            {symbol}
          </text>
        );
      })}

      {/* Inner ring with zodiac animals */}
      {ZODIAC_ANIMALS.map((animal, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = centerX + (radius - 12) * Math.cos(angle);
        const y = centerY + (radius - 12) * Math.sin(angle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(212, 175, 55, 0.2)"
            fontSize="8"
          >
            {animal}
          </text>
        );
      })}
    </svg>
  );
}

interface StarfieldTemplateProps {
  data: ShareCardData;
}

export default function StarfieldTemplate({ data }: StarfieldTemplateProps) {
  const genderText = data.gender === 'male' ? '男' : '女';

  return (
    <div
      className="starfield-card"
      style={{
        width: 420,
        padding: 32,
        background: 'linear-gradient(135deg, #1a1525 0%, #2d1f3d 50%, #1a1525 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
        boxSizing: 'border-box',
        display: 'inline-block',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Animated gradient overlay */}
      <div
        className="gradient-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(45deg, rgba(212,175,55,0.05) 0%, transparent 50%, rgba(212,175,55,0.05) 100%)',
          animation: 'gradientShift 4s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Ornate border decoration */}
      <OrnateBorder />

      {/* BaGua ring decoration */}
      <BaGuaRing />

      {/* 粒子效果 */}
      <ParticleEffect count={5} />

      {/* 顶部标题 */}
      <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, color: '#d4af37', marginBottom: 6, letterSpacing: 3 }}>
          ✦ AI 命理分析报告
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 'bold', margin: 0, color: '#fff' }}>
          {data.name} 的命盘
        </h2>
        <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
          {data.birthYear ? `${data.birthYear}年 · ` : ''}{genderText} · {data.zodiac || '生肖'} · {data.element || '五行'}
        </div>
      </div>

      {/* 雷达图区域 */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 20, zIndex: 2 }}>
        <GlowEffect color="#d4af37" size={260} />
        <SvgRadarChart scores={data.radarScores} size={240} />
      </div>

      {/* 进度条 */}
      <div style={{ marginBottom: 20, padding: '0 10px', position: 'relative', zIndex: 2 }}>
        {DIMENSIONS.map(dim => {
          const score = data.radarScores[dim.key as keyof typeof data.radarScores] || 0;
          const fillWidth = (score / 100) * 100;
          return (
            <div key={dim.key} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: dim.color }}>{dim.label}</span>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>{score}分</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  className="is-animating"
                  style={{
                    width: `${fillWidth}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${dim.color}, ${dim.color}88)`,
                    borderRadius: 3,
                    animation: 'shimmer 2s ease-in-out infinite',
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
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: 11, color: '#d4af37', marginBottom: 6, letterSpacing: 1 }}>整体运势</div>
          <p style={{ fontSize: 13, color: '#ccc', margin: 0, lineHeight: 1.6 }}>
            {data.overall.length > 100 ? data.overall.slice(0, 100) + '...' : data.overall}
          </p>
        </div>
      )}

      {/* 水印 */}
      <div style={{ position: 'absolute', bottom: 12, left: 16, fontSize: 8, color: 'rgba(212,175,55,0.6)', zIndex: 2 }}>
        ✦ 星河命盘
      </div>
      <div style={{ position: 'absolute', bottom: 12, right: 16, fontSize: 10, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', zIndex: 2 }}>
        ai-fortune.app
      </div>

      {/* CSS animations for this template */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { opacity: 0.3; transform: translateX(-5%) translateY(-5%); }
          50% { opacity: 0.6; transform: translateX(5%) translateY(5%); }
        }
      `}</style>
    </div>
  );
}

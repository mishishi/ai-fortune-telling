'use client';

import { ShareCardData } from '../types';
import { polarToCartesian } from '../utils/polarToCartesian';
import { BAGUA_SYMBOLS, ZODIAC_ANIMALS } from '../constants/bagua';

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#e74c3c', angle: 90 },
  { key: 'love', label: '感情', color: '#e91e63', angle: 162 },
  { key: 'wealth', label: '财运', color: '#f1c40f', angle: 234 },
  { key: 'health', label: '健康', color: '#2ecc71', angle: 306 },
  { key: 'mentor', label: '贵人', color: '#3498db', angle: 18 },
];

function SvgRadarChart({ scores, size = 200, color = '#d4af37' }: { scores: Record<string, number>; size?: number; color?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.38;
  const innerRadius = outerRadius * 0.2;

  const scorePoints = DIMENSIONS.map(dim => {
    const score = scores[dim.key] || 0;
    const radius = innerRadius + (outerRadius - innerRadius) * (score / 100);
    return polarToCartesian(cx, cy, radius, dim.angle);
  });

  const axisLines = DIMENSIONS.map(dim => {
    const point = polarToCartesian(cx, cy, outerRadius, dim.angle);
    return { x1: cx, y1: cy, x2: point.x, y2: point.y };
  });

  const gridCircles = [0.25, 0.5, 0.75, 1].map(scale => (
    <circle
      key={scale}
      cx={cx}
      cy={cy}
      r={innerRadius + (outerRadius - innerRadius) * scale}
      fill="none"
      stroke="rgba(212,175,55,0.15)"
      strokeWidth="1"
    />
  ));

  const fillPath = scorePoints.length > 0
    ? `M ${scorePoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z`
    : '';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x="0" y="0" width={size} height={size} fill="transparent" />
      {gridCircles}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="rgba(212,175,55,0.2)"
          strokeWidth="1"
        />
      ))}
      <path
        d={fillPath}
        fill={`${color}22`}
        stroke={color}
        strokeWidth="2"
      />
      {DIMENSIONS.map(dim => {
        const labelRadius = outerRadius + 14;
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
              fontSize="11"
              fontWeight="bold"
            >
              {dim.label}
            </text>
            <text
              x={pos.x}
              y={pos.y + 13}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.7)"
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

// Ornate border for PK card
function OrnateBorder() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      <svg width="420" height="700" viewBox="0 0 420 700" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="pkGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="50%" stopColor="#f4d03f" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
          <linearGradient id="pkRedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c0392b" />
            <stop offset="50%" stopColor="#e74c3c" />
            <stop offset="100%" stopColor="#c0392b" />
          </linearGradient>
        </defs>

        {/* Outer border */}
        <rect x="6" y="6" width="408" height="688" fill="none" stroke="url(#pkGoldGradient)" strokeWidth="2" rx="8"
          style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' }} />

        {/* Inner decorative border */}
        <rect x="12" y="12" width="396" height="676" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" strokeDasharray="4 2" rx="6" />

        {/* Corner decorations */}
        <g transform="translate(6, 6)">
          <path d="M 0 25 Q 0 0 25 0" fill="none" stroke="#d4af37" strokeWidth="1.5" />
          <circle cx="5" cy="5" r="3" fill="#e74c3c" />
        </g>
        <g transform="translate(414, 6) scale(-1, 1)">
          <path d="M 0 25 Q 0 0 25 0" fill="none" stroke="#d4af37" strokeWidth="1.5" />
          <circle cx="5" cy="5" r="3" fill="#e74c3c" />
        </g>
        <g transform="translate(6, 694) scale(1, -1)">
          <path d="M 0 25 Q 0 0 25 0" fill="none" stroke="#d4af37" strokeWidth="1.5" />
          <circle cx="5" cy="5" r="3" fill="#e74c3c" />
        </g>
        <g transform="translate(414, 694) scale(-1, -1)">
          <path d="M 0 25 Q 0 0 25 0" fill="none" stroke="#d4af37" strokeWidth="1.5" />
          <circle cx="5" cy="5" r="3" fill="#e74c3c" />
        </g>
      </svg>
    </div>
  );
}

// BaGua ring decoration
function PKBaGuaRing() {
  const scale = 0.75;
  const radius = 200 * scale;
  const centerX = 210;
  const centerY = 240;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      <svg width="420" height="700" viewBox="0 0 420 700" style={{ display: 'block' }}>
        <circle cx={centerX} cy={centerY} r={radius + 20} fill="none" stroke="rgba(212,175,55,0.1)" strokeWidth="1" strokeDasharray="2 4" />
        {BAGUA_SYMBOLS.map((symbol, i) => {
          const angle = (i * 45 - 90) * (Math.PI / 180);
          const x = centerX + (radius + 32) * Math.cos(angle);
          const y = centerY + (radius + 32) * Math.sin(angle);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="rgba(212,175,55,0.3)" fontSize="12" fontFamily="serif">
              {symbol}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

interface PKChallengeTemplateProps {
  challenger: {
    name: string;
    radarScores: Record<string, number>;
    zodiac: string;
    element: string;
  };
}

export default function PKChallengeTemplate({ challenger }: PKChallengeTemplateProps) {
  return (
    <div
      style={{
        width: 420,
        minHeight: 700,
        padding: 24,
        background: 'linear-gradient(135deg, #1a1525 0%, #2d1f3d 40%, #1a1525 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
        boxSizing: 'border-box',
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <OrnateBorder />
      <PKBaGuaRing />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 10, color: '#e74c3c', marginBottom: 4, letterSpacing: 3 }}>
          ⚡ 运势PK挑战 ⚡
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 'bold', margin: 0, color: '#fff' }}>
          挑战书
        </h2>
      </div>

      {/* VS Section */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20, position: 'relative', zIndex: 2 }}>
        {/* Challenger side */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#d4af37', marginBottom: 4 }}>挑战者</div>
          <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>{challenger.name}</div>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>{challenger.zodiac} · {challenger.element}</div>
          <SvgRadarChart scores={challenger.radarScores} size={160} color="#d4af37" />
        </div>

        {/* VS Badge */}
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#fff',
          boxShadow: '0 0 20px rgba(231,76,60,0.5)',
          flexShrink: 0,
        }}>
          VS
        </div>

        {/* Opponent placeholder */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>等待对手</div>
          <div style={{
            width: 160,
            height: 160,
            margin: '0 auto 12px',
            borderRadius: '50%',
            border: '2px dashed rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: 40 }}>?</span>
          </div>
          <div style={{ fontSize: 14, color: '#888' }}>虚位以待</div>
        </div>
      </div>

      {/* Dimensions comparison */}
      <div style={{ padding: '0 10px', marginBottom: 16, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 10, color: '#d4af37', marginBottom: 8, textAlign: 'center' }}>五维对比</div>
        {DIMENSIONS.map(dim => {
          const challengerScore = challenger.radarScores[dim.key] || 0;
          return (
            <div key={dim.key} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 11, color: '#888' }}>{dim.label}</span>
                <span style={{ fontSize: 11, color: '#d4af37' }}>{challengerScore}分</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${challengerScore}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${dim.color}88, ${dim.color})`,
                  borderRadius: 2,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{
        textAlign: 'center',
        padding: 16,
        background: 'rgba(231,76,60,0.1)',
        border: '1px solid rgba(231,76,60,0.3)',
        borderRadius: 12,
        marginBottom: 16,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>敢不敢来战？</div>
        <div style={{ fontSize: 11, color: '#888' }}>扫码接受挑战，证明你的运势</div>
      </div>

      {/* Watermark */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 16,
        fontSize: 8,
        color: 'rgba(212,175,55,0.5)',
        letterSpacing: 1,
        zIndex: 2,
      }}>
        ◈ AI 命理
      </div>
      <div style={{
        position: 'absolute',
        bottom: 12,
        right: 16,
        fontSize: 9,
        color: 'rgba(231,76,60,0.5)',
        fontStyle: 'italic',
        zIndex: 2,
      }}>
        ai-fortune.app
      </div>
    </div>
  );
}

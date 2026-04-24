'use client';

import { ShareCardData } from '../types';
import { polarToCartesian } from '../utils/polarToCartesian';
import { BAGUA_SYMBOLS, ZODIAC_ANIMALS } from '../constants/bagua';

// 朱砂红印章颜色
const VERMILLION = '#c41e3a';
const INK_DARK = '#1a1a1a';
const INK_MEDIUM = '#5c5c5c';
const INK_LIGHT = '#8b7355';
const PAPER_BG = '#f5f0e8';

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#4a7c59', angle: 90 },
  { key: 'love', label: '感情', color: '#c41e3a', angle: 162 },
  { key: 'wealth', label: '财运', color: '#d4af37', angle: 234 },
  { key: 'health', label: '健康', color: '#2c7a7a', angle: 306 },
  { key: 'mentor', label: '贵人', color: '#6b5b95', angle: 18 },
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

  // Pentagon grid
  const pentagonPoints = (scale: number) =>
    DIMENSIONS.map(dim =>
      polarToCartesian(cx, cy, innerRadius + (outerRadius - innerRadius) * scale, dim.angle)
    ).map(p => `${p.x} ${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid pentagons - ink wash style */}
      <polygon
        points={pentagonPoints(0.25)}
        fill="none"
        stroke={INK_LIGHT}
        strokeWidth="0.5"
        strokeOpacity="0.25"
      />
      <polygon
        points={pentagonPoints(0.5)}
        fill="none"
        stroke={INK_LIGHT}
        strokeWidth="0.5"
        strokeOpacity="0.35"
      />
      <polygon
        points={pentagonPoints(0.75)}
        fill="none"
        stroke={INK_LIGHT}
        strokeWidth="0.5"
        strokeOpacity="0.45"
      />
      <polygon
        points={pentagonPoints(1)}
        fill="none"
        stroke={INK_LIGHT}
        strokeWidth="0.8"
        strokeOpacity="0.55"
      />

      {/* Axis lines - subtle ink strokes */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke={INK_LIGHT}
          strokeWidth="0.5"
          strokeOpacity="0.25"
        />
      ))}

      {/* Score fill - ink wash style with gradient */}
      <defs>
        <linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a7c59" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2c7a7a" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <polygon
        points={scorePoints.map(p => `${p.x} ${p.y}`).join(' ')}
        fill="url(#radarFillGradient)"
        stroke="#4a7c59"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />

      {/* Score points - small dots */}
      {scorePoints.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="3.5"
          fill={DIMENSIONS[i].color}
          fillOpacity="0.7"
        />
      ))}

      {/* Dimension labels */}
      {DIMENSIONS.map((dim, idx) => {
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
              fill={dim.color}
              fontSize="11"
              fontWeight="600"
            >
              {dim.label}
            </text>
            <text
              x={pos.x}
              y={pos.y + 13}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={INK_MEDIUM}
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

// Cloud pattern decoration component
function CloudPattern({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const transforms: Record<string, string> = {
    'top-left': 'translate(15, 15) scale(1, 1)',
    'top-right': 'translate(405, 15) scale(-1, 1)',
    'bottom-left': 'translate(15, 465) scale(1, -1)',
    'bottom-right': 'translate(405, 465) scale(-1, -1)',
  };

  return (
    <g transform={transforms[position]} opacity="0.2">
      {/* Main cloud body */}
      <ellipse cx="20" cy="30" rx="18" ry="10" fill="none" stroke={INK_LIGHT} strokeWidth="1" />
      <ellipse cx="10" cy="28" rx="10" ry="6" fill="none" stroke={INK_LIGHT} strokeWidth="0.8" />
      <ellipse cx="30" cy="27" rx="12" ry="7" fill="none" stroke={INK_LIGHT} strokeWidth="0.8" />
      {/* Small decorative dots */}
      <circle cx="5" cy="32" r="1.5" fill={INK_LIGHT} />
      <circle cx="35" cy="30" r="1.5" fill={INK_LIGHT} />
    </g>
  );
}

// Water wave decoration for bottom
function WaterWaveDecoration() {
  return (
    <g opacity="0.3">
      {/* Wave layers */}
      <path
        d="M 0 470 Q 30 460 60 470 T 120 470 T 180 470 T 240 470 T 300 470 T 360 470 T 420 470"
        fill="none"
        stroke={INK_LIGHT}
        strokeWidth="1.5"
      />
      <path
        d="M 0 478 Q 40 468 80 478 T 160 478 T 240 478 T 320 478 T 400 478 T 420 478"
        fill="none"
        stroke={INK_LIGHT}
        strokeWidth="1"
      />
      <path
        d="M 0 485 Q 35 477 70 485 T 140 485 T 210 485 T 280 485 T 350 485 T 420 485"
        fill="none"
        stroke={INK_LIGHT}
        strokeWidth="0.7"
      />
    </g>
  );
}

// Mountain silhouette decoration for background
function MountainSilhouette() {
  return (
    <g opacity="0.25">
      {/* Far mountains */}
      <polygon points="0,480 60,380 120,420 180,350 240,400 300,340 360,390 420,360 420,480" fill={INK_DARK} />
      {/* Near mountains with more detail */}
      <polygon points="0,480 40,420 80,450 140,390 200,440 260,400 320,430 380,410 420,430 420,480" fill={INK_DARK} opacity="0.7" />
    </g>
  );
}

// Vermillion seal/stamp accent
function VermillionSeal() {
  return (
    <g transform="translate(375, 85)" opacity="0.85">
      {/* Outer seal border */}
      <rect x="-22" y="-22" width="44" height="44" fill="none" stroke={VERMILLION} strokeWidth="2" rx="2" />
      {/* Inner seal border */}
      <rect x="-18" y="-18" width="36" height="36" fill="none" stroke={VERMILLION} strokeWidth="1" rx="1" />
      {/* Seal character */}
      <text x="0" y="7" textAnchor="middle" dominantBaseline="middle" fill={VERMILLION} fontSize="20" fontFamily="serif" fontWeight="bold">吉</text>
    </g>
  );
}

// BaGua decoration ring for LandscapeTemplate (enhanced ink wash style)
function LandscapeBaGuaRing() {
  const radius = 180;
  const centerX = 210;
  const centerY = 260;

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
      {/* Mountain silhouette background */}
      <MountainSilhouette />

      {/* Water wave decoration */}
      <WaterWaveDecoration />

      {/* Outer ring - subtle ink style */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius + 30}
        fill="none"
        stroke={INK_LIGHT}
        strokeWidth="0.5"
        strokeOpacity="0.12"
        strokeDasharray="2 4"
      />

      {/* Cloud patterns in corners */}
      <CloudPattern position="top-left" />
      <CloudPattern position="top-right" />
      <CloudPattern position="bottom-left" />
      <CloudPattern position="bottom-right" />

      {/* BaGua symbols positioned around the circle - ink wash style */}
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
            fill={INK_LIGHT}
            fillOpacity="0.35"
            fontSize="14"
            fontFamily="serif"
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
            fill={INK_LIGHT}
            fillOpacity="0.25"
            fontSize="9"
          >
            {animal}
          </text>
        );
      })}

      {/* Vermillion seal accent */}
      <VermillionSeal />
    </svg>
    </div>
  );
}

// Ornate border decoration component (enhanced ink-wash style for landscape)
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
        zIndex: 1,
      }}
    >
      <svg
        width="420"
        height="480"
        viewBox="0 0 420 480"
        style={{ display: 'block' }}
      >
      <defs>
        {/* Gradient for border */}
        <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={INK_LIGHT} stopOpacity="0.3" />
          <stop offset="50%" stopColor={INK_LIGHT} stopOpacity="0.15" />
          <stop offset="100%" stopColor={INK_LIGHT} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      {/* Outer subtle ink border */}
      <rect
        x="8"
        y="8"
        width="404"
        height="464"
        fill="none"
        stroke="url(#borderGradient)"
        strokeWidth="1.5"
        rx="4"
      />

      {/* Inner decorative border */}
      <rect
        x="14"
        y="14"
        width="392"
        height="452"
        fill="none"
        stroke={INK_LIGHT}
        strokeWidth="0.5"
        strokeDasharray="4 2"
        rx="3"
        strokeOpacity="0.2"
      />

      {/* Corner ornaments - top left (ink wash style) */}
      <g transform="translate(8, 8)" opacity="0.35">
        <path d="M 0 30 Q 0 0 30 0" fill="none" stroke={INK_LIGHT} strokeWidth="1.5" />
        <circle cx="6" cy="6" r="2.5" fill={INK_LIGHT} />
        <circle cx="16" cy="4" r="1.5" fill={INK_LIGHT} />
        <circle cx="4" cy="16" r="1.5" fill={INK_LIGHT} />
      </g>

      {/* Corner ornaments - top right */}
      <g transform="translate(412, 8) scale(-1, 1)" opacity="0.35">
        <path d="M 0 30 Q 0 0 30 0" fill="none" stroke={INK_LIGHT} strokeWidth="1.5" />
        <circle cx="6" cy="6" r="2.5" fill={INK_LIGHT} />
        <circle cx="16" cy="4" r="1.5" fill={INK_LIGHT} />
        <circle cx="4" cy="16" r="1.5" fill={INK_LIGHT} />
      </g>

      {/* Corner ornaments - bottom left */}
      <g transform="translate(8, 472) scale(1, -1)" opacity="0.35">
        <path d="M 0 30 Q 0 0 30 0" fill="none" stroke={INK_LIGHT} strokeWidth="1.5" />
        <circle cx="6" cy="6" r="2.5" fill={INK_LIGHT} />
        <circle cx="16" cy="4" r="1.5" fill={INK_LIGHT} />
        <circle cx="4" cy="16" r="1.5" fill={INK_LIGHT} />
      </g>

      {/* Corner ornaments - bottom right */}
      <g transform="translate(412, 472) scale(-1, -1)" opacity="0.35">
        <path d="M 0 30 Q 0 0 30 0" fill="none" stroke={INK_LIGHT} strokeWidth="1.5" />
        <circle cx="6" cy="6" r="2.5" fill={INK_LIGHT} />
        <circle cx="16" cy="4" r="1.5" fill={INK_LIGHT} />
        <circle cx="4" cy="16" r="1.5" fill={INK_LIGHT} />
      </g>

      {/* Side decorative elements - left */}
      <g transform="translate(8, 260)" opacity="0.25">
        <line x1="0" y1="-50" x2="0" y2="50" stroke={INK_LIGHT} strokeWidth="0.75" />
        <circle cx="0" cy="-30" r="1.5" fill={INK_LIGHT} />
        <circle cx="0" cy="0" r="2" fill={INK_LIGHT} />
        <circle cx="0" cy="30" r="1.5" fill={INK_LIGHT} />
      </g>

      {/* Side decorative elements - right */}
      <g transform="translate(412, 260)" opacity="0.25">
        <line x1="0" y1="-50" x2="0" y2="50" stroke={INK_LIGHT} strokeWidth="0.75" />
        <circle cx="0" cy="-30" r="1.5" fill={INK_LIGHT} />
        <circle cx="0" cy="0" r="2" fill={INK_LIGHT} />
        <circle cx="0" cy="30" r="1.5" fill={INK_LIGHT} />
      </g>

      {/* Top center ornament */}
      <g transform="translate(210, 8)" opacity="0.3">
        <path d="M -15 0 L 0 -10 L 15 0" fill="none" stroke={INK_LIGHT} strokeWidth="1" />
        <circle cx="0" cy="-5" r="2" fill={INK_LIGHT} />
      </g>

      {/* Bottom center ornament */}
      <g transform="translate(210, 472)" opacity="0.3">
        <path d="M -15 0 L 0 10 L 15 0" fill="none" stroke={INK_LIGHT} strokeWidth="1" />
        <circle cx="0" cy="5" r="2" fill={INK_LIGHT} />
      </g>
    </svg>
    </div>
  );
}

export default function LandscapeTemplate({ data }: LandscapeTemplateProps) {
  const genderText = data.gender === 'male' ? '男' : '女';

  return (
    <div
      style={{
        width: 420,
        minHeight: 480,
        padding: 32,
        background: 'linear-gradient(145deg, #2d2d2d 0%, #252525 50%, #1a1a1a 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: INK_DARK,
        boxSizing: 'border-box',
        display: 'inline-block',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Layered ink wash gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(139, 115, 85, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(74, 124, 89, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Ornate border decoration */}
      <OrnateBorder />

      {/* BaGua ring decoration */}
      <LandscapeBaGuaRing />

      {/* 顶部标题 */}
      <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 11, color: INK_LIGHT, marginBottom: 6, letterSpacing: 4, fontWeight: 500 }}>
          · AI 命理分析报告 ·
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 'bold', margin: 0, color: PAPER_BG, letterSpacing: 3 }}>
          {data.name} 的命盘
        </h2>
        <div style={{ fontSize: 13, color: '#a0a0a0', marginTop: 6 }}>
          {data.birthYear ? `${data.birthYear}年 · ` : ''}{genderText} · {data.zodiac || '生肖'} · {data.element || '五行'}
        </div>
      </div>

      {/* 雷达图区域 */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 24, zIndex: 2 }}>
        <SvgRadarChart scores={data.radarScores} size={220} />
      </div>

      {/* 进度条 - 增强样式 */}
      <div style={{ marginBottom: 20, padding: '0 16px', position: 'relative', zIndex: 2 }}>
        {DIMENSIONS.map(dim => {
          const score = data.radarScores[dim.key as keyof typeof data.radarScores] || 0;
          const fillWidth = (score / 100) * 100;
          return (
            <div key={dim.key} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: PAPER_BG, fontWeight: 500 }}>{dim.label}</span>
                <span style={{ fontSize: 12, fontWeight: 'bold', color: dim.color }}>{score}分</span>
              </div>
              <div style={{ height: 4, background: 'rgba(139, 115, 85, 0.25)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${fillWidth}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${INK_LIGHT}, ${dim.color})`,
                    borderRadius: 2,
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
            background: 'rgba(139, 115, 85, 0.15)',
            borderLeft: `3px solid ${VERMILLION}`,
            borderRadius: 4,
            padding: '12px 16px',
            margin: '0 16px 20px',
          }}
        >
          <div style={{ fontSize: 10, color: VERMILLION, marginBottom: 4, letterSpacing: 1, fontWeight: 600 }}>整体运势</div>
          <p style={{ fontSize: 12, color: PAPER_BG, margin: 0, lineHeight: 1.8 }}>
            {data.overall.length > 80 ? data.overall.slice(0, 80) + '...' : data.overall}
          </p>
        </div>
      )}

      {/* 水印 - 山水意境风格 */}
      <div style={{ position: 'absolute', bottom: 14, left: 20, fontSize: 9, color: INK_LIGHT, letterSpacing: 1, opacity: 0.8, zIndex: 2 }}>
        · 山水命盘 ·
      </div>
      <div style={{ position: 'absolute', bottom: 14, right: 20, fontSize: 9, color: '#4a7c59', fontStyle: 'italic', opacity: 0.7, zIndex: 2 }}>
        ai-fortune.app
      </div>
    </div>
  );
}

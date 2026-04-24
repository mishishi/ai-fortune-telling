'use client';

import { polarToCartesian } from '../utils/polarToCartesian';

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#e74c3c', angle: 90 },
  { key: 'love', label: '感情', color: '#e91e63', angle: 162 },
  { key: 'wealth', label: '财运', color: '#f1c40f', angle: 234 },
  { key: 'health', label: '健康', color: '#2ecc71', angle: 306 },
  { key: 'mentor', label: '贵人', color: '#3498db', angle: 18 },
];

interface PKResultTemplateProps {
  result: {
    winner: string;
    winDimensions: string[];
    loseDimensions: string[];
    summary: string;
  };
  challenger: {
    name: string;
    radarScores: Record<string, number>;
  };
  opponent: {
    name: string;
    birthYear: number;
    gender: string;
    radarScores: Record<string, number>;
  };
  isChallengerWinner: boolean;
}

function MiniRadarChart({ scores, size = 120, color = '#d4af37' }: { scores: Record<string, number>; size?: number; color?: string }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.4;
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

  const gridCircles = [0.5, 1].map(scale => (
    <circle key={scale} cx={cx} cy={cy} r={innerRadius + (outerRadius - innerRadius) * scale} fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="1" />
  ));

  const fillPath = scorePoints.length > 0 ? `M ${scorePoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z` : '';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x="0" y="0" width={size} height={size} fill="transparent" />
      {gridCircles}
      {axisLines.map((line, i) => (
        <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="rgba(212,175,55,0.2)" strokeWidth="1" />
      ))}
      <path d={fillPath} fill={`${color}22`} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export default function PKResultTemplate({ result, challenger, opponent, isChallengerWinner }: PKResultTemplateProps) {
  const winnerName = isChallengerWinner ? challenger.name : opponent.name;
  const loserName = isChallengerWinner ? opponent.name : challenger.name;
  const winnerScores = isChallengerWinner ? challenger.radarScores : opponent.radarScores;
  const loserScores = isChallengerWinner ? opponent.radarScores : challenger.radarScores;

  return (
    <div
      style={{
        width: 420,
        minHeight: 600,
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
      {/* Ornate border */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <svg width="420" height="600" viewBox="0 0 420 600" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="resultGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#f4d03f" />
              <stop offset="100%" stopColor="#d4af37" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" width="408" height="588" fill="none" stroke="url(#resultGoldGradient)" strokeWidth="2" rx="8"
            style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.4))' }} />
          <rect x="12" y="12" width="396" height="576" fill="none" stroke="rgba(212,175,55,0.3)" strokeWidth="1" strokeDasharray="4 2" rx="6" />
        </svg>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: isChallengerWinner ? 32 : 28, marginBottom: 4 }}>
          {isChallengerWinner ? '🏆' : '😢'}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: isChallengerWinner ? '#d4af37' : '#e74c3c' }}>
          {isChallengerWinner ? '你赢了！' : '你输了！'}
        </h2>
      </div>

      {/* VS Result Section */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 16, position: 'relative', zIndex: 2 }}>
        {/* Winner */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#d4af37', marginBottom: 4 }}>{isChallengerWinner ? '你' : '对手'}</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 }}>{winnerName}</div>
          <MiniRadarChart scores={winnerScores} size={100} color="#d4af37" />
          <div style={{ marginTop: 8, fontSize: 11, color: '#d4af37' }}>总分 {Object.values(winnerScores).reduce((a, b) => a + (b || 0), 0)}</div>
        </div>

        {/* VS */}
        <div style={{ fontSize: 14, color: '#888', fontWeight: 'bold', flexShrink: 0 }}>VS</div>

        {/* Loser */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 4 }}>{isChallengerWinner ? '对手' : '你'}</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#888', marginBottom: 4 }}>{loserName}</div>
          <MiniRadarChart scores={loserScores} size={100} color="#666" />
          <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>总分 {Object.values(loserScores).reduce((a, b) => a + (b || 0), 0)}</div>
        </div>
      </div>

      {/* Dimension breakdown */}
      <div style={{ padding: '0 10px', marginBottom: 16, position: 'relative', zIndex: 2 }}>
        <div style={{ fontSize: 10, color: '#d4af37', marginBottom: 8, textAlign: 'center' }}>维度对比</div>
        {DIMENSIONS.map(dim => {
          const winScore = winnerScores[dim.key] || 0;
          const loseScore = loserScores[dim.key] || 0;
          const isWin = result.winDimensions.includes(dim.key);
          return (
            <div key={dim.key} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, color: '#888' }}>{dim.label}</span>
                <span style={{ fontSize: 10, color: isWin ? '#d4af37' : '#e74c3c' }}>
                  {winScore} vs {loseScore} {isWin ? '胜' : '负'}
                </span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  width: `${(winScore / (winScore + loseScore || 1)) * 100}%`,
                  height: '100%',
                  background: isWin ? `linear-gradient(90deg, ${dim.color}, #d4af37)` : `linear-gradient(90deg, #666, #888)`,
                  borderRadius: 2,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{
        textAlign: 'center',
        padding: 12,
        background: 'rgba(212,175,55,0.1)',
        border: '1px solid rgba(212,175,55,0.3)',
        borderRadius: 10,
        marginBottom: 16,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ fontSize: 11, color: '#ccc', lineHeight: 1.5 }}>{result.summary}</div>
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
        color: 'rgba(212,175,55,0.5)',
        fontStyle: 'italic',
        zIndex: 2,
      }}>
        ai-fortune.app
      </div>
    </div>
  );
}

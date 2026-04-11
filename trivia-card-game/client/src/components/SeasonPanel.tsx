import React from 'react';

const TIER_THRESHOLDS: Record<string, number> = {
  bronze: 0, silver: 500, gold: 1500, platinum: 3000, diamond: 5000,
};
const TIER_NEXT: Record<string, string | null> = {
  bronze: 'silver', silver: 'gold', gold: 'platinum', platinum: 'diamond', diamond: null,
};
const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32', silver: '#b8c4ce', gold: '#ffd43b', platinum: '#e8f4f8', diamond: '#b4f0ff',
};

interface SeasonPanelProps {
  seasonState?: { season?: any; stats?: any } | null;
  compact?: boolean;
}

export const SeasonPanel: React.FC<SeasonPanelProps> = ({ seasonState, compact = false }) => {
  if (!seasonState || !seasonState.stats) {
    return (
      <div className="glass-panel" style={{
        padding: '14px 20px',
        textAlign: 'center',
        color: 'rgba(0, 229, 255, 0.4)',
        fontSize: '0.82rem',
        minHeight: compact ? '40px' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        赛季信息加载中...
      </div>
    );
  }

  const { season, stats } = seasonState;
  const tier = stats?.tier ?? 'bronze';
  const xp = stats?.xp ?? 0;
  const rank = stats?.rank ?? 0;
  const nextTier = TIER_NEXT[tier];
  const currentThreshold = TIER_THRESHOLDS[tier] ?? 0;
  const nextThreshold = nextTier ? (TIER_THRESHOLDS[nextTier] ?? 5000) : TIER_THRESHOLDS.diamond + 10000;
  const progress = nextTier
    ? Math.min(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100)
    : 100;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: TIER_COLORS[tier] ?? '#888',
          borderRadius: '8px',
          padding: '4px 12px',
          fontWeight: 700,
          color: '#060912',
          fontSize: '0.82rem',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          {tier}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>
          {xp} XP · 排名 #{rank}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in-up" style={{ padding: '20px 24px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{
            color: 'rgba(0, 229, 255, 0.6)',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '4px',
          }}>
            {season?.name ?? 'S1 2026'}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: TIER_COLORS[tier] ?? '#fff',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {tier}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'var(--neon-yellow)',
            lineHeight: 1,
          }}>
            {xp}
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}>
            Total XP
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {nextTier && (
        <div>
          <div style={{ marginBottom: '6px' }}>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${TIER_COLORS[tier]}, ${TIER_COLORS[nextTier]})`,
              }} />
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.68rem',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.5px',
          }}>
            <span>{xp} / {nextThreshold} XP</span>
            <span style={{ color: TIER_COLORS[nextTier] }}>→ {nextTier}</span>
          </div>
        </div>
      )}

      {tier === 'diamond' && (
        <div style={{
          color: 'var(--neon-yellow)',
          fontSize: '0.82rem',
          fontFamily: 'var(--font-display)',
          letterSpacing: '1px',
          marginTop: '10px',
          textAlign: 'center',
        }}>
          🌟 已达最高段位
        </div>
      )}
    </div>
  );
};

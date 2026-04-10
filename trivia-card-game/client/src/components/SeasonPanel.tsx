import React from 'react';

const TIER_THRESHOLDS: Record<string, number> = {
  bronze: 0, silver: 500, gold: 1500, platinum: 3000, diamond: 5000,
};
const TIER_NEXT: Record<string, string | null> = {
  bronze: 'silver', silver: 'gold', gold: 'platinum', platinum: 'diamond', diamond: null,
};
const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2', diamond: '#b9f2ff',
};

interface SeasonPanelProps {
  seasonState?: { season?: any; stats?: any } | null;
  compact?: boolean;
}

export const SeasonPanel: React.FC<SeasonPanelProps> = ({ seasonState, compact = false }) => {
  if (!seasonState || !seasonState.stats) {
    return (
      <div style={{
        background: 'var(--glass-bg)', border: '2px solid var(--neon-cyan)',
        borderRadius: '12px', padding: '16px', textAlign: 'center', color: '#aaa'
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
          borderRadius: '8px', padding: '4px 12px', fontWeight: 700, color: '#000', fontSize: '0.9rem'
        }}>
          {(tier ?? 'bronze').toUpperCase()}
        </div>
        <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
          {xp} XP | 排名 #{rank}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--glass-bg)', border: '2px solid var(--neon-cyan)',
      borderRadius: '12px', padding: '16px', marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <div style={{ color: 'var(--neon-cyan)', fontSize: '0.8rem' }}>{season?.name ?? 'S1 2026'}</div>
          <div style={{
            fontSize: '1.2rem', fontWeight: 700, color: TIER_COLORS[tier] ?? '#fff',
            textTransform: 'uppercase'
          }}>
            {tier}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--neon-yellow)', fontSize: '1.5rem', fontWeight: 700 }}>{xp}</div>
          <div style={{ color: '#aaa', fontSize: '0.8rem' }}>XP</div>
        </div>
      </div>

      {nextTier && (
        <>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${TIER_COLORS[tier] ?? '#fff'}, ${TIER_COLORS[nextTier] ?? '#fff'})`,
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#aaa' }}>
            <span>{xp} / {nextThreshold} XP</span>
            <span>→ {nextTier}</span>
          </div>
        </>
      )}

      {tier === 'diamond' && (
        <div style={{ color: 'var(--neon-yellow)', fontSize: '0.85rem', marginTop: '4px' }}>
          🌟 已达最高段位！
        </div>
      )}
    </div>
  );
};

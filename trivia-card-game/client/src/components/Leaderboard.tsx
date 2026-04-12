import React, { useEffect, useState } from 'react';

const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32', silver: '#b8c4ce', gold: '#ffd43b', platinum: '#e8f4f8', diamond: '#b4f0ff',
};

interface LeaderboardEntry {
  playerId: string;
  tier: string;
  xp: number;
  rank: number;
}

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/leaderboard?limit=20')
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 12px' }} />
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>加载排行榜...</div>
      </div>
    );
  }

  return (
    <div className="glass-panel animate-fade-in-up" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '32px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255, 212, 59, 0.1)',
          borderRadius: '8px',
          color: 'var(--tier-gold)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          排行榜
        </h3>
      </div>

      {entries.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '32px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.88rem',
        }}>
          暂无数据
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.slice(0, 10).map((entry, idx) => (
            <div
              key={entry.playerId}
              className="animate-fade-in-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: idx === 0 ? 'rgba(255, 212, 59, 0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${idx === 0 ? 'rgba(255, 212, 59, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '10px',
                padding: '12px 14px',
                animationDelay: `${idx * 0.05}s`,
              }}
            >
              {/* Rank */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: idx === 0 ? '#ffd43b' : idx === 1 ? '#b8c4ce' : idx === 2 ? '#cd7f32' : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.78rem',
                color: idx < 3 ? '#060912' : 'rgba(255,255,255,0.4)',
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>

              {/* Tier name */}
              <div style={{
                flex: 1,
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: TIER_COLORS[entry.tier] ?? 'rgba(255,255,255,0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {entry.tier}
              </div>

              {/* XP */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.88rem',
                color: 'var(--neon-yellow)',
              }}>
                {entry.xp} XP
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

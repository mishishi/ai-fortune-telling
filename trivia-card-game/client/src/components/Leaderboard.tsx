import React, { useEffect, useState } from 'react';

const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2', diamond: '#b9f2ff',
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
    return <div style={{ color: '#aaa', textAlign: 'center' }}>加载排行榜...</div>;
  }

  return (
    <div style={{
      background: 'var(--glass-bg)', border: '2px solid var(--neon-pink)',
      borderRadius: '12px', padding: '20px'
    }}>
      <h3 style={{ color: 'var(--neon-pink)', marginBottom: '16px' }}>🏆 排行榜</h3>

      {entries.length === 0 ? (
        <div style={{ color: '#666', textAlign: 'center' }}>暂无数据</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {entries.slice(0, 10).map((entry, idx) => (
            <div key={entry.playerId} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: idx === 0 ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${idx === 0 ? '#ffd700' : 'transparent'}`,
              borderRadius: '8px',
              padding: '10px 14px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem', color: idx < 3 ? '#000' : '#fff'
              }}>
                {idx + 1}
              </div>
              <div style={{
                flex: 1,
                fontWeight: 700,
                color: TIER_COLORS[entry.tier] ?? '#fff',
                textTransform: 'uppercase'
              }}>
                {entry.tier}
              </div>
              <div style={{ color: 'var(--neon-yellow)', fontWeight: 700 }}>
                {entry.xp} XP
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

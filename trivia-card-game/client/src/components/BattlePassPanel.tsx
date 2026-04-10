import React from 'react';

const BP_FREE_REWARDS = [
  { tier: 'bronze', type: 'card_back', name: 'S1 青铜卡背', icon: '🎴' },
  { tier: 'silver', type: 'card_back', name: 'S1 白银卡背', icon: '🎴' },
  { tier: 'gold', type: 'title', name: '黄金黑客', icon: '🏅' },
  { tier: 'platinum', type: 'card_back', name: 'S1 铂金卡背', icon: '🎴' },
  { tier: 'diamond', type: 'title', name: '钻石骑士', icon: '💎' },
];

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2', diamond: '#b9f2ff',
};

interface BattlePassPanelProps {
  seasonState?: { stats?: any } | null;
}

export const BattlePassPanel: React.FC<BattlePassPanelProps> = ({ seasonState }) => {
  const currentTier = seasonState?.stats?.tier ?? 'bronze';
  const currentTierIdx = TIER_ORDER.indexOf(currentTier);

  return (
    <div style={{
      background: 'var(--glass-bg)', border: '2px solid var(--neon-yellow)',
      borderRadius: '12px', padding: '20px'
    }}>
      <h3 style={{ color: 'var(--neon-yellow)', marginBottom: '16px' }}>⚡ Battle Pass</h3>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
        {TIER_ORDER.map((tier, idx) => {
          const reward = BP_FREE_REWARDS[idx];
          const unlocked = idx <= currentTierIdx;
          return (
            <div key={tier} style={{
              minWidth: '80px',
              background: unlocked ? `${TIER_COLORS[tier]}20` : 'rgba(255,255,255,0.05)',
              border: `2px solid ${unlocked ? TIER_COLORS[tier] : '#333'}`,
              borderRadius: '8px',
              padding: '10px',
              textAlign: 'center',
              opacity: unlocked ? 1 : 0.4,
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{reward.icon}</div>
              <div style={{
                fontSize: '0.7rem', fontWeight: 700,
                color: unlocked ? TIER_COLORS[tier] : '#666',
                textTransform: 'uppercase'
              }}>
                {tier}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '2px' }}>{reward.name}</div>
            </div>
          );
        })}
      </div>

      {/* 高级路线占位 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '2px dashed #444',
        borderRadius: '8px',
        padding: '16px',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.9rem',
        cursor: 'not-allowed',
      }}>
        🔒 高级路线 — 即将上线
      </div>
    </div>
  );
};

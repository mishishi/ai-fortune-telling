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
  bronze: '#cd7f32', silver: '#b8c4ce', gold: '#ffd43b', platinum: '#e8f4f8', diamond: '#b4f0ff',
};

interface BattlePassPanelProps {
  seasonState?: { stats?: any } | null;
}

export const BattlePassPanel: React.FC<BattlePassPanelProps> = ({ seasonState }) => {
  const currentTier = seasonState?.stats?.tier ?? 'bronze';
  const currentTierIdx = TIER_ORDER.indexOf(currentTier);

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
          background: 'rgba(255, 224, 102, 0.1)',
          borderRadius: '8px',
          color: 'var(--neon-yellow)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
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
          Battle Pass
        </h3>
      </div>

      {/* Tier rewards */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {TIER_ORDER.map((tier, idx) => {
          const reward = BP_FREE_REWARDS[idx];
          const unlocked = idx <= currentTierIdx;

          return (
            <div
              key={tier}
              style={{
                minWidth: '80px',
                background: unlocked ? `${TIER_COLORS[tier]}12` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${unlocked ? `${TIER_COLORS[tier]}40` : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '10px',
                padding: '12px 8px',
                textAlign: 'center',
                opacity: unlocked ? 1 : 0.4,
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{reward.icon}</div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.62rem',
                fontWeight: 700,
                color: unlocked ? TIER_COLORS[tier] : 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '3px',
              }}>
                {tier}
              </div>
              <div style={{
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.4)',
                lineHeight: 1.3,
              }}>
                {reward.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium locked */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px dashed rgba(255,255,255,0.1)',
        borderRadius: '10px',
        padding: '16px',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '0.82rem',
        fontFamily: 'var(--font-display)',
        letterSpacing: '1px',
      }}>
        🔒 高级路线 — 即将上线
      </div>
    </div>
  );
};

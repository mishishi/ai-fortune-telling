import React from 'react';

interface ModeSelectProps {
  onSelect: (mode: 'pvp' | 'practice') => void;
}

export const ModeSelect: React.FC<ModeSelectProps> = ({ onSelect }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '32px',
      background: 'var(--bg-deep)',
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        color: 'var(--neon-cyan)',
        textShadow: '0 0 20px var(--neon-cyan)',
        letterSpacing: '4px',
      }}>
        ⚡ 学科知识对战 ⚡
      </h1>
      <p style={{ color: '#aaa', fontSize: '1rem' }}>
        赛博空间知识挑战 · 先得10分获胜
      </p>
      <div style={{ display: 'flex', gap: '24px' }}>
        <button
          className="btn-cyber"
          onClick={() => onSelect('pvp')}
          style={{ padding: '16px 40px', fontSize: '1.2rem' }}
        >
          🎮 快速对战
        </button>
        <button
          className="btn-cyber"
          onClick={() => onSelect('practice')}
          style={{ padding: '16px 40px', fontSize: '1.2rem' }}
        >
          📖 练习模式
        </button>
      </div>
    </div>
  );
};

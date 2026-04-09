import React from 'react';

interface CardProps {
  type: 'subject' | 'level';
  name: string;
  color: string;
  icon: string;
  selected?: boolean;
  timeLimit?: number;
  onClick?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  type, name, color, icon, selected, timeLimit, onClick, disabled
}) => {
  const borderColor = selected ? 'var(--neon-pink)' : color;
  const glow = selected
    ? `0 0 15px var(--neon-pink), 0 0 30px rgba(255,0,170,0.4)`
    : `0 0 10px ${color}, 0 0 20px ${color}40`;

  return (
    <div
      className={`card${selected ? ' selected' : ''}`}
      style={{
        borderColor,
        boxShadow: glow,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: '90px',
        textAlign: 'center',
      }}
      onClick={disabled ? undefined : onClick}
    >
      <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{icon}</div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{name}</div>
      {type === 'level' && timeLimit !== undefined && (
        <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '2px' }}>
          ⏱ {timeLimit}s
        </div>
      )}
    </div>
  );
};

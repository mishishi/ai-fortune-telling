import React from 'react';

interface CardProps {
  type: 'subject' | 'level' | 'skill' | 'event';
  name: string;
  color: string;
  icon: string;
  selected?: boolean;
  timeLimit?: number;
  onClick?: () => void;
  disabled?: boolean;
  description?: string;
}

export const Card: React.FC<CardProps> = ({
  type, name, color, icon, selected, timeLimit, onClick, disabled, description
}) => {
  let borderColor = selected ? 'var(--neon-pink)' : color;
  let glow = selected
    ? `0 0 15px var(--neon-pink), 0 0 30px rgba(255,0,170,0.4)`
    : `0 0 10px ${color}, 0 0 20px ${color}40`;

  if (type === 'skill') {
    borderColor = selected ? 'var(--neon-pink)' : '#b266ff';
    glow = selected
      ? `0 0 15px var(--neon-pink), 0 0 30px rgba(255,0,170,0.4)`
      : `0 0 10px #b266ff, 0 0 20px #b266ff40`;
  } else if (type === 'event') {
    borderColor = selected ? 'var(--neon-pink)' : '#ff6b6b';
    glow = selected
      ? `0 0 15px var(--neon-pink), 0 0 30px rgba(255,0,170,0.4)`
      : `0 0 10px #ff6b6b, 0 0 20px #ff6b6b40`;
  }

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
      {description && (
        <div style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '4px', maxWidth: '80px' }}>
          {description}
        </div>
      )}
    </div>
  );
};

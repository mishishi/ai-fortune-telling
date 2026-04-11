import React from 'react';

interface LoadingAIProps {
  title: string;
  subtitle?: string;
  color?: string;
}

export const LoadingAI: React.FC<LoadingAIProps> = ({
  title,
  subtitle = '请稍候...',
  color = '#b87fff'
}) => {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '50vh', gap: '28px'
    }}>
      {/* AI avatar with glow */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '100px', height: '100px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}cc, ${color}44)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 40px ${color}30`,
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}>
          <span style={{ fontSize: '2.5rem' }}>🤖</span>
        </div>
        {/* Ripple rings */}
        <div style={{
          position: 'absolute', inset: '-16px', borderRadius: '50%',
          border: `2px solid ${color}30`,
          animation: 'ripple 2s ease-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: '-32px', borderRadius: '50%',
          border: `2px solid ${color}15`,
          animation: 'ripple 2s ease-out 0.5s infinite',
        }} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          color, fontSize: '1.4rem',
          fontFamily: 'var(--font-display)', fontWeight: 600,
          letterSpacing: '1px', marginBottom: '8px',
        }}>
          {title}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          {subtitle}
        </p>
      </div>

      {/* Loading bar */}
      <div style={{
        width: '240px', height: '4px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '2px', overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', width: '60%',
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: '2px',
          animation: 'loading 1.5s ease-in-out infinite',
        }} />
      </div>
    </div>
  );
};

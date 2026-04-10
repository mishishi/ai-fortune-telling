import React from 'react';
import { GameLogo, IconPlayer, IconAI } from './Icons';

interface ModeSelectProps {
  onSelect: (mode: 'pvp' | 'practice' | 'async') => void;
}

const IconGamepad = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="3"/>
    <line x1="6" y1="12" x2="10" y2="12"/>
    <line x1="8" y1="10" x2="8" y2="14"/>
    <circle cx="17" cy="10" r="1" fill="currentColor"/>
    <circle cx="15" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    <line x1="8" y1="7" x2="16" y2="7"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export const ModeSelect: React.FC<ModeSelectProps> = ({ onSelect }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '36px',
      background: 'var(--bg-deep)',
    }}>
      <div style={{ width: 240, height: 80 }}>
        <GameLogo />
      </div>

      <p style={{ color: '#5a6a8a', fontSize: '0.85rem', letterSpacing: '2px', marginTop: '-16px' }}>
        赛博空间知识挑战 · 先得10分获胜
      </p>

      {/* Mode cards */}
      <div style={{ display: 'flex', gap: '32px' }}>
        {/* PVP mode */}
        <button
          onClick={() => onSelect('pvp')}
          style={{
            background: 'rgba(0,245,255,0.05)',
            border: '1.5px solid rgba(0,245,255,0.3)',
            borderRadius: '16px',
            padding: '28px 36px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'var(--neon-cyan)',
            transition: 'all 0.2s ease',
            minWidth: '180px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--neon-cyan)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.3)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(0,245,255,0.3)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: 28, height: 28 }}><IconPlayer /></div>
            <span style={{ fontSize: '1.5rem' }}>VS</span>
            <div style={{ width: 28, height: 28, color: 'var(--neon-pink)' }}><IconAI /></div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            快速对战
          </div>
          <div style={{ fontSize: '0.72rem', color: '#5a6a8a', letterSpacing: '1px' }}>
            与AI对战 · 先得10分
          </div>
        </button>

        {/* Practice mode */}
        <button
          onClick={() => onSelect('practice')}
          style={{
            background: 'rgba(192,132,252,0.05)',
            border: '1.5px solid rgba(192,132,252,0.3)',
            borderRadius: '16px',
            padding: '28px 36px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'var(--neon-purple)',
            transition: 'all 0.2s ease',
            minWidth: '180px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--neon-purple)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(192,132,252,0.3)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(192,132,252,0.3)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ width: 28, height: 28 }}>
            <IconBook />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            练习模式
          </div>
          <div style={{ fontSize: '0.72rem', color: '#5a6a8a', letterSpacing: '1px' }}>
            自由练习 · 无压力
          </div>
        </button>

        {/* Async mode */}
        <button
          onClick={() => onSelect('async')}
          style={{
            background: 'rgba(255,215,0,0.05)',
            border: '1.5px solid rgba(255,215,0,0.3)',
            borderRadius: '16px',
            padding: '28px 36px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            color: 'var(--neon-yellow)',
            transition: 'all 0.2s ease',
            minWidth: '180px',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--neon-yellow)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255,215,0,0.3)';
            e.currentTarget.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,215,0,0.3)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ fontSize: '1.5rem' }}>🕐</div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}>
            异步对战
          </div>
          <div style={{ fontSize: '0.72rem', color: '#5a6a8a', letterSpacing: '1px' }}>
            48小时回合制 · 排位赛
          </div>
        </button>
      </div>
    </div>
  );
};

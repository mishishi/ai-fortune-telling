import React from 'react';
import { IconPlayer, IconAI } from './Icons';

interface ScoreBoardProps {
  playerScore: number;
  aiScore: number;
  winScore: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  playerScore, aiScore, winScore
}) => (
  <div style={{ textAlign: 'center' }}>
    <div className="scoreboard">
      <div className="player">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, color: 'var(--neon-cyan)' }}>
            <IconPlayer />
          </div>
          <span>玩家</span>
        </div>
        <div className="score-value">{playerScore}</div>
        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>/ {winScore} 分获胜</div>
      </div>

      <div style={{
        color: '#333',
        fontSize: '1.5rem',
        fontFamily: 'var(--font-display)',
        alignSelf: 'center',
        letterSpacing: '4px',
        textShadow: '0 0 10px rgba(255,255,255,0.1)'
      }}>
        VS
      </div>

      <div className="ai">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, color: 'var(--neon-pink)' }}>
            <IconAI />
          </div>
          <span>AI</span>
        </div>
        <div className="score-value">{aiScore}</div>
        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>/ {winScore} 分获胜</div>
      </div>
    </div>
  </div>
);

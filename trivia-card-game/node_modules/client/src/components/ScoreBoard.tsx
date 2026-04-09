import React from 'react';

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
        <div>👤 玩家</div>
        <div className="score-value">{playerScore}</div>
        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>/ {winScore} 分获胜</div>
      </div>
      <div style={{ color: '#555', fontSize: '2rem', alignSelf: 'center' }}>VS</div>
      <div className="ai">
        <div>🤖 AI</div>
        <div className="score-value">{aiScore}</div>
        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>/ {winScore} 分获胜</div>
      </div>
    </div>
  </div>
);

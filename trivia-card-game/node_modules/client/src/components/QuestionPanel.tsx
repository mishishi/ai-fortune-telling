import React, { useState, useEffect } from 'react';

interface QuestionPanelProps {
  narrative: string;
  question: string;
  answer: string;
  timeLimit: number;
  active: boolean;
  onAnswer: (answer: string) => void;
  onTimeout: () => void;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  narrative, question, answer, timeLimit, active, onAnswer, onTimeout
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onAnswer(input.trim());
    setInput('');
  };

  // Reset input when a new active question starts
  useEffect(() => {
    if (active) setInput('');
  }, [active]);

  return (
    <div className="question-panel">
      <div style={{
        color: 'var(--neon-pink)',
        fontSize: '0.85rem',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        ⚡ {narrative}
      </div>
      <div style={{
        fontSize: '1.3rem',
        fontWeight: 700,
        marginBottom: '20px',
        color: '#fff',
        lineHeight: 1.5
      }}>
        {question}
      </div>
      {active && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入你的答案..."
            autoFocus
            style={{
              flex: 1,
              minWidth: '120px',
              background: 'rgba(0,245,255,0.1)',
              border: '2px solid var(--neon-cyan)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#fff',
              fontFamily: 'inherit',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button type="submit" className="btn-cyber">提交</button>
          <button
            type="button"
            onClick={() => onAnswer('__GIVE_UP__')}
            style={{
              background: 'rgba(255,100,100,0.15)',
              border: '2px solid var(--neon-pink)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: 'var(--neon-pink)',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            放弃
          </button>
        </form>
      )}
    </div>
  );
};

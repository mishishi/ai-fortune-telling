import React, { useState, useEffect } from 'react';

interface QuestionPanelProps {
  narrative: string;
  question: string;
  answer: string;
  options: string[];
  timeLimit: number;
  active: boolean;
  onAnswer: (answer: string) => void;
  onTimeout: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  narrative, question, answer, options, timeLimit, active, onAnswer, onTimeout
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  // Reset selection when a new active question starts
  useEffect(() => {
    if (active) setSelected(null);
  }, [active]);

  const handleSelect = (opt: string) => {
    if (!active) return;
    // Extract letter from option string like "A. 唐朝" -> "A"
    const letter = opt.charAt(0);
    setSelected(letter);
  };

  const handleSubmit = () => {
    if (!selected) return;
    onAnswer(selected);
  };

  return (
    <div className="question-panel">
      {/* Narrative */}
      <div style={{
        color: 'var(--neon-pink)',
        fontSize: '0.8rem',
        marginBottom: '10px',
        fontFamily: 'var(--font-display)',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span>⚡</span> {narrative}
      </div>

      {/* Question text */}
      <div style={{
        fontSize: '1.2rem',
        fontWeight: 700,
        marginBottom: '20px',
        color: '#fff',
        lineHeight: 1.6
      }}>
        {question}
      </div>

      {/* Option buttons */}
      {active && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {options.map((opt, idx) => {
              const letter = OPTION_LETTERS[idx];
              const isSelected = selected === letter;
              return (
                <button
                  key={letter}
                  onClick={() => handleSelect(opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    background: isSelected
                      ? 'rgba(0,245,255,0.15)'
                      : 'rgba(0,245,255,0.05)',
                    border: `2px solid ${isSelected ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.2)'}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    color: isSelected ? 'var(--neon-cyan)' : '#c8d0e8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.95rem',
                    boxShadow: isSelected ? '0 0 12px rgba(0,245,255,0.3)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(0,245,255,0.5)';
                      e.currentTarget.style.background = 'rgba(0,245,255,0.08)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(0,245,255,0.2)';
                      e.currentTarget.style.background = 'rgba(0,245,255,0.05)';
                    }
                  }}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--neon-cyan)' : 'rgba(0,245,255,0.3)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                    background: isSelected ? 'var(--neon-cyan)' : 'transparent',
                    color: isSelected ? '#060912' : 'inherit',
                    transition: 'all 0.15s ease',
                  }}>
                    {letter}
                  </span>
                  <span style={{ lineHeight: 1.4 }}>{opt.substring(2).trim()}</span>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn-cyber"
              onClick={handleSubmit}
              disabled={!selected}
              style={{
                opacity: selected ? 1 : 0.4,
                cursor: selected ? 'pointer' : 'not-allowed',
                flex: 1,
              }}
            >
              确认选择 {selected ? `(${selected})` : ''}
            </button>
            <button
              type="button"
              onClick={() => onAnswer('__GIVE_UP__')}
              style={{
                background: 'rgba(255,100,100,0.12)',
                border: '1.5px solid rgba(255,0,170,0.3)',
                borderRadius: '8px',
                padding: '10px 16px',
                color: 'var(--neon-pink)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '1px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--neon-pink)';
                e.currentTarget.style.background = 'rgba(255,0,170,0.15)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,0,170,0.3)';
                e.currentTarget.style.background = 'rgba(255,100,100,0.12)';
              }}
            >
              放弃
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

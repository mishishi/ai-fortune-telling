import React, { useState, useEffect } from 'react';
import { GameLogo } from './Icons';

/* =====================================================
   SUBJECT & LEVEL DATA
   ===================================================== */
const SUBJECTS = [
  { id: '语文',   name: '语文',   color: '#00e5e5', icon: '文' },
  { id: '数学',   name: '数学',   color: '#00c9a7', icon: '∑' },
  { id: '英语',   name: '英语',   color: '#7bed9f', icon: 'Aa' },
  { id: '科学',   name: '科学',   color: '#ffd93d', icon: '⚗' },
  { id: '历史',   name: '历史',   color: '#c97bff', icon: '史' },
  { id: '地理',   name: '地理',   color: '#74b9ff', icon: '地' },
  { id: '生物',   name: '生物',   color: '#55efc4', icon: '生' },
  { id: '道法',   name: '道法',   color: '#fd79a8', icon: '法' },
];

const LEVELS = [
  { id: 'Lv1', label: 'Lv1',  name: '基础',   time: 15, color: '#39ff14' },
  { id: 'Lv2', label: 'Lv2',  name: '进阶',   time: 25, color: '#ffe600' },
  { id: 'Lv3', label: 'Lv3',  name: '提高',   time: 35, color: '#ff9500' },
  { id: 'Lv4', label: 'Lv4',  name: '拓展',   time: 45, color: '#ff3b7a' },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/* =====================================================
   ICONS
   ===================================================== */
const IconArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconSpark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* =====================================================
   SUBJECT PILL
   ===================================================== */
const SubjectPill: React.FC<{
  subject: typeof SUBJECTS[0];
  selected: boolean;
  onClick: () => void;
}> = ({ subject, selected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '16px 14px',
      background: selected
        ? `linear-gradient(135deg, rgba(${hexToRgb(subject.color)},0.2) 0%, rgba(${hexToRgb(subject.color)},0.05) 100%)`
        : 'rgba(13,18,36,0.6)',
      border: `1.5px solid ${selected ? subject.color : `rgba(${hexToRgb(subject.color)},0.15)`}`,
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      transform: selected ? 'scale(1.08)' : 'scale(1)',
      boxShadow: selected
        ? `0 0 20px rgba(${hexToRgb(subject.color)},0.3), 0 8px 24px rgba(0,0,0,0.3)`
        : '0 4px 12px rgba(0,0,0,0.2)',
      color: selected ? subject.color : 'rgba(200,208,232,0.5)',
      minWidth: '80px',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}
  >
    <div style={{
      width: '40px', height: '40px', borderRadius: '10px',
      background: `rgba(${hexToRgb(subject.color)},0.15)`,
      border: `1px solid rgba(${hexToRgb(subject.color)},0.3)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-display)',
      color: selected ? subject.color : 'rgba(200,208,232,0.3)',
      transition: 'all 0.25s',
    }}>
      {subject.icon}
    </div>
    <div style={{
      fontSize: '0.7rem',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      letterSpacing: '1px',
      color: 'inherit',
    }}>
      {subject.name}
    </div>
  </button>
);

/* =====================================================
   LEVEL SELECTOR
   ===================================================== */
const LevelSelector: React.FC<{
  selected: string | null;
  onSelect: (id: string) => void;
}> = ({ selected, onSelect }) => (
  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
    {LEVELS.map(lv => (
      <button
        key={lv.id}
        onClick={() => onSelect(lv.id)}
        style={{
          flex: 1,
          maxWidth: '120px',
          padding: '12px 8px',
          background: selected === lv.id
            ? `linear-gradient(135deg, rgba(${hexToRgb(lv.color)},0.2) 0%, rgba(${hexToRgb(lv.color)},0.05) 100%)`
            : 'rgba(13,18,36,0.6)',
          border: `1.5px solid ${selected === lv.id ? lv.color : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: selected === lv.id ? 'scale(1.05)' : 'scale(1)',
          boxShadow: selected === lv.id
            ? `0 0 16px rgba(${hexToRgb(lv.color)},0.3)`
            : '0 4px 12px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '1rem',
          color: selected === lv.id ? lv.color : 'rgba(200,208,232,0.35)',
          letterSpacing: '1px',
          marginBottom: '4px',
          textShadow: selected === lv.id ? `0 0 12px ${lv.color}` : 'none',
          transition: 'all 0.25s',
        }}>
          {lv.label}
        </div>
        <div style={{
          fontSize: '0.62rem',
          color: selected === lv.id ? `${lv.color}cc` : 'rgba(200,208,232,0.3)',
          letterSpacing: '0.5px',
          marginBottom: '4px',
        }}>
          {lv.name}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
          fontSize: '0.6rem', color: 'rgba(200,208,232,0.3)',
        }}>
          ⏱ {lv.time}s
        </div>
      </button>
    ))}
  </div>
);

/* =====================================================
   RESULT BADGE
   ===================================================== */
const ResultBadge: React.FC<{ correct: boolean; answer: string; correctAnswer: string }> =
  ({ correct, answer, correctAnswer }) => {
    const color = correct ? '#39ff14' : '#ff3b7a';
    const correctOpt = correctAnswer;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '16px 20px',
        background: `rgba(${hexToRgb(color)},0.08)`,
        border: `1.5px solid ${color}`,
        borderRadius: '14px',
        animation: 'fadeInUp 0.3s ease-out',
        boxShadow: `0 0 20px rgba(${hexToRgb(color)},0.2)`,
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 0 16px ${color}`,
        }}>
          {correct ? <IconCheck /> : <IconX />}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1rem',
            color,
            letterSpacing: '1px',
            marginBottom: '2px',
          }}>
            {correct ? '✓ 正确！' : '✗ 错误'}
          </div>
          {!correct && (
            <div style={{ fontSize: '0.8rem', color: 'rgba(200,208,232,0.6)' }}>
              正确答案：{correctOpt} · {correctOpt}
            </div>
          )}
        </div>
      </div>
    );
  };

/* =====================================================
   MAIN COMPONENT
   ===================================================== */
interface PracticeQuestion {
  narrative: string;
  question: string;
  answer: string;
  options: string[];
  explanation?: string;
}

interface PracticeBoardProps { onBack: () => void; }

export const PracticeBoard: React.FC<PracticeBoardProps> = ({ onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [result, setResult] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-apply loading minimum
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!loading) { setShowLoading(false); return; }
    setShowLoading(true);
    setLoadingStartTime(Date.now());
  }, [loading]);

  useEffect(() => {
    if (!loading || !loadingStartTime) return;
    if (showLoading) return;
    const elapsed = Date.now() - loadingStartTime;
    if (elapsed >= 1000) setShowLoading(false);
    else setTimeout(() => setShowLoading(false), 1000 - elapsed);
  }, [loading, loadingStartTime, showLoading]);

  const handleStart = async () => {
    if (!selectedSubject || !selectedLevel) return;
    setLoading(true);
    setResult(null);
    setAnswer('');
    try {
      const res = await fetch('http://localhost:3001/api/practice-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedSubject, level: selectedLevel }),
      });
      const data = await res.json();
      setQuestion(data.question);
    } catch {
      alert('获取题目失败，请重试');
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!answer || !question) return;
    setResult({ correct: answer === question.answer, correctAnswer: question.answer });
  };

  const handleNext = () => {
    setQuestion(null);
    setAnswer('');
    setResult(null);
  };

  const selectedSubjectData = SUBJECTS.find(s => s.id === selectedSubject);
  const selectedLevelData = LEVELS.find(l => l.id === selectedLevel);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #060912 0%, #0a0f1e 100%)',
      padding: '0 20px 40px',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        padding: '20px 0 24px',
        borderBottom: '1px solid rgba(192,132,252,0.1)',
        marginBottom: '32px',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(192,132,252,0.08)',
            border: '1px solid rgba(192,132,252,0.2)',
            borderRadius: '10px',
            padding: '8px 14px',
            color: 'var(--neon-purple)',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '1px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon-purple)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(192,132,252,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(192,132,252,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <IconArrow /> 返回
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(192,132,252,0.15)',
            border: '1px solid rgba(192,132,252,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--neon-purple)',
            fontSize: '1rem',
          }}>
            ⚡
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: 'var(--neon-purple)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}>
              练习模式
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(200,208,232,0.4)', letterSpacing: '0.5px' }}>
              自由出题 · 无压力练习
            </div>
          </div>
        </div>

        {/* Current selection pill */}
        {selectedSubjectData && (
          <div style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px',
            background: `rgba(${hexToRgb(selectedSubjectData.color)},0.1)`,
            border: `1px solid rgba(${hexToRgb(selectedSubjectData.color)},0.3)`,
            borderRadius: '20px',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-display)',
            color: selectedSubjectData.color,
            letterSpacing: '1px',
          }}>
            {selectedSubjectData.name}
            {selectedLevelData && ` · ${selectedLevelData.name}`}
          </div>
        )}
      </div>

      {/* ── Question Area ── */}
      {question ? (
        <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeInUp 0.35s ease-out' }}>
          {/* Narrative tag */}
          {question.narrative && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px',
              background: 'rgba(255,59,122,0.1)',
              border: '1px solid rgba(255,59,122,0.3)',
              borderRadius: '20px',
              fontSize: '0.7rem',
              color: '#ff3b7a',
              letterSpacing: '1px',
              marginBottom: '16px',
            }}>
              <IconSpark /> {question.narrative}
            </div>
          )}

          {/* Question panel */}
          <div style={{
            background: 'rgba(13,18,36,0.8)',
            border: '1.5px solid rgba(0,245,255,0.2)',
            borderRadius: '20px',
            padding: '28px 28px 24px',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            marginBottom: '20px',
          }}>
            <div style={{
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#e8eaf0',
              lineHeight: 1.7,
              letterSpacing: '0.3px',
              marginBottom: '24px',
            }}>
              {question.question}
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {question.options.map((opt, idx) => {
                const letter = OPTION_LETTERS[idx];
                const isSelected = answer === letter;
                const isCorrectAnswer = question.answer === letter;
                const showCorrect = result && isCorrectAnswer;
                const showWrong = result && isSelected && !result.correct;

                let borderColor = 'rgba(192,132,252,0.15)';
                let bg = 'rgba(192,132,252,0.04)';
                let textColor = 'rgba(200,208,232,0.7)';
                let labelBg = 'transparent';
                let labelColor = 'rgba(200,208,232,0.4)';

                if (showCorrect) {
                  borderColor = '#39ff14'; bg = 'rgba(57,255,20,0.1)'; textColor = '#39ff14';
                  labelBg = '#39ff14'; labelColor = '#060912';
                } else if (showWrong) {
                  borderColor = '#ff3b7a'; bg = 'rgba(255,59,122,0.1)'; textColor = '#ff3b7a';
                  labelBg = '#ff3b7a'; labelColor = '#060912';
                } else if (isSelected) {
                  borderColor = 'var(--neon-purple)'; bg = 'rgba(192,132,252,0.12)'; textColor = 'var(--neon-purple)';
                  labelBg = 'var(--neon-purple)'; labelColor = '#060912';
                }

                return (
                  <button
                    key={letter}
                    onClick={() => !result && setAnswer(letter)}
                    disabled={!!result}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '13px 14px',
                      background: bg,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '12px',
                      cursor: result ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected && !result ? '0 0 12px rgba(192,132,252,0.25)' : 'none',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      border: `2px solid ${labelBg}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem',
                      flexShrink: 0,
                      background: labelBg,
                      color: labelColor,
                      transition: 'all 0.2s',
                    }}>
                      {letter}
                    </span>
                    <span style={{ fontSize: '0.88rem', lineHeight: 1.4, color: textColor }}>
                      {opt.substring(2).trim()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {result?.correct && question.explanation && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(0,245,255,0.06)',
                border: '1px solid rgba(0,245,255,0.2)',
                borderRadius: '10px',
                marginBottom: '16px',
                animation: 'fadeInUp 0.3s ease-out',
              }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)', letterSpacing: '2px', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>💡 解析</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(200,208,232,0.7)', lineHeight: 1.6 }}>{question.explanation}</div>
              </div>
            )}

            {/* Action row */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {!result ? (
                <button
                  className="btn-cyber"
                  onClick={handleSubmit}
                  disabled={!answer}
                  style={{ flex: 1, opacity: answer ? 1 : 0.4, cursor: answer ? 'pointer' : 'not-allowed', fontSize: '0.9rem', padding: '13px' }}
                >
                  确认 {answer ? `(${answer})` : ''}
                </button>
              ) : (
                <button
                  className="btn-cyber"
                  onClick={handleNext}
                  style={{ flex: 1, fontSize: '0.9rem', padding: '13px' }}
                >
                  下一题 →
                </button>
              )}
            </div>
          </div>

          {/* Result badge */}
          {result && (
            <div style={{ marginBottom: '20px' }}>
              <ResultBadge correct={result.correct} answer={answer} correctAnswer={result.correctAnswer} />
            </div>
          )}
        </div>
      ) : showLoading ? (
        /* Loading */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '24px' }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="24" stroke="rgba(192,132,252,0.15)" strokeWidth="3"/>
            <path d="M28 4A24 24 0 0 1 52 28" stroke="var(--neon-purple)" strokeWidth="3" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 28 28" to="360 28 28" dur="0.8s" repeatCount="indefinite"/>
            </path>
          </svg>
          <div style={{ color: 'var(--neon-purple)', fontFamily: 'var(--font-display)', fontSize: '0.85rem', letterSpacing: '3px' }}>
            AI 出题中...
          </div>
        </div>
      ) : (
        /* Subject & Level selection */
        <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeInUp 0.35s ease-out' }}>
          {/* Section: Subject */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '16px',
            }}>
              <div style={{ width: '3px', height: '16px', background: 'var(--neon-cyan)', borderRadius: '2px' }} />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '3px',
                color: 'var(--neon-cyan)',
                textTransform: 'uppercase',
              }}>
                选择学科
              </span>
              {selectedSubjectData && (
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: `${selectedSubjectData.color}cc`, fontFamily: 'var(--font-display)' }}>
                  {selectedSubjectData.name}
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {SUBJECTS.map(s => (
                <SubjectPill
                  key={s.id}
                  subject={s}
                  selected={selectedSubject === s.id}
                  onClick={() => setSelectedSubject(prev => prev === s.id ? null : s.id)}
                />
              ))}
            </div>
          </div>

          {/* Section: Level */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '3px', height: '16px', background: 'var(--neon-yellow)', borderRadius: '2px' }} />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '3px',
                color: 'var(--neon-yellow)',
                textTransform: 'uppercase',
              }}>
                选择难度
              </span>
              {selectedLevelData && (
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: `${selectedLevelData.color}cc`, fontFamily: 'var(--font-display)' }}>
                  {selectedLevelData.name} · {selectedLevelData.time}s
                </span>
              )}
            </div>
            <LevelSelector selected={selectedLevel} onSelect={id => setSelectedLevel(prev => prev === id ? null : id)} />
          </div>

          {/* Start button */}
          <button
            className="btn-cyber"
            onClick={handleStart}
            disabled={!selectedSubject || !selectedLevel || loading}
            style={{
              width: '100%',
              opacity: selectedSubject && selectedLevel ? 1 : 0.35,
              cursor: selectedSubject && selectedLevel ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
              padding: '16px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '3px',
              borderRadius: '14px',
              transition: 'all 0.25s',
              boxShadow: selectedSubject && selectedLevel
                ? '0 0 20px rgba(192,132,252,0.3), 0 8px 24px rgba(0,0,0,0.4)'
                : 'none',
            }}
          >
            ⚡ 开始练习
          </button>
        </div>
      )}
    </div>
  );
};

/* =====================================================
   UTILITY
   ===================================================== */
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

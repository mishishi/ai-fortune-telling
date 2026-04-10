import React, { useState, useEffect, useRef } from 'react';
import { Card } from './Card';
import { SUBJECT_ICONS } from './Icons';

/* =====================================================
   SAME CARD DATA AS Hand.tsx (reused for consistency)
   ===================================================== */
const SUBJECT_CARDS = [
  { id: 'sub_yuwen',    name: '语文',   color: '#00e5e5' },
  { id: 'sub_math',     name: '数学',   color: '#00c9a7' },
  { id: 'sub_english',  name: '英语',   color: '#7bed9f' },
  { id: 'sub_science',  name: '科学',   color: '#ffd93d' },
  { id: 'sub_history',  name: '历史',   color: '#c97bff' },
  { id: 'sub_geography',name: '地理',   color: '#74b9ff' },
  { id: 'sub_biology',  name: '生物',   color: '#55efc4' },
  { id: 'sub_daofa',    name: '道法',   color: '#fd79a8' },
];

const LEVEL_CARDS = [
  { id: 'lv_1', name: 'Lv1', timeLimit: 15 },
  { id: 'lv_2', name: 'Lv2', timeLimit: 25 },
  { id: 'lv_3', name: 'Lv3', timeLimit: 35 },
  { id: 'lv_4', name: 'Lv4', timeLimit: 45 },
];

/* =====================================================
   ICONS
   ===================================================== */
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/* =====================================================
   RESULT BADGE
   ===================================================== */
const ResultBadge: React.FC<{ correct: boolean; correctAnswer: string }> =
  ({ correct, correctAnswer }) => {
    const color = correct ? '#39ff14' : '#ff3b7a';
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 18px',
        background: `rgba(${hexToRgb(color)},0.08)`,
        border: `1.5px solid ${color}`,
        borderRadius: '14px',
        animation: 'fadeInUp 0.3s ease-out',
        boxShadow: `0 0 20px rgba(${hexToRgb(color)},0.2)`,
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: `0 0 14px ${color}`,
        }}>
          {correct ? <IconCheck /> : <IconX />}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '0.95rem', color, letterSpacing: '1px',
          }}>
            {correct ? '✓ 正确！' : '✗ 错误'}
          </div>
          {!correct && (
            <div style={{ fontSize: '0.78rem', color: 'rgba(200,208,232,0.55)', marginTop: '2px' }}>
              正确答案：{correctAnswer}
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
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) {
      setShowLoading(true);
    } else {
      if (loadingTimerRef.current) { clearTimeout(loadingTimerRef.current); loadingTimerRef.current = null; }
      setShowLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    if (!showLoading) return;
    if (loadingTimerRef.current) { clearTimeout(loadingTimerRef.current); loadingTimerRef.current = null; }
    loadingTimerRef.current = setTimeout(() => setShowLoading(false), 1000);
    return () => { if (loadingTimerRef.current) { clearTimeout(loadingTimerRef.current); loadingTimerRef.current = null; } };
  }, [showLoading]);

  const handleStart = async () => {
    if (!selectedSubject || !selectedLevel) return;
    setLoading(true);
    setResult(null);
    setAnswer('');
    try {
      const res = await fetch('http://localhost:3001/api/practice-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: SUBJECT_CARDS.find(s => s.id === selectedSubject)?.name,
          level: LEVEL_CARDS.find(l => l.id === selectedLevel)?.name,
        }),
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

  const selectedSubjectData = SUBJECT_CARDS.find(s => s.id === selectedSubject);
  const selectedLevelData = LEVEL_CARDS.find(l => l.id === selectedLevel);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #060912 0%, #0a0f1e 100%)',
      padding: '0 20px 40px',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '20px 0 20px',
        borderBottom: '1px solid rgba(0,245,255,0.08)',
        marginBottom: '28px',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.2)',
            borderRadius: '10px', padding: '8px 14px',
            color: 'var(--neon-cyan)', cursor: 'pointer',
            fontSize: '0.78rem', fontFamily: 'var(--font-display)', letterSpacing: '1px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon-cyan)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(0,245,255,0.25)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,245,255,0.2)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <IconArrow /> 返回
        </button>

        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '0.9rem', color: 'var(--neon-purple)', letterSpacing: '3px', textTransform: 'uppercase',
          }}>
            练习模式
          </div>
          <div style={{ fontSize: '0.62rem', color: 'rgba(200,208,232,0.35)', letterSpacing: '0.5px' }}>
            自由出题 · 无压力练习
          </div>
        </div>

        {selectedSubjectData && (
          <div style={{
            marginLeft: 'auto',
            padding: '5px 12px',
            background: `rgba(${hexToRgb(selectedSubjectData.color)},0.1)`,
            border: `1px solid rgba(${hexToRgb(selectedSubjectData.color)},0.3)`,
            borderRadius: '20px',
            fontSize: '0.68rem', fontFamily: 'var(--font-display)',
            color: selectedSubjectData.color, letterSpacing: '1px',
          }}>
            {selectedSubjectData.name}{selectedLevelData ? ` · ${selectedLevelData.name}` : ''}
          </div>
        )}
      </div>

      {/* ── Question area ── */}
      {question ? (
        <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeInUp 0.35s ease-out' }}>

          {/* Narrative */}
          {question.narrative && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '3px 10px',
              background: 'rgba(255,59,122,0.08)',
              border: '1px solid rgba(255,59,122,0.25)',
              borderRadius: '20px',
              fontSize: '0.68rem', color: '#ff3b7a', letterSpacing: '0.5px',
              marginBottom: '14px',
            }}>
              ⚡ {question.narrative}
            </div>
          )}

          {/* Question panel */}
          <div style={{
            background: 'rgba(10,15,30,0.85)',
            border: '1.5px solid rgba(0,245,255,0.18)',
            borderRadius: '18px',
            padding: '26px 26px 22px',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
            marginBottom: '18px',
          }}>
            <div style={{
              fontSize: '1.1rem', fontWeight: 600, color: '#e8eaf0',
              lineHeight: 1.7, marginBottom: '22px',
            }}>
              {question.question}
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              {question.options.map((opt, idx) => {
                const letter = OPTION_LETTERS[idx];
                const isSelected = answer === letter;
                const isCorrectAnswer = question.answer === letter;
                const showCorrect = result && isCorrectAnswer;
                const showWrong = result && isSelected && !result.correct;

                let borderColor = 'rgba(192,132,252,0.12)';
                let bg = 'rgba(192,132,252,0.04)';
                let textColor = 'rgba(200,208,232,0.65)';
                let labelBg = 'transparent';
                let labelColor = 'rgba(200,208,232,0.35)';

                if (showCorrect) {
                  borderColor = '#39ff14'; bg = 'rgba(57,255,20,0.08)'; textColor = '#39ff14';
                  labelBg = '#39ff14'; labelColor = '#060912';
                } else if (showWrong) {
                  borderColor = '#ff3b7a'; bg = 'rgba(255,59,122,0.08)'; textColor = '#ff3b7a';
                  labelBg = '#ff3b7a'; labelColor = '#060912';
                } else if (isSelected) {
                  borderColor = 'var(--neon-purple)'; bg = 'rgba(192,132,252,0.1)'; textColor = 'var(--neon-purple)';
                  labelBg = 'var(--neon-purple)'; labelColor = '#060912';
                }

                return (
                  <button
                    key={letter}
                    onClick={() => !result && setAnswer(letter)}
                    disabled={!!result}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '12px 14px',
                      background: bg,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '10px',
                      cursor: result ? 'default' : 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected && !result ? '0 0 12px rgba(192,132,252,0.25)' : 'none',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      border: `2px solid ${labelBg}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem',
                      flexShrink: 0, background: labelBg, color: labelColor,
                      transition: 'all 0.18s',
                    }}>
                      {letter}
                    </span>
                    <span style={{ fontSize: '0.86rem', lineHeight: 1.4, color: textColor }}>
                      {opt.substring(2).trim()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {result?.correct && question.explanation && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(0,245,255,0.05)',
                border: '1px solid rgba(0,245,255,0.18)',
                borderRadius: '10px', marginBottom: '14px',
                animation: 'fadeInUp 0.25s ease-out',
              }}>
                <div style={{ fontSize: '0.62rem', color: 'var(--neon-cyan)', letterSpacing: '2px', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>💡 解析</div>
                <div style={{ fontSize: '0.83rem', color: 'rgba(200,208,232,0.65)', lineHeight: 1.6 }}>{question.explanation}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {!result ? (
                <button
                  className="btn-cyber"
                  onClick={handleSubmit}
                  disabled={!answer}
                  style={{ flex: 1, opacity: answer ? 1 : 0.35, cursor: answer ? 'pointer' : 'not-allowed', fontSize: '0.88rem', padding: '12px' }}
                >
                  确认 {answer ? `(${answer})` : ''}
                </button>
              ) : (
                <button className="btn-cyber" onClick={handleNext} style={{ flex: 1, fontSize: '0.88rem', padding: '12px' }}>
                  下一题 →
                </button>
              )}
            </div>
          </div>

          {result && (
            <ResultBadge correct={result.correct} correctAnswer={result.correctAnswer} />
          )}
        </div>
      ) : showLoading ? (
        /* Loading */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '20px' }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="22" stroke="rgba(192,132,252,0.12)" strokeWidth="3"/>
            <path d="M26 4A22 22 0 0 1 48 26" stroke="var(--neon-purple)" strokeWidth="3" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 26 26" to="360 26 26" dur="0.8s" repeatCount="indefinite"/>
            </path>
          </svg>
          <div style={{ color: 'var(--neon-purple)', fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '3px' }}>
            AI 出题中...
          </div>
        </div>
      ) : (
        /* Subject + Level selection */
        <div style={{ maxWidth: '680px', margin: '0 auto', animation: 'fadeInUp 0.35s ease-out' }}>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '3px', height: '15px', background: 'var(--neon-cyan)', borderRadius: '2px' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '3px', color: 'var(--neon-cyan)', textTransform: 'uppercase' }}>
              选择学科
            </span>
          </div>

          {/* Subject cards — use SAME Card component as PvP */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '28px' }}>
            {SUBJECT_CARDS.map(card => (
              <Card
                key={card.id}
                type="subject"
                name={card.name}
                color={card.color}
                icon=""
                subjectId={card.id}
                selected={selectedSubject === card.id}
                onClick={() => setSelectedSubject(prev => prev === card.id ? null : card.id)}
              />
            ))}
          </div>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '3px', height: '15px', background: 'var(--neon-yellow)', borderRadius: '2px' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '3px', color: 'var(--neon-yellow)', textTransform: 'uppercase' }}>
              选择难度
            </span>
          </div>

          {/* Level cards — use SAME Card component as PvP */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
            {LEVEL_CARDS.map(card => (
              <Card
                key={card.id}
                type="level"
                name={card.name}
                color="var(--neon-yellow)"
                icon=""
                selected={selectedLevel === card.id}
                onClick={() => setSelectedLevel(prev => prev === card.id ? null : card.id)}
                timeLimit={card.timeLimit}
              />
            ))}
          </div>

          {/* Start button */}
          <button
            className="btn-cyber"
            onClick={handleStart}
            disabled={!selectedSubject || !selectedLevel || loading}
            style={{
              width: '100%',
              opacity: selectedSubject && selectedLevel ? 1 : 0.3,
              cursor: selectedSubject && selectedLevel ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
              padding: '14px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '3px',
              borderRadius: '14px',
              transition: 'all 0.25s',
              boxShadow: selectedSubject && selectedLevel ? '0 0 20px rgba(192,132,252,0.28), 0 8px 24px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            ⚡ 开始练习
          </button>
        </div>
      )}
    </div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

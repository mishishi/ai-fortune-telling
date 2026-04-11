import React, { useState, useRef } from 'react';
import { Card } from './Card';
import { LoadingAI } from './LoadingAI';

/* =====================================================
   ICONS
   ===================================================== */
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const NavHeader: React.FC<{
  title: string;
  subtitle: string;
  onBack?: () => void;
}> = ({ title, subtitle, onBack }) => (
  <div className="nav-header">
    {onBack && (
      <button className="btn-ghost" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <IconArrow />
        <span>返回</span>
      </button>
    )}
    <div>
      <div className="nav-title" style={{ color: 'var(--neon-purple)' }}>{title}</div>
      <div className="nav-subtitle">{subtitle}</div>
    </div>
  </div>
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

/* =====================================================
   CARD DATA
   ===================================================== */
const SUBJECT_CARDS = [
  { id: 'sub_yuwen',    name: '语文',   color: '#00e5e5' },
  { id: 'sub_math',     name: '数学',   color: '#00c9a7' },
  { id: 'sub_english',  name: '英语',   color: '#7bed9f' },
  { id: 'sub_science',  name: '科学',   color: '#ffd93d' },
  { id: 'sub_history',  name: '历史',   color: '#c97bff' },
  { id: 'sub_geography',name: '地理',   color: '#74b9ff' },
  { id: 'sub_biology',  name: '生物',   color: '#55efc4' },
  { id: 'sub_daofa',   name: '道法',   color: '#fd79a8' },
];

const LEVEL_CARDS = [
  { id: 'lv_1', name: 'Lv1', timeLimit: 15 },
  { id: 'lv_2', name: 'Lv2', timeLimit: 25 },
  { id: 'lv_3', name: 'Lv3', timeLimit: 35 },
  { id: 'lv_4', name: 'Lv4', timeLimit: 45 },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/* =====================================================
   RESULT BADGE
   ===================================================== */
const ResultBadge: React.FC<{ correct: boolean; correctAnswer: string }> = ({ correct, correctAnswer }) => {
  const color = correct ? 'var(--neon-green)' : 'var(--neon-pink)';
  return (
    <div className="animate-fade-in-up" style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '14px 18px',
      background: `${color}10`,
      border: `1px solid ${color}40`,
      borderRadius: '12px',
      marginTop: '16px',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: '#060912',
      }}>
        {correct ? <IconCheck /> : <IconX />}
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '0.9rem', color, letterSpacing: '1px',
        }}>
          {correct ? '正确' : '错误'}
        </div>
        {!correct && (
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
            正确答案：{correctAnswer}
          </div>
        )}
      </div>
    </div>
  );
};

/* =====================================================
   SECTION LABEL
   ===================================================== */
const SectionLabel: React.FC<{ color: string; text: string }> = ({ color, text }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
    <div style={{ width: '3px', height: '14px', background: color, borderRadius: '2px' }} />
    <span style={{
      color, fontSize: '0.72rem', fontWeight: 600,
      fontFamily: 'var(--font-display)', letterSpacing: '2px', textTransform: 'uppercase'
    }}>
      {text}
    </span>
  </div>
);

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
  const loadingStartRef = useRef<number | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startLoading = () => {
    if (loadingTimerRef.current) { clearTimeout(loadingTimerRef.current); loadingTimerRef.current = null; }
    loadingStartRef.current = Date.now();
    setShowLoading(true);
  };

  const finishLoading = () => {
    if (!loadingStartRef.current) { setShowLoading(false); return; }
    const elapsed = Date.now() - loadingStartRef.current;
    if (elapsed >= 1000) {
      setShowLoading(false);
      loadingStartRef.current = null;
    } else {
      loadingTimerRef.current = setTimeout(() => {
        setShowLoading(false);
        loadingStartRef.current = null;
      }, 1000 - elapsed);
    }
  };

  const handleStart = async () => {
    if (!selectedSubject || !selectedLevel) return;
    setLoading(true);
    setResult(null);
    setAnswer('');
    startLoading();
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
    finishLoading();
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
    <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <NavHeader
          title="练习模式"
          subtitle="自由出题 · 无压力练习"
          onBack={onBack}
        />
        {selectedSubjectData && (
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            padding: '4px 12px',
            background: `${selectedSubjectData.color}15`,
            border: `1px solid ${selectedSubjectData.color}40`,
            borderRadius: '20px',
            fontSize: '0.68rem', fontFamily: 'var(--font-display)',
            color: selectedSubjectData.color, letterSpacing: '0.5px',
            marginTop: '-16px', marginBottom: '24px',
          }}>
            {selectedSubjectData.name}{selectedLevelData ? ` · ${selectedLevelData.name}` : ''}
          </div>
        )}

        {/* Question area */}
        {question ? (
          <div className="animate-fade-in-up">
            {/* Narrative */}
            {question.narrative && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px',
                background: 'rgba(255,45,149,0.08)',
                border: '1px solid rgba(255,45,149,0.2)',
                borderRadius: '20px',
                fontSize: '0.68rem', color: 'var(--neon-pink)',
                marginBottom: '16px',
              }}>
                ⚡ {question.narrative}
              </div>
            )}

            {/* Question card */}
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
              <div style={{
                fontSize: '1.05rem', fontWeight: 600, color: '#e8ecf4',
                lineHeight: 1.6, marginBottom: '20px',
              }}>
                {question.question}
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {question.options.map((opt, idx) => {
                  const letter = OPTION_LETTERS[idx];
                  const isSelected = answer === letter;
                  const isCorrectAnswer = question.answer === letter;
                  const showCorrect = result && isCorrectAnswer;
                  const showWrong = result && isSelected && !result.correct;

                  let borderColor = 'rgba(255,255,255,0.08)';
                  let bg = 'rgba(255,255,255,0.02)';
                  let textColor = 'rgba(255,255,255,0.5)';
                  let labelBg = 'transparent';
                  let labelColor = 'rgba(255,255,255,0.3)';

                  if (showCorrect) {
                    borderColor = 'var(--neon-green)'; bg = 'rgba(0,255,136,0.08)'; textColor = 'var(--neon-green)';
                    labelBg = 'var(--neon-green)'; labelColor = '#060912';
                  } else if (showWrong) {
                    borderColor = 'var(--neon-pink)'; bg = 'rgba(255,45,149,0.08)'; textColor = 'var(--neon-pink)';
                    labelBg = 'var(--neon-pink)'; labelColor = '#060912';
                  } else if (isSelected) {
                    borderColor = 'var(--neon-purple)'; bg = 'rgba(184,127,255,0.08)'; textColor = 'var(--neon-purple)';
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
                        background: bg, border: `2px solid ${borderColor}`,
                        borderRadius: '10px', cursor: result ? 'default' : 'pointer',
                        transition: 'all 0.2s', textAlign: 'left',
                      }}
                    >
                      <span style={{
                        width: '26px', height: '26px', borderRadius: '50%',
                        border: `2px solid ${labelBg}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem',
                        flexShrink: 0, background: labelBg, color: labelColor,
                      }}>
                        {letter}
                      </span>
                      <span style={{ fontSize: '0.85rem', lineHeight: 1.4, color: textColor }}>
                        {opt.substring(2).trim()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {result?.correct && question.explanation && (
                <div className="hint-display" style={{ marginBottom: '14px' }}>
                  <div style={{
                    color: 'var(--neon-cyan)', fontSize: '0.65rem',
                    fontFamily: 'var(--font-display)', letterSpacing: '1px',
                    textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600,
                  }}>
                    解析
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    {question.explanation}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {!result ? (
                  <button
                    className="btn-cyber"
                    onClick={handleSubmit}
                    disabled={!answer}
                    style={{ flex: 1, opacity: answer ? 1 : 0.4 }}
                  >
                    确认 {answer ? `(${answer})` : ''}
                  </button>
                ) : (
                  <button className="btn-cyber" onClick={handleNext} style={{ flex: 1 }}>
                    下一题 →
                  </button>
                )}
              </div>
            </div>

            {result && <ResultBadge correct={result.correct} correctAnswer={result.correctAnswer} />}
          </div>
        ) : showLoading ? (
          <LoadingAI title="AI 出题中..." subtitle="正在生成题目，请稍候..." color="#b87fff" />
        ) : (
          /* Selection */
          <div className="animate-fade-in-up">
            {/* Subject */}
            <div style={{ marginBottom: '28px' }}>
              <SectionLabel color="var(--neon-cyan)" text="选择学科" />
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
            </div>

            {/* Level */}
            <div style={{ marginBottom: '32px' }}>
              <SectionLabel color="var(--neon-yellow)" text="选择难度" />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {LEVEL_CARDS.map(card => (
                  <Card
                    key={card.id}
                    type="level"
                    name={card.name}
                    color="var(--neon-yellow)"
                    icon=""
                    levelId={card.id}
                    selected={selectedLevel === card.id}
                    onClick={() => setSelectedLevel(prev => prev === card.id ? null : card.id)}
                    timeLimit={card.timeLimit}
                  />
                ))}
              </div>
            </div>

            {/* Start button */}
            <button
              className="btn-cyber"
              onClick={handleStart}
              disabled={!selectedSubject || !selectedLevel || loading}
              style={{
                width: '100%', padding: '14px',
                opacity: selectedSubject && selectedLevel ? 1 : 0.35,
                cursor: selectedSubject && selectedLevel ? 'pointer' : 'not-allowed',
                fontSize: '0.9rem', letterSpacing: '2px',
              }}
            >
              ⚡ 开始练习
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

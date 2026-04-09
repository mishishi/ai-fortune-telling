import React, { useState } from 'react';
import { Card } from './Card';
import { SUBJECT_ICONS } from './Icons';

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

interface PracticeQuestion {
  narrative: string;
  question: string;
  answer: string;
  options: string[];
}

interface PracticeBoardProps {
  onBack: () => void;
}

const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export const PracticeBoard: React.FC<PracticeBoardProps> = ({ onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!selectedSubject || !selectedLevel) return;
    setLoading(true);
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
      setAnswer('');
      setResult(null);
    } catch (e) {
      console.error(e);
      setLoading(false);
      alert('获取题目失败，请重试');
      return;
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (!answer || !question) return;
    const isCorrect = answer === question.answer;
    setResult(isCorrect ? 'correct' : 'wrong');
  };

  const correctOptionText = () => {
    if (!question) return '';
    const opt = question.options.find(o => o.startsWith(question.answer + '.'));
    return opt ? opt.substring(2).trim() : '';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <button
        className="btn-cyber"
        onClick={onBack}
        style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        <IconArrow /> 返回
      </button>

      <h2 style={{
        color: 'var(--neon-purple)',
        fontFamily: 'var(--font-display)',
        fontSize: '1rem',
        fontWeight: 700,
        letterSpacing: '2px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ width: 20, height: 20, display: 'flex', color: 'var(--neon-purple)' }}><IconBook /></span>
        练习模式
      </h2>

      {!question ? (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div className="label" style={{ color: 'var(--neon-cyan)', marginBottom: '12px', display: 'block' }}>选择学科</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {SUBJECT_CARDS.map(card => (
                <Card
                  key={card.id}
                  type="subject"
                  name={card.name}
                  color={card.color}
                  icon=""
                  subjectId={card.id}
                  selected={selectedSubject === card.id}
                  onClick={() => setSelectedSubject(card.id)}
                />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div className="label" style={{ color: 'var(--neon-yellow)', marginBottom: '12px', display: 'block' }}>选择难度</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {LEVEL_CARDS.map(card => (
                <Card
                  key={card.id}
                  type="level"
                  name={card.name}
                  color="var(--neon-yellow)"
                  icon=""
                  selected={selectedLevel === card.id}
                  onClick={() => setSelectedLevel(card.id)}
                  timeLimit={card.timeLimit}
                />
              ))}
            </div>
          </div>
          <button
            className="btn-cyber"
            onClick={handleStart}
            disabled={!selectedSubject || !selectedLevel || loading}
          >
            {loading ? '生成中...' : '开始练习'}
          </button>
        </>
      ) : (
        <div className="question-panel">
          <div style={{
            color: 'var(--neon-pink)',
            fontSize: '0.8rem',
            marginBottom: '12px',
            fontFamily: 'var(--font-display)',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            ⚡ {question.narrative}
          </div>

          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', color: '#fff', lineHeight: 1.6 }}>
            {question.question}
          </div>

          {result ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: result === 'correct' ? 'var(--neon-green)' : 'var(--neon-pink)',
                fontSize: '1.05rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
              }}>
                <span style={{ width: 18, height: 18, display: 'flex', color: 'inherit' }}>
                  {result === 'correct' ? <IconCheck /> : <IconX />}
                </span>
                {result === 'correct'
                  ? '回答正确！'
                  : `错误！正确答案：${question.answer} — ${correctOptionText()}`}
              </div>
              <button
                className="btn-cyber"
                onClick={() => { setQuestion(null); setAnswer(''); setResult(null); }}
              >
                下一题
              </button>
            </div>
          ) : (
            <div>
              {/* Multiple choice options */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {question.options.map((opt, idx) => {
                  const letter = OPTION_LETTERS[idx];
                  const isSelected = answer === letter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setAnswer(letter)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 14px',
                        background: isSelected ? 'rgba(192,132,252,0.15)' : 'rgba(192,132,252,0.05)',
                        border: `2px solid ${isSelected ? 'var(--neon-purple)' : 'rgba(192,132,252,0.2)'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left',
                        color: isSelected ? 'var(--neon-purple)' : '#c8d0e8',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.9rem',
                        boxShadow: isSelected ? '0 0 12px rgba(192,132,252,0.3)' : 'none',
                      }}
                    >
                      <span style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        border: `2px solid ${isSelected ? 'var(--neon-purple)' : 'rgba(192,132,252,0.3)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.75rem',
                        flexShrink: 0,
                        background: isSelected ? 'var(--neon-purple)' : 'transparent',
                        color: isSelected ? '#060912' : 'inherit',
                        transition: 'all 0.15s ease',
                      }}>{letter}</span>
                      <span style={{ lineHeight: 1.4 }}>{opt.substring(2).trim()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Confirm button */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-cyber"
                  onClick={handleSubmit}
                  disabled={!answer}
                  style={{
                    opacity: answer ? 1 : 0.4,
                    cursor: answer ? 'pointer' : 'not-allowed',
                    flex: 1,
                  }}
                >
                  确认{answer ? ` (${answer})` : ''}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

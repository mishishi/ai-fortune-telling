import React, { useState } from 'react';
import { Card } from './Card';

const SUBJECT_CARDS = [
  { id: 'sub_yuwen',    name: '语文',   color: '#ff6b6b', icon: '📜' },
  { id: 'sub_math',     name: '数学',   color: '#4ecdc4', icon: '📐' },
  { id: 'sub_english',  name: '英语',   color: '#a8e6cf', icon: '🔤' },
  { id: 'sub_science',  name: '科学',   color: '#f7dc6f', icon: '🔬' },
  { id: 'sub_history',  name: '历史',   color: '#bb8fce', icon: '📚' },
  { id: 'sub_geography',name: '地理',   color: '#86b3d1', icon: '🌍' },
  { id: 'sub_biology',  name: '生物',   color: '#82e0aa', icon: '🧬' },
  { id: 'sub_daofa',    name: '道法',   color: '#f1948a', icon: '⚖️'  },
];

const LEVEL_CARDS = [
  { id: 'lv_1', name: 'Lv1', timeLimit: 15 },
  { id: 'lv_2', name: 'Lv2', timeLimit: 25 },
  { id: 'lv_3', name: 'Lv3', timeLimit: 35 },
  { id: 'lv_4', name: 'Lv4', timeLimit: 45 },
];

interface PracticeBoardProps {
  onBack: () => void;
}

export const PracticeBoard: React.FC<PracticeBoardProps> = ({ onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [question, setQuestion] = useState<any>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !question) return;
    // Simple answer comparison
    const isCorrect = answer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    setResult(isCorrect ? 'correct' : 'wrong');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <button
        className="btn-cyber"
        onClick={onBack}
        style={{ marginBottom: '20px' }}
      >
        ← 返回
      </button>

      <h2 style={{ color: 'var(--neon-cyan)', marginBottom: '20px' }}>📖 练习模式</h2>

      {!question ? (
        <>
          <div style={{ marginBottom: '16px' }}>
            <div className="label" style={{ color: 'var(--neon-cyan)', marginBottom: '8px' }}>选择学科</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {SUBJECT_CARDS.map(card => (
                <Card
                  key={card.id}
                  type="subject"
                  name={card.name}
                  color={card.color}
                  icon={card.icon}
                  selected={selectedSubject === card.id}
                  onClick={() => setSelectedSubject(card.id)}
                />
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div className="label" style={{ color: 'var(--neon-yellow)', marginBottom: '8px' }}>选择难度</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {LEVEL_CARDS.map(card => (
                <Card
                  key={card.id}
                  type="level"
                  name={card.name}
                  color="var(--neon-yellow)"
                  icon="⚡"
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
          <div style={{ color: 'var(--neon-pink)', fontSize: '0.85rem', marginBottom: '12px' }}>
            ⚡ {question.narrative}
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>
            {question.question}
          </div>
          {result ? (
            <div style={{ color: result === 'correct' ? 'var(--neon-green)' : 'var(--neon-pink)', fontSize: '1.2rem' }}>
              {result === 'correct' ? '✅ 回答正确！' : `❌ 回答错误！正确答案是：${question.answer}`}
              <button
                className="btn-cyber"
                onClick={() => { setQuestion(null); setAnswer(''); setResult(null); }}
                style={{ marginLeft: '16px' }}
              >
                下一题
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="输入答案..."
                style={{
                  flex: 1,
                  background: 'rgba(0,245,255,0.1)',
                  border: '2px solid var(--neon-cyan)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  outline: 'none',
                }}
                autoFocus
              />
              <button type="submit" className="btn-cyber">提交</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

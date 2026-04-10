import React, { useState, useCallback } from 'react';
import { useGameSocket } from '../hooks/useGameSocket';
import { Card } from './Card';
import { SeasonPanel } from './SeasonPanel';

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

interface TurnAnswer {
  subjectId: string;
  levelId: string;
  questionId: string;
  answer: string;
  timeUsed?: number;
}

export const AsyncGameBoard: React.FC = () => {
  const {
    startAsyncGame,
    submitAsyncTurn,
    asyncRoom,
    lastAiResult,
    lastXpGain,
    tierUp,
    asyncGameOver,
    seasonState,
  } = useGameSocket();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [turnAnswers, setTurnAnswers] = useState<TurnAnswer[]>([]);
  const [turnStartTime, setTurnStartTime] = useState<number | null>(null);
  const [showingResult, setShowingResult] = useState(false);

  const handleStartGame = useCallback(() => {
    startAsyncGame(3);
    setTurnAnswers([]);
    setShowingResult(false);
  }, [startAsyncGame]);

  const handleAddQuestion = useCallback(() => {
    if (!selectedSubject || !selectedLevel) return;
    if (turnAnswers.length >= 3) return;
    setTurnAnswers(prev => [
      ...prev,
      { subjectId: selectedSubject, levelId: selectedLevel, questionId: `q_${Date.now()}`, answer: '' }
    ]);
    setSelectedSubject(null);
    setSelectedLevel(null);
  }, [selectedSubject, selectedLevel, turnAnswers]);

  const handleSubmitTurn = useCallback(() => {
    if (turnAnswers.length === 0) return;
    const timeUsed = turnStartTime ? Math.floor((Date.now() - turnStartTime) / 1000) : undefined;
    const answersWithTime = turnAnswers.map(a => ({ ...a, timeUsed, timeLimit: 15 }));
    setShowingResult(true);
    submitAsyncTurn(answersWithTime);
  }, [turnAnswers, turnStartTime, submitAsyncTurn]);

  const handleNextTurn = useCallback(() => {
    setTurnAnswers([]);
    setShowingResult(false);
    setTurnStartTime(null);
  }, []);

  const handleStartTurn = useCallback(() => {
    setTurnStartTime(Date.now());
  }, []);

  // 等待开始状态
  if (!asyncRoom || asyncRoom.state === 'waiting') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '24px'
      }}>
        <SeasonPanel seasonState={seasonState} />
        <h2 style={{ color: 'var(--neon-cyan)' }}>🕐 异步对战</h2>
        <p style={{ color: '#aaa' }}>每回合最多3题，48小时内完成作答</p>
        <button className="btn-cyber" onClick={handleStartGame} style={{ fontSize: '1.2rem', padding: '14px 40px' }}>
          开始异步对战
        </button>
      </div>
    );
  }

  // 对局结束
  if (asyncGameOver) {
    const playerWon = asyncGameOver.winner === 'player';
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '24px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          color: playerWon ? 'var(--neon-cyan)' : 'var(--neon-pink)',
          textShadow: `0 0 30px ${playerWon ? 'var(--neon-cyan)' : 'var(--neon-pink)'}`,
        }}>
          {playerWon ? '🏆 你赢了！' : '💀 AI 获胜'}
        </h1>
        <div style={{ color: '#fff', fontSize: '1.5rem' }}>
          {asyncGameOver.finalScore.player} - {asyncGameOver.finalScore.ai}
        </div>
        {lastXpGain && (
          <div style={{ color: 'var(--neon-yellow)', fontSize: '1.2rem' }}>
            +{lastXpGain.xpEarned} XP（总计 {lastXpGain.totalXp} XP）
          </div>
        )}
        <SeasonPanel seasonState={seasonState} />
        <button className="btn-cyber" onClick={handleStartGame}>再来一局</button>
      </div>
    );
  }

  // 本回合结果
  if (showingResult && lastAiResult) {
    return (
      <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
        <SeasonPanel seasonState={seasonState} />
        <h2 style={{ color: 'var(--neon-cyan)', marginBottom: '20px' }}>本回合结果</h2>

        <div style={{ marginBottom: '16px', color: '#fff', fontSize: '1.2rem' }}>
          <span style={{ color: 'var(--neon-cyan)' }}>你: {asyncRoom.playerScore}</span>
          {' vs '}
          <span style={{ color: 'var(--neon-pink)' }}>AI: {lastAiResult.aiScore}</span>
        </div>

        {lastXpGain && (
          <div style={{
            background: 'var(--glass-bg)', border: '2px solid var(--neon-yellow)',
            borderRadius: '12px', padding: '16px', marginBottom: '16px'
          }}>
            <div style={{ color: 'var(--neon-yellow)' }}>+{lastXpGain.xpEarned} XP</div>
            <div style={{ color: '#aaa', fontSize: '0.9rem' }}>
              总计 {lastXpGain.totalXp} XP | 段位: {lastXpGain.tier}
            </div>
            {lastXpGain.tierChanged && tierUp && (
              <div style={{ color: 'var(--neon-green)', marginTop: '8px' }}>
                🎉 晋升到 {tierUp}！
              </div>
            )}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: 'var(--neon-pink)', marginBottom: '8px' }}>AI 本回合作答：</div>
          {lastAiResult.aiAnswers.map((a: any, i: number) => (
            <div key={i} style={{ color: a.correct ? 'var(--neon-green)' : 'var(--neon-pink)' }}>
              {a.subject} {a.level}: {a.correct ? '✅ 正确' : '❌ 错误'}
            </div>
          ))}
        </div>

        <button className="btn-cyber" onClick={handleNextTurn}>下一回合</button>
      </div>
    );
  }

  // 出题界面
  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <SeasonPanel seasonState={seasonState} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ color: 'var(--neon-cyan)' }}>
          回合 {asyncRoom.turnCount + 1} / {asyncRoom.maxTurns}
        </h3>
        <div style={{ color: '#fff' }}>
          <span style={{ color: 'var(--neon-cyan)' }}>你: {asyncRoom.playerScore}</span>
          {' vs '}
          <span style={{ color: 'var(--neon-pink)' }}>AI: {asyncRoom.aiScore}</span>
        </div>
      </div>

      {/* 学科选择 */}
      <div style={{ marginBottom: '16px' }}>
        <div className="label" style={{ color: 'var(--neon-cyan)', marginBottom: '8px' }}>▶ 选择学科</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {SUBJECT_CARDS.map(card => (
            <Card key={card.id} type="subject" name={card.name} color={card.color} icon="📖"
              selected={selectedSubject === card.id} onClick={() => setSelectedSubject(card.id)} />
          ))}
        </div>
      </div>

      {/* 难度选择 */}
      <div style={{ marginBottom: '16px' }}>
        <div className="label" style={{ color: 'var(--neon-yellow)', marginBottom: '8px' }}>▶ 选择难度</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {LEVEL_CARDS.map(card => (
            <Card key={card.id} type="level" name={card.name} color="var(--neon-yellow)" icon="⚡"
              selected={selectedLevel === card.id} onClick={() => setSelectedLevel(card.id)} timeLimit={card.timeLimit} />
          ))}
        </div>
      </div>

      {/* 添加题目按钮 */}
      <button
        className="btn-cyber"
        onClick={handleAddQuestion}
        disabled={!selectedSubject || !selectedLevel || turnAnswers.length >= 3}
        style={{ marginBottom: '16px' }}
      >
        + 添加本题（{turnAnswers.length}/3）
      </button>

      {/* 当前回合题目列表 */}
      {turnAnswers.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="label" style={{ color: 'var(--neon-cyan)', marginBottom: '8px' }}>
            本回合题目（{turnAnswers.length}/3）
          </div>
          {turnAnswers.map((a, idx) => {
            const sub = SUBJECT_CARDS.find(c => c.id === a.subjectId);
            const lv = LEVEL_CARDS.find(c => c.id === a.levelId);
            return (
              <div key={idx} style={{
                background: 'var(--glass-bg)', border: '1px solid var(--neon-cyan)',
                borderRadius: '8px', padding: '10px', marginBottom: '8px', color: '#fff'
              }}>
                {idx + 1}. {sub?.name} + {lv?.name}
              </div>
            );
          })}
        </div>
      )}

      {/* 提交回合 */}
      {turnAnswers.length > 0 && !turnStartTime && (
        <button className="btn-cyber" onClick={handleStartTurn} style={{ marginBottom: '12px' }}>
          ⚡ 开始作答（计时）
        </button>
      )}

      {turnAnswers.length > 0 && turnStartTime && (
        <button className="btn-cyber" onClick={handleSubmitTurn} style={{ fontSize: '1.1rem', padding: '12px 32px' }}>
          ⚡ 提交本回合（{turnAnswers.length}题）
        </button>
      )}

      {turnAnswers.length === 0 && (
        <p style={{ color: '#666', fontSize: '0.9rem' }}>请先添加至少1道题目</p>
      )}
    </div>
  );
};

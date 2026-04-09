import React, { useState, useCallback } from 'react';
import { useGameSocket } from '../hooks/useGameSocket';
import { Hand } from './Hand';
import { QuestionPanel } from './QuestionPanel';
import { Timer } from './Timer';
import { ScoreBoard } from './ScoreBoard';

export const GameBoard: React.FC = () => {
  const { gameState, error, startGame, playCards, submitAnswer } = useGameSocket();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleStart = () => {
    setSelectedSubject(null);
    setSelectedLevel(null);
    startGame(10);
  };

  const handlePlay = () => {
    console.log('[GameBoard] handlePlay called', { selectedSubject, selectedLevel });
    if (!selectedSubject || !selectedLevel) {
      console.warn('[GameBoard] selectedSubject or selectedLevel is null, returning early');
      return;
    }
    console.log('[GameBoard] emitting play_cards', { subjectCardId: selectedSubject, levelCardId: selectedLevel });
    playCards(selectedSubject, selectedLevel);
    setSelectedSubject(null);
    setSelectedLevel(null);
  };

  const handleAnswer = useCallback((answer: string) => {
    submitAnswer(answer);
  }, [submitAnswer]);

  const handleTimeout = useCallback(() => {
    submitAnswer('__TIMEOUT__');
  }, [submitAnswer]);

  // 开始界面
  if (!gameState) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '24px'
      }}>
        <h1 style={{
          fontSize: '2.5rem', color: 'var(--neon-cyan)',
          textShadow: '0 0 20px var(--neon-cyan)', letterSpacing: '4px'
        }}>
          ⚡ 学科知识对战 ⚡
        </h1>
        <p style={{ color: '#aaa', fontSize: '1rem' }}>
          赛博空间知识挑战 · 先得10分获胜
        </p>
        <button className="btn-cyber" onClick={handleStart} style={{ fontSize: '1.2rem', padding: '14px 40px' }}>
          开始挑战
        </button>
        {error && (
          <div style={{ color: 'var(--neon-pink)', padding: '10px', border: '1px solid var(--neon-pink)', borderRadius: '8px' }}>
            ⚠ {error}
          </div>
        )}
      </div>
    );
  }

  const { phase, currentQuestion, playerScore, aiScore, winner } = gameState;

  // 游戏结束
  if (phase === 'game_over' || winner) {
    const playerWon = winner === 'player';
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
        <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />
        <button className="btn-cyber" onClick={handleStart}>再来一局</button>
      </div>
    );
  }

  // 答题界面
  if (phase === 'answering' && currentQuestion) {
    return (
      <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
        <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />
        <div style={{ margin: '24px 0', display: 'flex', justifyContent: 'center' }}>
          <Timer
            seconds={currentQuestion.timeLimit}
            onTimeout={handleTimeout}
            active={true}
          />
        </div>
        <QuestionPanel
          narrative={currentQuestion.narrative}
          question={currentQuestion.question}
          timeLimit={currentQuestion.timeLimit}
          active={true}
          onAnswer={handleAnswer}
          onTimeout={handleTimeout}
        />
      </div>
    );
  }

  // 出牌界面
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {error && (
        <div style={{
          color: 'var(--neon-pink)', padding: '8px', marginBottom: '12px',
          border: '1px solid var(--neon-pink)', borderRadius: '6px', fontSize: '0.9rem'
        }}>
          ⚠ {error}
        </div>
      )}

      <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />

      <h3 style={{
        color: 'var(--neon-cyan)', margin: '20px 0 12px',
        textTransform: 'uppercase', letterSpacing: '2px'
      }}>
        ▶ 你的回合 — 选择学科和难度
      </h3>

      <Hand
        subjectIds={gameState.handSubjects}
        levelIds={gameState.handLevels}
        selectedSubject={selectedSubject}
        selectedLevel={selectedLevel}
        onSelectSubject={setSelectedSubject}
        onSelectLevel={setSelectedLevel}
        disabled={phase !== 'play_card'}
      />

      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          className="btn-cyber"
          onClick={handlePlay}
          disabled={!selectedSubject || !selectedLevel}
          style={{
            opacity: (!selectedSubject || !selectedLevel) ? 0.4 : 1,
            cursor: (!selectedSubject || !selectedLevel) ? 'not-allowed' : 'pointer',
            fontSize: '1rem', padding: '12px 32px'
          }}
        >
          ⚡ 出牌并开始答题
        </button>
        <span style={{ color: '#666', fontSize: '0.85rem' }}>
          牌堆剩余: {gameState.deckCount} | 弃牌: {gameState.discardCount}
        </span>
      </div>
    </div>
  );
};

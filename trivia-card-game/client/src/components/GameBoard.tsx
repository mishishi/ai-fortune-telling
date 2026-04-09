import React, { useState, useCallback, useEffect } from 'react';
import { useGameSocket } from '../hooks/useGameSocket';
import { Hand } from './Hand';
import { QuestionPanel } from './QuestionPanel';
import { Timer } from './Timer';
import { ScoreBoard } from './ScoreBoard';
import { ModeSelect } from './ModeSelect';
import { PracticeBoard } from './PracticeBoard';
import { GameLogo } from './Icons';

type SavedQuestion = {
  id: string;
  narrative: string;
  question: string;
  answer: string;
  timeLimit: number;
};

export const GameBoard: React.FC = () => {
  const { gameState, error, startGame, playCards, submitAnswer, useSkill } = useGameSocket();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  // Track last submitted question so we can show the answer after phase changes
  const [lastQuestion, setLastQuestion] = useState<SavedQuestion | null>(null);
  const [mode, setMode] = useState<'select' | 'pvp' | 'practice'>('select');
  // Local loading state - set immediately when user clicks play
  const [waitingForQuestion, setWaitingForQuestion] = useState(false);

  // Clear waiting when question arrives
  useEffect(() => {
    if (gameState?.currentQuestion) {
      setWaitingForQuestion(false);
    }
  }, [gameState?.currentQuestion]);

  const handleStart = () => {
    setSelectedCardIndex(null);
    setLastQuestion(null);
    startGame(10);
  };

  const handleSelectCard = (index: number) => {
    setSelectedCardIndex(index);
  };

  const handleUseSkill = (index: number) => {
    useSkill(index);
    setSelectedCardIndex(null);
  };

  const handlePlay = () => {
    if (selectedCardIndex === null) return;
    // Immediately show loading
    setWaitingForQuestion(true);
    playCards(selectedCardIndex);
    setSelectedCardIndex(null);
  };

  const handleAnswer = useCallback((answer: string) => {
    // Save question so we can show answer after server responds
    if (gameState?.currentQuestion) {
      setLastQuestion(gameState.currentQuestion);
    }
    submitAnswer(answer);
  }, [submitAnswer, gameState]);

  const handleTimeout = useCallback(() => {
    if (gameState?.currentQuestion) {
      setLastQuestion(gameState.currentQuestion);
    }
    submitAnswer('__TIMEOUT__');
  }, [submitAnswer, gameState]);

  if (mode === 'select') {
    return <ModeSelect onSelect={(m) => {
      if (m === 'pvp') {
        setMode('pvp');
        startGame(10);
      } else {
        setMode('practice');
      }
    }} />;
  }

  if (mode === 'practice') {
    return <PracticeBoard onBack={() => setMode('select')} />;
  }

  // 开始界面
  if (!gameState) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '28px'
      }}>
        <div style={{ width: 240, height: 80 }}>
          <GameLogo />
        </div>
        <p style={{ color: '#7a8ab8', fontSize: '0.9rem', letterSpacing: '2px', marginTop: '-12px' }}>
          赛博空间知识挑战 · 先得10分获胜
        </p>
        <button className="btn-cyber" onClick={handleStart} style={{ fontSize: '1rem', padding: '14px 48px' }}>
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
          fontSize: '2.5rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          color: playerWon ? 'var(--neon-cyan)' : 'var(--neon-pink)',
          textShadow: `0 0 30px ${playerWon ? 'var(--neon-cyan)' : 'var(--neon-pink)'}`,
          letterSpacing: '4px',
        }}>
          {playerWon ? 'VICTORY' : 'DEFEATED'}
        </h1>
        <p style={{ color: '#7a8ab8', fontSize: '0.9rem', letterSpacing: '2px', marginTop: '-12px' }}>
          {playerWon ? '恭喜你击败了AI对手' : 'AI赢得了这场对战'}
        </p>
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
          answer={currentQuestion.answer}
          timeLimit={currentQuestion.timeLimit}
          active={true}
          onAnswer={handleAnswer}
          onTimeout={handleTimeout}
        />
      </div>
    );
  }

  // 等待AI出题中
  if (waitingForQuestion) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '32px'
      }}>
        <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />
        <div style={{ textAlign: 'center' }}>
          {/* Loading spinner */}
          <div style={{ marginBottom: '20px' }}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="26" stroke="rgba(0,245,255,0.15)" strokeWidth="3"/>
              <path d="M30 4A26 26 0 0 1 56 30" stroke="#00f5ff" strokeWidth="3" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="0.8s" repeatCount="indefinite"/>
              </path>
              <circle cx="30" cy="30" r="4" fill="#c084fc"/>
            </svg>
          </div>
          <h2 style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '3px' }}>
            AI 正在生成题目
          </h2>
          <p style={{ color: '#5a6a8a', marginTop: '8px', fontSize: '0.85rem' }}>
            赛博空间数据传输中，请稍候...
          </p>
        </div>
        <div style={{
          color: '#4a5a7a', fontSize: '0.8rem',
          border: '1px solid #1e2a4a', padding: '8px 20px', borderRadius: '8px'
        }}>
          难度越高，题目越复杂，生成时间稍长
        </div>
      </div>
    );
  }

  // 答题结果界面（显示上一题答案，用户确认后消失）
  if (lastQuestion) {
    const lq = lastQuestion;
    return (
      <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
        <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />
        <div style={{
          border: '2px solid var(--neon-pink)',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '16px',
          background: 'rgba(255,0,170,0.08)',
        }}>
          <div style={{ color: 'var(--neon-pink)', fontSize: '0.8rem', marginBottom: '8px', letterSpacing: '2px' }}>
            ⚡ {lq.narrative}
          </div>
          <div style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '20px', lineHeight: 1.5 }}>
            {lq.question}
          </div>
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255,100,100,0.15)',
            border: '2px solid var(--neon-pink)',
            borderRadius: '8px',
            color: 'var(--neon-pink)',
            fontSize: '1.1rem',
          }}>
            答案：<strong>{lq.answer}</strong>
          </div>
          <button
            className="btn-cyber"
            onClick={() => { setLastQuestion(null); }}
            style={{ marginTop: '20px', width: '100%' }}
          >
            继续出牌
          </button>
        </div>
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
        hand={gameState.hand}
        selectedIndex={selectedCardIndex}
        onSelectCard={handleSelectCard}
        onUseSkill={handleUseSkill}
        disabled={phase !== 'play_card'}
      />

      <div style={{ marginTop: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          className="btn-cyber"
          onClick={handlePlay}
          disabled={selectedCardIndex === null}
          style={{
            opacity: selectedCardIndex === null ? 0.4 : 1,
            cursor: selectedCardIndex === null ? 'not-allowed' : 'pointer',
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

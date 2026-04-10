import React, { useState, useCallback, useEffect } from 'react';
import { useGameSocket } from '../hooks/useGameSocket';
import { Hand } from './Hand';
import { QuestionPanel } from './QuestionPanel';
import { Timer } from './Timer';
import { ScoreBoard } from './ScoreBoard';
import { ModeSelect } from './ModeSelect';
import { PracticeBoard } from './PracticeBoard';
import { AsyncGameBoard } from './AsyncGameBoard';
import { GameLogo } from './Icons';
import { DeckDisplay } from './DeckDisplay';
import { BattlePassPanel } from './BattlePassPanel';
import { Leaderboard } from './Leaderboard';

type SavedQuestion = {
  id: string;
  narrative: string;
  question: string;
  answer: string;
  options: string[];
  explanation?: string;
  timeLimit: number;
  playerAnswer: string;
  isCorrect: boolean;
};

export const GameBoard: React.FC = () => {
  const { gameState, error, startGame, playCards, submitAnswer, useSkill, questionThinking } = useGameSocket();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [lastAnswer, setLastAnswer] = useState<string>('');
  // Track last submitted question so we can show the answer after phase changes
  const [lastQuestion, setLastQuestion] = useState<SavedQuestion | null>(null);
  const [mode, setMode] = useState<'select' | 'pvp' | 'practice' | 'async'>('select');
  // Local loading state - set immediately when user clicks play
  const [waitingForQuestion, setWaitingForQuestion] = useState(false);
  // Record when loading started, for minimum duration enforcement
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  // Minimum 1s loading duration before showing question (regardless of AI speed)
  useEffect(() => {
    if (!gameState?.currentQuestion) return;
    const MIN_LOADING = 1000;
    const elapsed = Date.now() - (loadingStartTime ?? Date.now());
    if (elapsed >= MIN_LOADING) {
      setWaitingForQuestion(false);
    } else {
      const remaining = MIN_LOADING - elapsed;
      const tid = setTimeout(() => setWaitingForQuestion(false), remaining);
      return () => clearTimeout(tid);
    }
  }, [gameState?.currentQuestion, loadingStartTime]);

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
    setLoadingStartTime(Date.now());
    setWaitingForQuestion(true);
    playCards(selectedCardIndex);
    setSelectedCardIndex(null);
  };

  const handleAnswer = useCallback((answer: string) => {
    // Save question so we can show answer after server responds
    if (gameState?.currentQuestion) {
      const q = gameState.currentQuestion;
      const isCorrect = answer === q.answer;
      setLastQuestion({ ...q, playerAnswer: answer, isCorrect });
      setLastAnswer(answer);
    }
    submitAnswer(answer);
  }, [submitAnswer, gameState]);

  const handleTimeout = useCallback(() => {
    if (gameState?.currentQuestion) {
      const q = gameState.currentQuestion;
      setLastQuestion({ ...q, playerAnswer: '超时', isCorrect: false });
      setLastAnswer('__TIMEOUT__');
    }
    submitAnswer('__TIMEOUT__');
  }, [submitAnswer, gameState]);

  if (mode === 'select') {
    return <ModeSelect onSelect={(m) => {
      if (m === 'pvp') {
        setMode('pvp');
        startGame(10);
      } else if (m === 'async') {
        setMode('async');
      } else {
        setMode('practice');
      }
    }} />;
  }

  if (mode === 'practice') {
    return <PracticeBoard onBack={() => setMode('select')} />;
  }

  if (mode === 'async') {
    return <AsyncGameBoard />;
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
          options={currentQuestion.options}
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
          border: `2px solid ${lq.isCorrect ? 'var(--neon-green)' : 'var(--neon-pink)'}`,
          borderRadius: '12px',
          padding: '24px',
          marginTop: '16px',
          background: lq.isCorrect ? 'rgba(0,255,136,0.06)' : 'rgba(255,0,170,0.08)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            color: lq.isCorrect ? 'var(--neon-green)' : 'var(--neon-pink)',
            fontSize: '1rem', fontFamily: 'var(--font-display)', fontWeight: 700,
            marginBottom: '16px', letterSpacing: '1px',
          }}>
            <span style={{ width: 22, height: 22, display: 'flex', color: 'inherit' }}>
              {lq.isCorrect
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              }
            </span>
            {lq.isCorrect ? '回答正确！' : lq.playerAnswer === '超时' ? '超时未答' : '回答错误'}
          </div>

          <div style={{ color: 'var(--neon-cyan)', fontSize: '0.75rem', marginBottom: '8px', letterSpacing: '2px' }}>
            ⚡ {lq.narrative}
          </div>
          <div style={{ fontSize: '1.1rem', color: '#e8eaf0', marginBottom: '20px', lineHeight: 1.6, fontWeight: 600 }}>
            {lq.question}
          </div>

          {/* 选项 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {lq.options.map((opt) => {
              const letter = opt.charAt(0);
              const text = opt.substring(2).trim();
              const isCorrectOpt = letter === lq.answer;
              const isPlayerOpt = letter === lq.playerAnswer;
              const isWrong = !lq.isCorrect && isPlayerOpt;

              let borderColor = 'rgba(192,132,252,0.2)';
              let bg = 'rgba(192,132,252,0.04)';
              let textColor = '#9aa0b8';
              let labelBg = 'transparent';
              let labelColor = '#9aa0b8';

              if (isCorrectOpt) {
                borderColor = 'var(--neon-green)';
                bg = 'rgba(0,255,136,0.1)';
                textColor = 'var(--neon-green)';
                labelBg = 'var(--neon-green)';
                labelColor = '#060912';
              } else if (isWrong) {
                borderColor = 'var(--neon-pink)';
                bg = 'rgba(255,0,170,0.1)';
                textColor = 'var(--neon-pink)';
                labelBg = 'var(--neon-pink)';
                labelColor = '#060912';
              }

              return (
                <div key={letter} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px',
                  background: bg,
                  border: `2px solid ${borderColor}`,
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                }}>
                  <span style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    border: `2px solid ${labelBg}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem',
                    flexShrink: 0,
                    background: labelBg,
                    color: labelColor,
                  }}>{letter}</span>
                  <span style={{ fontSize: '0.85rem', lineHeight: 1.4, color: textColor }}>{text}</span>
                </div>
              );
            })}
          </div>

          {/* 解析 */}
          {lq.explanation && (
            <div style={{
              padding: '14px 16px',
              background: 'rgba(0,245,255,0.06)',
              border: '1px solid rgba(0,245,255,0.2)',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <div style={{ color: 'var(--neon-cyan)', fontSize: '0.7rem', fontFamily: 'var(--font-display)', letterSpacing: '2px', marginBottom: '6px', fontWeight: 700 }}>
                💡 解析
              </div>
              <div style={{ color: '#b0b8d0', fontSize: '0.88rem', lineHeight: 1.6 }}>
                {lq.explanation}
              </div>
            </div>
          )}

          <button
            className="btn-cyber"
            onClick={() => { setLastQuestion(null); }}
            style={{ marginTop: '4px', width: '100%' }}
          >
            继续出牌
          </button>
        </div>
      </div>
    );
  }

  // AI 正在思考中（流式推送）
  if (questionThinking && gameState?.phase === 'play_card') {
    return (
      <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
        <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />
        <div style={{
          border: '2px solid var(--neon-cyan)',
          borderRadius: '12px',
          padding: '28px 24px',
          marginTop: '16px',
          background: 'rgba(0,245,255,0.05)',
          textAlign: 'center',
        }}>
          {/* 标题 */}
          <div style={{
            color: 'var(--neon-cyan)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '3px',
            marginBottom: '10px',
            textTransform: 'uppercase',
          }}>
            ⚡ {questionThinking.narrative || 'AI 正在生成题目'}
          </div>

          {/* 思考内容流式展示 */}
          <div style={{
            color: '#8a9ac0',
            fontSize: '0.85rem',
            lineHeight: 1.8,
            textAlign: 'left',
            minHeight: '80px',
            fontFamily: 'var(--font-mono)',
            padding: '12px 16px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: '1px solid rgba(0,245,255,0.1)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}>
            {questionThinking.text || '思考中...'}
            <span style={{ opacity: 0.6, animation: 'blink 1s infinite' }}>|</span>
          </div>

          {/* 加载动画 */}
          <div style={{ marginTop: '20px' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto' }}>
              <circle cx="20" cy="20" r="17" stroke="rgba(0,245,255,0.15)" strokeWidth="3"/>
              <path d="M20 3A17 17 0 0 1 37 20" stroke="#00f5ff" strokeWidth="3" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.8s" repeatCount="indefinite"/>
              </path>
            </svg>
          </div>
          <p style={{ color: '#4a5a7a', fontSize: '0.8rem', marginTop: '12px' }}>
            AI 正在思考中，请稍候...
          </p>
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

      <div style={{
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <button
          className="btn-cyber"
          onClick={handlePlay}
          disabled={selectedCardIndex === null}
          style={{
            opacity: selectedCardIndex === null ? 0.4 : 1,
            cursor: selectedCardIndex === null ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            padding: '12px 28px',
            flexShrink: 0,
          }}
        >
          ⚡ 出牌并开始答题
        </button>
        <DeckDisplay deckCount={gameState.deckCount} discardCount={gameState.discardCount} />
      </div>

      <div style={{
        position: 'fixed', bottom: '20px', right: '20px',
        display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        <button
          className="btn-cyber"
          onClick={() => { /* 打开 Battle Pass 面板 */ }}
          style={{ fontSize: '0.85rem', padding: '8px 16px' }}
        >
          ⚡ Battle Pass
        </button>
        <button
          className="btn-cyber"
          onClick={() => { /* 打开排行榜 */ }}
          style={{ fontSize: '0.85rem', padding: '8px 16px' }}
        >
          🏆 排行榜
        </button>
      </div>
    </div>
  );
};

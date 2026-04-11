import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import { Hand } from './Hand';
import { QuestionPanel } from './QuestionPanel';
import { Timer } from './Timer';
import { ScoreBoard } from './ScoreBoard';
import { LoadingAI } from './LoadingAI';
import { DeckDisplay } from './DeckDisplay';

type GameBoardProps = {
  autoStart?: boolean;
};

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

/* =====================================================
   ICONS
   ===================================================== */
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
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

/* =====================================================
   NAVIGATION HEADER
   ===================================================== */
const NavHeader: React.FC<{ onBack: () => void; title: string; subtitle: string }> = ({ onBack, title, subtitle }) => (
  <div className="nav-header">
    <button className="btn-ghost" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <IconArrow />
      <span>返回</span>
    </button>
    <div>
      <div className="nav-title" style={{ color: 'var(--neon-cyan)' }}>{title}</div>
      <div className="nav-subtitle">{subtitle}</div>
    </div>
  </div>
);

/* =====================================================
   RESULT PANEL
   ===================================================== */
const ResultPanel: React.FC<{
  lastQuestion: SavedQuestion;
  playerScore: number;
  aiScore: number;
  winScore: number;
  onContinue: () => void;
}> = ({ lastQuestion: lq, playerScore, aiScore, winScore, onContinue }) => {
  const isCorrect = lq.isCorrect;

  return (
    <div style={{ padding: '24px', maxWidth: '680px', margin: '0 auto' }}>
      <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={winScore} />

      <div className={`animate-scale-in ${isCorrect ? 'result-correct' : 'result-wrong'}`} style={{
        padding: '28px',
        marginTop: '24px',
      }}>
        {/* Result header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          marginBottom: '20px',
          color: isCorrect ? 'var(--neon-green)' : 'var(--neon-pink)',
        }}>
          {isCorrect ? <IconCheck /> : <IconX />}
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 700,
            letterSpacing: '1px',
          }}>
            {isCorrect ? '正确' : lq.playerAnswer === '超时' ? '超时未答' : '错误'}
          </span>
        </div>

        {/* Narrative */}
        <div style={{
          color: 'rgba(0, 229, 255, 0.7)',
          fontSize: '0.72rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '12px',
          fontFamily: 'var(--font-display)',
        }}>
          {lq.narrative}
        </div>

        {/* Question */}
        <div style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          color: '#e8ecf4',
          marginBottom: '24px',
          lineHeight: 1.5,
        }}>
          {lq.question}
        </div>

        {/* Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
          {lq.options.map((opt) => {
            const letter = opt.charAt(0);
            const text = opt.substring(2).trim();
            const isCorrectOpt = letter === lq.answer;
            const isPlayerOpt = letter === lq.playerAnswer;
            const isWrong = !lq.isCorrect && isPlayerOpt;

            let borderColor = 'rgba(255, 255, 255, 0.08)';
            let bg = 'rgba(255, 255, 255, 0.02)';
            let textColor = 'rgba(255, 255, 255, 0.5)';

            if (isCorrectOpt) {
              borderColor = 'var(--neon-green)';
              bg = 'rgba(0, 255, 136, 0.1)';
              textColor = 'var(--neon-green)';
            } else if (isWrong) {
              borderColor = 'var(--neon-pink)';
              bg = 'rgba(255, 45, 149, 0.1)';
              textColor = 'var(--neon-pink)';
            }

            return (
              <div key={letter} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px',
                background: bg,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
              }}>
                <span style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  border: `2px solid ${borderColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.72rem',
                  flexShrink: 0,
                  background: isCorrectOpt || isWrong ? borderColor : 'transparent',
                  color: (isCorrectOpt || isWrong) ? '#060912' : textColor,
                }}>
                  {letter}
                </span>
                <span style={{ fontSize: '0.88rem', lineHeight: 1.4, color: textColor }}>
                  {text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {lq.explanation && (
          <div className="hint-display" style={{ marginBottom: '24px' }}>
            <div style={{
              color: 'var(--neon-cyan)',
              fontSize: '0.68rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '8px',
              fontWeight: 600,
            }}>
              解析
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              {lq.explanation}
            </div>
          </div>
        )}

        <button className="btn-cyber" onClick={onContinue} style={{ width: '100%' }}>
          继续出牌
        </button>
      </div>
    </div>
  );
};

/* =====================================================
   MAIN GAMEBOARD
   ===================================================== */
export const GameBoard: React.FC<GameBoardProps> = ({ autoStart }) => {
  const navigate = useNavigate();
  const { gameState, error, startGame, playCards, submitAnswer, useSkill, questionThinking } = useGameSocket();
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [lastQuestion, setLastQuestion] = useState<SavedQuestion | null>(null);
  const [waitingForQuestion, setWaitingForQuestion] = useState(false);
  const loadingStartRef = useRef<number | null>(null);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Enforce minimum 2s loading
  useEffect(() => {
    if (!gameState?.currentQuestion) return;
    if (!waitingForQuestion) return;
    const MIN_LOADING = 2000;
    const start = loadingStartRef.current ?? Date.now();
    const elapsed = Date.now() - start;
    if (elapsed >= MIN_LOADING) {
      setWaitingForQuestion(false);
    } else {
      const remaining = MIN_LOADING - elapsed;
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = setTimeout(() => setWaitingForQuestion(false), remaining);
    }
  }, [gameState?.currentQuestion, waitingForQuestion]);

  // Auto-start
  useEffect(() => {
    if (autoStart) {
      startGame(10);
    }
  }, [autoStart]); // eslint-disable-line

  const handleSelectCard = (index: number) => setSelectedCardIndex(index);
  const handleUseSkill = (index: number) => { useSkill(index); setSelectedCardIndex(null); };

  const handlePlay = () => {
    if (selectedCardIndex === null) return;
    loadingStartRef.current = Date.now();
    if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    setWaitingForQuestion(true);
    playCards(selectedCardIndex);
    setSelectedCardIndex(null);
  };

  const handleAnswer = useCallback((answer: string) => {
    if (gameState?.currentQuestion) {
      const q = gameState.currentQuestion;
      setLastQuestion({ ...q, playerAnswer: answer, isCorrect: answer === q.answer });
    }
    submitAnswer(answer);
  }, [submitAnswer, gameState]);

  const handleTimeout = useCallback(() => {
    if (gameState?.currentQuestion) {
      const q = gameState.currentQuestion;
      setLastQuestion({ ...q, playerAnswer: '超时', isCorrect: false });
    }
    submitAnswer('__TIMEOUT__');
  }, [submitAnswer, gameState]);

  // Loading state
  if (!gameState) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavHeader onBack={() => navigate('/')} title="快速对战" subtitle="与 AI 对战 · 先得10分获胜" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
          <LoadingAI title="连接服务器中" subtitle="正在初始化游戏环境..." color="#00e5ff" />
          {error && (
            <div style={{
              color: 'var(--neon-pink)',
              padding: '12px 20px',
              border: '1px solid var(--neon-pink)',
              borderRadius: '10px',
              fontSize: '0.88rem',
            }}>
              ⚠ {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const { phase, currentQuestion, playerScore, aiScore, winner } = gameState;

  // Game over
  if (phase === 'game_over' || winner) {
    const playerWon = winner === 'player';
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavHeader onBack={() => navigate('/')} title="快速对战" subtitle="与 AI 对战 · 先得10分获胜" />
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '20px',
        }}>
          <h1 className="animate-scale-in" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            fontWeight: 700,
            color: playerWon ? 'var(--neon-cyan)' : 'var(--neon-pink)',
            letterSpacing: '6px',
            textTransform: 'uppercase',
          }}>
            {playerWon ? 'Victory' : 'Defeated'}
          </h1>
          <p className="animate-fade-in-up delay-1" style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.88rem',
            letterSpacing: '1px',
          }}>
            {playerWon ? '恭喜你击败了AI对手' : 'AI赢得了这场对战'}
          </p>
          <div className="animate-fade-in-up delay-2">
            <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />
          </div>
          <button className="btn-cyber animate-fade-in-up delay-3" onClick={() => startGame(10)}>
            再来一局
          </button>
        </div>
      </div>
    );
  }

  // Answering
  if (phase === 'answering' && currentQuestion) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NavHeader onBack={() => navigate('/')} title="快速对战" subtitle="与 AI 对战 · 先得10分获胜" />
          <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />
          <div style={{ margin: '28px 0', display: 'flex', justifyContent: 'center' }}>
            <Timer seconds={currentQuestion.timeLimit} onTimeout={handleTimeout} active={true} />
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
      </div>
    );
  }

  // Waiting for AI
  if (waitingForQuestion) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NavHeader onBack={() => navigate('/')} title="快速对战" subtitle="与 AI 对战 · 先得10分获胜" />
          <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />
          <LoadingAI title="AI 正在生成题目" subtitle="赛博空间数据传输中，请稍候..." color="#00e5ff" />
        </div>
      </div>
    );
  }

  // Result
  if (lastQuestion) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NavHeader onBack={() => navigate('/')} title="快速对战" subtitle="与 AI 对战 · 先得10分获胜" />
          <ResultPanel
            lastQuestion={lastQuestion}
            playerScore={playerScore}
            aiScore={aiScore}
            winScore={10}
            onContinue={() => setLastQuestion(null)}
          />
        </div>
      </div>
    );
  }

  // AI thinking (streaming)
  if (questionThinking && gameState?.phase === 'play_card') {
    return (
      <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NavHeader onBack={() => navigate('/')} title="快速对战" subtitle="与 AI 对战 · 先得10分获胜" />
          <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />
          <div className="glass-panel" style={{ padding: '28px', marginTop: '24px', textAlign: 'center' }}>
            <div style={{
              color: 'var(--neon-cyan)',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-display)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}>
              {questionThinking.narrative || 'AI 正在生成题目'}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem',
              lineHeight: 1.8,
              textAlign: 'left',
              minHeight: '80px',
              fontFamily: 'var(--font-mono)',
              padding: '14px 18px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              border: '1px solid rgba(0, 229, 255, 0.08)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              marginBottom: '20px',
            }}>
              {questionThinking.text || '思考中...'}
              <span className="cursor-blink">|</span>
            </div>
            <div className="spinner" style={{ margin: '0 auto' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '14px' }}>
              AI 正在思考中...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Play card phase
  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <NavHeader onBack={() => navigate('/')} title="快速对战" subtitle="与 AI 对战 · 先得10分获胜" />
        {error && (
          <div style={{
            color: 'var(--neon-pink)',
            padding: '10px 16px',
            marginBottom: '16px',
            border: '1px solid rgba(255, 45, 149, 0.3)',
            borderRadius: '8px',
            fontSize: '0.88rem',
          }}>
            ⚠ {error}
          </div>
        )}

        <ScoreBoard playerScore={playerScore} aiScore={aiScore} winScore={10} />

        <h3 className="animate-fade-in-up" style={{
          color: 'var(--neon-cyan)',
          margin: '24px 0 16px',
          fontFamily: 'var(--font-display)',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          opacity: 0.8,
        }}>
          ▶ 选择学科和难度
        </h3>

        <div className="animate-fade-in-up delay-1">
          <Hand
            hand={gameState.hand}
            selectedIndex={selectedCardIndex}
            onSelectCard={handleSelectCard}
            onUseSkill={handleUseSkill}
            disabled={phase !== 'play_card'}
          />
        </div>

        <div className="animate-fade-in-up delay-2" style={{
          marginTop: '24px',
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
              padding: '12px 28px',
            }}
          >
            ⚡ 出牌并开始答题
          </button>
          <DeckDisplay deckCount={gameState.deckCount} discardCount={gameState.discardCount} />
        </div>
      </div>
    </div>
  );
};

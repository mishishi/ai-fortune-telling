import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import { Card } from './Card';
import { SeasonPanel } from './SeasonPanel';
import { LoadingAI } from './LoadingAI';

/* =====================================================
   ICONS
   ===================================================== */
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

/* =====================================================
   GLASS PANEL
   ===================================================== */
const GlassPanel: React.FC<{
  variant?: 'cyan' | 'pink' | 'yellow' | 'neutral';
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ variant = 'neutral', style, children }) => (
  <div
    className={`glass-panel${variant !== 'neutral' ? ` glass-panel-${variant}` : ''}`}
    style={style}
  >
    {children}
  </div>
);

/* =====================================================
   NAV HEADER
   ===================================================== */
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
      <div className="nav-title" style={{ color: 'var(--neon-cyan)' }}>{title}</div>
      <div className="nav-subtitle">{subtitle}</div>
    </div>
  </div>
);

/* =====================================================
   STATUS BADGE
   ===================================================== */
const StatusBadge: React.FC<{ color: string; label: string; value: string | number }> = ({ color, label, value }) => (
  <div style={{
    padding: '6px 14px',
    background: `${color}12`,
    border: `1px solid ${color}40`,
    borderRadius: '20px',
    display: 'flex', alignItems: 'center', gap: '8px',
  }}>
    <span style={{ color, fontSize: '0.7rem' }}>●</span>
    <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{value}</span>
    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{label}</span>
  </div>
);

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

export const AsyncGameBoard: React.FC = () => {
  const navigate = useNavigate();
  const {
    startAsyncGame, addAsyncQuestion, submitAsyncTurn, abandonAsyncGame,
    asyncRoom, lastAiResult, lastXpGain, tierUp, asyncGameOver, seasonState,
    aiThinking, aiRevealedAnswers, asyncQuestions, setAsyncQuestions,
  } = useGameSocket();

  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [turnStartTime, setTurnStartTime] = useState<number | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const [submittedQuestions, setSubmittedQuestions] = useState<any[]>([]);
  const [resumingGame, setResumingGame] = useState(false);
  const [answeringIndex, setAnsweringIndex] = useState(0);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const isGeneratingRef = useRef(false);
  const selectedSubjectRef = useRef<string | null>(null);
  const selectedLevelRef = useRef<string | null>(null);
  const asyncQuestionsRef = useRef<any[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => { selectedSubjectRef.current = selectedSubject; }, [selectedSubject]);
  useEffect(() => { selectedLevelRef.current = selectedLevel; }, [selectedLevel]);
  useEffect(() => { asyncQuestionsRef.current = asyncQuestions || []; }, [asyncQuestions]);

  useEffect(() => {
    if (Array.isArray(asyncQuestions) && asyncQuestions.length > 0) {
      setIsGeneratingQuestion(false);
      isGeneratingRef.current = false;
    }
  }, [asyncQuestions]);

  useEffect(() => {
    if (asyncRoom) setIsStarting(false);
  }, [asyncRoom]);

  const handleStartGame = useCallback(() => {
    setIsStarting(true);
    startAsyncGame(3);
  }, [startAsyncGame]);

  const handleAddQuestion = useCallback(() => {
    if (isGeneratingRef.current) return;
    const subject = selectedSubjectRef.current;
    const level = selectedLevelRef.current;
    const questions = asyncQuestionsRef.current;
    if (!subject || !level) return;
    if (!Array.isArray(questions) || questions.length >= 3) return;

    isGeneratingRef.current = true;
    setIsGeneratingQuestion(true);
    setSelectedSubject(null);
    setSelectedLevel(null);
    addAsyncQuestion(subject, level);
  }, [addAsyncQuestion]);

  const handleStartTurn = useCallback(() => {
    if (!Array.isArray(asyncQuestions) || asyncQuestions.length === 0) return;
    setTurnStartTime(Date.now());
    setAnsweringIndex(0);
    setSubmittedQuestions(asyncQuestions.map(q => ({ ...q, playerAnswer: '' })));
  }, [asyncQuestions]);

  const handleSelectAnswer = useCallback((answer: string) => {
    setSubmittedQuestions(prev => {
      const updated = [...prev];
      if (updated[answeringIndex]) {
        updated[answeringIndex] = { ...updated[answeringIndex], playerAnswer: answer };
      }
      return updated;
    });
  }, [answeringIndex]);

  const handleNextQuestion = useCallback(() => {
    if (answeringIndex < submittedQuestions.length - 1) setAnsweringIndex(answeringIndex + 1);
  }, [answeringIndex, submittedQuestions.length]);

  const handlePrevQuestion = useCallback(() => {
    if (answeringIndex > 0) setAnsweringIndex(answeringIndex - 1);
  }, [answeringIndex]);

  const handleSubmitTurn = useCallback(() => {
    if (submittedQuestions.length === 0) return;
    setShowingResult(true);
    submitAsyncTurn(submittedQuestions);
  }, [submittedQuestions, submitAsyncTurn]);

  const handleNextTurn = useCallback(() => {
    if (asyncRoom?.state === 'completed') return;
    setAsyncQuestions([]);
    setSubmittedQuestions([]);
    setShowingResult(false);
    setTurnStartTime(null);
    setAnsweringIndex(0);
    setResumingGame(false);
  }, [setAsyncQuestions, asyncRoom?.state]);

  const canSubmit = submittedQuestions.length > 0 && submittedQuestions.every(q => q.playerAnswer !== '');
  const effectiveIsStarting = isStarting && !asyncRoom;

  // ========== NO ROOM YET ==========
  if (!asyncRoom) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, rgba(0,229,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(184,127,255,0.04) 0%, transparent 50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 20px',
      }}>
        {/* Back button */}
        <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
          <button className="btn-ghost" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconArrow /> 返回
          </button>
        </div>

        {/* Title */}
        <div className="animate-fade-in-up" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '3.5rem', marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: 'var(--font-display)', fontWeight: 700,
          }}>
            异步对战
          </div>
          <div style={{
            color: 'rgba(0,229,255,0.6)', fontSize: '0.72rem',
            letterSpacing: '4px', textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
          }}>
            Async Battle Mode
          </div>
        </div>

        {/* Rules */}
        <GlassPanel className="animate-fade-in-up delay-1" style={{ padding: '24px 28px', marginBottom: '32px', maxWidth: '440px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
              <span>每回合 <span style={{ color: 'var(--neon-yellow)', fontWeight: 600 }}>最多3题</span></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
              <span>48小时内完成作答</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--neon-cyan)' }}>◈</span>
              <span>与 <span style={{ color: 'var(--neon-pink)', fontWeight: 600 }}>AI 对手</span> 实时对战</span>
            </div>
          </div>
        </GlassPanel>

        <div className="animate-fade-in-up delay-2">
          <SeasonPanel seasonState={seasonState} />
        </div>

        <div style={{ marginTop: '24px' }} />

        {effectiveIsStarting ? (
          <LoadingAI title="正在创建对局..." subtitle="正在初始化异步对战房间" color="#00e5ff" />
        ) : (
          <button
            className="btn-cyber animate-fade-in-up delay-3"
            onClick={handleStartGame}
            style={{ fontSize: '1rem', padding: '14px 40px', letterSpacing: '2px' }}
          >
            ⚡ 开始异步对战
          </button>
        )}
      </div>
    );
  }

  // ========== WAITING (with ongoing game) ==========
  if (asyncRoom.state === 'waiting' && asyncRoom.turnCount > 0 && !resumingGame) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NavHeader title="异步对战" subtitle="与 AI 对战 · 每回合最多3题" onBack={() => navigate('/')} />

          <div className="animate-scale-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--neon-yellow)', marginBottom: '8px', letterSpacing: '2px' }}>
              进行中的对局
            </h2>

            <GlassPanel variant="cyan" style={{ padding: '20px 32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{asyncRoom.playerScore}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '4px' }}>你的分数</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>VS</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--neon-pink)' }}>{asyncRoom.aiScore}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '4px' }}>AI 分数</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: '12px', color: 'var(--neon-yellow)', fontSize: '0.88rem' }}>
                回合 {asyncRoom.turnCount} / {asyncRoom.maxTurns}
              </div>
            </GlassPanel>

            <SeasonPanel seasonState={seasonState} />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
              <button className="btn-cyber" onClick={() => setResumingGame(true)}>
                ⚡ 继续对局
              </button>
              <button
                onClick={abandonAsyncGame}
                style={{
                  padding: '10px 20px', background: 'rgba(255,45,149,0.1)',
                  border: '1px solid var(--neon-pink)', borderRadius: '8px',
                  color: 'var(--neon-pink)', cursor: 'pointer', fontSize: '0.82rem',
                  fontFamily: 'var(--font-display)', letterSpacing: '1px',
                  transition: 'all 0.2s ease',
                }}
              >
                放弃对局
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== GAME OVER ==========
  if (asyncGameOver) {
    const playerWon = asyncGameOver.winner === 'player';
    const resultColor = playerWon ? 'var(--neon-cyan)' : 'var(--neon-pink)';

    return (
      <div style={{ minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NavHeader title="异步对战" subtitle="与 AI 对战 · 每回合最多3题" onBack={() => navigate('/')} />

          <div className="animate-scale-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>
              {playerWon ? '🏆' : '💀'}
            </div>

            <h1 className="animate-fade-in-up" style={{
              fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700,
              color: resultColor, letterSpacing: '4px', textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              {playerWon ? 'Victory' : 'Defeated'}
            </h1>

            <GlassPanel style={{ padding: '24px 40px', marginBottom: '24px', border: `1px solid ${resultColor}30` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{asyncGameOver.finalScore.player}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '4px', letterSpacing: '1px' }}>你</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.5rem' }}>—</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--neon-pink)' }}>{asyncGameOver.finalScore.ai}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '4px', letterSpacing: '1px' }}>AI</div>
                </div>
              </div>
            </GlassPanel>

            {lastXpGain && (
              <GlassPanel variant="yellow" style={{ padding: '16px 24px', marginBottom: '24px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--neon-yellow)' }}>
                  +{lastXpGain.xpEarned} XP
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginTop: '4px' }}>
                  总计 {lastXpGain.totalXp} XP · 段位 {lastXpGain.tier}
                </div>
                {lastXpGain.tierChanged && (
                  <div style={{ color: 'var(--neon-green)', fontSize: '0.9rem', marginTop: '8px' }}>
                    🎉 晋升到 {tierUp}！
                  </div>
                )}
              </GlassPanel>
            )}

            <SeasonPanel seasonState={seasonState} />

            <button className="btn-cyber" onClick={handleStartGame} style={{ marginTop: '24px' }}>
              再来一局
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== AI THINKING ==========
  if (showingResult && aiThinking) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NavHeader title="异步对战" subtitle="与 AI 对战 · 每回合最多3题" onBack={() => navigate('/')} />
          <SeasonPanel seasonState={seasonState} />

          <div className="animate-fade-in-up" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--neon-pink), #ff6b6b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 0 40px rgba(255,45,149,0.3)',
              animation: 'pulse-glow 1.5s ease-in-out infinite',
            }}>
              <span style={{ fontSize: '2.5rem' }}>🤖</span>
            </div>
            <h2 style={{ color: 'var(--neon-pink)', fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '8px', letterSpacing: '2px' }}>
              AI 正在答题...
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>
              请稍候，AI 正在思考题目
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========== TURN RESULT ==========
  if (showingResult && lastAiResult) {
    return (
      <div style={{ minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NavHeader title="异步对战" subtitle="与 AI 对战 · 每回合最多3题" onBack={() => navigate('/')} />
          <SeasonPanel seasonState={seasonState} />

          <h2 className="animate-fade-in-up" style={{
            color: 'var(--neon-cyan)', marginBottom: '16px',
            fontFamily: 'var(--font-display)', fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase'
          }}>
            本回合结果
          </h2>

          <GlassPanel variant="cyan" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', padding: '16px 24px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem', color: 'var(--neon-cyan)' }}>{asyncRoom.playerScore}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '1px', marginTop: '2px' }}>你的分数</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem' }}>VS</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '2rem', color: 'var(--neon-pink)' }}>{lastAiResult.aiScore}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', letterSpacing: '1px', marginTop: '2px' }}>AI 分数</div>
            </div>
          </GlassPanel>

          {lastXpGain && (
            <GlassPanel variant="yellow" style={{ padding: '14px 18px', marginBottom: '16px' }}>
              <div style={{ color: 'var(--neon-yellow)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                +{lastXpGain.xpEarned} XP
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '4px' }}>
                总计 {lastXpGain.totalXp} XP · {lastXpGain.tier}
              </div>
              {lastXpGain.tierChanged && tierUp && (
                <div style={{ color: 'var(--neon-green)', fontSize: '0.88rem', marginTop: '6px' }}>
                  🎉 晋升到 {tierUp}！
                </div>
              )}
            </GlassPanel>
          )}

          <button className="btn-cyber" onClick={handleNextTurn} style={{ width: '100%', marginTop: '8px' }}>
            {asyncRoom.state === 'completed' ? '查看对战结果' : '下一回合'}
          </button>
        </div>
      </div>
    );
  }

  // ========== ANSWERING ==========
  if (turnStartTime && submittedQuestions.length > 0) {
    const currentQ = submittedQuestions[answeringIndex];
    const sub = SUBJECT_CARDS.find(c => c.id === currentQ.subjectId);
    const lv = LEVEL_CARDS.find(c => c.id === currentQ.levelId);

    return (
      <div style={{ minHeight: '100vh', padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <NavHeader title="异步对战" subtitle="与 AI 对战 · 每回合最多3题" onBack={() => navigate('/')} />
          <SeasonPanel seasonState={seasonState} />

          {/* Progress */}
          <GlassPanel variant="cyan" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.82rem', color: 'var(--neon-cyan)', letterSpacing: '1px' }}>
              回合 {Math.min(asyncRoom.turnCount, asyncRoom.maxTurns)} / {asyncRoom.maxTurns}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
              题目 {answeringIndex + 1} / {submittedQuestions.length}
            </div>
          </GlassPanel>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
            {submittedQuestions.map((_, i) => (
              <div key={i} style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: i === answeringIndex ? 'var(--neon-cyan)' : submittedQuestions[i].playerAnswer ? 'var(--neon-green)' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          {/* Question card */}
          <div className="glass-panel animate-fade-in-up" style={{ padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <span style={{ background: 'var(--neon-cyan)', color: '#060912', padding: '4px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {sub?.name}
              </span>
              <span style={{ background: 'var(--neon-yellow)', color: '#060912', padding: '4px 12px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {lv?.name}
              </span>
            </div>

            <div style={{ color: '#e8ecf4', fontSize: '1rem', lineHeight: 1.6, marginBottom: '20px' }}>
              {currentQ.question}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(currentQ.options || []).map((opt: string, i: number) => {
                const letter = String.fromCharCode(65 + i);
                const isSelected = currentQ.playerAnswer === letter;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectAnswer(letter)}
                    style={{
                      background: isSelected ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isSelected ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: '10px', padding: '12px 16px',
                      color: isSelected ? 'var(--neon-cyan)' : '#fff',
                      fontSize: '0.9rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                      background: isSelected ? 'var(--neon-cyan)' : 'rgba(255,255,255,0.1)',
                      color: isSelected ? '#060912' : '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.8rem',
                    }}>
                      {letter}
                    </span>
                    <span>{opt.substring(3)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {answeringIndex > 0 && (
              <button className="btn-ghost" onClick={handlePrevQuestion}>
                ← 上一题
              </button>
            )}
            {answeringIndex < submittedQuestions.length - 1 ? (
              <button
                className="btn-ghost"
                onClick={handleNextQuestion}
                disabled={!currentQ.playerAnswer}
                style={{ opacity: currentQ.playerAnswer ? 1 : 0.4 }}
              >
                下一题 →
              </button>
            ) : (
              <button
                className="btn-cyber"
                onClick={handleSubmitTurn}
                disabled={!canSubmit}
              >
                提交本回合 ✓
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== QUESTION SELECTION ==========
  return (
    <div style={{ minHeight: '100vh', padding: '24px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Generation overlay */}
        {isGeneratingQuestion && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(6,9,18,0.8)', backdropFilter: 'blur(4px)',
          }}>
            <LoadingAI
              title="AI 正在生成题目"
              subtitle={`${selectedSubjectRef.current ? SUBJECT_CARDS.find(c => c.id === selectedSubjectRef.current)?.name : ''} · ${selectedLevelRef.current ? LEVEL_CARDS.find(c => c.id === selectedLevelRef.current)?.name : ''}`}
              color="#b87fff"
            />
          </div>
        )}

        <NavHeader title="异步对战" subtitle="与 AI 对战 · 每回合最多3题" onBack={() => navigate('/')} />

        {/* Turn info bar */}
        <GlassPanel variant="cyan" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--neon-cyan)', letterSpacing: '1px' }}>
            回合 {Math.min(asyncRoom.turnCount, asyncRoom.maxTurns)} / {asyncRoom.maxTurns}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <StatusBadge color="var(--neon-cyan)" label="你" value={asyncRoom.playerScore} />
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>VS</span>
            <StatusBadge color="var(--neon-pink)" label="AI" value={asyncRoom.aiScore} />
          </div>
        </GlassPanel>

        <SeasonPanel seasonState={seasonState} />

        {/* Subject selection */}
        <div className="animate-fade-in-up" style={{ marginBottom: '24px' }}>
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

        {/* Level selection */}
        <div className="animate-fade-in-up delay-1" style={{ marginBottom: '24px' }}>
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

        {/* Action panel */}
        <GlassPanel className="animate-fade-in-up delay-2" style={{ padding: '20px', marginBottom: '20px' }}>
          <button
            className="btn-cyber"
            onClick={handleAddQuestion}
            disabled={!selectedSubject || !selectedLevel || !Array.isArray(asyncQuestions) || asyncQuestions.length >= 3 || isGeneratingQuestion}
            style={{ width: '100%', padding: '14px', marginBottom: '16px', opacity: (!selectedSubject || !selectedLevel) ? 0.5 : 1 }}
          >
            {isGeneratingQuestion ? '🤖 正在生成题目...' : `⚡ 生成题目（${Array.isArray(asyncQuestions) ? asyncQuestions.length : 0}/3）`}
          </button>

          {/* Selected questions */}
          {Array.isArray(asyncQuestions) && asyncQuestions.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <SectionLabel color="var(--neon-green)" text={`已选题目 ${asyncQuestions.length}/3`} />
              {asyncQuestions.map((q, idx) => {
                const sub = SUBJECT_CARDS.find(c => c.id === q.subjectId);
                const lv = LEVEL_CARDS.find(c => c.id === q.levelId);
                return (
                  <div key={idx} style={{
                    background: 'rgba(0,229,255,0.04)',
                    border: `1px solid rgba(0,229,255,0.15)`,
                    borderRadius: '8px', padding: '10px 14px', marginBottom: '8px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    <span style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: 'var(--neon-cyan)', color: '#060912',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 600, fontSize: '0.82rem' }}>{sub?.name}</span>
                    <span style={{ color: 'var(--neon-yellow)', fontSize: '0.78rem' }}>{lv?.name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.4)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                      {q.question ? q.question.substring(0, 25) + '...' : '加载中...'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Start turn button */}
          {Array.isArray(asyncQuestions) && asyncQuestions.length > 0 && !turnStartTime && (
            <button
              className="btn-cyber-yellow"
              onClick={handleStartTurn}
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', letterSpacing: '2px' }}
            >
              ⚡ 开始作答（{asyncQuestions.length}题）
            </button>
          )}

          {(!Array.isArray(asyncQuestions) || asyncQuestions.length === 0) && (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', padding: '12px' }}>
              请先选择学科和难度生成题目
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
};

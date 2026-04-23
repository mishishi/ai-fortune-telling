'use client';
import { useState, useEffect, useRef } from 'react';
import StarField from '@/components/StarField';
import AuroraEffect from '@/components/AuroraEffect';
import BirthForm, { BirthFormData } from '@/components/BirthForm';
import AIQuestionModal from '@/components/AIQuestionModal';
import TodayFortuneModal from '@/components/TodayFortuneModal';
import PushPermissionModal from '@/components/PushPermissionModal';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import DailyFortuneCard from '@/components/DailyFortuneCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type LoadingStep = 'idle' | 'bazi' | 'ai' | 'report' | 'done';

const LOADING_STEPS: { key: LoadingStep; label: string; icon: string }[] = [
  { key: 'bazi', label: '八字排盘', icon: '☯' },
  { key: 'ai', label: 'AI分析', icon: '🔮' },
  { key: 'report', label: '生成报告', icon: '📜' },
];

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [birthData, setBirthData] = useState<BirthFormData | null>(null);
  const [questionRound, setQuestionRound] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('idle');
  const [formVisible, setFormVisible] = useState(true);
  const [initialLoading, setInitialLoading] = useState(false);
  const [coveredTopics, setCoveredTopics] = useState<string[]>([]);
  const [showDoneButton, setShowDoneButton] = useState(false);
  const [showTodayFortune, setShowTodayFortune] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const roundCountRef = useRef(0);

  // Check localStorage on mount to show onboarding if not completed
  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  // Listen for onboarding_completed changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'onboarding_completed' && e.newValue === 'true') {
        setShowOnboarding(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleSubmit = async (data: BirthFormData) => {
    setBirthData(data);
    setMessages([]);
    setQuestionRound(0);
    roundCountRef.current = 0;
    setCoveredTopics([]);
    setShowDoneButton(false);
    setShowModal(true);
    setInitialLoading(true);

    // Get initial AI question
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: '你好，我想了解一下我的命理情况' }],
          conversationHistory: [],
        }),
      });
      if (res.ok) {
        const { response, topic } = await res.json();
        setMessages([{ role: 'assistant', content: response }]);
        if (topic) {
          setCoveredTopics([topic]);
        }
      }
    } catch (error) {
      console.error('Failed to get initial question:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async (message: string) => {
    if (!message.trim() || loading) return;

    setLoading(true);

    // Build the updated messages array (includes the new user message)
    const updatedMessages: Message[] = [...messages, { role: 'user', content: message }];

    // Update state with the new user message
    setMessages(updatedMessages);
    roundCountRef.current += 1;
    setQuestionRound(roundCountRef.current);

    // After 2 rounds, show done button instead of auto-generating
    if (roundCountRef.current >= 2) {
      setShowDoneButton(true);
      setLoading(false);
      return;
    }

    // Get AI follow-up question
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          conversationHistory: updatedMessages,
        }),
      });
      if (res.ok) {
        const { response, topic } = await res.json();
        // Check if AI says to generate report
        if (response.includes('开始生成报告') || response.includes('生成报告')) {
          setShowDoneButton(true);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          if (topic) {
            setCoveredTopics(prev => Array.from(new Set([...prev, topic])));
          }
        }
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLoading(false);
    setLoadingStep('idle');
    setShowModal(false);
    setFormVisible(true);
    setCoveredTopics([]);
    setShowDoneButton(false);
    showToast('已取消生成', 'info');
  };

  const generateReport = async (userFocus?: string) => {
    if (!birthData) return;
    setLoading(true);
    setShowModal(false);
    setFormVisible(false);

    try {
      // Step 1: Calculate BaZi
      setLoadingStep('bazi');

      // Step 2: AI Analysis
      setLoadingStep('ai');
      const baziRes = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthData, userFocus }),
      });
      if (!baziRes.ok) {
        const errData = await baziRes.json().catch(() => ({}));
        console.error('Analyze API error:', errData);
        const errorMsg = errData?.detail?.message || errData?.error || '分析失败，请重试';
        throw new Error(`分析失败: ${errorMsg} | 详情: ${JSON.stringify(errData?.detail || {})}`);
      }
      const result = await baziRes.json();

      // Step 3: Save report
      setLoadingStep('report');
      // Use logged-in user's ID if available, otherwise 'anonymous'
      const reportUserId = user?.userId || 'anonymous';
      const saveRes = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: reportUserId,
          name: birthData.name,
          gender: birthData.gender,
          birthData: birthData,
          baziData: result.baziData || {},
          aiAnalysis: result.analysis || {},
          radarScores: result.radarScores || {},
        }),
      });
      if (!saveRes.ok) {
        throw new Error('保存报告失败，请重试');
      }
      const { id } = await saveRes.json();

      // Done
      setLoadingStep('done');

      // Navigate to report page
      router.push(`/report/${id}`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      showToast('生成报告失败，请重试', 'error');
      setLoading(false);
      setLoadingStep('idle');
      setFormVisible(true);
    }
  };

  const handleDone = () => {
    setShowDoneButton(false);
    generateReport();
  };

  const getStepStatus = (step: LoadingStep): 'completed' | 'active' | 'pending' => {
    if (loadingStep === 'idle' || loadingStep === 'done') return 'pending';
    const stepOrder: LoadingStep[] = ['bazi', 'ai', 'report', 'done'];
    const currentIndex = stepOrder.indexOf(loadingStep);
    const stepIndex = stepOrder.indexOf(step);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {showOnboarding && <OnboardingTutorial onComplete={handleOnboardingComplete} />}
      <StarField />
      <AuroraEffect />
      <AIQuestionModal
        open={showModal}
        messages={messages}
        onSend={handleSend}
        onDone={handleDone}
        isInitialLoading={initialLoading}
        coveredTopics={coveredTopics}
        currentRound={roundCountRef.current + 1}
        totalRounds={2}
        showDoneButton={showDoneButton}
      />

      <TodayFortuneModal
        open={showTodayFortune}
        onClose={() => setShowTodayFortune(false)}
      />

      <PushPermissionModal
        open={showPushModal}
        onClose={() => setShowPushModal(false)}
        onSubscribed={() => showToast('已开启每日推送提醒')}
      />

      {/* Hidden trigger for TodayFortuneModal push button */}
      <button
        id="push-modal-trigger"
        className="hidden"
        onClick={() => setShowPushModal(true)}
        aria-hidden="true"
      />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                <span className="text-sm">☯</span>
              </div>
              <span className="text-white font-semibold text-sm hidden sm:inline">八字命理</span>
            </div>

            {/* Nav Items */}
            <div className="flex items-center gap-1">
              {/* Today Fortune - only for logged in users */}
              {user && (
                <button
                  onClick={() => setShowTodayFortune(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>今日运势</span>
                </button>
              )}

              {/* History Link */}
              <Link
                href="/history"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>历史报告</span>
              </Link>

              {/* User Status */}
              {user ? (
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-[var(--color-gold)]/20 to-[var(--color-gold-dark)]/20 text-[var(--color-gold)] hover:from-[var(--color-gold)]/30 hover:to-[var(--color-gold-dark)]/30 transition-all border border-[var(--color-gold)]/30"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center">
                    <span className="text-xs text-[var(--color-bg)] font-bold">
                      {user.phone.slice(-4, -3)}
                    </span>
                  </div>
                  <span className="hidden sm:inline">已登录</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>未登录</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1
            className="text-h1 md:text-display font-serif text-white mb-4 text-center"
            style={{ textShadow: '0 0 40px rgba(196,30,58,0.6)' }}
          >
            AI 八字命理分析
          </h1>
          <p className="text-gray-400 text-center text-lg tracking-wide">
            输入出生信息，开启你的生命密码
          </p>
        </div>

        {/* Daily Fortune Card - only show when user is logged in */}
        {user && (
          <div className="w-full max-w-md mx-auto mb-6">
            <DailyFortuneCard userId={user.userId} />
          </div>
        )}

        {/* Form / Loading */}
        <div
          className={`w-full max-w-md transition-all duration-300 ${
            loading ? 'opacity-100 translate-y-0' : formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {loading ? (
            <div className="text-center" role="status" aria-live="polite" aria-label="加载状态">
              {/* Destiny Ring Animation */}
              <div className="relative w-40 h-40 mx-auto mb-10">
                {/* Radial Glow behind ring */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    animation: 'glow-pulse 2s ease-in-out infinite',
                    background: loadingStep === 'bazi'
                      ? 'radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, transparent 70%)'
                      : loadingStep === 'ai'
                      ? 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 70%)'
                      : loadingStep === 'report'
                      ? 'radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(196, 30, 58, 0.3) 0%, transparent 70%)',
                    boxShadow: loadingStep === 'bazi'
                      ? '0 0 24px rgba(74, 222, 128, 0.3)'
                      : loadingStep === 'ai'
                      ? '0 0 24px rgba(239, 68, 68, 0.3)'
                      : loadingStep === 'report'
                      ? '0 0 24px rgba(234, 179, 8, 0.3)'
                      : '0 0 24px rgba(196, 30, 58, 0.3)',
                  }}
                />
                {/* Outer Ring - Clockwise 3s */}
                <div
                  className="absolute inset-0 rounded-full border-2 destiny-ring-outer"
                  style={{
                    animation: 'destiny-spin 3s linear infinite',
                    borderColor: 'rgba(196, 30, 58, 0.4)',
                  }}
                />
                {/* Middle Ring - Counter-clockwise 2s */}
                <div
                  className="absolute inset-3 rounded-full border-2 destiny-ring-middle"
                  style={{
                    animation: 'destiny-spin 2s linear infinite reverse',
                    borderColor: 'rgba(212, 175, 55, 0.5)',
                  }}
                />
                {/* Inner Ring - Pulse */}
                <div
                  className="absolute inset-6 rounded-full border destiny-ring-inner"
                  style={{
                    animation: 'destiny-pulse 1.5s ease-in-out infinite',
                    borderColor: 'rgba(240, 198, 116, 0.4)',
                    background: 'radial-gradient(circle, rgba(196, 30, 58, 0.1) 0%, transparent 70%)',
                  }}
                />
                {/* Center ☯ Symbol */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-4xl"
                    style={{
                      animation: 'destiny-pulse 1.5s ease-in-out infinite',
                      textShadow: '0 0 20px rgba(196, 30, 58, 0.8)',
                    }}
                  >
                    ☯
                  </span>
                </div>
              </div>

              {/* Atmospheric Chinese Text */}
              {(loadingStep === 'bazi' || loadingStep === 'ai' || loadingStep === 'report') && (
                <p className="text-lg mb-8 tracking-widest" style={{ color: 'var(--color-accent)' }}>
                  {loadingStep === 'bazi' && '天干地支，五行流转'}
                  {loadingStep === 'ai' && '命盘已现，解读命运'}
                  {loadingStep === 'report' && '命数已定，报告将成'}
                </p>
              )}

              {/* Five Element Step Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {LOADING_STEPS.map((step, index) => {
                    const status = getStepStatus(step.key);
                    // Element colors: wood → fire → earth (cycling through five elements)
                    const elementColors = [
                      { bg: 'rgba(74, 222, 128, 0.15)', text: 'var(--color-loading-wood)', ring: 'rgba(74, 222, 128, 0.4)' },
                      { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--color-loading-fire)', ring: 'rgba(239, 68, 68, 0.4)' },
                      { bg: 'rgba(234, 179, 8, 0.15)', text: 'var(--color-loading-earth)', ring: 'rgba(234, 179, 8, 0.4)' },
                    ];
                    const colorIdx = index % elementColors.length;
                    const colors = elementColors[colorIdx];

                    return (
                      <div key={step.key} className="flex items-center">
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300"
                          style={{
                            background: status === 'completed' ? 'rgba(80, 200, 120, 0.15)' :
                                       status === 'active' ? colors.bg : 'rgba(255, 255, 255, 0.05)',
                            color: status === 'completed' ? 'var(--color-success)' :
                                   status === 'active' ? colors.text : 'var(--color-text-muted)',
                            boxShadow: status === 'active' ? `0 0 12px ${colors.ring}` : 'none',
                            border: status === 'active' ? `1px solid ${colors.ring}` : '1px solid transparent',
                          }}
                        >
                          <span className="text-sm">{step.icon}</span>
                          <span className="text-xs font-medium">{step.label}</span>
                          {status === 'completed' && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        {index < LOADING_STEPS.length - 1 && (
                          <div
                            className="w-8 h-0.5 mx-1 transition-all duration-300"
                            style={{
                              background: status === 'completed' ? 'rgba(80, 200, 120, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shimmer Progress Bar */}
              {(loadingStep === 'bazi' || loadingStep === 'ai' || loadingStep === 'report') && (
                <div className="mb-6 mx-auto" style={{ width: '200px' }}>
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.1)', height: '3px' }}
                  >
                    <div
                      className="rounded-full shimmer-bar"
                      style={{
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s linear infinite',
                        height: '100%',
                        width: loadingStep === 'bazi' ? '30%' : loadingStep === 'ai' ? '60%' : '90%',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Status Text */}
              {(loadingStep === 'bazi' || loadingStep === 'ai' || loadingStep === 'report') && (
                <>
                  <p className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>
                    {loadingStep === 'bazi' && '正在解析出生信息...'}
                    {loadingStep === 'ai' && 'AI 命理师分析中...'}
                    {loadingStep === 'report' && '正在生成命盘报告...'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {loadingStep === 'bazi' && '八字排盘中，请稍候...'}
                    {loadingStep === 'ai' && '解读命运蓝图...'}
                    {loadingStep === 'report' && '命盘整合中...'}
                  </p>
                </>
              )}

              {/* Cancel Button */}
              <button
                onClick={handleCancel}
                className="mt-6 px-6 py-2 rounded-lg text-sm border transition-all hover:bg-white/10"
                style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                取消
              </button>
            </div>
          ) : (
            <BirthForm onSubmit={handleSubmit} />
          )}
        </div>
      </div>
    </main>
  );
}

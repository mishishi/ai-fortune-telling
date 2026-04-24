'use client';
import { useState, useEffect, useRef } from 'react';
import StarField from '@/components/StarField';
import AuroraEffect from '@/components/AuroraEffect';
import BirthForm, { BirthFormData } from '@/components/BirthForm';
import AIQuestionModal from '@/components/AIQuestionModal';
import TodayFortuneModal from '@/components/TodayFortuneModal';
import PushPermissionModal from '@/components/PushPermissionModal';
import OnboardingTutorial from '@/components/OnboardingTutorial';
import DestinyRings from '@/components/DestinyRings';
import LoadingProgress from '@/components/LoadingProgress';
import DailyFortuneCard from '@/components/DailyFortuneCard';
import ProgressiveDisplay from '@/components/ProgressiveDisplay';
import { STAGE_COMPLETE_PROGRESS, AI_PROGRESS_HINTS, type LoadingStage, type AIProgressStep } from '@/types/loading';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { calculateBaZi, BirthInfo } from '@/lib/bazi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type LoadingStep = 'idle' | 'bazi' | 'ai' | 'report' | 'done';

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
  const [aiProgressHint, setAiProgressHint] = useState<AIProgressStep>('analyzing');
  const [partialRadarScores, setPartialRadarScores] = useState<Record<string, number>>({});
  const [partialAnalysis, setPartialAnalysis] = useState<Record<string, any>>({});
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const roundCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    setLoadingStartTime(null);
    setShowModal(false);
    setFormVisible(true);
    setCoveredTopics([]);
    setShowDoneButton(false);
    abortControllerRef.current?.abort();
    showToast('已取消生成', 'info');
  };

  const generateReport = async (userFocus?: string) => {
    if (!birthData) return;
    setLoading(true);
    setLoadingStartTime(Date.now());
    setShowModal(false);
    setFormVisible(false);

    // Reset progressive display state
    setPartialRadarScores({});
    setPartialAnalysis({});

    // Create AbortController and store in ref for cancellation access
    abortControllerRef.current = new AbortController();

    try {
      setLoadingStep('bazi');

      // Connect to streaming endpoint
      const response = await fetch('/api/ai/analyze-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthData, userFocus }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('分析请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;
      let finalData: any = null;

      // Progress hints during streaming
      const progressSteps: AIProgressStep[] = ['analyzing', 'career', 'love', 'wealth', 'health', 'mentor'];
      let hintIndex = 0;
      const hintInterval = setInterval(() => {
        hintIndex = (hintIndex + 1) % progressSteps.length;
        setAiProgressHint(progressSteps[hintIndex]);
      }, 2000);
      setAiProgressHint('analyzing');

      while (!done) {
        // Check abort signal for cancellation
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        let readResult;
        try {
          readResult = await reader.read();
        } catch (e: any) {
          // Handle AbortError from reader.cancel() or signal abortion
          if (e?.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
            break;
          }
          throw e; // Re-throw other errors
        }

        const { value, done: doneReading } = readResult;
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });

          // Process complete events: look for "event: TYPE\ndata: {...}\n\n"
          // Parse line by line, pairing event lines with their data lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          let i = 0;
          while (i < lines.length) {
            const line = lines[i];
            if (line.startsWith('event: ')) {
              const eventType = line.slice(7);
              const dataLine = lines[i + 1];
              if (dataLine?.startsWith('data: ')) {
                try {
                  const data = JSON.parse(dataLine.slice(6));
                  if (eventType === 'bazi') {
                    setLoadingStep('ai');
                  } else if (eventType === 'dimension') {
                    setPartialRadarScores(prev => ({ ...prev, [data.key]: data.score }));
                    setPartialAnalysis(prev => ({ ...prev, ...data.data }));
                  } else if (eventType === 'complete') {
                    finalData = data;
                  } else if (eventType === 'error') {
                    throw new Error(data.error || '分析失败');
                  }
                } catch (e) {
                  // Skip malformed SSE data, don't break the stream
                  console.warn('Skipping malformed SSE data:', e);
                }
                i += 2; // Skip both event and data lines
                continue;
              }
            }
            i++;
          }
        }
      }

      clearInterval(hintInterval);

      // If cancelled mid-stream, don't proceed
      if (!loading) return;

      if (!finalData) {
        throw new Error('未能获取完整分析结果');
      }

      // Step 3: Save report
      setLoadingStep('report');

      const reportUserId = user?.userId || 'anonymous';
      const saveRes = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: reportUserId,
          name: birthData.name,
          gender: birthData.gender,
          birthData: birthData,
          baziData: finalData.baziData,
          aiAnalysis: finalData.analysis || {},
          radarScores: finalData.radarScores || {},
        }),
      });
      if (!saveRes.ok) {
        throw new Error('保存报告失败，请重试');
      }
      const { id } = await saveRes.json();

      setLoadingStep('done');

      // Check if this is a PK flow
      const pkChallengerId = sessionStorage.getItem('pkChallengerId');
      if (pkChallengerId) {
        sessionStorage.removeItem('pkChallengerId');
        const birthdate = `${birthData.year}-${String(birthData.month).padStart(2, '0')}-${String(birthData.day).padStart(2, '0')}`;
        router.push(`/pk/result?from=${pkChallengerId}&birthdate=${birthdate}&gender=${birthData.gender}`);
      } else {
        router.push(`/report/${id}`);
      }
    } catch (error: any) {
      // Handle AbortError (user cancelled)
      if (error?.name === 'AbortError' || error?.message === 'canceled') {
        return; // Already handled by cancel flow
      }
      console.error('Failed to generate report:', error);
      showToast(error.message || '生成报告失败，请重试', 'error');
      setLoading(false);
      setLoadingStep('idle');
      setFormVisible(true);
    }
  };

  const handleDone = () => {
    setShowDoneButton(false);
    generateReport();
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

      <DailyFortuneCard userId={user?.userId} />

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

        {/* Form / Loading */}
        <div
          className={`w-full max-w-md transition-all duration-300 ${
            loading ? 'opacity-100 translate-y-0' : formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {loading ? (
            <div className="text-center" role="status" aria-live="polite" aria-label="加载状态">
              {/* Destiny Rings Animation */}
              <DestinyRings
                stage={loadingStep === 'done' ? 'report' : loadingStep as 'bazi' | 'ai' | 'report'}
                size={160}
                progress={STAGE_COMPLETE_PROGRESS[loadingStep === 'done' ? 'report' : loadingStep as LoadingStage]}
              />

              {/* Atmospheric Chinese Text */}
              {(loadingStep === 'bazi' || loadingStep === 'ai' || loadingStep === 'report') && (
                <p className="text-lg mb-6 tracking-widest" style={{ color: 'var(--color-accent)' }}>
                  {loadingStep === 'bazi' && '天干地支，五行流转'}
                  {loadingStep === 'ai' && '命盘已现，解读命运'}
                  {loadingStep === 'report' && '命数已定，报告将成'}
                </p>
              )}

              {/* Stage Progress with Fixed Percentages */}
              {(loadingStep === 'bazi' || loadingStep === 'ai' || loadingStep === 'report') && (
                <div className="mb-6">
                  <LoadingProgress
                    stage={loadingStep as LoadingStage}
                    progress={STAGE_COMPLETE_PROGRESS[loadingStep as LoadingStage]}
                    aiHint={aiProgressHint}
                    startTime={loadingStartTime || undefined}
                    completedDimensions={Object.keys(partialRadarScores).length}
                  />
                </div>
              )}

              {/* Progressive Results - shown as dimensions complete */}
              {loadingStep === 'ai' && Object.keys(partialRadarScores).length > 0 && (
                <div className="mb-6">
                  <ProgressiveDisplay
                    partialScores={partialRadarScores}
                    partialAnalysis={partialAnalysis}
                    currentHint={aiProgressHint}
                    completedDimensions={Object.keys(partialRadarScores)}
                  />
                </div>
              )}

              {/* Status Text */}
              {(loadingStep === 'bazi' || loadingStep === 'ai' || loadingStep === 'report') && (
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {loadingStep === 'bazi' && '八字排盘中，请稍候...'}
                  {loadingStep === 'ai' && '解读命运蓝图...'}
                  {loadingStep === 'report' && '命盘整合中...'}
                </p>
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

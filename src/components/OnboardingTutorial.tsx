'use client';

import { useState, useEffect } from 'react';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

const STORAGE_KEY = 'onboarding_completed';

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsVisible(true);
      setIsAnimating(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(true);
      }, 150);
    } else {
      handleComplete();
    }
  };

  if (!isVisible) return null;

  const steps = [
    // Step 1: Welcome
    <WelcomeStep key="welcome" onNext={handleNext} />,
    // Step 2: What is BaZi
    <BaZiStep key="bazi" />,
    // Step 3: How to Use
    <HowToUseStep key="howto" />,
    // Step 4: Case Study
    <CaseStudyStep key="case" />,
    // Step 5: Privacy
    <PrivacyStep key="privacy" onStart={handleComplete} />,
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleSkip}
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="relative w-full max-w-[420px] rounded-2xl overflow-hidden shadow-2xl animate-fadeSlideIn"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #1a1525 0%, #2d1f3d 100%)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-sm px-3 py-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          跳过
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          <div
            key={currentStep}
            className="animate-fadeSlideIn"
          >
            {steps[currentStep]}
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 pb-6">
          {[0, 1, 2, 3, 4].map(step => (
            <button
              key={step}
              onClick={() => {
                setIsAnimating(false);
                setTimeout(() => {
                  setCurrentStep(step);
                  setIsAnimating(true);
                }, 150);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? 'bg-[#d4af37] w-4'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Step ${step + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="px-8 pb-8">
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl text-white font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              {currentStep === 0 ? '开始探索' : '下一步'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Step 1: Welcome
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b1538 100%)',
            boxShadow: '0 8px 32px rgba(196, 30, 58, 0.4)',
          }}
        >
          <span className="text-3xl">☰</span>
        </div>
      </div>

      {/* Brand Text */}
      <h1
        className="text-2xl font-bold mb-2"
        style={{
          fontFamily: 'var(--font-serif)',
          background: 'linear-gradient(135deg, #d4af37 0%, #f0c674 50%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        AI 八字命理分析
      </h1>

      {/* Tagline */}
      <p className="text-[var(--color-text-muted)] mb-8">
        探索你的命运密码
      </p>

      {/* Decorative Element */}
      <div className="flex justify-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-[#d4af37] opacity-60"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// Step 2: What is BaZi
function BaZiStep() {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-white mb-6 font-serif">什么是八字命理</h2>

      {/* Visual Diagram */}
      <div className="flex justify-center items-center gap-8 mb-6">
        {/* 天干 */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-2"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            <span className="text-3xl">☰</span>
          </div>
          <p className="text-sm text-[#d4af37] font-medium">天干</p>
          <p className="text-xs text-[var(--color-text-muted)]">Heavenly Stems</p>
        </div>

        {/* Plus Sign */}
        <div className="text-2xl text-[var(--color-text-muted)]">+</div>

        {/* 地支 */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mb-2"
            style={{
              background: 'linear-gradient(135deg, rgba(196, 30, 58, 0.2) 0%, rgba(196, 30, 58, 0.1) 100%)',
              border: '1px solid rgba(196, 30, 58, 0.3)',
            }}
          >
            <span className="text-3xl">☷</span>
          </div>
          <p className="text-sm text-[var(--color-primary)] font-medium">地支</p>
          <p className="text-xs text-[var(--color-text-muted)]">Earthly Branches</p>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
        八字，又称四柱八字，是根据你出生的年、月、日、时，
        计算出由天干和地支组成的命盘，揭示一生的命运走向。
      </p>
    </div>
  );
}

// Step 3: How to Use
function HowToUseStep() {
  const steps = [
    { num: '1', title: '输入出生信息', desc: '填写您的出生日期和时间' },
    { num: '2', title: 'AI 智能分析', desc: '基于传统命理与AI技术结合' },
    { num: '3', title: '获取专属报告', desc: '获得全面详细的命运分析' },
  ];

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-white mb-8 font-serif">如何使用</h2>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Number */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b1538 100%)',
              }}
            >
              <span className="text-white font-bold">{step.num}</span>
            </div>

            {/* Text */}
            <div className="text-left">
              <p className="text-white font-medium">{step.title}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 4: Case Study
function CaseStudyStep() {
  // Sample radar data for 小明
  const radarData = [
    { dimension: '事业', value: 85, color: 'var(--color-dimension-career)' },
    { dimension: '感情', value: 72, color: 'var(--color-dimension-love)' },
    { dimension: '财运', value: 68, color: 'var(--color-dimension-wealth)' },
    { dimension: '健康', value: 90, color: 'var(--color-dimension-health)' },
    { dimension: '贵人', value: 78, color: 'var(--color-dimension-mentor)' },
  ];

  // Calculate radar points for SVG
  const center = 50;
  const maxRadius = 40;
  const getPoint = (index: number, value: number) => {
    const angle = (index * 72 - 90) * (Math.PI / 180);
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const radarPoints = radarData.map((d, i) => getPoint(i, d.value));
  const polygonPoints = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-white mb-6 font-serif">案例展示</h2>

      {/* Sample Report Card */}
      <div
        className="rounded-xl p-4 text-left"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-white font-medium">小明的命运报告</p>
            <p className="text-xs text-[var(--color-text-muted)]">男 · 28岁</p>
          </div>
          <div
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: 'rgba(80, 200, 120, 0.2)',
              color: 'var(--color-success)',
            }}
          >
            已解锁
          </div>
        </div>

        {/* Radar Chart SVG */}
        <div className="flex justify-center mb-4">
          <svg width="120" height="120" viewBox="0 0 100 100">
            {/* Background pentagon */}
            {[20, 40, 60, 80, 100].map(level => (
              <polygon
                key={level}
                points={[0,1,2,3,4].map(i => {
                  const p = getPoint(i, level);
                  return `${p.x},${p.y}`;
                }).join(' ')}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="0.5"
              />
            ))}

            {/* Axis lines */}
            {[0, 1, 2, 3, 4].map(i => {
              const p = getPoint(i, 100);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={p.x}
                  y2={p.y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.5"
                />
              );
            })}

            {/* Data polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(212, 175, 55, 0.3)"
              stroke="#d4af37"
              strokeWidth="1.5"
            />

            {/* Labels */}
            {radarData.map((d, i) => {
              const p = getPoint(i, 110);
              return (
                <text
                  key={i}
                  x={p.x}
                  y={p.y}
                  fill="var(--color-text-muted)"
                  fontSize="6"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {d.dimension}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '事业', value: 85, color: 'var(--color-dimension-career)' },
            { label: '感情', value: 72, color: 'var(--color-dimension-love)' },
            { label: '财运', value: 68, color: 'var(--color-dimension-wealth)' },
            { label: '健康', value: 90, color: 'var(--color-dimension-health)' },
          ].map(item => (
            <div key={item.label} className="text-center">
              <p className="text-xs" style={{ color: item.color }}>{item.label}</p>
              <p className="text-lg font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 5: Privacy
function PrivacyStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      {/* Lock Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.1) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        <span className="text-2xl">🔒</span>
      </div>

      <h2 className="text-xl font-bold text-white mb-6 font-serif">隐私保护</h2>

      {/* Privacy Points */}
      <div className="space-y-3 text-left mb-8">
        {[
          '所有数据仅本地处理，不会上传服务器',
          '您的出生信息仅用于命理分析',
          '完全免费使用，无隐藏收费',
        ].map((point, index) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                background: 'rgba(80, 200, 120, 0.2)',
              }}
            >
              <span className="text-[var(--color-success)] text-xs">✓</span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">{point}</p>
          </div>
        ))}
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-full py-3 rounded-xl text-white font-bold"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b1538 100%)',
          boxShadow: '0 4px 16px rgba(196, 30, 58, 0.4)',
        }}
      >
        开始使用
      </button>
    </div>
  );
}

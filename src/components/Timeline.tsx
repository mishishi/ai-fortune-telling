'use client';
import { useState, useRef, useEffect } from 'react';

interface FortuneLine {
  age: number;
  stem: number;
  branch: number;
  element: number;
}

interface TimelineProps {
  baziData: {
    fortuneLines?: FortuneLine[];
  };
  onFortuneSelect?: (line: FortuneLine) => void;
}

const STEM_NAMES = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENT_NAMES = ['木', '火', '土', '金', '水'];
const ELEMENT_COLORS = [
  'var(--color-element-wood)',
  'var(--color-element-fire)',
  'var(--color-element-earth)',
  'var(--color-element-metal)',
  'var(--color-element-water)',
];

export default function Timeline({ baziData, onFortuneSelect }: TimelineProps) {
  const fortuneLines = baziData.fortuneLines || [];
  const [startIndex, setStartIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Responsive visible count
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const visibleCount = isMobile ? 2 : 4;

  if (fortuneLines.length === 0) {
    return <p className="text-gray-500 text-center">暂无大运数据</p>;
  }

  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + visibleCount < fortuneLines.length;

  const scrollLeft = () => {
    setStartIndex(Math.max(0, startIndex - visibleCount));
  };

  const scrollRight = () => {
    setStartIndex(Math.min(fortuneLines.length - visibleCount, startIndex + visibleCount));
  };

  const visibleLines = fortuneLines.slice(startIndex, startIndex + visibleCount);
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - (baziData as any)?.birthYear + 1;

  return (
    <div className="relative">
      {/* Navigation arrows */}
      <button
        aria-label="向左滚动"
        onClick={scrollLeft}
        disabled={!canScrollLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          canScrollLeft ? 'text-white' : 'text-gray-600 cursor-not-allowed'
        }`}
        style={{
          marginTop: '-20px',
          background: canScrollLeft ? 'rgba(var(--color-primary-rgb), 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: canScrollLeft ? '1px solid rgba(var(--color-primary-rgb), 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        aria-label="向右滚动"
        onClick={scrollRight}
        disabled={!canScrollRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          canScrollRight ? 'text-white' : 'text-gray-600 cursor-not-allowed'
        }`}
        style={{
          marginTop: '-20px',
          background: canScrollRight ? 'rgba(var(--color-primary-rgb), 0.2)' : 'rgba(255, 255, 255, 0.05)',
          border: canScrollRight ? '1px solid rgba(var(--color-primary-rgb), 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Cards container */}
      <div
        ref={scrollRef}
        role="list"
        aria-label="时间轴"
        className="flex gap-4 justify-center overflow-hidden px-10"
      >
        {visibleLines.map((line, i) => {
          const isCurrent = currentAge >= line.age && currentAge < line.age + 10;
          const elementColor = ELEMENT_COLORS[line.element % 5];

          return (
            <div
              key={startIndex + i}
              role="listitem"
              className={`stagger-item flex-shrink-0 w-36 rounded-xl p-4 text-center transition-all cursor-pointer ${
                isCurrent ? 'shadow-lg' : 'hover:scale-[1.02]'
              }`}
              style={{
                background: 'var(--color-surface)',
                border: isCurrent ? `2px solid ${elementColor}` : `1px solid var(--color-border)`,
                boxShadow: isCurrent ? `0 0 20px ${elementColor}30` : 'var(--shadow-md)',
              }}
              onClick={() => onFortuneSelect?.(line)}
            >
              {/* Age range */}
              <div className="text-sm mb-2" style={{ color: isCurrent ? 'white' : 'var(--color-text-muted)' }}>
                {line.age}-{line.age + 9}岁
                {isCurrent && (
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: elementColor + '30', color: elementColor }}>
                    当前
                  </span>
                )}
              </div>

              {/* Pillar */}
              <div
                className="text-h2 font-serif mb-2 tracking-wider"
                style={{ color: isCurrent ? elementColor : 'var(--color-accent)' }}
              >
                {STEM_NAMES[line.stem % 10]}{BRANCH_NAMES[line.branch % 12]}
              </div>

              {/* Element */}
              <div
                className="text-xs px-2 py-1 rounded-full inline-block"
                style={{
                  backgroundColor: elementColor + '20',
                  color: elementColor,
                }}
              >
                {ELEMENT_NAMES[line.element % 5]}运
              </div>
            </div>
          );
        })}
      </div>

      {/* Page indicator dots */}
      {fortuneLines.length > visibleCount && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: Math.ceil(fortuneLines.length / visibleCount) }).map((_, i) => {
            const isActive = i === Math.floor(startIndex / visibleCount);
            return (
              <button
                key={i}
                onClick={() => setStartIndex(i * visibleCount)}
                className={`w-2.5 h-2.5 min-w-[44px] min-h-[44px] rounded-full transition-all flex items-center justify-center ${
                  isActive ? 'bg-[var(--color-primary)] w-4' : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`跳转到第${i + 1}页`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

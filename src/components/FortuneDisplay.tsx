'use client';
import { useState } from 'react';

interface LuckyElements {
  element?: string;
  color?: string;
  number?: string;
  direction?: string;
}

interface NameSuggestions {
  element?: string;
  suggestions?: string;
}

interface FortuneDisplayProps {
  analysis: {
    overall?: string;
    overallPlain?: string;
    career?: string;
    careerSuggest?: string;
    mentorDirection?: string;
    love?: string;
    spouseDesc?: string;
    marriageAdvice?: string;
    wealth?: string;
    health?: string;
    fortune?: string;
    yearly?: string;
    luckyElements?: LuckyElements;
    nameSuggestions?: NameSuggestions;
  };
  isLocked?: boolean; // true = preview mode
}

interface SectionDef {
  key: string;
  title: string;
  color: string;
  sub?: boolean;
  isNested?: boolean;
  basic?: boolean; // Show in preview mode
}

// Basic sections always visible (truncated) in preview
// Advanced sections hidden in preview
const SECTIONS: SectionDef[] = [
  { key: 'overall', title: '命局总评', color: 'var(--color-accent)', basic: true },
  { key: 'overallPlain', title: '通俗解读', color: 'var(--color-accent)', basic: true, sub: true },
  { key: 'career', title: '事业运', color: 'var(--color-dimension-career)', basic: true },
  { key: 'careerSuggest', title: '职业推荐', color: 'var(--color-dimension-career)', sub: true },
  { key: 'mentorDirection', title: '贵人方位', color: 'var(--color-dimension-mentor)', sub: true },
  { key: 'love', title: '感情运', color: 'var(--color-dimension-love)', basic: true },
  { key: 'spouseDesc', title: '配偶特征', color: 'var(--color-dimension-love)', sub: true },
  { key: 'marriageAdvice', title: '婚恋建议', color: 'var(--color-dimension-love)', sub: true },
  { key: 'wealth', title: '财运', color: 'var(--color-dimension-wealth)', basic: true },
  { key: 'health', title: '健康运', color: 'var(--color-dimension-health)', basic: true },
  { key: 'fortune', title: '大运趋势', color: 'var(--color-secondary)', basic: true },
  { key: 'yearly', title: '流年预测', color: 'var(--color-error)', basic: true },
  { key: 'luckyElements', title: '幸运元素', color: 'var(--color-dimension-health)', isNested: true },
  { key: 'nameSuggestions', title: '起名建议', color: 'var(--color-dimension-health)', isNested: true },
];

// Truncate text to first sentence (ends with 。 or ； or ？)
function truncateText(text: string, maxChars: number = 60): string {
  if (!text) return '暂无解读';
  // Find first sentence ending
  const firstSentence = text.match(/[^。；？]+[。；？]/);
  if (firstSentence) {
    return firstSentence[0].slice(0, maxChars + 3) + '...';
  }
  return text.slice(0, maxChars) + '...';
}

function LuckyElementsDisplay({ data }: { data?: LuckyElements }) {
  if (!data) {
    return <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>暂无数据</p>;
  }

  const items = [
    { label: '幸运五行', value: data?.element, icon: '✦' },
    { label: '幸运颜色', value: data?.color, icon: '◈' },
    { label: '幸运数字', value: data?.number, icon: '◇' },
    { label: '幸运方位', value: data?.direction, icon: '↯' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg p-3 transition-all duration-200 hover:bg-white/5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-1.5 mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <span className="text-xs opacity-60">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </div>
          <div className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{item.value || '暂无'}</div>
        </div>
      ))}
    </div>
  );
}

function NameSuggestionsDisplay({ data }: { data?: NameSuggestions }) {
  if (!data) {
    return <p className="text-gray-500 text-sm">暂无数据</p>;
  }

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg p-4 transition-all duration-200 hover:bg-white/5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs" style={{ color: 'var(--color-dimension-wealth)' }}>◇</span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>补救五行</span>
        </div>
        <div className="text-sm text-gray-200 leading-relaxed">{data?.element || '暂无'}</div>
      </div>
      <div
        className="rounded-lg p-4 transition-all duration-200 hover:bg-white/5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs" style={{ color: 'var(--color-accent)' }}>✦</span>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>起名建议</span>
        </div>
        <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{data?.suggestions || '暂无'}</div>
      </div>
    </div>
  );
}

export default function FortuneDisplay({ analysis, isLocked = false }: FortuneDisplayProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overall');

  const toggleSection = (key: string) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  const renderContent = (key: string, forPreview: boolean = false) => {
    if (key === 'luckyElements') {
      return <LuckyElementsDisplay data={analysis.luckyElements} />;
    }
    if (key === 'nameSuggestions') {
      return <NameSuggestionsDisplay data={analysis.nameSuggestions} />;
    }
    const value = analysis[key as keyof typeof analysis];
    if (typeof value === 'string') {
      const displayValue = forPreview ? truncateText(value) : (value || '暂无解读');
      return <p className="leading-relaxed text-sm" style={{ color: 'var(--color-text-secondary)' }}>{displayValue}</p>;
    }
    return <p className="leading-relaxed text-sm" style={{ color: 'var(--color-text-secondary)' }}>暂无解读</p>;
  };

  // Filter sections based on lock status
  const visibleSections = isLocked
    ? SECTIONS.filter(s => s.basic && !s.sub && !s.isNested)
    : SECTIONS;

  return (
    <div className="space-y-3">
      {visibleSections.map((section) => {
        const isExpanded = expandedSection === section.key;
        const isPreview = isLocked && section.basic;

        return (
          <div
            key={section.key}
            className={`rounded-xl overflow-hidden transition-all duration-300 ${
              section.sub ? 'ml-3' : ''
            }`}
            style={{
              background: 'rgba(26, 21, 37, 0.5)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isExpanded ? section.color + '50' : 'rgba(212,175,55,0.12)'}`,
              boxShadow: isExpanded ? `0 0 20px ${section.color}20` : 'none',
            }}
          >
            {/* Header */}
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full px-5 py-4 flex items-center justify-between transition-all duration-200 hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: section.color,
                    boxShadow: isExpanded ? `0 0 8px ${section.color}` : 'none',
                  }}
                />
                <h3
                  className={`font-semibold ${section.sub ? 'text-sm' : 'text-base'}`}
                  style={{
                    color: section.color,
                    fontFamily: section.key === 'overall' || section.key === 'overallPlain'
                      ? 'var(--font-serif), serif'
                      : 'inherit',
                  }}
                >
                  {section.title}
                </h3>
                {isPreview && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    预览
                  </span>
                )}
              </div>
              <svg
                className={`w-5 h-5 transition-all duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                style={{
                  color: section.color,
                  opacity: 0.6,
                  transform: isExpanded ? 'scale(1.1)' : 'scale(1)',
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Content */}
            <div
              className={`transition-all duration-300 ease-out overflow-hidden`}
              style={{
                maxHeight: isExpanded ? '500px' : '0',
                opacity: isExpanded ? 1 : 0,
              }}
            >
              <div className="px-5 pb-5">
                {renderContent(section.key, isPreview)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Lock message for preview */}
      {isLocked && (
        <div
          className="mt-6 p-5 rounded-xl text-center transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(196,30,58,0.08) 100%)',
            border: '1px solid rgba(212,175,55,0.2)',
          }}
        >
          <p className="font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>
            解锁完整报告查看更多详情
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            职业推荐 · 贵人方位 · 配偶特征 · 婚恋建议 · 幸运元素 · 起名建议
          </p>
        </div>
      )}
    </div>
  );
}

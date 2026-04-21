'use client';
import { useState } from 'react';
import UnlockPanel from './UnlockPanel';

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
  reportId?: string;
  isLocked?: boolean; // true = preview mode
}

interface SectionDef {
  key: string;
  title: string;
  color: string;
  sub?: boolean;
  isNested?: boolean;
  basic?: boolean; // Show in preview mode
  tier?: number; // 1-4, higher = more important
  group?: string; // Visual group identifier
}

// Basic sections always visible (truncated) in preview
// Advanced sections hidden in preview
const SECTIONS: SectionDef[] = [
  // ===== Tier 1: Core Overview (highest priority) =====
  // Overview Group
  { key: 'overall', title: '命局总评', color: 'var(--color-accent)', basic: true, tier: 1, group: 'overview' },
  { key: 'overallPlain', title: '通俗解读', color: 'var(--color-accent)', basic: true, sub: true, tier: 1, group: 'overview' },

  // Wealth Group
  { key: 'wealth', title: '财运', color: 'var(--color-dimension-wealth)', basic: true, tier: 1, group: 'wealth' },
  { key: 'fortune', title: '大运趋势', color: 'var(--color-secondary)', basic: true, tier: 1, group: 'wealth' },

  // ===== Tier 2: Life Dimensions =====
  // Career Group
  { key: 'career', title: '事业运', color: 'var(--color-dimension-career)', basic: true, tier: 2, group: 'career' },
  { key: 'careerSuggest', title: '职业推荐', color: 'var(--color-dimension-career)', sub: true, tier: 2, group: 'career' },
  { key: 'mentorDirection', title: '贵人方位', color: 'var(--color-dimension-mentor)', sub: true, tier: 2, group: 'career' },

  // Love Group
  { key: 'love', title: '感情运', color: 'var(--color-dimension-love)', basic: true, tier: 2, group: 'love' },
  { key: 'spouseDesc', title: '配偶特征', color: 'var(--color-dimension-love)', sub: true, tier: 2, group: 'love' },
  { key: 'marriageAdvice', title: '婚恋建议', color: 'var(--color-dimension-love)', sub: true, tier: 2, group: 'love' },

  // Health Group
  { key: 'health', title: '健康运', color: 'var(--color-dimension-health)', basic: true, tier: 2, group: 'health' },

  // ===== Tier 3: Predictions =====
  { key: 'yearly', title: '流年预测', color: 'var(--color-error)', basic: true, tier: 3, group: 'prediction' },
  { key: 'luckyElements', title: '幸运元素', color: 'var(--color-dimension-health)', isNested: true, tier: 3, group: 'prediction' },

  // ===== Tier 4: Tools =====
  { key: 'nameSuggestions', title: '起名建议', color: 'var(--color-dimension-health)', isNested: true, tier: 4, group: 'tools' },
];

// Group labels for visual separation
const GROUP_LABELS: Record<string, { label: string; tier: number }> = {
  'overview': { label: '命局总览', tier: 1 },
  'wealth': { label: '财富运势', tier: 1 },
  'career': { label: '事业维度', tier: 2 },
  'love': { label: '感情维度', tier: 2 },
  'health': { label: '健康维度', tier: 2 },
  'prediction': { label: '命运预测', tier: 3 },
  'tools': { label: '工具箱', tier: 4 },
};

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

// Group separator with tier-based visual weight
function GroupSeparator({ label, tier }: { label: string; tier: number }) {
  const opacity = Math.max(0.3, 0.6 - (tier - 1) * 0.1);
  const leftPadding = (tier - 1) * 12; // Indent based on tier

  return (
    <div
      className="flex items-center gap-3 my-4 px-2"
      style={{ paddingLeft: `${leftPadding}px` }}
    >
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(212,175,55,${opacity}), transparent)`
        }}
      />
      <span
        className="text-xs font-medium tracking-widest uppercase"
        style={{
          color: `rgba(212,175,55,${opacity})`,
          fontFamily: 'var(--font-serif), serif',
        }}
      >
        {label}
      </span>
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(212,175,55,${opacity}), transparent)`
        }}
      />
    </div>
  );
}

export default function FortuneDisplay({ analysis, isLocked = false, reportId }: FortuneDisplayProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('overall');

  const toggleSection = (key: string) => {
    setExpandedSection(expandedSection === key ? null : key);
  };

  // Get unique groups in order of first appearance
  const getGroups = () => {
    const seen = new Set<string>();
    const groups: { key: string; section: SectionDef }[] = [];
    for (const section of visibleSections) {
      if (section.group && !seen.has(section.group)) {
        seen.add(section.group);
        groups.push({ key: section.group, section });
      }
    }
    return groups;
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
    <div className="space-y-4 animate-fade-in-up">
      {getGroups().map(({ key: groupKey, section: firstSection }) => {
        const groupInfo = GROUP_LABELS[groupKey];
        const groupSections = visibleSections.filter(s => s.group === groupKey);

        return (
          <div key={groupKey}>
            <GroupSeparator label={groupInfo.label} tier={groupInfo.tier} />
            {groupSections.map((section) => {
              const isExpanded = expandedSection === section.key;
              const isPreview = isLocked && section.basic;

              return (
                <div
                  key={section.key}
                  className="rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    background: 'rgba(26, 21, 37, 0.5)',
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${isExpanded ? section.color + '50' : 'rgba(212,175,55,0.12)'}`,
                    boxShadow: isExpanded ? `0 0 20px ${section.color}20` : 'none',
                    marginLeft: section.sub ? '0' : undefined,
                  }}
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleSection(section.key)}
                    aria-expanded={isExpanded}
                    aria-controls={`section-content-${section.key}`}
                    className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-[var(--radius-md)] transition-colors stagger-item"
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
                      {section.tier === 1 && (
                        <span
                          className="text-xs px-2 py-0.5 rounded ml-2"
                          style={{
                            background: `linear-gradient(135deg, ${section.color}30, ${section.color}15)`,
                            color: section.color,
                            border: `1px solid ${section.color}40`,
                          }}
                        >
                          核心
                        </span>
                      )}
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
                    id={`section-content-${section.key}`}
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
          </div>
        );
      })}

      <UnlockPanel reportId={reportId || ''} hiddenSections={[]} isLocked={isLocked} />
    </div>
  );
}

'use client';

import { useMemo, useRef, useState } from 'react';

interface Report {
  id: string;
  name: string;
  gender: string;
  birthData?: string;
  createdAt: string;
  radarScores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  aiAnalysis?: {
    overall: string;
    career: string;
    love: string;
    wealth: string;
    health: string;
    fortune: string;
    yearly: string;
  };
  unlocked?: boolean;
}

interface FortuneTimelineProps {
  reports: Report[];
  onSelect?: (selectedIds: string[]) => void;
}

interface YearGroup {
  year: number;
  reports: Report[];
}

// Calculate average radar score from all available dimensions
function calculateAverageScore(radarScores: Report['radarScores']): number {
  const scores: number[] = [];
  if (radarScores.career !== undefined) scores.push(radarScores.career);
  if (radarScores.love !== undefined) scores.push(radarScores.love);
  if (radarScores.wealth !== undefined) scores.push(radarScores.wealth);
  if (radarScores.health !== undefined) scores.push(radarScores.health);
  if (radarScores.mentor !== undefined) scores.push(radarScores.mentor);

  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Get score color based on value
function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--color-primary)';
  if (score >= 60) return 'var(--color-accent)';
  if (score >= 40) return '#a0a0a0';
  return '#666666';
}

export default function FortuneTimeline({ reports, onSelect }: FortuneTimelineProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);

  // Group reports by year
  const yearGroups = useMemo((): YearGroup[] => {
    const groups: Map<number, Report[]> = new Map();

    reports.forEach(report => {
      const year = new Date(report.createdAt).getFullYear();
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(report);
    });

    // Sort years descending, reports within year by date descending
    return Array.from(groups.entries())
      .map(([year, yearReports]) => ({
        year,
        reports: yearReports.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => b.year - a.year);
  }, [reports]);

  // Flatten all reports for horizontal display with year separators
  const timelineItems = useMemo(() => {
    const items: Array<{ type: 'year'; year: number; count: number } | { type: 'report'; report: Report }> = [];

    yearGroups.forEach(group => {
      items.push({ type: 'year', year: group.year, count: group.reports.length });
      group.reports.forEach(report => {
        items.push({ type: 'report', report });
      });
    });

    return items;
  }, [yearGroups]);

  const visibleCount = 4;
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + visibleCount < timelineItems.length;

  const scrollLeft = () => {
    setStartIndex(Math.max(0, startIndex - visibleCount));
  };

  const scrollRight = () => {
    setStartIndex(Math.min(timelineItems.length - visibleCount, startIndex + visibleCount));
  };

  const handleSelect = (report: Report) => {
    setSelectedIds(prev => {
      let newSelected: string[];
      if (prev.includes(report.id)) {
        newSelected = prev.filter(id => id !== report.id);
      } else if (prev.length >= 2) {
        // Replace the oldest selection
        newSelected = [prev[1], report.id];
      } else {
        newSelected = [...prev, report.id];
      }
      onSelect?.(newSelected);
      return newSelected;
    });
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--color-text-muted)]">暂无报告数据</p>
      </div>
    );
  }

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

      {/* Timeline container */}
      <div
        ref={scrollRef}
        role="list"
        aria-label="运势时间轴"
        className="flex gap-4 justify-center overflow-hidden px-10"
      >
        {timelineItems.slice(startIndex, startIndex + visibleCount * 2 + 2).map((item, i) => {
          if (item.type === 'year') {
            const isFirst = startIndex === 0 && i === 0;
            const prevItem = i > 0 ? timelineItems[startIndex + i - 1] : null;
            const showYear = i === 0 || (prevItem && prevItem.type === 'report');

            return (
              <div
                key={`year-${item.year}`}
                className="flex-shrink-0 flex flex-col items-center justify-center w-20"
              >
                <span
                  className="text-lg font-medium"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {item.year}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {item.count}份
                </span>
              </div>
            );
          }

          const { report } = item;
          const isSelected = selectedIds.includes(report.id);
          const selectionIndex = selectedIds.indexOf(report.id);
          const avgScore = calculateAverageScore(report.radarScores);
          const scoreColor = getScoreColor(avgScore);

          return (
            <div
              key={report.id}
              role="listitem"
              className={`stagger-item flex-shrink-0 w-36 rounded-xl p-4 text-center transition-all cursor-pointer ${
                isSelected ? 'shadow-lg' : 'hover:scale-[1.02]'
              }`}
              style={{
                background: 'var(--color-surface)',
                border: isSelected
                  ? '2px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
                boxShadow: isSelected
                  ? '0 0 20px rgba(var(--color-primary-rgb), 0.3)'
                  : 'var(--shadow-md)',
              }}
              onClick={() => handleSelect(report)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                  }}
                >
                  {selectionIndex + 1}
                </div>
              )}

              {/* Name */}
              <div className="text-sm mb-2 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                {report.name}
              </div>

              {/* Average Score */}
              <div
                className="text-h2 font-serif mb-2"
                style={{ color: scoreColor }}
              >
                {avgScore}
              </div>

              {/* Score label */}
              <div
                className="text-xs px-2 py-1 rounded-full inline-block"
                style={{
                  backgroundColor: scoreColor + '20',
                  color: scoreColor,
                }}
              >
                综合评分
              </div>

              {/* Date */}
              <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                {new Date(report.createdAt).toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Page indicator dots */}
      {timelineItems.length > visibleCount && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: Math.ceil(timelineItems.length / visibleCount) }).map((_, i) => {
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

      {/* Selection hint */}
      {selectedIds.length > 0 && selectedIds.length < 2 && (
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-2">
          还可以选择 {2 - selectedIds.length} 个报告进行对比
        </p>
      )}
    </div>
  );
}

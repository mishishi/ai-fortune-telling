'use client';

import { useState, useMemo } from 'react';
import { Skeleton } from './Skeleton';

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

interface FortuneDashboardProps {
  reports: Report[];
  currentUserId: string;
}

interface YearGroup {
  year: number;
  reports: Report[];
}

export default function FortuneDashboard({ reports, currentUserId }: FortuneDashboardProps) {
  const [selectedReports, setSelectedReports] = useState<[Report | null, Report | null]>([null, null]);

  // Group reports by year from createdAt
  const yearGroups = useMemo(() => {
    const groups: Map<number, Report[]> = new Map();

    reports.forEach(report => {
      const year = new Date(report.createdAt).getFullYear();
      if (!groups.has(year)) {
        groups.set(year, []);
      }
      groups.get(year)!.push(report);
    });

    // Sort years descending
    const sortedGroups: YearGroup[] = Array.from(groups.entries())
      .map(([year, reports]) => ({
        year,
        reports: reports.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
      }))
      .sort((a, b) => b.year - a.year);

    return sortedGroups;
  }, [reports]);

  const handleSelectReport = (report: Report, slot: 0 | 1) => {
    setSelectedReports(prev => {
      const newSelected = [...prev] as [Report | null, Report | null];
      newSelected[slot] = report;
      return newSelected;
    });
  };

  // Empty state
  if (reports.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="gold-divider mx-auto mb-8 w-24 animate-fade-in" style={{ animationDelay: '0ms' }}></div>

        <p
          className="text-h3 text-[var(--color-text-secondary)] mb-3 animate-fade-in-up font-serif"
          style={{ animationDelay: '200ms', textShadow: '0 0 20px rgba(212,175,55,0.2)' }}
        >
          暂无运势数据
        </p>

        <p className="text-body text-[var(--color-text-muted)] mb-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          生成你的第一份运势报告，开启命运追踪之旅
        </p>

        <div className="gold-divider mx-auto mt-10 w-24 animate-fade-in" style={{ animationDelay: '500ms' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Year Grouped Reports */}
      {yearGroups.map(group => (
        <div key={group.year} className="space-y-3">
          {/* Year Header */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-[var(--color-accent)]">{group.year}</span>
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-[var(--color-text-muted)]">{group.reports.length} 份报告</span>
          </div>

          {/* Reports in this year */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.reports.map(report => (
              <div
                key={report.id}
                onClick={() => handleSelectReport(report, 0)}
                className={`
                  p-4 rounded-xl cursor-pointer transition-all
                  ${selectedReports[0]?.id === report.id || selectedReports[1]?.id === report.id
                    ? 'bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                {/* Placeholder content - to be replaced with FortuneTimeline */}
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-white">{report.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {new Date(report.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {report.radarScores.career !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-[var(--color-text-secondary)]">
                        事业 {report.radarScores.career}
                      </span>
                    )}
                    {report.radarScores.love !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-[var(--color-text-secondary)]">
                        感情 {report.radarScores.love}
                      </span>
                    )}
                    {report.radarScores.wealth !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-[var(--color-text-secondary)]">
                        财富 {report.radarScores.wealth}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* YearlySummary Placeholder */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-medium text-[var(--color-accent)] mb-3">年度运势总结</h3>
        <div className="text-[var(--color-text-muted)]">
          {/* Placeholder for YearlySummary component */}
          <p className="text-sm">年度运势总结组件 - 待实现</p>
        </div>
      </div>

      {/* RadarCompareView Placeholder */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10">
        <h3 className="text-lg font-medium text-[var(--color-accent)] mb-3">运势对比</h3>
        <div className="text-[var(--color-text-muted)]">
          {/* Placeholder for RadarCompareView component */}
          <p className="text-sm">雷达图对比组件 - 待实现</p>
          {selectedReports[0] && selectedReports[1] && (
            <p className="text-xs mt-2 text-[var(--color-text-secondary)]">
              已选择: {selectedReports[0].name} vs {selectedReports[1].name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

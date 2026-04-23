'use client';

import { useState, useMemo } from 'react';
import FortuneTimeline from './FortuneTimeline';
import YearlySummary from './YearlySummary';
import RadarCompareView from './RadarCompareView';

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

  const handleSelectReport = (report: Report) => {
    setSelectedReports(prev => {
      // If already selected, deselect it
      if (prev[0]?.id === report.id) {
        return [null, prev[1]];
      }
      if (prev[1]?.id === report.id) {
        return [prev[0], null];
      }
      // Fill empty slot (prefer slot 0 first)
      if (!prev[0]) {
        return [report, prev[1]];
      }
      if (!prev[1]) {
        return [prev[0], report];
      }
      // Both filled, replace slot 0 (keep slot 1 as more recent)
      return [report, prev[1]];
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

  const selectedCount = (selectedReports[0] ? 1 : 0) + (selectedReports[1] ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Selection Instruction */}
      <div
        className="rounded-lg p-4 text-center"
        style={{
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        {selectedCount === 0 && (
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            点击选择两份报告进行对比分析
          </p>
        )}
        {selectedCount === 1 && (
          <p className="text-sm" style={{ color: 'var(--color-accent)' }}>
            已选择 1 份报告，请再选择 1 份
          </p>
        )}
        {selectedCount === 2 && (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            已选择 2 份报告，对比分析如下
          </p>
        )}
      </div>

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
            {group.reports.map(report => {
              const isSelected = selectedReports[0]?.id === report.id || selectedReports[1]?.id === report.id;
              const slot = selectedReports[0]?.id === report.id ? 'A' : selectedReports[1]?.id === report.id ? 'B' : null;

              return (
              <div
                key={report.id}
                onClick={() => handleSelectReport(report)}
                className={`
                  p-4 rounded-xl cursor-pointer transition-all relative
                  ${isSelected
                    ? 'bg-[var(--color-primary)]/20 border-2 border-[var(--color-primary)]'
                    : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }
                `}
              >
                {/* Slot indicator badge */}
                {slot && (
                  <div
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(196, 30, 58, 0.4)',
                    }}
                  >
                    {slot}
                  </div>
                )}

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
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(196,30,58,0.15)', color: '#c41e3a' }}>
                        事业 {report.radarScores.career}
                      </span>
                    )}
                    {report.radarScores.love !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(107,91,149,0.15)', color: '#6b5b95' }}>
                        感情 {report.radarScores.love}
                      </span>
                    )}
                    {report.radarScores.wealth !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(212,175,55,0.15)', color: '#d4af37' }}>
                        财富 {report.radarScores.wealth}
                      </span>
                    )}
                    {report.radarScores.health !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(45,106,79,0.15)', color: '#2d6a4f' }}>
                        健康 {report.radarScores.health}
                      </span>
                    )}
                    {report.radarScores.mentor !== undefined && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(30,58,95,0.15)', color: '#1e3a5f' }}>
                        贵人 {report.radarScores.mentor}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      ))}

      {/* YearlySummary */}
      {reports.length > 0 && (
        <YearlySummary latestReport={reports[0]} />
      )}

      {/* RadarCompareView */}
      {selectedReports[0] && selectedReports[1] && (
        <RadarCompareView reportA={selectedReports[0]} reportB={selectedReports[1]} />
      )}
    </div>
  );
}

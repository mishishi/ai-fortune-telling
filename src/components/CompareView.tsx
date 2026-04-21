'use client';

import { useState } from 'react';
import MiniRadar from './MiniRadar';

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

interface CompareViewProps {
  report1: Report;
  report2: Report;
  onClose: () => void;
}

const DIMENSIONS = [
  { key: 'career', label: '事业', color: 'var(--color-dimension-career)' },
  { key: 'love', label: '感情', color: 'var(--color-dimension-love)' },
  { key: 'wealth', label: '财运', color: 'var(--color-dimension-wealth)' },
  { key: 'health', label: '健康', color: 'var(--color-dimension-health)' },
  { key: 'mentor', label: '贵人', color: 'var(--color-dimension-mentor)' },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '未知日期' : date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function CompareView({ report1, report2, onClose }: CompareViewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const getScore = (report: Report, key: string): number => {
    return report.radarScores[key as keyof typeof report.radarScores] || 0;
  };

  const renderComparisonBar = (score1: number, score2: number, maxScore: number = 100) => {
    const higher = score1 > score2 ? 1 : score1 < score2 ? 2 : 0;
    const pct1 = (score1 / maxScore) * 100;
    const pct2 = (score2 / maxScore) * 100;

    return (
      <div className="flex gap-2 items-center">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${higher === 1 ? 'bg-green-500' : 'bg-[var(--color-primary)]'}`}
            style={{ width: `${pct1}%` }}
          />
        </div>
        <span className={`text-xs font-medium min-w-[20px] text-right ${higher === 1 ? 'text-green-400' : 'text-gray-400'}`}>
          {score1}
        </span>
        <div className="w-4 h-4 flex items-center justify-center">
          {higher === 1 && <span className="text-green-400 text-xs">▲</span>}
          {higher === 2 && <span className="text-red-400 text-xs">▼</span>}
        </div>
        <span className={`text-xs font-medium min-w-[20px] ${higher === 2 ? 'text-green-400' : 'text-gray-400'}`}>
          {score2}
        </span>
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${higher === 2 ? 'bg-green-500' : 'bg-[var(--color-secondary)]'}`}
            style={{ width: `${pct2}%` }}
          />
        </div>
      </div>
    );
  };

  const renderSection = (key: string, label: string, content1: string, content2: string) => {
    const isExpanded = expandedSection === key;

    return (
      <div className="border-t border-white/10">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : key)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <span className="text-gray-300 font-medium">{label}</span>
          <span className="text-gray-500 text-sm">{isExpanded ? '▲' : '▼'}</span>
        </button>
        {isExpanded && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-300 leading-relaxed">
              {content1 || '暂无内容'}
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-300 leading-relaxed">
              {content2 || '暂无内容'}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-bg)] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <span className="text-lg">←</span>
            <span>返回</span>
          </button>
          <h1 className="flex-1 text-center text-white font-serif text-h2">报告对比</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Side by Side Comparison */}
      <div className="flex flex-col md:flex-row">
        {/* Report 1 Column */}
        <div className="flex-1 md:border-r" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="p-5 text-center border-b border-white/10">
            <h2 className="text-h3 font-serif text-white">{report1.name}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{formatDate(report1.createdAt)}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-2 ${
              report1.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
            }`}>
              {report1.gender === 'male' ? '男' : '女'}
            </span>
          </div>

          {/* Radar Chart */}
          <div className="flex justify-center py-6 border-b border-white/10">
            <MiniRadar scores={report1.radarScores} size={120} />
          </div>

          {/* Score Comparison */}
          <div className="p-4 space-y-4">
            {DIMENSIONS.map(dim => (
              <div key={dim.key}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ color: dim.color }}>{dim.label}</span>
                </div>
                {renderComparisonBar(getScore(report1, dim.key), getScore(report2, dim.key))}
              </div>
            ))}
          </div>
        </div>

        {/* Report 2 Column */}
        <div className="flex-1">
          <div className="p-5 text-center border-b border-white/10">
            <h2 className="text-h3 font-serif text-white">{report2.name}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{formatDate(report2.createdAt)}</p>
            <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-2 ${
              report2.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
            }`}>
              {report2.gender === 'male' ? '男' : '女'}
            </span>
          </div>

          {/* Radar Chart */}
          <div className="flex justify-center py-6 border-b border-white/10">
            <MiniRadar scores={report2.radarScores} size={120} />
          </div>

          {/* Score Comparison */}
          <div className="p-4 space-y-4">
            {DIMENSIONS.map(dim => (
              <div key={dim.key}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ color: dim.color }}>{dim.label}</span>
                </div>
                {renderComparisonBar(getScore(report2, dim.key), getScore(report1, dim.key))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Sections - Full Width */}
      <div className="border-t border-white/10">
        <div className="p-4 text-center">
          <h3 className="text-white font-bold">详细分析对比</h3>
        </div>
        {report1.aiAnalysis && report2.aiAnalysis && (
          <>
            {renderSection('overall', '综合运势', report1.aiAnalysis.overall, report2.aiAnalysis.overall)}
            {renderSection('fortune', '运势分析', report1.aiAnalysis.fortune, report2.aiAnalysis.fortune)}
            {renderSection('career', '事业运势', report1.aiAnalysis.career, report2.aiAnalysis.career)}
            {renderSection('love', '感情运势', report1.aiAnalysis.love, report2.aiAnalysis.love)}
            {renderSection('wealth', '财运运势', report1.aiAnalysis.wealth, report2.aiAnalysis.wealth)}
            {renderSection('health', '健康运势', report1.aiAnalysis.health, report2.aiAnalysis.health)}
            {renderSection('yearly', '年运趋势', report1.aiAnalysis.yearly, report2.aiAnalysis.yearly)}
          </>
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-8" />
    </div>
  );
}

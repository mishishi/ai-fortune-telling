'use client';

import RadarChartComponent from './RadarChart';

interface Report {
  id: string;
  name: string;
  gender: string;
  createdAt: string;
  radarScores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
}

interface RadarCompareViewProps {
  reportA: Report;
  reportB: Report;
}

const DIMENSIONS = [
  { key: 'career', label: '事业', angle: 90 },
  { key: 'love', label: '感情', angle: 162 },
  { key: 'wealth', label: '财运', angle: 234 },
  { key: 'health', label: '健康', angle: 306 },
  { key: 'mentor', label: '贵人', angle: 18 },
];

function getScore(report: Report, key: string): number {
  return report.radarScores[key as keyof typeof report.radarScores] || 0;
}

function getYear(dateStr: string): string {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '未知年份' : date.getFullYear().toString();
}

function DiffIndicator({ diff }: { diff: number }) {
  if (diff > 15) {
    return <span className="text-green-400 text-sm ml-2">↑ {diff}</span>;
  }
  if (diff < -15) {
    return <span className="text-red-400 text-sm ml-2">↓ {Math.abs(diff)}</span>;
  }
  return <span className="text-gray-500 text-sm ml-2">→ {diff}</span>;
}

export default function RadarCompareView({ reportA, reportB }: RadarCompareViewProps) {
  const yearA = getYear(reportA.createdAt);
  const yearB = getYear(reportB.createdAt);

  const scoresA = {
    career: getScore(reportA, 'career'),
    love: getScore(reportA, 'love'),
    wealth: getScore(reportA, 'wealth'),
    health: getScore(reportA, 'health'),
    mentor: getScore(reportA, 'mentor'),
  };

  const scoresB = {
    career: getScore(reportB, 'career'),
    love: getScore(reportB, 'love'),
    wealth: getScore(reportB, 'wealth'),
    health: getScore(reportB, 'health'),
    mentor: getScore(reportB, 'mentor'),
  };

  const diffs = DIMENSIONS.map(dim => ({
    key: dim.key,
    label: dim.label,
    diff: getScore(reportB, dim.key) - getScore(reportA, dim.key),
  }));

  const positiveCount = diffs.filter(d => d.diff > 15).length;
  const negativeCount = diffs.filter(d => d.diff < -15).length;

  return (
    <div className="space-y-6">
      {/* Side by Side Radar Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Report A */}
        <div className="space-y-2">
          <div className="text-center">
            <h3 className="text-white font-serif text-lg">{reportA.name}</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{yearA}年</p>
          </div>
          <div className="min-h-[320px]">
            <RadarChartComponent scores={scoresA} />
          </div>
        </div>

        {/* Report B */}
        <div className="space-y-2">
          <div className="text-center">
            <h3 className="text-white font-serif text-lg">{reportB.name}</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{yearB}年</p>
          </div>
          <div className="min-h-[320px]">
            <RadarChartComponent scores={scoresB} />
          </div>
        </div>
      </div>

      {/* Dimension Differences */}
      <div className="bg-white/5 rounded-lg p-4 space-y-2">
        <h4 className="text-white font-medium text-sm mb-3">维度对比 (B - A)</h4>
        {diffs.map(dim => (
          <div key={dim.key} className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{dim.label}</span>
            <DiffIndicator diff={dim.diff} />
          </div>
        ))}
      </div>

      {/* Diff Summary */}
      <div className="text-center text-sm space-y-1">
        {positiveCount > 0 && (
          <p className="text-green-400">
            {reportB.name} 在 {positiveCount} 个维度领先 (&gt;15分)
          </p>
        )}
        {negativeCount > 0 && (
          <p className="text-red-400">
            {reportA.name} 在 {negativeCount} 个维度领先 (&gt;15分)
          </p>
        )}
        {positiveCount === 0 && negativeCount === 0 && (
          <p className="text-gray-500">两个报告各维度差异不大 (≤15分)</p>
        )}
      </div>
    </div>
  );
}

'use client';

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
  aiAnalysis?: {
    overall: string;
    career: string;
    love: string;
    wealth: string;
    health: string;
    fortune: string;
    yearly: string;
  };
}

interface YearlySummaryProps {
  latestReport: Report;
}

const DIMENSION_CONFIG = [
  { key: 'career', label: '事业', color: 'var(--color-dimension-career)' },
  { key: 'love', label: '感情', color: 'var(--color-dimension-love)' },
  { key: 'wealth', label: '财富', color: 'var(--color-dimension-wealth)' },
  { key: 'health', label: '健康', color: 'var(--color-dimension-health)' },
  { key: 'mentor', label: '贵人', color: 'var(--color-dimension-mentor)' },
] as const;

export default function YearlySummary({ latestReport }: YearlySummaryProps) {
  const year = new Date(latestReport.createdAt).getFullYear();

  // Find highest and lowest scoring dimensions
  const scores = DIMENSION_CONFIG.map(dim => ({
    key: dim.key,
    label: dim.label,
    color: dim.color,
    score: latestReport.radarScores[dim.key as keyof typeof latestReport.radarScores] || 0,
  }));

  const highest = scores.reduce((max, dim) => (dim.score > max.score ? dim : max), scores[0]);
  const lowest = scores.reduce((min, dim) => (dim.score < min.score ? dim : min), scores[0]);

  return (
    <div
      className="rounded-xl p-5 transition-all duration-300"
      style={{
        background: 'rgba(26, 21, 37, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)', boxShadow: '0 0 8px var(--color-accent)' }}
          />
          <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {year}年
          </span>
          <span className="text-h4" style={{ color: 'var(--color-text)' }}>
            {latestReport.name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: 'rgba(212, 175, 55, 0.15)',
              color: 'var(--color-accent)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            流年分析
          </span>
        </div>
      </div>

      {/* Five Dimension Scores */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {scores.map(dim => (
          <div
            key={dim.key}
            className="text-center rounded-lg p-2 transition-all duration-200 hover:bg-white/5"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${dim.color}30`,
            }}
          >
            <div className="text-xs mb-1" style={{ color: dim.color }}>
              {dim.label}
            </div>
            <div className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {dim.score}
            </div>
          </div>
        ))}
      </div>

      {/* Highest/Lowest Indicators */}
      <div className="flex gap-3 mb-4">
        <div
          className="flex-1 rounded-lg p-3 flex items-center gap-2"
          style={{
            background: 'rgba(45, 106, 79, 0.2)',
            border: '1px solid rgba(45, 106, 79, 0.4)',
          }}
        >
          <span className="text-xs" style={{ color: 'var(--color-dimension-health)' }}>
            最旺
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {highest.label}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-dimension-health)' }}>
            {highest.score}分
          </span>
        </div>
        <div
          className="flex-1 rounded-lg p-3 flex items-center gap-2"
          style={{
            background: 'rgba(196, 30, 58, 0.2)',
            border: '1px solid rgba(196, 30, 58, 0.4)',
          }}
        >
          <span className="text-xs" style={{ color: 'var(--color-dimension-career)' }}>
            注意
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {lowest.label}
          </span>
          <span className="text-xs" style={{ color: 'var(--color-dimension-career)' }}>
            {lowest.score}分
          </span>
        </div>
      </div>

      {/* Yearly Analysis Text */}
      {latestReport.aiAnalysis?.yearly && (
        <div
          className="rounded-lg p-4 mt-3"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(212, 175, 55, 0.1)',
          }}
        >
          <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            流年解读
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            {latestReport.aiAnalysis.yearly}
          </p>
        </div>
      )}
    </div>
  );
}

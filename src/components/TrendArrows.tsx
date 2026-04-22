'use client';

interface TrendDiff {
  dim: string;
  diff: number;
}

interface TrendArrowsProps {
  diffs: TrendDiff[];
}

const DIMENSION_LABELS: Record<string, string> = {
  career: '事业',
  love: '感情',
  wealth: '财富',
  health: '健康',
  mentor: '贵人',
};

const THRESHOLD = 15;

export default function TrendArrows({ diffs }: TrendArrowsProps) {
  const getArrowStyle = (diff: number): { arrow: string; color: string } => {
    if (diff > THRESHOLD) {
      return { arrow: '↑', color: 'var(--color-up, #22c55e)' }; // green
    }
    if (diff < -THRESHOLD) {
      return { arrow: '↓', color: 'var(--color-down, #ef4444)' }; // red
    }
    return { arrow: '→', color: 'var(--color-neutral, #9ca3af)' }; // gray
  };

  return (
    <div className="flex gap-4 flex-wrap">
      {diffs.map((item) => {
        const label = DIMENSION_LABELS[item.dim] || item.dim;
        const { arrow, color } = getArrowStyle(item.diff);

        return (
          <div
            key={item.dim}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {label}
            </span>
            <span className="text-lg font-bold" style={{ color }}>
              {arrow}
            </span>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import MiniRadar from './MiniRadar';
import { Skeleton } from './Skeleton';

interface ReportCardProps {
  report: {
    id: string;
    name: string;
    gender: string;
    createdAt: string;
    birthData?: string;
    radarScores: {
      career?: number;
      love?: number;
      wealth?: number;
      health?: number;
      mentor?: number;
    };
    unlocked?: boolean;
  };
  onDelete?: (id: string) => void;
  onCompare?: (id: string) => void;
  isSelected?: boolean;
  skeleton?: boolean;
}

function calculateAge(birthDataStr?: string): number | null {
  if (!birthDataStr) return null;
  try {
    const birthData = JSON.parse(birthDataStr);
    if (birthData.year) {
      const currentYear = new Date().getFullYear();
      return currentYear - parseInt(birthData.year, 10);
    }
  } catch {
    // ignore
  }
  return null;
}

// formatDate is reserved for future use (e.g., detailed date display in report details)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? '未知日期' : date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

export function ReportCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex gap-4">
        <Skeleton className="w-20 h-20 flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(j => (
              <div key={j} className="text-center space-y-1">
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-4 w-6" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-7 w-16 rounded-lg" />
            <Skeleton className="h-7 w-14 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportCard({ report, onDelete, onCompare, isSelected, skeleton }: ReportCardProps) {
  if (skeleton) return <ReportCardSkeleton />;

  const router = useRouter();
  const age = calculateAge(report.birthData);

  const handleClick = () => {
    router.push(`/report/${report.id}`);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    action();
  };

  return (
    <div
      onClick={handleClick}
      className="glass-card rounded-[var(--radius-lg)] p-6 hover-lift transition-all duration-300"
    >
      <div className="flex gap-4">
        {/* Mini Radar Chart */}
        <div className="flex-shrink-0">
          <MiniRadar scores={report.radarScores} size={80} />
        </div>

        {/* Report Info */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-h4 title-underline inline-block">
                {report.name}
                <span className="text-sm ml-2" style={{ color: 'var(--color-text-muted)' }}>
                  {report.gender === 'male' ? '男' : '女'}
                  {age !== null && ` · ${age}岁`}
                </span>
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {formatRelativeTime(report.createdAt)}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                report.unlocked
                  ? 'bg-[var(--color-success)]/20 text-[var(--color-success)]'
                  : 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]'
              }`}
            >
              {report.unlocked ? '已解锁' : '未解锁'}
            </span>
          </div>

          {/* 5-Dim Scores */}
          <div className="flex gap-3 mt-3 text-xs">
            {[
              { key: 'career', label: '事业', color: 'var(--color-dimension-career)' },
              { key: 'love', label: '感情', color: 'var(--color-dimension-love)' },
              { key: 'wealth', label: '财运', color: 'var(--color-dimension-wealth)' },
              { key: 'health', label: '健康', color: 'var(--color-dimension-health)' },
              { key: 'mentor', label: '贵人', color: 'var(--color-dimension-mentor)' },
            ].map(dim => (
              <div key={dim.key} className="text-center">
                <span style={{ color: dim.color }}>{dim.label}</span>
                <p className="text-white font-medium">
                  {report.radarScores[dim.key as keyof typeof report.radarScores] || 0}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
            <label className="flex items-center gap-2 cursor-pointer">
              {/* Custom Checkbox */}
              <div
                role="checkbox"
                aria-checked={isSelected}
                onClick={e => { e.stopPropagation(); onCompare?.(report.id); }}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--color-primary)] border-[var(--color-accent)]'
                    : 'bg-white/5 border-white/20 hover:border-[var(--color-primary)]/50'
                }`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white animate-success-pop" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                isSelected
                  ? 'bg-[var(--color-primary)]/30 border-[var(--color-primary)] text-white'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}>
                {isSelected ? '已选择' : '对比'}
              </span>
            </label>
            <button
              onClick={e => handleActionClick(e, () => onDelete?.(report.id))}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

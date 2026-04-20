export function Skeleton({ className, variant = 'default' }: { className?: string; variant?: 'default' | 'text' | 'circular' | 'rectangular' }) {
  const baseStyles = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded h-4' : 'rounded-lg';

  return (
    <div
      className={`skeleton-shimmer ${baseStyles} ${className || ''}`}
    />
  );
}

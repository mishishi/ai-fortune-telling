'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DailyFortuneData {
  hasReport: boolean;
  date: string;
  lunarDate: string;
  overallScore: number;
  overallLabel: string;
  dimensions: {
    career: number;
    love: number;
    wealth: number;
    health: number;
  };
  tip: string[];
  yi: string[];
  ji: string[];
  bestTime: string;
  reportId?: string;
}

interface DailyFortuneCardProps {
  userId?: string;
}

export default function DailyFortuneCard({ userId }: DailyFortuneCardProps) {
  const [data, setData] = useState<DailyFortuneData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDailyFortune = async () => {
      try {
        const params = new URLSearchParams();
        if (userId) {
          params.set('userId', userId);
        }

        const res = await fetch(`/api/fortune/daily?${params.toString()}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch daily fortune:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyFortune();
  }, [userId]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div
          className="rounded-2xl p-5 animate-pulse"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 21, 37, 0.8) 0%, rgba(45, 31, 61, 0.6) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.15)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-32 bg-white/10 rounded"></div>
            <div className="h-4 w-24 bg-white/10 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="h-6 w-40 bg-white/10 rounded"></div>
            <div className="flex gap-3">
              <div className="h-10 flex-1 bg-white/10 rounded-lg"></div>
              <div className="h-10 flex-1 bg-white/10 rounded-lg"></div>
              <div className="h-10 flex-1 bg-white/10 rounded-lg"></div>
              <div className="h-10 flex-1 bg-white/10 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No report - show guide card
  if (!data || !data.hasReport) {
    return (
      <div
        className="w-full max-w-md mx-auto rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-transform"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 21, 37, 0.8) 0%, rgba(45, 31, 61, 0.6) 100%)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}
        onClick={() => {
          // Scroll to the form
          document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            }}
          >
            <span className="text-2xl">📅</span>
          </div>
          <div className="flex-1">
            <div className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {data?.date || new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
            </div>
            <div className="font-serif text-white text-lg">每日运势</div>
          </div>
        </div>

        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center justify-center gap-2 py-4">
            <span className="text-2xl">✨</span>
            <span style={{ color: 'var(--color-accent)' }}>生成你的专属命盘</span>
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            基于八字分析，获取精准的每日运势解读
          </p>
        </div>
      </div>
    );
  }

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--color-success)';
    if (score >= 70) return 'var(--color-accent)';
    if (score >= 55) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div
      className="w-full max-w-md mx-auto rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 21, 37, 0.9) 0%, rgba(45, 31, 61, 0.7) 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: 'rgba(212, 175, 55, 0.08)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📅</span>
          <span className="text-sm" style={{ color: 'var(--color-accent)' }}>
            今日运势
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {data.lunarDate}
        </span>
      </div>

      {/* Main Score Section */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-4">
          {/* Score Circle */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
              border: `2px solid ${getScoreColor(data.overallScore)}`,
            }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: getScoreColor(data.overallScore) }}>
                {data.overallScore}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>分</div>
            </div>
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 20px ${getScoreColor(data.overallScore)}40`,
              }}
            />
          </div>

          {/* Score Label */}
          <div>
            <div className="text-lg font-serif text-white">
              综合运势{data.overallLabel}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              ☀️ 今日运势表现优异
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions Grid */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-4 gap-2">
          {/* Career */}
          <div
            className="rounded-lg p-2 text-center"
            style={{ background: 'rgba(196, 30, 58, 0.1)', border: '1px solid rgba(196, 30, 58, 0.2)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>💼</div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-dimension-career)' }}>
              {data.dimensions.career}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>事业</div>
          </div>

          {/* Love */}
          <div
            className="rounded-lg p-2 text-center"
            style={{ background: 'rgba(107, 91, 149, 0.1)', border: '1px solid rgba(107, 91, 149, 0.2)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>💕</div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-dimension-love)' }}>
              {data.dimensions.love}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>感情</div>
          </div>

          {/* Wealth */}
          <div
            className="rounded-lg p-2 text-center"
            style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>💰</div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-dimension-wealth)' }}>
              {data.dimensions.wealth}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>财富</div>
          </div>

          {/* Health */}
          <div
            className="rounded-lg p-2 text-center"
            style={{ background: 'rgba(45, 106, 79, 0.1)', border: '1px solid rgba(45, 106, 79, 0.2)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>🏥</div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-dimension-health)' }}>
              {data.dimensions.health}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>健康</div>
          </div>
        </div>
      </div>

      {/* Tip Section */}
      <div
        className="mx-5 mb-4 p-3 rounded-lg"
        style={{
          background: 'rgba(212, 175, 55, 0.08)',
          border: '1px solid rgba(212, 175, 55, 0.15)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span style={{ color: 'var(--color-accent)' }}>💡</span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
            命主提示
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {data.tip[0] || '今日运势平稳，注意调理身心'}
        </p>
      </div>

      {/* Divider */}
      <div
        className="mx-5"
        style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)' }}
      />

      {/* Yi / Ji Section */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Yi */}
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-success)' }}>
              宜
            </div>
            <div className="flex flex-wrap gap-1">
              {data.yi.map((item, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: 'rgba(80, 200, 120, 0.1)',
                    color: 'var(--color-success)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Ji */}
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--color-error)' }}>
              忌
            </div>
            <div className="flex flex-wrap gap-1">
              {data.ji.map((item, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: 'var(--color-error)',
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Best Time Section */}
      <div
        className="mx-5 mb-4 p-3 rounded-lg flex items-center gap-3"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <span className="text-lg">🕐</span>
        <div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>最佳时段</div>
          <div className="text-sm text-white">{data.bestTime}</div>
        </div>
      </div>

      {/* Footer CTA */}
      {data.reportId && (
        <div className="px-5 pb-5">
          <Link
            href={`/report/${data.reportId}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              color: 'white',
              boxShadow: 'var(--shadow-glow-primary)',
            }}
          >
            <span>查看完整报告</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}

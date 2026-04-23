'use client';

import { useState, useEffect } from 'react';

interface EventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  recentEvents: Array<{
    eventType: string;
    eventData: Record<string, any>;
    createdAt: string;
  }>;
}

export default function AnalyticsStats() {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/analytics/events?limit=50');
        const data = await res.json();

        if (data.events) {
          const eventsByType: Record<string, number> = {};
          data.events.forEach((e: any) => {
            eventsByType[e.eventType] = (eventsByType[e.eventType] || 0) + 1;
          });

          setStats({
            totalEvents: data.total,
            eventsByType,
            recentEvents: data.events.slice(0, 10).map((e: any) => ({
              eventType: e.eventType,
              eventData: e.eventData,
              createdAt: e.createdAt,
            })),
          });
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-gray-400 text-sm">加载中...</div>;
  }

  if (!stats || stats.totalEvents === 0) {
    return null;
  }

  const eventTypeLabels: Record<string, string> = {
    page_view: '页面浏览',
    report_generate: '生成报告',
    report_share: '分享报告',
    report_unlock: '解锁报告',
    checkin: '每日签到',
    badge_earned: '获得徽章',
    ai_question: 'AI追问',
  };

  return (
    <div className="glass-card rounded-[var(--radius-lg)] p-5">
      <h3 className="text-lg font-semibold text-white mb-4">活动统计</h3>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg bg-white/5">
          <div className="text-2xl font-bold text-[var(--color-accent)]">{stats.totalEvents}</div>
          <div className="text-xs text-gray-400">总事件数</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-white/5">
          <div className="text-2xl font-bold text-[var(--color-accent)]">
            {Object.keys(stats.eventsByType).length}
          </div>
          <div className="text-xs text-gray-400">事件类型</div>
        </div>
      </div>

      {/* Event breakdown */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm text-gray-400">事件分布</h4>
        {Object.entries(stats.eventsByType)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([type, count]) => (
            <div key={type} className="flex items-center justify-between">
              <span className="text-sm text-gray-300">
                {eventTypeLabels[type] || type}
              </span>
              <span className="text-sm font-medium text-white">{count}</span>
            </div>
          ))}
      </div>

      {/* Recent events */}
      <div className="space-y-2">
        <h4 className="text-sm text-gray-400">最近活动</h4>
        {stats.recentEvents.map((event, i) => (
          <div key={i} className="text-xs text-gray-400 py-1 border-b border-white/5 last:border-0">
            <span className="text-[var(--color-accent)]">
              {eventTypeLabels[event.eventType] || event.eventType}
            </span>
            <span className="mx-2">·</span>
            <span>{new Date(event.createdAt).toLocaleString('zh-CN')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import MiniRadar from './MiniRadar';

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
    yearly: string;
  };
}

interface TodayFortuneModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const LUCKY_COLORS = ['#e74c3c', '#e91e63', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
const LUCKY_THINGS = ['红色', '金色', '绿色', '蓝色', '紫色', '玉石'];
const DIRECTIONS = ['东方', '南方', '西方', '北方', '东南', '西南', '东北', '西北'];
const THINGS = ['水晶', '玉石', '金属', '木质', '水杯', '书籍'];

function getDayFromDate(): number {
  return new Date().getDate();
}

function getGanzhiDay(): string {
  const GANZI = ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
                 '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
                 '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
                 '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸丑',
                 '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
                 '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'];
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return GANZI[dayOfYear % 60];
}

export default function TodayFortuneModal({ open, onClose, userId }: TodayFortuneModalProps) {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && userId) {
      fetch(`/api/reports?userId=${encodeURIComponent(userId)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          const reports: Report[] = data?.reports || [];
          if (reports.length > 0) {
            // Get most recent report
            const sorted = [...reports].sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setReport(sorted[0]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [open, userId]);

  if (!open) return null;

  const today = new Date();
  const todayStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const ganzhiDay = getGanzhiDay();
  const dayOfMonth = getDayFromDate();
  const luckyIdx = (dayOfMonth + parseInt(report?.name.charCodeAt(0)?.toString().slice(-1) || '0', 10)) % 6;
  const dirIdx = (dayOfMonth + parseInt(report?.name.charCodeAt(0)?.toString().slice(-2) || '0', 10)) % 8;
  const thingIdx = (dayOfMonth * 3 + (report?.name.length || 0)) % 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 21, 37, 0.95) 0%, rgba(45, 31, 61, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-xs tracking-widest mb-2" style={{ color: 'var(--color-accent)' }}>
            {todayStr}
          </div>
          <h2 className="text-xl font-serif text-white">
            {report?.name || '您'}的今日运势
          </h2>
          <p className="text-xs text-gray-400 mt-1">今日干支：{ganzhiDay}</p>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : report ? (
          <>
            {/* Mini Radar */}
            <div className="flex justify-center mb-4">
              <MiniRadar scores={report.radarScores} size={120} />
            </div>

            {/* Scores */}
            <div className="grid grid-cols-5 gap-1 mb-4">
              {[
                { key: 'career', label: '事业' },
                { key: 'love', label: '感情' },
                { key: 'wealth', label: '财运' },
                { key: 'health', label: '健康' },
                { key: 'mentor', label: '贵人' },
              ].map(dim => (
                <div key={dim.key} className="text-center">
                  <div className="text-xs" style={{ color: `var(--color-dimension-${dim.key})` }}>
                    {dim.label}
                  </div>
                  <div className="text-white font-medium">
                    {report.radarScores[dim.key as keyof typeof report.radarScores] || 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Lucky items */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-xs text-gray-400">幸运色</div>
                <div className="text-sm" style={{ color: LUCKY_COLORS[luckyIdx] }}>
                  {LUCKY_THINGS[luckyIdx]}
                </div>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-xs text-gray-400">贵人方位</div>
                <div className="text-sm text-[var(--color-dimension-mentor)]">
                  {DIRECTIONS[dirIdx]}
                </div>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="text-xs text-gray-400">幸运物</div>
                <div className="text-sm text-[var(--color-dimension-wealth)]">
                  {THINGS[thingIdx]}
                </div>
              </div>
            </div>

            {/* Tip */}
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {report.aiAnalysis?.yearly?.slice(0, 60) || '今日运势平稳，注意把握机会。'}
              ...
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-400 mb-4">暂无运势数据</p>
            <a
              href="/"
              className="text-sm px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/80 transition-colors"
            >
              生成报告
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
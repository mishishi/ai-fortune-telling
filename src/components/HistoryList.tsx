'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import ReportCard from './ReportCard';
import CompareView from './CompareView';
import ConfirmModal from './ConfirmModal';
import { Skeleton } from './Skeleton';
import { Button } from './ui/Button';

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

export default function HistoryList() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [compareReports, setCompareReports] = useState<[Report, Report] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // Fetch reports
  useEffect(() => {
    if (!user?.userId) return;
    fetchReports(user.userId);
  }, [user?.userId]);

  const fetchReports = async (userId: string) => {
    try {
      const res = await fetch(`/api/reports?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by time range
  const timeFilteredReports = reports.filter(r => {
    if (timeFilter === 'all') return true;
    const created = new Date(r.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (timeFilter === 'week') return diffDays <= 7;
    if (timeFilter === 'month') return diffDays <= 30;
    return true;
  });

  // Filter by search keyword
  const searchedReports = searchKeyword.trim()
    ? timeFilteredReports.filter(r =>
        r.name.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : timeFilteredReports;

  // Sort by createdAt descending (newest first)
  const sortedReports = [...searchedReports].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    if (isNaN(dateA) || isNaN(dateB)) return 0;
    return dateB - dateA;
  });

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [timeFilter, searchKeyword]);

  // Paginate
  const totalPages = Math.ceil(sortedReports.length / PAGE_SIZE);
  const paginatedReports = sortedReports.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/reports/${deleteTarget}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== deleteTarget));
        setSelectedReportIds(prev => prev.filter(i => i !== deleteTarget));
        showToast('报告已删除', 'success');
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
      showToast('删除失败，请重试', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Handle compare selection
  const handleCompareToggle = (id: string) => {
    setSelectedReportIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        // Replace the oldest selection
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  // Open compare view
  const handleOpenCompare = () => {
    if (selectedReportIds.length === 2) {
      const report1 = reports.find(r => r.id === selectedReportIds[0]);
      const report2 = reports.find(r => r.id === selectedReportIds[1]);
      if (report1 && report2) {
        setCompareReports([report1, report2]);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex gap-4">
              {/* Radar placeholder */}
              <Skeleton className="w-20 h-20 flex-shrink-0" />
              {/* Content */}
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
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Search and Time Filter */}
      <div className="mb-4 space-y-3">
        {/* Search bar */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            placeholder="搜索姓名..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Time filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: '全部' },
            { key: 'week', label: '最近一周' },
            { key: 'month', label: '最近一月' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setTimeFilter(tab.key as typeof timeFilter)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                timeFilter === tab.key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      {sortedReports.length === 0 ? (
        <div className="text-center py-16">
          {/* Top gold divider */}
          <div className="gold-divider mx-auto mb-8 w-24 animate-fade-in" style={{ animationDelay: '0ms' }}></div>

          {/* Oriental Ba Gua illustration with float animation */}
          <div className="relative inline-block mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <svg
              className="w-32 h-32 animate-float"
              viewBox="0 0 120 120"
              fill="none"
              style={{ animationDelay: '0ms', animationDuration: '4s' }}
            >
              {/* Outer ring - mystical circle */}
              <circle
                cx="60" cy="60" r="56"
                stroke="url(#baguaGrad)"
                strokeWidth="1"
                opacity="0.4"
              />
              <circle
                cx="60" cy="60" r="52"
                stroke="var(--color-accent)"
                strokeWidth="0.5"
                strokeDasharray="2 4"
                opacity="0.6"
              />

              {/* Middle ring with trigrams positions */}
              <circle
                cx="60" cy="60" r="44"
                stroke="url(#baguaGrad)"
                strokeWidth="1.5"
                opacity="0.7"
              />

              {/* Inner ring */}
              <circle
                cx="60" cy="60" r="32"
                stroke="var(--color-accent)"
                strokeWidth="0.5"
                opacity="0.5"
              />

              {/* Ba Gua lines - simplified trigram symbols around center */}
              {/* ☰ (Heaven) - top */}
              <g opacity="0.8">
                <line x1="56" y1="22" x2="64" y2="22" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="56" y1="26" x2="64" y2="26" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="56" y1="30" x2="64" y2="30" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>

              {/* ☱ (Lake) - top right */}
              <g opacity="0.7">
                <line x1="84" y1="28" x2="92" y2="28" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="84" y1="32" x2="92" y2="32" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="86" y1="36" x2="90" y2="36" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>

              {/* ☲ (Fire) - right */}
              <g opacity="0.75">
                <line x1="94" y1="56" x2="102" y2="56" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="86" y1="60" x2="94" y2="60" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="94" y1="64" x2="102" y2="64" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>

              {/* ☳ (Thunder) - bottom right */}
              <g opacity="0.65">
                <line x1="84" y1="84" x2="92" y2="84" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="86" y1="88" x2="90" y2="88" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="84" y1="92" x2="92" y2="92" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>

              {/* ☴ (Wind) - bottom */}
              <g opacity="0.7">
                <line x1="56" y1="94" x2="64" y2="94" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="56" y1="90" x2="64" y2="90" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="56" y1="86" x2="64" y2="86" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>

              {/* ☵ (Water) - bottom left */}
              <g opacity="0.75">
                <line x1="28" y1="84" x2="36" y2="84" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="30" y1="88" x2="34" y2="88" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="28" y1="92" x2="36" y2="92" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>

              {/* ☶ (Mountain) - left */}
              <g opacity="0.8">
                <line x1="18" y1="56" x2="26" y2="56" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="26" y1="60" x2="34" y2="60" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="18" y1="64" x2="26" y2="64" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>

              {/* ☷ (Earth) - top left */}
              <g opacity="0.65">
                <line x1="28" y1="28" x2="36" y2="28" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="30" y1="32" x2="34" y2="32" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="28" y1="36" x2="36" y2="36" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round"/>
              </g>

              {/* Center dot - Tai Ji origin */}
              <circle cx="60" cy="60" r="6" fill="url(#centerGrad)" opacity="0.9"/>
              <circle cx="60" cy="60" r="3" fill="var(--color-primary)" opacity="0.8"/>

              {/* Decorative cloud motifs */}
              <g opacity="0.3">
                <path d="M25 45 Q30 42 35 45 Q40 48 45 45" stroke="var(--color-accent)" strokeWidth="0.8" fill="none"/>
                <path d="M75 75 Q80 72 85 75 Q90 78 95 75" stroke="var(--color-accent)" strokeWidth="0.8" fill="none"/>
              </g>

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="baguaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.8"/>
                  <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.8"/>
                </linearGradient>
                <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--color-primary)"/>
                  <stop offset="100%" stopColor="var(--color-accent)"/>
                </radialGradient>
              </defs>
            </svg>

            {/* Subtle glow behind the illustration */}
            <div
              className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-20"
              style={{
                background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
              }}
            />
          </div>

          {/* Main message */}
          <p
            className="text-h3 text-[var(--color-text-secondary)] mb-3 animate-fade-in-up font-serif"
            style={{ animationDelay: '200ms', textShadow: '0 0 20px rgba(212,175,55,0.2)' }}
          >
            命运的齿轮尚未转动
          </p>

          {/* Subtext */}
          <p className="text-body text-[var(--color-text-muted)] mb-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            开启你的第一次命盘解读
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-medium rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <span>开始解读</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </Link>
          </div>

          {/* Bottom gold divider */}
          <div className="gold-divider mx-auto mt-10 w-24 animate-fade-in" style={{ animationDelay: '500ms' }}></div>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedReports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onDelete={() => setDeleteTarget(report.id)}
              onCompare={handleCompareToggle}
              isSelected={selectedReportIds.includes(report.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === p
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Compare Button */}
      {selectedReportIds.length === 2 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20">
          <button
            onClick={handleOpenCompare}
            title="选择2个报告进行对比"
            className="px-8 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            开始对比
          </button>
        </div>
      )}

      {/* Compare View Modal */}
      {compareReports && (
        <CompareView
          report1={compareReports[0]}
          report2={compareReports[1]}
          onClose={() => {
            setCompareReports(null);
            setSelectedReportIds([]);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="删除报告"
        message="确定要删除这份报告吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </div>
  );
}

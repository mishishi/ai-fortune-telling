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

interface Member {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
}

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
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [compareReports, setCompareReports] = useState<[Report, Report] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Load members from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('fortune_members');
      if (stored) {
        setMembers(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

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

  // Get unique names from reports to map to members
  const reportNames = [...new Set(reports.map(r => r.name))];

  // Filter reports by selected member tab
  const filteredReports = selectedMemberId === 'all'
    ? reports
    : reports.filter(r => r.name === selectedMemberId);

  // Sort by createdAt descending (newest first)
  const sortedReports = [...filteredReports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
      {/* Member Tabs */}
      {members.length > 0 && (
        <div className="relative mb-6">
          {/* Left gradient mask */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0e27] to-transparent z-10 pointer-events-none" />
          {/* Right gradient mask */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0e27] to-transparent z-10 pointer-events-none" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
            <button
              onClick={() => setSelectedMemberId('all')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedMemberId === 'all'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              全部
            </button>
            {members.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedMemberId(member.name)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedMemberId === member.name
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {member.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reports List */}
      {sortedReports.length === 0 ? (
        <div className="text-center py-16">
          <div className="gold-divider mx-auto mb-6 w-24"></div>
          <svg className="w-16 h-16 mx-auto mb-4 text-[var(--color-accent)] opacity-40" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="url(#scrollGrad)" strokeWidth="2" strokeDasharray="4 4"/>
            <path d="M30 25h40c2 0 3 1 3 3v44c0 2-1 3-3 3H30c-2 0-3-1-3-3V28c0-2 1-3 3-3z" stroke="#d4af37" strokeWidth="1.5" fill="none"/>
            <path d="M35 35h30M35 45h30M35 55h20" stroke="#d4af37" strokeWidth="1" opacity="0.6"/>
            <circle cx="50" cy="68" r="4" fill="#c41e3a" opacity="0.8"/>
            <defs>
              <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#c41e3a" stopOpacity="0.5"/>
              </linearGradient>
            </defs>
          </svg>
          <p className="text-h4 text-[var(--color-text-secondary)]">暂无命盘记录</p>
          <p className="text-body text-[var(--color-text-muted)] mt-2">开始解读你的命运</p>
          <div className="gold-divider mx-auto mt-6 w-24"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedReports.map(report => (
            <div className="stagger-item hover-lift bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 border border-white/10">
              <ReportCard
                key={report.id}
                report={report}
                onDelete={() => setDeleteTarget(report.id)}
                onCompare={handleCompareToggle}
                isSelected={selectedReportIds.includes(report.id)}
              />
            </div>
          ))}
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

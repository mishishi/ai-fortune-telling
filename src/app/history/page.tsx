'use client';
import Link from 'next/link';
import HistoryList from '@/components/HistoryList';

export default function HistoryPage() {
  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto bg-[var(--color-bg-page)]">
      {/* Header with back link */}
      <div className="mb-6 relative text-center">
        {/* Corner brackets decoration */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-[var(--color-accent)] opacity-30" />
        <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-[var(--color-accent)] opacity-30" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-[var(--color-accent)] opacity-30" />
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-[var(--color-accent)] opacity-30" />
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
        >
          <span className="mr-1">←</span>
          返回首页
        </Link>
        <h1 className="text-h1 font-serif text-white mb-2">历史报告</h1>
        <p className="text-gray-400 text-sm tracking-wide">追溯命盘轨迹</p>
      </div>

      <HistoryList />
    </main>
  );
}

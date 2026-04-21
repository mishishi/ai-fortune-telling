'use client';
import Link from 'next/link';
import HistoryList from '@/components/HistoryList';

export default function HistoryPage() {
  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto bg-[#0a0e27]">
      {/* Header with back link */}
      <div className="mb-6">
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

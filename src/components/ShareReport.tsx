'use client';
import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface ShareReportProps {
  reportId: string;
}

export default function ShareReport({ reportId }: ShareReportProps) {
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('链接已复制到剪贴板', 'success');
      setShowModal(false);
    } catch {
      showToast('复制失败，请手动复制', 'error');
    }
  };

  const handleGenerateImage = () => {
    showToast('功能开发中', 'info');
    setShowModal(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Share Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed right-4 bottom-24 z-40 flex items-center gap-2 px-4 py-4 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          color: '#fff',
          boxShadow: 'var(--shadow-glow-primary)',
        }}
        aria-label="分享报告"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"/>
          <circle cx="6" cy="12" r="3"/>
          <circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        分享报告
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative z-10 w-72 rounded-2xl p-6 text-center"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid rgba(212,175,55,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-bold mb-1"
              style={{ color: 'var(--color-accent)' }}
            >
              分享报告
            </h3>
            <p className="text-gray-400 text-xs mb-6">
              与好友分享你的命盘分析
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCopyLink}
                className="w-full py-4 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))',
                  color: 'var(--color-bg)',
                  boxShadow: 'var(--shadow-glow-accent)',
                }}
              >
                复制链接
              </button>

              <button
                onClick={handleGenerateImage}
                className="w-full py-4 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(196,30,58,0.2)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(196,30,58,0.4)',
                }}
              >
                生成分享图片
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-gray-500 hover:text-gray-300 text-xs transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
}

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
        className="fixed right-4 bottom-24 z-40 flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #7b68ee, #4169e1)',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(123,104,238,0.4)',
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
              background: 'linear-gradient(135deg, #1a1f4e, #0a0e27)',
              border: '1px solid rgba(240,198,116,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="text-lg font-bold mb-1"
              style={{ color: '#f0c674' }}
            >
              分享报告
            </h3>
            <p className="text-gray-400 text-xs mb-6">
              与好友分享你的命盘分析
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCopyLink}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #f0c674, #e0a500)',
                  color: '#0a0e27',
                  boxShadow: '0 4px 16px rgba(240,198,116,0.3)',
                }}
              >
                复制链接
              </button>

              <button
                onClick={handleGenerateImage}
                className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(123,104,238,0.2)',
                  color: '#a89af8',
                  border: '1px solid rgba(123,104,238,0.4)',
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

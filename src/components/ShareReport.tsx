'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { toPng } from 'html-to-image';
import ShareReportCard from './ShareReportCard';

interface ShareReportProps {
  reportId: string;
  name: string;
  gender: string;
  birthYear?: number;
  radarScores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  overall?: string;
  zodiac?: string;
  element?: string;
  createdAt: string;
}

export default function ShareReport({
  reportId,
  name,
  gender,
  birthYear,
  radarScores,
  overall,
  zodiac,
  element,
  createdAt,
}: ShareReportProps) {
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
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

  const handleGenerateImage = useCallback(async () => {
    if (!cardRef.current) return;

    setGenerating(true);
    try {
      // Move card to body for capture
      const card = cardRef.current;
      const parent = card.parentElement;
      const nextSibling = card.nextSibling;

      // Save original styles
      const originalPosition = card.style.position;
      const originalLeft = card.style.left;
      const originalTop = card.style.top;
      const originalOpacity = card.style.opacity;

      // Move to body temporarily
      document.body.appendChild(card);
      card.style.position = 'fixed';
      card.style.left = '-9999px';
      card.style.top = '0';
      card.style.opacity = '1';
      card.style.zIndex = '9999';

      const dataUrl = await toPng(card, {
        quality: 1,
        pixelRatio: 2,
      });

      // Restore original position
      card.style.position = originalPosition;
      card.style.left = originalLeft;
      card.style.top = originalTop;
      card.style.opacity = originalOpacity;

      // Move back to original parent
      if (parent) {
        if (nextSibling) {
          parent.insertBefore(card, nextSibling);
        } else {
          parent.appendChild(card);
        }
      }

      // Try Web Share API (mobile)
      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${name}-运势报告.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${name}的运势报告`,
            text: `查看${name}的AI命理分析报告`,
            files: [file],
          });
          setShowModal(false);
          showToast('分享成功', 'success');
          return;
        }
      }

      // Fallback: download on desktop
      const link = document.createElement('a');
      link.download = `${name}-运势报告-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();

      setShowModal(false);
      showToast('图片已生成并下载', 'success');
    } catch (err) {
      console.error('Failed to generate image:', err);
      showToast('图片生成失败，请重试', 'error');
    } finally {
      setGenerating(false);
    }
  }, [name, showToast]);

  if (!mounted) return null;

  return (
    <>
      {/* Hidden card for image generation */}
      <div ref={cardRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ShareReportCard
          name={name}
          gender={gender}
          birthYear={birthYear}
          radarScores={radarScores}
          overall={overall}
          zodiac={zodiac}
          element={element}
          createdAt={createdAt}
        />
      </div>

      {/* Floating Share Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed right-4 top-24 z-40 flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          color: 'var(--color-text)',
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
                disabled={generating}
                className="w-full py-4 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{
                  background: generating ? 'rgba(196,30,58,0.3)' : 'rgba(196,30,58,0.2)',
                  color: 'var(--color-primary)',
                  border: '1px solid rgba(196,30,58,0.4)',
                }}
              >
                {generating ? '生成中...' : '生成分享图片'}
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

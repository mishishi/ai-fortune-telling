'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { toPng } from 'html-to-image';
import ShareReportCard from './ShareReportCard';
import ShareReportModal from './ShareCard/ShareReportModal';

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
      const card = cardRef.current;

      // Make card visible for capture - position it fixed at top-left
      card.style.position = 'fixed';
      card.style.left = '0';
      card.style.top = '0';
      card.style.zIndex = '9999';
      card.style.opacity = '1';

      const dataUrl = await toPng(card, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      // Restore hidden position
      card.style.position = 'absolute';
      card.style.left = '-9999px';
      card.style.top = '0';
      card.style.zIndex = '';
      card.style.opacity = '';

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
        onClick={() => { setShowModal(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

      {/* Share Report Modal */}
      <ShareReportModal
        data={{
          name,
          gender,
          birthYear,
          radarScores,
          overall,
          zodiac,
          element,
          createdAt,
        }}
        open={showModal}
        onClose={() => setShowModal(false)}
        onCopyLink={handleCopyLink}
        onGenerateImage={handleGenerateImage}
        generating={generating}
      />

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes shooting-star {
          0% { transform: translate(0, 0); opacity: 0.8; }
          70% { opacity: 0.8; }
          100% { transform: translate(-100px, 100px); opacity: 0; }
        }
        .is-animating {
          animation-play-state: running;
        }
        .particle {
          animation-play-state: running;
        }
      `}</style>
    </>
  );
}

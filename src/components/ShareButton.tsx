'use client';

import { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import ShareCard from './ShareCard';

interface ShareButtonProps {
  name: string;
  gender: string;
  radarScores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  overall?: string;
  createdAt: string;
}

export default function ShareButton({ name, gender, radarScores, overall, createdAt }: ShareButtonProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

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
          return;
        }
      }

      // Fallback: download on desktop
      const link = document.createElement('a');
      link.download = `${name}-运势报告-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [name, gender, radarScores, overall, createdAt]);

  return (
    <>
      {/* Hidden card for image generation */}
      <div ref={cardRef} style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <ShareCard
          name={name}
          gender={gender}
          radarScores={radarScores}
          overall={overall}
          createdAt={createdAt}
        />
      </div>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-xs transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        分享
      </button>
    </>
  );
}

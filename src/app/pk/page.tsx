'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { toPng } from 'html-to-image';
import PKChallengeCard from '@/components/PKChallengeCard';
import PKChallengeTemplate from '@/components/ShareCard/templates/PKChallengeTemplate';

interface ChallengerData {
  userId: string;
  name: string;
  radarScores: { career?: number; love?: number; wealth?: number; health?: number; mentor?: number };
  overall: string;
  zodiac: string;
  element: string;
}

function PKPageContent() {
  const searchParams = useSearchParams();
  const challengerId = searchParams.get('from');
  const [challenger, setChallenger] = useState<ChallengerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!challengerId) {
      setLoading(false);
      return;
    }

    // Store challengerId for PK flow
    sessionStorage.setItem('pkChallengerId', challengerId);

    fetch(`/api/pk/create?userId=${challengerId}`)
      .then(res => res.json())
      .then(data => {
        setChallenger(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [challengerId]);

  const handleGenerateImage = useCallback(async () => {
    if (!cardRef.current) return;

    setGenerating(true);
    try {
      const card = cardRef.current;

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

      card.style.position = 'absolute';
      card.style.left = '-9999px';
      card.style.top = '0';
      card.style.zIndex = '';
      card.style.opacity = '';

      if (navigator.share && navigator.canShare) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${challenger?.name}-运势PK挑战.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${challenger?.name}向你发起运势PK挑战`,
            text: '敢不敢来战？证明你的运势！',
            files: [file],
          });
          showToast('分享成功', 'success');
          return;
        }
      }

      const link = document.createElement('a');
      link.download = `${challenger?.name}-运势PK挑战-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();

      showToast('图片已生成并下载', 'success');
    } catch (err) {
      console.error('Failed to generate PK image:', err);
      showToast('图片生成失败，请重试', 'error');
    } finally {
      setGenerating(false);
    }
  }, [challenger, showToast]);

  if (loading) {
    return <div className="min-h-screen bg-[#1a1525] flex items-center justify-center text-white">加载中...</div>;
  }

  if (!challenger) {
    return (
      <div className="min-h-screen bg-[#1a1525] flex flex-col items-center justify-center">
        <p className="text-white mb-4">未找到挑战者数据</p>
        <a href="/" className="text-[#d4af37] underline">返回首页</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1525] flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-[#d4af37] mb-8">🎯 运势PK挑战</h1>
      <PKChallengeCard challenger={challenger} />

      {/* Hidden template for image generation */}
      <div ref={cardRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <PKChallengeTemplate challenger={challenger} />
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={handleGenerateImage}
          disabled={generating}
          className="px-6 py-3 bg-[#e74c3c] text-white rounded-lg font-bold disabled:opacity-50 hover:bg-[#c0392b] transition-colors"
        >
          {generating ? '生成中...' : '📸 生成分享图片'}
        </button>
        <a
          href="/"
          className="px-6 py-3 bg-[#d4af37] text-[#1a1525] rounded-lg font-bold"
        >
          生成我的运势报告
        </a>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return <div className="min-h-screen bg-[#1a1525] flex items-center justify-center text-white">加载中...</div>;
}

export default function PKPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PKPageContent />
    </Suspense>
  );
}
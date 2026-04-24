'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { toPng } from 'html-to-image';
import RadarChart from '@/components/RadarChart';
import PKResultCard from '@/components/PKResultCard';
import PKResultTemplate from '@/components/ShareCard/templates/PKResultTemplate';

interface PKResultData {
  challenger: { name: string; radarScores: Record<string, number> };
  opponent: { name: string; birthYear: number; gender: string; radarScores: Record<string, number> };
  result: { winner: string; winDimensions: string[]; loseDimensions: string[]; summary: string };
}

function PKResultContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const birthdate = searchParams.get('birthdate');
  const gender = searchParams.get('gender') || 'male';
  const [result, setResult] = useState<PKResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!from || !birthdate) {
      setLoading(false);
      return;
    }

    fetch(`/api/pk/result?from=${from}&birthdate=${birthdate}&gender=${gender}`)
      .then(res => res.json())
      .then(data => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [from, birthdate, gender]);

  const handleGenerateImage = useCallback(async () => {
    if (!cardRef.current || !result) return;

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
        const file = new File([blob], `运势PK结果-${new Date().toISOString().split('T')[0]}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '我的运势PK结果',
            text: result.result.summary,
            files: [file],
          });
          showToast('分享成功', 'success');
          return;
        }
      }

      const link = document.createElement('a');
      link.download = `运势PK结果-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();

      showToast('图片已生成并下载', 'success');
    } catch (err) {
      console.error('Failed to generate PK result image:', err);
      showToast('图片生成失败，请重试', 'error');
    } finally {
      setGenerating(false);
    }
  }, [result, showToast]);

  if (loading) {
    return <div className="min-h-screen bg-[#1a1525] flex items-center justify-center text-white">加载中...</div>;
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#1a1525] flex flex-col items-center justify-center">
        <p className="text-white mb-4">未找到PK结果</p>
        <a href="/" className="text-[#d4af37] underline">返回首页</a>
      </div>
    );
  }

  const isChallengerWinner = result.result.winner === 'challenger';

  return (
    <div className="min-h-screen bg-[#1a1525] flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold text-[#d4af37] mb-4 mt-8">
        {isChallengerWinner ? '🏆 你赢了！' : '😢 你输了！'}
      </h1>
      <p className="text-white text-lg mb-8">{result.result.summary}</p>

      <div className="flex gap-8 mb-8">
        <div className="text-center">
          <p className="text-[#d4af37] mb-2">{result.challenger.name}</p>
          <RadarChart scores={result.challenger.radarScores} opponentScores={result.opponent.radarScores} />
        </div>
        <div className="text-center">
          <p className="text-[#e74c3c] mb-2">{result.opponent.name}</p>
          <RadarChart scores={result.opponent.radarScores} opponentScores={result.challenger.radarScores} opponentColor="rgba(212, 175, 55, 0.3)" />
        </div>
      </div>

      <PKResultCard
        result={result.result}
        challengerName={result.challenger.name}
        opponentName={result.opponent.name}
        isChallenger={true}
      />

      {/* Hidden template for image generation */}
      <div ref={cardRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <PKResultTemplate
          result={result.result}
          challenger={result.challenger}
          opponent={result.opponent}
          isChallengerWinner={isChallengerWinner}
        />
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
          href={`/pk?from=${from}`}
          className="px-6 py-3 bg-[#d4af37] text-[#1a1525] rounded-lg font-bold"
        >
          发起新PK
        </a>
        <a
          href="/"
          className="px-6 py-3 border border-[#d4af37] text-[#d4af37] rounded-lg font-bold"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return <div className="min-h-screen bg-[#1a1525] flex items-center justify-center text-white">加载中...</div>;
}

export default function PKResultPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PKResultContent />
    </Suspense>
  );
}
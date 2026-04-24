'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import RadarChart from '@/components/RadarChart';
import PKResultCard from '@/components/PKResultCard';

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

      <div className="flex gap-4 mt-8">
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
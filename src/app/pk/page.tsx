'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PKChallengeCard from '@/components/PKChallengeCard';

interface ChallengerData {
  userId: string;
  name: string;
  radarScores: { career?: number; love?: number; wealth?: number; health?: number; mentor?: number };
  overall: string;
  zodiac: string;
  element: string;
}

export default function PKPage() {
  const searchParams = useSearchParams();
  const challengerId = searchParams.get('from');
  const [challenger, setChallenger] = useState<ChallengerData | null>(null);
  const [loading, setLoading] = useState(true);

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
      <a
        href="/"
        className="mt-8 px-6 py-3 bg-[#d4af37] text-[#1a1525] rounded-lg font-bold"
      >
        生成我的运势报告
      </a>
    </div>
  );
}
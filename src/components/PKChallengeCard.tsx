'use client';

import RadarChart from './RadarChart';

interface PKChallengeCardProps {
  challenger: {
    userId: string;
    name: string;
    radarScores: { career?: number; love?: number; wealth?: number; health?: number; mentor?: number };
    overall: string;
    zodiac: string;
    element: string;
  };
}

export default function PKChallengeCard({ challenger }: PKChallengeCardProps) {
  return (
    <div className="bg-[#2a2235] rounded-xl p-6 w-full max-w-md">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-[#d4af37] mb-2">运势PK挑战</h2>
        <p className="text-gray-400 text-sm">邀请好友来对战！</p>
      </div>

      <div className="bg-[#1a1525] rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-white font-bold">{challenger.name}</span>
          <span className="text-gray-400 text-sm">{challenger.zodiac} · {challenger.element}</span>
        </div>
        <div className="flex justify-center">
          <RadarChart scores={challenger.radarScores} size={180} />
        </div>
        <p className="text-gray-300 text-sm mt-4 text-center">{challenger.overall}</p>
      </div>

      <div className="text-center py-6 border-2 border-dashed border-gray-600 rounded-lg mb-4">
        <div className="text-4xl mb-2">❓</div>
        <p className="text-gray-400">等待对手入场...</p>
        <p className="text-gray-500 text-sm mt-1">扫码参与运势PK</p>
      </div>

      <div className="text-center text-gray-500 text-xs">
        <p>由 AI 运势分析生成</p>
      </div>
    </div>
  );
}
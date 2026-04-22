'use client';

import { useState } from 'react';

// 手相分析要素
const PALM_LINES = [
  { name: '生命线', description: '反映健康与寿命', importance: 'high' },
  { name: '感情线', description: '反映感情与婚姻', importance: 'high' },
  { name: '智慧线', description: '反映智力与学业', importance: 'high' },
  { name: '事业线', description: '反映事业与财运', importance: 'medium' },
  { name: '婚姻线', description: '反映婚姻状况', importance: 'medium' },
  { name: '太阳线', description: '反映名声与成就', importance: 'low' },
  { name: '金星带', description: '反映感情魅力', importance: 'low' },
];

// 手型类型
const HAND_TYPES = [
  { name: '木型手', element: '木', description: '手指细长，手掌方正，思维敏捷，善于思考' },
  { name: '火型手', element: '火', description: '手指尖细，手掌较长，热情洋溢，善于表达' },
  { name: '土型手', element: '土', description: '手指短粗，手掌厚实，稳重务实，善于积累' },
  { name: '金型手', element: '金', description: '手指方正，手掌方正刚健，注重实际，善于管理' },
  { name: '水型手', element: '水', description: '手指修长，手掌柔和，适应力强，善于变通' },
];

// 基于出生日期生成手相分析
function generatePalmAnalysis(birthYear: number, birthMonth: number, birthDay: number) {
  const seed = birthYear * 10000 + birthMonth * 100 + birthDay;

  // 手型
  const handType = HAND_TYPES[seed % HAND_TYPES.length];

  // 生命线状态
  const lifeLineStrength = (seed % 3); // 0=强 1=中 2=弱
  const lifeLineStatus = ['生命线深刻清晰，体质强健', '生命线中等深度，需注意保养', '生命线浅淡，宜加强锻炼'][lifeLineStrength];

  // 感情线状态
  const loveLinePattern = (seed >> 2) % 4; // 0-3四种类型
  const loveLinePatterns = [
    '感情线清晰无杂支，感情专一',
    '感情线分叉较多，感情经历丰富',
    '感情线末端分叉，对感情有不同期待',
    '感情线断续，需要注意感情维护',
  ];

  // 智慧线状态
  const wisdomLineStyle = (seed >> 4) % 3; // 0-2三种类型
  const wisdomLineStyles = [
    '智慧线清晰直行，思维清晰，善于决策',
    '智慧线略带弯曲，思维活跃，想象力丰富',
    '智慧线较短，务实实际，注重当下',
  ];

  return {
    handType,
    lifeLine: lifeLineStatus,
    loveLine: loveLinePatterns[loveLinePattern],
    wisdomLine: wisdomLineStyles[wisdomLineStyle],
  };
}

interface PalmReadingProps {
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
}

export default function PalmReading({ birthYear = 1990, birthMonth = 1, birthDay = 1 }: PalmReadingProps) {
  const [showDetails, setShowDetails] = useState(false);

  const analysis = generatePalmAnalysis(birthYear, birthMonth, birthDay);

  return (
    <div className="flex flex-col items-center">
      {/* 手型显示 */}
      <div className="text-center mb-6">
        <div
          className="w-32 h-32 mx-auto rounded-xl flex items-center justify-center mb-3"
          style={{
            background: `linear-gradient(135deg, rgba(${analysis.handType.element === '木' ? '74,222,128' : analysis.handType.element === '火' ? '248,113,113' : analysis.handType.element === '土' ? '251,191,36' : analysis.handType.element === '金' ? '163,163,163' : '96,165,250'}, 0.2), rgba(255,255,255,0.05))`,
            border: '2px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <span className="text-5xl">✋</span>
        </div>
        <h3 className="text-lg font-bold text-white">{analysis.handType.name}</h3>
        <p className="text-xs text-gray-400 mt-1">{analysis.handType.description}</p>
      </div>

      {/* 主要掌纹分析 */}
      <div className="w-full space-y-3">
        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#4ade80]">生命线</span>
            <span className="text-xs text-gray-500">重要度：高</span>
          </div>
          <p className="text-sm text-gray-300">{analysis.lifeLine}</p>
        </div>

        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#f87171]">感情线</span>
            <span className="text-xs text-gray-500">重要度：高</span>
          </div>
          <p className="text-sm text-gray-300">{analysis.loveLine}</p>
        </div>

        <div className="p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#60a5fa]">智慧线</span>
            <span className="text-xs text-gray-500">重要度：高</span>
          </div>
          <p className="text-sm text-gray-300">{analysis.wisdomLine}</p>
        </div>
      </div>

      {/* 详细信息 */}
      {!showDetails && (
        <button
          onClick={() => setShowDetails(true)}
          className="mt-4 px-4 py-2 rounded-full text-xs"
          style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--color-accent)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
        >
          查看全部掌纹
        </button>
      )}

      {showDetails && (
        <div className="w-full mt-4 space-y-2">
          {PALM_LINES.slice(3).map((line) => (
            <div key={line.name} className="p-2 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-300">{line.name}</span>
                <span className="text-xs text-gray-500">重要度：{line.importance === 'high' ? '高' : line.importance === 'medium' ? '中' : '低'}</span>
              </div>
              <p className="text-xs text-gray-400">{line.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

// 八卦名称
const BAGUA = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

// 八卦方位（后天八卦）
const BAGUA_DIRECTIONS = ['西北', '西', '南', '东', '东南', '北', '东北', '西南'];

// 八卦五行
const BAGUA_ELEMENTS = ['金', '金', '火', '木', '木', '水', '土', '土'];

// 九宫飞星（简化版）
const PALACE_STARS = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6]
];

interface FengShuiCompassProps {
  birthElement?: string;
  size?: number;
}

export default function FengShuiCompass({ birthElement = '木', size = 320 }: FengShuiCompassProps) {
  const [selectedDirection, setSelectedDirection] = useState<string | null>(null);
  const center = size / 2;
  const outerRadius = size * 0.45;
  const innerRadius = size * 0.2;

  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const directionAngles: Record<string, number> = {
    '北': 0,
    '东北': 45,
    '东': 90,
    '东南': 135,
    '南': 180,
    '西南': 225,
    '西': 270,
    '西北': 315,
  };

  const getElementColor = (element: string): string => {
    const colors: Record<string, string> = {
      '木': '#4ade80',
      '火': '#f87171',
      '土': '#fbbf24',
      '金': '#a3a3a3',
      '水': '#60a5fa',
    };
    return colors[element] || '#a3a3a3';
  };

  // 计算吉凶方位
  const getDirectionFortune = (dir: string): { isGood: boolean; reason: string } => {
    // 基于出生五行计算吉凶方位
    const element = birthElement;
    const favorableElements: Record<string, string[]> = {
      '木': ['东', '东南'],
      '火': ['南'],
      '土': ['西南', '东北'],
      '金': ['西', '西北'],
      '水': ['北'],
    };

    const isFavorable = favorableElements[element]?.includes(dir);
    return {
      isGood: isFavorable || false,
      reason: isFavorable ? `${dir}方与您的五行相生，大吉` : `${dir}方需注意调理`,
    };
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* 外圈装饰 */}
          <circle cx={center} cy={center} r={outerRadius + 15} fill="none" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="1" strokeDasharray="4 4" />

          {/* 主要圈层 */}
          <circle cx={center} cy={center} r={outerRadius} fill="none" stroke="rgba(212, 175, 55, 0.4)" strokeWidth="2" />
          <circle cx={center} cy={center} r={outerRadius * 0.75} fill="none" stroke="rgba(212, 175, 55, 0.3)" strokeWidth="1" />
          <circle cx={center} cy={center} r={outerRadius * 0.5} fill="rgba(10, 14, 39, 0.95)" stroke="rgba(212, 175, 55, 0.3)" strokeWidth="1" />
          <circle cx={center} cy={center} r={innerRadius} fill="rgba(212, 175, 55, 0.1)" stroke="rgba(212, 175, 55, 0.5)" strokeWidth="2" />

          {/* 方位线和标签 */}
          {directions.map((dir, i) => {
            const angle = directionAngles[dir] - 90;
            const rad = angle * Math.PI / 180;

            // 外圈标签位置
            const labelX = center + (outerRadius + 20) * Math.cos(rad);
            const labelY = center + (outerRadius + 20) * Math.sin(rad);

            // 线上位置
            const lineEndX = center + outerRadius * Math.cos(rad);
            const lineEndY = center + outerRadius * Math.sin(rad);

            const fortune = getDirectionFortune(dir);

            return (
              <g key={dir}>
                {/* 方位线 */}
                <line
                  x1={center}
                  y1={center}
                  x2={lineEndX}
                  y2={lineEndY}
                  stroke={selectedDirection === dir ? 'rgba(212, 175, 55, 0.8)' : 'rgba(212, 175, 55, 0.2)'}
                  strokeWidth={selectedDirection === dir ? 2 : 1}
                />

                {/* 方位标签 */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={fortune.isGood ? '#4ade80' : selectedDirection === dir ? 'var(--color-accent)' : 'rgba(255,255,255,0.6)'}
                  fontSize="14"
                  fontWeight={fortune.isGood ? 'bold' : 'normal'}
                  className="cursor-pointer"
                  onClick={() => setSelectedDirection(selectedDirection === dir ? null : dir)}
                >
                  {dir}
                </text>
              </g>
            );
          })}

          {/* 八卦符号 */}
          {BAGUA.map((gua, i) => {
            const angle = (i * 45 - 90) * Math.PI / 180;
            const x = center + (outerRadius * 0.625) * Math.cos(angle);
            const y = center + (outerRadius * 0.625) * Math.sin(angle);

            return (
              <text
                key={gua}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={getElementColor(BAGUA_ELEMENTS[i])}
                fontSize="16"
                fontWeight="bold"
              >
                {gua}
              </text>
            );
          })}

          {/* 九宫飞星 */}
          {PALACE_STARS.map((row, rowIdx) =>
            row.map((star, colIdx) => {
              const x = center - outerRadius * 0.35 + colIdx * (outerRadius * 0.35);
              const y = center - outerRadius * 0.35 + rowIdx * (outerRadius * 0.35);

              // 颜色：1白 2黑 3碧 4绿 5黄 6白 7赤 8白 9紫
              const starColors: Record<number, string> = {
                1: '#ffffff', 2: '#1a1a2e', 3: '#4ade80', 4: '#4ade80',
                5: '#fbbf24', 6: '#ffffff', 7: '#f87171', 8: '#ffffff', 9: '#a78bfa'
              };

              return (
                <g key={`${rowIdx}-${colIdx}`}>
                  <circle cx={x} cy={y} r={15} fill={`${starColors[star]}20`} stroke={starColors[star]} strokeWidth="1" />
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill={starColors[star]} fontSize="12" fontWeight="bold">
                    {star}
                  </text>
                </g>
              );
            })
          )}

          {/* 中心指针 */}
          <circle cx={center} cy={center} r={8} fill="var(--color-accent)" />
          <polygon
            points={`${center},${center - 12} ${center - 6},${center} ${center + 6},${center}`}
            fill="var(--color-accent)"
            transform={`rotate(0, ${center}, ${center})`}
          />
        </svg>
      </div>

      {/* 方位详情 */}
      {selectedDirection && (
        <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10 max-w-xs">
          <div className="text-center mb-2">
            <span className="text-lg font-bold" style={{ color: getDirectionFortune(selectedDirection).isGood ? '#4ade80' : '#f87171' }}>
              {selectedDirection}方位
            </span>
          </div>
          <div className="text-sm text-gray-300 text-center">
            {getDirectionFortune(selectedDirection).reason}
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            五行属{BAGUA_ELEMENTS[directions.indexOf(selectedDirection)]} · {BAGUA_DIRECTIONS[directions.indexOf(selectedDirection)]}
          </div>
        </div>
      )}

      {/* 图例 */}
      <div className="mt-4 flex gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#4ade80]"></span>
          <span>吉方</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#f87171]"></span>
          <span>需注意</span>
        </div>
      </div>
    </div>
  );
}

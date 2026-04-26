'use client';

import { useState, useEffect } from 'react';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, ELEMENTS, getHiddenStems, HIDDEN_STEMS } from '@/lib/bazi/stemsBranches';
import { calculateTenGod, TEN_GODS_NAMES } from '@/lib/bazi/tenGods';
import { calculateFortuneLines, calculateYearlyFortuneV2, getYearCycleIndex, FortuneLine } from '@/lib/bazi/fortune';
import { getConstellationIndex, getConstellationName, getConstellationFortune, CONSTELLATIONS } from '@/lib/bazi/constellations';
import { getStem, getBranch } from '@/lib/bazi/stemsBranches';

type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

interface Pillar {
  stem: string;
  branch: string;
  element: Element;
  stemIndex: number;
  branchIndex: number;
}

interface BaZiDetailChartProps {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
  gender: 'male' | 'female';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  size?: number;
}

const ELEMENT_COLORS: Record<Element, string> = {
  wood: '#4ade80',
  fire: '#f87171',
  earth: '#fbbf24',
  metal: '#a3a3a3',
  water: '#60a5fa',
};

// 十神颜色
const TEN_GOD_COLORS: Record<string, string> = {
  '比肩': '#60a5fa',
  '比劫': '#818cf8',
  '食神': '#34d399',
  '伤官': '#fb923c',
  '偏财': '#a78bfa',
  '正财': '#c084fc',
  '七杀': '#ef4444',
  '正官': '#3b82f6',
  '偏印': '#14b8a6',
  '正印': '#06b6d4',
};

export default function BaZiDetailChart({
  yearPillar,
  monthPillar,
  dayPillar,
  hourPillar,
  gender,
  birthYear,
  birthMonth,
  birthDay,
  size = 400,
}: BaZiDetailChartProps) {
  const [fortuneLines, setFortuneLines] = useState<FortuneLine[]>([]);
  const [yearlyFortune, setYearlyFortune] = useState<FortuneLine[]>([]);
  const [constellation, setConstellation] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'tenGods' | 'hiddenStems' | 'fortune' | 'constellation'>('tenGods');
  const [effectiveSize, setEffectiveSize] = useState(size || 400);
  const [fortunePage, setFortunePage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 计算大运
    const fortunes = calculateFortuneLines(
      monthPillar.branchIndex,
      monthPillar.stemIndex,
      gender,
      birthYear,
      birthMonth,
      birthDay
    );
    setFortuneLines(fortunes);

    // 计算流年
    const yearCycleIndex = getYearCycleIndex(birthYear);
    const yearly = calculateYearlyFortuneV2(birthYear, yearCycleIndex);
    setYearlyFortune(yearly);

    // 计算二十八宿
    const dayConstellation = getConstellationIndex(birthYear, birthMonth, birthDay);
    const monthConstellation = getConstellationIndex(birthYear, birthMonth, 1);
    const yearConstellation = getConstellationIndex(birthYear, 1, 1);
    setConstellation([
      getConstellationName(yearConstellation),
      getConstellationName(monthConstellation),
      getConstellationName(dayConstellation),
      getConstellationName(dayConstellation), // 时宿与日宿相同计算方式
    ]);
  }, [monthPillar, gender, birthYear, birthMonth, birthDay]);

  // Responsive sizing
  useEffect(() => {
    const getSize = () => {
      if (window.innerWidth < 480) return 280;
      if (window.innerWidth < 768) return 340;
      return size || 400;
    };
    const update = () => {
      setEffectiveSize(getSize());
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [size]);

  // 计算十神
  const dayStemIndex = dayPillar.stemIndex;
  const tenGods = {
    year: TEN_GODS_NAMES[calculateTenGod(dayStemIndex, yearPillar.stemIndex)],
    month: TEN_GODS_NAMES[calculateTenGod(dayStemIndex, monthPillar.stemIndex)],
    day: '日主',
    hour: TEN_GODS_NAMES[calculateTenGod(dayStemIndex, hourPillar.stemIndex)],
  };

  // 获取藏干
  const hiddenStems = {
    year: getHiddenStems(yearPillar.branchIndex),
    month: getHiddenStems(monthPillar.branchIndex),
    day: getHiddenStems(dayPillar.branchIndex),
    hour: getHiddenStems(hourPillar.branchIndex),
  };

  const pillars = [
    { key: 'year', label: '年', data: yearPillar, tenGod: tenGods.year, hidden: hiddenStems.year, constellation: constellation[0] },
    { key: 'month', label: '月', data: monthPillar, tenGod: tenGods.month, hidden: hiddenStems.month, constellation: constellation[1] },
    { key: 'day', label: '日', data: dayPillar, tenGod: tenGods.day, hidden: hiddenStems.day, constellation: constellation[2] },
    { key: 'hour', label: '时', data: hourPillar, tenGod: tenGods.hour, hidden: hiddenStems.hour, constellation: constellation[3] },
  ];

  const center = effectiveSize / 2;
  const outerRadius = effectiveSize * 0.45;
  const innerRadius = effectiveSize * 0.25;
  const pillarWidth = (outerRadius - innerRadius) / 4;

  // 创建四方形布局
  const quadrants = [
    { x: center, y: center - outerRadius + pillarWidth, width: outerRadius - innerRadius, height: outerRadius - innerRadius, pillar: pillars[0] }, // 年 - 上
    { x: center, y: center, width: outerRadius - innerRadius, height: outerRadius - innerRadius, pillar: pillars[1] }, // 月 - 右
    { x: center - outerRadius + pillarWidth, y: center, width: outerRadius - innerRadius, height: outerRadius - innerRadius, pillar: pillars[2] }, // 日 - 下
    { x: center - outerRadius + pillarWidth, y: center - outerRadius + pillarWidth, width: outerRadius - innerRadius, height: outerRadius - innerRadius, pillar: pillars[3] }, // 时 - 左
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        {(['tenGods', 'hiddenStems', 'fortune', 'constellation'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); if (tab === 'fortune') setFortunePage(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              activeTab === tab
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {tab === 'tenGods' && '十神'}
            {tab === 'hiddenStems' && '藏干'}
            {tab === 'fortune' && '大运'}
            {tab === 'constellation' && '星宿'}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="relative" style={{ width: effectiveSize, height: effectiveSize }}>
        <svg width={effectiveSize} height={effectiveSize} className="animate-ring-in">
          {/* 外圈装饰 */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius + 10}
            fill="none"
            stroke="rgba(212, 175, 55, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* 内圈 */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="rgba(10, 14, 39, 0.98)"
            stroke="rgba(212, 175, 55, 0.3)"
            strokeWidth="2"
          />

          {/* 四柱信息 */}
          {pillars.map((pillar, index) => {
            // 移动端缩小尺寸和字体
            const scale = isMobile ? 0.8 : 1;
            const boxW = 100 * scale;
            const boxH = 80 * scale;
            const fontStem = 20 * scale;
            const fontBranch = 18 * scale;
            const fontExtra = 10 * scale;
            const offsetX = boxW / 2;
            const offsetY = boxH / 2 - 5 * scale;

            // 使用象限定位，确保不超出边界
            const ringMidRadius = innerRadius + (outerRadius - innerRadius) / 2;
            let x, y;
            if (index === 0) { // 年 - 上
              x = center - offsetX;
              y = center - ringMidRadius - offsetY;
            } else if (index === 1) { // 月 - 右
              x = center + ringMidRadius - offsetX;
              y = center - offsetY;
            } else if (index === 2) { // 日 - 下
              x = center - offsetX;
              y = center + ringMidRadius - offsetY;
            } else { // 时 - 左
              x = center - ringMidRadius - offsetX;
              y = center - offsetY;
            }

            return (
              <g key={pillar.key} transform={`translate(${x}, ${y})`}>
                {/* 背景 */}
                <rect
                  x="0"
                  y="0"
                  width={boxW}
                  height={boxH}
                  rx="8"
                  fill={pillar.key === 'day' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)'}
                  stroke={ELEMENT_COLORS[pillar.data.element]}
                  strokeWidth="2"
                />

                {/* 天干 */}
                <text x={offsetX} y={offsetY - 5 * scale} textAnchor="middle" fill={ELEMENT_COLORS[pillar.data.element]} fontSize={fontStem} fontWeight="bold">
                  {pillar.data.stem}
                </text>

                {/* 地支 */}
                <text x={offsetX} y={offsetY + 15 * scale} textAnchor="middle" fill="white" fontSize={fontBranch}>
                  {pillar.data.branch}
                </text>

                {/* 十神或藏干 */}
                {activeTab === 'tenGods' && pillar.tenGod !== '日主' && (
                  <text x={offsetX} y={offsetY + 32 * scale} textAnchor="middle" fill={TEN_GOD_COLORS[pillar.tenGod]} fontSize={fontExtra}>
                    {pillar.tenGod}
                  </text>
                )}

                {/* 藏干 */}
                {activeTab === 'hiddenStems' && (
                  <text x={offsetX} y={offsetY + 32 * scale} textAnchor="middle" fill="#a78bfa" fontSize={fontExtra - 1}>
                    {pillar.hidden.map(h => HEAVENLY_STEMS[h.stem]).join(' ')}
                  </text>
                )}

                {/* 星宿 */}
                {activeTab === 'constellation' && (
                  <text x={offsetX} y={offsetY + 32 * scale} textAnchor="middle" fill="#fbbf24" fontSize={fontExtra}>
                    {pillar.constellation}宿
                  </text>
                )}
              </g>
            );
          })}

          {/* 中心 - 日主 */}
          <text x={center} y={center - 5} textAnchor="middle" fill="var(--color-accent)" fontSize="24" fontWeight="bold">
            {dayPillar.stem}
          </text>
          <text x={center} y={center + 18} textAnchor="middle" fill="white" fontSize="14">
            {dayPillar.branch}
          </text>
          <text x={center} y={center + 35} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10">
            日主
          </text>

          {/* 连接线 */}
          {[0, 90, 180, 270].map((angle, i) => {
            const rad = (angle - 90) * Math.PI / 180;
            const x1 = center + innerRadius * Math.cos(rad);
            const y1 = center + innerRadius * Math.sin(rad);
            const x2 = center + (innerRadius + 10) * Math.cos(rad);
            const y2 = center + (innerRadius + 10) * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(212, 175, 55, 0.5)" strokeWidth="2" />;
          })}
        </svg>
      </div>

      {/* Legend / Details */}
      <div className="mt-4 w-full max-w-md">
        {activeTab === 'tenGods' && (
          <div className="grid grid-cols-4 gap-2">
            {pillars.map((pillar) => (
              <div key={pillar.key} className="text-center p-2 rounded-lg bg-white/5">
                <div className="text-xs text-gray-400">{pillar.label}柱</div>
                <div className="text-sm font-medium" style={{ color: TEN_GOD_COLORS[pillar.tenGod] || 'white' }}>
                  {pillar.tenGod}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hiddenStems' && (
          <div className="grid grid-cols-4 gap-2">
            {pillars.map((pillar) => (
              <div key={pillar.key} className="text-center p-2 rounded-lg bg-white/5">
                <div className="text-xs text-gray-400">{pillar.label}支藏干</div>
                <div className="text-xs mt-1" style={{ color: '#a78bfa' }}>
                  {pillar.hidden.map((h, i) => (
                    <span key={i}>
                      {HEAVENLY_STEMS[h.stem]}
                      <span className="text-gray-500 ml-1">
                        ({h.type === 'main' ? '本' : h.type === 'middle' ? '中' : '余'})
                      </span>
                      {i < pillar.hidden.length - 1 && ' '}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'constellation' && (
          <div className="grid grid-cols-4 gap-2">
            {pillars.map((pillar, i) => {
              const fortune = getConstellationFortune(CONSTELLATIONS.indexOf(pillar.constellation as any));
              return (
                <div key={pillar.key} className="text-center p-2 rounded-lg bg-white/5">
                  <div className="text-xs text-gray-400">{pillar.label}柱</div>
                  <div className="text-sm font-medium" style={{ color: fortune.fortune === '吉' ? '#4ade80' : fortune.fortune === '平' ? '#fbbf24' : '#f87171' }}>
                    {pillar.constellation}宿
                  </div>
                  <div className="text-xs text-gray-500">{fortune.fortune}</div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'fortune' && (
          <div className="space-y-2">
            <div className="text-center text-sm text-gray-400 mb-2">大运 (每步10年)</div>

            {isMobile ? (
              <>
                <div className="flex justify-center gap-2">
                  {fortuneLines.slice(fortunePage * 2, fortunePage * 2 + 2).map((line, i) => (
                    <div
                      key={i}
                      className="text-center p-2 rounded-lg bg-white/5"
                      style={{
                        minWidth: '70px',
                        borderLeft: `3px solid ${ELEMENT_COLORS[ELEMENTS[line.element] as Element]}`,
                      }}
                    >
                      <div className="text-xs text-gray-400">{line.age}岁</div>
                      <div className="text-sm font-medium text-white">
                        {getStem(line.stem)}{getBranch(line.branch)}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Pagination dots */}
                <div className="flex justify-center gap-2 mt-3">
                  {[0, 1, 2, 3].map((page) => (
                    <button
                      key={page}
                      onClick={() => setFortunePage(page)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        fortunePage === page ? 'bg-[var(--color-accent)] w-4' : 'bg-white/30'
                      }`}
                      aria-label={`第${page + 1}页`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                {fortuneLines.slice(0, 8).map((line, i) => (
                  <div
                    key={i}
                    className="text-center p-2 rounded-lg bg-white/5"
                    style={{
                      minWidth: '70px',
                      borderLeft: `3px solid ${ELEMENT_COLORS[ELEMENTS[line.element] as Element]}`,
                    }}
                  >
                    <div className="text-xs text-gray-400">{line.age}岁</div>
                    <div className="text-sm font-medium text-white">
                      {getStem(line.stem)}{getBranch(line.branch)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center text-xs text-gray-500 mt-3">
              流年: {yearlyFortune[0] && `${getStem(yearlyFortune[0].stem)}${getBranch(yearlyFortune[0].branch)}`} · 明年: {yearlyFortune[1] && `${getStem(yearlyFortune[1].stem)}${getBranch(yearlyFortune[1].branch)}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

// 八卦名称和符号
const BAGUA = [
  { name: '乾', symbol: '☰', nature: '天', element: '金', direction: '西北' },
  { name: '兑', symbol: '☱', nature: '泽', element: '金', direction: '西' },
  { name: '离', symbol: '☲', nature: '火', element: '火', direction: '南' },
  { name: '震', symbol: '☳', nature: '雷', element: '木', direction: '东' },
  { name: '巽', symbol: '☴', nature: '风', element: '木', direction: '东南' },
  { name: '坎', symbol: '☵', nature: '水', element: '水', direction: '北' },
  { name: '艮', symbol: '☶', nature: '山', element: '土', direction: '东北' },
  { name: '坤', symbol: '☷', nature: '地', element: '土', direction: '西南' },
];

// 六十四卦名称（简化版，上下卦组合）
const HEXAGRAMS: Record<string, { name: string; meaning: string; judgment: string }> = {
  '11': { name: '乾', meaning: '纯粹、刚健', judgment: '大吉' },
  '12': { name: '否', meaning: '闭塞、对立', judgment: '凶' },
  '13': { name: '同人', meaning: '和同、亲和', judgment: '吉' },
  '14': { name: '大有', meaning: '丰收、拥有', judgment: '吉' },
  '15': { name: '谦', meaning: '谦虚、低调', judgment: '吉' },
  '16': { name: '豫', meaning: '欢乐、犹豫', judgment: '平' },
  '17': { name: '随', meaning: '跟随、顺从', judgment: '平' },
  '18': { name: '蛊', meaning: '腐败、迷惑', judgment: '凶' },
  '21': { name: '临', meaning: '监督、临近', judgment: '平' },
  '22': { name: '观', meaning: '观察、观看', judgment: '平' },
  '23': { name: '噬嗑', meaning: '咬合、制裁', judgment: '平' },
  '24': { name: '复', meaning: '复归、回复', judgment: '吉' },
  '25': { name: '无妄', meaning: '不妄为、真诚', judgment: '吉' },
  '26': { name: '大畜', meaning: '大积蓄、蓄德', judgment: '吉' },
  '27': { name: '颐', meaning: '养育、饮食', judgment: '平' },
  '28': { name: '大过', meaning: '过度、过失', judgment: '凶' },
  '31': { name: '咸', meaning: '感应、交感', judgment: '吉' },
  '32': { name: '恒', meaning: '恒久、持久', judgment: '吉' },
  '33': { name: '遁', meaning: '退避、隐遁', judgment: '平' },
  '34': { name: '大壮', meaning: '强大、壮盛', judgment: '平' },
  '35': { name: '晋', meaning: '前进、晋升', judgment: '吉' },
  '36': { name: '明夷', meaning: '光明受伤、受伤', judgment: '凶' },
  '37': { name: '家人', meaning: '家庭、一家', judgment: '吉' },
  '38': { name: '睽', meaning: '背离、矛盾', judgment: '平' },
  '41': { name: '蹇', meaning: '艰难、困苦', judgment: '凶' },
  '42': { name: '解', meaning: '解除、解决', judgment: '吉' },
  '43': { name: '损益', meaning: '减少、增加', judgment: '平' },
  '44': { name: '姤', meaning: '相遇、邂逅', judgment: '平' },
  '45': { name: '萃', meaning: '聚集、汇集', judgment: '吉' },
  '46': { name: '升', meaning: '上升、晋升', judgment: '吉' },
  '51': { name: '困', meaning: '困境、困扰', judgment: '凶' },
  '52': { name: '井', meaning: '水井、恒常', judgment: '平' },
  '53': { name: '革', meaning: '变革、改革', judgment: '平' },
  '54': { name: '鼎', meaning: '宝鼎、权位', judgment: '吉' },
  '55': { name: '震', meaning: '震动、震惊', judgment: '平' },
  '56': { name: '艮', meaning: '静止、限制', judgment: '平' },
  '61': { name: '渐', meaning: '渐进、顺序', judgment: '吉' },
  '62': { name: '归妹', meaning: '嫁女、回归', judgment: '平' },
  '63': { name: '丰', meaning: '丰富、丰收', judgment: '吉' },
  '64': { name: '未济', meaning: '未完成、未定', judgment: '平' },
};

// 八卦从0-7索引
function getTrigram(index: number) {
  return BAGUA[index] || BAGUA[0];
}

// 根据日期生成卦象
function generateHexagramByDate(): { upper: number; lower: number; lines: number[] } {
  const now = new Date();
  const seed = now.getFullYear() + now.getMonth() * 12 + now.getDate();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  // 用日期生成上下卦
  const upper = (seed + dayOfYear) % 8;
  const lower = (seed + dayOfYear * 2) % 8;

  // 生成六爻（从下到上）
  const lines: number[] = [];
  for (let i = 0; i < 6; i++) {
    const lineSeed = seed + dayOfYear + i * 3;
    lines.push(lineSeed % 2 === 0 ? 1 : 0); // 1=阳爻 0=阴爻
  }

  return { upper, lower, lines };
}

interface IChingHexagramProps {
  initialHexagram?: { upper: number; lower: number; lines: number[] };
}

export default function IChingHexagram({ initialHexagram }: IChingHexagramProps) {
  const [hexagram, setHexagram] = useState(initialHexagram || generateHexagramByDate());
  const [showInterpretation, setShowInterpretation] = useState(false);

  const upperTrigram = getTrigram(hexagram.upper);
  const lowerTrigram = getTrigram(hexagram.lower);
  const hexKey = `${hexagram.upper + 1}${hexagram.lower + 1}`;
  const hexInfo = HEXAGRAMS[hexKey] || { name: '未知', meaning: '无解释', judgment: '平' };

  const handleRegenerate = () => {
    setShowInterpretation(false);
    setHexagram(generateHexagramByDate());
  };

  // 绘制卦象线条
  const renderLines = () => {
    return (
      <div className="flex flex-col items-center gap-1">
        {hexagram.lines.slice().reverse().map((line, i) => (
          <div key={i} className="flex items-center">
            <span className="text-xs text-gray-500 w-6 text-right mr-2">{['初', '二', '三', '四', '五', '上'][5 - i]}</span>
            {line === 1 ? (
              // 阳爻 - 实线
              <div className="w-16 h-2 bg-[var(--color-accent)] rounded" />
            ) : (
              // 阴爻 - 断线
              <>
                <div className="w-6 h-2 bg-[var(--color-accent)] rounded" />
                <div className="w-4" />
                <div className="w-6 h-2 bg-[var(--color-accent)] rounded" />
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      {/* 卦象显示 */}
      <div className="flex items-center gap-6 mb-6">
        {/* 下卦 */}
        <div className="flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl"
            style={{ background: 'rgba(212, 175, 55, 0.1)', border: '2px solid rgba(212, 175, 55, 0.3)' }}
          >
            {lowerTrigram.symbol}
          </div>
          <span className="text-xs text-gray-400 mt-1">下{lowerTrigram.nature}</span>
        </div>

        {/* 组合符号 */}
        <div className="text-3xl text-gray-500">+</div>

        {/* 上卦 */}
        <div className="flex flex-col items-center">
          <div
            className="w-20 h-20 rounded-lg flex items-center justify-center text-4xl"
            style={{ background: 'rgba(212, 175, 55, 0.1)', border: '2px solid rgba(212, 175, 55, 0.3)' }}
          >
            {upperTrigram.symbol}
          </div>
          <span className="text-xs text-gray-400 mt-1">上{upperTrigram.nature}</span>
        </div>

        {/* 等号 */}
        <div className="text-3xl text-gray-500">=</div>

        {/* 结果卦 */}
        <div className="flex flex-col items-center">
          <div
            className="w-24 h-24 rounded-xl flex flex-col items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05))', border: '2px solid rgba(212, 175, 55, 0.4)' }}
          >
            <span className="text-4xl font-bold" style={{ color: 'var(--color-accent)' }}>{hexInfo.name}</span>
            <span className="text-sm text-gray-400">{hexagram.upper + 1}{hexagram.lower + 1}卦</span>
          </div>
        </div>
      </div>

      {/* 六爻 */}
      <div className="mb-6">{renderLines()}</div>

      {/* 解读按钮 */}
      {!showInterpretation && (
        <button
          onClick={() => setShowInterpretation(true)}
          className="px-6 py-2 rounded-full text-sm mb-4"
          style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--color-accent)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
        >
          查看卦象解读
        </button>
      )}

      {/* 解读内容 */}
      {showInterpretation && (
        <div
          className="w-full max-w-sm p-4 rounded-xl mb-4"
          style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
        >
          <div className="text-center mb-3">
            <span className={`text-lg font-bold ${hexInfo.judgment === '吉' ? 'text-green-400' : hexInfo.judgment === '凶' ? 'text-red-400' : 'text-yellow-400'}`}>
              {hexInfo.judgment}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">卦名：</span>
              <span className="text-white">{hexInfo.name}</span>
            </div>
            <div>
              <span className="text-gray-400">卦象：</span>
              <span className="text-white">{lowerTrigram.symbol}{upperTrigram.symbol} {lowerTrigram.nature}上{upperTrigram.nature}下</span>
            </div>
            <div>
              <span className="text-gray-400">含义：</span>
              <span className="text-white">{hexInfo.meaning}</span>
            </div>
            <div>
              <span className="text-gray-400">五行：</span>
              <span className="text-white">{lowerTrigram.element}（下）{upperTrigram.element}（上）</span>
            </div>
            <div>
              <span className="text-gray-400">方位：</span>
              <span className="text-white">{lowerTrigram.direction}/{upperTrigram.direction}</span>
            </div>
          </div>
        </div>
      )}

      {/* 重新生成 */}
      <button
        onClick={handleRegenerate}
        className="px-4 py-2 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-all"
      >
        换一卦
      </button>
    </div>
  );
}

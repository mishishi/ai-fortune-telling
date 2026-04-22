'use client';

import { useState } from 'react';

// 面相分析要素
const FACE_FEATURES = [
  { area: '额头', indicators: ['宽阔', '饱满', '平整', '低陷', '狭窄'], score: 0 },
  { area: '眉毛', indicators: ['浓密', '稀疏', '长直', '短粗', '柔顺', '散乱'], score: 0 },
  { area: '眼睛', indicators: ['有神', '明亮', '细长', '圆润', '深邃', '浮肿'], score: 0 },
  { area: '鼻子', indicators: ['高挺', '圆润', '尖细', '肥大', '端正', '歪斜'], score: 0 },
  { area: '嘴巴', indicators: ['丰厚', '薄形', '方正', '歪斜', '紧闭', '常开'], score: 0 },
  { area: '下巴', indicators: ['圆润', '尖锐', '宽厚', '短小', '突出', '双下巴'], score: 0 },
  { area: '耳朵', indicators: ['厚实', '单薄', '长厚', '短薄', '贴脑', '招风'], score: 0 },
];

// 基于出生日期生成面相分析
function generateFaceAnalysis(birthYear: number, birthMonth: number, birthDay: number, gender: string) {
  const seed = birthYear * 10000 + birthMonth * 100 + birthDay + (gender === 'male' ? 1 : 2);

  // 生成各部位特征
  const features = FACE_FEATURES.map((f, idx) => {
    const indicatorIdx = (seed >> idx) % f.indicators.length;
    const indicator = f.indicators[indicatorIdx];
    const score = ((seed >> (idx + 8)) % 3) + 1; // 1-3分
    return {
      ...f,
      indicator,
      score,
      insight: getInsight(f.area, indicator, score),
    };
  });

  // 计算总相理分数
  const totalScore = features.reduce((sum, f) => sum + f.score, 0);
  const maxScore = features.length * 3;

  // 综合评价
  const scoreRatio = totalScore / maxScore;
  let overall: { text: string; color: string } = { text: '面相一般', color: '#f87171' };
  if (scoreRatio >= 0.8) {
    overall = { text: '面相极佳', color: '#4ade80' };
  } else if (scoreRatio >= 0.6) {
    overall = { text: '面相良好', color: '#60a5fa' };
  } else if (scoreRatio >= 0.4) {
    overall = { text: '面相中等', color: '#fbbf24' };
  }

  // 五官分析
  const keyInsights = features.slice(0, 5).map(f => ({
    area: f.area,
    insight: getInsight(f.area, f.indicator, f.score),
  }));

  return { features, overall, totalScore, maxScore, keyInsights };
}

function getInsight(area: string, indicator: string, score: number): string {
  const insights: Record<string, Record<string, string>> = {
    '额头': {
      '宽阔': '早年运势佳，聪明过人',
      '饱满': '中年财运亨通',
      '低陷': '早年辛苦，需努力奋斗',
      '狭窄': '心思狭窄，宜开阔心胸',
    },
    '眉毛': {
      '浓密': '精力充沛，意志坚强',
      '稀疏': '性格温和，人缘较好',
      '长直': '为人正直，讲究原则',
      '短粗': '性子急躁但讲义气',
    },
    '眼睛': {
      '有神': '眼神有力，意志坚定',
      '明亮': '心地单纯，乐观积极',
      '细长': '心思细腻，善于观察',
      '浮肿': '注意肾脏健康',
    },
    '鼻子': {
      '高挺': '自尊心强，有领导力',
      '圆润': '财运较好，善于交际',
      '尖细': '心思敏感，注意肺部',
      '肥大': '财运佳但开销大',
    },
    '嘴巴': {
      '丰厚': '为人热情，人缘好',
      '薄形': '言语犀利，注意修养',
      '方正': '稳重踏实，守信用',
      '歪斜': '心术不正，宜修正言行',
    },
  };

  return insights[area]?.[indicator] || `${area}特征不明显`;
}

interface FaceReadingProps {
  birthYear?: number;
  birthMonth?: number;
  birthDay?: number;
  gender?: string;
}

export default function FaceReading({ birthYear = 1990, birthMonth = 1, birthDay = 1, gender = 'male' }: FaceReadingProps) {
  const [showAll, setShowAll] = useState(false);

  const analysis = generateFaceAnalysis(birthYear, birthMonth, birthDay, gender);

  return (
    <div className="flex flex-col items-center">
      {/* 面相评分 */}
      <div className="text-center mb-6">
        <div
          className="w-28 h-28 mx-auto rounded-full flex flex-col items-center justify-center mb-3"
          style={{
            background: `linear-gradient(135deg, ${analysis.overall.color}20, rgba(255,255,255,0.05))`,
            border: `2px solid ${analysis.overall.color}40`,
          }}
        >
          <span className="text-2xl font-bold" style={{ color: analysis.overall.color }}>{analysis.totalScore}</span>
          <span className="text-xs text-gray-400">/ {analysis.maxScore}分</span>
        </div>
        <h3 className="text-lg font-bold" style={{ color: analysis.overall.color }}>{analysis.overall.text}</h3>
        <p className="text-xs text-gray-400 mt-1">面相评分基于五官特征分析</p>
      </div>

      {/* 五官详解 */}
      <div className="w-full space-y-3">
        {(showAll ? analysis.features : analysis.features.slice(0, 4)).map((feature) => (
          <div key={feature.area} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{feature.area}</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className="w-2 h-2 rounded-full"
                    style={{ background: s <= feature.score ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--color-accent)' }}>
                {feature.indicator}
              </span>
            </div>
            <p className="text-xs text-gray-400">{feature.insight}</p>
          </div>
        ))}
      </div>

      {/* 展开/收起 */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="mt-4 px-4 py-2 rounded-full text-xs"
        style={{ background: 'rgba(212, 175, 55, 0.2)', color: 'var(--color-accent)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
      >
        {showAll ? '收起' : '查看全部五官'}
      </button>
    </div>
  );
}

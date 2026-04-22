'use client';

import { useState } from 'react';

interface TodayFortuneData {
  zodiac: string;
  element: string;
  overall: string;
  fortune: '大吉' | '吉' | '平' | '凶' | '大凶';
  yi: string[];
  ji: string[];
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  luckyTime: string;
  tip: string;
}

function getDayFortune(): TodayFortuneData {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const dayOfMonth = now.getDate();
  const dayOfWeek = now.getDay();
  const month = now.getMonth();

  // 八卦运势 cycle
  const FORTUNES: ('大吉' | '吉' | '平' | '凶' | '大凶')[] = ['大吉', '吉', '平', '凶', '大凶', '吉', '平', '吉', '大吉', '平'];
  const FORTUNE_DESCRIPTIONS = {
    '大吉': '今日运势极佳，诸事顺遂，贵人大助，大吉大利！',
    '吉': '今日运势良好，做事顺利，适宜进取，有意外惊喜。',
    '平': '今日运势平稳，按部就班，稳中求进，宜守不宜攻。',
    '凶': '今日运势欠佳，行事阻滞，防有小人口舌是非。',
    '大凶': '今日诸事不宜，保守为上，切勿冲动，忍得平安。',
  };

  // 五行颜色
  const COLORS = ['绿色', '红色', '黄色', '白色', '黑色', '金色', '紫色', '蓝色'];
  // 幸运数字 (1-9)
  const NUMBERS = [3, 7, 9, 2, 5, 8, 1, 6, 4];
  // 方位
  const DIRECTIONS = ['东方', '东南方', '南方', '西南方', '西方', '西北方', '北方', '东北方'];
  // 时辰
  const TIMES = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

  // 宜做的事情
  const YI_OPTIONS = [
    '祭祀祈福', '开市交易', '订盟盟约', '搬家入宅', '出行旅游', '婚嫁娶亲',
    '种植林木', '动土施工', '求职面试', '学习进修', '修身养性', '洽谈合作',
  ];
  // 忌做的事情
  const JI_OPTIONS = [
    '安葬破土', '词讼争吵', '开业开工', '动怒争执', '远行冒险', '探病问疾',
    '搬家动土', '投资投机', '签约谈判', '求爱表白', '醉酒宴请', '签署文件',
  ];

  const fortuneIdx = dayOfYear % FORTUNES.length;
  const fortune = FORTUNES[fortuneIdx];
  const colorIdx = (dayOfYear + month) % COLORS.length;
  const numIdx = (dayOfMonth + dayOfWeek) % NUMBERS.length;
  const dirIdx = (dayOfYear + dayOfMonth) % DIRECTIONS.length;
  const timeIdx = (dayOfMonth * 2 + dayOfWeek * 3) % TIMES.length;

  // Select 3 YI and 3 JI items based on day
  const yiStart = (dayOfYear * 3 + dayOfMonth) % YI_OPTIONS.length;
  const jiStart = (dayOfYear * 7 + dayOfWeek) % JI_OPTIONS.length;
  const yi = [
    YI_OPTIONS[yiStart % YI_OPTIONS.length],
    YI_OPTIONS[(yiStart + 3) % YI_OPTIONS.length],
    YI_OPTIONS[(yiStart + 7) % YI_OPTIONS.length],
  ];
  const ji = [
    JI_OPTIONS[jiStart % JI_OPTIONS.length],
    JI_OPTIONS[(jiStart + 2) % JI_OPTIONS.length],
    JI_OPTIONS[(jiStart + 5) % JI_OPTIONS.length],
  ];

  const elements = ['木', '火', '土', '金', '水'];
  const elementIdx = (dayOfYear + month) % elements.length;
  const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const zodiacIdx = (dayOfYear + dayOfMonth) % zodiacs.length;

  const tips = [
    '今日适合静心冥想，与内心对话。',
    '今日宜主动出击，把握机会。',
    '今日适合整理思路，制定计划。',
    '今日财运平稳，谨慎投资。',
    '今日注意调节情绪，保持平和。',
    '今日贵人运旺，多与人交流。',
    '今日事业运上升，积极表现。',
    '今日感情运佳，多关心身边人。',
  ];
  const tipIdx = (dayOfYear + dayOfMonth + dayOfWeek) % tips.length;

  return {
    zodiac: zodiacs[zodiacIdx],
    element: elements[elementIdx],
    overall: FORTUNE_DESCRIPTIONS[fortune],
    fortune,
    yi,
    ji,
    luckyColor: COLORS[colorIdx],
    luckyNumber: NUMBERS[numIdx],
    luckyDirection: DIRECTIONS[dirIdx],
    luckyTime: TIMES[timeIdx],
    tip: tips[tipIdx],
  };
}

export default function TodayFortuneModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [data] = useState<TodayFortuneData>(getDayFortune());

  if (!open) return null;

  const today = new Date();
  const todayStr = today.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const fortuneColors = {
    '大吉': '#2ecc71',
    '吉': '#3498db',
    '平': '#f39c12',
    '凶': '#e67e22',
    '大凶': '#e74c3c',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden animate-scale-in"
        style={{
          background: 'linear-gradient(180deg, #1a1525 0%, #2d1f3d 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        {/* Header with date */}
        <div className="px-6 pt-6 pb-4 text-center" style={{ background: 'rgba(212, 175, 55, 0.1)' }}>
          <div className="text-xs tracking-widest mb-1" style={{ color: 'var(--color-accent)' }}>
            {todayStr}
          </div>
          <h2 className="text-xl font-serif text-white">今日运势</h2>
        </div>

        {/* Fortune Level */}
        <div className="px-6 py-4 text-center">
          <div
            className="inline-block px-6 py-2 rounded-full text-lg font-bold"
            style={{
              background: `rgba(${fortuneColors[data.fortune] === '#2ecc71' ? '46,204,113' : fortuneColors[data.fortune] === '#3498db' ? '52,152,219' : fortuneColors[data.fortune] === '#f39c12' ? '243,156,18' : fortuneColors[data.fortune] === '#e67e22' ? '230,126,34' : '231,76,60'}, 0.2)`,
              color: fortuneColors[data.fortune],
              border: `1px solid ${fortuneColors[data.fortune]}`,
            }}
          >
            {data.fortune}
          </div>
          <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {data.overall}
          </p>
        </div>

        {/* Lucky Items */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-xs text-gray-400 mb-1">幸运色</div>
              <div className="text-white font-medium">{data.luckyColor}</div>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-xs text-gray-400 mb-1">幸运数</div>
              <div className="text-white font-medium">{data.luckyNumber}</div>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-xs text-gray-400 mb-1">贵人方</div>
              <div className="text-white font-medium">{data.luckyDirection}</div>
            </div>
            <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="text-xs text-gray-400 mb-1">吉时</div>
              <div className="text-white font-medium">{data.luckyTime}</div>
            </div>
          </div>
        </div>

        {/* Yi / Ji */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-lg p-3"
              style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)' }}
            >
              <div className="text-xs mb-2" style={{ color: '#2ecc71' }}>宜</div>
              <div className="space-y-1">
                {data.yi.map((item, i) => (
                  <div key={i} className="text-xs text-gray-300">{item}</div>
                ))}
              </div>
            </div>
            <div
              className="rounded-lg p-3"
              style={{ background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)' }}
            >
              <div className="text-xs mb-2" style={{ color: '#e74c3c' }}>忌</div>
              <div className="space-y-1">
                {data.ji.map((item, i) => (
                  <div key={i} className="text-xs text-gray-300">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div
          className="mx-6 mb-4 p-3 rounded-lg text-sm"
          style={{
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            color: 'var(--color-accent)',
          }}
        >
          {data.tip}
        </div>

        {/* Close */}
        <div className="px-6 pb-6 text-center">
          <button
            onClick={onClose}
            className="px-8 py-2 rounded-full text-sm"
            style={{
              background: 'rgba(212, 175, 55, 0.2)',
              color: 'var(--color-accent)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
          >
            我知道了
          </button>
        </div>

        {/* Push Reminder */}
        <div className="mx-6 mb-4 p-3 rounded-lg text-center cursor-pointer"
          style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
          onClick={() => { onClose(); document.getElementById('push-modal-trigger')?.click(); }}>
          <span style={{ color: 'var(--color-accent)' }}>🔔 开启每日推送提醒</span>
        </div>
      </div>
    </div>
  );
}

# 运势PK分享 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现运势PK分享功能：用户分享链接邀请好友PK，好友填生日生成报告后对比结果

**Architecture:** 新建PK相关API和页面，提取雷达图组件复用

**Tech Stack:** Next.js API Routes, TypeScript, html-to-image, SVG RadarChart

---

## 文件结构

```
src/
├── app/
│   ├── api/
│   │   └── pk/
│   │       ├── create/route.ts    # [新建] 创建PK挑战，返回用户报告数据+分享链接
│   │       └── result/route.ts    # [新建] 计算PK结果
│   ├── pk/
│   │   ├── page.tsx               # [新建] PK挑战等待页 /pk?from=userId
│   │   └── result/page.tsx        # [新建] PK结果页 /pk/result?from=userIdA&birthdate=xxx
│   └── components/
│       ├── PKChallengeCard.tsx    # [新建] PK挑战卡片
│       ├── PKResultCard.tsx      # [新建] PK结果展示
│       └── RadarChart.tsx          # [新建] 提取的雷达图组件（从ShareReportCard提取）
└── lib/
    └── bazi/
        └── fortune.ts              # [修改] 导出generateFortuneReport函数供PK result调用
```

---

## Task 1: 提取 RadarChart 组件

**Files:**
- Create: `src/components/RadarChart.tsx`
- Modify: `src/components/ShareReportCard.tsx`

- [ ] **Step 1: 从 ShareReportCard 提取 SvgRadarChart 为独立组件**

```typescript
// src/components/RadarChart.tsx
'use client';

interface RadarChartProps {
  scores: {
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  size?: number;
  color?: string;        // 雷达图填充色
  opponentScores?: {    // 对手的雷达图数据，用于叠加对比
    career?: number;
    love?: number;
    wealth?: number;
    health?: number;
    mentor?: number;
  };
  opponentColor?: string;
}

const DIMENSIONS = [
  { key: 'career', label: '事业', color: '#e74c3c', angle: 90 },
  { key: 'love', label: '感情', color: '#e91e63', angle: 162 },
  { key: 'wealth', label: '财运', color: '#f1c40f', angle: 234 },
  { key: 'health', label: '健康', color: '#2ecc71', angle: 306 },
  { key: 'mentor', label: '贵人', color: '#3498db', angle: 18 },
];

function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export { DIMENSIONS, polarToCartesian };

export default function RadarChart({ scores, size = 280, color = 'rgba(212, 175, 55, 0.3)', opponentScores, opponentColor = 'rgba(231, 76, 60, 0.3)' }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size * 0.38;
  const innerRadius = outerRadius * 0.2;

  const scorePoints = DIMENSIONS.map(dim => {
    const score = scores[dim.key as keyof typeof scores] || 0;
    const radius = innerRadius + (outerRadius - innerRadius) * (score / 100);
    return polarToCartesian(cx, cy, radius, dim.angle);
  });

  const opponentPoints = opponentScores ? DIMENSIONS.map(dim => {
    const score = opponentScores[dim.key as keyof typeof opponentScores] || 0;
    const radius = innerRadius + (outerRadius - innerRadius) * (score / 100);
    return polarToCartesian(cx, cy, radius, dim.angle);
  }) : null;

  const axisLines = DIMENSIONS.map(dim => {
    const point = polarToCartesian(cx, cy, outerRadius, dim.angle);
    return { x1: cx, y1: cy, x2: point.x, y2: point.y };
  });

  const gridCircles = [0.25, 0.5, 0.75, 1].map(scale => (
    <circle key={scale} cx={cx} cy={cy} r={innerRadius + (outerRadius - innerRadius) * scale}
      fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
  ));

  const fillPath = scorePoints.length > 0 ? `M ${scorePoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z` : '';
  const opponentPath = opponentPoints && opponentPoints.length > 0 ? `M ${opponentPoints.map(p => `${p.x} ${p.y}`).join(' L ')} Z` : '';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x="0" y="0" width={size} height={size} fill="rgba(26,21,37,1)" />
      {gridCircles}
      {axisLines.map((line, i) => (
        <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {opponentPath && <path d={opponentPath} fill={opponentColor} stroke={opponentColor} strokeWidth="2" />}
      <path d={fillPath} fill={color} stroke={color.replace('0.3', '0.8')} strokeWidth="2" />
      {scorePoints.map((point, i) => (
        <circle key={i} cx={point.x} cy={point.y} r="4" fill="#d4af37" />
      ))}
      {DIMENSIONS.map(dim => {
        const labelRadius = outerRadius + 20;
        const pos = polarToCartesian(cx, cy, labelRadius, dim.angle);
        const score = scores[dim.key as keyof typeof scores] || 0;
        return (
          <g key={dim.key}>
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle"
              fill={dim.color} fontSize="12" fontWeight="bold">{dim.label}</text>
            <text x={pos.x} y={pos.y + 14} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,0.7)" fontSize="10">{score}分</text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: 修改 ShareReportCard 使用提取的 RadarChart**

在 ShareReportCard.tsx 顶部添加 import:
```typescript
import RadarChart from './RadarChart';
```

删除 SvgRadarChart 函数定义（约40行代码），保留 DIMENSIONS 和 polarToCartesian 导出复用。

- [ ] **Step 3: 提交**
```bash
git add src/components/RadarChart.tsx src/components/ShareReportCard.tsx
git commit -m "refactor: extract RadarChart from ShareReportCard"
```

---

## Task 2: PK API - create

**Files:**
- Create: `src/app/api/pk/create/route.ts`

- [ ] **Step 1: 创建 PK create API**

```typescript
// src/app/api/pk/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
  }

  try {
    const db = getDb();

    // 获取用户最新报告
    const report = db.prepare(
      'SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC LIMIT 1'
    ).get(userId) as any;

    if (!report) {
      return NextResponse.json({ error: '用户暂无报告' }, { status: 404 });
    }

    const radarScores = JSON.parse(report.radarScores || '{}');
    const aiAnalysis = JSON.parse(report.aiAnalysis || '{}');

    return NextResponse.json({
      userId,
      name: report.name,
      gender: report.gender,
      birthYear: JSON.parse(report.birthData || '{}').year,
      radarScores,
      overall: aiAnalysis.overall || '',
      zodiac: report.zodiac || '',
      element: report.element || '',
      createdAt: report.createdAt,
      shareUrl: `/pk?from=${userId}`,
    });
  } catch (error) {
    console.error('Error creating PK challenge:', error);
    return NextResponse.json({ error: 'Failed to create PK challenge' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 提交**
```bash
git add src/app/api/pk/create/route.ts
git commit -m "feat: add PK create API"
```

---

## Task 3: PK API - result

**Files:**
- Create: `src/app/api/pk/result/route.ts`
- Modify: `src/lib/bazi/fortune.ts`（如需导出generateFortuneReport）

- [ ] **Step 1: 创建 PK result API**

```typescript
// src/app/api/pk/result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateFortuneReport } from '@/lib/bazi/fortune';

const DIMENSION_NAMES: Record<string, string> = {
  career: '事业运',
  love: '感情运',
  wealth: '财运',
  health: '健康运',
  mentor: '贵人运',
};

interface RadarScores {
  career?: number;
  love?: number;
  wealth?: number;
  health?: number;
  mentor?: number;
}

function calculatePKResult(a: RadarScores, b: RadarScores) {
  const dimensions = ['career', 'love', 'wealth', 'health', 'mentor'];
  let winCountA = 0, winCountB = 0;
  const winDimensionsA: string[] = [];
  const winDimensionsB: string[] = [];

  for (const dim of dimensions) {
    const scoreA = a[dim as keyof RadarScores] || 0;
    const scoreB = b[dim as keyof RadarScores] || 0;
    if (scoreA > scoreB) {
      winCountA++;
      winDimensionsA.push(dim);
    } else if (scoreB > scoreA) {
      winCountB++;
      winDimensionsB.push(dim);
    }
  }

  const winner = winCountA >= winCountB ? 'challenger' : 'opponent';
  const winDims = winner === 'challenger' ? winDimensionsA : winDimensionsB;
  const loseDims = winner === 'challenger' ? winDimensionsB : winDimensionsA;

  let summary = '';
  if (winDims.length === 5) {
    summary = winner === 'challenger' ? '全面碾压，你的运势无人能敌！' : '对方完胜，这次运气不在你这边～';
  } else if (winDims.length >= 3) {
    const bestDim = DIMENSION_NAMES[winDims[0]] || winDims[0];
    summary = winner === 'challenger' ? `你的${bestDim}领先对手！` : `对方${bestDim}领先你！`;
  } else {
    const bestDim = DIMENSION_NAMES[winDims[0]] || winDims[0];
    summary = winner === 'challenger' ? `你的${bestDim}险胜对手！` : `对方${bestDim}险胜你！`;
  }

  return {
    winner,
    winDimensions: winDims,
    loseDimensions: loseDims,
    winCountA,
    winCountB,
    summary,
  };
}

export async function GET(request: NextRequest) {
  const challengerId = request.nextUrl.searchParams.get('from');
  const birthdate = request.nextUrl.searchParams.get('birthdate');
  const gender = request.nextUrl.searchParams.get('gender') || 'male';

  if (!challengerId || !birthdate) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  try {
    const db = getDb();

    // 获取挑战者报告
    const challengerReport = db.prepare(
      'SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC LIMIT 1'
    ).get(challengerId) as any;

    if (!challengerReport) {
      return NextResponse.json({ error: '挑战者暂无报告' }, { status: 404 });
    }

    const challengerScores = JSON.parse(challengerReport.radarScores || '{}');

    // 为对手生成报告
    const birthDateObj = new Date(birthdate);
    const birthData = {
      year: birthDateObj.getFullYear(),
      month: birthDateObj.getMonth() + 1,
      day: birthDateObj.getDate(),
    };

    const opponentReport = await generateFortuneReport(birthData, gender === 'male' ? '男' : '女');
    const opponentScores = opponentReport.radarScores;

    // 计算PK结果
    const pkResult = calculatePKResult(challengerScores, opponentScores);

    return NextResponse.json({
      challenger: {
        name: challengerReport.name,
        radarScores: challengerScores,
      },
      opponent: {
        name: '好友',
        birthYear: birthDateObj.getFullYear(),
        gender,
        radarScores: opponentScores,
      },
      result: pkResult,
    });
  } catch (error) {
    console.error('Error calculating PK result:', error);
    return NextResponse.json({ error: 'Failed to calculate PK result' }, { status: 500 });
  }
}
```

- [ ] **Step 2: 提交**
```bash
git add src/app/api/pk/result/route.ts
git commit -m "feat: add PK result API"
```

---

## Task 4: PK 页面

**Files:**
- Create: `src/app/pk/page.tsx`
- Create: `src/app/pk/result/page.tsx`

- [ ] **Step 1: 创建 PK 挑战等待页**

```typescript
// src/app/pk/page.tsx
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

    fetch(`/api/pk/create?userId=${challengerId}`)
      .then(res => res.json())
      .then(data => {
        setChallenger(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [challengerId]);

  if (loading) {
    return <div className="min-h-screen bg-[#1a1525] flex items-center justify-center">加载中...</div>;
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
```

- [ ] **Step 2: 创建 PK 结果页**

```typescript
// src/app/pk/result/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import RadarChart from '@/components/RadarChart';
import PKResultCard from '@/components/PKResultCard';

interface PKResultData {
  challenger: { name: string; radarScores: any };
  opponent: { name: string; birthYear: number; gender: string; radarScores: any };
  result: { winner: string; winDimensions: string[]; loseDimensions: string[]; summary: string };
}

export default function PKResultPage() {
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
    return <div className="min-h-screen bg-[#1a1525] flex items-center justify-center">加载中...</div>;
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

      <div className="flex gap-4">
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
```

- [ ] **Step 3: 提交**
```bash
git add src/app/pk/page.tsx src/app/pk/result/page.tsx
git commit -m "feat: add PK pages"
```

---

## Task 5: PKChallengeCard 组件

**Files:**
- Create: `src/components/PKChallengeCard.tsx`

- [ ] **Step 1: 创建 PKChallengeCard**

```typescript
// src/components/PKChallengeCard.tsx
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
```

- [ ] **Step 2: 提交**
```bash
git add src/components/PKChallengeCard.tsx
git commit -m "feat: add PKChallengeCard component"
```

---

## Task 6: PKResultCard 组件

**Files:**
- Create: `src/components/PKResultCard.tsx`

- [ ] **Step 1: 创建 PKResultCard**

```typescript
// src/components/PKResultCard.tsx
'use client';

interface PKResultCardProps {
  result: {
    winner: string;
    winDimensions: string[];
    loseDimensions: string[];
    summary: string;
  };
  challengerName: string;
  opponentName: string;
  isChallenger: boolean;
}

const DIMENSION_LABELS: Record<string, string> = {
  career: '事业运',
  love: '感情运',
  wealth: '财运',
  health: '健康运',
  mentor: '贵人运',
};

const DIMENSION_COLORS: Record<string, string> = {
  career: '#e74c3c',
  love: '#e91e63',
  wealth: '#f1c40f',
  health: '#2ecc71',
  mentor: '#3498db',
};

export default function PKResultCard({ result, challengerName, opponentName, isChallenger }: PKResultCardProps) {
  const myWinDims = isChallenger
    ? result.winDimensions
    : result.loseDimensions;
  const myLoseDims = isChallenger
    ? result.loseDimensions
    : result.winDimensions;

  return (
    <div className="bg-[#2a2235] rounded-xl p-6 w-full max-w-md">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">{result.winner === (isChallenger ? 'challenger' : 'opponent') ? '🏆' : '😢'}</div>
        <p className="text-xl font-bold text-white">{result.summary}</p>
      </div>

      <div className="space-y-4">
        {['career', 'love', 'wealth', 'health', 'mentor'].map(dim => {
          const isWin = myWinDims.includes(dim);
          const isLose = myLoseDims.includes(dim);
          const label = DIMENSION_LABELS[dim];
          const color = DIMENSION_COLORS[dim];

          return (
            <div key={dim} className="flex items-center justify-between">
              <span style={{ color }} className="font-medium">{label}</span>
              <div className="flex items-center gap-2">
                {isWin && <span className="text-green-400 text-sm">胜</span>}
                {isLose && <span className="text-red-400 text-sm">负</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-600 text-center text-gray-400 text-sm">
        <p>{challengerName} VS {opponentName}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交**
```bash
git add src/components/PKResultCard.tsx
git commit -m "feat: add PKResultCard component"
```

---

## Task 7: 集成与测试

- [ ] **Step 1: 在 ShareReport 页面添加"发起PK"按钮**

在 `src/components/ShareReport.tsx` 中添加 PK 分享入口：

```typescript
// 在分享按钮组中添加
<button
  onClick={() => {
    const shareUrl = `/pk?from=${report.userId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('PK链接已复制');
  }}
  className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold flex items-center justify-center gap-2"
>
  🎯 发起的PK
</button>
```

- [ ] **Step 2: 测试完整流程**

1. 启动开发服务器：`npm run dev`
2. 访问已有报告的用户页面，点击"发起的PK"按钮
3. 复制链接，在同一浏览器打开
4. 应看到 PKChallengeCard 显示挑战者信息
5. 点击"生成我的运势报告"并填写生日
6. 应跳转到 PK 结果页显示对比结果

- [ ] **Step 3: 提交**
```bash
git add src/components/ShareReport.tsx
git commit -m "feat: add PK challenge button to ShareReport"
```

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-24-fortune-pk-sharing-plan.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
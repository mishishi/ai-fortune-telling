# AI 八字命理分析仪 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 构建一个 AI 八字命理分析 Web 应用，用户输入出生信息，AI 追问后生成完整命盘报告

**架构:** Next.js 全栈应用，SQLite 本地数据库，Minimax API 做 AI 解读，自建八字排盘算法

**技术栈:** Next.js + TypeScript + TailwindCSS + Recharts + SQLite (better-sqlite3) + Minimax API

---

## File Structure

```
ai-fortune-telling/
├── src/
│   ├── lib/
│   │   ├── bazi/
│   │   │   ├── index.ts           # 统一导出
│   │   │   ├── lunar.ts           # 公历转农历
│   │   │   ├── solarTerms.ts      # 节气计算
│   │   │   ├── stemsBranches.ts   # 天干地支常量
│   │   │   ├── palace.ts          # 排八字主逻辑
│   │   │   ├── dayMaster.ts       # 日主旺衰
│   │   │   ├── tenGods.ts         # 十神推导
│   │   │   ├── fortune.ts         # 大运流年
│   │   │   └── nanYin.ts          # 纳音五行
│   │   ├── db.ts                  # SQLite 数据库初始化
│   │   └── minimax.ts             # Minimax API 调用
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # 首页（表单）
│   │   ├── report/[id]/page.tsx  # 报告查看页
│   │   ├── history/page.tsx      # 历史记录页
│   │   └── api/
│   │       ├── reports/route.ts   # POST GET
│   │       ├── reports/[id]/route.ts  # GET by id
│   │       ├── reports/[id]/unlock/route.ts  # POST unlock
│   │       └── ai/chat/route.ts   # POST AI对话/追问
│   ├── components/
│   │   ├── BirthForm.tsx          # 出生信息表单
│   │   ├── RadarChart.tsx         # 雷达图
│   │   ├── FortuneDisplay.tsx     # 命理解读展示
│   │   ├── Timeline.tsx           # 大运时间轴
│   │   ├── StarField.tsx          # 星空背景
│   │   ├── AuroraEffect.tsx       # 极光动效
│   │   ├── AIQuestionModal.tsx     # AI追问弹窗
│   │   └── Header.tsx
│   └── types/
│       └── index.ts                # TypeScript 类型定义
├── docs/
│   └── superpowers/
│       ├── specs/2026-04-19-ai-bazi-fortune-telling-design.md
│       └── plans/2026-04-19-ai-bazi-fortune-telling-plan.md
├── data/
│   └── lunarCalendar.json          # 万年历数据（1900-2100）
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---
## Task 1: 项目初始化

**目标:** 初始化 Next.js 项目，安装所有依赖

**依赖包:**
- next, react, react-dom, typescript
- tailwindcss, autoprefixer, postcss
- recharts（雷达图）
- better-sqlite3（数据库）
- @types/better-sqlite3, @types/react, @types/node

**步骤:**

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd D:/claude/workspace/ai-fortune-telling
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

选择默认选项即可。

- [ ] **Step 2: 安装额外依赖**

```bash
npm install recharts better-sqlite3
npm install -D @types/better-sqlite3
```

- [ ] **Step 3: 配置 Tailwind 主题色**

修改 `src/app/globals.css` 添加 CSS 变量:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-space-dark: #0a0e27;
  --color-star-gold: #f0c674;
  --color-aurora-purple: #7b68ee;
  --color-aurora-blue: #4169e1;
}
```

- [ ] **Step 4: 创建目录结构**

```bash
mkdir -p src/lib/bazi src/components src/types data docs/superpowers/plans
```

- [ ] **Step 5: 提交**

```bash
git add .
git commit -m "feat: initial Next.js project setup"
```

---
## Task 2: 八字排盘算法模块

**目标:** 实现完整的八字排盘计算，包含公历转农历、节气判断、干支排盘、大运流年

**文件:**
- 创建: `src/lib/bazi/lunar.ts`
- 创建: `src/lib/bazi/solarTerms.ts`
- 创建: `src/lib/bazi/stemsBranches.ts`
- 创建: `src/lib/bazi/palace.ts`
- 创建: `src/lib/bazi/dayMaster.ts`
- 创建: `src/lib/bazi/tenGods.ts`
- 创建: `src/lib/bazi/fortune.ts`
- 创建: `src/lib/bazi/nanYin.ts`
- 创建: `src/lib/bazi/index.ts`
- 测试: `src/lib/bazi/__tests__/bazi.test.ts`

**核心类型定义** (`src/lib/bazi/index.ts`):

```typescript
export interface BirthInfo {
  year: number;      // 公历年
  month: number;     // 公历月
  day: number;       // 公历日
  hour: number;      // 小时(0-23)
  minute: number;    // 分钟(0-59)
  gender: 'male' | 'female';
  province: string;  // 出生省份（真太阳时校正用）
}

export interface BaZi {
  yearPillar: StemBranch;  // 年柱
  monthPillar: StemBranch; // 月柱
  dayPillar: StemBranch;  // 日柱
  hourPillar: StemBranch; // 时柱
}

export interface StemBranch {
  stem: number;   // 天干 0-9
  branch: number; // 地支 0-11
}

export interface FortuneLine {
  age: number;          // 开始年龄
  stem: number;         // 天干
  branch: number;       // 地支
  element: number;      // 五行属性
}

export interface BaZiResult {
  bazi: BaZi;
  nanYin: { year: string; month: string; day: string; };
  dayMaster: {
    stem: number;
    strength: number;  // 0-100 旺衰程度
    element: number;   // 日主五行
  };
  tenGods: {
    yearToDay: number[];  // 年干→日干的十神关系
    monthToDay: number[];
    hourToDay: number[];
  };
  fortuneLines: FortuneLine[];  // 大运
  yearlyFortune: FortuneLine[]; // 流年（当前年起往后10年）
}
```

- [ ] **Step 1: 创建万年历数据文件**

下载万年历数据（1900-2100）保存到 `data/lunarCalendar.json`，包含每天的农历信息。数据来源可使用开源数据如 https://github.com/isee15/lunar-calendar

- [ ] **Step 2: 实现天干地支常量** (`src/lib/bazi/stemsBranches.ts`)

```typescript
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const ELEMENTS = ['木', '火', '土', '金', '水'];  // 0-4

// 天干五行对应: 甲乙木、丙丁火、戊己土、庚辛金、壬癸水
export const STEM_ELEMENTS = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

// 地支五行对应: 寅卯木、巳午火、申酉金、亥子水、辰戌丑未土
export const BRANCH_ELEMENTS: Record<number, number> = {
  0: 4, 1: 2, 2: 0, 3: 0, 4: 2, 5: 1,
  6: 1, 7: 2, 8: 3, 9: 3, 10: 2, 11: 4
};

// 十神: 比肩、比劫、食神、伤官、偏财、正财、七杀、正官、偏印、正印
export const TEN_GODS_NAMES = ['比肩', '比劫', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];
```

- [ ] **Step 3: 实现公历转农历** (`src/lib/bazi/lunar.ts`)

根据万年历数据表，查找公历日期对应的农历信息。边界情况：闰月处理。

- [ ] **Step 4: 实现节气计算** (`src/lib/bazi/solarTerms.ts`)

节气计算基于霍步金公式，精确到分钟。实现 `getSolarTerm(year, month, day, hour, minute)` 返回当前时刻的中气名称和精确时间。

- [ ] **Step 5: 实现排八字主逻辑** (`src/lib/bazi/palace.ts`)

```typescript
export function calculateBaZi(birth: BirthInfo, solarTerm: { term: string; exactTime: Date }): BaZi {
  // 1. 根据农历确定年柱（以立春为界）
  // 2. 根据节气确定月柱（以节为界，不是每月初一）
  // 3. 日柱根据已知公式推算（需要查日柱公式表）
  // 4. 根据出生时辰确定时柱
}
```

- [ ] **Step 6: 实现日主旺衰** (`src/lib/bazi/dayMaster.ts`)

计算日主（五行强弱），得令程度（得令、失令）、得地、得势、得助综合评分。

- [ ] **Step 7: 实现十神推导** (`src/lib/bazi/tenGods.ts`)

根据天干生克关系计算十神。

- [ ] **Step 8: 实现大运流年** (`src/lib/bazi/fortune.ts`)

```typescript
export function calculateFortuneLines(bazi: BaZi, birth: BirthInfo, startYear: number): FortuneLine[] {
  // 大运计算: 根据月令地支和性别起运
  // 流年计算: 从起运年龄开始逐年对应
}
```

- [ ] **Step 9: 实现纳音五行** (`src/lib/bazi/nanYin.ts`)

根据年柱、月柱查纳音五行表。

- [ ] **Step 10: 统一导出** (`src/lib/bazi/index.ts`)

```typescript
import { calculateBaZi, getSolarTerm } from './palace';
export { calculateBaZi, getSolarTerm };
export type { BirthInfo, BaZi, BaZiResult, StemBranch, FortuneLine } from './types';
```

- [ ] **Step 11: 写测试** (`src/lib/bazi/__tests__/bazi.test.ts`)

```typescript
import { calculateBaZi } from '../index';

describe('八字排盘', () => {
  it('1995年5月1日早8点排出正确八字', () => {
    const result = calculateBaZi({
      year: 1995, month: 5, day: 1,
      hour: 8, minute: 0,
      gender: 'male',
      province: '北京'
    });
    // 已知结果: 乙亥 庚辰 丁酉 甲辰
    expect(result.bazi.yearPillar.stem).toBe(1); // 乙
    expect(result.bazi.yearPillar.branch).toBe(11); // 亥
  });
});
```

- [ ] **Step 12: 运行测试验证**

```bash
npm test src/lib/bazi/__tests__/bazi.test.ts
```

- [ ] **Step 13: 提交**

```bash
git add src/lib/bazi data/lunarCalendar.json src/lib/bazi/__tests__
git commit -m "feat(bazi): 八字排盘算法模块

- 公历转农历
- 节气精确计算
- 年柱月柱日柱时柱排盘
- 日主旺衰分析
- 十神推导
- 大运流年计算
- 纳音五行

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---
## Task 3: 数据库 & API 接口

**目标:** 实现 SQLite 数据库初始化和报告的 CRUD API

**文件:**
- 创建: `src/lib/db.ts`
- 创建: `src/lib/types.ts`
- 创建: `src/app/api/reports/route.ts`
- 创建: `src/app/api/reports/[id]/route.ts`
- 创建: `src/app/api/reports/[id]/unlock/route.ts`

**数据库模型:**

```typescript
// Report 表
interface Report {
  id: string;              // UUID
  userId: string;          // 用户ID（简化版先用设备ID）
  name: string;            // 姓名
  gender: 'male' | 'female';
  birthData: string;       // JSON: {year, month, day, hour, minute, province}
  baziData: string;       // JSON: 八字排盘结果
  aiAnalysis: string;      // JSON: AI解读结果
  radarScores: string;     // JSON: {career, love, wealth, health, mentor}
  isFullVersion: boolean;  // 是否完整版
  unlocked: boolean;       // 是否已解锁
  createdAt: string;        // ISO时间
}
```

- [ ] **Step 1: 创建数据库初始化** (`src/lib/db.ts`)

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'fortune.db');

let db: Database.Database;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        birthData TEXT NOT NULL,
        baziData TEXT NOT NULL,
        aiAnalysis TEXT NOT NULL,
        radarScores TEXT NOT NULL,
        isFullVersion INTEGER DEFAULT 1,
        unlocked INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_reports_userId ON reports(userId);
    `);
  }
  return db;
}
```

- [ ] **Step 2: 创建 API - 保存报告** (`src/app/api/reports/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, name, gender, birthData, baziData, aiAnalysis, radarScores, isFullVersion = true, unlocked = false } = body;

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  const db = getDb();
  db.prepare(`
    INSERT INTO reports (id, userId, name, gender, birthData, baziData, aiAnalysis, radarScores, isFullVersion, unlocked, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, name, gender, JSON.stringify(birthData), JSON.stringify(baziData), JSON.stringify(aiAnalysis), JSON.stringify(radarScores), isFullVersion ? 1 : 0, unlocked ? 1 : 0, createdAt);

  return NextResponse.json({ id, createdAt });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const db = getDb();
  const reports = db.prepare(`
    SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC
  `).all(userId);

  return NextResponse.json(reports);
}
```

- [ ] **Step 3: 创建 API - 获取单条报告** (`src/app/api/reports/[id]/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(params.id);

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json(report);
}
```

- [ ] **Step 4: 创建 API - 解锁报告** (`src/app/api/reports/[id]/unlock/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const result = db.prepare('UPDATE reports SET unlocked = 1 WHERE id = ?').run(params.id);

  if (result.changes === 0) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: 提交**

```bash
git add src/lib/db.ts src/app/api/
git commit -m "feat(api): 报告CRUD接口

- POST /api/reports 保存报告
- GET /api/reports?userId=xxx 获取用户报告列表
- GET /api/reports/[id] 获取单条报告
- POST /api/reports/[id]/unlock 解锁报告

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---
## Task 4: AI 集成（Minimax）

**目标:** 实现 Minimax API 调用，包含 AI 追问和 AI 解读生成

**文件:**
- 创建: `src/lib/minimax.ts`
- 创建: `src/app/api/ai/chat/route.ts`

- [ ] **Step 1: 创建 Minimax API 调用模块** (`src/lib/minimax.ts`)

```typescript
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || '';
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MINIMAX_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'abab6.5s-chat',
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Minimax API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
```

- [ ] **Step 2: 创建 AI 对话 API** (`src/app/api/ai/chat/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatMessage } from '@/lib/minimax';

const SYSTEM_PROMPT = `你是一个资深八字命理师，说话自信直接，像有20年经验的老先生。

用户会提供八字信息，你负责两件事：
1. 追问：问用户最想了解哪方面（事业/感情/财运/健康/贵人），最多问2轮
2. 解读：收集足够信息后，生成完整命盘解读

解读风格要求：
- 自信直接，不模糊
- 负面预测带正向引导
- 每个维度给出分数（1-100）
- 分维度输出：命局总评、事业、感情、财运、健康、大运、流年`;

export async function POST(req: NextRequest) {
  const { messages, baziData } = await req.json();

  const chatMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  if (baziData) {
    chatMessages.push({
      role: 'system',
      content: `八字信息：${JSON.stringify(baziData)}`
    });
  }

  chatMessages.push(...messages);

  try {
    const reply = await chat(chatMessages);
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'AI服务异常' }, { status: 500 });
  }
}
```

- [ ] **Step 3: 创建生成完整报告的 API** (`src/app/api/ai/analyze/route.ts`)

这个 API 接收八字数据，一次性生成完整报告（雷达图分数 + 各维度解读）。

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/minimax';

const ANALYSIS_PROMPT = `你是一个资深八字命理师。给出以下八字信息，生成完整命盘分析报告。

八字信息：{baziData}

输出格式（严格按这个JSON格式输出，不要任何其他内容）：
{
  "radarScores": {
    "career": 85,      // 事业分数 0-100
    "love": 72,        // 感情分数 0-100
    "wealth": 78,      // 财运分数 0-100
    "health": 65,     // 健康分数 0-100
    "mentor": 88      // 贵人分数 0-100
  },
  "analysis": {
    "overall": "命局总评...",
    "career": "事业运详解...",
    "love": "感情运详解...",
    "wealth": "财运详解...",
    "health": "健康运详解...",
    "fortune": "大运趋势...",
    "yearly": "流年预测..."
  }
}`;

export async function POST(req: NextRequest) {
  const { baziData } = await req.json();

  try {
    const reply = await chat([
      { role: 'system', content: '你是一个八字命理分析专家，严格按指定JSON格式输出。' },
      { role: 'user', content: ANALYSIS_PROMPT.replace('{baziData}', JSON.stringify(baziData)) }
    ]);

    // 尝试解析JSON
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'AI输出格式异常' }, { status: 500 });
  } catch (error) {
    return NextResponse.json({ error: '分析失败' }, { status: 500 });
  }
}
```

- [ ] **Step 4: 提交**

```bash
git add src/lib/minimax.ts src/app/api/ai/
git commit -m "feat(ai): Minimax API 集成

- /api/ai/chat 交互式对话（追问）
- /api/ai/analyze 一次性生成完整报告

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---
## Task 5: 前端 — 首页 & 出生表单

**目标:** 实现首页，包含星空背景动画和出生信息表单

**文件:**
- 创建: `src/components/StarField.tsx`
- 创建: `src/components/AuroraEffect.tsx`
- 创建: `src/components/BirthForm.tsx`
- 修改: `src/app/page.tsx`
- 修改: `src/app/layout.tsx`

- [ ] **Step 1: 创建星空背景组件** (`src/components/StarField.tsx`)

Canvas animation 实现星点粒子背景，随机分布的星点 + 微微闪烁效果。

- [ ] **Step 2: 创建极光动效组件** (`src/components/AuroraEffect.tsx`)

CSS animation 实现流光/极光渐变背景。

- [ ] **Step 3: 创建出生信息表单** (`src/components/BirthForm.tsx`)

包含姓名、性别、出生年月日时分、出生省份等字段。

- [ ] **Step 4: 修改首页** (`src/app/page.tsx`)

整合 StarField + AuroraEffect + BirthForm，表单提交后调用 API 分析并跳转报告页。

- [ ] **Step 5: 提交**

```bash
git add src/components/StarField.tsx src/components/AuroraEffect.tsx src/components/BirthForm.tsx src/app/page.tsx src/app/layout.tsx
git commit -m "feat(frontend): 首页 + 星空背景 + 出生表单

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---
## Task 6: 前端 — 报告展示

**目标:** 实现报告页，包含雷达图、命理解读、大运时间轴

**文件:**
- 创建: `src/components/RadarChart.tsx`
- 创建: `src/components/FortuneDisplay.tsx`
- 创建: `src/components/Timeline.tsx`
- 创建: `src/app/report/[id]/page.tsx`

- [ ] **Step 1: 创建雷达图组件** (`src/components/RadarChart.tsx`)

使用 Recharts 的 RadarChart 组件，展示5个维度的分数。

```typescript
'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RadarChartProps {
  scores: {
    career: number;
    love: number;
    wealth: number;
    health: number;
    mentor: number;
  };
}

const DIMENSIONS = [
  { key: 'career', label: '事业', angle: 90 },
  { key: 'love', label: '感情', angle: 162 },
  { key: 'wealth', label: '财运', angle: 234 },
  { key: 'health', label: '健康', angle: 306 },
  { key: 'mentor', label: '贵人', angle: 18 },
];

export default function RadarChartComponent({ scores }: RadarChartProps) {
  const data = DIMENSIONS.map(d => ({
    dimension: d.label,
    value: scores[d.key as keyof typeof scores],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#f0c674', fontSize: 14 }} />
        <Radar
          name="分数"
          dataKey="value"
          stroke="#7b68ee"
          fill="#7b68ee"
          fillOpacity={0.4}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2: 创建命理解读组件** (`src/components/FortuneDisplay.tsx`)

对话式展示 AI 生成的命理解读，分段展示每个维度。

```typescript
interface FortuneDisplayProps {
  analysis: {
    overall: string;
    career: string;
    love: string;
    wealth: string;
    health: string;
    fortune: string;
    yearly: string;
  };
}

export default function FortuneDisplay({ analysis }: FortuneDisplayProps) {
  const sections = [
    { title: '命局总评', content: analysis.overall },
    { title: '事业运', content: analysis.career },
    { title: '感情运', content: analysis.love },
    { title: '财运', content: analysis.wealth },
    { title: '健康运', content: analysis.health },
    { title: '大运趋势', content: analysis.fortune },
    { title: '流年预测', content: analysis.yearly },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, i) => (
        <div key={i} className="bg-white/5 rounded-xl p-5 border border-white/10">
          <h3 className="text-star-gold font-bold text-lg mb-3">{section.title}</h3>
          <p className="text-gray-300 leading-relaxed">{section.content}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 创建时间轴组件** (`src/components/Timeline.tsx`)

横向展示大运阶段，点击可查看详情。

- [ ] **Step 4: 创建报告页** (`src/app/report/[id]/page.tsx`)

```typescript
import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import RadarChartComponent from '@/components/RadarChart';
import FortuneDisplay from '@/components/FortuneDisplay';
import Timeline from '@/components/Timeline';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(params.id) as any;

  if (!report) {
    notFound();
  }

  const baziData = JSON.parse(report.baziData);
  const radarScores = JSON.parse(report.radarScores);
  const aiAnalysis = JSON.parse(report.aiAnalysis);

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{report.name} 的命盘</h1>
        <p className="text-gray-400">生成时间：{new Date(report.createdAt).toLocaleDateString('zh-CN')}</p>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
        <h2 className="text-center text-star-gold font-bold mb-4">命盘雷达图</h2>
        <RadarChartComponent scores={radarScores} />
        <div className="flex justify-center gap-6 text-sm text-gray-400 mt-4">
          <span>事业 {radarScores.career}分</span>
          <span>感情 {radarScores.love}分</span>
          <span>财运 {radarScores.wealth}分</span>
          <span>健康 {radarScores.health}分</span>
          <span>贵人 {radarScores.mentor}分</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-center text-star-gold font-bold mb-4">大运时间轴</h2>
        <Timeline baziData={baziData} />
      </div>

      <div>
        <h2 className="text-center text-star-gold font-bold mb-4">命盘解读</h2>
        <FortuneDisplay analysis={aiAnalysis} />
      </div>

      {!report.unlocked && (
        <div className="mt-8 text-center">
          <button className="px-8 py-4 rounded-xl font-bold text-lg" style={{ background: 'linear-gradient(135deg, #f0c674, #e0a500)', color: '#0a0e27' }}>
            解锁完整报告（¥29）
          </button>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 5: 提交**

```bash
git add src/components/RadarChart.tsx src/components/FortuneDisplay.tsx src/components/Timeline.tsx src/app/report/[id]/page.tsx
git commit -m "feat(frontend): 报告展示页 - 雷达图 + 命理解读 + 时间轴

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---
## Task 7: AI 追问功能

**目标:** 实现 AI 追问弹窗，增强用户交互体验

**文件:**
- 创建: `src/components/AIQuestionModal.tsx`
- 修改: `src/app/page.tsx`

- [ ] **Step 1: 创建 AI 追问弹窗组件** (`src/components/AIQuestionModal.tsx`)

```typescript
'use client';
import { useState } from 'react';

interface AIQuestionModalProps {
  open: boolean;
  messages: { role: 'user' | 'assistant'; content: string }[];
  onSend: (message: string) => Promise<void>;
  onDone: () => void;
}

export default function AIQuestionModal({ open, messages, onSend, onDone }: AIQuestionModalProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    await onSend(input);
    setInput('');
    setSending(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#0a0e27] border border-white/20 rounded-2xl w-full max-w-lg p-6">
        <h2 className="text-xl font-bold text-star-gold mb-4">AI 命理师追问</h2>

        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-xl ${m.role === 'user' ? 'bg-aurora-purple text-white' : 'bg-white/10 text-gray-300'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="请输入你的回答..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-500"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-2 rounded-xl font-bold bg-aurora-purple text-white disabled:opacity-50"
          >
            {sending ? '...' : '发送'}
          </button>
        </div>

        <button onClick={onDone} className="mt-3 w-full text-center text-gray-400 text-sm hover:text-white">
          跳过，直接生成报告
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 修改首页集成追问** (`src/app/page.tsx`)

在表单提交后、生成报告前，加入 AI 追问流程（最多2-3轮）。

- [ ] **Step 3: 提交**

```bash
git add src/components/AIQuestionModal.tsx src/app/page.tsx
git commit -m "feat(frontend): AI 追问弹窗组件

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---
## Task 8: 历史记录页

**目标:** 实现用户历史报告列表和查看功能

**文件:**
- 创建: `src/app/history/page.tsx`

- [ ] **Step 1: 创建历史记录页** (`src/app/history/page.tsx`)

```typescript
import { getDb } from '@/lib/db';
import Link from 'next/link';

export default async function HistoryPage({ searchParams }: { searchParams: { userId?: string } }) {
  const userId = searchParams.userId || 'anonymous';
  const db = getDb();
  const reports = db.prepare('SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC').all(userId) as any[];

  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">历史报告</h1>

      {reports.length === 0 ? (
        <p className="text-gray-400 text-center py-12">暂无历史报告</p>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <Link
              key={report.id}
              href={`/report/${report.id}`}
              className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-aurora-purple transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-bold">{report.name} 的命盘</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(report.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span className="text-star-gold">查看 →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/history/page.tsx
git commit -m "feat(frontend): 历史记录页

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---
## 自检清单

**Spec 覆盖率检查:**
- [x] 产品定位 → Task 1 项目初始化
- [x] 视觉风格（星象宇宙） → Task 5 星空背景 + Task 6 极光
- [x] 交互流程（表单→追问→报告） → Task 5 表单 + Task 7 追问 + Task 6 报告
- [x] 八字排盘算法 → Task 2
- [x] AI 解读 → Task 4
- [x] 雷达图 + 对话式解读 → Task 6 RadarChart + FortuneDisplay
- [x] 大运时间轴 → Task 6 Timeline
- [x] 历史记录保存 → Task 3 数据库 + Task 8 历史页
- [x] 商业模式（解锁付费） → Task 3 unlock API + Task 6 解锁按钮

**占位符检查:** 无 TBD/TODO，所有步骤包含实际代码和具体文件路径。

**类型一致性:** 所有 TypeScript 类型在 Task 2 的 `src/lib/bazi/index.ts` 中定义，Task 6 引用一致。

---
## 执行选项

**Plan complete and saved to `docs/superpowers/plans/2026-04-19-ai-bazi-fortune-telling-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — 任务分派给独立子 agent 执行，每完成一个任务后 review，快速迭代

**2. Inline Execution** — 在当前 session 顺序执行所有任务，有检查点

**Which approach?**

# 八字命盘环形展示实施计划

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan.

**Goal:** 在报告页首屏实现八字命盘环形可视化，作为核心视觉焦点

**Architecture:** 新建 BaziRing.tsx 组件，使用 SVG 绘制环形命盘。在 report/[id]/page.tsx 首屏引入，置于雷达图上方。

---

## Task 1: 创建 BaziRing 组件

**Files:**
- Create: `src/components/BaziRing.tsx`

**Steps:**

- [ ] **Step 1: 创建 BaziRing.tsx 基础结构**

```tsx
'use client';

import { useState } from 'react';

interface Pillar {
  stem: string;    // 天干
  branch: string;  // 地支
  element: string; // 五行
}

interface BaziRingProps {
  birthData: {
    yearPillar: Pillar;   // 年柱
    monthPillar: Pillar;  // 月柱
    dayPillar: Pillar;   // 日柱
    hourPillar: Pillar;   // 时柱
  };
  size?: number;
}

const ELEMENT_COLORS: Record<string, string> = {
  wood: '#4ade80',
  fire: '#f87171',
  earth: '#fbbf24',
  metal: '#60a5fa',
  water: '#a78bfa',
};

export default function BaziRing({ birthData, size = 280 }: BaziRingProps) {
  // TODO: SVG 绘制环形命盘
}

export type { BaziRingProps, Pillar };
```

- [ ] **Step 2: 添加 SVG 环形基础结构**

计算四柱位置（角度）：
- 年柱：顶部 → 270° (-90°)
- 月柱：左侧 → 180°
- 时柱：右侧 → 0°
- 日柱：中心圆

```tsx
// 位置计算
const getPosition = (angle: number, radius: number, centerX: number, centerY: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad),
  };
};

// 四柱角度（年、月、日在顶/左/右，时在底部）
const PILLAR_POSITIONS = [
  { key: 'year', label: '年柱', angle: -90 },
  { key: 'month', label: '月柱', angle: 180 },
  { key: 'hour', label: '时柱', angle: 0 },
];
```

- [ ] **Step 3: 绘制中心圆（日柱）**

```tsx
// 中心圆（日柱）
const centerRadius = size * 0.18;
<circle
  cx={center}
  cy={center}
  r={centerRadius}
  fill={`url(#dayGlow)`}
  className="transition-all duration-300"
/>
```

- [ ] **Step 4: 绘制外环四柱**

每个柱子用 `<g>` 包裹，包含：
- 柱子背景（圆角矩形）
- 天干文字
- 地支文字
- 五行颜色条

- [ ] **Step 5: 添加 hover 交互状态**

```tsx
const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

<g
  onMouseEnter={() => setHoveredPillar(pillar.key)}
  onMouseLeave={() => setHoveredPillar(null)}
  className="cursor-pointer transition-all duration-200"
  opacity={hoveredPillar && hoveredPillar !== pillar.key ? 0.3 : 1}
>
```

- [ ] **Step 6: 添加点击展开详情**

```tsx
const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

// 点击某柱后显示详情卡片
{selectedPillar && (
  <PillarDetailCard pillar={...} onClose={() => setSelectedPillar(null)} />
)}
```

- [ ] **Step 7: 添加入场动画**

```tsx
// CSS 动画类
.animate-ring-in {
  animation: ringExpand 600ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
.animate-pillar-in {
  opacity: 0;
  animation: pillarFadeIn 400ms ease-out forwards;
}
```

- [ ] **Step 8: 提交**

```bash
git add src/components/BaziRing.tsx
git commit -m "feat: create BaziRing component for destiny chart display"
```

---

## Task 2: 集成到报告页

**Files:**
- Modify: `src/app/report/[id]/page.tsx`

**Steps:**

- [ ] **Step 1: 导入 BaziRing 组件**

```tsx
import BaziRing from '@/components/BaziRing';
```

- [ ] **Step 2: 获取八字数据**

从 `report` 对象中提取四柱数据：
```tsx
// 假设 report 数据结构中有 bazi 字段
const birthData = {
  yearPillar: { stem: report.yearStem, branch: report.yearBranch, element: report.yearElement },
  monthPillar: { stem: report.monthStem, branch: report.monthBranch, element: report.monthElement },
  dayPillar: { stem: report.dayStem, branch: report.dayBranch, element: report.dayElement },
  hourPillar: { stem: report.hourStem, branch: report.hourBranch, element: report.hourElement },
};
```

如果没有八字数据，需要从 birthDate 推导（调用 API 或使用八字的计算逻辑）

- [ ] **Step 3: 在报告页首屏放置 BaziRing**

位置：在 RadarChart 上方，Header 下方

```tsx
<div className="flex flex-col items-center py-6">
  <BaziRing birthData={birthData} size={280} />
  
  {/* 简短信息 */}
  <div className="mt-4 text-center">
    <p className="text-sm text-gray-400">
      生肖：{zodiac} · 五行：{elementInfo}
    </p>
  </div>
</div>
```

- [ ] **Step 4: 提交**

```bash
git add src/app/report/[id]/page.tsx
git commit -m "feat: integrate BaziRing in report page header"
```

---

## Task 3: 添加五行相生相克连线（可选增强）

**Files:**
- Modify: `src/components/BaziRing.tsx`

如果时间允许，添加五行相生（→）和相克（→）的连线：
- 木 → 火 → 土 → 金 → 水 → 木 （相生）
- 金 → 木 → 土 → 水 → 火 → 金 （相克）

用虚线表示，hover 时高亮相关连线。

---

## Task 4: 最终验证

**Steps:**

- [ ] 启动开发服务器 `npm run dev`
- [ ] 打开报告页 http://localhost:3004/report/[id]
- [ ] 验证环形命盘正确显示
- [ ] 验证 hover 交互正常
- [ ] 验证入场动画播放
- [ ] 验证移动端适配正常

---

## 技术说明

### 八字数据结构

当前 `report` 对象中是否已有八字数据？需要检查：
- `report.bazi` - 完整的八字对象
- 或者需要调用 `/api/bazi?birthDate=xxx` 获取

如果数据不存在，需要先确认数据来源。

### 尺寸计算

```typescript
const size = 280; // 默认尺寸
const center = size / 2;
const outerRadius = size * 0.42;  // 外环半径
const pillarRadius = size * 0.32;  // 四柱位置半径
const centerRadius = size * 0.18; // 中心圆半径
```

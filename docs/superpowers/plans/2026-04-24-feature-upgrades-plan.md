# 功能升级实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现四个功能升级：首页每日运势卡片、分阶段加载进度、连续签到奖励池、动态分享卡片

**Architecture:** 四个功能独立开发，前端组件为主，部分API扩展

**Tech Stack:** Next.js, TypeScript, TailwindCSS, SQLite, html-to-image

---

## 文件结构

```
src/
├── app/
│   ├── page.tsx                          # [修改] 首页，添加每日运势卡片
│   ├── api/
│   │   ├── gamification/
│   │   │   ├── checkin/route.ts         # [修改] 签到API，增加里程碑逻辑
│   │   │   └── milestones/route.ts      # [新建] 里程碑状态API
│   │   └── fortune/
│   │       └── daily/route.ts           # [新建] 每日运势计算API
│   └── components/
│       ├── DailyFortuneCard.tsx          # [新建] 每日运势卡片组件
│       ├── DestinyRings.tsx              # [修改] 加载动画，增加进度阶段
│       ├── CheckinCard.tsx               # [修改] 签到组件，增加里程碑展示
│       ├── MilestoneModal.tsx            # [新建] 里程碑详情弹窗
│       ├── ShareReportModal.tsx          # [修改] 分享组件，增强视觉效果
│       └── LoadingProgress.tsx           # [新建] 加载进度条组件
└── lib/
    ├── db.ts                             # [修改] 数据库迁移，补签卡字段
    └── bazi/
        └── fortune.ts                    # [修改] 每日运势计算逻辑
```

**数据库变更:**
- `users` 表增加 `streakRepairCards` 字段（补签卡数量）
- `checkins` 表增加 `streakStatus` 字段（是否补签）

---

## Task 1: 首页每日运势卡片

**Files:**
- Create: `src/components/DailyFortuneCard.tsx`
- Create: `src/app/api/fortune/daily/route.ts`
- Modify: `src/app/page.tsx:1-50` (引入卡片)

- [ ] **Step 1: 创建每日运势API**

```typescript
// src/app/api/fortune/daily/route.ts
// GET /api/fortune/daily?userId=xxx
// 返回基于历史报告计算的每日运势数据
```

- [ ] **Step 2: 创建卡片组件**

```typescript
// src/components/DailyFortuneCard.tsx
// Props: { userId?: string, report?: Report }
// 展示：综合分、四维评分、命主提示、宜忌吉时
// 未登录/无报告状态显示引导卡片
```

- [ ] **Step 3: 集成到首页**

```typescript
// src/app/page.tsx
// 在BirthForm上方引入<DailyFortuneCard />
```

- [ ] **Step 4: 测试并提交**

---

## Task 2: 分阶段加载进度

**Files:**
- Create: `src/components/LoadingProgress.tsx`
- Modify: `src/components/DestinyRings.tsx`

- [ ] **Step 1: 创建进度条组件**

```typescript
// src/components/LoadingProgress.tsx
// Props: { stage: 'bazi' | 'ai' | 'report', progress: number }
// 阶段: 八字计算(40%) → AI分析(70%) → 报告生成(100%)
```

- [ ] **Step 2: 修改DestinyRings加载动画**

```typescript
// src/components/DestinyRings.tsx
// 集成LoadingProgress，在loading时展示阶段进度
```

- [ ] **Step 3: 测试并提交**

---

## Task 3: 连续签到奖励池

**Files:**
- Modify: `src/lib/db.ts` (迁移)
- Modify: `src/app/api/gamification/checkin/route.ts`
- Create: `src/app/api/gamification/milestones/route.ts`
- Modify: `src/components/CheckinCard.tsx`
- Create: `src/components/MilestoneModal.tsx`

- [ ] **Step 1: 数据库迁移**

```typescript
// src/lib/db.ts
// ALTER TABLE users ADD streakRepairCards INTEGER DEFAULT 0
// ALTER TABLE checkins ADD isRepair BOOLEAN DEFAULT 0
```

- [ ] **Step 2: 修改签到API**

```typescript
// src/app/api/gamification/checkin/route.ts
// 签到时检查是否达成里程碑，返回奖励通知
// 支持补签逻辑
```

- [ ] **Step 3: 创建里程碑API**

```typescript
// src/app/api/gamification/milestones/route.ts
// GET /api/gamification/milestones?userId=xxx
// 返回用户当前进度和里程碑状态
```

- [ ] **Step 4: 修改签到卡片组件**

```typescript
// src/components/CheckinCard.tsx
// 增加进度条展示：再签到X天获得补签卡
// 点击展开查看完整里程碑
```

- [ ] **Step 5: 创建里程碑详情弹窗**

```typescript
// src/components/MilestoneModal.tsx
// 展示所有里程碑卡片墙
// 已完成打勾，未完成灰显+距离天数
```

- [ ] **Step 6: 测试并提交**

---

## Task 4: 动态分享卡片

**Files:**
- Modify: `src/components/ShareReportModal.tsx`
- Add: CSS动画样式

- [ ] **Step 1: 分析现有分享组件**

```typescript
// 读取 src/components/ShareReportModal.tsx
// 了解当前html-to-image生成逻辑
```

- [ ] **Step 2: 增强视觉效果**

```css
/* 增加动态渐变边框和装饰元素 */
/* 使用CSS animation实现渐变流动效果 */
```

- [ ] **Step 3: 修改分享卡片模板**

```typescript
// src/components/ShareReportModal.tsx
// 增加精美边框、命盘装饰元素、渐变背景
```

- [ ] **Step 4: 测试并提交**

---

## 执行选项

**1. Subagent-Driven (推荐)** - 每个Task分配独立subagent，任务间review

**2. Inline Execution** - 当前session内批量执行，带检查点

选择哪个方式？

# 补签提醒推送 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现补签提醒推送功能：检测连续签到中断风险，发送 Web Push 提醒用户，并在漏签时支持补签卡修复

**Architecture:**
- 新增 `/api/push/check-streak` API 供 Cron 调用，检测需要提醒的用户
- 复用现有 `/api/push/send` 发送 streak_warning 和 streak_broken 类型推送
- 复用现有 `/api/gamification/checkin` POST 接口，增加漏签时自动使用补签卡修复逻辑

**Tech Stack:** Next.js API Routes, SQLite, Web Push

---

## 文件结构

```
src/
├── app/api/
│   ├── push/
│   │   ├── send/route.ts           # [修改] 增加 streak_warning/streak_broken 类型
│   │   └── check-streak/
│   │       └── route.ts             # [新建] 检测需要提醒的用户
│   └── gamification/
│       └── checkin/route.ts         # [修改] 漏签时自动使用补签卡
└── lib/
    └── constants/
        └── gamification.ts          # [修改] 增加 STREAK_WARNING_THRESHOLD 常量
```

---

## Task 1: 新增 check-streak API

**Files:**
- Create: `src/app/api/push/check-streak/route.ts`
- Modify: `src/lib/constants/gamification.ts` (增加 STREAK_WARNING_THRESHOLD)

- [ ] **Step 1: 在 gamification 常量中增加阈值**

```typescript
// src/lib/constants/gamification.ts
// 在文件末尾添加

// 补签提醒阈值
export const STREAK_WARNING_THRESHOLD = 3;  // 连续3天以上才发送提醒
export const STREAK_REPAIR_WINDOW_DAYS = 1; // 漏签后1天内可修复
```

- [ ] **Step 2: 创建 check-streak API**

```typescript
// src/app/api/push/check-streak/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { STREAK_WARNING_THRESHOLD, getDateStr } from '@/lib/constants/gamification';

function getDateStr(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  // 验证 CRON_SECRET
  const authHeader = request.headers.get('authorization') ?? '';
  const token = `Bearer ${process.env.CRON_SECRET}`;
  if (authHeader !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const today = getDateStr();
  const yesterday = getDateStr(1);
  const dayBeforeYesterday = getDateStr(2);

  // 获取所有连续签到 >= 3 天的用户
  const users = db.prepare(`
    SELECT id, currentStreak, streakRepairCards
    FROM users
    WHERE currentStreak >= ?
  `).all(STREAK_WARNING_THRESHOLD) as { id: string; currentStreak: number; streakRepairCards: number }[];

  const warnings: { userId: string; currentStreak: number; type: 'streak_warning' }[] = [];
  const broken: { userId: string; currentStreak: number; hasRepairCard: boolean; type: 'streak_broken' }[] = [];

  for (const user of users) {
    // 获取用户最近2次签到记录
    const recentCheckins = db.prepare(`
      SELECT checkinDate
      FROM checkins
      WHERE userId = ?
      ORDER BY checkinDate DESC
      LIMIT 2
    `).all(user.id) as { checkinDate: string }[];

    if (recentCheckins.length === 0) continue;

    const lastCheckinDate = recentCheckins[0].checkinDate;

    // 场景1: streak_warning - 连续签到中，今天已签到，提醒明天别断
    if (lastCheckinDate === today && user.currentStreak >= STREAK_WARNING_THRESHOLD) {
      warnings.push({
        userId: user.id,
        currentStreak: user.currentStreak,
        type: 'streak_warning',
      });
    }

    // 场景2: streak_broken - 昨天没签到，今天也没签（昨天断了）且有补签卡
    if (lastCheckinDate === dayBeforeYesterday && user.streakRepairCards > 0) {
      // 检查今天是否已签到（已签到就不是broken状态）
      const checkedInToday = recentCheckins.some(c => c.checkinDate === today);
      if (!checkedInToday) {
        broken.push({
          userId: user.id,
          currentStreak: user.currentStreak,
          hasRepairCard: true,
          type: 'streak_broken',
        });
      }
    }
  }

  return NextResponse.json({ warnings, broken });
}
```

- [ ] **Step 3: 测试 API**

手动测试（需要先设置 CRON_SECRET 环境变量）：
```bash
curl -X POST http://localhost:3000/api/push/check-streak \
  -H "Authorization: Bearer test-secret"
```

预期返回：`{ "warnings": [...], "broken": [...] }`

- [ ] **Step 4: 提交**

```bash
git add src/app/api/push/check-streak/route.ts src/lib/constants/gamification.ts
git commit -m "feat: add check-streak API for streak reminder detection"
```

---

## Task 2: 扩展 push/send 支持 streak 类型

**Files:**
- Modify: `src/app/api/push/send/route.ts`

- [ ] **Step 1: 添加 streak 类型推送内容生成**

```typescript
// src/app/api/push/send/route.ts
// 在 generateDailyContent 函数后添加新函数

function generateStreakWarningContent(currentStreak: number) {
  return {
    title: '🔥 连续签到别断了！',
    body: `明天记得签到，你的连续 ${currentStreak} 天就要达成了～`,
  };
}

function generateStreakBrokenContent(remainingCards: number) {
  return {
    title: '💔 连续签到已中断',
    body: `别灰心，你还有 ${remainingCards} 张补签卡，点击修复连续签到`,
  };
}
```

- [ ] **Step 2: 修改 POST 处理逻辑，支持 type 参数**

在 `POST` 函数中，解析 body 的 `type` 参数：

```typescript
// 在 const content = generateDailyContent(new Date()); 之前添加
const body = await request.json().catch(() => ({}));
const { type } = body;

// 根据 type 生成不同内容
let content;
if (type === 'streak_warning') {
  content = generateStreakWarningContent(body.currentStreak || 5);
} else if (type === 'streak_broken') {
  content = generateStreakBrokenContent(body.remainingCards || 1);
} else {
  content = generateDailyContent(new Date());
}
```

- [ ] **Step 3: 修改发送逻辑，添加到 /api/push/check-streak 的调用**

在 Cron 任务配置中，每天 20:00 先调用 check-streak，再调用 send：

```bash
# 每天 20:00 发送补签提醒
0 20 * * * \
  curl -s -X POST http://localhost:3000/api/push/check-streak \
    -H "Authorization: Bearer $CRON_SECRET" | \
  jq -c '.warnings[] | .userId' | while read userId; do \
    curl -s -X POST http://localhost:3000/api/push/send \
      -H "Authorization: Bearer $CRON_SECRET" \
      -H "Content-Type: application/json" \
      -d "{\"type\":\"streak_warning\",\"userId\":\"$userId\",\"currentStreak\":5}"; \
  done
```

（实际部署时可使用 cron-job.org 或其他 cron 服务）

- [ ] **Step 4: 提交**

```bash
git add src/app/api/push/send/route.ts
git commit -m "feat: support streak_warning and streak_broken push types"
```

---

## Task 3: 签到时自动使用补签卡

**Files:**
- Modify: `src/app/api/gamification/checkin/route.ts`

- [ ] **Step 1: 在 POST 函数开头增加漏签检测逻辑**

在 `// Check if already checked in today` 之前添加：

```typescript
// 检测是否漏签需要自动修复
const lastCheckin = db.prepare(
  'SELECT checkinDate FROM checkins WHERE userId = ? ORDER BY checkinDate DESC LIMIT 1'
).get(userId) as { checkinDate: string } | undefined;

const today = getTodayDate();
const yesterday = getYesterdayDate();
const dayBeforeYesterday = getDateNDaysAgo(2);

// 如果上次签到是前天（昨天漏签了），且有补签卡，自动使用
if (lastCheckin && lastCheckin.checkinDate === dayBeforeYesterday) {
  const user = db.prepare('SELECT streakRepairCards FROM users WHERE id = ?').get(userId) as any;
  if (user && user.streakRepairCards > 0) {
    // 自动使用补签卡补昨天的签
    const checkinId = generateId();
    const now = new Date().toISOString();

    db.transaction(() => {
      // 补签昨天的记录
      db.prepare(
        'INSERT INTO checkins (id, userId, checkinDate, points, isRepair, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(checkinId, userId, yesterday, CHECKIN_POINTS, 1, now);

      // 扣减补签卡
      db.prepare(
        'UPDATE users SET streakRepairCards = streakRepairCards - 1 WHERE id = ?'
      ).run(userId);
    })();
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/gamification/checkin/route.ts
git commit -m "feat: auto-use repair card when user missed yesterday checkin"
```

---

## Task 4: 整体集成测试

- [ ] **Step 1: 手动测试流程**

1. 创建测试用户，连续签到3天
2. 跳过第4天，调用 check-streak API
3. 验证返回 broken 列表包含该用户
4. 调用 send API 发送 streak_broken 类型
5. 用户点击推送，验证跳转到 Profile 页面

- [ ] **Step 2: 验证自动修复**

1. 测试用户连续签到3天后漏签
2. 第5天调用 POST /api/gamification/checkin
3. 验证系统自动补了第4天的签
4. 验证用户 currentStreak 保持连续

---

## 验证清单

- [ ] check-streak API 正确返回 warnings 和 broken 列表
- [ ] send API 支持 streak_warning 类型推送
- [ ] send API 支持 streak_broken 类型推送
- [ ] 签到 POST 自动检测并使用补签卡修复漏签
- [ ] 补签卡余额正确扣减
- [ ] 连续签到天数保持连续（不断开）

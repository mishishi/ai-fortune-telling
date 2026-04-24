# 私人命运档案 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建预测→验证→学习→更准预测的闭环系统

**Architecture:** 
- 预测记录表存储每条预测及其时间窗口
- 用户反馈后更新准确率权重
- AI预测时参考用户历史准确率动态调整措辞

**Tech Stack:** Next.js API Routes, SQLite (better-sqlite3), Web Push, MiniMax AI

---

## File Structure

| File | 作用 |
|------|------|
| `src/lib/db/schema.sql` | 新增 predictions, user_prediction_profiles 表 |
| `src/app/api/predictions/route.ts` | GET/POST predictions |
| `src/app/api/predictions/[id]/feedback/route.ts` | PUT feedback |
| `src/app/api/predictions/check-due/route.ts` | 定时检查到期预测 |
| `src/app/api/ai/analyze-stream/route.ts` | 修改：保存预测记录 |
| `src/app/api/push/send/route.ts` | 复用现有推送 |

---

## Task 1: 数据库 Schema 扩展

**Files:**
- Modify: `src/lib/db/schema.sql`
- Modify: `src/lib/db.ts` (hasColumn 检查)

- [ ] **Step 1: 添加 predictions 表**

```sql
CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  report_id TEXT NOT NULL,
  dimension TEXT NOT NULL CHECK(dimension IN ('career','love','wealth','health','mentor')),
  prediction TEXT NOT NULL,
  timeframe_start TEXT NOT NULL,
  timeframe_end TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','accurate','inaccurate')),
  feedback_note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

- [ ] **Step 2: 添加 user_prediction_profiles 表**

```sql
CREATE TABLE IF NOT EXISTS user_prediction_profiles (
  user_id TEXT PRIMARY KEY,
  career_accuracy REAL DEFAULT 0,
  love_accuracy REAL DEFAULT 0,
  wealth_accuracy REAL DEFAULT 0,
  health_accuracy REAL DEFAULT 0,
  mentor_accuracy REAL DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  last_feedback_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

- [ ] **Step 3: 在 db.ts 的 initSchema 添加表创建**

Run: 验证 db.ts 有 hasColumn 模式可用

---

## Task 2: 预测提取与存储 API

**Files:**
- Create: `src/app/api/predictions/route.ts`

- [ ] **Step 1: 编写 GET /api/predictions**

获取用户预测列表，支持 ?status=pending&dimension=career 过滤

```typescript
export async function GET(request: Request) {
  const userId = getUserIdFromCookie();
  if (!userId) return new Response('Unauthorized', { status: 401 });
  
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const dimension = searchParams.get('dimension');
  
  // 查询逻辑...
  return NextResponse.json(predictions);
}
```

- [ ] **Step 2: 编写 POST /api/predictions (仅内部调用)**

从 AI 分析结果提取预测并存储

```typescript
export async function POST(request: Request) {
  // 从 report 生成时调用，存储预测记录
  // 生成 uuid，基于 timeframe 推算结束日期
}
```

---

## Task 3: 反馈 API

**Files:**
- Create: `src/app/api/predictions/[id]/feedback/route.ts`

- [ ] **Step 1: PUT feedback**

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { status, feedbackNote } = await request.json();
  // 更新 prediction status
  // 更新 user_prediction_profiles 准确率
  // 返回更新后的 profile
}
```

---

## Task 4: 修改 AI 分析保存预测

**Files:**
- Modify: `src/app/api/ai/analyze-stream/route.ts`

- [ ] **Step 1: 在 analyze-stream 完成后调用预测存储**

在 sendEvent('complete') 后，提取分析内容生成 Prediction 记录

```typescript
// 存储预测的辅助函数
async function storePredictions(userId: string, reportId: string, analysis: any) {
  const predictions = extractPredictions(analysis); // {dimension, prediction, timeframeStart, timeframeEnd}
  // 批量插入 predictions 表
}
```

- [ ] **Step 2: 传递 userId 和 reportId**

确保 analyze-stream 能获取当前用户 context

---

## Task 5: 到期检查与推送

**Files:**
- Create: `src/app/api/predictions/check-due/route.ts`
- Modify: `src/app/api/push/send/route.ts`

- [ ] **Step 1: check-due API**

定时任务（Vercel Cron 或手动触发）查询 status=pending 且 timeframe_end <= now 的预测

```typescript
// 返回到期未验证的预测列表
export async function GET() {
  const duePredictions = db.prepare(`
    SELECT p.*, u.push_subscription, u.push_enabled
    FROM predictions p
    JOIN users u ON p.user_id = u.id
    WHERE p.status = 'pending' 
    AND p.timeframe_end <= datetime('now')
  `).all();
  return NextResponse.json(duePredictions);
}
```

- [ ] **Step 2: 触发推送逻辑**

对每条到期预测，调用 push/send 发送验证提醒

---

## Task 6: 前端验证 UI

**Files:**
- Create: `src/components/PredictionVerifier.tsx`
- Modify: `src/app/profile/page.tsx` (或新建 /predictions 页面)

- [ ] **Step 1: PredictionVerifier 组件**

展示待验证预测列表，用户可点击选择"应验"或"未应验"

- [ ] **Step 2: 集成到个人中心**

在 Profile 页面添加"预测验证"入口

---

## 验证方式

1. `npm run dev`
2. 生成一份报告
3. 检查数据库 `predictions` 表有记录
4. 等待预测到期（或手动修改 timeframe_end）
5. 验证推送能正确发送
6. 反馈后检查准确率更新

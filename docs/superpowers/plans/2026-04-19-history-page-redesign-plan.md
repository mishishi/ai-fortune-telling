# 历史报告列表页改版 + 账号体系实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立简单账号体系 + 重构历史报告页面，实现个人档案管理和报告对比功能

**Architecture:** 手机号+验证码登录（模拟） + Cookie存储userId + 历史报告列表大改版 + 报告并列对比视图

**Tech Stack:** Next.js 16 App Router, SQLite(better-sqlite3), React Context, Recharts

---

## 实现任务

### Task 1: 数据库 users 表创建

**Files:**
- Modify: `src/lib/db.ts`

- ```typescript
// 在 getDb() 函数的 db.exec() 中添加：
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  createdAt TEXT NOT NULL,
  lastLoginAt TEXT NOT NULL
);
```

- \[ \] **Step 1: 修改 db.ts 添加 users 表**
- \[ \] **Step 2: 提交**

### Task 2: 登录 API 实现

**Files:**
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/send-code/route.ts`

- \[ \] **Step 1: 创建 send-code API（模拟验证码）**
- \[ \] **Step 2: 创建 login API**
- \[ \] **Step 3: 提交**

### Task 3: 用户状态管理 Context

**Files:**
- Create: `src/contexts/UserContext.tsx`

- \[ \] **Step 1: 创建 UserContext**
- \[ \] **Step 2: 在 layout.tsx 中包裹 UserProvider**
- \[ \] **Step 3: 提交**

### Task 4: 登录页组件

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/components/LoginForm.tsx`

- \[ \] **Step 1: 创建 LoginForm 组件**
- \[ \] **Step 2: 创建登录页 /login**
- \[ \] **Step 3: 提交**

### Task 5: 历史页面重构

**Files:**
- Modify: `src/app/history/page.tsx`
- Create: `src/components/HistoryList.tsx`
- Create: `src/components/ReportCard.tsx`
- Create: `src/components/MiniRadar.tsx`

- \[ \] **Step 1: 创建 MiniRadar（5维小雷达图）**
- \[ \] **Step 2: 创建 ReportCard（报告卡片）**
- \[ \] **Step 3: 重构 HistoryList**
- \[ \] **Step 4: 修改 history/page.tsx**
- \[ \] **Step 5: 提交**

### Task 6: 报告对比视图

**Files:**
- Create: `src/components/CompareView.tsx`

- \[ \] **Step 1: 创建 CompareView**
- \[ \] **Step 2: 在 HistoryList 中添加对比功能**
- \[ \] **Step 3: 提交**

### Task 7: 档案页

**Files:**
- Create: `src/app/profile/page.tsx`

- \[ \] **Step 1: 创建 ProfilePage**
- \[ \] **Step 2: 添加顶部导航入口**
- \[ \] **Step 3: 提交**

### Task 8: API 改造

**Files:**
- Create: `src/app/api/reports/[id]/route.ts` (DELETE)
- Modify: `src/app/api/reports/route.ts`

- \[ \] **Step 1: 添加 DELETE /api/reports/[id]**
- \[ \] **Step 2: 修改 GET /api/reports 支持 userId**
- \[ \] **Step 3: 提交**

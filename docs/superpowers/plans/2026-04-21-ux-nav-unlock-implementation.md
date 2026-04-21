# 移动端导航 & 报告解锁流程实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** 实现两个 P0 UX 优化：移动端底部导航栏 + 报告解锁流程

**Architecture:** 两个独立功能模块，均为新增组件 + 少量布局改动。BottomNav 挂载在 PageTransition 内部，UnlockPanel 替换 FortuneDisplay 内的锁定消息面板。

**Tech Stack:** Next.js App Router, React hooks, CSS custom properties, backdrop-filter

---

## 设计规范参考

- 设计文档：docs/superpowers/specs/2026-04-21-ux-nav-unlock-design.md
- 核心决策：3 tab、金色渐变图标、滑动指示条、毛玻璃背景

---

## 文件结构

- Create: src/components/ui/BottomNav.tsx
- Modify: src/app/layout.tsx
- Create: src/components/UnlockPanel.tsx
- Modify: src/components/FortuneDisplay.tsx

---

## Task 1: 创建 BottomNav 组件

**Files:** Create: src/components/ui/BottomNav.tsx

- Step 1: 创建 BottomNav.tsx，使用 usePathname 获取当前路径
- Step 2: 实现 NAV_ITEMS 数组，3个tab：首页、历史、我的
- Step 3: 实现金色渐变图标（激活态）和灰色线框图标（未激活态）
- Step 4: 实现毛玻璃容器 backdrop-filter: blur(12px)
- Step 5: 实现底部2px金色滑动指示条动画
- Step 6: /report/[id] 继承首页激活态，/login 隐藏
- Step 7: 提交 git add src/components/ui/BottomNav.tsx && git commit -m feat: add mobile bottom navigation

---

## Task 2: 将 BottomNav 添加到 Root Layout

**Files:** Modify: src/app/layout.tsx

- Step 1: 导入 BottomNav 组件
- Step 2: 在 PageTransition 内部、children 下方添加 BottomNav
- Step 3: 提交 git commit

---

## Task 3: 创建 UnlockPanel 组件

**Files:** Create: src/components/UnlockPanel.tsx

- Step 1: 创建 PREVIEW_ITEMS 数组，6项：职业推荐、贵人方位、配偶特征、婚恋建议、幸运元素、起名建议
- Step 2: 实现展开/收起状态，默认展开
- Step 3: 实现金色装饰分隔线
- Step 4: 实现 CTA 按钮：渐变背景、Loading态、成功态
- Step 5: 实现 handleUnlock：调用 POST /api/reports/[id]/unlock，乐观 UI
- Step 6: 提交

---

## Task 4: 替换 FortuneDisplay 中的锁定消息为 UnlockPanel

**Files:** Modify: src/components/FortuneDisplay.tsx (lines 252-268)

- Step 1: 找到 isLocked 时的锁定消息 div，替换为 UnlockPanel 组件
- Step 2: 在 FortuneDisplayProps 中添加 reportId?: string
- Step 3: 提交

---

## Task 5: 将 reportId 传递链打通到 FortuneDisplay

**Files:** Find: 调用 FortuneDisplay 的页面，Modify: src/app/report/[id]/page.tsx

- Step 1: grep -rn FortuneDisplay src/ 找到调用页面
- Step 2: 将 reportId={params.id} 传入 FortuneDisplay
- Step 3: 提交

---

## 全局验证

- npm run dev 启动开发服务器
- 访问 / 确认底部导航显示，首页标签激活
- 点击各 tab 确认指示条滑动动画正常
- 访问 /history、/profile 确认对应标签激活
- 访问 /login 确认底部导航隐藏
- 生成/查看报告确认解锁面板显示
- 点击解锁按钮确认 Loading 态、成功态、页面刷新流程

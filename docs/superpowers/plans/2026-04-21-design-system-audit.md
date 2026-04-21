# Design System Audit & Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan.

**Goal:** 将现有设计 token 系统全面应用到组件，消除硬编码值，升级字体，建立一致的视觉语言

**Architecture:** 基于现有 globals.css 的 design token 系统，审计并修改所有组件使用这些 token

**Tech Stack:** React, Tailwind CSS, CSS Custom Properties

---

## 文件结构

```
src/
├── app/
│   └── globals.css                    # 已有完善 design token 系统
├── components/
│   ├── ui/
│   │   ├── Button.tsx                 # 按钮组件
│   │   ├── CustomDropdown.tsx         # 下拉框组件
│   │   ├── Accordion.tsx              # 可折叠面板
│   │   └── Modal.tsx                  # 模态框
│   ├── BirthForm.tsx                  # 出生信息表单
│   ├── LoginForm.tsx                  # 登录表单
│   ├── FortuneDisplay.tsx             # 命盘展示
│   ├── ReportContent.tsx              # 报告内容
│   ├── HistoryList.tsx                # 历史列表
│   ├── ReportCard.tsx                 # 报告卡片
│   ├── Timeline.tsx                   # 时间轴
│   └── BaziRing.tsx                  # 命盘环
```

---

## Task 1: 字体升级 — 引入 Noto Serif SC

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Spec 要求:**
- 标题使用 Noto Serif SC（思源宋体）体现东方美学
- 正文保持 Noto Sans SC（思源黑体）保证可读性

- [ ] **Step 1: 在 layout.tsx 添加 Google Fonts 链接**

在 `src/app/layout.tsx` 的 `<head>` 中添加：

```tsx
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

- [ ] **Step 2: 更新 globals.css 字体变量**

修改 `:root` 中的字体定义：

```css
/* Font Families */
--font-sans: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif;
--font-serif: "Noto Serif SC", "STSong", "SimSun", serif;
--font-display: "Noto Serif SC", "Times New Roman", serif;
```

- [ ] **Step 3: 验证字体加载**

运行开发服务器，检查网络面板确认字体请求成功。

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: upgrade fonts to Noto Serif SC for oriental aesthetics"
```

---

## Task 2: Button.tsx Design Token 全面应用

**Files:**
- Modify: `src/components/ui/Button.tsx`

**Spec 要求:**
- 所有颜色使用 CSS 变量
- 圆角使用 `--radius-*` token
- 阴影使用 `--shadow-*` token
- Transition 使用 `--transition-*` token

- [ ] **Step 1: 读取当前 Button.tsx 并分析硬编码值**

当前 Button.tsx 已使用 CSS 变量，检查是否有遗漏。

```bash
grep -n "#[0-9a-fA-F]" src/components/ui/Button.tsx
```

- [ ] **Step 2: 确保所有 variant 使用 design token**

当前 primary variant 已有 `var(--color-primary)` 和 `var(--shadow-glow-primary)`。检查其他 variant 是否一致。

- [ ] **Step 3: 添加 hover-lift class**

在 baseStyles 中添加 hover-lift 效果：

```tsx
const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg hover-lift';
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "refactor: apply design tokens consistently to Button component"
```

---

## Task 3: CustomDropdown.tsx Design Token 全面应用

**Files:**
- Modify: `src/components/ui/CustomDropdown.tsx`

**Spec 要求:**
- 圆角使用 `--radius-md`
- 背景使用 `var(--color-surface)`
- 边框使用 Tailwind 原生 opacity 语法
- Dropdown 选项使用 stagger-item 动画

- [ ] **Step 1: 替换圆角**

将 `rounded-lg` 替换为 `rounded-[var(--radius-md)]`：

```tsx
className={`... rounded-[var(--radius-md)] ...`}
```

- [ ] **Step 2: 替换阴影**

在 dropdown 列表上添加 `shadow-[var(--shadow-lg)]`：

```tsx
className={`... shadow-[var(--shadow-lg)] ...`}
```

- [ ] **Step 3: 添加入场动画**

在 options map 的父 div 上添加 `stagger-item` class：

```tsx
<div className="py-1 stagger-item">
  {options.map((option, index) => (...))}
</div>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/CustomDropdown.tsx
git commit -m "refactor: apply design tokens and animations to CustomDropdown"
```

---

## Task 4: BirthForm.tsx Design Token 全面应用

**Files:**
- Modify: `src/components/BirthForm.tsx`

**Spec 要求:**
- Input 使用 `--radius-md` 圆角
- Focus 状态使用 `focus:border-[var(--color-primary)]` + glow
- 间距使用 spacing token

- [ ] **Step 1: 读取 BirthForm.tsx 检查 input 样式**

```bash
grep -n "rounded-\|border-\|px-\|py-\|gap-\|mb-\|mt-\|space" src/components/BirthForm.tsx | head -30
```

- [ ] **Step 2: 替换硬编码间距为 Tailwind 间距或 CSS 变量**

将 `rounded-lg` → `rounded-[var(--radius-md)]`
将 `px-4 py-3` → `px-5 py-4`（使用更舒适的默认 padding）
将 `mb-6` → `mb-[var(--space-xl)]`

- [ ] **Step 3: 添加 glass-card 效果到表单容器**

```tsx
className="glass-card rounded-[var(--radius-xl)] p-[var(--space-xl)]"
```

- [ ] **Step 4: Commit**

```bash
git add src/components/BirthForm.tsx
git commit -m "refactor: apply design tokens to BirthForm inputs and container"
```

---

## Task 5: LoginForm.tsx Design Token 全面应用

**Files:**
- Modify: `src/components/LoginForm.tsx`

**Spec 要求:**
- 与 BirthForm 保持一致的 input 样式
- 使用 glass-card 效果

- [ ] **Step 1: 读取 LoginForm.tsx**

```bash
grep -n "rounded-\|border-\|px-\|py-\|className" src/components/LoginForm.tsx | head -20
```

- [ ] **Step 2: 应用 BirthForm 相同的 input 样式规范**

Input 应使用：
```tsx
className={`w-full rounded-[var(--radius-md)] px-5 py-4 text-white placeholder-gray-500 border transition-all duration-200 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 bg-[var(--color-surface)]`}
```

- [ ] **Step 3: 添加背景装饰**

在表单外层添加 `.ink-wash-corner` 效果：

```tsx
<div className="ink-wash-corner glass-card rounded-[var(--radius-xl)] p-[var(--space-xl)]">
```

- [ ] **Step 4: Commit**

```bash
git add src/components/LoginForm.tsx
git commit -m "refactor: apply design tokens to LoginForm for consistency"
```

---

## Task 6: FortuneDisplay.tsx 信息分层与动画

**Files:**
- Modify: `src/components/FortuneDisplay.tsx`

**Spec 要求:**
- 第一项（overall）默认展开，其他折叠（已确认）
- 添加命盘揭晓入场动画
- 使用 `stagger-item-slow` 制造戏剧感

- [ ] **Step 1: 确认默认展开行为**

```bash
grep -n "expandedSection" src/components/FortuneDisplay.tsx
```

确认 `expandedSection` 初始值为 `'overall'`。

- [ ] **Step 2: 添加入场动画**

在 FortuneDisplay 的根元素上添加：

```tsx
className="animate-fade-in-up"
```

在每个 section 的 header 上添加：

```tsx
className="cursor-pointer p-4 hover:bg-white/5 rounded-[var(--radius-md)] transition-colors stagger-item"
```

- [ ] **Step 3: 添加金色 accent 到标题**

在命盘解读标题上添加 `.title-underline` class：

```tsx
<h3 className="text-h3 title-underline">命盘解读</h3>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/FortuneDisplay.tsx
git commit -m "feat: add reveal animations and title accents to FortuneDisplay"
```

---

## Task 7: ReportContent.tsx 使用 design token

**Files:**
- Modify: `src/components/ReportContent.tsx`

**Spec 要求:**
- 金色使用 `var(--color-accent)` 而非硬编码 `#f0c674`
- 使用 `text-h3`, `text-body` 等 typography token

- [ ] **Step 1: 读取 ReportContent.tsx**

```bash
grep -n "#f0c674\|#[0-9a-fA-F]" src/components/ReportContent.tsx
```

- [ ] **Step 2: 替换硬编码颜色**

将 `color: '#f0c674'` 替换为 `color: 'var(--color-accent)'`。

- [ ] **Step 3: 应用 typography token**

将标题 class 替换：
```tsx
<span className="text-h3 font-semibold" style={{ color: 'var(--color-accent)' }}>
```
将正文 class 替换：
```tsx
<p className="text-body leading-relaxed">
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ReportContent.tsx
git commit -m "refactor: apply design tokens and typography to ReportContent"
```

---

## Task 8: HistoryList.tsx 空状态与卡片样式

**Files:**
- Modify: `src/components/HistoryList.tsx`

**Spec 要求:**
- 空状态使用 oriental 装饰元素
- 卡片使用 `hover-lift` 和 `stagger-item` 动画
- 圆角使用 `--radius-lg`

- [ ] **Step 1: 读取 HistoryList.tsx**

```bash
grep -n "rounded-\|shadow-\|border-\|stagger" src/components/HistoryList.tsx
```

- [ ] **Step 2: 在空状态添加 oriental 装饰**

找到空状态 div，添加金色装饰元素：

```tsx
<div className="text-center py-16">
  <div className="gold-divider mx-auto mb-6 w-24"></div>
  <svg className="w-16 h-16 mx-auto mb-4 text-[var(--color-accent)] opacity-40">
    {/* existing svg */}
  </svg>
  <p className="text-h4 text-[var(--color-text-secondary)]">暂无命盘记录</p>
  <p className="text-body text-[var(--color-text-muted)] mt-2">开始解读你的命运</p>
  <div className="gold-divider mx-auto mt-6 w-24"></div>
</div>
```

- [ ] **Step 3: 为历史卡片添加动画**

在卡片外层 div 添加 `stagger-item` 和 `hover-lift`：

```tsx
<div className="stagger-item hover-lift bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-5 border border-white/10">
```

- [ ] **Step 4: Commit**

```bash
git add src/components/HistoryList.tsx
git commit -m "refactor: add oriental decorations and animations to HistoryList"
```

---

## Task 9: ReportCard.tsx 卡片系统统一

**Files:**
- Modify: `src/components/ReportCard.tsx`

**Spec 要求:**
- 使用 glass-card 效果
- 使用 `--radius-lg` 圆角
- 使用 `--shadow-md` 阴影
- 添加 `hover-lift` 交互

- [ ] **Step 1: 读取 ReportCard.tsx**

```bash
grep -n "rounded-\|shadow-\|bg-\|border-\|className" src/components/ReportCard.tsx | head -25
```

- [ ] **Step 2: 应用 glass-card 和 design token**

将根 div 的 className 改为：

```tsx
className="glass-card rounded-[var(--radius-lg)] p-6 hover-lift transition-all duration-300"
```

- [ ] **Step 3: 在标题添加 title-underline**

```tsx
<h3 className="text-h4 title-underline inline-block">命盘解读</h3>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ReportCard.tsx
git commit -m "refactor: apply glass-card and design tokens to ReportCard"
```

---

## Task 10: Timeline.tsx 装饰与动画

**Files:**
- Modify: `src/components/Timeline.tsx`

**Spec 要求:**
- 时间线节点使用金色 accent
- 使用 `--color-accent` 而非硬编码
- 添加入场动画

- [ ] **Step 1: 读取 Timeline.tsx**

```bash
grep -n "#d4af37\|#[0-9a-fA-F]\|rounded-\|border-" src/components/Timeline.tsx
```

- [ ] **Step 2: 替换硬编码金色**

将所有 `#d4af37` 替换为 `var(--color-accent)`。

- [ ] **Step 3: 为时间线节点添动画**

在 timeline 容器上添加 `stagger-item` 到每个项目。

- [ ] **Step 4: Commit**

```bash
git add src/components/Timeline.tsx
git commit -m "refactor: apply design tokens and animations to Timeline"
```

---

## Task 11: BaziRing.tsx 命盘环视觉升级

**Files:**
- Modify: `src/components/BaziRing.tsx`

**Spec 要求:**
- 命盘环使用 `--color-accent` 金色
- 外环光晕使用 `glow-pulse` 动画
- 中心文字使用 `text-h2` typography token

- [ ] **Step 1: 读取 BaziRing.tsx**

```bash
grep -n "#d4af37\|#[0-9a-fA-F]\|glow\|rounded-\|text-" src/components/BaziRing.tsx | head -30
```

- [ ] **Step 2: 应用 design token 到环**

将金色替换为 `var(--color-accent)`：
```tsx
stroke="var(--color-accent)"
```

- [ ] **Step 3: 为外环添加 glow 动画**

在外环 SVG 上添加 class：
```tsx
className="glow-pulse"
```

- [ ] **Step 4: 中心文字使用 typography token**

```tsx
<span className="text-h2 font-bold">命</span>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/BaziRing.tsx
git commit -m "refactor: apply design tokens and animations to BaziRing"
```

---

## Task 12: 全局扫描 — 消除遗留硬编码

**Files:**
- Scan: `src/**/*.tsx`
- Modify: 所有发现的文件

**Spec 要求:**
- 所有颜色使用 CSS 变量
- 所有圆角使用 `--radius-*` token
- 无 `#` hex 硬编码（除了 Tailwind 原生支持的简化形式如 `text-red-500`）

- [ ] **Step 1: 扫描 hex 颜色**

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" src --include="*.tsx" | grep -v "var(" | grep -v "comment" | grep -v "shadow"
```

- [ ] **Step 2: 逐个文件修复**

对每个发现的硬编码，判断是否应替换为 CSS 变量。

常见情况：
- `#c41e3a` → `var(--color-primary)`
- `#d4af37` → `var(--color-accent)`
- `#f0c674` → `var(--color-gold)`
- `#7b68ee` → `var(--color-purple)`

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "fix: final hardcoded color audit - replace all hex values with CSS variables"
```

---

## 验收标准检查清单

- [ ] Noto Serif SC 字体已加载并应用于标题
- [ ] Button.tsx 所有 variant 使用 CSS 变量和 design token
- [ ] CustomDropdown.tsx 使用 `--radius-md`、`--shadow-lg` 和 stagger 动画
- [ ] BirthForm.tsx input 使用一致的圆角、padding、focus 状态
- [ ] LoginForm.tsx 与 BirthForm 样式一致
- [ ] FortuneDisplay.tsx 第一项默认展开，添加入场动画
- [ ] ReportContent.tsx 使用 `var(--color-accent)` 替代硬编码金色
- [ ] HistoryList.tsx 空状态有 oriental 装饰
- [ ] ReportCard.tsx 使用 glass-card 效果
- [ ] Timeline.tsx 时间线节点使用金色 token
- [ ] BaziRing.tsx 外环使用 glow-pulse 动画
- [ ] 无遗留硬编码 hex 颜色

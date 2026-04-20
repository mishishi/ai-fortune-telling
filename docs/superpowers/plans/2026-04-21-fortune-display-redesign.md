# 命理报告展示界面重设计实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 AI 算命应用的命理报告展示升级为东方命理奢华美学（朱砂配色 + 完整仪式感装饰 + 对比+呼吸布局 + 神秘光效动效）

**Architecture:** 通过 CSS 变量替换实现全局配色切换，组件层面修改 BaziRing 和 FortuneDisplay 的样式，添加装饰性 SVG 和动画效果。

**Tech Stack:** Next.js + Tailwind CSS + React CSS-in-JS

---

## 文件结构

- Modify: `src/app/globals.css` — CSS 变量替换 + 新增装饰工具类
- Modify: `src/components/BaziRing.tsx` — 改色 + 光晕效果
- Modify: `src/components/FortuneDisplay.tsx` — 玻璃态卡片 + 金色边框

---

## Task 1: 更新全局 CSS 变量（朱砂配色）

**Files:**
- Modify: `src/app/globals.css:1-109`

- [ ] **Step 1: 替换主色调变量**

替换 `:root` 中的颜色变量：

```css
:root {
  /* Brand Colors — 朱砂方案 */
  --color-primary: #c41e3a;           /* 朱红 - 主强调色 */
  --color-primary-hover: #a01830;
  --color-secondary: #1e3a5f;        /* 藏青 - 深蓝 */
  --color-accent: #d4af37;            /* 金色 - 标题/装饰 */
  --color-accent-hover: #c9a430;
  --color-focus: #d4af37;

  /* Background Colors — 墨蓝层次 */
  --color-bg: #0f0f1a;               /* 主背景 - 深墨蓝 */
  --color-surface: #1a1525;          /* 卡片背景 - 浅墨蓝 */
  --color-surface-elevated: #221c30;
  --color-surface-hover: #1f1830;
  --color-overlay: rgba(15, 15, 26, 0.9);

  /* Text Colors */
  --color-text: #ffffff;
  --color-text-secondary: #b0b0b0;
  --color-text-muted: #9ca3af;

  /* Chart Dimension Colors */
  --color-dimension-career: #c41e3a;   /* 事业 - 朱红 */
  --color-dimension-love: #6b5b95;     /* 感情 - 藏青紫 */
  --color-dimension-wealth: #d4af37;   /* 财运 - 金色 */
  --color-dimension-health: #2d6a4f;    /* 健康 - 墨绿 */
  --color-dimension-mentor: #1e3a5f;    /* 贵人 - 深蓝 */

  /* Shadows — 朱砂光晕 */
  --shadow-glow-primary: 0 4px 20px rgba(196, 30, 58, 0.4);
  --shadow-glow-accent: 0 4px 20px rgba(212, 175, 55, 0.3);
}
```

- [ ] **Step 2: 替换滚动条颜色**

```css
::-webkit-scrollbar-thumb {
  background: rgba(196, 30, 58, 0.4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(196, 30, 58, 0.6);
}
```

- [ ] **Step 3: 替换选中颜色**

```css
::selection {
  background: rgba(196, 30, 58, 0.4);
  color: #ffffff;
}
```

- [ ] **Step 4: 替换 focus-visible**

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.4);
}
```

- [ ] **Step 5: 替换渐变色文字**

```css
.text-gradient {
  background: linear-gradient(135deg, #d4af37 0%, #ffffff 50%, #c41e3a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

- [ ] **Step 6: 替换 shimmer-gold**

```css
.shimmer-gold {
  background: linear-gradient(90deg, #d4af37, #ffffff, #d4af37);
  background-size: 200% 100%;
  animation: shimmer 3s ease-in-out infinite;
}
```

- [ ] **Step 7: 替换 border-glow**

```css
.border-glow::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.6), rgba(196, 30, 58, 0.6));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

- [ ] **Step 8: 替换 glass-card**

```css
.glass-card {
  background: rgba(26, 21, 37, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.15);
}
```

- [ ] **Step 9: 替换 skeleton-shimmer**

```css
.skeleton-shimmer {
  background: linear-gradient(90deg,
    rgba(196,30,58,0.08) 0%,
    rgba(196,30,58,0.16) 50%,
    rgba(196,30,58,0.08) 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
```

- [ ] **Step 10: 替换 hover-glow**

```css
.hover-glow {
  transition: box-shadow 200ms ease;
}
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(196, 30, 58, 0.5);
}
```

- [ ] **Step 11: 替换 glow-pulse 动画**

```css
@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(196, 30, 58, 0.4);
  }
  50% {
    box-shadow: 0 0 24px rgba(196, 30, 58, 0.8);
  }
}
```

- [ ] **Step 12: 提交**

```bash
git add src/app/globals.css
git commit -m "feat: update color palette to cinnabar scheme"
```

---

## Task 2: 添加东方美学装饰工具类

**Files:**
- Modify: `src/app/globals.css:645-700` (文件末尾添加)

- [ ] **Step 1: 添加书法笔画装饰 SVG**

```css
/* 书法笔画装饰 — 标题下方的金色渐变线条 */
.calligraphy-stroke {
  position: relative;
  display: inline-block;
}

.calligraphy-stroke::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    #d4af37 20%,
    #f5e6c4 50%,
    #d4af37 80%,
    transparent 100%);
  opacity: 0.8;
}

/* 垂直书法线条 */
.calligraphy-line {
  width: 1px;
  height: 30px;
  background: linear-gradient(180deg, transparent, #c41e3a, transparent);
  opacity: 0.6;
}
```

- [ ] **Step 2: 添加金色分割线工具类**

```css
/* 金色渐变分割线 */
.gold-divider {
  width: 40%;
  height: 1px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

/* 带朱红点缀的分割线 */
.gold-divider-accent {
  width: 60%;
  height: 1px;
  margin: 0 auto;
  background: linear-gradient(90deg, transparent, #d4af37 30%, #c41e3a 50%, #d4af37 70%, transparent);
}
```

- [ ] **Step 3: 添加水墨晕染工具类**

```css
/* 水墨晕染角落效果 */
.ink-wash-corner {
  position: relative;
}

.ink-wash-corner::before {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  background: radial-gradient(ellipse at center, rgba(196, 30, 58, 0.12) 0%, transparent 70%);
  opacity: 0.5;
  pointer-events: none;
}

/* 底部水墨效果 */
.ink-wash-corner::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 80px;
  height: 60px;
  background: radial-gradient(ellipse at bottom left, rgba(100, 100, 100, 0.08) 0%, transparent 70%);
  pointer-events: none;
}
```

- [ ] **Step 4: 添加星辰闪烁动画**

```css
/* 星辰闪烁 — 用于装饰符号 */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.twinkle {
  animation: twinkle 2s ease-in-out infinite;
}

.twinkle-delay-1 { animation-delay: 0.3s; }
.twinkle-delay-2 { animation-delay: 0.6s; }
.twinkle-delay-3 { animation-delay: 0.9s; }
.twinkle-delay-4 { animation-delay: 1.2s; }
```

- [ ] **Step 5: 添加光晕脉动动画**

```css
/* 光晕脉动 — 用于外环和选中态 */
@keyframes glowBreath {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.glow-breath {
  animation: glowBreath 3s ease-in-out infinite;
}
```

- [ ] **Step 6: 添加卷轴展开动画**

```css
/* 卷轴展开 — 用于模块进入动画 */
@keyframes scrollUnfold {
  0% {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
  }
  100% {
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}

.scroll-unfold {
  animation: scrollUnfold 600ms ease-out forwards;
}
```

- [ ] **Step 7: 提交**

```bash
git add src/app/globals.css
git commit -m "feat: add oriental decorative utilities and mystical animations"
```

---

## Task 3: 更新 BaziRing 组件（改色 + 光晕）

**Files:**
- Modify: `src/components/BaziRing.tsx:109-122`

- [ ] **Step 1: 更新外环光晕颜色**

修改 `glow-ring` 样式中的 `background`：

```jsx
// 当前：
background: 'radial-gradient(circle, rgba(123,104,238,0.15) 0%, transparent 70%)'

// 改为：
background: 'radial-gradient(circle, rgba(196,30,58,0.15) 0%, transparent 70%)'
```

- [ ] **Step 2: 更新 SVG filter drop-shadow**

修改 `filter: 'drop-shadow(...)'` 中的颜色：

```jsx
// 当前：
style={{ filter: 'drop-shadow(0 0 20px rgba(123,104,238,0.3))' }}

// 改为：
style={{ filter: 'drop-shadow(0 0 20px rgba(196,30,58,0.3))' }}
```

- [ ] **Step 3: 更新中心文字颜色**

修改中心 `text` 元素的 `fill`：

```jsx
// 当前：
fill="#f0c674"

// 改为：
fill="#d4af37"
```

- [ ] **Step 4: 更新文字阴影颜色**

修改 `textShadow` 和 `drop-shadow` 颜色：

```jsx
// 当前：
style={{
  textShadow: '0 0 30px rgba(240,198,116,0.8)',
  filter: 'drop-shadow(0 0 10px rgba(240,198,116,0.5))',
}}

// 改为：
style={{
  textShadow: '0 0 30px rgba(212,175,55,0.8)',
  filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.5))',
}}
```

- [ ] **Step 5: 提交**

```bash
git add src/components/BaziRing.tsx
git commit -m "feat: update BaziRing colors to cinnabar scheme"
```

---

## Task 4: 更新 FortuneDisplay 组件（玻璃态 + 金色边框）

**Files:**
- Modify: `src/components/FortuneDisplay.tsx:170-181`

- [ ] **Step 1: 更新卡片背景和边框颜色**

修改展开卡片的样式：

```jsx
// 当前：
style={{
  background: 'rgba(26, 31, 58, 0.4)',
  backdropFilter: 'blur(12px)',
  border: `1px solid ${isExpanded ? section.color + '40' : 'rgba(255,255,255,0.06)'}`,
  boxShadow: isExpanded ? `0 0 20px ${section.color}15` : 'none',
}}

// 改为：
style={{
  background: 'rgba(26, 21, 37, 0.5)',
  backdropFilter: 'blur(12px)',
  border: `1px solid ${isExpanded ? section.color + '50' : 'rgba(212,175,55,0.12)'}`,
  boxShadow: isExpanded ? `0 0 20px ${section.color}20` : 'none',
}}
```

- [ ] **Step 2: 更新预览模式提示框背景**

查找 `isLocked` 提示框（大约在 253-268 行）：

```jsx
// 当前：
style={{
  background: 'linear-gradient(135deg, rgba(240,198,116,0.08) 0%, rgba(123,104,238,0.08) 100%)',
  border: '1px solid rgba(240,198,116,0.2)',
}}

// 改为：
style={{
  background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(196,30,58,0.08) 100%)',
  border: '1px solid rgba(212,175,55,0.2)',
}}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/FortuneDisplay.tsx
git commit -m "feat: update FortuneDisplay glass card styling to oriental luxury"
```

---

## Task 5: 验证并测试

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 验证页面加载**

访问算命结果页面，检查：
- 背景色是否变为墨蓝色 (#0f0f1a)
- 八字环是否显示朱红/金色光晕
- 卡片是否显示金色边框

- [ ] **Step 3: 验证动效**

检查：
- 星辰闪烁动画是否正常工作
- 光晕脉动是否可见

---

## 实施检查清单

- [ ] 朱砂配色已应用（#c41e3a 朱红，#d4af37 金色）
- [ ] 金色分割线和书法笔画装饰可见
- [ ] 水墨晕染角落效果可见
- [ ] BaziRing 外环光晕为朱红色
- [ ] FortuneDisplay 卡片边框为金色调
- [ ] 星辰闪烁和光晕脉动动效正常

---

**Plan complete.** 实现计划已保存到 `docs/superpowers/plans/2026-04-21-fortune-display-redesign.md`

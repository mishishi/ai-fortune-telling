# 全链路UX改造实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 将整个应用的UI统一到朱砂配色体系（#c41e3a + #d4af37 + #0f0f1a），消除视觉断层

**Architecture:** 通过CSS变量替换实现全局配色切换，修改各页面组件样式以适配新配色

**Tech Stack:** Next.js + Tailwind CSS + React CSS-in-JS

---

## 文件结构

- Modify: `src/app/globals.css` — 确认CSS变量正确
- Modify: `src/components/LoginForm.tsx` — 登录页配色
- Modify: `src/components/BirthForm.tsx` — 表单配色微调
- Modify: `src/components/HistoryList.tsx` — 历史页配色
- Modify: `src/app/page.tsx` — 首页英雄区+导航+加载动画

---

## Task 1: 登录页配色改造

**Files:**
- Modify: `src/components/LoginForm.tsx:91-161`

- [ ] **Step 1: 更新背景色**

```jsx
// 当前：bg-[#0a0e27]
// 改为：bg-[#0f0f1a]
```

- [ ] **Step 2: 更新标题光晕**

```jsx
// 当前：textShadow: '0 0 30px rgba(123,104,238,0.4)'
// 改为：textShadow: '0 0 30px rgba(196,30,58,0.4)'
```

- [ ] **Step 3: 更新输入框focus边框色**

```jsx
// 当前：focus:outline-none focus:border-[#7b68ee]
// 改为：focus:outline-none focus:border-[#c41e3a]
```

- [ ] **Step 4: 更新提交按钮样式**

```jsx
// 当前：
background: 'linear-gradient(135deg, #f0c674, #e0a500)',
color: '#0a0e27',
boxShadow: '0 4px 20px rgba(240,198,116,0.3)'

// 改为：
background: 'linear-gradient(135deg, #c41e3a, #a01830)',
color: '#ffffff',
boxShadow: '0 4px 20px rgba(196,30,58,0.3)'
```

- [ ] **Step 5: 更新获取验证码按钮**

```jsx
// 当前：bg-white/10
// 改为：bg-[#c41e3a]/20
```

- [ ] **Step 6: 提交**

```bash
git add src/components/LoginForm.tsx
git commit -m "feat: update login page to cinnabar color scheme"
```

---

## Task 2: 首页英雄区+导航+加载动画

**Files:**
- Modify: `src/app/page.tsx:210-350`

- [ ] **Step 1: 更新Logo背景渐变**

```jsx
// 当前：bg-gradient-to-br from-[#7b68ee] to-[#4169e1]
// 改为：bg-gradient-to-br from-[#c41e3a] to-[#1e3a5f]
```

- [ ] **Step 2: 更新标题光晕**

```jsx
// 当前：textShadow: '0 0 40px rgba(123,104,238,0.6)'
// 改为：textShadow: '0 0 40px rgba(196,30,58,0.6)'
```

- [ ] **Step 3: 更新加载动画外环颜色**

```jsx
// 当前：borderColor: 'rgba(123, 104, 238, 0.4)'
// 改为：borderColor: 'rgba(196, 30, 58, 0.4)'
```

- [ ] **Step 4: 更新加载动画中环颜色**

```jsx
// 当前：borderColor: 'rgba(65, 105, 225, 0.5)'
// 改为：borderColor: 'rgba(212, 175, 55, 0.5)'
```

- [ ] **Step 5: 更新进度条颜色**

```jsx
// 当前：background: 'linear-gradient(90deg, #7b68ee, #f0c674)'
// 改为：background: 'linear-gradient(90deg, #c41e3a, #d4af37)'
```

- [ ] **Step 6: 提交**

```bash
git add src/app/page.tsx
git commit -m "feat: update homepage hero and loading animation to cinnabar scheme"
```

---

## Task 3: 历史记录页配色

**Files:**
- Modify: `src/components/HistoryList.tsx:184-260`

- [ ] **Step 1: 更新标签选中态背景**

```jsx
// 当前：bg-[#7b68ee]
// 改为：bg-[#c41e3a]
```

- [ ] **Step 2: 更新对比按钮渐变**

```jsx
// 当前：from-[#7b68ee] to-[#ff69b4]
// 改为：from-[#c41e3a] to-[#d4af37]
```

- [ ] **Step 3: 提交**

```bash
git add src/components/HistoryList.tsx
git commit -m "feat: update history page to cinnabar color scheme"
```

---

## Task 4: 表单组件微调

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: 检查表单样式是否已使用CSS变量**

检查 `BirthForm.tsx` 中所有硬编码颜色，替换为CSS变量：
- 背景色使用 `var(--color-surface)`
- 边框色使用 `var(--color-border)`
- 主色使用 `var(--color-primary)`

- [ ] **Step 2: 提交**

```bash
git add src/components/BirthForm.tsx
git commit -m "feat: update birth form to use CSS variables"
```

---

## Task 5: 全局验证

- [ ] **Step 1: 验证所有页面配色一致性**

确认以下页面/组件已统一使用朱砂配色：
- 登录页：背景 #0f0f1a，主色 #c41e3a，金色 #d4af37
- 首页：Logo、标题光晕、加载动画
- 历史页：标签选中态、对比按钮
- 报告页：BaziRing + FortuneDisplay（已在上轮完成）

- [ ] **Step 2: 提交验证**

```bash
git add .
git commit -m "test: verify full UX color scheme consistency"
```

---

## 实施检查清单

- [ ] LoginForm.tsx — 登录页使用朱砂配色
- [ ] page.tsx — 首页英雄区+加载动画使用朱砂配色
- [ ] HistoryList.tsx — 历史页标签和按钮使用朱砂配色
- [ ] BirthForm.tsx — 表单组件使用CSS变量
- [ ] 所有页面背景统一为 #0f0f1a

---

**Plan complete.**

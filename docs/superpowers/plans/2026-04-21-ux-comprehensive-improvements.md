# UX 综合改进实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan.

**Goal:** 全面改进项目 UX，修复配色、交互动效、信息分层、空状态、无障碍问题

**Architecture:** 基于现有组件系统，修改相关组件和全局样式

**Tech Stack:** React, Tailwind CSS, CSS Custom Properties

---

## 文件结构

```
src/
├── app/globals.css                    # 全局样式和 CSS 变量
└── components/
    ├── ui/
    │   ├── Button.tsx                 # 按钮组件
    │   └── CustomDropdown.tsx         # 下拉框组件
    ├── ReportContent.tsx              # 报告内容
    ├── HistoryList.tsx                # 历史列表
    └── FortuneDisplay.tsx             # 命盘解读展示
```

---

## Task 1: 配色统一 - Button.tsx

**Files:**
- Modify: `src/components/ui/Button.tsx`

**Spec 要求:**
- Button variant primary 使用 `var(--color-primary)` 而非硬编码 `#7b68ee`
- 添加完整的 hover/active/focus 状态

- [ ] **Step 1: 修改 Button.tsx primary variant 颜色**

将 `Button.tsx` 中所有硬编码颜色替换为 CSS 变量：

```tsx
const variants = {
  primary: `
    bg-[var(--color-primary)] text-white
    hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-glow-primary)]
    active:scale-[0.97] active:bg-[var(--color-primary-hover)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  secondary: `
    bg-white/10 text-white
    hover:bg-white/15 hover:shadow-lg
    active:scale-[0.97] active:bg-white/20
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-[var(--color-text-secondary)]
    hover:bg-white/5 hover:text-white
    active:scale-[0.97] active:bg-white/10
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-[var(--color-error)]/20 text-[var(--color-error)]
    hover:bg-[var(--color-error)]/30 hover:shadow-lg
    active:scale-[0.97] active:bg-[var(--color-error)]/40
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};
```

- [ ] **Step 2: 添加 focus ring 样式**

在 button 元素上添加 focus-visible 样式：

```tsx
className={`
  ${baseStyles} ${variants[variant]} ${sizes[size]} ${className}
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]
`}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "fix: unify Button colors with CSS variables and add complete interaction states"
```

---

## Task 2: 配色统一 - CustomDropdown.tsx

**Files:**
- Modify: `src/components/ui/CustomDropdown.tsx`

**Spec 要求:**
- CustomDropdown 使用 `var(--color-primary)` 而非硬编码 `#7b68ee`
- 增强 focus 状态显示

- [ ] **Step 1: 修改 CustomDropdown.tsx 颜色变量**

替换文件中所有 `#7b68ee` 为 `var(--color-primary)`：

- Line 114: `focus:border-[#7b68ee]` → `focus:border-[var(--color-primary)]`
- Line 181: `rgba(123, 104, 238, 0.25)` → `rgba(var(--color-primary-rgb), 0.25)`
- Line 182: `rgba(123, 104, 238, 0.15)` → `rgba(var(--color-primary-rgb), 0.15)`

注意：需要先在 globals.css 中添加 `--color-primary-rgb` 变量。

- [ ] **Step 2: 添加 CSS RGB 变量到 globals.css**

在 `:root` 中添加：

```css
--color-primary-rgb: 196, 30, 58;
```

- [ ] **Step 3: 增强 focus ring 样式**

在 trigger button 上添加 focus ring：

```tsx
className={`
  w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors
  ${error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)']}
  hover:border-[var(--color-border-hover)]
  focus:outline-none focus:border-[var(--color-primary)]
  focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]
  ${open ? 'border-[var(--color-primary)]' : ''}
`}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/CustomDropdown.tsx src/app/globals.css
git commit -m "fix: unify CustomDropdown colors and enhance focus states"
```

---

## Task 3: 配色统一 - ReportContent.tsx

**Files:**
- Modify: `src/components/ReportContent.tsx`

**Spec 要求:**
- 硬编码金色 `#f0c674` 替换为 CSS 变量

- [ ] **Step 1: 修改 ReportContent.tsx 硬编码颜色**

将 Line 73 的 `style={{ color: '#f0c674' }}` 改为：

```tsx
style={{ color: 'var(--color-accent)' }}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ReportContent.tsx
git commit -m "fix: replace hardcoded gold color with CSS variable in ReportContent"
```

---

## Task 4: 全局对比度修复

**Files:**
- Modify: `src/app/globals.css`

**Spec 要求:**
- `--color-text-secondary`: #b0b0b0 → #e0e0e0
- `--color-text-muted`: #9ca3af → #a0a0a0

- [ ] **Step 1: 修改 globals.css 文字颜色变量**

找到并修改：

```css
/* Text Colors — WCAG AA Compliant */
--color-text: #ffffff;
--color-text-secondary: #e0e0e0;  /* 改: 原 #b0b0b0 */
--color-text-muted: #a0a0a0;       /* 改: 原 #9ca3af */
```

- [ ] **Step 2: 添加 focus ring 全局样式**

确保 globals.css 中存在：

```css
/* Focus visible styles */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary), 0 0 0 6px rgba(196, 30, 58, 0.2);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "fix: improve text contrast ratios and focus ring styles"
```

---

## Task 5: 信息分层 - FortuneDisplay 默认展开

**Files:**
- Modify: `src/components/FortuneDisplay.tsx`

**Spec 要求:**
- 命盘解读第一项（overall）默认展开，其他折叠

- [ ] **Step 1: 修改 FortuneDisplay 默认展开项**

将 Line 138 的：

```tsx
const [expandedSection, setExpandedSection] = useState<string | null>('overall');
```

保持 `expandedSection` 初始值为 `'overall'`。

- [ ] **Step 2: 确保雷达图默认折叠**

检查 `ReportContent.tsx` 中 Accordion 的 `defaultOpen={false}` 是否已设置（应已设置）。

- [ ] **Step 3: Commit**

```bash
git add src/components/FortuneDisplay.tsx
git commit -m "feat: set first section as default expanded in FortuneDisplay"
```

---

## Task 6: 空状态 - CustomDropdown 无选项状态

**Files:**
- Modify: `src/components/ui/CustomDropdown.tsx`

**Spec 要求:**
- 下拉框无选项时显示"暂无可选项目"

- [ ] **Step 1: 在 options map 后添加空状态处理**

在 Line 164 的 `<div className="py-1">` 之前添加：

```tsx
{options.length === 0 && (
  <div className="px-4 py-8 text-center">
    <svg
      className="w-8 h-8 mx-auto mb-2 opacity-40"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
      暂无可选项目
    </p>
  </div>
)}
{options.length > 0 && (
  <div className="py-1">
    {/* existing options map */}
```

- [ ] **Step 2: 在 map 结束后添加闭合标签**

在 options map 的 `))` 之后添加 `}` 闭合上面的条件语句。

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CustomDropdown.tsx
git commit -m "feat: add empty state to CustomDropdown when no options available"
```

---

## Task 7: 组件状态审查 - BirthForm inputs

**Files:**
- Modify: `src/components/BirthForm.tsx`
- Modify: `src/components/LoginForm.tsx`
- Modify: `src/components/ui/Button.tsx` (如需)

**Spec 要求:**
- 所有 input 有清晰的 focus 状态
- focus 时边框变为 primary 色 + 外发光

- [ ] **Step 1: 检查 BirthForm.tsx input 样式**

确认 BirthForm 中 inputs 已使用正确的 focus 样式（在 globals.css 中全局定义）。

- [ ] **Step 2: 检查 LoginForm.tsx input 样式**

确认 LoginForm 中 inputs 已使用正确的 focus 样式。

- [ ] **Step 3: 如需要，添加 input focus 样式**

在 input 元素上添加 class：

```tsx
className={`
  w-full rounded-lg px-4 py-4 text-white placeholder-gray-500
  border transition-all duration-200
  focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20
  ${error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]'}
`}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/BirthForm.tsx src/components/LoginForm.tsx
git commit -m "fix: enhance input focus states for better visual feedback"
```

---

## Task 8: 无障碍增强 - aria-label 检查

**Files:**
- Modify: `src/components/ShareReport.tsx`
- Modify: `src/components/ui/Button.tsx`
- Modify: 其他有图标按钮的组件

**Spec 要求:**
- 所有图标按钮有 aria-label
- 模态框有 aria-modal="true"

- [ ] **Step 1: ShareReport 按钮 aria-label 检查**

ShareReport.tsx Line 46: `aria-label="分享报告"` - 已存在，确认即可。

- [ ] **Step 2: 检查其他图标按钮**

搜索缺少 aria-label 的按钮：

```bash
grep -rn "svg.*viewBox" src/components --include="*.tsx" | grep -v aria-label
```

- [ ] **Step 3: 为缺失的按钮添加 aria-label**

为每个图标按钮添加适当的 aria-label。

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "fix: add aria-labels to icon buttons for accessibility"
```

---

## Task 9: 最终审查 - 全局硬编码颜色扫描

**Files:**
- 扫描所有 .tsx 和 .css 文件

**Spec 要求:**
- 所有颜色使用 CSS 变量，无硬编码

- [ ] **Step 1: 扫描 hex 颜色**

```bash
grep -rn "#[0-9a-fA-F]\{3,6\}" src --include="*.tsx" --include="*.css" | grep -v "var(" | grep -v "comment"
```

- [ ] **Step 2: 识别并修复遗留的硬编码颜色**

对于每个发现的硬编码颜色，判断是否应该替换为 CSS 变量。

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "fix: final hardcoded color audit and fixes"
```

---

## 验收标准检查清单

- [ ] Button.tsx 使用 CSS 变量，hover/active/focus 状态完整
- [ ] CustomDropdown.tsx 使用 CSS 变量，focus 状态清晰
- [ ] ReportContent.tsx 使用 CSS 变量
- [ ] globals.css 文字对比度达标，focus ring 统一
- [ ] FortuneDisplay 第一项默认展开
- [ ] CustomDropdown 空状态显示"暂无可选项目"
- [ ] 所有 input 有清晰的 focus 状态
- [ ] 所有图标按钮有 aria-label
- [ ] 无遗留硬编码颜色

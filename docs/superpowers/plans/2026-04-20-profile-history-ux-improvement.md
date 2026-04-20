# Profile / History UX 改善计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 提升 Profile 和 History 页面的视觉一致性和交互清晰度

**Architecture:** 复用现有 UI 组件库（Button, Card, Badge），在 Profile 页面引入 CustomDropdown 替代原生 select，在 History 页面优化空状态和对比功能。

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, 现有 UI 组件

---

## Task 1: Profile 页面 — 添加头像区域

**Files:**
- Modify: `src/app/profile/page.tsx`

- [ ] **Step 1: 读取当前 Profile 页面代码**

Run: Read `src/app/profile/page.tsx`
Expected: 找到用户信息区域，当前缺少头像展示

- [ ] **Step 2: 在用户信息区域添加头像**

在名字左侧添加圆形头像，使用渐变背景 + 首字母：
```tsx
{/* 头像 */}
<div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f0c674] to-[#e0a500] flex items-center justify-center flex-shrink-0">
  <span className="text-2xl font-bold text-[#0a0e27]">
    {user.phone.slice(-4, -3)}
  </span>
</div>
```

- [ ] **Step 3: 调整布局使头像与文字水平排列**

```tsx
<div className="flex items-center gap-4">
  {/* 头像块 */}
  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f0c674] to-[#e0a500] flex items-center justify-center flex-shrink-0">
    <span className="text-2xl font-bold text-[#0a0e27]">
      {user.phone.slice(-4, -3)}
    </span>
  </div>
  {/* 文字信息 */}
  <div>
    <h1 className="text-xl font-bold text-white">{user.name}</h1>
    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
      {user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
    </p>
  </div>
</div>
```

- [ ] **Step 4: 提交**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(profile): add avatar with gradient background"
```

---

## Task 2: Profile 页面 — 表单控件一致性（CustomDropdown）

**Files:**
- Modify: `src/app/profile/page.tsx`
- Review: `src/components/ui/CustomDropdown.tsx`

- [ ] **Step 1: 读取 CustomDropdown 组件**

Run: Read `src/components/ui/CustomDropdown.tsx`
Expected: 确认 CustomDropdown 的 props 接口（value, onChange, options）

- [ ] **Step 2: 将原生 select 替换为 CustomDropdown**

找到性别选择的原生 select，替换为：
```tsx
<CustomDropdown
  label="性别"
  value={formData.gender}
  onChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
  options={[
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
  ]}
/>
```

- [ ] **Step 3: 提交**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(profile): replace native select with CustomDropdown"
```

---

## Task 3: Profile 页面 — Toggle 开关添加 ON/OFF 标签

**Files:**
- Modify: `src/app/profile/page.tsx`

- [ ] **Step 1: 找到所有 Toggle 开关组件**

Run: Grep `src/app/profile/page.tsx` for "Toggle"
Expected: 找到 2-3 个 toggle 开关

- [ ] **Step 2: 在每个 Toggle 后添加状态标签**

将：
```tsx
<Toggle
  checked={formData.pushEnabled}
  onChange={(val) => handleToggle('pushEnabled', val)}
/>
```

改为：
```tsx
<div className="flex items-center gap-2">
  <Toggle
    checked={formData.pushEnabled}
    onChange={(val) => handleToggle('pushEnabled', val)}
  />
  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
    {formData.pushEnabled ? 'ON' : 'OFF'}
  </span>
</div>
```

- [ ] **Step 3: 提交**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(profile): add ON/OFF labels to toggle switches"
```

---

## Task 4: Profile 页面 — 按钮层级明确化

**Files:**
- Modify: `src/app/profile/page.tsx`

- [ ] **Step 1: 检查主要操作按钮**

Run: Grep `src/app/profile/page.tsx` for "保存\|更新\|修改"
Expected: 找到主按钮，当前可能缺少视觉层级区分

- [ ] **Step 2: 确保主按钮使用 primary variant，次要操作使用 secondary**

确认"保存"按钮：
```tsx
<Button variant="primary" onClick={handleSave}>
  保存
</Button>
```

次要操作（如"取消"）：
```tsx
<Button variant="secondary" onClick={handleCancel}>
  取消
</Button>
```

- [ ] **Step 3: 提交**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(profile): clarify button hierarchy with proper variants"
```

---

## Task 5: History 页面 — 空状态添加"立即添加"CTA

**Files:**
- Modify: `src/app/history/page.tsx`
- Review: `src/components/HistoryList.tsx`

- [ ] **Step 1: 读取 History 页面和 HistoryList 组件**

Run: Read `src/app/history/page.tsx`
Run: Read `src/components/HistoryList.tsx`
Expected: 找到空状态区域（`reports.length === 0` 时的渲染）

- [ ] **Step 2: 在空状态中添加醒目的 CTA 按钮**

找到空状态区域，将：
```tsx
{reports.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-400">暂无报告</p>
  </div>
)}
```

改为：
```tsx
{reports.length === 0 && (
  <div className="text-center py-16">
    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
      <span className="text-4xl">📜</span>
    </div>
    <p className="text-lg mb-2" style={{ color: 'var(--color-text)' }}>
      暂无命盘报告
    </p>
    <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
      开始探索你的命运画卷
    </p>
    <Link href="/">
      <Button variant="primary">
        立即添加
      </Button>
    </Link>
  </div>
)}
```

- [ ] **Step 3: 提交**

```bash
git add src/app/history/page.tsx
git commit -m "feat(history): add CTA button in empty state"
```

---

## Task 6: History 页面 — Tab 滚动指示器

**Files:**
- Modify: `src/app/history/page.tsx`

- [ ] **Step 1: 在 Tab 容器上添加左右滚动提示**

找到 Tab 栏容器，添加渐变遮罩指示滚动方向：
```tsx
<div className="relative">
  {/* 左渐变遮罩 */}
  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0a0e27] to-transparent z-10 pointer-events-none" />
  
  {/* 右渐变遮罩 */}
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0e27] to-transparent z-10 pointer-events-none" />
  
  {/* Tab 栏 */}
  <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4">
    {/* ... tabs ... */}
  </div>
</div>
```

- [ ] **Step 2: 添加 CSS 隐藏滚动条**

在 `globals.css` 或页面 `<style jsx>` 中添加：
```css
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/app/history/page.tsx
git add src/app/globals.css  # if modified
git commit -m "feat(history): add scroll indicators for tabs"
```

---

## Task 7: History 页面 — 对比按钮添加工具提示

**Files:**
- Modify: `src/components/HistoryList.tsx`

- [ ] **Step 1: 读取 HistoryList 组件**

Run: Read `src/components/HistoryList.tsx`
Expected: 找到"对比"按钮位置

- [ ] **Step 2: 为对比按钮添加 title 属性**

将：
```tsx
<button className="px-3 py-1 rounded text-sm bg-white/10">
  对比
</button>
```

改为：
```tsx
<button
  className="px-3 py-1 rounded text-sm bg-white/10 hover:bg-white/20 transition-colors"
  title="选择2个报告进行对比"
>
  对比
</button>
```

- [ ] **Step 3: 提交**

```bash
git add src/components/HistoryList.tsx
git commit -m "feat(history): add tooltip to compare button"
```

---

## Task 8: History 页面 — 日期改为相对时间

**Files:**
- Modify: `src/components/ReportCard.tsx`

- [ ] **Step 1: 读取 ReportCard 组件**

Run: Read `src/components/ReportCard.tsx`
Expected: 找到日期显示位置

- [ ] **Step 2: 创建并使用相对时间格式化函数**

添加辅助函数：
```tsx
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}
```

将 `new Date(report.createdAt).toLocaleDateString('zh-CN')` 替换为 `formatRelativeTime(report.createdAt)`。

- [ ] **Step 3: 提交**

```bash
git add src/components/ReportCard.tsx
git commit -m "feat(history): display relative time for report dates"
```

---

## 总结

| Task | 页面 | 改动 |
|------|------|------|
| 1 | Profile | 添加头像区域 |
| 2 | Profile | 表单控件一致性（CustomDropdown） |
| 3 | Profile | Toggle 开关 ON/OFF 标签 |
| 4 | Profile | 按钮层级明确化 |
| 5 | History | 空状态添加 CTA |
| 6 | History | Tab 滚动指示器 |
| 7 | History | 对比按钮工具提示 |
| 8 | History | 日期改为相对时间 |

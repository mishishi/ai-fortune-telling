# 全面 UI/UX 优化设计规范

> **状态:** 已批准

**目标:** 保持现有宇宙星空深色主题，深化细化每个细节，实现交互精致化、信息层级清晰化、可访问性完整化

**架构:** 基于现有 CSS 自定义属性设计系统，新增模块化组件库

**技术栈:** Next.js App Router, TypeScript, Tailwind CSS, 现有 UI 组件

---

## 1. 设计理念

### 主题延续
- 保持现有 **宇宙星空** 深色主题不变
- 深化细化每个视觉和交互细节
- 使用现有 CSS 自定义属性（`--color-bg`, `--color-text`, `--color-accent` 等）

### 优化重点
| 优先级 | 方向 | 说明 |
|--------|------|------|
| P0 | 交互精致化 | Toggle 组件化、表单实时验证 |
| P1 | 信息层级清晰化 | Report 页面分区、移动端适配 |
| P2 | 可访问性完整化 | 键盘导航、ARIA 增强 |
| P3 | 架构优化 | 组件库补全、BirthForm 拆分 |

---

## 2. P0 核心交互

### 2.1 Toggle 组件化

**问题:** 目前 Profile 页的 Toggle 是内联实现，状态不清晰，无统一组件

**解决方案:** 创建统一 Toggle 组件

```tsx
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;  // 可选：关联标签的 aria-describedby
}

// 视觉规格
// - 轨道：宽高比 2:1，圆角full
// - 滑块：圆形，比轨道高度小4px
// - ON状态：轨道渐变 #7b68ee → #4169e1
// - OFF状态：轨道 rgba(255,255,255,0.2)
// - 过渡：transform 200ms ease-out
// - 焦点：2px outline offset #f0c674
```

**ARIA 要求:**
- `role="switch"`
- `aria-checked={checked}`
- `tabIndex={0}`
- 键盘：Space/Enter 切换

### 2.2 表单实时验证

**问题:** 错误仅在提交后显示，用户不知道哪些字段格式错误

**解决方案:** 实时验证 + 即时反馈

```tsx
// 验证时机：onBlur（失去焦点）时验证，onChange 时清除错误
// 错误样式：红色边框 + 错误提示文字
// 成功样式：绿色边框（可选）

interface ValidationRule {
  field: string;
  rules: Array<{
    test: (value: any) => boolean;
    message: string;
  }>;
}

// 示例规则
const birthFormRules: ValidationRule[] = [
  {
    field: 'name',
    rules: [
      { test: v => v.length >= 2, message: '姓名至少2个字符' },
      { test: v => v.length <= 20, message: '姓名最多20个字符' },
    ]
  },
  {
    field: 'birthDate',
    rules: [
      { test: v => !!v, message: '请选择出生日期' },
      { test: v => !isFuture(v), message: '日期不能是未来' },
    ]
  }
];
```

---

## 3. P1 视觉与布局

### 3.1 Report 页面信息分区

**问题:** 雷达图、AI分析、时间轴、解锁按钮挤在一起，缺少分区

**解决方案:** 按信息密度和操作逻辑分区

```
┌─────────────────────────────────────┐
│  基础信息区                          │
│  （姓名、出生时间、性别）              │
├─────────────────────────────────────┤
│  主要分析区                          │
│  （雷达图 + 核心解读）                 │
├─────────────────────────────────────┤
│  详细信息区（可折叠）                  │
│  （时间轴 + 详细分析）                 │
├─────────────────────────────────────┤
│  操作区                              │
│  （解锁按钮、分享、下载）              │
└─────────────────────────────────────┘
```

**实现方式:** 使用 Accordion 组件包装次要信息区

### 3.2 移动端适配

**问题:** 部分组件响应式表现不确定，触控区域偏小

**解决方案:** 全局响应式审计与修复

| 断点 | 容器最大宽度 | 栅格 |
|------|-------------|------|
| mobile | 100% | 单列 |
| tablet | 768px | 双列 |
| desktop | 1200px | 多列 |

**触控优化:**
- 最小触控区域: 44x44px
- 按钮内边距: 最小 12px 16px
- 下拉选项高度: 最小 44px

---

## 4. P2 可访问性

### 4.1 键盘导航

**组件键盘支持:**

| 组件 | Tab | Arrow | Enter/Space | Escape |
|------|-----|-------|-------------|--------|
| Dropdown | 进入 | 上下移动 | 选中 | 关闭 |
| Accordion | 进入 | 上下移动 | 展开/折叠 | 关闭 |
| Tabs | - | 左右移动 | 选中 | - |
| Modal | Trap | - | 确认 | 关闭 |
| Tooltip | - | - | - | 关闭 |

### 4.2 ARIA 增强

**雷达图 ARIA:**
```tsx
<div
  role="img"
  aria-label="命盘分析雷达图：性格85分、事业78分、感情62分、健康90分、财运75分"
>
  {/* 雷达图内容 */}
</div>
```

**进度指示器:**
```tsx
<div role="status" aria-live="polite">
  {loading ? '加载中...' : '加载完成'}
</div>
```

**错误提示:**
```tsx
<div role="alert" aria-atomic="true">
  {errorMessage}
</div>
```

---

## 5. P3 架构优化

### 5.1 组件库补全

**新增组件清单:**

| 组件 | 用途 | 优先级 |
|------|------|--------|
| Toggle | 开关控件 | P0 |
| Tabs | 标签页切换 | P1 |
| Accordion | 可折叠面板 | P1 |
| Modal | 模态对话框 | P1 |
| Tooltip | 工具提示 | P2 |
| Skeleton | 加载占位 | P2 |

### 5.2 BirthForm 拆分

**当前问题:** 320 行代码，职责过多

**拆分方案:**

```
BirthForm/
├── index.tsx              # 主组件，组合子组件
├── BirthDatePicker.tsx    # 出生日期选择
├── BirthTimePicker.tsx    # 出生时辰选择
├── GenderSelect.tsx       # 性别选择（复用 CustomDropdown）
└── hooks/
    └── useBirthFormValidation.ts  # 验证逻辑
```

---

## 6. 动效与微交互

### 6.1 Staggered Reveal（交错入场）

**用途:** 页面加载时元素依次淡入

```css
.stagger-item {
  opacity: 0;
  transform: translateY(12px);
  animation: staggerFadeIn 400ms ease-out forwards;
}

@keyframes staggerFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 交错间隔: 100ms */
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 100ms; }
.stagger-item:nth-child(3) { animation-delay: 200ms; }
.stagger-item:nth-child(4) { animation-delay: 300ms; }
.stagger-item:nth-child(5) { animation-delay: 400ms; }
```

### 6.2 Hover Lift（悬停上浮）

**用途:** 卡片悬停时轻微上浮 + 阴影加深

```css
.card-hover {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
}
```

### 6.3 Glow Pulse（呼吸光晕）

**用途:** 重要元素（如解锁按钮）的呼吸光晕效果

```css
.glow-pulse {
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(123, 104, 238, 0.4);
  }
  50% {
    box-shadow: 0 0 24px rgba(123, 104, 238, 0.8);
  }
}
```

---

## 7. 设计令牌扩展

### 新增 CSS 变量

```css
:root {
  /* 交互状态 */
  --color-focus: #f0c674;
  --color-error: #ef4444;
  --color-success: #22c55e;
  
  /* 阴影 */
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 12px 24px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 16px rgba(123, 104, 238, 0.5);
  
  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* 过渡 */
  --transition-fast: 150ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

---

## 8. 实施顺序

| 阶段 | 组件/功能 | 优先级 |
|------|----------|--------|
| 1 | Toggle 组件 | P0 |
| 1 | 表单实时验证 | P0 |
| 2 | Report 页面分区（Accordion） | P1 |
| 2 | 移动端适配审计 | P1 |
| 3 | 键盘导航增强 | P2 |
| 3 | ARIA 补充 | P2 |
| 4 | 组件库（Tabs, Modal, Tooltip, Skeleton） | P3 |
| 4 | BirthForm 拆分 | P3 |

---

## 9. 验收标准

- [ ] 所有交互组件支持键盘导航
- [ ] 表单验证实时反馈，错误提示明确
- [ ] 移动端触控区域最小 44x44px
- [ ] 动效流畅，无 jank（60fps）
- [ ] WCAG 2.1 AA 级可访问性
- [ ] 组件库统一设计语言

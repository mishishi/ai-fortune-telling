# 出生日期选择器设计方案

**日期：** 2026-04-22
**类型：** UI 组件优化
**优先级：** P0

---

## 1. 背景

当前 `BirthForm` 使用原生 `<input type="date">`，在深色主题下样式简陋，用户体验不佳。需要实现一个与设计系统一致的自定义日历弹窗。

---

## 2. 设计目标

- 与现有深色设计系统一致
- 年份范围：1980-2026
- 支持快速年月跳转
- 纯阳历（无农历支持）
- 移动端友好

---

## 3. 交互流程

1. **触发：** 点击日期输入框，弹出日历弹窗
2. **选择年月：** 点击顶部年月区域，弹出年份/月份下拉快速跳转
3. **选择日期：** 在日历网格中点击具体日期
4. **关闭：** 点击外部或选择日期后自动关闭

---

## 4. 视觉设计

### 4.1 触发输入框

```
┌─────────────────────────────┐
│      📅 2026年4月22日     ▼│
└─────────────────────────────┘
```

- 显示格式：`YYYY年M月D日`
- 右侧日历图标 + 展开箭头
- 保持与现有表单字段一致的样式

### 4.2 日历弹窗

```
┌──────────────────────────────────────┐
│  ◀    2026年4月      ▶              │
│                                      │
│  ┌────┐    ┌────┐                   │
│  │ ▼ │年  │ ▼ │月                   │
│  └────┘    └────┘                   │
│                                      │
│   日  一  二  三  四  五  六         │
│                              1  2    │
│    3  4  5  6  7  8  9            │
│   10 11 12 13 14 15 16             │
│   17 18 19 20 21 22 23             │
│   24 25 26 27 28 29 30             │
└──────────────────────────────────────┘
```

### 4.3 样式细节

| 元素 | 样式 |
|------|------|
| 弹窗容器 | `background: var(--color-surface-elevated)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-lg)` |
| 头部导航 | 金色accent文字，`--color-accent`，左右箭头按钮 |
| 年月下拉 | 原生 `<select>`，深色背景，简化样式 |
| 星期标题 | `color: var(--color-text-muted)`，字号较小 |
| 日期网格 | 7列 grid，日期单元格 `40px × 40px` |
| 普通日期 | `color: var(--color-text-secondary)`，hover 时背景变亮 |
| 选中日期 | 渐变背景 `linear-gradient(135deg, var(--color-primary), var(--color-secondary))`，白色文字 |
| 今日 | 金色边框 `2px solid var(--color-accent)` |
| 无效日期 | `color: var(--color-text-muted)`，透明度 50%，不可点击 |

### 4.4 动画

- 弹窗出现：`scale(0.95) → scale(1)` + `opacity(0 → 1)`，200ms ease-out
- 弹窗消失：反向动画
- 日期 hover：`background` 过渡 150ms

---

## 5. 技术实现

### 5.1 组件结构

**文件：** `src/components/BirthForm/BirthDatePicker.tsx`

```typescript
interface BirthDatePickerProps {
  year: number;
  month: number;
  day: number;
  error?: string;
  onChange: (year: number, month: number, day: number) => void;
  onBlur: () => void;
}
```

### 5.2 状态管理

```typescript
const [isOpen, setIsOpen] = useState(false);
const [viewYear, setViewYear] = useState(year);  // 当前视图年份
const [viewMonth, setViewMonth] = useState(month); // 当前视图月份
```

### 5.3 日期计算

- 使用 `new Date(year, month - 1, 1).getDay()` 获取月首星期
- 使用 `new Date(year, month, 0).getDate()` 获取月总天数
- 补齐前后月份日期（灰色显示）

### 5.4 年份范围

```typescript
const MIN_YEAR = 1980;
const MAX_YEAR = new Date().getFullYear(); // 2026
```

---

## 6. 不涉及范围

- 农历转换（未来可扩展）
- 日期范围验证（由 validationRules 处理）
- 时间选择器（由 BirthTimePicker 处理）

---

## 7. 验收标准

1. 日历弹窗在深色主题下显示正常
2. 年份范围 1980-2026
3. 可以通过下拉快速跳转年月
4. 点击日期后弹窗关闭，值更新
5. 点击外部关闭弹窗
6. 今日日期有特殊标识
7. 移动端触摸友好

---

## 8. 涉及文件

| 文件 | 改动 |
|------|------|
| `src/components/BirthForm/BirthDatePicker.tsx` | 重写为自定义日历组件 |
| `src/components/BirthForm.tsx` | 更新使用新组件 |

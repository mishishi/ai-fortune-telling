# 出生信息表单优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将出生信息表单从7个字段减少到5个，使用原生date picker，添加时辰三段选择，移除分钟输入。

**Architecture:** 修改 BirthForm.tsx 主组件，保留地支下拉但添加早/中/晚三段选择，将年月日合并为原生date picker输入，移除分钟输入UI但保留数据结构中的字段值为0。

**Tech Stack:** React (Next.js), Tailwind CSS, 原生 HTML date picker

---

## 涉及文件

| 文件 | 改动 |
|------|------|
| `src/components/BirthForm.tsx` | 主要改动：合并日期输入、添加时辰三段选择、移除分钟输入 |
| `src/components/BirthForm/validationRules.ts` | 更新验证规则 |
| `src/hooks/useFormValidation.ts` | 无需改动 |

---

## Task 1: 分析现有 BirthForm.tsx 结构

**Files:**
- Read: `src/components/BirthForm.tsx`

- [ ] **Step 1: 理解当前组件结构**

阅读 BirthForm.tsx 了解：
- 当前 year/month/day/hour/minute/province 的 state 管理方式
- 表单提交逻辑 `handleSubmit`
- 错误验证集成方式

---

## Task 2: 定义新的数据类型和常量

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: 添加时辰三段类型定义**

在 BirthForm.tsx 文件顶部添加：

```typescript
type TimeSegment = 'early' | 'middle' | 'late';

// 时辰三段定义：每个时辰的早/中/晚对应的时钟小时和分钟
const TIME_SEGMENTS: Record<number, { early: { hour: number; minute: number }; middle: { hour: number; minute: number }; late: { hour: number; minute: number } }> = {
  23: { early: { hour: 23, minute: 0 }, middle: { hour: 0, minute: 0 }, late: { hour: 0, minute: 30 } }, // 子时
  1: { early: { hour: 1, minute: 0 }, middle: { hour: 2, minute: 0 }, late: { hour: 2, minute: 30 } },  // 丑时
  3: { early: { hour: 3, minute: 0 }, middle: { hour: 4, minute: 0 }, late: { hour: 4, minute: 30 } },  // 寅时
  5: { early: { hour: 5, minute: 0 }, middle: { hour: 6, minute: 0 }, late: { hour: 6, minute: 30 } },  // 卯时
  7: { early: { hour: 7, minute: 0 }, middle: { hour: 8, minute: 0 }, late: { hour: 8, minute: 30 } },  // 辰时
  9: { early: { hour: 9, minute: 0 }, middle: { hour: 10, minute: 0 }, late: { hour: 10, minute: 30 } }, // 巳时
  11: { early: { hour: 11, minute: 0 }, middle: { hour: 12, minute: 0 }, late: { hour: 12, minute: 30 } },// 午时
  13: { early: { hour: 13, minute: 0 }, middle: { hour: 14, minute: 0 }, late: { hour: 14, minute: 30 } },// 未时
  15: { early: { hour: 15, minute: 0 }, middle: { hour: 16, minute: 0 }, late: { hour: 16, minute: 30 } },// 申时
  17: { early: { hour: 17, minute: 0 }, middle: { hour: 18, minute: 0 }, late: { hour: 18, minute: 30 } },// 酉时
  19: { early: { hour: 19, minute: 0 }, middle: { hour: 20, minute: 0 }, late: { hour: 20, minute: 30 } },// 戌时
  21: { early: { hour: 21, minute: 0 }, middle: { hour: 22, minute: 0 }, late: { hour: 22, minute: 30 } },// 亥时
};
```

---

## Task 3: 更新 BirthFormData 接口

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: 更新 BirthFormData 接口**

将现有的 `BirthFormData` 接口替换为：

```typescript
export interface BirthFormData {
  name: string;
  gender: 'male' | 'female';
  year: number;
  month: number;
  day: number;
  hour: number;        // 时钟小时（0-23）
  minute: number;      // 保留但固定为0
  province: string;
  timeSegment: TimeSegment; // 早/中/晚
}
```

---

## Task 4: 更新表单 state 初始化

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: 更新 form state**

将 state 初始化从：
```typescript
const [form, setForm] = useState<BirthFormData>({
  name: '',
  gender: 'male',
  year: new Date().getFullYear(),
  month: 1,
  day: 1,
  hour: 8,
  minute: 0,
  province: '',
});
```

替换为：
```typescript
const [form, setForm] = useState<BirthFormData>({
  name: '',
  gender: 'male',
  year: new Date().getFullYear(),
  month: 1,
  day: 1,
  hour: 8,
  minute: 0,  // 保留但UI不显示
  province: '',
  timeSegment: 'middle', // 默认选中"中"
});
```

- [ ] **Step 2: 添加 birthDate computed 属性用于 date picker**

在组件内部添加：
```typescript
// 将 year/month/day 组合为 YYYY-MM-DD 格式用于 date picker
const birthDateString = form.year && form.month && form.day
  ? `${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`
  : '';
```

---

## Task 5: 替换年月日输入为原生 date picker

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: 找到并替换年月日输入区域**

找到当前的日期输入部分（大约在第187-239行），将其替换为：

```tsx
{/* 出生日期 - 原生 date picker */}
<div>
  <label htmlFor="birth-date" className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
    出生日期
  </label>
  <input
    id="birth-date"
    type="date"
    value={birthDateString}
    onChange={(e) => {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        setForm({
          ...form,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
        });
      }
      clearError('date');
    }}
    onBlur={() => validate('date', null, form)}
    className="w-full rounded-[var(--radius-md)] px-5 py-4 text-white focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors border"
    style={{
      background: 'var(--color-surface)',
      borderColor: errors.date ? 'var(--color-error)' : 'var(--color-border)',
      colorScheme: 'dark',
    }}
    aria-invalid={!!errors.date}
    aria-describedby={errors.date ? 'birth-date-error' : undefined}
  />
  {errors.date && (
    <p id="birth-date-error" className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
      {errors.date}
    </p>
  )}
</div>
```

---

## Task 6: 替换时辰输入为地支下拉 + 三段选择

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: 找到时辰输入区域并替换**

找到当前的时辰+分钟输入区域（约第241-272行），将其替换为：

```tsx
{/* 出生时辰 - 地支下拉 + 早/中/晚三段选择 */}
<div>
  <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
    出生时辰
  </label>

  {/* 地支下拉选择 */}
  <div className="mb-3">
    <CustomDropdown
      value={form.hour}
      options={EARTHLY_BRANCHES.map(b => ({
        label: `${b.name} ${b.range}`,
        displayValue: b.range,
        value: b.hour,
      }))}
      onChange={v => {
        setForm({ ...form, hour: Number(v), timeSegment: 'middle' }); // 切换时辰时默认选中"中"
      }}
    />
  </div>

  {/* 早/中/晚三段选择按钮 */}
  <div className="flex gap-2">
    {(['early', 'middle', 'late'] as const).map(segment => (
      <button
        key={segment}
        type="button"
        onClick={() => {
          const segmentData = TIME_SEGMENTS[form.hour]?.[segment];
          if (segmentData) {
            setForm({
              ...form,
              hour: segmentData.hour,
              minute: segmentData.minute,
              timeSegment: segment,
            });
          }
        }}
        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
          form.timeSegment === segment
            ? 'text-white'
            : 'text-gray-400 hover:text-gray-200'
        }`}
        style={
          form.timeSegment === segment
            ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }
            : { background: 'var(--color-surface)' }
        }
      >
        {segment === 'early' ? '早' : segment === 'middle' ? '中' : '晚'}
      </button>
    ))}
  </div>
</div>
```

---

## Task 7: 移除分钟输入

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: 删除分钟输入区域**

找到并删除约第255-271行的分钟输入部分：
```tsx
<div>
  <label htmlFor="birth-minute" className="block text-sm mb-2" ...>分</label>
  <input
    id="birth-minute"
    type="number"
    ...
  />
  {errors.minute && <p ...>{errors.minute}</p>}
</div>
```

---

## Task 8: 更新 handleReset 函数

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: 更新 handleReset**

将 handleReset 函数更新为：
```typescript
const handleReset = () => {
  setForm({
    name: '',
    gender: 'male',
    year: new Date().getFullYear(),
    month: 1,
    day: 1,
    hour: 8,
    minute: 0,
    province: '',
    timeSegment: 'middle',
  });
};
```

---

## Task 9: 更新 validationRules.ts

**Files:**
- Modify: `src/components/BirthForm/validationRules.ts`

- [ ] **Step 1: 移除分钟验证规则**

将 validationRules 中的 minute 规则删除：

```typescript
export const validationRules = [
  {
    field: 'name',
    rules: [
      { test: (v: any) => typeof v === 'string' && v.trim().length > 0, message: '请输入姓名' },
      { test: (v: any) => typeof v === 'string' && v.trim().length >= 2, message: '姓名至少需要2个字符' },
    ],
  },
  {
    field: 'date',
    rules: [
      { test: (_: any, form: any) => isValidDate(form.year, form.month, form.day), message: '请输入有效的出生日期' },
    ],
  },
  // minute 规则已移除
  {
    field: 'province',
    rules: [
      { test: (v: any) => !!v, message: '请选择出生省份' },
    ],
  },
];
```

---

## Task 10: 添加 CSS 样式

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: 添加 date picker 深色主题样式**

在 globals.css 末尾添加：

```css
/* 原生 date picker 深色主题适配 */
input[type="date"],
input[type="time"],
input[type="datetime-local"] {
  color-scheme: dark;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}
```

---

## Task 11: 测试验证

**Files:**
- None (manual testing)

- [ ] **Step 1: 启动开发服务器并测试**

```bash
cd D:/claude/workspace/ai-fortune-telling
npm run dev
```

- [ ] **Step 2: 验证表单显示**

访问首页 http://localhost:3000，确认：
- [ ] 出生日期显示为原生 date picker（可点击）
- [ ] 时辰下拉后显示早/中/晚三个按钮
- [ ] 分钟输入框已移除

- [ ] **Step 3: 测试表单提交**

填写表单并提交，确认：
- [ ] 表单验证正常工作
- [ ] 提交后 AI 对话框正常弹出
- [ ] 可以正常完成一轮对话
- [ ] 报告生成成功

- [ ] **Step 4: 验证 API 数据**

打开浏览器 DevTools > Network，确认发送给 `/api/ai/analyze` 的 birthData 包含：
- [ ] year, month, day 正确
- [ ] hour 正确（根据选择的时辰和时段）
- [ ] minute: 0
- [ ] gender, province 正确

---

## Task 12: 提交代码

- [ ] **Step 1: 检查变更**

```bash
git diff src/components/BirthForm.tsx
```

- [ ] **Step 2: 提交**

```bash
git add src/components/BirthForm.tsx src/components/BirthForm/validationRules.ts src/app/globals.css
git commit -m "feat(BirthForm): simplify form - native date picker, time segment selection, remove minute field

- Merge year/month/day inputs into single native date picker
- Add early/middle/late segment selection for birth hour
- Remove minute input from UI (API handles default value 0)
- Update validation rules accordingly"
```

---

## 验收标准检查清单

- [ ] 表单字段从 7 个减少到 5 个
- [ ] 年/月/日三个输入框合并为一个原生 date picker
- [ ] 时辰选择后显示早/中/晚三个按钮
- [ ] 分钟输入框已从 UI 移除
- [ ] 表单提交后 API 调用成功
- [ ] 八字计算结果正确
- [ ] 无新增 console.error
- [ ] 代码已提交

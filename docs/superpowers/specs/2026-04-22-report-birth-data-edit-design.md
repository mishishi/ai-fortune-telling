# 报告页修改出生信息设计

## 背景问题

用户生成报告后，若发现出生时辰选错，只能重新进入表单新建档案再生成一次，旧报告仍然存在。无从修正、造成冗余数据。

## 设计目标

1. 在报告页提供"修改信息"入口，用户无需离开报告页即可修正并重新生成
2. 修正后直接覆盖原报告，避免冗余
3. 流程短、操作轻量

## 设计方案

### 1. 报告页新增"修改信息"按钮

位置：报告页标题区右侧

```
[命盘标题]                    [✏️ 修改信息]
```

按钮样式：`text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors`

### 2. 修改信息弹窗（Modal）

点击后弹出 Modal，标题为"修改出生信息"，内含预填好的 `BirthForm`。

**Modal 逻辑：**
- `initialData` prop 预填表单（year, month, day, hour, minute, timeSegment, province, gender, name）
- `onSubmit` 拦截自行处理，调用 `/api/ai/analyze` 重新生成报告
- 不走原来 `handleSubmit` 的 AI 追问流程，直接生成（因为信息修正不需要再走 AI 问答）

**弹窗底部：**
- "重新生成报告" 按钮（primary gradient）
- "取消" 按钮（text button）

### 3. 重新生成流程

用户提交后：
1. 弹窗显示 loading 状态（模拟三步骤进度：`八字排盘 → AI分析 → 生成报告`）
2. 调用 `/api/ai/analyze` 重新生成（新 birthData + 历史 conversationHistory）
3. 返回新报告数据后，更新当前页面路由的报告内容（用 `router.refresh()` 或 state 更新）
4. 弹窗关闭

### 4. 组件改动

**新文件：** `src/components/BirthDataEditModal.tsx`
- Modal + `BirthForm` 组合
- 接收 `reportId`、`initialData`（当前出生信息）、`onSuccess` callback

**修改文件：**
- `src/app/report/[id]/page.tsx`：新增"修改信息"按钮，渲染 `BirthDataEditModal`
- `src/components/BirthForm.tsx`：新增 `initialData` prop 和 `onSubmitOverride` prop，支持外部控制提交逻辑

### 5. BirthForm 扩展

```tsx
interface BirthFormProps {
  // existing
  onSubmit: (data: BirthFormData) => Promise<void>;
  // new
  initialData?: Partial<BirthFormData>;   // 预填数据
  submitOverride?: (data: BirthFormData) => Promise<void>;  // 外部接管提交
}
```

当 `submitOverride` 存在时，表单使用该函数处理提交（不调用 `onSubmit`），同时隐藏默认表单提交按钮（由外部渲染操作按钮）。

### 6. API 兼容

`/api/ai/analyze` 已支持通过 `birthData` 参数重新生成（现有逻辑），无需改动后端。

## 文件变更清单

| 文件 | 改动类型 |
|------|----------|
| `src/components/BirthForm.tsx` | 新增 `initialData`、`submitOverride` props |
| `src/components/BirthDataEditModal.tsx` | 新建 Modal 组件 |
| `src/app/report/[id]/page.tsx` | 新增"修改信息"按钮和 Modal |
| `docs/superpowers/specs/2026-04-22-report-birth-data-edit-design.md` | 本文档 |

## 验证标准

1. 打开任意报告页，标题右侧有"修改信息"按钮
2. 点击按钮弹出 Modal，表单预填当前报告的出生信息
3. 修改时辰后点"重新生成"，Modal 显示进度 → 报告内容更新
4. 取消按钮可关闭弹窗
5. 未解锁报告也可修改并生成（生成需付费页同理）

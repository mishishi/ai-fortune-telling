# AI 追问轮次进度与主题覆盖设计

## 背景问题

当前 AI 追问交互存在以下体验缺陷：
- `roundCountRef` 存在但**无任何 UI 反馈**
- 用户不知道聊了几轮、还剩几轮
- 2 轮后自动触发生成，用户无掌控感
- 不知道 AI 问了哪些主题、还缺哪些

## 设计目标

1. 轮次进度清晰可见（"第 1 轮，共 2 轮"）
2. 主题覆盖一目了然（"已覆盖：感情、事业"）
3. 用户主动点"完成"才生成，而非自动触发
4. 关键主题缺失时给出温和提示

## 设计方案

### 1. 后端改动：`/api/ai/chat` 返回主题标签

每轮 AI 追问返回时，携带一个 `topic` 字段：

```json
{
  "response": "请谈谈你在工作中的压力来源...",
  "topic": "career"
}
```

`topic` 可选值：`career` | `love` | `health` | `wealth` | `family`

### 2. 前端 Modal 顶部：主题覆盖 + 轮次进度

在 Modal 标题下方增加两个信息区：

```
已覆盖： [感情] [事业]          第 1 轮（共 2 轮）
```

**"已覆盖"区域：**
- 每次 AI 回复后，将返回的 `topic` 加入已覆盖列表
- 使用小圆角 tag 样式：`bg-[var(--color-primary)]/20 text-[var(--color-accent)] border border-[var(--color-primary)]/30`
- 最多显示 5 个 tag，超出滚动

**"轮次进度"区域：**
- 显示 "第 N 轮（共 2 轮）"
- 纯文字提示，右对齐

### 3. 2 轮后：出现"完成"按钮，不再自动触发

当前逻辑（`handleSend`）：
```
roundCountRef >= 2 → await generateReport() → 自动生成
```

改为：
- `roundCountRef >= 2` 时，**不再自动调用** `generateReport()`
- 改为显示"完成问答"按钮
- 用户点按钮后调用 `generateReport()`

Modal 底部按钮区域（2 轮前）：
```
[输入框...            ] [发送]
        [跳过，直接生成报告]
```

2 轮后：
```
[输入框...            ] [发送]
        [✓ 完成问答，生成报告]  ← 按钮变为 accent 样式
```

### 4. 关键主题缺失提示

定义关键主题：`career`（事业）、`love`（感情）、`health`（健康）

若 2 轮后已覆盖主题数 < 3，且存在未覆盖的关键主题，在"完成"按钮旁显示提示：

```
建议再聊聊「健康」，分析会更全面
```

提示文字：`text-sm text-[var(--color-text-muted)] mt-2 text-center`

### 5. 前端状态变更

**`src/app/page.tsx` 新增 state：**
```tsx
const [coveredTopics, setCoveredTopics] = useState<string[]>([]);
```

**`handleSend` 修改：**
- 每轮 AI 回复后，提取 `topic` 并 `setCoveredTopics(prev => [...new Set([...prev, topic])])`
- 移除 `roundCountRef >= 2` 时的自动 `generateReport()` 调用
- 改为：2 轮后设置 `showDoneButton(true)`

**`AIQuestionModal` Props 扩展：**
```tsx
interface AIQuestionModalProps {
  // ...existing props
  coveredTopics?: string[];
  currentRound?: number;
  totalRounds?: number;
  showDoneButton?: boolean;
  onDone?: () => void;
}
```

### 6. 主题映射表（前端显示用）

```tsx
const TOPIC_LABELS: Record<string, string> = {
  career: '事业',
  love: '感情',
  health: '健康',
  wealth: '财富',
  family: '家庭',
};
```

## 文件变更清单

| 文件 | 改动类型 |
|------|----------|
| `src/app/page.tsx` | 修改 `handleSend`、新增 state、传 props 给 Modal |
| `src/components/AIQuestionModal.tsx` | 顶部新增主题 tag 区、轮次进度、2 轮后完成按钮 |
| `src/app/api/ai/chat/route.ts` | 返回值新增 `topic` 字段 |
| `docs/superpowers/specs/2026-04-22-ai-chat-round-progress-design.md` | 本文档 |

## 验证标准

1. 进入 AI 追问 Modal 后，顶部显示 "第 1 轮（共 2 轮）"
2. 发送一条消息后，轮次变为"第 2 轮"，对应主题 tag 显示在顶部
3. 2 轮后"跳过"按钮消失，出现"完成问答，生成报告"按钮
4. 若未覆盖"健康"，按钮旁显示"建议再聊聊「健康」，分析会更全面"
5. 点"完成"后正常生成报告

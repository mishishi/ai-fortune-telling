# 每日一问功能设计

> **Goal:** 用户每天可问一个关于今日决策的问题，AI 结合八字 + 今日运势给出「是/否 + 原因」的回答

**Architecture:** 在 `DailyFortuneCard` 展开面板中新增「今日一问」入口，用户输入问题后调用 `/api/fortune/daily-question` 接口，AI 结合用户的八字报告和当日运势数据生成个性化回答。每日限制1次，使用 device_id 或 user_id 追踪。

**Tech Stack:** Next.js App Router, SQLite (via existing db.ts), Minimax AI

---

## 1. Database Schema

新增 `daily_questions` 表：

```sql
CREATE TABLE IF NOT EXISTS daily_questions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  answerType TEXT NOT NULL,  -- 'yes' | 'no' | 'neutral'
  reportId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  UNIQUE(userId, createdDate)  -- 每天只能问一次
);
```

字段说明：
- `userId` — 登录用户用 user_id，未登录用 device_id
- `createdDate` — 取日期部分 YYYY-MM-DD，用于唯一约束
- `answerType` — 'yes'（适合/可以）| 'no'（不适合/不建议）| 'neutral'（需权衡）

---

## 2. API Design

### `POST /api/fortune/daily-question`

**Request:**
```json
{
  "question": "今天适合面试吗？",
  "userId": "user_xxx"  // 登录用户
  // 或 deviceId: "device_xxx"  // 未登录用户
}
```

**Response (success):**
```json
{
  "id": "q_xxx",
  "answer": "yes",
  "reason": "今日事业运势评分85分，正值上升期，且有贵人星相助，面试成功的可能性较高。建议上午10-11点面试。",
  "question": "今天适合面试吗？",
  "canAsk": false  // 今日已用
}
```

**Response (already asked today):**
```json
{
  "error": "今日已问过",
  "canAsk": false,
  "existingAnswer": {
    "question": "今天适合面试吗？",
    "answer": "yes",
    "reason": "..."
  }
}
```

**Response (no report):**
```json
{
  "error": "请先生成八字报告",
  "needReport": true
}
```

---

## 3. AI Prompt 设计

```
你是一位专业的八字命理师。用户问了一个关于今日决策的问题。
请结合用户的八字数据和今日运势，给出「是/否/需权衡」的回答。

回答格式（严格遵守）：
ANSWER: 是 | 否 | 需权衡
REASON: 原因分析，50字以内

规则：
1. ANSWER 只能是一个词：是 / 否 / 需权衡
2. REASON 必须结合今日运势评分（事业/感情/财运/健康）和八字特点
3. 如果今日某方面运势分数 >= 75 分，可给正面建议
4. 如果今日某方面运势分数 < 65 分，给负面或保守建议
5. 语气坚定，不模糊
```

**示例：**
- 问："今天适合表白吗？"
- 答：
  ```
  ANSWER: 是
  REASON: 今日感情运势78分，桃花星旺，且天合地合，利表白。但注意避免在酉时（17-19点）表白。
  ```

---

## 4. UI/UX Design

### 4.1 入口：「今日运势」展开面板

在 `DailyFortuneCard` 展开面板中新增按钮：

```
┌─────────────────────────────┐
│ 📅 今日运势     2026年4月24日  │
├─────────────────────────────┤
│      [综合评分: 78分]         │
│       ○○○○○○○○●○            │
│         今日运势优秀           │
├─────────────────────────────┤
│  事业💼78  感情💕75          │
│  财富💰82  健康🏥70          │
├─────────────────────────────┤
│  💡 命主提示                  │
│  今日思维清晰，适合制定计划    │
├─────────────────────────────┤
│  ✓ 宜：求职面试、表白示爱    │
│  ✗ 忌：投资冒险、大额消费    │
├─────────────────────────────┤
│  🕐 最佳时段：上午9-11点      │
├─────────────────────────────┤
│  ┌─────────────────────┐    │
│  │  🎱 今日一问          │    │  ← 新增入口
│  │  每天可问1个决策问题   │    │
│  │      [立即提问]       │    │
│  └─────────────────────┘    │
├─────────────────────────────┤
│  [查看完整报告]              │
└─────────────────────────────┘
```

### 4.2 提问弹窗

点击「立即提问」后，弹出 Modal：

```
┌─────────────────────────────┐
│  🎱 今日一问          [X]   │
├─────────────────────────────┤
│  ┌─────────────────────┐    │
│  │ 今天适合面试吗？      │    │  ← 快捷问题chips
│  └─────────────────────┘    │
│                             │
│  快捷问题：                  │
│  [今天适合面试吗] [适合表白吗] │
│  [今天适合签约吗] [今天出行]  │
│                             │
│  ┌─────────────────────┐    │
│  │ 输入你的问题...       │    │
│  └─────────────────────┘    │
│                             │
│       [提交提问]             │
└─────────────────────────────┘
```

### 4.3 结果展示

提交后 Modal 切换为结果视图：

```
┌─────────────────────────────┐
│  🎱 今日一问          [X]   │
├─────────────────────────────┤
│                             │
│         ✓ 是                 │  ← 大字：绿色是 / 红色否 / 黄色需权衡
│                             │
│  今日事业运势78分，正值上升期  │
│  面试成功的可能性较高         │  ← 原因分析
│  建议上午10-11点面试         │
│                             │
│  ─────────────────────────  │
│  已使用今日提问次数          │
│  明日 00:00 可再次提问       │
│                             │
│       [关闭]                 │
└─────────────────────────────┘
```

### 4.4 每日次数限制

- **已登录用户**：每天1次，记录在 `daily_questions` 表
- **未登录用户**：同样每天1次，用 `fortune_device_id` cookie 追踪
- **无报告用户**：提示"请先生成八字报告"，引导去首页表单

---

## 5. 组件清单

| 组件 | 文件 | 说明 |
|------|------|------|
| DailyQuestionButton | `src/components/DailyQuestionButton.tsx` | 展开面板中的入口按钮 |
| DailyQuestionModal | `src/components/DailyQuestionModal.tsx` | 提问 + 结果展示的 Modal |
| API Route | `src/app/api/fortune/daily-question/route.ts` | 处理提问逻辑 + AI 调用 |
| DB Migration | `src/lib/db.ts` | 新增 `daily_questions` 表 |

---

## 6. 状态管理

在 `DailyFortuneCard` 组件内新增 state：

```tsx
const [showQuestionModal, setShowQuestionModal] = useState(false);
const [todayQuestion, setTodayQuestion] = useState<{
  question: string;
  answer: string;
  reason: string;
} | null>(null);
```

---

## 7. 错误处理

| 场景 | 处理 |
|------|------|
| 今日已问过 | 返回已有答案，展示时不显示输入框 |
| 未生成报告 | Modal 内提示"请先生成八字报告"，引导按钮 |
| AI 返回格式错误 | fallback 回复"今日运势平稳，建议谨慎决策" |
| 网络错误 | Toast 提示"网络异常，请重试" |

---

## 8. 非登录用户流程

```
未登录用户点击「今日一问」
    ↓
检查 device_id cookie
    ↓
有历史记录 → 展示今日答案
无记录且无报告 → 提示生成报告
无记录且有报告（通过 previousReports 判定）→ 允许提问
```

> 注：当前 `daily/route.ts` 返回 `hasReport: false` 对应匿名用户。后续需要额外接口或让前端传更多信息来区分"从未生成报告"和"匿名用户但有设备记录"。

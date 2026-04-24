# 每日一问 实现计划

> **Goal:** 用户每天可问一个关于今日决策的问题，AI 结合八字 + 今日运势给出「是/否 + 原因」的回答

**Architecture:** 在 `DailyFortuneCard` 展开面板中新增「今日一问」入口，提问 Modal 调用 `POST /api/fortune/daily-question`，AI 结合用户八字报告和当日运势数据生成个性化回答。每日限制1次，使用 device_id 或 user_id 追踪。

**Tech Stack:** Next.js App Router, SQLite (via existing db.ts), Minimax AI

---

## 文件结构

```
src/
  app/api/fortune/daily-question/route.ts   # 新增：提问 API
  components/
    DailyQuestionModal.tsx                  # 新增：提问 + 结果 Modal
    DailyFortuneCard.tsx                    # 修改：集成入口按钮
  lib/
    db.ts                                   # 修改：新增 daily_questions 表迁移
```

---

## Task 1: Database Migration

**文件:** `src/lib/db.ts`

- [ ] **Step 1: 添加 daily_questions 表迁移**

在 `db.exec()` 末尾添加：

```typescript
// Migration: create daily_questions table if not exist
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_questions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      answerType TEXT NOT NULL,
      reportId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE(userId, date(createdAt))
    );
    CREATE INDEX IF NOT EXISTS idx_daily_questions_userId ON daily_questions(userId);
  `);
} catch (e) { console.error('Migration daily_questions table failed:', e); }
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat: add daily_questions table for daily question feature"
```

---

## Task 2: API Route

**文件:** `src/app/api/fortune/daily-question/route.ts` (新建)

- [ ] **Step 1: 创建 API Route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { chat, ChatMessage } from '@/lib/minimax';

const QUESTION_PROMPT = `你是一位专业的八字命理师。用户问了一个关于今日决策的问题。
请结合用户的八字数据和今日运势，给出「是/否/需权衡」的回答。

回答格式（严格遵守，每行一个字段）：
ANSWER: 是 | 否 | 需权衡
REASON: 原因分析，50字以内

规则：
1. ANSWER 只能是一个词：是 / 否 / 需权衡
2. REASON 必须结合今日运势评分（事业/感情/财运/健康）和八字特点
3. 如果今日某方面运势分数 >= 75 分，可给正面建议
4. 如果今日某方面运势分数 < 65 分，给负面或保守建议
5. 语气坚定，不模糊`;

function getDateStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, userId } = body;

    if (!question || !question.trim()) {
      return NextResponse.json({ error: '问题不能为空' }, { status: 400 });
    }

    if (!userId || userId === 'anonymous') {
      return NextResponse.json({ error: '请先登录后使用' }, { status: 401 });
    }

    const db = getDb();
    const today = getDateStr();

    // Check if already asked today
    const existing = db.prepare(
      'SELECT * FROM daily_questions WHERE userId = ? AND date(createdAt) = ?'
    ).get(userId, today) as any;

    if (existing) {
      return NextResponse.json({
        error: '今日已问过',
        canAsk: false,
        existingAnswer: {
          question: existing.question,
          answer: existing.answer,
          reason: existing.answerType,
        },
      });
    }

    // Get user's latest report
    const reports = db.prepare(
      'SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC LIMIT 1'
    ).all(userId) as any[];

    if (reports.length === 0) {
      return NextResponse.json({
        error: '请先生成八字报告',
        needReport: true,
      });
    }

    const report = reports[0];

    // Parse radar scores
    let radarScores = { career: 75, love: 75, wealth: 75, health: 75 };
    try {
      radarScores = JSON.parse(report.radarScores || '{"career":75,"love":75,"wealth":75,"health":75}');
    } catch (e) { /* use defaults */ }

    // Call AI
    const messages: ChatMessage[] = [
      { role: 'system', content: QUESTION_PROMPT },
      {
        role: 'user',
        content: `用户问题：${question}\n\n用户八字概述：事业${radarScores.career}分，感情${radarScores.love}分，财运${radarScores.wealth}分，健康${radarScores.health}分`
      },
    ];

    const response = await chat(messages);

    // Parse response
    const answerMatch = response.match(/^ANSWER:\s*(是|否|需权衡)/m);
    const reasonMatch = response.match(/^REASON:\s*(.+)/m);

    const answerType = answerMatch ? answerMatch[1] : '需权衡';
    const reason = reasonMatch ? reasonMatch[1].trim() : '今日运势平稳，建议谨慎决策';

    // Save to database
    const id = `dq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO daily_questions (id, userId, question, answer, answerType, reportId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, userId, question.trim(), answerType, reason, report.id, createdAt);

    return NextResponse.json({
      id,
      answer: answerType,
      reason,
      question: question.trim(),
      canAsk: false,
    });
  } catch (error) {
    console.error('Error in daily question:', error);
    return NextResponse.json({ error: '提问失败，请重试' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/fortune/daily-question/route.ts
git commit -m "feat: add daily question API route"
```

---

## Task 3: DailyQuestionModal Component

**文件:** `src/components/DailyQuestionModal.tsx` (新建)

- [ ] **Step 1: 创建 Modal 组件**

```tsx
'use client';

import { useState } from 'react';

interface DailyQuestionModalProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess?: () => void;
}

const QUICK_QUESTIONS = [
  '今天适合面试吗？',
  '今天适合表白吗？',
  '今天适合签约吗？',
  '今天适合出行吗？',
];

export default function DailyQuestionModal({ open, onClose, userId, onSuccess }: DailyQuestionModalProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; reason: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/fortune/daily-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, userId }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.needReport) {
          setError('请先生成八字报告');
        } else {
          setError(data.error || '提问失败');
        }
        return;
      }

      setResult({ answer: data.answer, reason: data.reason });
      onSuccess?.();
    } catch (e) {
      setError('网络异常，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getAnswerStyle = (answer: string) => {
    if (answer === '是') return { color: 'var(--color-success)', symbol: '✓' };
    if (answer === '否') return { color: 'var(--color-error)', symbol: '✗' };
    return { color: 'var(--color-warning)', symbol: '○' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--color-bg)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎱</span>
            <span className="font-bold text-white">今日一问</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {!result ? (
            <>
              {/* Quick questions */}
              <div className="mb-4">
                <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>快捷问题：</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => setQuestion(q)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        question === q
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <textarea
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="输入你的问题..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:outline-none resize-none"
              />

              {error && (
                <p className="mt-2 text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!question.trim() || loading}
                className="mt-4 w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '思考中...' : '提交提问'}
              </button>
            </>
          ) : (
            <>
              {/* Result */}
              <div className="text-center py-4">
                <div
                  className="text-5xl font-bold mb-4"
                  style={{ color: getAnswerStyle(result.answer).color }}
                >
                  {getAnswerStyle(result.answer).symbol} {result.answer}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {result.reason}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
                  已使用今日提问次数 · 明日 00:00 可再次提问
                </p>
              </div>

              <button
                onClick={onClose}
                className="mt-4 w-full py-2.5 rounded-xl text-sm border border-white/10 text-gray-300 hover:bg-white/5"
              >
                关闭
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DailyQuestionModal.tsx
git commit -m "feat: add DailyQuestionModal component"
```

---

## Task 4: Integrate into DailyFortuneCard

**文件:** `src/components/DailyFortuneCard.tsx`

- [ ] **Step 1: 添加状态和导入**

在 `DailyFortuneCard` 组件中添加：

```tsx
import DailyQuestionModal from './DailyQuestionModal';
```

在组件内添加 state：

```tsx
const [showQuestionModal, setShowQuestionModal] = useState(false);
```

- [ ] **Step 2: 添加入口按钮**

在展开面板底部（Footer CTA 之前）添加：

```tsx
{/* Daily Question Button */}
{data.hasReport && (
  <div
    className="mx-5 mb-4 p-4 rounded-xl"
    style={{
      background: 'rgba(212, 175, 55, 0.08)',
      border: '1px solid rgba(212, 175, 55, 0.2)',
    }}
  >
    <div className="flex items-center gap-3">
      <span className="text-2xl">🎱</span>
      <div className="flex-1">
        <div className="text-sm font-medium text-white">今日一问</div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>每天可问1个决策问题</div>
      </div>
      <button
        onClick={() => setShowQuestionModal(true)}
        className="px-4 py-2 rounded-lg text-sm font-medium"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.1))',
          color: 'var(--color-accent)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        立即提问
      </button>
    </div>
  </div>
)}
```

- [ ] **Step 3: 渲染 Modal**

在组件底部（return 内最后）添加：

```tsx
<DailyQuestionModal
  open={showQuestionModal}
  onClose={() => setShowQuestionModal(false)}
  userId={userId}
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/DailyFortuneCard.tsx
git commit -m "feat: integrate daily question into DailyFortuneCard"
```

---

## Task 5: Final Review & Push

- [ ] **Step 1: Review all changes**

确认：
- [ ] `db.ts` 新增了 `daily_questions` 表迁移
- [ ] API route 正确处理已登录用户的请求
- [ ] Modal 组件有加载状态、错误处理、结果展示
- [ ] DailyFortuneCard 正确集成入口按钮和 Modal

- [ ] **Step 2: Push**

```bash
git push
```

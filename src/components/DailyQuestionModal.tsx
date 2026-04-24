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
    } catch {
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

'use client';
import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIReportFollowUpModalProps {
  open: boolean;
  onClose: () => void;
  reportId: string;
  dimensions: {
    career: string;
    love: string;
    wealth: string;
    health: string;
    mentor: string;
  };
  initialDimension?: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  career: '事业',
  love: '感情',
  wealth: '财运',
  health: '健康',
  mentor: '贵人',
};

export default function AIReportFollowUpModal({
  open,
  onClose,
  reportId,
  dimensions,
  initialDimension,
}: AIReportFollowUpModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<string>(initialDimension || 'career');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const getDimensionQuestions = (dimension: string): string[] => {
    const questions: Record<string, string[]> = {
      career: [
        '我的事业发展方向是什么？',
        '适合什么样的工作？',
        '事业高峰期是什么时候？',
      ],
      love: [
        '我的感情运势如何？',
        '什么时候会遇到正缘？',
        '如何改善感情运势？',
      ],
      wealth: [
        '我的财运整体走势？',
        '最佳投资方向是什么？',
        '什么时候财运最好？',
      ],
      health: [
        '健康需要注意什么？',
        '哪个时期健康运最强？',
        '如何提升健康运势？',
      ],
      mentor: [
        '我的贵人是什么类型的人？',
        '如何吸引贵人相助？',
        '贵人方位在哪里？',
      ],
    };
    return questions[dimension] || questions.career;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const res = await fetch('/api/ai/report-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          dimension: selectedDimension,
          reportId,
          context: dimensions[selectedDimension as keyof typeof dimensions],
        }),
      });

      if (res.ok) {
        const { response } = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #1a1525 0%, #2d1f3d 100%)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">追问命理师</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>针对具体维度深入解答</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Dimension Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedDimension(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedDimension === key
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Quick Questions */}
          {messages.length === 0 && !loading && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>试试这样问：</p>
              <div className="flex flex-wrap gap-2">
                {getDimensionQuestions(selectedDimension).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-3 mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-br-md'
                      : 'bg-white/10 text-gray-200 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[var(--color-primary)]/60 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                    <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`询问${DIMENSION_LABELS[selectedDimension]}问题...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';
import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const TOPIC_LABELS: Record<string, string> = {
  career: '事业',
  love: '感情',
  health: '健康',
  wealth: '财富',
  family: '家庭',
};

const KEY_TOPICS = ['career', 'love', 'health'];

interface AIQuestionModalProps {
  open: boolean;
  messages: Message[];
  onSend: (message: string) => Promise<void>;
  onDone: () => void;
  isInitialLoading?: boolean;
  coveredTopics?: string[];
  currentRound?: number;
  totalRounds?: number;
  showDoneButton?: boolean;
}

export default function AIQuestionModal({
  open,
  messages,
  onSend,
  onDone,
  isInitialLoading = false,
  coveredTopics = [],
  currentRound = 1,
  totalRounds = 2,
  showDoneButton = false,
}: AIQuestionModalProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await onSend(input.trim());
      setInput('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ animationDuration: '200ms' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        style={{ animationDuration: '200ms' }}
        onClick={onDone}
        aria-label="关闭弹窗"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-[var(--color-bg)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-scale"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{ animationDuration: '300ms' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-white">AI 命理师追问</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>请回答几个问题以获得更精准的分析</p>
            </div>
          </div>
          {/* Round progress */}
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            第 {currentRound} 轮（共 {totalRounds} 轮）
          </span>
        </div>

        {/* Topic coverage bar */}
        {coveredTopics.length > 0 && (
          <div className="px-6 py-2 border-b border-white/5 flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>已覆盖：</span>
            {coveredTopics.map(topic => (
              <span
                key={topic}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: 'var(--color-primary)',
                  color: 'white',
                  opacity: 0.85,
                }}
              >
                {TOPIC_LABELS[topic] || topic}
              </span>
            ))}
          </div>
        )}

        {/* First-time user tip */}
        {messages.length === 0 && !isInitialLoading && (
          <div className="px-6 py-3 border-b border-white/5 bg-white/5/30">
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
              <span className="font-medium" style={{ color: 'var(--color-accent)' }}>💡 新手提示</span>
            </p>
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              告诉 AI 你的困惑，比如：
            </p>
            <div className="flex flex-wrap gap-2">
              {['事业迷茫，不知道适合什么工作', '感情不顺，如何改善', '健康需要注意什么', '财运不好怎么办'].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setInput(example)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-br-md'
                    : 'bg-white/10 text-gray-200 rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {(sending || (isInitialLoading && messages.length === 0)) && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 px-5 py-3 rounded-2xl rounded-bl-md border border-[var(--color-primary)]/30">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[var(--color-primary)]/70 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                  <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <span className="ml-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>思考中...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的回答..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              disabled={sending}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              发送
            </button>
          </div>
          {!showDoneButton ? (
            <button
              onClick={onDone}
              className="mt-3 w-full py-2 text-sm transition-colors cursor-pointer hover:text-white"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="跳过问答，直接生成报告"
            >
              跳过，直接生成报告
            </button>
          ) : (
            <div className="mt-3 text-center">
              <button
                onClick={onDone}
                className="w-full py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  boxShadow: '0 4px 15px rgba(196, 30, 58, 0.3)',
                }}
              >
                ✓ 完成问答，生成报告
              </button>
              {/* Missing topic hint */}
              {(() => {
                const missing = KEY_TOPICS.filter(t => !coveredTopics.includes(t));
                if (missing.length > 0) {
                  return (
                    <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      建议再聊聊「{TOPIC_LABELS[missing[0]]}」，分析会更全面
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

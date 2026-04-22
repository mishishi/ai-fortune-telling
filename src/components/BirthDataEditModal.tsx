'use client';
import { useState } from 'react';
import BirthForm, { BirthFormData } from '@/components/BirthForm';
import { useRouter } from 'next/navigation';

const LOADING_STEPS = [
  { key: 'bazi', label: '八字排盘' },
  { key: 'ai', label: 'AI分析' },
  { key: 'report', label: '生成报告' },
];

interface BirthDataEditModalProps {
  open: boolean;
  reportId: string;
  initialData: BirthFormData;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BirthDataEditModal({ open, reportId, initialData, onClose, onSuccess }: BirthDataEditModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<'bazi' | 'ai' | 'report'>('bazi');

  if (!open) return null;

  const handleSubmit = async (data: BirthFormData) => {
    setLoading(true);
    setLoadingStep('bazi');

    try {
      // Step 1: BaZi calculation (instant)
      await new Promise(r => setTimeout(r, 400));
      setLoadingStep('ai');

      // Step 2: AI analysis
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthData: {
            name: data.name,
            gender: data.gender,
            year: data.year,
            month: data.month,
            day: data.day,
            hour: data.hour,
            minute: data.minute,
            province: data.province,
          },
          userFocus: '全面',
        }),
      });

      if (!res.ok) throw new Error('分析失败');
      setLoadingStep('report');

      const result = await res.json();

      // Step 3: Update report via PATCH
      await new Promise(r => setTimeout(r, 300));
      await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          baziData: JSON.stringify(result.baziData),
          radarScores: JSON.stringify(result.radarScores),
          aiAnalysis: JSON.stringify(result.analysis),
          birthData: JSON.stringify({
            year: data.year,
            month: data.month,
            day: data.day,
            hour: data.hour,
            minute: data.minute,
            province: data.province,
            gender: data.gender,
            timeSegment: data.timeSegment,
          }),
        }),
      });

      onSuccess();
      router.refresh();
    } catch (err) {
      console.error('Failed to regenerate report:', err);
      alert('重新生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in" style={{ animationDuration: '200ms' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="关闭"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--color-bg)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-scale">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">修改出生信息</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="关闭"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-8">
            <div className="flex justify-center gap-2 mb-6">
              {LOADING_STEPS.map((step, i) => (
                <div key={step.key} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      loadingStep === step.key
                        ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white animate-pulse'
                        : ['bazi', 'ai', 'report'].indexOf(loadingStep) > i
                        ? 'bg-[var(--color-primary)]/80 text-white'
                        : 'bg-white/10 text-gray-500'
                    }`}
                  >
                    {['bazi', 'ai', 'report'].indexOf(loadingStep) > i ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm ${loadingStep === step.key ? 'text-white' : 'text-gray-500'}`}>
                    {step.label}
                  </span>
                  {i < LOADING_STEPS.length - 1 && (
                    <div className={`w-8 h-px mx-1 ${
                      ['bazi', 'ai', 'report'].indexOf(loadingStep) > i
                        ? 'bg-[var(--color-primary)]/50'
                        : 'bg-white/10'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
              正在重新生成报告，请稍候...
            </p>
          </div>
        ) : (
          <>
            <div className="p-6">
              <BirthForm
                onSubmit={handleSubmit}
                initialData={initialData}
                submitOverride={handleSubmit}
              />
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-medium border transition-colors hover:bg-white/10"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
              >
                取消
              </button>
              <button
                onClick={() => {
                  // Trigger form submit programmatically
                  const form = document.querySelector('form');
                  if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
                }}
                className="flex-1 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  boxShadow: '0 4px 15px rgba(196, 30, 58, 0.3)',
                }}
              >
                重新生成报告
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

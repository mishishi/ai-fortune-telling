'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';

type FeedbackStatus = 'accurate' | 'inaccurate';

interface Prediction {
  id: string;
  dimension: string;
  prediction: string;
  timeframe_start: string;
  timeframe_end: string;
  status: string;
  created_at: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  career: '事业',
  love: '感情',
  wealth: '财富',
  health: '健康',
  mentor: '贵人',
};

const DIMENSION_COLORS: Record<string, string> = {
  career: 'text-blue-400',
  love: 'text-pink-400',
  wealth: 'text-yellow-400',
  health: 'text-green-400',
  mentor: 'text-purple-400',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function PredictionVerifier() {
  const { showToast } = useToast();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await fetch('/api/predictions?status=pending');
      if (res.ok) {
        const data = await res.json();
        setPredictions(data.predictions || []);
      }
    } catch (e) {
      console.error('Failed to fetch predictions:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (id: string, status: FeedbackStatus) => {
    if (submittingIds.has(id)) return;

    setSubmittingIds(prev => new Set(prev).add(id));

    try {
      const res = await fetch(`/api/predictions/${id}/feedback`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        // Remove from list on success
        setPredictions(prev => prev.filter(p => p.id !== id));
        showToast(
          status === 'accurate' ? '感谢反馈：预测已标记为应验' : '感谢反馈：预测已标记为未应验',
          status === 'accurate' ? 'success' : 'info'
        );
      } else {
        const error = await res.json();
        showToast(error.error || '提交失败，请重试', 'error');
      }
    } catch (e) {
      showToast('提交失败，请重试', 'error');
    } finally {
      setSubmittingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-[var(--color-gold)]/30 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3 opacity-50">✨</div>
        <p className="text-gray-400 text-sm">暂无待验证的预测</p>
        <p className="text-gray-500 text-xs mt-1">预测到期后会显示在这里</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📋</span>
        <h3 className="text-white font-semibold">待验证预测</h3>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-gold)]/20 text-[var(--color-gold)]">
          {predictions.length}
        </span>
      </div>

      {predictions.map((prediction) => (
        <div
          key={prediction.id}
          className="bg-[#2a2235] rounded-xl p-4 border border-white/5"
        >
          <div className="flex items-start justify-between mb-2">
            <span className={`text-sm font-medium ${DIMENSION_COLORS[prediction.dimension] || 'text-gray-400'}`}>
              {DIMENSION_LABELS[prediction.dimension] || prediction.dimension}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(prediction.timeframe_start)} ~ {formatDate(prediction.timeframe_end)}
            </span>
          </div>

          <p className="text-white/90 text-sm mb-4 leading-relaxed">
            {prediction.prediction}
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => handleFeedback(prediction.id, 'accurate')}
              disabled={submittingIds.has(prediction.id)}
              className="flex-1 py-2.5 px-4 rounded-lg bg-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingIds.has(prediction.id) ? '提交中...' : '✓ 应验'}
            </button>
            <button
              onClick={() => handleFeedback(prediction.id, 'inaccurate')}
              disabled={submittingIds.has(prediction.id)}
              className="flex-1 py-2.5 px-4 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingIds.has(prediction.id) ? '提交中...' : '✗ 未应验'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

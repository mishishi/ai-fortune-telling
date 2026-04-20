'use client';
import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface UnlockButtonProps {
  reportId: string;
}

export default function UnlockButton({ reportId }: UnlockButtonProps) {
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const { showToast } = useToast();

  const handleUnlock = async () => {
    if (loading || unlocked) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/unlock`, {
        method: 'POST',
      });
      if (res.ok) {
        setUnlocked(true);
        // Refresh page to show full content
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to unlock:', error);
      showToast('解锁失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) {
    return null;
  }

  return (
    <div className="mt-8 text-center">
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #f0c674, #e0a500)',
          color: '#0a0e27',
          boxShadow: '0 4px 20px rgba(240,198,116,0.3)'
        }}
      >
        {loading ? '处理中...' : '解锁完整报告（¥29）'}
      </button>
    </div>
  );
}

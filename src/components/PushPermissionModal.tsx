'use client';
import { useState } from 'react';

interface Props { open: boolean; onClose: () => void; onSubscribed: () => void; }

export default function PushPermissionModal({ open, onClose, onSubscribed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError('您的浏览器不支持推送通知'); return;
    }
    setLoading(true); setError(null);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setError('您拒绝了通知权限'); setLoading(false); return; }
      const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || '';
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_KEY ? urlBase64ToUint8Array(VAPID_KEY) : undefined,
      });
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), pushTime: '08:00' }),
      });
      onSubscribed(); onClose();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : '订阅失败'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-6 text-center animate-scale-in"
        style={{ background: 'linear-gradient(180deg, #1a1525 0%, #2d1f3d 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
          <span className="text-3xl">🔔</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">开启每日推送</h3>
        <p className="text-sm text-gray-400 mb-4">每天准时收到今日运势提醒，不错过任何精彩内容</p>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 rounded-full text-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>稍后再说</button>
          <button onClick={handleSubscribe} disabled={loading} className="flex-1 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: loading ? 'rgba(212,175,55,0.5)' : 'var(--color-accent)', color: loading ? 'rgba(255,255,255,0.5)' : 'var(--color-bg)' }}>
            {loading ? '开启中...' : '开启提醒'}
          </button>
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

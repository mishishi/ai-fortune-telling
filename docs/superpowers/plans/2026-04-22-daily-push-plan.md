# Daily Push & User Retention System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 1 of daily push notification system - Service Worker, subscription APIs, profile settings, and date-based push content.

**Architecture:** Web Push API via Service Worker, SQLite database extension, cron-triggered push endpoint. Phase 1 uses date-based content (no AI).

**Tech Stack:** Next.js API Routes, better-sqlite3, Web Push API, Service Worker

---

## File Structure

```
public/sw.js
src/app/api/push/subscribe/route.ts
src/app/api/push/unsubscribe/route.ts
src/app/api/push/send/route.ts
src/components/PushPermissionModal.tsx
src/lib/db.ts
src/app/profile/page.tsx
src/components/TodayFortuneModal.tsx
```

---

## Task 1: Database Migration

**Files:**
- Modify: `src/lib/db.ts:11-42`

- [ ] **Step 1: Add migration ALTER TABLE statements**

Add after the `db.exec()` block:

```typescript
// Migration: add push columns if not exist
try {
  db.exec("ALTER TABLE users ADD COLUMN pushEnabled INTEGER DEFAULT 0");
} catch (e) { /* ignore */ }
try {
  db.exec("ALTER TABLE users ADD COLUMN pushTime TEXT DEFAULT '08:00'");
} catch (e) { /* ignore */ }
try {
  db.exec("ALTER TABLE users ADD COLUMN pushSubscription TEXT");
} catch (e) { /* ignore */ }
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db.ts && git commit -m "feat(push): add push columns to users table"
```

---

## Task 2: Service Worker

**Files:**
- Create: `public/sw.js`

- [ ] **Step 1: Create public/sw.js**

```javascript
// public/sw.js - Push notification service worker
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window' }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) return clients.openWindow(event.notification.data.url);
  }));
});
```

- [ ] **Step 2: Commit**

```bash
git add public/sw.js && git commit -m "feat(push): add service worker for push notifications"
```

---

## Task 3: Push Subscribe API

**Files:**
- Create: `src/app/api/push/subscribe/route.ts`

- [ ] **Step 1: Create POST /api/push/subscribe**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('fortune_user_id')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { subscription, pushTime } = await request.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      'UPDATE users SET pushEnabled = 1, pushTime = ?, pushSubscription = ? WHERE id = ?'
    ).run(pushTime || '08:00', JSON.stringify(subscription), userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/push/subscribe/route.ts && git commit -m "feat(push): add subscribe API endpoint"
```

---

## Task 4: Push Unsubscribe API

**Files:**
- Create: `src/app/api/push/unsubscribe/route.ts`

- [ ] **Step 1: Create DELETE /api/push/unsubscribe**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  const userId = request.cookies.get('fortune_user_id')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    db.prepare('UPDATE users SET pushEnabled = 0 WHERE id = ?').run(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/push/unsubscribe/route.ts && git commit -m "feat(push): add unsubscribe API endpoint"
```

---

## Task 5: Push Send API (Cron)

**Files:**
- Create: `src/app/api/push/send/route.ts`

- [ ] **Step 1: Create POST /api/push/send**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function generateDailyContent(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const fortunes = ['大吉', '吉', '平', '凶'];
  const tips = ['今日宜主动出击，把握机会', '今日财运平稳，谨慎投资', '今日贵人运旺，多与人交流', '今日注意调节情绪，保持平和'];
  return {
    title: `☀️ 今日运势：${fortunes[dayOfYear % 4]}`,
    body: tips[(dayOfYear + dayOfYear % 4) % 4],
  };
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const users = db.prepare('SELECT id, pushSubscription FROM users WHERE pushEnabled = 1 AND pushSubscription IS NOT NULL').all() as { id: string; pushSubscription: string }[];
    const content = generateDailyContent(new Date());
    let success = 0, fail = 0;

    for (const user of users) {
      try {
        const sub = JSON.parse(user.pushSubscription);
        const res = await fetch(sub.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'TTL': '86400' },
          body: JSON.stringify({ title: content.title, body: content.body, url: '/' }),
        });
        if (res.ok) success++;
        else if (res.status === 410 || res.status === 404) {
          db.prepare('UPDATE users SET pushEnabled = 0 WHERE id = ?').run(user.id);
          fail++;
        } else fail++;
      } catch { fail++; }
    }
    return NextResponse.json({ success: true, sent: success, failed: fail });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send pushes' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/push/send/route.ts && git commit -m "feat(push): add cron send API endpoint"
```

---

## Task 6: PushPermissionModal Component

**Files:**
- Create: `src/components/PushPermissionModal.tsx`

- [ ] **Step 1: Create PushPermissionModal**

```typescript
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
    } catch (e: any) { setError(e.message || '订阅失败'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl p-6 text-center animate-scale-in"
        style={{ background: 'linear-gradient(180deg, #1a1525 0%, #2d1f3d 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
          <span className="text-3xl">🔔</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">开启每日推送</h3>
        <p className="text-sm text-gray-400 mb-4">每天准时收到今日运势提醒，不错过任何精彩内容</p>
        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-full text-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>稍后再说</button>
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
  return new Uint8Array(Buffer.from(base64, 'base64'));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PushPermissionModal.tsx && git commit -m "feat(push): add push permission modal"
```

---

## Task 7: Profile Page Push Settings

**Files:**
- Modify: `src/app/profile/page.tsx` - Add push settings UI

- [ ] **Step 1: Add push state and settings UI**

Add to state section:
```typescript
const [pushEnabled, setPushEnabled] = useState(false);
const [pushTime, setPushTime] = useState('08:00');
```

Add after the Settings section (after the privacy toggle, before Logout):
```typescript
{/* Push Settings */}
<div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
      <span className="text-amber-500">🔔</span>
    </div>
    <div>
      <p className="text-white text-sm font-medium">每日运势提醒</p>
      <p className="text-gray-400 text-xs">{pushEnabled ? `每天 ${pushTime} 推送` : '已关闭'}</p>
    </div>
  </div>
  <Toggle checked={pushEnabled} onChange={(val) => {
    setPushEnabled(val);
    if (!val) {
      fetch('/api/push/unsubscribe', { method: 'DELETE' });
    }
  }} />
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/profile/page.tsx && git commit -m "feat(push): add push settings to profile page"
```

---

## Task 8: TodayFortuneModal Reminder Button

**Files:**
- Modify: `src/components/TodayFortuneModal.tsx` - Add reminder entry point

- [ ] **Step 1: Add reminder button at bottom of modal**

Add before the closing `</div>` at line 244 (before the final `</div>`):
```tsx
<div className="mx-6 mb-4 p-3 rounded-lg text-center cursor-pointer"
  style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}
  onClick={() => { onClose(); document.getElementById('push-modal-trigger')?.click(); }}>
  <span style={{ color: 'var(--color-accent)' }}>🔔 开启每日推送提醒</span>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TodayFortuneModal.tsx && git commit -m "feat(push): add reminder button to TodayFortuneModal"
```

---

## Verification

1. Run `npm run dev`
2. Visit profile page, verify push toggle appears
3. Click toggle, verify browser permission prompt
4. Check browser DevTools > Application > Service Workers
5. Run `npm run build` - should pass without errors

# 游戏化系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 实现签到积分、徽章体系，通过每日签到激励用户回访

**架构:** SQLite数据库扩展 + Next.js API Routes + React组件。签到状态存储在checkins表，用户积分/连续天数/徽章存储在users表扩展字段。

**技术栈:** Next.js API Routes, better-sqlite3, React useState/useEffect

---

## 文件结构

- 创建: `src/app/api/gamification/checkin/route.ts` - POST签到API
- 创建: `src/app/api/gamification/status/route.ts` - GET状态API
- 创建: `src/components/CheckinCard.tsx` - 签到卡片组件
- 创建: `src/components/CheckinSuccessModal.tsx` - 签到成功弹窗
- 创建: `src/components/BadgeWall.tsx` - 徽章墙组件
- 修改: `src/lib/db.ts` - 数据库迁移
- 修改: `src/app/profile/page.tsx` - 集成签到组件

---

## 任务分解

### Task 1: 数据库迁移

**文件:**
- 修改: `src/lib/db.ts` - 添加users表字段和checkins表

**步骤:**
- [ ] **Step 1: 添加数据库迁移代码**

在 `src/lib/db.ts` 的 `initDb` 函数中添加:

```typescript
// 添加 gamification 相关字段到 users 表
db.exec(`
  ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;
  ALTER TABLE users ADD COLUMN currentStreak INTEGER DEFAULT 0;
  ALTER TABLE users ADD COLUMN longestStreak INTEGER DEFAULT 0;
  ALTER TABLE users ADD COLUMN badges TEXT DEFAULT '[]';
`);

// 创建 checkins 表
db.exec(`
  CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    checkinDate TEXT NOT NULL,
    points INTEGER DEFAULT 5,
    createdAt TEXT NOT NULL,
    UNIQUE(userId, checkinDate)
  );
`);
```

- [ ] **Step 2: 运行测试验证数据库初始化**

```bash
npm run build
```

预期: 编译成功，无错误

- [ ] **Step 3: 提交**

```bash
git add src/lib/db.ts
git commit -m "feat(gamification): add database migration for points, streaks, badges"
```

---

### Task 2: POST /api/gamification/checkin API

**文件:**
- 创建: `src/app/api/gamification/checkin/route.ts`

**步骤:**
- [ ] **Step 1: 创建API路由文件**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function POST(req: NextRequest) {
  const userId = req.cookies.get('userId')?.value;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const today = getToday();
  
  // 检查今日是否已签到
  const existing = db.prepare('SELECT * FROM checkins WHERE userId = ? AND checkinDate = ?').get(userId, today);
  if (existing) {
    return NextResponse.json({ 
      success: false, 
      message: '今日已签到',
      pointsEarned: 0,
      totalPoints: db.prepare('SELECT points FROM users WHERE id = ?').get(userId) as {points: number} | undefined,
      currentStreak: db.prepare('SELECT currentStreak FROM users WHERE id = ?').get(userId) as {currentStreak: number} | undefined
    });
  }

  // 计算连续天数
  const yesterday = getYesterday();
  const yesterdayCheckin = db.prepare('SELECT * FROM checkins WHERE userId = ? AND checkinDate = ?').get(userId, yesterday);
  
  let newStreak = 1;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (yesterdayCheckin) {
    newStreak = (user?.currentStreak || 0) + 1;
  }

  // 插入签到记录
  const checkinId = generateId();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO checkins (id, userId, checkinDate, points, createdAt) VALUES (?, ?, ?, 5, ?)').run(checkinId, userId, today, now);

  // 更新用户积分和连续天数
  const newPoints = (user?.points || 0) + 5;
  const longestStreak = Math.max(newStreak, user?.longestStreak || 0);
  db.prepare('UPDATE users SET points = ?, currentStreak = ?, longestStreak = ? WHERE id = ?').run(newPoints, newStreak, longestStreak, userId);

  // 检查新徽章
  const newBadges: string[] = [];
  const badges = JSON.parse(user?.badges || '[]');
  
  if (!badges.includes('first_checkin')) {
    badges.push('first_checkin');
    newBadges.push('初来乍到');
  }
  if (newStreak >= 7 && !badges.includes('streak_7')) {
    badges.push('streak_7');
    newBadges.push('坚持7天');
  }
  if (newStreak >= 30 && !badges.includes('streak_30')) {
    badges.push('streak_30');
    newBadges.push('恒心30天');
  }
  if (newPoints >= 100 && !badges.includes('points_100')) {
    badges.push('points_100');
    newBadges.push('资深命理师');
  }

  if (newBadges.length > 0) {
    db.prepare('UPDATE users SET badges = ? WHERE id = ?').run(JSON.stringify(badges), userId);
  }

  return NextResponse.json({
    success: true,
    pointsEarned: 5,
    totalPoints: newPoints,
    currentStreak: newStreak,
    newBadges,
    unlockedFeature: newBadges.includes('恒心30天') ? '高级报告功能' : null
  });
}
```

- [ ] **Step 2: 测试签到API**

启动服务器后:
```bash
curl -X POST http://localhost:3004/api/gamification/checkin -b "userId=test-user-123"
```

预期: 返回签到成功，包含pointsEarned, totalPoints, currentStreak

- [ ] **Step 3: 提交**

```bash
git add src/app/api/gamification/checkin/route.ts
git commit -m "feat(gamification): add checkin API endpoint"
```

---

### Task 3: GET /api/gamification/status API

**文件:**
- 创建: `src/app/api/gamification/status/route.ts`

**步骤:**
- [ ] **Step 1: 创建状态查询API**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function getToday() {
  return new Date().toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  const userId = req.cookies.get('userId')?.value;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const today = getToday();
  const todayCheckedIn = !!db.prepare('SELECT * FROM checkins WHERE userId = ? AND checkinDate = ?').get(userId, today);

  const badges = JSON.parse(user.badges || '[]');
  const badgeDetails = badges.map((id: string) => {
    const badgeMap: Record<string, {name: string, icon: string}> = {
      'first_checkin': { name: '初来乍到', icon: '🌱' },
      'streak_7': { name: '坚持7天', icon: '🔥' },
      'streak_30': { name: '恒心30天', icon: '💎' },
      'points_100': { name: '资深命理师', icon: '⭐' },
    };
    return {
      id,
      ...badgeMap[id],
      earnedAt: today // 简化，实际应存储earnedAt字段
    };
  });

  return NextResponse.json({
    points: user.points || 0,
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
    badges: badgeDetails,
    todayCheckedIn,
    canUnlockPremium: (user.points || 0) >= 100
  });
}
```

- [ ] **Step 2: 测试状态API**

```bash
curl http://localhost:3004/api/gamification/status -b "userId=test-user-123"
```

预期: 返回points, currentStreak, longestStreak, badges, todayCheckedIn

- [ ] **Step 3: 提交**

```bash
git add src/app/api/gamification/status/route.ts
git commit -m "feat(gamification): add status API endpoint"
```

---

### Task 4: CheckinCard 组件

**文件:**
- 创建: `src/components/CheckinCard.tsx`

**步骤:**
- [ ] **Step 1: 创建签到卡片组件**

```tsx
'use client';
import { useState, useEffect } from 'react';
import CheckinSuccessModal from './CheckinSuccessModal';

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt?: string;
}

interface CheckinStatus {
  points: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  todayCheckedIn: boolean;
  canUnlockPremium: boolean;
}

export default function CheckinCard() {
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{pointsEarned: number, newBadges: string[]} | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/gamification/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch checkin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (checkingIn || status?.todayCheckedIn) return;
    setCheckingIn(true);
    
    try {
      const res = await fetch('/api/gamification/checkin', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSuccessData({ pointsEarned: data.pointsEarned, newBadges: data.newBadges || [] });
          setShowSuccess(true);
          fetchStatus();
        }
      }
    } catch (error) {
      console.error('Checkin failed:', error);
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-white/5 rounded-2xl" />;
  }

  return (
    <>
      <div className="rounded-2xl p-5 bg-gradient-to-br from-[#2d1f3d] to-[#1a1525] border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-2xl">
            🎯
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">每日签到</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              连续签到 {status?.currentStreak || 0} 天
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-white">{status?.points || 0}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>累计积分</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white">{status?.longestStreak || 0} 天</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>最长连续</p>
          </div>
        </div>

        <button
          onClick={handleCheckin}
          disabled={checkingIn || status?.todayCheckedIn}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            status?.todayCheckedIn
              ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {status?.todayCheckedIn ? '今日已签到 ✓' : checkingIn ? '签到中...' : '签到 +5 分'}
        </button>

        {status?.badges && status.badges.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>已获得徽章:</p>
            <div className="flex gap-2 flex-wrap">
              {status.badges.map(badge => (
                <span key={badge.id} className="text-xl" title={badge.name}>{badge.icon}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {showSuccess && successData && (
        <CheckinSuccessModal
          open={showSuccess}
          onClose={() => setShowSuccess(false)}
          pointsEarned={successData.pointsEarned}
          newBadges={successData.newBadges}
          currentStreak={status?.currentStreak || 0}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: 测试组件渲染**

启动开发服务器，访问个人中心页面，确认签到卡片正确显示

- [ ] **Step 3: 提交**

```bash
git add src/components/CheckinCard.tsx
git commit -m "feat(gamification): add CheckinCard component"
```

---

### Task 5: CheckinSuccessModal 组件

**文件:**
- 创建: `src/components/CheckinSuccessModal.tsx`

**步骤:**
- [ ] **Step 1: 创建签到成功弹窗组件**

```tsx
'use client';

interface CheckinSuccessModalProps {
  open: boolean;
  onClose: () => void;
  pointsEarned: number;
  newBadges: string[];
  currentStreak: number;
}

const BADGE_MAP: Record<string, {name: string, icon: string}> = {
  '初来乍到': { name: '初来乍到', icon: '🌱' },
  '坚持7天': { name: '坚持7天', icon: '🔥' },
  '恒心30天': { name: '恒心30天', icon: '💎' },
  '资深命理师': { name: '资深命理师', icon: '⭐' },
};

export default function CheckinSuccessModal({
  open,
  onClose,
  pointsEarned,
  newBadges,
  currentStreak,
}: CheckinSuccessModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      onClick={onClose}
      style={{ background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="mx-4 rounded-2xl p-8 text-center max-w-sm w-full"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #1a1525 0%, #2d1f3d 100%)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        }}
      >
        <div className="text-6xl mb-4">🎉</div>
        
        <h3 className="text-2xl font-bold text-white mb-2">签到成功！</h3>
        
        <p className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
          +{pointsEarned} 积分
        </p>
        
        <p className="text-white/80 mb-6">
          连续签到 <span className="font-bold">{currentStreak}</span> 天
        </p>

        {newBadges.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>🏅 获得新徽章</p>
            <div className="flex justify-center gap-3">
              {newBadges.map(badgeName => {
                const badge = BADGE_MAP[badgeName];
                return badge ? (
                  <div key={badgeName} className="text-center">
                    <span className="text-3xl">{badge.icon}</span>
                    <p className="text-xs text-white/80 mt-1">{badge.name}</p>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          太棒了
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 测试弹窗显示**

在签到卡片点击签到按钮，确认弹窗正确显示

- [ ] **Step 3: 提交**

```bash
git add src/components/CheckinSuccessModal.tsx
git commit -m "feat(gamification): add CheckinSuccessModal component"
```

---

### Task 6: BadgeWall 组件

**文件:**
- 创建: `src/components/BadgeWall.tsx`

**步骤:**
- [ ] **Step 1: 创建徽章墙组件**

```tsx
'use client';
import { useState, useEffect } from 'react';

interface Badge {
  id: string;
  name: string;
  icon: string;
  earnedAt?: string;
}

interface CheckinStatus {
  badges: Badge[];
  points: number;
}

const ALL_BADGES = [
  { id: 'first_checkin', name: '初来乍到', icon: '🌱', desc: '完成首次签到', condition: '首次签到' },
  { id: 'streak_7', name: '坚持7天', icon: '🔥', desc: '连续签到7天', condition: '连续7天签到' },
  { id: 'streak_30', name: '恒心30天', icon: '💎', desc: '连续签到30天', condition: '连续30天签到' },
  { id: 'points_100', name: '资深命理师', icon: '⭐', desc: '累计100积分', condition: '累计100积分' },
];

export default function BadgeWall() {
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gamification/status')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse h-48 bg-white/5 rounded-2xl" />;
  }

  const earnedBadgeIds = status?.badges?.map(b => b.id) || [];
  const totalPoints = status?.points || 0;

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-[#2d1f3d] to-[#1a1525] border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xl">
          🏆
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">我的徽章</h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>收集全部徽章解锁特殊称号</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ALL_BADGES.map(badge => {
          const earned = earnedBadgeIds.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`p-3 rounded-xl border text-center transition-all ${
                earned
                  ? 'bg-white/10 border-[var(--color-primary)]/30'
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}
            >
              <div className="text-3xl mb-1">{earned ? badge.icon : '🔒'}</div>
              <p className={`text-sm font-medium ${earned ? 'text-white' : 'text-gray-400'}`}>
                {earned ? badge.name : badge.condition}
              </p>
              {earned && badge.earnedAt && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {badge.earnedAt}
                </p>
              )}
              {!earned && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {badge.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 测试徽章墙显示**

访问个人中心，确认徽章墙正确显示所有徽章（已获得和未获得）

- [ ] **Step 3: 提交**

```bash
git add src/components/BadgeWall.tsx
git commit -m "feat(gamification): add BadgeWall component"
```

---

### Task 7: Profile 页面集成

**文件:**
- 修改: `src/app/profile/page.tsx`

**步骤:**
- [ ] **Step 1: 添加签到卡片和徽章墙到Profile页面**

在Profile页面中导入并使用签到组件:

```tsx
import CheckinCard from '@/components/CheckinCard';
import BadgeWall from '@/components/BadgeWall';
```

在Profile页面的"积分余额"区块下方添加:

```tsx
<div className="space-y-4">
  <CheckinCard />
  <BadgeWall />
</div>
```

- [ ] **Step 2: 验证集成**

1. 启动 `npm run dev`
2. 访问个人中心页面
3. 确认签到卡片和徽章墙正确显示
4. 测试签到功能
5. 确认徽章解锁后徽章墙更新

- [ ] **Step 3: 提交**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(gamification): integrate CheckinCard and BadgeWall into profile page"
```

---

## 验证清单

- [ ] 数据库迁移成功运行
- [ ] 签到API返回正确数据
- [ ] 状态API返回正确数据
- [ ] 签到卡片正确显示当前状态
- [ ] 签到成功弹窗正确显示
- [ ] 徽章墙正确显示所有徽章
- [ ] 连续签到天数正确计算
- [ ] 徽章正确解锁
- [ ] `npm run build` 成功

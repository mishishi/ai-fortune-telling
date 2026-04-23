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

const ALL_BADGES: Array<{
  id: string;
  name: string;
  icon: string;
  desc: string;
  condition: string;
  earnedAt?: string;
}> = [
  { id: 'first_checkin', name: '初来乍到', icon: '🌱', desc: '完成首次签到', condition: '首次签到' },
  { id: 'streak_7', name: '坚持7天', icon: '🔥', desc: '连续签到7天', condition: '连续7天签到' },
  { id: 'streak_30', name: '恒心30天', icon: '💎', desc: '连续签到30天', condition: '连续30天签到' },
  { id: 'points_100', name: '资深命理师', icon: '⭐', desc: '累计100积分', condition: '累计100积分' },
];

export default function BadgeWall() {
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    fetch('/api/gamification/status')
      .then(res => {
        if (res.status === 401) {
          setLoading(false);
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then(data => {
        if (data) setStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();

    // Listen for checkin updates from CheckinCard
    const handleCheckinUpdate = () => fetchStatus();
    window.addEventListener('storage', handleCheckinUpdate);

    // Also listen for custom event (same tab)
    const handler = () => fetchStatus();
    window.addEventListener('checkinUpdated', handler);

    return () => {
      window.removeEventListener('storage', handleCheckinUpdate);
      window.removeEventListener('checkinUpdated', handler);
    };
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

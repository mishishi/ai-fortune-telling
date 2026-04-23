'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skeleton } from './Skeleton';
import { Button } from './ui/Button';
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

interface CheckinResponse {
  success: boolean;
  pointsEarned: number;
  totalPoints: number;
  currentStreak: number;
  newBadges: string[];
  unlockedFeature?: string | null;
}

export default function CheckinCard() {
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [checkinResult, setCheckinResult] = useState<CheckinResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/gamification/status');
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '获取签到状态失败');
      }
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取签到状态失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleCheckin = async () => {
    if (status?.todayCheckedIn || checkingIn) return;

    try {
      setCheckingIn(true);
      setError(null);
      const res = await fetch('/api/gamification/checkin', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '签到失败');
      }

      const data: CheckinResponse = await res.json();
      setCheckinResult(data);
      setShowSuccessModal(true);

      // Refresh status after successful checkin
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : '签到失败');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCheckinResult(null);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(180deg, #2d1f3d 0%, #1a1525 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton variant="circular" className="w-8 h-8" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="w-12 h-12" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-12 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !status) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(180deg, #2d1f3d 0%, #1a1525 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="text-center py-4">
          <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchStatus} className="mt-2">
            重试
          </Button>
        </div>
      </div>
    );
  }

  if (!status) return null;

  return (
    <>
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(180deg, #2d1f3d 0%, #1a1525 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
            每日签到
          </h2>
          {/* Target icon */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(212, 175, 55, 0.2)' }}
          >
            <span className="text-sm">🎯</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(231, 76, 60, 0.2)' }}
          >
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              连续签到
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {status.currentStreak}
              <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                天
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Total Points */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              总积分
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
              {status.points}
            </div>
          </div>

          {/* Longest Streak */}
          <div
            className="rounded-xl p-4"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              最长连续
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--color-secondary)' }}>
              {status.longestStreak}
              <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                天
              </span>
            </div>
          </div>
        </div>

        {/* Check-in Button */}
        <Button
          onClick={handleCheckin}
          disabled={status.todayCheckedIn || checkingIn}
          className="w-full"
          size="lg"
          variant={status.todayCheckedIn ? 'secondary' : 'primary'}
        >
          {checkingIn ? (
            '签到中...'
          ) : status.todayCheckedIn ? (
            <>
              <span className="mr-2">✓</span>
              今日已签到
            </>
          ) : (
            <>
              <span className="mr-2">+5</span>
              签到 +5 分
            </>
          )}
        </Button>

        {/* Error message */}
        {error && status && (
          <div className="mt-3 text-center">
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
          </div>
        )}

        {/* Badges Section */}
        {status.badges.length > 0 && (
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
              已获得徽章
            </div>
            <div className="flex flex-wrap gap-2">
              {status.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  title={badge.name}
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {checkinResult && (
        <CheckinSuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          pointsEarned={checkinResult.pointsEarned}
          newBadges={checkinResult.newBadges}
          totalPoints={checkinResult.totalPoints}
          currentStreak={checkinResult.currentStreak}
          unlockedFeature={checkinResult.unlockedFeature}
        />
      )}
    </>
  );
}

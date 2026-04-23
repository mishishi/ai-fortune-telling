'use client';

import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface CheckinSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointsEarned: number;
  newBadges: string[];
  totalPoints: number;
  currentStreak: number;
  unlockedFeature?: string | null;
}

export default function CheckinSuccessModal({
  isOpen,
  onClose,
  pointsEarned,
  newBadges,
  totalPoints,
  currentStreak,
  unlockedFeature,
}: CheckinSuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center py-4">
        {/* Success Icon */}
        <div
          className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(46, 204, 113, 0.2)' }}
        >
          <span className="text-4xl">🎉</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          签到成功
        </h3>

        {/* Points Earned */}
        <div className="mb-6">
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl"
            style={{ background: 'rgba(212, 175, 55, 0.2)' }}
          >
            <span className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              +{pointsEarned}
            </span>
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              积分
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            className="rounded-xl p-3"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              总积分
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
              {totalPoints}
            </div>
          </div>
          <div
            className="rounded-xl p-3"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              连续签到
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--color-secondary)' }}>
              {currentStreak}天
            </div>
          </div>
        </div>

        {/* New Badges */}
        {newBadges.length > 0 && (
          <div className="mb-6">
            <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
              新获得徽章
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {newBadges.map((badgeName, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{ background: 'rgba(212, 175, 55, 0.2)' }}
                >
                  <span className="text-sm">🏆</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                    {badgeName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unlocked Feature */}
        {unlockedFeature && (
          <div
            className="mb-6 p-4 rounded-xl"
            style={{
              background: 'rgba(46, 204, 113, 0.1)',
              border: '1px solid rgba(46, 204, 113, 0.3)',
            }}
          >
            <div className="text-xs mb-2" style={{ color: '#2ecc71' }}>
              功能解锁
            </div>
            <div className="text-sm font-medium" style={{ color: '#2ecc71' }}>
              {unlockedFeature}
            </div>
          </div>
        )}

        {/* Close Button */}
        <Button variant="primary" onClick={onClose} className="w-full">
          太棒了
        </Button>
      </div>
    </Modal>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';

interface Milestone {
  id: string;
  name: string;
  icon: string;
  description: string;
  days: number;
  rewardType: string;
  rewardAmount: number;
  isCompleted: boolean;
  isNewlyCompleted: boolean;
  daysRemaining: number;
  progress: number;
}

interface MilestoneData {
  currentStreak: number;
  streakRepairCards: number;
  milestones: Milestone[];
  nextMilestone: {
    name: string;
    daysRemaining: number;
    rewardDescription: string;
  } | null;
}

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MilestoneModal({ isOpen, onClose }: MilestoneModalProps) {
  const [data, setData] = useState<MilestoneData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchMilestones();
    }
  }, [isOpen]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gamification/milestones');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch milestones:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="里程碑奖励">
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse rounded-xl p-4 bg-white/5 h-24" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* Current streak and repair cards summary */}
            <div className="flex gap-4">
              <div className="flex-1 rounded-xl p-4 bg-gradient-to-br from-[#2d1f3d] to-[#1a1525] border border-white/10">
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  当前连续签到
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {data.currentStreak}
                  <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    天
                  </span>
                </div>
              </div>
              <div className="flex-1 rounded-xl p-4 bg-gradient-to-br from-[#2d1f3d] to-[#1a1525] border border-white/10">
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  补签卡
                </div>
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {data.streakRepairCards}
                  <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    张
                  </span>
                </div>
              </div>
            </div>

            {/* Next milestone hint */}
            {data.nextMilestone && (
              <div className="rounded-xl p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  距离下一个里程碑
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                  再签到 {data.nextMilestone.daysRemaining} 天
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  奖励: {data.nextMilestone.rewardDescription}
                </div>
              </div>
            )}

            {/* Milestone cards */}
            <div className="space-y-3">
              {data.milestones.map(milestone => (
                <div
                  key={milestone.id}
                  className={`rounded-xl p-4 border transition-all ${
                    milestone.isCompleted
                      ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                      : 'bg-white/5 border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        milestone.isCompleted
                          ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                          : 'bg-white/10'
                      }`}
                    >
                      {milestone.isCompleted ? '✓' : milestone.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            milestone.isCompleted ? 'text-white' : 'text-gray-400'
                          }`}
                        >
                          {milestone.name}
                        </span>
                        {milestone.isNewlyCompleted && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {milestone.description}
                      </div>

                      {/* Progress bar for incomplete milestones */}
                      {!milestone.isCompleted && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span style={{ color: 'var(--color-text-muted)' }}>
                              {milestone.daysRemaining} 天后解锁
                            </span>
                            <span style={{ color: 'var(--color-text-muted)' }}>
                              {milestone.progress}%
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Completed indicator */}
                      {milestone.isCompleted && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-400">
                          <span>✓</span>
                          <span>已达成</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            加载失败，请重试
          </div>
        )}
      </div>
    </Modal>
  );
}

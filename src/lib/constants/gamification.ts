// Milestone definitions for gamification
export const MILESTONES = [
  {
    id: 'milestone_7',
    name: '7天连续签到',
    icon: '🎫',
    description: '补签卡 x1',
    days: 7,
    rewardType: 'repairCard',
    rewardAmount: 1,
  },
  {
    id: 'milestone_30',
    name: '30天连续签到',
    icon: '📜',
    description: '高级报告解锁券 x1',
    days: 30,
    rewardType: 'premiumCoupon',
    rewardAmount: 1,
  },
];

// Badge definitions
export const BADGE_DEFINITIONS = {
  first_checkin: { id: 'first_checkin', name: '初来乍到', icon: '🌱' },
  streak_7: { id: 'streak_7', name: '坚持7天', icon: '🔥' },
  streak_30: { id: 'streak_30', name: '高级报告功能', icon: '💎' },
  points_100: { id: 'points_100', name: '资深命理师', icon: '⭐' },
};

// Constants
export const CHECKIN_POINTS = 5;
export const MAX_STREAK_LOOKBACK_DAYS = 365;

// 补签提醒阈值
export const STREAK_WARNING_THRESHOLD = 3;  // 连续3天以上才发送提醒
export const STREAK_REPAIR_WINDOW_DAYS = 1; // 漏签后1天内可修复
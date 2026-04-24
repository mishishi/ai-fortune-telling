import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { STREAK_WARNING_THRESHOLD } from '@/lib/constants/gamification';

function getDateStr(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  // 验证 CRON_SECRET
  const authHeader = request.headers.get('authorization') ?? '';
  const token = `Bearer ${process.env.CRON_SECRET}`;
  if (authHeader !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const today = getDateStr();
  const yesterday = getDateStr(1);
  const dayBeforeYesterday = getDateStr(2);

  // 获取所有连续签到 >= 3 天的用户
  const users = db.prepare(`
    SELECT id, currentStreak, streakRepairCards
    FROM users
    WHERE currentStreak >= ?
  `).all(STREAK_WARNING_THRESHOLD) as { id: string; currentStreak: number; streakRepairCards: number }[];

  const warnings: { userId: string; currentStreak: number; type: 'streak_warning' }[] = [];
  const broken: { userId: string; currentStreak: number; hasRepairCard: boolean; type: 'streak_broken' }[] = [];

  for (const user of users) {
    // 获取用户最近2次签到记录
    const recentCheckins = db.prepare(`
      SELECT checkinDate
      FROM checkins
      WHERE userId = ?
      ORDER BY checkinDate DESC
      LIMIT 2
    `).all(user.id) as { checkinDate: string }[];

    if (recentCheckins.length === 0) continue;

    const lastCheckinDate = recentCheckins[0].checkinDate;

    // 场景1: streak_warning - 连续签到中，今天已签到，提醒明天别断
    if (lastCheckinDate === today && user.currentStreak >= STREAK_WARNING_THRESHOLD) {
      warnings.push({
        userId: user.id,
        currentStreak: user.currentStreak,
        type: 'streak_warning',
      });
    }

    // 场景2: streak_broken - 昨天没签到，今天也没签（昨天断了）且有补签卡
    if (lastCheckinDate === dayBeforeYesterday && user.streakRepairCards > 0) {
      // 检查今天是否已签到（已签到就不是broken状态）
      const checkedInToday = recentCheckins.some(c => c.checkinDate === today);
      if (!checkedInToday) {
        broken.push({
          userId: user.id,
          currentStreak: user.currentStreak,
          hasRepairCard: true,
          type: 'streak_broken',
        });
      }
    }
  }

  return NextResponse.json({ warnings, broken });
}

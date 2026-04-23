import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { MILESTONES } from '@/lib/constants/gamification';

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('fortune_user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const db = getDb();

  // Get user data
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  const currentStreak = user.currentStreak || 0;
  const streakRepairCards = user.streakRepairCards || 0;

  // Parse user badges to determine which milestones are completed
  let userBadges: string[] = [];
  try {
    userBadges = JSON.parse(user.badges || '[]');
  } catch {
    userBadges = [];
  }

  // Build milestone status
  const milestones = MILESTONES.map(milestone => {
    const isCompleted = currentStreak >= milestone.days;
    // Note: isNewlyCompleted is set to false since we don't track session-based milestone completion
    // The CheckinSuccessModal already celebrates newly earned rewards when they happen
    const isNewlyCompleted = false;
    const daysRemaining = isCompleted ? 0 : milestone.days - currentStreak;

    return {
      ...milestone,
      isCompleted,
      isNewlyCompleted,
      daysRemaining,
      progress: Math.min(100, Math.round((currentStreak / milestone.days) * 100)),
    };
  });

  // Find the next upcoming milestone
  const nextMilestone = milestones.find(m => !m.isCompleted);

  return NextResponse.json({
    currentStreak,
    streakRepairCards,
    milestones,
    nextMilestone: nextMilestone
      ? {
          name: nextMilestone.name,
          daysRemaining: nextMilestone.daysRemaining,
          rewardDescription: nextMilestone.description,
        }
      : null,
  });
}

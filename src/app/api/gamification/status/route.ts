import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { BADGE_DEFINITIONS } from '@/lib/constants/gamification';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function GET(request: NextRequest) {
  // 1. Check if user is authenticated via cookie
  const userId = request.cookies.get('fortune_user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const db = getDb();

  // 2. Get user data
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  // 3. Check if user checked in today
  const today = getTodayDate();
  const todayCheckin = db.prepare(
    'SELECT * FROM checkins WHERE userId = ? AND checkinDate = ?'
  ).get(userId, today);

  // 4. Parse badges and convert to badge detail objects
  let userBadgeIds: string[] = [];
  try {
    userBadgeIds = JSON.parse(user.badges || '[]');
  } catch {
    userBadgeIds = [];
  }

  const badges = userBadgeIds
    .filter((badgeId: string) => BADGE_DEFINITIONS[badgeId as keyof typeof BADGE_DEFINITIONS])
    .map((badgeId: string) => ({
      ...BADGE_DEFINITIONS[badgeId as keyof typeof BADGE_DEFINITIONS],
      earnedAt: null, // earnedAt not stored in database
    }));

  // 5. Calculate canUnlockPremium (true if streak >= 30)
  const canUnlockPremium = (user.currentStreak || 0) >= 30;

  // 6. Return status response
  return NextResponse.json({
    points: user.points || 0,
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
    badges,
    todayCheckedIn: !!todayCheckin,
    canUnlockPremium,
  });
}
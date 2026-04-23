import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Badge definitions
const BADGE_DEFINITIONS: Record<string, { id: string; name: string; icon: string }> = {
  first_checkin: { id: 'first_checkin', name: '初来乍到', icon: '🌱' },
  streak_7: { id: 'streak_7', name: '坚持7天', icon: '🔥' },
  streak_30: { id: 'streak_30', name: '恒心30天', icon: '💎' },
  points_100: { id: 'points_100', name: '资深命理师', icon: '⭐' },
};

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
    .filter((badgeId: string) => BADGE_DEFINITIONS[badgeId])
    .map((badgeId: string) => ({
      ...BADGE_DEFINITIONS[badgeId],
      earnedAt: null, // earnedAt not stored in database
    }));

  // 5. Calculate canUnlockPremium (true if points >= 100)
  const canUnlockPremium = (user.points || 0) >= 100;

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
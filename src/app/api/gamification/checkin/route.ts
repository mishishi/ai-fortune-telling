import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const CHECKIN_POINTS = 5;

// Badge definitions
const BADGE_DEFINITIONS = {
  first_checkin: { id: 'first_checkin', name: '初来乍到', icon: '🌱' },
  streak_7: { id: 'streak_7', name: '坚持7天', icon: '🔥' },
  streak_30: { id: 'streak_30', name: '高级报告功能', icon: '💎' },
  points_100: { id: 'points_100', name: '资深命理师', icon: '⭐' },
};

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  // 1. Check if user is authenticated via cookie
  const userId = request.cookies.get('fortune_user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const db = getDb();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  // 2. Check if already checked in today (prevent duplicate)
  const existingCheckin = db.prepare(
    'SELECT * FROM checkins WHERE userId = ? AND checkinDate = ?'
  ).get(userId, today);

  if (existingCheckin) {
    return NextResponse.json({ error: '今日已签到' }, { status: 400 });
  }

  // Get user data
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  // 3. Calculate streak: if yesterday checked in, increment streak; otherwise reset to 1
  const yesterdayCheckin = db.prepare(
    'SELECT * FROM checkins WHERE userId = ? AND checkinDate = ?'
  ).get(userId, yesterday);

  const currentStreak = yesterdayCheckin ? (user.currentStreak || 0) + 1 : 1;
  const totalPoints = (user.points || 0) + CHECKIN_POINTS;
  const longestStreak = Math.max(user.longestStreak || 0, currentStreak);

  // Parse existing badges
  let userBadges: string[] = [];
  try {
    userBadges = JSON.parse(user.badges || '[]');
  } catch {
    userBadges = [];
  }

  // 4. Insert checkin record, update user points/streak, and update badges in a transaction
  const checkinId = generateId();
  const now = new Date().toISOString();

  const newBadges: { id: string; name: string; icon: string }[] = db.transaction(() => {
    // Insert checkin record
    db.prepare(
      'INSERT INTO checkins (id, userId, checkinDate, points, createdAt) VALUES (?, ?, ?, ?, ?)'
    ).run(checkinId, userId, today, CHECKIN_POINTS, now);

    // Update user's total points and streak counters
    db.prepare(
      'UPDATE users SET points = ?, currentStreak = ?, longestStreak = ? WHERE id = ?'
    ).run(totalPoints, currentStreak, longestStreak, userId);

    // Check for new badges
    const earnedBadges: { id: string; name: string; icon: string }[] = [];

    // first_checkin: any checkin
    if (!userBadges.includes('first_checkin')) {
      userBadges.push('first_checkin');
      earnedBadges.push(BADGE_DEFINITIONS.first_checkin);
    }

    // streak_7: 7+ days streak
    if (currentStreak >= 7 && !userBadges.includes('streak_7')) {
      userBadges.push('streak_7');
      earnedBadges.push(BADGE_DEFINITIONS.streak_7);
    }

    // streak_30: 30+ days streak
    if (currentStreak >= 30 && !userBadges.includes('streak_30')) {
      userBadges.push('streak_30');
      earnedBadges.push(BADGE_DEFINITIONS.streak_30);
    }

    // points_100: 100+ total points
    if (totalPoints >= 100 && !userBadges.includes('points_100')) {
      userBadges.push('points_100');
      earnedBadges.push(BADGE_DEFINITIONS.points_100);
    }

    // Update badges in database if new badges were earned
    if (earnedBadges.length > 0) {
      db.prepare('UPDATE users SET badges = ? WHERE id = ?').run(
        JSON.stringify(userBadges),
        userId
      );
    }

    return earnedBadges;
  })();

  // Check for unlocked feature based on streak_30
  let unlockedFeature: string | null = null;
  if (currentStreak >= 30 && userBadges.includes('streak_30')) {
    unlockedFeature = '高级报告功能';
  }

  // 7. Return success response
  return NextResponse.json({
    success: true,
    pointsEarned: CHECKIN_POINTS,
    totalPoints,
    currentStreak,
    newBadges: newBadges.map(b => b.name),
    unlockedFeature,
  });
}

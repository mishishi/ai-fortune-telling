import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { MILESTONES, BADGE_DEFINITIONS, CHECKIN_POINTS, MAX_STREAK_LOOKBACK_DAYS } from '@/lib/constants/gamification';

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

function getDateNDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0];
}

// POST: regular checkin
export async function POST(request: NextRequest) {
  const userId = request.cookies.get('fortune_user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const db = getDb();
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  // Check if already checked in today
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

  // Calculate streak: if yesterday checked in, increment streak; otherwise reset to 1
  const yesterdayCheckin = db.prepare(
    'SELECT * FROM checkins WHERE userId = ? AND checkinDate = ?'
  ).get(userId, yesterday);

  const currentStreak = yesterdayCheckin ? (user.currentStreak || 0) + 1 : 1;
  const totalPoints = (user.points || 0) + CHECKIN_POINTS;
  const longestStreak = Math.max(user.longestStreak || 0, currentStreak);

  // Parse existing badges and milestones
  let userBadges: string[] = [];
  let earnedMilestones: string[] = [];
  try {
    userBadges = JSON.parse(user.badges || '[]');
  } catch {
    userBadges = [];
  }

  // Check for milestone rewards
  const newRewards: { type: string; amount: number; milestoneName: string }[] = [];
  let streakRepairCards = user.streakRepairCards || 0;

  for (const milestone of MILESTONES) {
    const milestoneKey = milestone.id;
    if (currentStreak >= milestone.days && !userBadges.includes(milestoneKey)) {
      userBadges.push(milestoneKey);
      if (milestone.rewardType === 'repairCard') {
        streakRepairCards += milestone.rewardAmount;
        newRewards.push({
          type: 'repairCard',
          amount: milestone.rewardAmount,
          milestoneName: milestone.name,
        });
      }
    }
  }

  // Check for new badges
  let newBadges: { id: string; name: string; icon: string }[] = [];

  // first_checkin: any checkin
  if (!userBadges.includes('first_checkin')) {
    userBadges.push('first_checkin');
    newBadges.push(BADGE_DEFINITIONS.first_checkin);
  }

  // streak_7: 7+ days streak
  if (currentStreak >= 7 && !userBadges.includes('streak_7')) {
    userBadges.push('streak_7');
    newBadges.push(BADGE_DEFINITIONS.streak_7);
  }

  // streak_30: 30+ days streak
  if (currentStreak >= 30 && !userBadges.includes('streak_30')) {
    userBadges.push('streak_30');
    newBadges.push(BADGE_DEFINITIONS.streak_30);
  }

  // points_100: 100+ total points
  if (totalPoints >= 100 && !userBadges.includes('points_100')) {
    userBadges.push('points_100');
    newBadges.push(BADGE_DEFINITIONS.points_100);
  }

  // Insert checkin record and update user in a transaction
  const checkinId = generateId();
  const now = new Date().toISOString();

  db.transaction(() => {
    // Insert checkin record
    db.prepare(
      'INSERT INTO checkins (id, userId, checkinDate, points, isRepair, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(checkinId, userId, today, CHECKIN_POINTS, 0, now);

    // Update user points, streak, badges, and repair cards
    db.prepare(
      'UPDATE users SET points = ?, currentStreak = ?, longestStreak = ?, badges = ?, streakRepairCards = ? WHERE id = ?'
    ).run(totalPoints, currentStreak, longestStreak, JSON.stringify(userBadges), streakRepairCards, userId);
  })();

  // Check for unlocked feature based on streak_30
  let unlockedFeature: string | null = null;
  if (currentStreak >= 30 && userBadges.includes('streak_30')) {
    unlockedFeature = '高级报告功能';
  }

  return NextResponse.json({
    success: true,
    pointsEarned: CHECKIN_POINTS,
    totalPoints,
    currentStreak,
    newBadges: newBadges.map(b => b.name),
    newRewards,
    streakRepairCards,
    unlockedFeature,
  });
}

// PATCH: repair checkin (use repair card for a missed day)
export async function PATCH(request: NextRequest) {
  const userId = request.cookies.get('fortune_user_id')?.value;

  if (!userId) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  const body = await request.json();
  const { repairDate } = body; // Format: YYYY-MM-DD

  if (!repairDate) {
    return NextResponse.json({ error: '缺少补签日期' }, { status: 400 });
  }

  const db = getDb();
  const today = getTodayDate();

  // Validate repair date is not today or in the future
  if (repairDate >= today) {
    return NextResponse.json({ error: '不能补签今天或未来的日期' }, { status: 400 });
  }

  // Get user data
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  // Check if user has repair cards
  const streakRepairCards = user.streakRepairCards || 0;
  if (streakRepairCards <= 0) {
    return NextResponse.json({ error: '没有补签卡了' }, { status: 400 });
  }

  // Check if already checked in on that date (either regular or repair)
  const existingCheckin = db.prepare(
    'SELECT * FROM checkins WHERE userId = ? AND checkinDate = ?'
  ).get(userId, repairDate);

  if (existingCheckin) {
    return NextResponse.json({ error: '该日期已有签到记录' }, { status: 400 });
  }

  // Get user's current streak and checkins to determine if repair date is consecutive
  const checkins = db.prepare(
    'SELECT * FROM checkins WHERE userId = ? ORDER BY checkinDate DESC'
  ).all(userId) as any[];

  if (checkins.length === 0) {
    return NextResponse.json({ error: '无法补签：没有历史签到记录' }, { status: 400 });
  }

  // Find the checkin date just before the repair date
  const sortedCheckins = [...checkins].sort((a, b) =>
    new Date(b.checkinDate).getTime() - new Date(a.checkinDate).getTime()
  );

  // Check if repair date is adjacent to existing checkins (within 1 day gap)
  const repairDateObj = new Date(repairDate);
  const hasAdjacentCheckin = sortedCheckins.some(c => {
    const checkinDate = new Date(c.checkinDate);
    const diffDays = Math.abs(
      (repairDateObj.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays === 1;
  });

  if (!hasAdjacentCheckin) {
    return NextResponse.json({ error: '补签日期与现有签到不连续' }, { status: 400 });
  }

  // Calculate new streak after repair
  // Build a set of all checked-in dates plus the repair date
  const checkedInDates = new Set(checkins.map((c: any) => c.checkinDate));
  checkedInDates.add(repairDate);

  // Find the most recent checked-in date to start counting from
  const todayDate = new Date(today);
  const yesterdayDate = new Date(getYesterdayDate());
  const repairDateObj = new Date(repairDate);

  let startDate: Date;
  if (checkedInDates.has(today)) {
    startDate = todayDate;
  } else if (checkedInDates.has(getYesterdayDate())) {
    startDate = yesterdayDate;
  } else if (checkedInDates.has(repairDate)) {
    startDate = repairDateObj;
  } else {
    // No recent checkins, use repair date
    startDate = repairDateObj;
  }

  // Count consecutive days backwards from startDate
  let streakCount = 0;
  let checkDate = new Date(startDate);

  for (let i = 0; i < MAX_STREAK_LOOKBACK_DAYS; i++) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (checkedInDates.has(dateStr)) {
      streakCount++;
    } else {
      break;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const newStreak = Math.max(streakCount, user.currentStreak || 0);
  const longestStreak = Math.max(user.longestStreak || 0, newStreak);

  // Insert repair checkin and deduct repair card
  const checkinId = generateId();
  const now = new Date().toISOString();

  db.transaction(() => {
    // Insert repair checkin record
    db.prepare(
      'INSERT INTO checkins (id, userId, checkinDate, points, isRepair, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(checkinId, userId, repairDate, CHECKIN_POINTS, 1, now);

    // Deduct repair card and update streak
    db.prepare(
      'UPDATE users SET streakRepairCards = ?, currentStreak = ?, longestStreak = ? WHERE id = ?'
    ).run(streakRepairCards - 1, newStreak, longestStreak, userId);
  })();

  return NextResponse.json({
    success: true,
    repairDate,
    newStreak,
    remainingRepairCards: streakRepairCards - 1,
  });
}

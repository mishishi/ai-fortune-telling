import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function generateDailyContent(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  const fortunes = ['大吉', '吉', '平', '凶'];
  const tips = ['今日宜主动出击，把握机会', '今日财运平稳，谨慎投资', '今日贵人运旺，多与人交流', '今日注意调节情绪，保持平和'];
  return {
    title: `☀️ 今日运势：${fortunes[dayOfYear % 4]}`,
    body: tips[(dayOfYear + dayOfYear % 4) % 4],
  };
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = `Bearer ${process.env.CRON_SECRET}`;
  const encoder = new TextEncoder();
  const encodedHeader = encoder.encode(authHeader ?? '');
  const encodedToken = encoder.encode(token);
  const isAuthorized = encodedHeader.length === encodedToken.length &&
    crypto.subtle.timingSafeEqual(encodedHeader, encodedToken);
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();
    const users = db.prepare('SELECT id, pushSubscription FROM users WHERE pushEnabled = 1 AND pushSubscription IS NOT NULL').all() as { id: string; pushSubscription: string }[];
    const content = generateDailyContent(new Date());
    let success = 0, fail = 0;

    for (const user of users) {
      try {
        const sub = JSON.parse(user.pushSubscription);
        const res = await fetch(sub.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'TTL': '86400' },
          body: JSON.stringify({ title: content.title, body: content.body, url: '/' }),
        });
        if (res.ok) success++;
        else if (res.status === 410 || res.status === 404) {
          db.prepare('UPDATE users SET pushEnabled = 0 WHERE id = ?').run(user.id);
          fail++;
        } else fail++;
      } catch (err) {
          console.error(`Failed to send push to user ${user.id}:`, err);
          fail++;
        }
    }
    return NextResponse.json({ success: true, sent: success, failed: fail });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send pushes' }, { status: 500 });
  }
}

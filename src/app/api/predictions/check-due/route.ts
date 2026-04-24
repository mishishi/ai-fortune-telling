import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function generateVerificationReminderContent(dimension: string) {
  const dimensionNames: Record<string, string> = {
    career: '事业',
    love: '感情',
    wealth: '财富',
    health: '健康',
    mentor: '贵人',
  };
  const name = dimensionNames[dimension] || dimension;
  return {
    title: `⏰ ${name}预测待验证`,
    body: `你的${name}预测已到期，告诉我结果还准确吗？`,
  };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? '';
  const token = `Bearer ${process.env.CRON_SECRET}`;
  const isAuthorized = authHeader.length === token.length && authHeader === token;
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getDb();

    // Query pending predictions whose timeframe has ended
    const duePredictions = db.prepare(`
      SELECT p.*, u.pushSubscription, u.pushEnabled
      FROM predictions p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'pending'
        AND p.timeframe_end <= datetime('now')
        AND u.pushEnabled = 1
        AND u.pushSubscription IS NOT NULL
    `).all() as {
      id: string;
      user_id: string;
      dimension: string;
      prediction: string;
      pushSubscription: string;
    }[];

    let success = 0, fail = 0;

    for (const pred of duePredictions) {
      try {
        const content = generateVerificationReminderContent(pred.dimension);
        const sub = JSON.parse(pred.pushSubscription);

        const res = await fetch(sub.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'TTL': '86400' },
          body: JSON.stringify({ title: content.title, body: content.body, url: '/predictions' }),
        });

        if (res.ok) {
          success++;
        } else if (res.status === 410 || res.status === 404) {
          // Subscription expired, disable push
          db.prepare('UPDATE users SET pushEnabled = 0 WHERE id = ?').run(pred.user_id);
          fail++;
        } else {
          fail++;
        }
      } catch (err) {
        console.error(`Failed to send push for prediction ${pred.id}:`, err);
        fail++;
      }
    }

    return NextResponse.json({
      dueCount: duePredictions.length,
      sent: success,
      failed: fail,
    });
  } catch (error) {
    console.error('Error in check-due:', error);
    return NextResponse.json({ error: 'Failed to check due predictions' }, { status: 500 });
  }
}

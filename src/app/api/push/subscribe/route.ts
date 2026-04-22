import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('fortune_user_id')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { subscription, pushTime } = await request.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      'UPDATE users SET pushEnabled = 1, pushTime = ?, pushSubscription = ? WHERE id = ?'
    ).run(pushTime || '08:00', JSON.stringify(subscription), userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

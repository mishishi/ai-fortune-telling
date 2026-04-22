import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  const userId = request.cookies.get('fortune_user_id')?.value;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const db = getDb();
    db.prepare('UPDATE users SET pushEnabled = 0 WHERE id = ?').run(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const db = getDb();
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Simulate payment - mark report as unlocked
    db.prepare('UPDATE reports SET unlocked = 1 WHERE id = ?').run(id);

    const updatedReport = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Error unlocking report:', error);
    return NextResponse.json({ error: 'Failed to unlock report' }, { status: 500 });
  }
}

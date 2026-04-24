import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

function getUserIdFromCookie(request: NextRequest): string | null {
  // Try fortune_device_id cookie first (anonymous users)
  const deviceId = request.cookies.get('fortune_device_id')?.value;
  if (deviceId) return deviceId;

  // Try user_id cookie if exists (logged in users)
  const userId = request.cookies.get('user_id')?.value;
  if (userId) return userId;

  return null;
}

export async function GET(request: NextRequest) {
  const userId = getUserIdFromCookie(request);
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const dimension = searchParams.get('dimension');

  try {
    const db = getDb();

    let query = 'SELECT * FROM predictions WHERE user_id = ?';
    const params: (string | null)[] = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (dimension) {
      query += ' AND dimension = ?';
      params.push(dimension);
    }

    query += ' ORDER BY created_at DESC';

    const predictions = db.prepare(query).all(...params);

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json({ error: 'Failed to fetch predictions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reportId, dimension, prediction, timeframeStart } = body;

    if (!userId || !reportId || !dimension || !prediction || !timeframeStart) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate dimension
    const validDimensions = ['career', 'love', 'wealth', 'health', 'mentor'];
    if (!validDimensions.includes(dimension)) {
      return NextResponse.json({ error: 'Invalid dimension' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    // Calculate timeframe_end: timeframe_start + 3 months (default prediction window)
    const startDate = new Date(timeframeStart);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);

    const timeframeEnd = endDate.toISOString();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO predictions (id, user_id, report_id, dimension, prediction, timeframe_start, timeframe_end, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(id, userId, reportId, dimension, prediction, timeframeStart, timeframeEnd, createdAt);

    const result = db.prepare('SELECT * FROM predictions WHERE id = ?').get(id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating prediction:', error);
    return NextResponse.json({ error: 'Failed to create prediction' }, { status: 500 });
  }
}

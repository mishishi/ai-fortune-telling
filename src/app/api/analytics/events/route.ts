import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { v4 as uuid } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, eventData, url } = body;

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }

    // Get userId from cookie if available
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value || null;

    const db = getDb();
    const id = uuid();

    db.prepare(`
      INSERT INTO events (id, userId, eventType, eventData, url, userAgent, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      eventType,
      JSON.stringify(eventData || {}),
      url || null,
      request.headers.get('user-agent') || null,
      new Date().toISOString()
    );

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to track event:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getDb();

    let query = 'SELECT * FROM events';
    const params: any[] = [];

    if (eventType) {
      query += ' WHERE eventType = ?';
      params.push(eventType);
    }

    query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const events = db.prepare(query).all(...params);

    // Parse eventData JSON
    const parsedEvents = events.map((e: any) => ({
      ...e,
      eventData: JSON.parse(e.eventData || '{}'),
    }));

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM events';
    if (eventType) {
      countQuery += ' WHERE eventType = ?';
    }
    const countResult = db.prepare(countQuery).get(...(eventType ? [eventType] : [])) as { total: number };

    return NextResponse.json({
      events: parsedEvents,
      total: countResult.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

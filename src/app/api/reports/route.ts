import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const userIdParam = request.nextUrl.searchParams.get('userId');

  let userId: string;
  if (userIdParam && userIdParam !== 'anonymous') {
    userId = userIdParam;
  } else {
    // For anonymous users, use device UUID from cookie
    userId = request.cookies.get('fortune_device_id')?.value || 'anonymous';
  }

  try {
    const db = getDb();
    const reports = db.prepare('SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC').all(userId) as any[];

    // Return simplified format for list display
    const simplifiedReports = reports.map(report => {
      let radarScores = { career: 0, love: 0, wealth: 0, health: 0, mentor: 0 };
      let aiAnalysis = { overall: '' };

      try {
        radarScores = JSON.parse(report.radarScores || '{"career":0,"love":0,"wealth":0,"health":0,"mentor":0}');
      } catch (e) {}

      try {
        aiAnalysis = JSON.parse(report.aiAnalysis || '{"overall":""}');
      } catch (e) {}

      // Return all 5 dimensions for list display
      const listRadarScores = {
        career: radarScores.career,
        love: radarScores.love,
        wealth: radarScores.wealth,
        health: radarScores.health,
        mentor: radarScores.mentor,
      };

      return {
        id: report.id,
        name: report.name,
        gender: report.gender,
        birthData: report.birthData,
        unlocked: !!report.unlocked,
        createdAt: report.createdAt,
        radarScores: listRadarScores,
        summary: aiAnalysis.overall?.substring(0, 50) + (aiAnalysis.overall?.length > 50 ? '...' : '') || '',
      };
    });

    return NextResponse.json({ reports: simplifiedReports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, gender, birthData, baziData, aiAnalysis, radarScores, isFullVersion = true } = body;

    if (!userId || !name || !gender || !birthData || !baziData || !aiAnalysis || !radarScores) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO reports (id, userId, name, gender, birthData, baziData, aiAnalysis, radarScores, isFullVersion, unlocked, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(id, userId, name, gender, JSON.stringify(birthData), JSON.stringify(baziData), JSON.stringify(aiAnalysis), JSON.stringify(radarScores), isFullVersion ? 1 : 0, createdAt);

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}

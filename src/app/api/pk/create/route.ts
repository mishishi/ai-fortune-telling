import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
  }

  try {
    const db = getDb();

    // 获取用户最新报告
    const report = db.prepare(
      'SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC LIMIT 1'
    ).get(userId) as any;

    if (!report) {
      return NextResponse.json({ error: '用户暂无报告' }, { status: 404 });
    }

    const radarScores = JSON.parse(report.radarScores || '{}');
    const aiAnalysis = JSON.parse(report.aiAnalysis || '{}');

    return NextResponse.json({
      userId,
      name: report.name,
      gender: report.gender,
      birthYear: JSON.parse(report.birthData || '{}').year,
      radarScores,
      overall: aiAnalysis.overall || '',
      zodiac: report.zodiac || '',
      element: report.element || '',
      createdAt: report.createdAt,
      shareUrl: `/pk?from=${userId}`,
    });
  } catch (error) {
    console.error('Error creating PK challenge:', error);
    return NextResponse.json({ error: 'Failed to create PK challenge' }, { status: 500 });
  }
}

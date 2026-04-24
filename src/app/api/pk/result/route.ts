import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const DIMENSION_NAMES: Record<string, string> = {
  career: '事业运',
  love: '感情运',
  wealth: '财运',
  health: '健康运',
  mentor: '贵人运',
};

interface RadarScores {
  career?: number;
  love?: number;
  wealth?: number;
  health?: number;
  mentor?: number;
}

// Generate deterministic radar scores from birthdate
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

function generateRadarScoresFromBirthdate(birthdate: string, gender: string): RadarScores {
  const hash = hashCode(birthdate + gender);
  return {
    career: 60 + (Math.abs(hash) % 40),
    love: 60 + (Math.abs(hash >> 8) % 40),
    wealth: 60 + (Math.abs(hash >> 16) % 40),
    health: 60 + (Math.abs(hash >> 24) % 40),
    mentor: 60 + (Math.abs(hash >> 32) % 40),
  };
}

function calculatePKResult(a: RadarScores, b: RadarScores) {
  const dimensions = ['career', 'love', 'wealth', 'health', 'mentor'];
  let winCountA = 0, winCountB = 0;
  const winDimensionsA: string[] = [];
  const winDimensionsB: string[] = [];

  for (const dim of dimensions) {
    const scoreA = a[dim as keyof RadarScores] || 0;
    const scoreB = b[dim as keyof RadarScores] || 0;
    if (scoreA > scoreB) {
      winCountA++;
      winDimensionsA.push(dim);
    } else if (scoreB > scoreA) {
      winCountB++;
      winDimensionsB.push(dim);
    }
  }

  const winner = winCountA >= winCountB ? 'challenger' : 'opponent';
  const winDims = winner === 'challenger' ? winDimensionsA : winDimensionsB;
  const loseDims = winner === 'challenger' ? winDimensionsB : winDimensionsA;

  let summary = '';
  if (winDims.length === 5) {
    summary = winner === 'challenger' ? '全面碾压，你的运势无人能敌！' : '对方完胜，这次运气不在你这边～';
  } else if (winDims.length >= 3) {
    const bestDim = DIMENSION_NAMES[winDims[0]] || winDims[0];
    summary = winner === 'challenger' ? `你的${bestDim}领先对手！` : `对方${bestDim}领先你！`;
  } else {
    const bestDim = DIMENSION_NAMES[winDims[0]] || winDims[0];
    summary = winner === 'challenger' ? `你的${bestDim}险胜对手！` : `对方${bestDim}险胜你！`;
  }

  return {
    winner,
    winDimensions: winDims,
    loseDimensions: loseDims,
    winCountA,
    winCountB,
    summary,
  };
}

export async function GET(request: NextRequest) {
  const challengerId = request.nextUrl.searchParams.get('from');
  const birthdate = request.nextUrl.searchParams.get('birthdate');
  const gender = request.nextUrl.searchParams.get('gender') || 'male';

  if (!challengerId || !birthdate) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  try {
    const db = getDb();

    // 获取挑战者报告
    const challengerReport = db.prepare(
      'SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC LIMIT 1'
    ).get(challengerId) as any;

    if (!challengerReport) {
      return NextResponse.json({ error: '挑战者暂无报告' }, { status: 404 });
    }

    const challengerScores = JSON.parse(challengerReport.radarScores || '{}');

    // 为对手生成雷达分数（基于生日的确定性随机）
    const opponentScores = generateRadarScoresFromBirthdate(birthdate, gender);

    // 计算PK结果
    const pkResult = calculatePKResult(challengerScores, opponentScores);

    const birthDateObj = new Date(birthdate);

    return NextResponse.json({
      challenger: {
        name: challengerReport.name,
        radarScores: challengerScores,
      },
      opponent: {
        name: '好友',
        birthYear: birthDateObj.getFullYear(),
        gender,
        radarScores: opponentScores,
      },
      result: pkResult,
    });
  } catch (error) {
    console.error('Error calculating PK result:', error);
    return NextResponse.json({ error: 'Failed to calculate PK result' }, { status: 500 });
  }
}

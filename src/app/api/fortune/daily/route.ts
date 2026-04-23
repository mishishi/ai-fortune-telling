import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export interface DailyFortuneResponse {
  hasReport: boolean;
  date: string;
  lunarDate: string;
  overallScore: number;
  overallLabel: string;
  dimensions: {
    career: number;
    love: number;
    wealth: number;
    health: number;
  };
  tip: string[];
  yi: string[];
  ji: string[];
  bestTime: string;
  reportId?: string;
}

/**
 * Get the Chinese lunar date string for today
 */
function getLunarDateString(): string {
  const now = new Date();
  const year = now.getFullYear();

  // Calculate Chinese zodiac year (simplified - using the 60-year cycle)
  // 2024 is 甲辰年 (Jia Chen Year), cycle position 40
  // Each year cycles through: 甲子, 乙丑, 丙寅, 丁卯, ... 癸亥 (60 years)
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  // 1984 is 甲子 year (index 0)
  const baseYear = 1984;
  const cycleIndex = (year - baseYear) % 60;
  const adjustedIndex = cycleIndex < 0 ? cycleIndex + 60 : cycleIndex;

  const stem = stems[adjustedIndex % 10];
  const branch = branches[adjustedIndex % 12];

  // Simplified lunar month/day - using standard Chinese calendar approximation
  // In reality this would need a proper lunar calendar library
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // For demo purposes, generate a plausible lunar date
  // 甲辰年 三月 初三 format
  return `${stem}${branch}年 ${month}月${day}日`;
}

/**
 * Calculate fortune dimensions based on user's report and current date
 */
function calculateDimensions(
  radarScores: { career: number; love: number; wealth: number; health: number; mentor?: number },
  dayOfYear: number
): { career: number; love: number; wealth: number; health: number } {
  // Add daily variation (+/- 5 points) based on day of year
  const variation = (idx: number) => {
    const val = (dayOfYear * (idx + 1) * 7) % 11 - 5;
    return Math.max(60, Math.min(100, (radarScores as any)[idx === 0 ? 'career' : idx === 1 ? 'love' : idx === 2 ? 'wealth' : 'health'] + val));
  };

  return {
    career: variation(0),
    love: variation(1),
    wealth: variation(2),
    health: variation(3),
  };
}

/**
 * Get fortune tips based on date and user profile
 */
function getTips(dayOfYear: number, dayOfMonth: number): string[] {
  const tips = [
    '今日贵人运旺盛，多与人交流会有意外收获',
    '今日事业运上升，把握机会积极表现',
    '今日财运平稳，谨慎投资为宜',
    '今日感情运佳，多关心身边人',
    '今日健康运一般，注意休息和调节',
    '今日思维清晰，适合制定计划和学习',
    '今日桃花运旺，单身者有望遇到有缘人',
    '今日贵人相助，适合寻求帮助和合作',
  ];

  // Select tip based on date
  const idx = (dayOfYear + dayOfMonth) % tips.length;
  return [tips[idx]];
}

/**
 * Get YI (auspicious) activities for the day
 */
function getYiActivities(dayOfYear: number, dayOfMonth: number): string[] {
  const allYi = [
    '求职面试', '洽谈合作', '表白示爱', '搬家入宅', '开业开市',
    '签订合同', '祭祀祈福', '出行旅游', '学习进修', '投资理财',
  ];

  // Select 3 YI activities based on date
  const start = (dayOfYear * 3 + dayOfMonth) % allYi.length;
  return [
    allYi[start % allYi.length],
    allYi[(start + 3) % allYi.length],
    allYi[(start + 7) % allYi.length],
  ];
}

/**
 * Get JI (inauspicious) activities for the day
 */
function getJiActivities(dayOfYear: number, dayOfWeek: number): string[] {
  const allJi = [
    '投资冒险', '签约谈判', '远行外出', '搬家动土', '安葬破土',
    '探病问疾', '争吵是非', '醉酒宴请', '签署文件', '大额消费',
  ];

  // Select 3 JI activities based on date
  const start = (dayOfWeek * 5 + dayOfYear) % allJi.length;
  return [
    allJi[start % allJi.length],
    allJi[(start + 2) % allJi.length],
    allJi[(start + 5) % allJi.length],
  ];
}

/**
 * Get best time period for the day
 */
function getBestTime(dayOfYear: number): string {
  const times = [
    '上午9-11点（巳时）',
    '上午7-9点（辰时）',
    '中午11-13点（午时）',
    '下午3-5点（申时）',
    '晚上7-9点（戌时）',
    '凌晨1-3点（丑时）',
  ];

  return times[dayOfYear % times.length];
}

export async function GET(request: NextRequest) {
  const userIdParam = request.nextUrl.searchParams.get('userId');

  let userId: string;
  if (userIdParam && userIdParam !== 'anonymous') {
    userId = userIdParam;
  } else {
    userId = request.cookies.get('fortune_device_id')?.value || 'anonymous';
  }

  try {
    const db = getDb();

    // Get user's latest report
    const reports = db.prepare(
      'SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC LIMIT 1'
    ).all(userId) as any[];

    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    const dayOfMonth = now.getDate();
    const dayOfWeek = now.getDay();

    // Default response for users without reports
    if (reports.length === 0) {
      return NextResponse.json({
        hasReport: false,
        date: now.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        lunarDate: getLunarDateString(),
        overallScore: 0,
        overallLabel: '未生成报告',
        dimensions: { career: 0, love: 0, wealth: 0, health: 0 },
        tip: [] as string[],
        yi: [] as string[],
        ji: [] as string[],
        bestTime: '',
      } as DailyFortuneResponse);
    }

    const report = reports[0];

    // Parse radar scores from the report
    let radarScores = { career: 75, love: 75, wealth: 75, health: 75, mentor: 75 };
    try {
      radarScores = JSON.parse(report.radarScores || '{"career":75,"love":75,"wealth":75,"health":75,"mentor":75}');
    } catch (e) {
      // Use default scores
    }

    // Calculate dimensions with daily variation
    const dimensions = calculateDimensions(radarScores, dayOfYear);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      dimensions.career * 0.3 +
      dimensions.love * 0.25 +
      dimensions.wealth * 0.25 +
      dimensions.health * 0.2
    );

    // Determine overall label based on score
    let overallLabel: string;
    if (overallScore >= 85) {
      overallLabel = '极佳';
    } else if (overallScore >= 75) {
      overallLabel = '优秀';
    } else if (overallScore >= 65) {
      overallLabel = '良好';
    } else if (overallScore >= 55) {
      overallLabel = '平稳';
    } else {
      overallLabel = '欠佳';
    }

    const response: DailyFortuneResponse = {
      hasReport: true,
      date: now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      lunarDate: getLunarDateString(),
      overallScore,
      overallLabel,
      dimensions,
      tip: getTips(dayOfYear, dayOfMonth),
      yi: getYiActivities(dayOfYear, dayOfMonth),
      ji: getJiActivities(dayOfYear, dayOfWeek),
      bestTime: getBestTime(dayOfYear),
      reportId: report.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching daily fortune:', error);
    return NextResponse.json({ error: 'Failed to fetch daily fortune' }, { status: 500 });
  }
}

// 节气类型
export const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
] as const;

export type SolarTermName = typeof SOLAR_TERMS[number];

// 节气对应的索引
export const SOLAR_TERM_INDEX: Record<SolarTermName, number> = {
  '小寒': 0, '大寒': 1, '立春': 2, '雨水': 3, '惊蛰': 4, '春分': 5,
  '清明': 6, '谷雨': 7, '立夏': 8, '小满': 9, '芒种': 10, '夏至': 11,
  '小暑': 12, '大暑': 13, '立秋': 14, '处暑': 15, '白露': 16, '秋分': 17,
  '寒露': 18, '霜降': 19, '立冬': 20, '小雪': 21, '大雪': 22, '冬至': 23
};

// 节气对应的地支
export const SOLAR_TERM_BRANCH: Record<SolarTermName, number> = {
  '小寒': 11, '大寒': 11, '立春': 10, '雨水': 10, '惊蛰': 10, '春分': 10,
  '清明': 9, '谷雨': 9, '立夏': 8, '小满': 8, '芒种': 8, '夏至': 7,
  '小暑': 7, '大暑': 7, '立秋': 6, '处暑': 6, '白露': 6, '秋分': 5,
  '寒露': 5, '霜降': 5, '立冬': 4, '小雪': 4, '大雪': 4, '冬至': 3
};

// 每个节气的大致日期范围（基于公历）- 用于快速判断
// 这些是平均日期，实际日期会有1-2天波动
const SOLAR_TERM_APPROX_DATES: { month: number; dayRanges: number[][] }[] = [
  { month: 1, dayRanges: [[5, 7], [20, 21]] },  // 小寒、大寒
  { month: 2, dayRanges: [[3, 5], [18, 20], [], []] },  // 立春、雨水、惊蛰
  { month: 3, dayRanges: [[20, 22]] },  // 春分
  { month: 4, dayRanges: [[4, 6], [19, 21]] },  // 清明、谷雨
  { month: 5, dayRanges: [[5, 7], [20, 22]] },  // 立夏、小满
  { month: 6, dayRanges: [[5, 7], [20, 22]] },  // 芒种、夏至
  { month: 7, dayRanges: [[6, 8], [22, 24]] },  // 小暑、大暑
  { month: 8, dayRanges: [[7, 9], [22, 24]] },  // 立秋、处暑
  { month: 9, dayRanges: [[7, 9], [22, 24]] },  // 白露、秋分
  { month: 10, dayRanges: [[8, 9], [23, 24]] },  // 寒露、霜降
  { month: 11, dayRanges: [[7, 8], [22, 23]] },  // 立冬、小雪
  { month: 12, dayRanges: [[7, 8], [21, 23]] }   // 大雪、冬至
];

// 霍步金公式计算节气（简化版）
// 公式: Y * 0.2422 + C - L
// 其中Y = 年份 - 1900, C = 节气常数, L = 闰年数
function calculateSolarTermDate(year: number, termIndex: number): number {
  // 节气常数（简化版）
  const constants = [
    5.4055, 20.1205, 3.8795, 18.3395, 5.0195, 20.6465, // 小寒、大寒、立春、雨水、惊蛰、春分
    4.8285, 19.4595, 5.5465, 21.1125, 5.7895, 21.8685, // 清明、谷雨、立夏、小满、芒种、夏至
    7.1085, 22.7895, 7.6465, 23.0495, 8.3185, 23.8895, // 小暑、大暑、立秋、处暑、白露、秋分
    8.3185, 23.3465, 7.6465, 22.3475, 7.1085, 21.8685  // 寒露、霜降、立冬、小雪、大雪、冬至
  ];

  const C = constants[termIndex];
  const Y = year - 1900;
  const L = Math.floor((year - 1900) / 4);

  const day = Math.floor(Y * 0.2422 + C - L);

  return day;
}

/**
 * 获取某年某月的节气日期
 * @param year 公历年
 * @param month 公历月(1-12)
 * @returns 该月内节气的大致日期数组
 */
export function getSolarTermsInMonth(year: number, month: number): { term: SolarTermName; day: number }[] {
  const result: { term: SolarTermName; day: number }[] = [];

  // 找到该月份对应的节气索引范围
  // 节气从1月开始（小寒），每两个节气属于一个月
  const monthStartIndex = (month - 1) * 2;

  for (let i = 0; i < 2 && monthStartIndex + i < 24; i++) {
    const termIndex = monthStartIndex + i;
    const term = SOLAR_TERMS[termIndex];
    const day = calculateSolarTermDate(year, termIndex);
    result.push({ term, day });
  }

  return result;
}

/**
 * 判断某日期是否在某个节气之后
 * @param year 公历年
 * @param month 公历月(1-12)
 * @param day 公历日
 * @param solarTerm 节气名称
 * @returns true if the date is after the solar term
 */
export function isAfterSolarTerm(year: number, month: number, day: number, solarTerm: SolarTermName): boolean {
  const termIndex = SOLAR_TERM_INDEX[solarTerm];
  const termDay = calculateSolarTermDate(year, termIndex);

  // 节气在当月
  const termMonth = Math.floor(termIndex / 2) + 1;

  if (month > termMonth) return true;
  if (month < termMonth) return false;
  return day >= termDay;
}

/**
 * 获取指定日期前后的节气
 */
export function getNearestSolarTerm(year: number, month: number, day: number): { before: SolarTermName | null; after: SolarTermName | null } {
  let before: SolarTermName | null = null;
  let after: SolarTermName | null = null;

  // 遍历所有节气找到最近的前后节气
  for (let i = 0; i < 24; i++) {
    const term = SOLAR_TERMS[i];
    const termMonth = Math.floor(i / 2) + 1;
    const termDay = calculateSolarTermDate(year, i);

    // 比较日期
    const termDate = termMonth * 100 + termDay;
    const currentDate = month * 100 + day;

    if (termDate <= currentDate) {
      before = term;
    } else {
      after = term;
      break;
    }
  }

  // 处理边界情况
  if (after === null) {
    // 已经过了冬至，下一年的小寒
    after = '小寒';
  }

  return { before, after };
}

/**
 * 计算公历日期对应的节气
 * @param year 公历年
 * @param month 公历月
 * @param day 公历日
 * @returns 节气名称，如果不是节气日则返回null
 */
export function getSolarTermForDate(year: number, month: number, day: number): SolarTermName | null {
  const termIndex = (month - 1) * 2;

  for (let i = 0; i < 2 && termIndex + i < 24; i++) {
    const term = SOLAR_TERMS[termIndex + i];
    const termDay = calculateSolarTermDate(year, termIndex + i);

    if (day === termDay) {
      return term;
    }
  }

  return null;
}

/**
 * 获取立春的日期（用于年柱分界）
 */
export function getLiChunDate(year: number): number {
  // 立春是第3个节气（索引2）
  return calculateSolarTermDate(year, 2);
}

/**
 * 判断是否已过立春（用于年柱计算）
 */
export function isAfterLiChun(year: number, month: number, day: number): boolean {
  const liChunDay = getLiChunDate(year);
  // 立春通常在2月3-5日
  // 如果月份大于2月，肯定过了立春
  if (month > 2) return true;
  if (month < 2) return false;
  // 同月，比较日期
  return day >= liChunDay;
}

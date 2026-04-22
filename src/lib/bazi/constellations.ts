// 二十八宿星宿计算模块

// 二十八宿名称
export const CONSTELLATIONS = [
  '角', '亢', '氐', '房', '心', '尾', '箕',  //东方苍龙七宿
  '斗', '牛', '女', '虚', '危', '室', '壁',  //北方玄武七宿
  '奎', '娄', '胃', '昴', '毕', '觜', '参',  //西方白虎七宿
  '井', '鬼', '柳', '星', '张', '翼', '轸'   //南方朱雀七宿
] as const;

export type ConstellationName = typeof CONSTELLATIONS[number];

// 二十八宿对应五行
export const CONSTELLATION_ELEMENTS: Record<number, number> = {
  0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0,  // 东方木
  7: 4, 8: 4, 9: 4, 10: 4, 11: 4, 12: 4, 13: 4,  // 北方水
  14: 3, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3,  // 西方金
  21: 1, 22: 1, 23: 1, 24: 1, 25: 1, 26: 1, 27: 1   // 南方火
};

// 二十八宿度数（用于月亮位置计算）
export const CONSTELLATION_DEGREES = [
  12, 11, 16, 6, 7, 18, 10,  //东方
  12, 8, 9, 10, 17, 16, 6,  //北方
  16, 12, 14, 11, 12, 2, 16,  //西方
  30, 3, 14, 7, 22, 20, 11  //南方
];

/**
 * 计算某日期对应的二十八宿
 * @param year 年
 * @param month 月
 * @param day 日
 * @returns 二十八宿索引 (0-27)
 */
export function getConstellationIndex(year: number, month: number, day: number): number {
  // 简化计算：以2024年1月1日对应角宿为基准
  // 实际需要精确的天文学计算
  const baseYear = 2024;
  const baseMonth = 1;
  const baseDay = 1;
  const baseConstellation = 0; // 角宿

  // 计算天数偏移
  const daysSinceBase = Math.floor(
    (new Date(year, month - 1, day).getTime() -
      new Date(baseYear, baseMonth - 1, baseDay).getTime()) / (1000 * 60 * 60 * 24)
  );

  // 二十八宿每天移动约1.3度，月亮每天移动约13度
  // 简化：每27.3天循环一次（恒星月）
  const index = (baseConstellation + Math.floor(daysSinceBase * 1.037) + 28) % 28;

  return Math.abs(index);
}

/**
 * 获取二十八宿名称
 */
export function getConstellationName(index: number): ConstellationName {
  return CONSTELLATIONS[index % 28];
}

/**
 * 获取二十八宿五行
 */
export function getConstellationElement(index: number): number {
  return CONSTELLATION_ELEMENTS[index % 28];
}

/**
 * 计算星宿关系（吉凶）
 * @param constellation 二十八宿索引
 * @param stem 天干索引
 * @param branch 地支索引
 * @returns 关系描述
 */
export function getConstellationRelation(
  constellation: number,
  stem: number,
  branch: number
): { relation: string; isGood: boolean } {
  // 二十八宿与地支的关系（简化版）
  // 东方七宿对应寅卯辰
  // 北方七宿对应巳午未
  // 西方七宿对应申酉戌
  // 南方七宿对应亥子丑

  const branchGroup = Math.floor(branch / 3); // 0-3
  const constellationGroup = Math.floor(constellation / 7); // 0-3

  // 同组为吉，邻组为平，跨组为凶
  if (branchGroup === constellationGroup) {
    return { relation: '吉宿', isGood: true };
  }

  const diff = Math.abs(branchGroup - constellationGroup);
  if (diff === 1 || diff === 3) {
    return { relation: '平宿', isGood: false };
  }

  return { relation: '凶宿', isGood: false };
}

/**
 * 获取二十八宿吉凶
 */
export function getConstellationFortune(constellation: number): { name: string; fortune: '吉' | '平' | '凶' } {
  // 角、房、尾、斗、牛、危、毕、觜、参、鬼、柳、星、张、翼为吉
  const goodConstellations = [0, 3, 5, 7, 8, 10, 17, 19, 20, 22, 23, 24, 25, 26];
  // 亢、氐、心、女、虚、室、壁、奎、娄、胃、昴、井、轸为平
  const neutralConstellations = [1, 2, 4, 9, 11, 12, 13, 14, 15, 16, 18, 21, 27];

  if (goodConstellations.includes(constellation)) {
    return { name: CONSTELLATIONS[constellation], fortune: '吉' };
  }
  if (neutralConstellations.includes(constellation)) {
    return { name: CONSTELLATIONS[constellation], fortune: '平' };
  }
  return { name: CONSTELLATIONS[constellation], fortune: '凶' };
}

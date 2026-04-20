// 天干 (Heavenly Stems) - 0 to 9
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支 (Earthly Branches) - 0 to 11
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行 (Five Elements) - 0: 木, 1: 火, 2: 土, 3: 金, 4: 水
export const ELEMENTS = ['木', '火', '土', '金', '水'];

// 天干五行对应: 甲乙木、丙丁火、戊己土、庚辛金、壬癸水
export const STEM_ELEMENTS: number[] = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];

// 地支五行对应: 寅卯木、巳午火、申酉金、亥子水、辰戌丑未土
export const BRANCH_ELEMENTS: Record<number, number> = {
  0: 4,  // 子 - 水
  1: 2,  // 丑 - 土
  2: 0,  // 寅 - 木
  3: 0,  // 卯 - 木
  4: 2,  // 辰 - 土
  5: 1,  // 巳 - 火
  6: 1,  // 午 - 火
  7: 2,  // 未 - 土
  8: 3,  // 申 - 金
  9: 3,  // 酉 - 金
  10: 2, // 戌 - 土
  11: 4  // 亥 - 水
};

// 十神名称
export const TEN_GODS_NAMES = ['比肩', '比劫', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

// 六十甲子表（年柱60年循环）
export const CYCLE_60 = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
];

// 月令地支对应的天干（口诀：甲己之年丙作首，乙庚之年戊为头...）
// 五虎遁年起月表
export const MONTH_STEM_TABLE: number[][] = [
  // 甲、己年起正月天干
  [3, 5, 7, 9, 1, 3, 5, 7, 9, 1, 3, 5], // 甲年
  [3, 5, 7, 9, 1, 3, 5, 7, 9, 1, 3, 5], // 己年
  // 乙、庚年起正月天干
  [5, 7, 9, 1, 3, 5, 7, 9, 1, 3, 5, 7], // 乙年
  [5, 7, 9, 1, 3, 5, 7, 9, 1, 3, 5, 7], // 庚年
  // 丙、辛年起正月天干
  [7, 9, 1, 3, 5, 7, 9, 1, 3, 5, 7, 9], // 丙年
  [7, 9, 1, 3, 5, 7, 9, 1, 3, 5, 7, 9], // 辛年
  // 丁、壬年起正月天干
  [9, 1, 3, 5, 7, 9, 1, 3, 5, 7, 9, 1], // 丁年
  [9, 1, 3, 5, 7, 9, 1, 3, 5, 7, 9, 1], // 壬年
  // 戊、癸年起正月天干
  [1, 3, 5, 7, 9, 1, 3, 5, 7, 9, 1, 3], // 戊年
  [1, 3, 5, 7, 9, 1, 3, 5, 7, 9, 1, 3]  // 癸年
];

// 藏干类型
export type HiddenStemType = 'main' | 'middle' | 'residual';

export interface HiddenStem {
  stem: number;     // 天干索引
  type: HiddenStemType;  // 本气、中气、余气
}

// 地支藏干表（每个地支藏的天干索引和类型）
// 地支索引: 0子, 1丑, 2寅, 3卯, 4辰, 5巳, 6午, 7未, 8申, 9酉, 10戌, 11亥
// 天干索引: 0甲, 1乙, 2丙, 3丁, 4戊, 5己, 6庚, 7辛, 8壬, 9癸
export const HIDDEN_STEMS: Record<number, HiddenStem[]> = {
  0: [{ stem: 9, type: 'main' }],                              // 子: 癸
  1: [{ stem: 5, type: 'main' }, { stem: 9, type: 'middle' }, { stem: 7, type: 'residual' }],  // 丑: 己癸辛
  2: [{ stem: 0, type: 'main' }, { stem: 2, type: 'middle' }, { stem: 4, type: 'residual' }],  // 寅: 甲丙戊
  3: [{ stem: 1, type: 'main' }],                              // 卯: 乙
  4: [{ stem: 4, type: 'main' }, { stem: 1, type: 'middle' }, { stem: 9, type: 'residual' }],  // 辰: 戊乙癸
  5: [{ stem: 2, type: 'main' }, { stem: 6, type: 'middle' }, { stem: 4, type: 'residual' }],  // 巳: 丙庚戊
  6: [{ stem: 3, type: 'main' }, { stem: 5, type: 'middle' }],                           // 午: 丁己
  7: [{ stem: 5, type: 'main' }, { stem: 3, type: 'middle' }, { stem: 1, type: 'residual' }],  // 未: 己丁乙
  8: [{ stem: 6, type: 'main' }, { stem: 8, type: 'middle' }, { stem: 4, type: 'residual' }],  // 申: 庚壬戊
  9: [{ stem: 7, type: 'main' }],                              // 酉: 辛
  10: [{ stem: 4, type: 'main' }, { stem: 7, type: 'middle' }, { stem: 3, type: 'residual' }], // 戌: 戊辛丁
  11: [{ stem: 8, type: 'main' }, { stem: 0, type: 'middle' }]                            // 亥: 壬甲
};

/**
 * 获取地支藏干
 * @param branch 地支索引 (0-11)
 * @returns 藏干数组，每个元素包含天干索引和类型（本气、中气、余气）
 */
export function getHiddenStems(branch: number): HiddenStem[] {
  return HIDDEN_STEMS[branch] || [];
}

/**
 * 获取地支藏干（仅返回天干索引数组）
 * @param branch 地支索引 (0-11)
 * @returns 藏干索引数组
 */
export function getHiddenStemIndexes(branch: number): number[] {
  return getHiddenStems(branch).map(h => h.stem);
}

/**
 * 获取藏干的力量权重
 * @param type 本气、中气、余气
 * @returns 权重值（0-1之间）
 */
export function getHiddenStemWeight(type: HiddenStemType): number {
  switch (type) {
    case 'main': return 0.6;      // 本气 60%
    case 'middle': return 0.3;    // 中气 30%
    case 'residual': return 0.1;  // 余气 10%
    default: return 0;
  }
}

// 日干起时表（五鼠遁日起时表）
export const HOUR_STEM_TABLE: number[][] = [
  // 甲、己日起子时天干
  [0, 2, 4, 6, 8, 0, 2, 4, 6, 8, 0, 2], // 甲日
  [0, 2, 4, 6, 8, 0, 2, 4, 6, 8, 0, 2], // 己日
  // 乙、庚日起子时天干
  [2, 4, 6, 8, 0, 2, 4, 6, 8, 0, 2, 4], // 乙日
  [2, 4, 6, 8, 0, 2, 4, 6, 8, 0, 2, 4], // 庚日
  // 丙、辛日起子时天干
  [4, 6, 8, 0, 2, 4, 6, 8, 0, 2, 4, 6], // 丙日
  [4, 6, 8, 0, 2, 4, 6, 8, 0, 2, 4, 6], // 辛日
  // 丁、壬日起子时天干
  [6, 8, 0, 2, 4, 6, 8, 0, 2, 4, 6, 8], // 丁日
  [6, 8, 0, 2, 4, 6, 8, 0, 2, 4, 6, 8], // 壬日
  // 戊、癸日起子时天干
  [8, 0, 2, 4, 6, 8, 0, 2, 4, 6, 8, 0], // 戊日
  [8, 0, 2, 4, 6, 8, 0, 2, 4, 6, 8, 0]  // 癸日
];

// 获取天干
export function getStem(index: number): string {
  return HEAVENLY_STEMS[index % 10];
}

// 获取地支
export function getBranch(index: number): string {
  return EARTHLY_BRANCHES[index % 12];
}

// 获取天干地支组合
export function getStemBranch(stem: number, branch: number): string {
  return getStem(stem) + getBranch(branch);
}

// 获取六十甲子索引（0-59）
export function getCycleIndex(stem: number, branch: number): number {
  // 甲子 = 0, 乙丑 = 1, ...
  // stem = branch mod 10, branch = branch mod 12
  // We need to find the index where (stem + 10*n) % 10 = actual stem and (branch + 12*n) % 12 = actual branch
  for (let i = 0; i < 60; i++) {
    if (CYCLE_60[i][0] === HEAVENLY_STEMS[stem % 10] && CYCLE_60[i][1] === EARTHLY_BRANCHES[branch % 12]) {
      return i;
    }
  }
  return (stem % 10) * 6 + (branch % 12) % 6; // Fallback calculation
}

// 计算年柱索引（以立春为分界）
export function getYearPillarIndex(year: number): number {
  // 年柱按照六十甲子顺序
  // 1984年=甲子，1984年是第0年（基准年）
  const baseYear = 1984;
  const baseIndex = 0; // 甲子
  const offset = year - baseYear;
  return ((baseIndex + offset) % 60 + 60) % 60;
}

// 计算月柱索引
export function getMonthPillarIndex(yearStem: number, month: number): number {
  // 月柱 = 年干对应的正月天干 + (月份 - 1)
  // month: 1-12
  const monthStemBase = MONTH_STEM_TABLE[yearStem % 10][0];
  const monthStem = (monthStemBase + month - 1) % 10;
  const monthBranch = (month - 1) % 12;
  return monthStem * 10 + monthBranch;
}

// 计算时柱索引
export function getHourPillarIndex(dayStem: number, hour: number): { stem: number; branch: number } {
  // 时柱 = 日干对应的子时天干 + 时辰
  // hour: 0-23, 转换为时辰(0-11，子时=0，丑时=1...)
  const branch = Math.floor(hour / 2) % 12;
  const hourStemBase = HOUR_STEM_TABLE[dayStem % 10][0];
  const stem = (hourStemBase + branch) % 10;
  return { stem, branch };
}

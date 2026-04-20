// 纳音五行 - 基于六十甲子
// 顺序: 金(0), 火(1), 土(2), 木(3), 水(4), 循环

export const NAN_YIN_ELEMENTS = [
  // 甲子到癸酉 (0-9)
  3, 4, 1, 0, 2, 3, 4, 1, 0, 2,
  // 甲戌到癸未 (10-19)
  0, 2, 3, 4, 1, 0, 2, 3, 4, 1,
  // 甲申到癸巳 (20-29)
  2, 3, 4, 1, 0, 2, 3, 4, 1, 0,
  // 甲午到癸卯 (30-39)
  4, 1, 0, 2, 3, 4, 1, 0, 2, 3,
  // 甲辰到癸丑 (40-49)
  1, 0, 2, 3, 4, 1, 0, 2, 3, 4,
  // 甲寅到癸亥 (50-59)
  0, 2, 3, 4, 1, 0, 2, 3, 4, 1
];

export const NAN_YIN_NAMES = [
  // 甲子到癸酉
  '海中金', '海中金', '炉中火', '炉中火', '大林木', '大林木', '路旁土', '路旁土', '剑锋金', '剑锋金',
  // 甲戌到癸未
  '山头火', '山头火', '洞下水', '洞下水', '城墙土', '城墙土', '白蜡金', '白蜡金', '杨柳木', '杨柳木',
  // 甲申到癸巳
  '井泉水', '井泉水', '屋上土', '屋上土', '霹雳火', '霹雳火', '松柏木', '松柏木', '长流水', '长流水',
  // 甲午到癸卯
  '砂石金', '砂石金', '山下火', '山下火', '平地木', '平地木', '壁上土', '壁上土', '金箔金', '金箔金',
  // 甲辰到癸丑
  '覆灯火', '覆灯火', '天河水', '天河水', '大驿土', '大驿土', '钗钏金', '钗钏金', '松柏木', '松柏木',
  // 甲寅到癸亥
  '长流水', '长流水', '山下火', '山下火', '砂石金', '砂石金', '平地木', '平地木', '壁上土', '壁上土'
];

export const NAN_YIN_ELEMENT_NAMES = ['金', '火', '土', '木', '水'];

/**
 * 根据六十甲子索引获取纳音五行
 */
export function getNaYinElement(cycleIndex: number): number {
  return NAN_YIN_ELEMENTS[cycleIndex % 60];
}

/**
 * 根据六十甲子索引获取纳音五行名称
 */
export function getNaYinName(cycleIndex: number): string {
  return NAN_YIN_NAMES[cycleIndex % 60];
}

/**
 * 获取天干地支对应的纳音五行索引
 */
export function getNaYinByStemBranch(stem: number, branch: number): { element: number; name: string } {
  // 六十甲子索引查找: 用key "stem-branch" 查找
  // 甲子=0, 乙丑=1, 丙寅=2, ...
  const CYCLE_MAP: Record<string, number> = {
    '0-0': 0, '0-2': 50, '0-4': 40, '0-6': 30, '0-8': 20, '0-10': 10,
    '1-1': 1, '1-3': 51, '1-5': 41, '1-7': 31, '1-9': 21, '1-11': 11,
    '2-0': 12, '2-2': 2, '2-4': 52, '2-6': 42, '2-8': 32, '2-10': 22,
    '3-1': 13, '3-3': 3, '3-5': 53, '3-7': 43, '3-9': 33, '3-11': 23,
    '4-0': 24, '4-2': 14, '4-4': 4, '4-6': 54, '4-8': 44, '4-10': 34,
    '5-1': 25, '5-3': 15, '5-5': 5, '5-7': 55, '5-9': 45, '5-11': 35,
    '6-0': 36, '6-2': 26, '6-4': 16, '6-6': 6, '6-8': 56, '6-10': 46,
    '7-1': 37, '7-3': 27, '7-5': 17, '7-7': 7, '7-9': 57, '7-11': 47,
    '8-0': 48, '8-2': 38, '8-4': 28, '8-6': 18, '8-8': 8, '8-10': 58,
    '9-1': 49, '9-3': 39, '9-5': 29, '9-7': 19, '9-9': 9, '9-11': 59
  };

  const stemIdx = Math.floor(stem) % 10;
  const branchIdx = Math.floor(branch) % 12;
  const cycleIndex = CYCLE_MAP[`${stemIdx}-${branchIdx}`] ?? 0;

  return {
    element: getNaYinElement(cycleIndex),
    name: getNaYinName(cycleIndex)
  };
}

/**
 * 计算一个八字（四个柱）的纳音五行
 */
export function calculateNaYin(yearStem: number, yearBranch: number, monthStem: number, monthBranch: number, dayStem: number, dayBranch: number, hourStem: number, hourBranch: number): { year: string; month: string; day: string; hour: string } {
  return {
    year: getNaYinByStemBranch(yearStem, yearBranch).name,
    month: getNaYinByStemBranch(monthStem, monthBranch).name,
    day: getNaYinByStemBranch(dayStem, dayBranch).name,
    hour: getNaYinByStemBranch(hourStem, hourBranch).name
  };
}

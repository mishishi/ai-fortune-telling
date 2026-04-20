import { STEM_ELEMENTS } from './stemsBranches';

// 十神关系定义
// 索引0-9: 比肩、比劫、食神、伤官、偏财、正财、七杀、正官、偏印、正印

// 天干五行对应: 0木, 1火, 2土, 3金, 4水
// 地支五行对应: 寅卯木(0,3), 巳午火(5,6), 申酉金(8,9), 亥子水(11,0), 辰戌丑未土(1,4,7,10)

export const TEN_GODS_NAMES = ['比肩', '比劫', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

/**
 * 计算两个天干之间的十神关系
 * @param stem1 第一个天干（参考天干，如日干）
 * @param stem2 第二个天干（要判断的天干）
 * @returns 十神索引 (0-9)
 */
export function calculateTenGod(stem1: number, stem2: number): number {
  const element1 = STEM_ELEMENTS[stem1 % 10];
  const element2 = STEM_ELEMENTS[stem2 % 10];

  // 同我 - 比肩或比劫
  if (element1 === element2) {
    // 奇数天干为比肩，偶数为比劫（按顺序）
    return stem1 % 2 === stem2 % 2 ? 0 : 1; // 比肩或比劫
  }

  // 我生 - 食神或伤官
  // 木生火 -> 木是火的长生，火是木的余气
  // 顺生: 木(0)生火(1)生土(2)生金(3)生水(4)生木
  const elementCycle = (element2 - element1 + 5) % 5;

  if (elementCycle === 1) {
    // 我生者 - 食神(同性)或伤官(异性)
    // 阳干生阴干为食神，阴干生阳干为伤官
    return isSamePolarity(stem1, stem2) ? 2 : 3; // 食神或伤官
  }

  // 我克 - 偏财或正财
  if (elementCycle === 2) {
    // 我克者 - 偏财(同性)或正财(异性)
    return isSamePolarity(stem1, stem2) ? 4 : 5; // 偏财或正财
  }

  // 克我 - 七杀或正官
  if (elementCycle === 3 || elementCycle === 4) {
    // 克我者 - 官杀
    // 阳干克阴干为七杀，阴干克阳干为正官
    // 或者简单判断：同阴阳为七杀，异阴阳为正官
    return isSamePolarity(stem1, stem2) ? 6 : 7; // 七杀或正官
  }

  // 生我 - 偏印或正印
  // elementCycle === 4 表示元素2生元素1
  return isSamePolarity(stem1, stem2) ? 8 : 9; // 偏印或正印
}

// 判断两个天干是否同阴阳
function isSamePolarity(stem1: number, stem2: number): boolean {
  // 天干阴阳: 甲丙戊庚壬为阳(0,2,4,6,8)，乙丁己辛癸为阴(1,3,5,7,9)
  return (stem1 % 2) === (stem2 % 2);
}

/**
 * 计算多个天干与日干的十神关系
 */
export function calculateTenGods(dayStem: number, otherStems: number[]): number[] {
  return otherStems.map(stem => calculateTenGod(dayStem, stem));
}

/**
 * 计算年干、月干、时干与日干的十神关系
 */
export function calculateTenGodsFromPillars(yearStem: number, monthStem: number, hourStem: number, dayStem: number): { yearToDay: number[]; monthToDay: number[]; hourToDay: number[] } {
  return {
    yearToDay: [calculateTenGod(dayStem, yearStem)],
    monthToDay: [calculateTenGod(dayStem, monthStem)],
    hourToDay: [calculateTenGod(dayStem, hourStem)]
  };
}

/**
 * 获取十神名称
 */
export function getTenGodName(index: number): string {
  return TEN_GODS_NAMES[index % 10];
}

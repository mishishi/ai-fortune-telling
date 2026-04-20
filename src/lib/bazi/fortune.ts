import { STEM_ELEMENTS, BRANCH_ELEMENTS, getStem, getBranch, HOUR_STEM_TABLE } from './stemsBranches';
import { isAfterLiChun } from './solarTerms';

export interface FortuneLine {
  age: number;          // 开始年龄
  stem: number;         // 天干
  branch: number;       // 地支
  element: number;      // 五行属性
}

export interface BirthInfo {
  year: number;      // 公历年
  month: number;     // 公历月
  day: number;       // 公历日
  hour: number;      // 小时(0-23)
  minute: number;    // 分钟(0-59)
  gender: 'male' | 'female';
  province: string;  // 出生省份（真太阳时校正用）
}

/**
 * 计算大运
 * @param monthBranch 月令地支
 * @param monthStem 月干
 * @param gender 性别
 * @param birthYear 出生年
 * @param birthMonth 出生月
 * @param birthDay 出生日
 * @returns 大运数组
 */
export function calculateFortuneLines(
  monthBranch: number,
  monthStem: number,
  gender: 'male' | 'female',
  birthYear: number,
  birthMonth: number,
  birthDay: number
): FortuneLine[] {
  const fortuneLines: FortuneLine[] = [];

  // 大运起步地支（根据月令）
  // 阳男阴女顺排，阴男阳女逆排
  // 简化：以月令地支为起点

  // 判断阴阳
  const isYangYear = birthYear % 2 === 0; // 简化判断
  const isYangMonth = monthStem % 2 === 0;

  // 阳男顺，阴男逆，阳女逆，阴女顺（简化）
  // 实际口诀：阳男阴女顺，阴男阳女逆
  const isClockwise = (isYangYear && gender === 'male') || (!isYangYear && gender === 'female');

  // 起运年龄计算（简化：每步大运10年）
  // 实际需要根据出生节气和交节计算
  const startBranch = monthBranch;
  const branchCycle = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]; // 子丑寅卯...

  // 计算大运起步年龄（简化：3岁起运）
  let startAge = 3;

  // 生成8步大运
  for (let i = 0; i < 8; i++) {
    let branchIndex: number;

    if (isClockwise) {
      branchIndex = (startBranch + i) % 12;
    } else {
      branchIndex = (startBranch - i + 12) % 12;
    }

    // 计算该地支对应的大运天干
    // 口诀：同我者阳顺阴逆
    // 简化：使用月干加i计算
    const stemOffset = isClockwise ? i : -i;
    const stemIndex = (monthStem + stemOffset) % 10;

    const element = BRANCH_ELEMENTS[branchIndex];

    fortuneLines.push({
      age: startAge + i * 10,
      stem: stemIndex >= 0 ? stemIndex : stemIndex + 10,
      branch: branchIndex,
      element
    });
  }

  return fortuneLines;
}

/**
 * 计算流年（当前年起往后10年）
 * @param startYear 起始年
 * @param dayStem 日干（用于判断流年天干）
 * @returns 流年数组
 */
export function calculateYearlyFortune(startYear: number, dayStem: number): FortuneLine[] {
  const yearlyFortune: FortuneLine[] = [];

  // 60年甲子循环
  // 找出该年对应的天干地支
  // 简化：以2024年为基础计算

  // 2024年是甲辰年（甲子循环的第40年，索引39）
  const baseYear = 2024;
  const baseCycleIndex = 39; // 甲辰

  for (let i = 0; i < 10; i++) {
    const year = startYear + i;
    const yearOffset = year - baseYear;
    const cycleIndex = (baseCycleIndex + yearOffset) % 60;
    const adjustedIndex = cycleIndex >= 0 ? cycleIndex : cycleIndex + 60;

    // 计算天干（cycleIndex * 10 / 60 取整）
    const stem = Math.floor((adjustedIndex * 10) / 60);
    // 计算地支（cycleIndex * 12 / 60 取整）
    const branch = Math.floor((adjustedIndex * 12) / 60);

    // 简化的流年计算（直接使用年柱）
    // 实际流年是以太岁为代表

    yearlyFortune.push({
      age: i + 1,
      stem: stem % 10,
      branch: branch % 12,
      element: BRANCH_ELEMENTS[branch % 12]
    });
  }

  return yearlyFortune;
}

/**
 * 计算更精确的流年
 */
export function calculateYearlyFortuneV2(startYear: number, baseCycleIndex: number): FortuneLine[] {
  const yearlyFortune: FortuneLine[] = [];

  for (let i = 0; i < 10; i++) {
    const year = startYear + i;
    const cycleIndex = (baseCycleIndex + i) % 60;
    const adjustedIndex = cycleIndex >= 0 ? cycleIndex : cycleIndex + 60;

    // 计算天干和地支
    // 60甲子中，天干循环周期10，地支循环周期12
    const stem = adjustedIndex % 10;
    const branch = adjustedIndex % 12;

    yearlyFortune.push({
      age: i + 1,
      stem,
      branch,
      element: BRANCH_ELEMENTS[branch]
    });
  }

  return yearlyFortune;
}

/**
 * 获取某年对应的六十甲子索引
 */
export function getYearCycleIndex(year: number): number {
  // 以1984年（甲子年）为基准
  const baseYear = 1984;
  const baseIndex = 0; // 甲子
  const offset = year - baseYear;
  return ((baseIndex + offset) % 60 + 60) % 60;
}

/**
 * 计算起运年龄
 * 简化版本：3岁起运
 */
export function calculateStartAge(
  birthMonth: number,
  birthDay: number,
  gender: 'male' | 'female',
  birthYear: number
): number {
  // 简化处理：统一3岁起运
  // 实际需要根据节气精确计算
  return 3;
}

/**
 * 判断大运顺逆
 */
export function isClockwiseFortune(
  monthStem: number,
  gender: 'male' | 'female',
  birthYear: number
): boolean {
  const isYangMonth = monthStem % 2 === 0;
  const isYangYear = birthYear % 2 === 0;

  // 口诀：阳男阴女顺，阴男阳女逆
  return (isYangYear && gender === 'male') || (!isYangYear && gender === 'female');
}

import { BirthInfo, BaZi, BaZiResult, StemBranch } from './index';
import { gregorianToLunar } from './lunar';
import { isAfterLiChun, getSolarTermForDate, getLiChunDate } from './solarTerms';
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  CYCLE_60,
  getYearPillarIndex,
  getMonthPillarIndex,
  getHourPillarIndex
} from './stemsBranches';
import { calculateNaYin } from './nanYin';
import { calculateDayMasterStrength } from './dayMaster';
import { calculateTenGodsFromPillars } from './tenGods';
import { calculateFortuneLines, calculateYearlyFortuneV2, getYearCycleIndex } from './fortune';

// 辅助函数：获取天干索引
function getStemIndex(stem: string): number {
  return HEAVENLY_STEMS.indexOf(stem);
}

// 辅助函数：获取地支索引
function getBranchIndex(branch: string): number {
  return EARTHLY_BRANCHES.indexOf(branch);
}

/**
 * 计算八字排盘
 * @param birth 出生信息
 * @returns 八字排盘结果
 */
export function calculateBaZi(birth: BirthInfo): BaZiResult {
  const { year, month, day, hour, gender } = birth;

  // 1. 获取农历日期
  const lunar = gregorianToLunar(year, month, day);

  // 2. 计算年柱（以立春为分界）
  const yearPillar = calculateYearPillar(year, month, day, lunar.lunarYear);

  // 3. 计算月柱（以节为界）
  const monthPillar = calculateMonthPillar(yearPillar.stem, month, day);

  // 4. 计算日柱（使用儒略日公式）
  const dayPillar = calculateDayPillar(year, month, day);

  // 5. 计算时柱
  const hourPillar = calculateHourPillar(dayPillar.stem, hour);

  // 组装八字
  const bazi: BaZi = {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar
  };

  // 6. 计算纳音五行
  const nanYin = calculateNaYin(
    yearPillar.stem, yearPillar.branch,
    monthPillar.stem, monthPillar.branch,
    dayPillar.stem, dayPillar.branch,
    hourPillar.stem, hourPillar.branch
  );

  // 7. 计算日主旺衰
  const allStems = [yearPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
  const allBranches = [yearPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch];
  const dayMaster = calculateDayMasterStrength(
    dayPillar.stem,
    monthPillar.branch,
    allStems,
    allBranches
  );

  // 8. 计算十神
  const tenGods = calculateTenGodsFromPillars(
    yearPillar.stem,
    monthPillar.stem,
    hourPillar.stem,
    dayPillar.stem
  );

  // 9. 计算大运
  const fortuneLines = calculateFortuneLines(
    monthPillar.branch,
    monthPillar.stem,
    gender,
    year,
    month,
    day
  );

  // 10. 计算流年
  const yearCycleIndex = getYearCycleIndex(year);
  const yearlyFortune = calculateYearlyFortuneV2(year, yearCycleIndex);

  return {
    bazi,
    nanYin,
    dayMaster: {
      stem: dayMaster.stem,
      strength: dayMaster.score,
      element: dayMaster.element
    },
    tenGods,
    fortuneLines,
    yearlyFortune
  };
}

/**
 * 计算年柱
 * 以立春为分界，立春前用前一年年柱
 */
function calculateYearPillar(year: number, month: number, day: number, lunarYear: number): StemBranch {
  // 判断是否已过立春
  const afterLiChun = isAfterLiChun(year, month, day);

  // 如果未过立春，年柱用前一年
  const effectiveYear = afterLiChun ? year : year - 1;

  // 计算年柱索引（甲子 = 0）
  const cycleIndex = getYearPillarIndex(effectiveYear);

  return {
    stem: cycleIndex % 10,
    branch: cycleIndex % 12
  };
}

/**
 * 计算月柱
 * 以节为分界，不是每月初一
 */
function calculateMonthPillar(yearStem: number, month: number, day: number): StemBranch {
  // 月柱 = 年干对应的正月天干 + (月份 - 1)
  // 口诀：甲己之年丙作首，乙庚之年戊为头...

  // 月干表格（年起月表）
  const MONTH_START_STEMS = [3, 5, 7, 9, 1, 3, 5, 7, 9, 1]; // 索引为年干序号

  const monthStemBase = MONTH_START_STEMS[yearStem % 10];
  const monthStem = (monthStemBase + month - 1) % 10;
  const monthBranch = (month - 1) % 12; // 正月为寅=2，二月为卯=3...

  return {
    stem: monthStem >= 0 ? monthStem : monthStem + 10,
    branch: monthBranch
  };
}

/**
 * 计算日柱
 * 使用儒略日公式
 */
function calculateDayPillar(year: number, month: number, day: number): StemBranch {
  // 儒略日公式
  const JDN = dateToJulianDay(year, month, day);

  // 日柱计算：使用已知基准日推算
  // 1900年1月1日是甲子日，JDN = 2415021
  // 日干 = (JDN + 1) % 10 （+1是因为甲子是从1开始计数）
  // 日支 = (JDN + 1) % 12

  // 更精确的公式：
  // 找到2000年1月1日的JDN（已知是戊辰日）
  // 2000年1月1日 JDN = 2451545, 日干 = 4 (戊), 日支 = 5 (辰)

  const baseJDN = 2451545; // 2000年1月1日
  const baseStem = 4; // 戊
  const baseBranch = 5; // 辰

  const dayOffset = JDN - baseJDN;

  const dayStem = (baseStem + dayOffset) % 10;
  const dayBranch = (baseBranch + dayOffset) % 12;

  return {
    stem: dayStem >= 0 ? dayStem : dayStem + 10,
    branch: dayBranch >= 0 ? dayBranch : dayBranch + 12
  };
}

/**
 * 儒略日计算（返回整数）
 */
function dateToJulianDay(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

/**
 * 计算时柱
 * 日干起时，子时为0
 */
function calculateHourPillar(dayStem: number, hour: number): StemBranch {
  // 口诀：甲己还生甲，乙庚丙作初...
  // 日干对应的子时天干

  const HOUR_START_STEMS = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]; // 日干对应的子时天干

  // 时辰地支：子=0, 丑=1, 寅=2, ... 亥=11
  const hourBranch = Math.floor(hour / 2) % 12;

  const hourStemBase = HOUR_START_STEMS[dayStem % 10];
  const hourStem = (hourStemBase + hourBranch) % 10;

  return {
    stem: hourStem >= 0 ? hourStem : hourStem + 10,
    branch: hourBranch
  };
}

/**
 * 格式化八字输出
 */
export function formatBaZi(bazi: BaZi): string {
  const { yearPillar, monthPillar, dayPillar, hourPillar } = bazi;

  return [
    HEAVENLY_STEMS[yearPillar.stem] + EARTHLY_BRANCHES[yearPillar.branch],
    HEAVENLY_STEMS[monthPillar.stem] + EARTHLY_BRANCHES[monthPillar.branch],
    HEAVENLY_STEMS[dayPillar.stem] + EARTHLY_BRANCHES[dayPillar.branch],
    HEAVENLY_STEMS[hourPillar.stem] + EARTHLY_BRANCHES[hourPillar.branch]
  ].join(' ');
}

/**
 * 获取八字字符串表示
 */
export function getBaZiString(bazi: BaZi): string {
  return formatBaZi(bazi);
}

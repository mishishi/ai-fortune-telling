// 八字排盘类型定义和导出

export interface BirthInfo {
  year: number;      // 公历年
  month: number;     // 公历月
  day: number;       // 公历日
  hour: number;      // 小时(0-23)
  minute: number;    // 分钟(0-59)
  gender: 'male' | 'female';
  province: string;  // 出生省份（真太阳时校正用）
}

export interface BaZi {
  yearPillar: StemBranch;  // 年柱
  monthPillar: StemBranch; // 月柱
  dayPillar: StemBranch;  // 日柱
  hourPillar: StemBranch; // 时柱
}

export interface StemBranch {
  stem: number;   // 天干 0-9
  branch: number; // 地支 0-11
}

export interface FortuneLine {
  age: number;          // 开始年龄
  stem: number;         // 天干
  branch: number;       // 地支
  element: number;      // 五行属性
}

export interface BaZiResult {
  bazi: BaZi;
  nanYin: { year: string; month: string; day: string; };
  dayMaster: {
    stem: number;
    strength: number;  // 0-100 旺衰程度
    element: number;   // 日主五行
  };
  tenGods: {
    yearToDay: number[];  // 年干→日干的十神关系
    monthToDay: number[];
    hourToDay: number[];
  };
  fortuneLines: FortuneLine[];  // 大运
  yearlyFortune: FortuneLine[]; // 流年（当前年起往后10年）
}

// 导出所有常量和函数
export {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ELEMENTS,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  TEN_GODS_NAMES,
  CYCLE_60,
  MONTH_STEM_TABLE,
  HOUR_STEM_TABLE,
  getStem,
  getBranch,
  getStemBranch,
  getCycleIndex,
  getYearPillarIndex,
  getMonthPillarIndex,
  getHourPillarIndex,
  getHiddenStems,
  getHiddenStemIndexes,
  getHiddenStemWeight,
  HIDDEN_STEMS,
  type HiddenStem,
  type HiddenStemType
} from './stemsBranches';

export {
  SOLAR_TERMS,
  SOLAR_TERM_INDEX,
  SOLAR_TERM_BRANCH,
  getSolarTermsInMonth,
  isAfterSolarTerm,
  getNearestSolarTerm,
  getSolarTermForDate,
  getLiChunDate,
  isAfterLiChun
} from './solarTerms';

export {
  gregorianToLunar,
  lunarToGregorian,
  daysBetween,
  type LunarDate
} from './lunar';

export {
  NAN_YIN_ELEMENTS,
  NAN_YIN_NAMES,
  NAN_YIN_ELEMENT_NAMES,
  getNaYinElement,
  getNaYinName,
  getNaYinByStemBranch,
  calculateNaYin
} from './nanYin';

export {
  TEN_GODS_NAMES as TEN_GODS,
  calculateTenGod,
  calculateTenGods,
  calculateTenGodsFromPillars,
  getTenGodName
} from './tenGods';

export {
  calculateDayMasterStrength,
  getStrengthType,
  analyzeDayMaster,
  type DayMasterStrength
} from './dayMaster';

export {
  calculateFortuneLines,
  calculateYearlyFortune,
  calculateYearlyFortuneV2,
  getYearCycleIndex,
  calculateStartAge,
  isClockwiseFortune,
  type FortuneLine as FortuneLineType
} from './fortune';

export {
  calculateBaZi,
  formatBaZi,
  getBaZiString
} from './palace';

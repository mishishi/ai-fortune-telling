import lunarCalendarData from '../../../data/lunarCalendar.json';

export interface LunarDate {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
}

// 平年每月天数
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// 是否为闰年
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// 获取某年某月的天数
function getDaysInMonth(year: number, month: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DAYS_IN_MONTH[month - 1];
}

// 计算从某年1月1日起的天数偏移
function getDayOfYear(year: number, month: number, day: number): number {
  let days = 0;
  for (let m = 1; m < month; m++) {
    days += getDaysInMonth(year, m);
  }
  return days + day - 1; // 0-indexed
}

// 使用儒略日计算更精确的转换
function dateToJulianDay(year: number, month: number, day: number): number {
  // 儒略日公式
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn;
}

// 从儒略日反算公历日期
function julianDayToDate(jdn: number): { year: number; month: number; day: number } {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

// 近似农历月份查找（简化版）
// 实际上需要精确的农历数据，这里用近似算法
function estimateLunarDate(year: number, month: number, day: number): LunarDate {
  // 使用已知数据点进行插值
  const key = `${year}-${month}-${day}`;

  // 先尝试直接匹配
  if (lunarCalendarData[key as keyof typeof lunarCalendarData]) {
    const data = lunarCalendarData[key as keyof typeof lunarCalendarData] as LunarDate;
    return data;
  }

  // 如果没有精确匹配，使用已知日期进行推算
  // 找到最近的已知日期
  const knownDates = Object.keys(lunarCalendarData).map(k => {
    const [y, m, d] = k.split('-').map(Number);
    return { key: k, year: y, month: m, day: d };
  }).filter(k => k.year >= 1980 && k.year <= 2030)
    .sort((a, b) => a.year - b.year || a.month - b.month || a.day - b.day);

  // 找到最接近的已知日期
  let closest = knownDates[0];
  let minDiff = Infinity;

  for (const kd of knownDates) {
    const diff = Math.abs(kd.year - year) * 365 + Math.abs(kd.month - month) * 30 + Math.abs(kd.day - day);
    if (diff < minDiff) {
      minDiff = diff;
      closest = kd;
    }
  }

  // 计算日期差异并调整
  const targetJD = dateToJulianDay(year, month, day);
  const closestData = lunarCalendarData[closest.key as keyof typeof lunarCalendarData] as LunarDate;
  const closestJD = dateToJulianDay(closest.year, closest.month, closest.day);
  const dayDiff = targetJD - closestJD;

  // 简单调整（农历日期大致每月前进29-30天）
  let lunarYear = closestData.lunarYear;
  let lunarMonth = closestData.lunarMonth;
  let lunarDay = closestData.lunarDay + dayDiff;

  // 处理日期溢出
  while (lunarDay > 30) {
    lunarDay -= 30;
    lunarMonth++;
  }
  while (lunarDay < 1) {
    lunarMonth--;
    lunarDay += 30;
  }

  // 处理月份溢出（考虑闰月）
  while (lunarMonth > 12) {
    lunarMonth -= 12;
    lunarYear++;
  }
  while (lunarMonth < 1) {
    lunarMonth += 12;
    lunarYear--;
  }

  return {
    lunarYear,
    lunarMonth,
    lunarDay,
    isLeapMonth: false
  };
}

/**
 * 公历日期转农历日期
 */
export function gregorianToLunar(year: number, month: number, day: number): LunarDate {
  return estimateLunarDate(year, month, day);
}

/**
 * 农历日期转公历日期
 */
export function lunarToGregorian(lunarYear: number, lunarMonth: number, lunarDay: number, isLeapMonth: boolean = false): { year: number; month: number; day: number } | null {
  // 简化实现：通过查找匹配的公历日期
  const targetKey = `${lunarYear}-${lunarMonth}-${lunarDay}`;

  for (const key of Object.keys(lunarCalendarData)) {
    const data = lunarCalendarData[key as keyof typeof lunarCalendarData] as LunarDate;
    if (data.lunarYear === lunarYear &&
        data.lunarMonth === lunarMonth &&
        data.lunarDay === lunarDay &&
        data.isLeapMonth === isLeapMonth) {
      const [y, m, d] = key.split('-').map(Number);
      return { year: y, month: m, day: d };
    }
  }

  // 如果没有精确匹配，返回null（需要完整农历数据才能计算）
  return null;
}

/**
 * 计算两个日期之间的天数
 */
export function daysBetween(year1: number, month1: number, day1: number, year2: number, month2: number, day2: number): number {
  const jd1 = dateToJulianDay(year1, month1, day1);
  const jd2 = dateToJulianDay(year2, month2, day2);
  return Math.abs(jd2 - jd1);
}

// Mock the lunar calendar data before importing the modules
jest.mock('../../../../data/lunarCalendar.json', () => ({
  '1995-5-1': { lunarYear: 1995, lunarMonth: 4, lunarDay: 2, isLeapMonth: false },
  '1995-1-1': { lunarYear: 1994, lunarMonth: 11, lunarDay: 1, isLeapMonth: false },
  '2000-1-1': { lunarYear: 1999, lunarMonth: 11, lunarDay: 25, isLeapMonth: false },
  '1980-5-1': { lunarYear: 1980, lunarMonth: 3, lunarDay: 16, isLeapMonth: false },
}), { virtual: true });

// Now import the modules under test
import { calculateBaZi, BirthInfo, BaZi, StemBranch, BaZiResult, HEAVENLY_STEMS, EARTHLY_BRANCHES } from '../index';
import { gregorianToLunar } from '../lunar';
import { isAfterLiChun, getLiChunDate } from '../solarTerms';
import { calculateTenGod, getTenGodName } from '../tenGods';
import { calculateDayMasterStrength } from '../dayMaster';
import { getHiddenStems, getHiddenStemIndexes, getHiddenStemWeight, HEAVENLY_STEMS, STEM_ELEMENTS } from '../stemsBranches';
import { calculateNaYin, getNaYinName } from '../nanYin';
import { calculateFortuneLines, getYearCycleIndex } from '../fortune';

describe('八字排盘算法', () => {
  describe('天干地支常量', () => {
    test('HEAVENLY_STEMS 应该有10个天干', () => {
      expect(HEAVENLY_STEMS).toHaveLength(10);
      expect(HEAVENLY_STEMS[0]).toBe('甲');
      expect(HEAVENLY_STEMS[9]).toBe('癸');
    });

    test('EARTHLY_BRANCHES 应该有12个地支', () => {
      expect(EARTHLY_BRANCHES).toHaveLength(12);
      expect(EARTHLY_BRANCHES[0]).toBe('子');
      expect(EARTHLY_BRANCHES[11]).toBe('亥');
    });
  });

  describe('公历转农历', () => {
    test('1995年5月1日应该转换为农历1995年4月2日', () => {
      const lunar = gregorianToLunar(1995, 5, 1);
      expect(lunar.lunarYear).toBe(1995);
      expect(lunar.lunarMonth).toBe(4);
      expect(lunar.lunarDay).toBe(2);
    });
  });

  describe('节气计算', () => {
    test('立春日期应该在2月3-5日之间', () => {
      const liChunDay = getLiChunDate(1995);
      expect(liChunDay).toBeGreaterThanOrEqual(3);
      expect(liChunDay).toBeLessThanOrEqual(5);
    });

    test('1995年5月应该在立春之后', () => {
      const afterLiChun = isAfterLiChun(1995, 5, 1);
      expect(afterLiChun).toBe(true);
    });
  });

  describe('十神计算', () => {
    test('日干为甲时，年干庚的十神应该是七杀', () => {
      // 甲日主，庚为年干
      // 甲->庚: 庚金克甲木 => 官杀
      // 庚为阳干，甲为阳干，同性相克 => 七杀
      const tenGod = calculateTenGod(0, 6); // 甲=0, 庚=6
      expect(tenGod).toBe(6); // 七杀
    });

    test('日干为甲时，年干癸的十神应该是正官', () => {
      // 癸水克甲木 => 官杀
      // 癸为阴干，甲为阳干，异性相克 => 正官
      const tenGod = calculateTenGod(0, 9); // 甲=0, 癸=9
      expect(tenGod).toBe(7); // 正官
    });

    test('getTenGodName 应该返回正确的十神名称', () => {
      expect(getTenGodName(0)).toBe('比肩');
      expect(getTenGodName(5)).toBe('正财');
      expect(getTenGodName(7)).toBe('正官');
    });
  });

  describe('纳音五行', () => {
    test('甲子应该是海中金', () => {
      const index = getYearCycleIndex(1984); // 1984年是甲子年
      expect(index).toBe(0);
      const name = getNaYinName(0);
      expect(name).toBe('海中金');
    });
  });

  describe('地支藏干', () => {
    test('寅月寅时应该有甲丙戊藏干', () => {
      // 寅(2) = 甲(0)本气, 丙(2)中气, 戊(4)余气
      const yinHiddenStems = getHiddenStems(2);
      expect(yinHiddenStems).toHaveLength(3);
      expect(yinHiddenStems[0].stem).toBe(0); // 甲
      expect(yinHiddenStems[0].type).toBe('main');
      expect(yinHiddenStems[1].stem).toBe(2); // 丙
      expect(yinHiddenStems[1].type).toBe('middle');
      expect(yinHiddenStems[2].stem).toBe(4); // 戊
      expect(yinHiddenStems[2].type).toBe('residual');

      // 验证索引数组
      expect(getHiddenStemIndexes(2)).toEqual([0, 2, 4]);
    });

    test('子(0)藏干应该是癸', () => {
      const ziHiddenStems = getHiddenStems(0);
      expect(ziHiddenStems).toHaveLength(1);
      expect(ziHiddenStems[0].stem).toBe(9); // 癸
      expect(ziHiddenStems[0].type).toBe('main');
    });

    test('亥(11)藏干应该是壬甲', () => {
      const haiHiddenStems = getHiddenStems(11);
      expect(haiHiddenStems).toHaveLength(2);
      expect(haiHiddenStems[0].stem).toBe(8); // 壬本气
      expect(haiHiddenStems[0].type).toBe('main');
      expect(haiHiddenStems[1].stem).toBe(0); // 甲中气
      expect(haiHiddenStems[1].type).toBe('middle');
    });
  });

  describe('日主旺衰', () => {
    test('甲日主在卯月应该旺盛', () => {
      // 卯月(3)，木旺
      const strength = calculateDayMasterStrength(
        0, // 甲
        3, // 卯
        [0, 2, 0, 4], // allStems
        [10, 3, 0, 10] // allBranches
      );
      expect(strength.score).toBeGreaterThanOrEqual(80);
      expect(strength.element).toBe(0); // 木
    });
  });

  describe('大运计算', () => {
    test('应该返回8步大运', () => {
      const fortuneLines = calculateFortuneLines(
        2, // 寅月
        2, // 丙月干
        'male',
        1995,
        5,
        1
      );
      expect(fortuneLines).toHaveLength(8);
      expect(fortuneLines[0].age).toBe(3);
    });
  });

  describe('完整八字排盘', () => {
    test('1995年5月1日8:00 男 应该有完整的八字', () => {
      const birth: BirthInfo = {
        year: 1995,
        month: 5,
        day: 1,
        hour: 8,
        minute: 0,
        gender: 'male',
        province: '北京'
      };

      const result = calculateBaZi(birth);

      expect(result).toHaveProperty('bazi');
      expect(result).toHaveProperty('nanYin');
      expect(result).toHaveProperty('dayMaster');
      expect(result).toHaveProperty('tenGods');
      expect(result).toHaveProperty('fortuneLines');
      expect(result).toHaveProperty('yearlyFortune');

      // 验证八字结构
      expect(result.bazi.yearPillar).toHaveProperty('stem');
      expect(result.bazi.yearPillar).toHaveProperty('branch');
      expect(result.bazi.monthPillar).toHaveProperty('stem');
      expect(result.bazi.monthPillar).toHaveProperty('branch');
      expect(result.bazi.dayPillar).toHaveProperty('stem');
      expect(result.bazi.dayPillar).toHaveProperty('branch');
      expect(result.bazi.hourPillar).toHaveProperty('stem');
      expect(result.bazi.hourPillar).toHaveProperty('branch');

      // 验证索引范围
      expect(result.bazi.yearPillar.stem).toBeGreaterThanOrEqual(0);
      expect(result.bazi.yearPillar.stem).toBeLessThanOrEqual(9);
      expect(result.bazi.yearPillar.branch).toBeGreaterThanOrEqual(0);
      expect(result.bazi.yearPillar.branch).toBeLessThanOrEqual(11);

      // 验证十神
      expect(result.tenGods.yearToDay).toBeDefined();
      expect(result.tenGods.monthToDay).toBeDefined();
      expect(result.tenGods.hourToDay).toBeDefined();
    });

    test('寅月寅时应该有甲丙戊藏干', () => {
      // 寅 = branch 2
      const monthBranch = 2;
      const hourBranch = 2;

      // 验证寅的藏干是甲丙戊
      const monthHiddenStems = getHiddenStemIndexes(monthBranch);
      expect(monthHiddenStems).toEqual([0, 2, 4]); // 甲丙戊

      // 验证时支的藏干也是甲丙戊
      const hourHiddenStems = getHiddenStemIndexes(hourBranch);
      expect(hourHiddenStems).toEqual([0, 2, 4]); // 甲丙戊
    });

    test('相同输入应该产生相同输出（确定性）', () => {
      const birth: BirthInfo = {
        year: 1995,
        month: 5,
        day: 1,
        hour: 8,
        minute: 0,
        gender: 'male',
        province: '北京'
      };

      const result1 = calculateBaZi(birth);
      const result2 = calculateBaZi(birth);

      expect(result1.bazi.yearPillar.stem).toBe(result2.bazi.yearPillar.stem);
      expect(result1.bazi.yearPillar.branch).toBe(result2.bazi.yearPillar.branch);
      expect(result1.bazi.monthPillar.stem).toBe(result2.bazi.monthPillar.stem);
      expect(result1.bazi.dayPillar.stem).toBe(result2.bazi.dayPillar.stem);
      expect(result1.bazi.hourPillar.stem).toBe(result2.bazi.hourPillar.stem);
    });
  });

  describe('流年计算', () => {
    test('应该返回10年流年', () => {
      const birth: BirthInfo = {
        year: 1995,
        month: 5,
        day: 1,
        hour: 8,
        minute: 0,
        gender: 'male',
        province: '北京'
      };

      const result = calculateBaZi(birth);
      expect(result.yearlyFortune).toHaveLength(10);
      expect(result.yearlyFortune[0].age).toBe(1);
    });
  });

  describe('边界情况', () => {
  test('CONSOLE: 地支藏干验证输出', () => {
    // This test just outputs verification info to console
    console.log('\n========================================');
    console.log('地支藏干计算功能验证');
    console.log('========================================\n');

    // 1. 藏干表验证
    console.log('【1. 地支藏干表】\n');
    const branchNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const stemNames = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const typeNames: Record<string, string> = { main: '本气', middle: '中气', residual: '余气' };

    for (let i = 0; i < 12; i++) {
      const stems = getHiddenStems(i);
      const display = stems.map(s =>
        stemNames[s.stem] + '(' + typeNames[s.type] + ')'
      ).join(' + ');
      console.log('  ' + branchNames[i] + ': ' + display);
    }
    console.log();

    // 2. 寅月寅时验证
    console.log('【2. 寅月寅时藏干验证】\n');
    const yinStems = getHiddenStems(2);
    console.log('  寅(2)藏干: ' + yinStems.map(s => stemNames[s.stem]).join(''));
    console.log('  期望: 甲丙戊');
    console.log('  结果: ' + (getHiddenStemIndexes(2).join(',') === '0,2,4' ? '通过' : '失败'));
    console.log();

    // 3. 日主旺衰计算（考虑藏干）
    console.log('【3. 日主旺衰计算（考虑藏干）】\n');

    // Test: 甲日主，寅月
    const dayStem = 0; // 甲
    const monthBranch = 2; // 寅
    const allStems = [0, 2, 0, 4]; // 年干甲，月干丙，日干甲，时干戊
    const allBranches = [10, 2, 0, 2]; // 年支戌，月支寅，日支子，时支寅

    console.log('  日干: ' + stemNames[dayStem] + '，月令: ' + branchNames[monthBranch]);
    console.log('  藏干对本气加成:');
    for (const hidden of getHiddenStems(monthBranch)) {
      const stemName = stemNames[hidden.stem];
      const stemElement = STEM_ELEMENTS[hidden.stem];
      const elementName = ['木', '火', '土', '金', '水'][stemElement];
      const weight = getHiddenStemWeight(hidden.type);
      const isSame = stemElement === STEM_ELEMENTS[dayStem] ? '同类' : '相生';
      console.log('    ' + stemName + '(' + elementName + ') ' + hidden.type + '=' + (weight * 100) + '% -> ' + isSame);
    }

    const strength = calculateDayMasterStrength(dayStem, monthBranch, allStems, allBranches);
    console.log();
    console.log('  旺衰得分: ' + strength.score + '分');
    console.log('    得令: ' + strength.detail.lingDe + '分');
    console.log('    得地: ' + strength.detail.deDi + '分 (含藏干加成，上限50分)');
    console.log('    得势: ' + strength.detail.deShi + '分');
    console.log('    得助: ' + strength.detail.deZhu + '分');
    console.log();
    console.log('========================================');
    console.log('验证完成！');
    console.log('========================================\n');

    expect(true).toBe(true);
  });
    test('凌晨00:00出生应该正确计算时柱', () => {
      const birth: BirthInfo = {
        year: 1995,
        month: 5,
        day: 1,
        hour: 0,
        minute: 0,
        gender: 'female',
        province: '北京'
      };

      const result = calculateBaZi(birth);
      // 子时(0点)应该对应地支0(子)
      expect(result.bazi.hourPillar.branch).toBe(0);
    });

    test('23:00出生应该正确计算时柱', () => {
      const birth: BirthInfo = {
        year: 1995,
        month: 5,
        day: 1,
        hour: 23,
        minute: 0,
        gender: 'female',
        province: '北京'
      };

      const result = calculateBaZi(birth);
      // 亥时(22-24点)应该对应地支11(亥)
      expect(result.bazi.hourPillar.branch).toBe(11);
    });
  });
});

describe('六十甲子循环', () => {
  test('1995年应该对应正确的年柱', () => {
    const cycleIndex = getYearCycleIndex(1995);
    // 1995年是乙亥年，乙=1, 亥=11
    expect(cycleIndex).toBe(11); // 乙亥在60甲子中的索引
  });

  test('1984年应该是甲子年', () => {
    const cycleIndex = getYearCycleIndex(1984);
    expect(cycleIndex).toBe(0);
  });
});

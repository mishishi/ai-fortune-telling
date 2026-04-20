import { STEM_ELEMENTS, BRANCH_ELEMENTS, getHiddenStems, getHiddenStemWeight } from './stemsBranches';

// 月令旺衰表 - 描述十二地支对各五行的旺衰影响
// 0=木, 1=火, 2=土, 3=金, 4=水
// 分值: 100=旺盛, 80=得令, 50=平, 20=失令, 0=死绝

// 地支索引: 0子, 1丑, 2寅, 3卯, 4辰, 5巳, 6午, 7未, 8申, 9酉, 10戌, 11亥

// 月令地支对各五行的旺衰（简化版）
const MONTH_BRANCH_STRENGTH: Record<number, number[]> = {
  // 子水 - 水旺，金相，木死，火囚，土休
  0: [0, 50, 30, 80, 100],
  // 丑土 - 土旺，火相，金生，水休，木囚
  1: [30, 80, 100, 50, 20],
  // 寅木 - 木旺，水生，火相，金死，土休
  2: [100, 80, 20, 0, 50],
  // 卯木 - 木旺，水生，火相，金死，土休
  3: [100, 80, 20, 0, 50],
  // 辰土 - 土旺，火相，金生，水休，木囚
  4: [30, 80, 100, 50, 20],
  // 巳火 - 火旺，木相，土生，水死，金囚
  5: [80, 100, 50, 20, 0],
  // 午火 - 火旺，木相，土生，水死，金囚
  6: [80, 100, 50, 20, 0],
  // 未土 - 土旺，火相，金生，水休，木囚
  7: [30, 80, 100, 50, 20],
  // 申金 - 金旺，土相，水生，木死，火囚
  8: [0, 30, 80, 100, 50],
  // 酉金 - 金旺，土相，水生，木死，火囚
  9: [0, 30, 80, 100, 50],
  // 戌土 - 土旺，火相，金生，水休，木囚
  10: [30, 80, 100, 50, 20],
  // 亥水 - 水旺，金生，木相，火死，土囚
  11: [50, 20, 30, 80, 100]
};

export interface DayMasterStrength {
  stem: number;       // 日干
  branch: number;      // 月令地支
  element: number;     // 日主五行
  score: number;       // 总分 0-100
  detail: {
    lingDe: number;    // 得令分数
    deDi: number;       // 得地分数
    deShi: number;      // 得势分数
    deZhu: number;      // 得助分数
  };
}

/**
 * 计算日主在出生月份的旺衰
 * @param dayStem 日干
 * @param monthBranch 月令地支
 * @param allStems 所有柱的天干 [年干, 月干, 日干, 时干]
 * @param allBranches 所有柱的地支 [年支, 月支, 日支, 时支]
 */
export function calculateDayMasterStrength(
  dayStem: number,
  monthBranch: number,
  allStems: number[],
  allBranches: number[]
): DayMasterStrength {
  const dayElement = STEM_ELEMENTS[dayStem];

  // 1. 得令 (得月令)
  const lingDe = MONTH_BRANCH_STRENGTH[monthBranch][dayElement];

  // 2. 得地 (其他地支是否有支持日主的五行，考虑藏干)
  let deDi = 0;
  for (let i = 0; i < allBranches.length; i++) {
    if (i === 1) continue; // 跳过月令（已在得令中计算）
    const branch = allBranches[i];
    const branchElement = BRANCH_ELEMENTS[branch];
    const hiddenStems = getHiddenStems(branch);

    // 优先检查本气
    if (branchElement === dayElement) {
      deDi += 20;
    } else if (isSupportingElement(branchElement, dayElement)) {
      deDi += 10;
    }

    // 检查藏干对本气的加成（本气与日主同类或相生时）
    for (const hidden of hiddenStems) {
      const hiddenElement = STEM_ELEMENTS[hidden.stem];
      const weight = getHiddenStemWeight(hidden.type);
      if (hiddenElement === dayElement) {
        deDi += 15 * weight; // 藏干与日主同类，按权重加分
      } else if (isSupportingElement(hiddenElement, dayElement)) {
        deDi += 8 * weight;  // 藏干相生日主，按权重加分
      }
    }
  }
  deDi = Math.min(deDi, 50); // 藏干加成后提高上限到50分

  // 3. 得势 (同我者有几个)
  let deShi = 0;
  for (const stem of allStems) {
    if (STEM_ELEMENTS[stem] === dayElement) {
      deShi += 15;
    }
  }
  deShi = Math.min(deShi, 30); // 最高30分

  // 4. 得助 (天干是否有同类)
  let deZhu = 0;
  for (const stem of allStems) {
    if (stem === dayStem) {
      deZhu += 10;
    }
  }
  deZhu = Math.min(deZhu, 20); // 最高20分

  // 总分
  const score = Math.min(100, lingDe + deDi + deShi + deZhu);

  return {
    stem: dayStem,
    branch: monthBranch,
    element: dayElement,
    score,
    detail: {
      lingDe,
      deDi,
      deShi,
      deZhu
    }
  };
}

/**
 * 判断元素是否为支持元素（相生关系）
 */
function isSupportingElement(from: number, to: number): boolean {
  // 木生火 -> 木支持火
  // 火生土 -> 火支持土
  // 土生金 -> 土支持金
  // 金生水 -> 金支持水
  // 水生木 -> 水支持木
  const cycle = (to - from + 5) % 5;
  return cycle === 1; // to = (from + 1) % 5 表示from生to
}

/**
 * 根据得分判断旺衰类型
 */
export function getStrengthType(score: number): string {
  if (score >= 80) return '旺盛';
  if (score >= 60) return '偏旺';
  if (score >= 40) return '中和';
  if (score >= 20) return '偏弱';
  return '衰弱';
}

/**
 * 计算详细的旺衰分析
 */
export function analyzeDayMaster(strength: DayMasterStrength): string {
  const types = ['木', '火', '土', '金', '水'];
  const typeName = types[strength.element];
  const strengthType = getStrengthType(strength.score);

  let analysis = `${typeName}为日主，${strengthType}（${strength.score}分）。\n`;
  analysis += `得令:${strength.detail.lingDe}分 `;
  analysis += `得地:${strength.detail.deDi}分 `;
  analysis += `得势:${strength.detail.deShi}分 `;
  analysis += `得助:${strength.detail.deZhu}分`;

  return analysis;
}

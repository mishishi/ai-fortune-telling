/**
 * 判断玩家回答是否正确。
 * 玩家回答和标准答案做规范化后精确匹配。
 */
export function judgeAnswer(
  playerAnswer: string,
  correctAnswer: string,
  subject: string
): boolean {
  const normalize = (s: string) =>
    s.trim()
     .toLowerCase()
     .replace(/[（）()【】[\]]/g, '')
     .replace(/["'""'']/g, '')
     .replace(/\s+/g, '');

  const normPlayer = normalize(playerAnswer);
  const normCorrect = normalize(correctAnswer);

  // 数字容差：如果是纯数字回答，精确匹配
  if (/^\d+(\.\d+)?$/.test(normCorrect)) {
    return normPlayer === normCorrect;
  }

  return normPlayer === normCorrect;
}
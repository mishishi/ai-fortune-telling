import { Level } from '../types/game';
import { AsyncAnswer } from '../types/season';

const AI_CORRECTION_RATES: Record<Level, number> = {
  Lv1: 0.90,  // 90% 正确率
  Lv2: 0.75,  // 75%
  Lv3: 0.55,  // 55%
  Lv4: 0.40,  // 40%
};

/**
 * 模拟 AI 作答 — 按难度固定概率掷骰决定对错
 * 不调用任何外部 API，纯本地随机
 */
export function simulateAiAnswer(
  subject: string,
  level: Level,
  questionId: string,
  aiQuestion: string,
  aiOptions: string[],
  aiCorrectAnswer: string
): AsyncAnswer {
  const rate = AI_CORRECTION_RATES[level];
  const correct = Math.random() < rate;

  // AI 选错时，从剩余选项中随机选一个
  const allLetters = ['A', 'B', 'C', 'D'];
  const aiAnswer = correct
    ? aiCorrectAnswer
    : allLetters.filter(l => l !== aiCorrectAnswer)[Math.floor(Math.random() * 3)];

  return {
    subject,
    level,
    questionId,
    answer: correct ? 'AI_CORRECT' : 'AI_WRONG',
    aiAnswer,
    aiQuestion,
    aiOptions,
    aiCorrectAnswer,
    correct,
    xpEarned: 0, // AI 不获取 XP
  };
}

/**
 * 批量模拟 AI 本回合所有题目的作答
 */
export function simulateAiTurn(
  questions: Array<{
    subject: string;
    level: Level;
    questionId: string;
    aiQuestion: string;
    aiOptions: string[];
    aiCorrectAnswer: string;
  }>
): AsyncAnswer[] {
  return questions.map(({ subject, level, questionId, aiQuestion, aiOptions, aiCorrectAnswer }) =>
    simulateAiAnswer(subject, level, questionId, aiQuestion, aiOptions, aiCorrectAnswer)
  );
}

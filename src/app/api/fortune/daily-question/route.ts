import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { chat, ChatMessage } from '@/lib/minimax';

const QUESTION_PROMPT = `你是一位专业的八字命理师。用户问了一个关于今日决策的问题。
请结合用户的八字数据和今日运势，给出「是/否/需权衡」的回答。

回答格式（严格遵守，每行一个字段）：
ANSWER: 是 | 否 | 需权衡
REASON: 原因分析，50字以内

规则：
1. ANSWER 只能是一个词：是 / 否 / 需权衡
2. REASON 必须结合今日运势评分（事业/感情/财运/健康）和八字特点
3. 如果今日某方面运势分数 >= 75 分，可给正面建议
4. 如果今日某方面运势分数 < 65 分，给负面或保守建议
5. 语气坚定，不模糊`;

function getDateStr(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, userId } = body;

    if (!question || !question.trim()) {
      return NextResponse.json({ error: '问题不能为空' }, { status: 400 });
    }

    if (!userId || userId === 'anonymous') {
      return NextResponse.json({ error: '请先登录后使用' }, { status: 401 });
    }

    const db = getDb();
    const today = getDateStr();

    // Check if already asked today
    const existing = db.prepare(
      'SELECT * FROM daily_questions WHERE userId = ? AND date(createdAt) = ?'
    ).get(userId, today) as any;

    if (existing) {
      return NextResponse.json({
        error: '今日已问过',
        canAsk: false,
        existingAnswer: {
          question: existing.question,
          answer: existing.answer,
          reason: existing.answerType,
        },
      });
    }

    // Get user's latest report
    const reports = db.prepare(
      'SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC LIMIT 1'
    ).all(userId) as any[];

    if (reports.length === 0) {
      return NextResponse.json({
        error: '请先生成八字报告',
        needReport: true,
      });
    }

    const report = reports[0];

    // Parse radar scores
    let radarScores = { career: 75, love: 75, wealth: 75, health: 75 };
    try {
      radarScores = JSON.parse(report.radarScores || '{"career":75,"love":75,"wealth":75,"health":75}');
    } catch (e) { /* use defaults */ }

    // Call AI
    const messages: ChatMessage[] = [
      { role: 'system', content: QUESTION_PROMPT },
      {
        role: 'user',
        content: `用户问题：${question}\n\n用户八字概述：事业${radarScores.career}分，感情${radarScores.love}分，财运${radarScores.wealth}分，健康${radarScores.health}分`,
      },
    ];

    const response = await chat(messages);

    // Parse response
    const answerMatch = response.match(/^ANSWER:\s*(是|否|需权衡)/m);
    const reasonMatch = response.match(/^REASON:\s*(.+)/m);

    const answerType = answerMatch ? answerMatch[1] : '需权衡';
    const reason = reasonMatch ? reasonMatch[1].trim() : '今日运势平稳，建议谨慎决策';

    // Save to database
    const id = `dq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    db.prepare(
      'INSERT INTO daily_questions (id, userId, question, answer, answerType, reportId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, userId, question.trim(), answerType, reason, report.id, createdAt);

    return NextResponse.json({
      id,
      answer: answerType,
      reason,
      question: question.trim(),
      canAsk: false,
    });
  } catch (error) {
    console.error('Error in daily question:', error);
    return NextResponse.json({ error: '提问失败，请重试' }, { status: 500 });
  }
}

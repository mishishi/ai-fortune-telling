import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatMessage } from '@/lib/minimax';

const DIMENSION_PROMPTS: Record<string, string> = {
  career: '你是一位资深职业命理顾问，擅长通过八字分析事业运势。请根据用户的问题，结合其八字命盘给出专业、实用的建议。回答要简洁有条理，不超过150字。',
  love: '你是一位专业的情感命理师，擅长八字合婚与感情运势分析。请根据用户的八字和具体问题，给出温暖而专业的指导。回答要简洁，不超过150字。',
  wealth: '你是一位资深的财富命理顾问，精通五行生克与财运走势分析。请结合用户的八字，提供实用的财富运势建议。回答简洁明了，不超过150字。',
  health: '你是一位中医世家传承的命理健康顾问，擅长通过八字判断健康走势。请结合用户八字给出实用的健康建议。回答温和而不失专业，不超过150字。',
  mentor: '你是一位精通人际命理的贵人分析师，擅长通过八字判断贵人方位和类型。请结合用户八字给出实用的人际关系建议。回答简洁，不超过150字。',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, dimension = 'career', reportId, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages is required' }, { status: 400 });
    }

    const dimensionPrompt = DIMENSION_PROMPTS[dimension] || DIMENSION_PROMPTS.career;

    const systemMessage: ChatMessage = {
      role: 'system',
      content: `${dimensionPrompt}

当前用户已有一份完整的八字报告。以下是用户在该维度的基础信息：
${context || '暂无基础信息，请根据八字命盘推断。'}

请回答用户的后续问题，保持专业、简洁、可操作。`,
    };

    const chatMessages: ChatMessage[] = [systemMessage];
    messages.forEach((msg: { role: string; content: string }) => {
      chatMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
    });

    const response = await chat(chatMessages);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in report chat:', error);
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
}
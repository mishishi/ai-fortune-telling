import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatMessage } from '@/lib/minimax';

const SYSTEM_PROMPT = `你是一位经验丰富的AI命理师，擅长八字命理分析。你的职责是通过与用户互动，了解他们最想关注的命理领域。

互动规则：
1. 首先友好问候，简短介绍自己
2. 询问用户最想了解哪个方面：事业、感情、财运还是健康
3. 可以根据用户选择追问1-2个具体问题以获得更精准的分析
4. 每次回复要简洁温馨，不超过100字
5. 当信息足够时，说"开始生成报告"结束对话

注意：不要一次问太多问题，保持对话自然流畅。`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, conversationHistory = [] } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages is required and must be an array' }, { status: 400 });
    }

    // Build the message list with system prompt and conversation history
    const systemMessage: ChatMessage = { role: 'system', content: SYSTEM_PROMPT };
    const chatMessages: ChatMessage[] = [systemMessage];

    // Add conversation history
    conversationHistory.forEach((msg: { role: string; content: string }) => {
      chatMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
    });

    // Add current messages
    messages.forEach((msg: { role: string; content: string }) => {
      chatMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
    });

    const response = await chat(chatMessages);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
}

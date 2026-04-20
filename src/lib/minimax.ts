const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || '';
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(messages: ChatMessage[], retries = 1): Promise<string> {
  // If no API key, return mock response for development
  if (!MINIMAX_API_KEY) {
    return mockChatResponse(messages);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutMs = 300000; // 5 minute timeout
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.7-highspeed',
          messages,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Minimax API error: ${response.status}`);
      }

      const data = await response.json();

      // Check for API-level errors (Minimax returns 200 but sets status_code in base_resp)
      if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== undefined) {
        console.error(`Minimax API error: ${data.base_resp.status_code} - ${data.base_resp.status_msg}`);
        // Fall back to mock response
        return mockChatResponse(messages);
      }

      return data.choices?.[0]?.message?.content || '';
    } catch (e) {
      clearTimeout(timeoutId);
      lastError = e instanceof Error ? e : new Error(String(e));

      if (attempt < retries) {
        console.log(`Minimax API attempt ${attempt + 1} failed: ${lastError.message}. Retrying...`);
        // Wait 2 seconds before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // All retries exhausted, throw the last error
  throw lastError || new Error('Minimax API failed after retries');

  if (!response.ok) {
    throw new Error(`Minimax API error: ${response.status}`);
  }

  const data = await response.json();

  // Check for API-level errors (Minimax returns 200 but sets status_code in base_resp)
  if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== undefined) {
    console.error(`Minimax API error: ${data.base_resp.status_code} - ${data.base_resp.status_msg}`);
    // Fall back to mock response
    return mockChatResponse(messages);
  }

  return data.choices?.[0]?.message?.content || '';
}

function mockChatResponse(messages: ChatMessage[]): string {
  // Return a simple mock response for development
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  const fullPrompt = messages.map(m => m.content).join('');

  // Check if this is an analysis request (has radarScores pattern in system prompt)
  if (fullPrompt.includes('radarScores') || fullPrompt.includes('命盘分析')) {
    // Return proper JSON format for analyze endpoint
    return JSON.stringify({
      radarScores: {
        career: 78,
        love: 65,
        wealth: 72,
        health: 80,
        mentor: 85
      },
      analysis: {
        overall: '命局气势平衡，五行流通有情。日主得令有力，身强者创业能力強，适应性佳。少年时期运势平稳，中年后事业财运逐步上升。',
        career: '事业心强，善于把握机遇。适合创业或管理岗位，40岁前后有事业突破。贵人运佳，能得上司提携。忌冒险激进，稳扎稳打方为上策。',
        love: '感情运势中等，早年桃花一般，晚婚倾向明显。婚后感情稳定，注意沟通避免冷战。单身者宜通过朋友介绍或工作场合结识异性。',
        wealth: '理财观念良好，赚钱能力中等偏上。正财稳定，偏财运一般。40岁后财运渐入佳境，注意避免大额投资冒险。',
        health: '身体健康良好，偶有亚健康问题。注意脾胃和肝胆保养，规律作息能有效提升健康运势。',
        fortune: '未来十年大运走势良好，特别是35-45岁期间，事业发展顺利，财运稳步上升。',
        yearly: '今年流年运势平稳，上半年有进展，下半年防破财。'
      }
    });
  }

  if (lastUserMessage.includes('事业') || lastUserMessage.includes('career')) {
    return '根据您的八字，您的事业运势非常旺盛，在未来几年有很好的发展机遇...';
  }
  if (lastUserMessage.includes('感情') || lastUserMessage.includes('love')) {
    return '您的感情运势呈现稳步上升趋势，单身者有望遇到心仪的对象...';
  }
  if (lastUserMessage.includes('财运') || lastUserMessage.includes('wealth')) {
    return '财运方面，您近期有不错的投资机会，但也需要注意控制支出...';
  }
  if (lastUserMessage.includes('健康') || lastUserMessage.includes('health')) {
    return '健康运势总体平稳，建议注意作息规律，适当运动...';
  }
  if (lastUserMessage.includes('开始生成报告')) {
    return '好的，准备工作已完成，现在开始生成您的命盘分析报告。';
  }
  return '好的，我已经了解了您的基本信息。请问您最想了解哪个方面？事业、感情、财运还是健康？';
}

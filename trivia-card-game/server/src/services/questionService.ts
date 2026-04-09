import { Subject, Level, Question } from '../types/game';

function getNarrativePrompt(subject: Subject): string {
  const map: Record<Subject, string> = {
    '语文':   '你正在破解一段加密的语言碎片',
    '数学':   '你正在解密一个安全协议的方程式',
    '英语':   '你正在翻译一段跨语言数据流',
    '科学':   '你正在校准生物/物理传感器模块',
    '历史':   '你正在调取一段历史数据存档',
    '地理':   '你正在定位某个地表坐标节点',
    '生物':   '你正在破解一段基因序列',
    '道法':   '你正在通过一个伦理协议验证',
  };
  return map[subject];
}

function getLevelGuidance(level: Level): string {
  const map: Record<Level, string> = {
    Lv1: '基础概念题，直接记忆性内容，题型为填空或简单选择，答案明确简短',
    Lv2: '理解应用题，需要简单计算或推导，答案一般为数字或词语',
    Lv3: '综合运用题，多步骤或跨知识点，答案需要一定推理',
    Lv4: '高难度挑战题，接近竞赛级别，复杂推理，答案可能有多个步骤',
  };
  return map[level];
}

function getTimeLimit(level: Level): number {
  return { Lv1: 15, Lv2: 12, Lv3: 10, Lv4: 8 }[level];
}

export async function generateQuestion(
  subject: Subject,
  level: Level,
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<Question> {
  const systemPrompt = `你是"赛博空间知识对战游戏"的AI出题器。
【强制规则】你只能输出一行纯JSON，不能输出任何其他文字、符号或格式。
JSON格式：
{"narrative":"赛博叙事(20字内)","question":"题目","answer":"答案"}
不要输出markdown代码块，不要输出emoji，不要输出任何解释。`;

  const userPrompt = `学科=${subject},难度=${level},叙事=${getNarrativePrompt(subject)}
严格输出一行纯JSON：{"narrative":"...","question":"...","answer":"..."}`;

  // Minimax API call (OpenAI-compatible endpoint)
  const url = `${baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Minimax API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json() as { choices?: { finish_reason?: string; message?: { content?: string } }[] };

  const rawContent = data.choices?.[0]?.message?.content?.trim() ?? '';

  if (!rawContent) {
    throw new Error('Empty response from Minimax API');
  }

  // Parse JSON - model outputs thinking text first, JSON is always at the very end
  let parsed: { narrative: string; question: string; answer: string };
  try {
    const lastBrace = rawContent.lastIndexOf('}');
    const jsonSlice = rawContent.slice(0, lastBrace + 1);
    const jsonStart = jsonSlice.lastIndexOf('{');
    const jsonStr = jsonSlice.slice(jsonStart);
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`Failed to parse AI response as JSON: ${rawContent.slice(-300)}`);
  }

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    subject,
    level,
    narrative: parsed.narrative,
    question: parsed.question,
    answer: parsed.answer,
    timeLimit: getTimeLimit(level),
  };
}
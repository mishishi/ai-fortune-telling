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
  const systemPrompt = `你是"赛博空间知识对战游戏"的题目生成器。严格按以下规则出题：

1. 每次出一道题，必须用中文。
2. 题目必须以赛博朋克/黑客入侵叙事包裹，如"你正在破解..."，"入侵数据节点..."等。
3. 题目要有唯一明确答案，答案不能模糊。
4. 严格按以下难度边界出题，不要超出也不要低于：
   - Lv1: ${getLevelGuidance('Lv1')}
   - Lv2: ${getLevelGuidance('Lv2')}
   - Lv3: ${getLevelGuidance('Lv3')}
   - Lv4: ${getLevelGuidance('Lv4')}
5. 答案如果是数字，精确到具体数值，不用"大约"、"左右"等模糊词。
6. 不要在题目、提示或任何地方泄露答案。

输出格式（严格按此 JSON 格式，不要有其他内容）：
{
  "narrative": "描述玩家正在进行的赛博叙事（20字以内）",
  "question": "实际题目内容",
  "answer": "标准答案（填空题为词语，选择题为选项字母，计算题为数字）"
}`;

  const userPrompt = `生成题目：
学科: ${subject}
难度: ${level}
叙事背景: ${getNarrativePrompt(subject)}

请严格按 JSON 格式输出，不要输出其他内容。`;

  // Minimax API call
  const url = `${baseUrl}/text/chatcompletion_v2?GroupId=${apiKey}`;
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
      max_tokens: 500,
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

  // Parse JSON from response
  let parsed: { narrative: string; question: string; answer: string };
  try {
    const jsonMatch = rawContent.match(/```json\n?([\s\S]*?)\n?```/) ?? rawContent.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] ?? jsonMatch[0]) : rawContent;
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${rawContent.slice(0, 200)}`);
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
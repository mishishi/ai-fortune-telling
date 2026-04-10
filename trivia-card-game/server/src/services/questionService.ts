import { Subject, Level, Question } from '../types/game';

export function getLevelStage(level: Level): string {
  return { Lv1: '基础', Lv2: '进阶', Lv3: '提高', Lv4: '拓展' }[level];
}

export function getTimeLimit(level: Level): number {
  return { Lv1: 15, Lv2: 25, Lv3: 35, Lv4: 45 }[level];
}

/**
 * 移除 MiniMax 模型思考标签内容（字符串操作，避免正则特殊字符问题）
 * 支持格式：<think>...</think>
 */
// ---------------------------------------------------------------------------
// 系统提示词缓存 — 服务器启动时预生成，避免每次 API 调用重复拼接字符串
// ---------------------------------------------------------------------------

function buildSystemPrompt(): string {
  return `你是《知识闯关卡牌》的AI出题官。

【难度说明 — 你必须严格遵循用户指定的难度级别】
Lv1（基础）：直白的事实记忆题，选项差异大，一眼能看出答案。
Lv2（进阶）：需要简单理解或应用的题目，错误选项有一定迷惑性。
Lv3（提高）：涉及分析、比较、多步骤推理，或冷门知识，错误选项与正确答案相似度高。
Lv4（拓展）：综合应用、深度理解、边缘知识或逆向思维，所有选项看起来都合理，需仔细辨析。

【格式示例 — 严格模仿以下格式输出，不做任何更改】
题目：世界上面积最大的大洲是哪一个？
A. 北美洲
B. 非洲
C. 亚洲
D. 南美洲
答案：C
解析：亚洲是世界上面积最大的大洲，约占全球陆地总面积的30%。

【必须严格遵守】
- 题型：单选题，必须生成4个选项（A/B/C/D），不允许填空题、不允许简答题、不允许多选题；
- 选项必须是有实际内容的文字，不能是"以上都不对"或"以上都对"；
- 答案必须是且仅是A/B/C/D中的一个字母；
- 输出只能是上述格式的6行，不要markdown代码块、不要加粗、不要任何额外内容；
- 题目要完整，选项要有区分度，错误选项要看起来合理（贴近正确答案）；
- 每次只出1题，不重复出题；
- 严格根据用户指定的难度级别出题：Lv1 要简单、Lv4 要难，难度特征必须在题目本身体现，而不是只改变学科。`;
}

/** 预缓存的 systemPrompt，模块加载时生成 */
const CACHED_SYSTEM_PROMPT = buildSystemPrompt();

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

function stripThinkingBlocks(s: string): string {
  let result = s;
  const openTag = '<think>';
  const closeTag = '</think>';
  while (true) {
    const start = result.indexOf(openTag);
    if (start === -1) break;
    const end = result.indexOf(closeTag, start);
    if (end === -1) break;
    result = result.slice(0, start) + result.slice(end + closeTag.length);
  }
  return result.trim();
}

export async function generateQuestion(
  subject: Subject,
  level: Level,
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<Question> {
  const userPrompt = `学科：${subject}，难度：${level}（${getLevelStage(level)}）的${level}级别题目，出1题`;

  const url = `${baseUrl}/chat/completions`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: CACHED_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 1500,
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Minimax API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  let rawContent: string;
  try {
    const data = await response.json() as { choices?: { finish_reason?: string; message?: { content?: string } }[] };
    rawContent = data.choices?.[0]?.message?.content?.trim() ?? '';
  } catch (e) {
    throw new Error('Failed to parse API response');
  }

  if (!rawContent) {
    throw new Error('Empty response from Minimax API');
  }

  const parsed = parseTextFormat(rawContent);

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    subject,
    level,
    narrative: '',
    question: parsed.question,
    answer: parsed.answer,
    options: parsed.options,
    explanation: parsed.explanation,
    timeLimit: getTimeLimit(level),
  };
}

interface ParsedQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

/**
 * 解析纯文本格式的题目输出
 * AI 可能用全角冒号（：）或半角冒号（:），题目内容也可能跨多行
 */
export function parseTextFormat(raw: string): ParsedQuestion {
  const clean = stripThinkingBlocks(raw);
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

  let question = '';
  let answer = '';
  let explanation = '';
  const options: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 题目行：支持全角或半角冒号；冒号后为题目文本
    if (/^题目[：:]/.test(line)) {
      question = line.replace(/^题目[：:]/, '').trim();
      continue;
    }

    // 答案行：同上
    if (/^答案[：:]/.test(line)) {
      const val = line.replace(/^答案[：:]/, '').trim();
      answer = val.charAt(0).toUpperCase();
      continue;
    }

    // 解析行
    if (/^解析[：:]/.test(line)) {
      explanation = line.replace(/^解析[：:]/, '').trim();
      continue;
    }

    // 选项行 A./B./C./D.
    if (/^[A-D][\.．、]/.test(line)) {
      const multiMatch = line.match(/([A-D])[\.．、]\s*([^A-D]+?)(?=[A-D][\.．、]|$)/g);
      if (multiMatch && multiMatch.length >= 4) {
        for (const m of multiMatch) {
          const letter = m.charAt(0).toUpperCase();
          const text = m.slice(2).trim();
          options.push(`${letter}. ${text}`);
        }
        continue;
      }
      const letter = line.charAt(0).toUpperCase();
      const text = line.slice(2).trim();
      options.push(`${letter}. ${text}`);
      continue;
    }

    // 处理跨多行的题目文本：当前行既不是题目/答案/解析，也不是选项开头，
    // 且前面已有题目但尚未遇到选项或答案时，说明题目内容跨了多行
    if (question && !answer && options.length === 0) {
      // 排除明显是选项但格式不规范的行（如只有ABCD字母开头）
      if (!/^[A-D]$/.test(line)) {
        question += ' ' + line;
        continue;
      }
    }
  }

  question = question.trim();

  if (!explanation) {
    explanation = '（暂无解析）';
  }

  while (options.length < 4) {
    options.push(`${String.fromCharCode(64 + options.length + 1)}. 备选项`);
  }

  const cleanOptions: string[] = [];
  for (let i = 0; i < 4; i++) {
    const expected = String.fromCharCode(65 + i);
    const found = options.find(o => o.charAt(0).toUpperCase() === expected);
    cleanOptions.push(found || `${expected}. 备选项`);
  }

  if (!['A','B','C','D'].includes(answer)) {
    answer = cleanOptions.length > 0 ? cleanOptions[0].charAt(0) : 'A';
  }

  // 如果题目为空但有选项，说明 AI 格式异常，尝试从选项重构题目
  if (!question && cleanOptions.length > 0) {
    question = `请回答以下问题（${cleanOptions[0].charAt(0)} 至 ${cleanOptions[cleanOptions.length - 1].charAt(0)} 选择）`;
  }

  return {
    question,
    options: cleanOptions,
    answer,
    explanation,
  };
}

export async function generateHint(
  question: Question,
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<string> {
  const url = `${baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: `题目：${question.question}\n请给出一个提示（不能说答案），帮助玩家思考。回答格式：直接输出提示语，不超过30字。`
      }],
      temperature: 0.5,
      max_tokens: 100,
    }),
  });

  if (!response.ok) {
    throw new Error(`Minimax API error: ${response.status}`);
  }

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? '提示：再想想';
}

export async function generateExplanation(
  question: Question,
  apiKey: string,
  baseUrl: string,
  model: string
): Promise<string> {
  if (question.explanation) {
    return question.explanation;
  }
  const url = `${baseUrl}/chat/completions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: `题目：${question.question}\n正确答案：${question.answer}\n请详细讲解这道题，涉及的知识点是什么，为什么答案是${question.answer}。讲解要清晰、有教育意义，适合初中生理解，不超过100字。`
      }],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? '抱歉，无法生成讲解。';
}

// ---------------------------------------------------------------------------
// 流式题目光生成 — 边接收边 yield，实时推送推理过程给前端
// ---------------------------------------------------------------------------

/**
 * 流式生成题目，通过 onChunk 回调逐块推送 thinking 内容
 * onChunk(text: string): void — 每收到一块纯文本就调用
 * 返回最终 Question 对象
 */
export async function generateQuestionStream(
  subject: Subject,
  level: Level,
  apiKey: string,
  baseUrl: string,
  model: string,
  onChunk: (text: string) => void,
): Promise<Question> {
  const userPrompt = `学科：${subject}，难度：${level}（${getLevelStage(level)}）的${level}级别题目，出1题`;

  const url = `${baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: CACHED_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 1500,
      stream: true,
      extra_body: { reasoning_split: true },
    }),
  });

  if (!response.ok) {
    throw new Error(`Minimax API error: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('No response body for streaming');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE 格式：每行是 "data: {...}"
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const reasoningDetails = parsed.choices?.[0]?.delta?.reasoning_details;
          const contentDelta = parsed.choices?.[0]?.delta?.content;
          // reasoning_details: 思考过程（reasoning_split: true 时）
          if (reasoningDetails) {
            fullContent += reasoningDetails;
            onChunk(reasoningDetails);
          }
          // content: 包含思考内容和最终题目，两者在 content 中混合
          if (contentDelta) {
            fullContent += contentDelta;
            // 去掉 <think> 和 </think> 标签（保留标签内的英文推理文本）
            // MINIMAX 思考标签：开始=<<think>> 结束=</think>
            const clean = contentDelta
              .replace(/\u003C\u60F3\u541B\u003E/g, '')   // 去掉 <think>
              .replace(/\u003C\u53BB\u601D\u8003\u003E/g, ''); // 去掉 </think>            if (clean) onChunk(clean);
          }
        } catch {
          // ignore parse errors for incomplete JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  // 如果流式循环没有捕获到任何内容（fullContent 为空），
  // 说明 API 返回的是非流式完整 JSON，此时 buffer 包含完整响应
  if (!fullContent && buffer) {
    try {
      const json = JSON.parse(buffer);
      fullContent = json.choices?.[0]?.message?.content ?? '';
    } catch {
      // JSON 解析失败，buffer 不是有效 JSON
    }
  }

  // 如果仍然没有内容（API 返回空或格式异常），抛出让调用方走兜底题
  if (!fullContent.trim()) {
    throw new Error('Empty streaming response');
  }

  // 非 SSE 格式时，模拟流式效果：将完整内容分块推送给前端
  if (!buffer.includes('data:')) {
    const step = Math.max(5, Math.floor(fullContent.length / 6));
    for (let i = 0; i < fullContent.length; i += step) {
      onChunk(fullContent.slice(i, i + step));
      await new Promise(r => setTimeout(r, 60));
    }
  }

  // 解析完整内容
  const parsed = parseTextFormat(fullContent);
  return {
    id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    subject,
    level,
    narrative: '',
    question: parsed.question,
    answer: parsed.answer,
    options: parsed.options,
    explanation: parsed.explanation,
    timeLimit: getTimeLimit(level),
  };
}


import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatMessage } from '@/lib/minimax';
import { calculateBaZi, BirthInfo, BaZiResult } from '@/lib/bazi';

const DIMENSION_PROMPTS = {
  career: `分析此八字的事业运势，输出JSON：

{
  "career": "事业分析40-60字，分析事业特点、发展阶段、适合的职业",
  "careerSuggest": "职业推荐40-60字，推荐3-5个最适合的职业方向",
  "careerScore": 事业分数(0-100)
}

只输出JSON，不要其他文字。`,

  love: `分析此八字的感情运势，输出JSON：

{
  "love": "感情分析40-60字，分析感情运势、桃花时期、婚恋状态",
  "spouseDesc": "配偶特征40-60字，描述未来配偶的外貌、性格、属相特征",
  "marriageAdvice": "婚恋建议40-60字，给出婚恋建议和相处之道",
  "loveScore": 感情分数(0-100)
}

只输出JSON，不要其他文字。`,

  wealth: `分析此八字的财运运势，输出JSON：

{
  "wealth": "财运分析40-60字，分析财运特点、赚钱方式、理财建议",
  "wealthScore": 财运分数(0-100)
}

只输出JSON，不要其他文字。`,

  health: `分析此八字的健康运势，输出JSON：

{
  "health": "健康分析40-60字，分析健康运势和养生建议",
  "healthScore": 健康分数(0-100)
}

只输出JSON，不要其他文字。`,

  mentor: `分析此八字的贵人运势，输出JSON：

{
  "mentorDirection": "贵人方位40-60字，分析最旺的贵人方位和有利方向",
  "mentorScore": 贵人分数(0-100)
}

只输出JSON，不要其他文字。`,

  overview: `分析此八字的整体运势，输出JSON：

{
  "overall": "命局总评40-60字，概括命局特点和整体运势",
  "overallPlain": "通俗命评40-60字，用简单比喻和直白语言解释命局特点",
  "fortune": "大运趋势40-60字，解读近5年大运走势",
  "yearly": "流年预测40-60字，分析今年流年运势",
  "luckyElements": {
    "element": "幸运五行30-40字，分析最利的五行",
    "color": "幸运颜色30-40字，推荐幸运色系",
    "number": "幸运数字30-40字，推荐吉利数字",
    "direction": "幸运方位30-40字，推荐有利方向"
  },
  "nameSuggestions": {
    "element": "补救五行30-40字，分析五行旺缺",
    "suggestions": "起名建议40-60字，提供3-5个名字建议"
  }
}

只输出JSON，不要其他文字。`,
};

function parseJsonResponse(response: string): Record<string, any> {
  let jsonStr = response;
  const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
  }
  jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(jsonStr);
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        // JSON.stringify produces single-line output by default
        const jsonStr = JSON.stringify(data);
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${jsonStr}\n\n`));
      };

      try {
        const body = await request.json();
        const { birthData, userFocus } = body;

        if (!birthData) {
          sendEvent('error', { error: 'birthData is required' });
          controller.close();
          return;
        }

        // Calculate BaZi
        let baziResult: BaZiResult;
        const birthInfo: BirthInfo = {
          year: birthData.year,
          month: birthData.month,
          day: birthData.day,
          hour: birthData.hour,
          minute: birthData.minute || 0,
          gender: birthData.gender,
          province: birthData.province || '',
        };
        baziResult = calculateBaZi(birthInfo);

        const completeBazi = {
          bazi: baziResult.bazi,
          nanYin: baziResult.nanYin,
          dayMaster: baziResult.dayMaster,
          tenGods: baziResult.tenGods,
        };

        // Send BaZi ready immediately
        sendEvent('bazi', { baziData: baziResult });

        // Make parallel AI calls for each dimension
        const dimensionKeys = ['career', 'love', 'wealth', 'health', 'mentor', 'overview'] as const;
        const aiPromises = dimensionKeys.map(async (key) => {
          const start = Date.now();
          const messages: ChatMessage[] = [
            { role: 'system', content: '你是一位专业的八字命理师。' },
            { role: 'user', content: `分析此八字（${JSON.stringify(completeBazi)}）\n关注：${key}\n\n${DIMENSION_PROMPTS[key]}` },
          ];
          const response = await chat(messages);
          const parsed = parseJsonResponse(response);
          return { key, data: parsed, score: parsed[`${key}Score`] || parsed.score || 0 };
        });

        // Stream results as they complete
        const results: Record<string, any> = {};
        const radarScores: Record<string, number> = {};

        // Start all promises and stream as they resolve
        Promise.all(aiPromises).then((allResults) => {
          // Once all complete, send final
          for (const r of allResults) {
            results[r.key] = r.data;
            radarScores[r.key] = r.score;
          }

          // Transform nested results into flat analysis structure compatible with ReportContent
          const flatAnalysis: Record<string, any> = {};
          for (const r of allResults) {
            const dimData = r.data;
            // Each dimension returns its key as the analysis field plus additional info
            if (dimData[r.key]) flatAnalysis[r.key] = dimData[r.key];
            if (dimData[`${r.key}Suggest`]) flatAnalysis[`${r.key}Suggest`] = dimData[`${r.key}Suggest`];
            if (dimData.spouseDesc) flatAnalysis.spouseDesc = dimData.spouseDesc;
            if (dimData.marriageAdvice) flatAnalysis.marriageAdvice = dimData.marriageAdvice;
            if (dimData.mentorDirection) flatAnalysis.mentorDirection = dimData.mentorDirection;
            // Handle overview fields (overall, fortune, yearly, luckyElements, nameSuggestions)
            if (r.key === 'overview') {
              if (dimData.overall) flatAnalysis.overall = dimData.overall;
              if (dimData.overallPlain) flatAnalysis.overallPlain = dimData.overallPlain;
              if (dimData.fortune) flatAnalysis.fortune = dimData.fortune;
              if (dimData.yearly) flatAnalysis.yearly = dimData.yearly;
              if (dimData.luckyElements) flatAnalysis.luckyElements = dimData.luckyElements;
              if (dimData.nameSuggestions) flatAnalysis.nameSuggestions = dimData.nameSuggestions;
            }
          }

          sendEvent('complete', {
            baziData: baziResult,
            radarScores,
            analysis: flatAnalysis,
          });
          // Delay close to ensure complete event is fully flushed to client
          setTimeout(() => controller.close(), 500);
        }).catch((err) => {
          console.error('AI analysis error:', err);
          try {
            sendEvent('error', { error: String(err) });
          } catch (e) {
            console.error('Failed to send error event:', e);
          }
          // Don't close immediately - let the error event be flushed
          setTimeout(() => controller.close(), 500);
        });

        // Stream individual results as they come in (for better UX)
        // Attach handlers FIRST, then let Promise.all track completion
        aiPromises.forEach((promise, idx) => {
          const key = dimensionKeys[idx];
          promise
            .then(({ key, data, score }) => {
              radarScores[key] = score;
              results[key] = data;
              sendEvent('dimension', { key, data, score });
            })
            .catch((err) => {
              try {
                sendEvent('error', { error: `维度${key}分析失败` });
              } catch {}
            });
        });

        // Send a ping event to verify stream connectivity
        setTimeout(() => {
          sendEvent('ping', { timestamp: Date.now() });
        }, 500);
      } catch (error) {
        console.error('Stream error:', error);
        sendEvent('error', { error: String(error) });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatMessage } from '@/lib/minimax';
import { calculateBaZi, BirthInfo, BaZiResult } from '@/lib/bazi';

const ANALYSIS_PROMPT = `请分析八字，输出JSON（中文）：

{
  "radarScores": {"career":0-100,"love":0-100,"wealth":0-100,"health":0-100,"mentor":0-100},
  "analysis": {
    "overall":"总评40-60字，概括命局特点和整体运势",
    "overallPlain":"通俗总评40-60字，用简单比喻和直白语言解释命局特点，让普通人也能看懂",
    "career":"事业分析40-60字，分析事业特点、发展阶段、适合的职业",
    "careerSuggest":"职业推荐40-60字，推荐3-5个最适合的职业方向",
    "mentorDirection":"贵人方位40-60字，分析最旺的贵人方位和有利方向",
    "love":"感情分析40-60字，分析感情运势、桃花时期、婚恋状态",
    "spouseDesc":"配偶特征40-60字，描述未来配偶的外貌、性格、属相特征",
    "marriageAdvice":"婚恋建议40-60字，给出婚恋建议和相处之道",
    "wealth":"财运分析40-60字，分析财运特点、赚钱方式、理财建议",
    "health":"健康分析40-60字，分析健康运势和养生建议",
    "fortune":"大运分析40-60字，解读近5年大运走势",
    "yearly":"流年分析40-60字，分析今年流年运势",
    "luckyElements":{
      "element":"幸运五行30-40字，分析最利的五行",
      "color":"幸运颜色30-40字，推荐幸运色系",
      "number":"幸运数字30-40字，推荐吉利数字",
      "direction":"幸运方位30-40字，推荐有利方向"
    },
    "nameSuggestions":{
      "element":"补救五行30-40字，分析五行旺缺",
      "suggestions":"起名建议40-60字，提供3-5个名字建议"
    }
  }
}

只输出JSON，不要其他文字。`;

export interface RadarScores {
  career: number;
  love: number;
  wealth: number;
  health: number;
  mentor: number;
}

export interface AnalysisResult {
  radarScores: RadarScores;
  analysis: {
    overall: string;
    overallPlain: string;
    career: string;
    careerSuggest: string;
    mentorDirection: string;
    love: string;
    spouseDesc: string;
    marriageAdvice: string;
    wealth: string;
    health: string;
    fortune: string;
    yearly: string;
    luckyElements: {
      element: string;
      color: string;
      number: string;
      direction: string;
    };
    nameSuggestions: {
      element: string;
      suggestions: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthData, userFocus } = body;

    if (!birthData) {
      return NextResponse.json({ error: 'birthData is required' }, { status: 400 });
    }

    // Compute BaZi from birth data
    const birthInfo: BirthInfo = {
      year: birthData.year,
      month: birthData.month,
      day: birthData.day,
      hour: birthData.hour,
      minute: birthData.minute || 0,
      gender: birthData.gender,
      province: birthData.province || '',
    };

    console.log('[AI Analyze] birthInfo:', JSON.stringify(birthInfo));

    const baziStart = Date.now();
    let baziResult: BaZiResult;
    try {
      baziResult = calculateBaZi(birthInfo);
      console.log(`[AI Analyze] BaZi calculation took ${Date.now() - baziStart}ms`);
    } catch (e) {
      console.error('BaZi calculation error:', e);
      const errorDetail = e instanceof Error ? { message: e.message, stack: e.stack } : String(e);
      return NextResponse.json({ error: '八字排盘失败', detail: errorDetail }, { status: 500 });
    }

    // Build bazi data for AI (skip fortune lines to reduce token count)
    const completeBazi = {
      bazi: baziResult.bazi,
      nanYin: baziResult.nanYin,
      dayMaster: baziResult.dayMaster,
      tenGods: baziResult.tenGods,
    };

    const userPrompt = `分析此八字（包含大运和流年数据）：
${JSON.stringify(completeBazi)}
关注：${userFocus || '全面'}

${ANALYSIS_PROMPT}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: '你是一位专业的八字命理师。' },
      { role: 'user', content: userPrompt },
    ];

    const apiStart = Date.now();
    const response = await chat(messages);
    console.log(`[AI Analyze] Minimax API call took ${Date.now() - apiStart}ms`);

    // Try to parse the JSON response
    try {
      // Extract JSON from markdown code block if present
      let jsonStr = response;
      const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      } else {
        // Try to find JSON object
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }

      // Remove any trailing commas or common JSON issues
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

      const parsed = JSON.parse(jsonStr) as AnalysisResult;

      // Validate the structure
      if (!parsed.radarScores || !parsed.analysis) {
        throw new Error('Invalid response structure');
      }

      // Return both baziData (for timeline) and AI analysis results
      return NextResponse.json({
        baziData: baziResult,
        radarScores: parsed.radarScores,
        analysis: parsed.analysis,
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({
        error: 'Failed to parse AI response',
        detail: String(parseError),
        rawResponse: response.substring(0, 500),
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in AI analyze:', error);
    return NextResponse.json({ error: 'Failed to generate analysis', detail: String(error) }, { status: 500 });
  }
}

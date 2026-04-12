import { describe, it, expect } from 'vitest';
import { parseTextFormat, getLevelStage, getTimeLimit } from '../src/services/questionService';

describe('getLevelStage', () => {
  it('Lv1 → 入门', () => expect(getLevelStage('Lv1')).toBe('入门'));
  it('Lv2 → 基础', () => expect(getLevelStage('Lv2')).toBe('基础'));
  it('Lv3 → 进阶', () => expect(getLevelStage('Lv3')).toBe('进阶'));
  it('Lv4 → 挑战', () => expect(getLevelStage('Lv4')).toBe('挑战'));
});

describe('getTimeLimit', () => {
  it('Lv1 → 15秒', () => expect(getTimeLimit('Lv1')).toBe(15));
  it('Lv2 → 25秒', () => expect(getTimeLimit('Lv2')).toBe(25));
  it('Lv3 → 35秒', () => expect(getTimeLimit('Lv3')).toBe(35));
  it('Lv4 → 45秒', () => expect(getTimeLimit('Lv4')).toBe(45));
});

describe('parseTextFormat — 标准逐行格式（换行分隔）', () => {
  const raw = `题目：世界上面积最大的大洲是哪一个？
A. 北美洲
B. 非洲
C. 亚洲
D. 南美洲
答案：C
解析：亚洲是世界上面积最大的大洲，约占全球陆地总面积的30%。`;

  const result = parseTextFormat(raw);

  it('题目解析正确', () => {
    expect(result.question).toBe('世界上面积最大的大洲是哪一个？');
  });
  it('选项数量为4', () => {
    expect(result.options).toHaveLength(4);
  });
  it('选项字母为 A/B/C/D', () => {
    expect(result.options.map(o => o.charAt(0))).toEqual(['A', 'B', 'C', 'D']);
  });
  it('答案解析正确', () => {
    expect(result.answer).toBe('C');
  });
  it('解析不为空', () => {
    expect(result.explanation).toBe('亚洲是世界上面积最大的大洲，约占全球陆地总面积的30%。');
  });
});

describe('parseTextFormat — 单行合并格式（所有选项在一行）', () => {
  const raw = `题目：世界上面积最大的大洲是哪一个？
A. 北美洲  B. 非洲  C. 亚洲  D. 南美洲
答案：C
解析：亚洲是世界上面积最大的大洲。`;

  const result = parseTextFormat(raw);

  it('选项数量为4', () => {
    expect(result.options).toHaveLength(4);
  });
  it('选项字母为 A/B/C/D', () => {
    expect(result.options.map(o => o.charAt(0))).toEqual(['A', 'B', 'C', 'D']);
  });
  it('答案解析正确', () => {
    expect(result.answer).toBe('C');
  });
});

describe('parseTextFormat — 中文顿号分隔（．）', () => {
  const raw = `题目：下列哪个是中国古代四大发明之一？
A．指南针  B．造纸术  C．印刷术  D．火药
答案：A
解析：指南针是中国古代四大发明之一。`;

  const result = parseTextFormat(raw);

  it('选项数量为4', () => {
    expect(result.options).toHaveLength(4);
  });
  it('选项字母为 A/B/C/D', () => {
    expect(result.options.map(o => o.charAt(0))).toEqual(['A', 'B', 'C', 'D']);
  });
  it('答案解析正确', () => {
    expect(result.answer).toBe('A');
  });
});

describe('parseTextFormat — 混合格式（逐行 + 合并）', () => {
  const raw = `题目：唐太宗的名字是什么？
A. 李世民
B. 李建成
C. 李元吉
D. 李隆基
答案：A
解析：唐太宗名字为李世民开创贞观之治。`;

  const result = parseTextFormat(raw);

  it('题目解析正确', () => {
    expect(result.question).toBe('唐太宗的名字是什么？');
  });
  it('选项数量为4', () => {
    expect(result.options).toHaveLength(4);
  });
  it('答案解析正确', () => {
    expect(result.answer).toBe('A');
  });
  it('选项A内容正确', () => {
    expect(result.options[0]).toBe('A. 李世民');
  });
});

describe('parseTextFormat — 缺少解析时兜底', () => {
  const raw = `题目：这题没有解析
A. 选项一
B. 选项二
C. 选项三
D. 选项四
答案：B`;

  const result = parseTextFormat(raw);

  it('使用默认兜底解析', () => {
    expect(result.explanation).toBe('（暂无解析）');
  });
});

describe('parseTextFormat — 选项不足4个时用备选项补齐', () => {
  const raw = `题目：只有两个选项
A. 对
B. 错
答案：A`;

  const result = parseTextFormat(raw);

  it('选项数量补齐为4', () => {
    expect(result.options).toHaveLength(4);
  });
  it('前两个选项内容正确', () => {
    expect(result.options[0]).toBe('A. 对');
    expect(result.options[1]).toBe('B. 错');
  });
  it('后两个选项为兜底备选项', () => {
    expect(result.options[2]).toBe('C. 备选项');
    expect(result.options[3]).toBe('D. 备选项');
  });
});

describe('parseTextFormat — 答案非法（非A/B/C/D）时兜底', () => {
  const raw = `题目：答案是甲
A. 甲
B. 乙
C. 丙
D. 丁
答案：甲`;

  const result = parseTextFormat(raw);

  it('答案兜底为 A', () => {
    expect(result.answer).toBe('A');
  });
});

describe('parseTextFormat — 答案小写转大写', () => {
  const raw = `题目：答案是哪个？
A. 甲
B. 乙
C. 丙
D. 丁
答案：c`;

  const result = parseTextFormat(raw);

  it('答案转换为大写 C', () => {
    expect(result.answer).toBe('C');
  });
});

describe('parseTextFormat — 选项顺序乱时按A/B/C/D重排', () => {
  const raw = `题目：排序测试
D. 丁
B. 乙
C. 丙
A. 甲
答案：A
解析：选A。`;

  const result = parseTextFormat(raw);

  it('选项按 A/B/C/D 顺序排列', () => {
    expect(result.options.map(o => o.charAt(0))).toEqual(['A', 'B', 'C', 'D']);
  });
  it('选项内容正确对应', () => {
    expect(result.options[0]).toBe('A. 甲');
    expect(result.options[1]).toBe('B. 乙');
    expect(result.options[2]).toBe('C. 丙');
    expect(result.options[3]).toBe('D. 丁');
  });
});

describe('parseTextFormat — 多余空行和空白', () => {
  const raw = `题目：带空行的题目

A. 选项A


B. 选项B

C. 选项C
D. 选项D

答案：B

解析：这是解析。

`;

  const result = parseTextFormat(raw);

  it('正确解析题目', () => {
    expect(result.question).toBe('带空行的题目');
  });
  it('答案正确', () => {
    expect(result.answer).toBe('B');
  });
  it('4个选项不缺', () => {
    expect(result.options).toHaveLength(4);
  });
});

describe('parseTextFormat — 模型推理块过滤（MiniMax 思考标签）', () => {
  const raw = `<think>
用户要求出一道历史学科的入门级题目，我需要出一道基础的历史题。
</think>

题目：中国历史上第一个统一的封建王朝是？
A. 秦朝
B. 汉朝
C. 唐朝
D. 周朝
答案：A
解析：秦朝是中国历史上第一个统一的封建王朝。`;

  const result = parseTextFormat(raw);

  it('推理块被过滤，题目正常解析', () => {
    expect(result.question).toBe('中国历史上第一个统一的封建王朝是？');
  });
  it('答案正确为 A', () => {
    expect(result.answer).toBe('A');
  });
  it('4个选项不缺', () => {
    expect(result.options).toHaveLength(4);
  });
  it('解析正常', () => {
    expect(result.explanation).toBe('秦朝是中国历史上第一个统一的封建王朝。');
  });
});

describe('parseTextFormat — 只有题目行无选项行（完全兜底）', () => {
  const raw = `题目：没有任何选项的题目`;

  const result = parseTextFormat(raw);

  it('题目保留', () => {
    expect(result.question).toBe('没有任何选项的题目');
  });
  it('4个选项均为兜底', () => {
    expect(result.options).toHaveLength(4);
    expect(result.options).toEqual(['A. 备选项', 'B. 备选项', 'C. 备选项', 'D. 备选项']);
  });
  it('答案兜底为 A', () => {
    expect(result.answer).toBe('A');
  });
});

describe('parseTextFormat — 解析行含冒号', () => {
  const raw = `题目：解析含冒号的题
A. 甲
B. 乙
C. 丙
D. 丁
答案：C
解析：答案：C，因为C是正确选项。`;

  const result = parseTextFormat(raw);

  it('解析内容完整保留', () => {
    expect(result.explanation).toBe('答案：C，因为C是正确选项。');
  });
});

describe('parseTextFormat — 选项用空格分隔在一行且有多个空格', () => {
  const raw = `题目：空格分隔测试
A. 北京    B. 上海    C. 广州    D. 深圳
答案：A
解析：北京是首都。`;

  const result = parseTextFormat(raw);

  it('4个选项全部解析', () => {
    expect(result.options).toHaveLength(4);
  });
  it('答案正确', () => {
    expect(result.answer).toBe('A');
  });
});

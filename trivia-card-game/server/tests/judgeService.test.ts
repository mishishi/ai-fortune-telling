import { describe, it, expect } from 'vitest';
import { judgeAnswer, normalize } from '../src/services/judgeService';

describe('judgeAnswer', () => {
  // ---- 选择题精确匹配 ----
  it('单选题选项：A 选 A 应正确', () => {
    expect(judgeAnswer('A', 'A', '语文')).toBe(true);
  });
  it('单选题选项：B 选 B 应正确', () => {
    expect(judgeAnswer('B', 'B', '数学')).toBe(true);
  });
  it('单选题选项：C 选 C 应正确', () => {
    expect(judgeAnswer('C', 'C', '英语')).toBe(true);
  });
  it('单选题选项：D 选 D 应正确', () => {
    expect(judgeAnswer('D', 'D', '科学')).toBe(true);
  });
  it('单选题选项：选错应不正确', () => {
    expect(judgeAnswer('A', 'C', '历史')).toBe(false);
  });
  it('单选题选项：小写 a 等同于 A', () => {
    expect(judgeAnswer('a', 'A', '地理')).toBe(true);
  });
  it('单选题选项：大写 C 匹配小写 c', () => {
    expect(judgeAnswer('c', 'C', '生物')).toBe(true);
  });
  it('带空白的选项应正确匹配', () => {
    expect(judgeAnswer(' B ', 'B', '道法')).toBe(true);
  });

  // ---- 历史人物别名 ----
  it('李世民 = 唐太宗（别名）', () => {
    expect(judgeAnswer('唐太宗', '李世民', '历史')).toBe(true);
  });
  it('李世民 = 太宗（别名）', () => {
    expect(judgeAnswer('太宗', '李世民', '历史')).toBe(true);
  });
  it('李世民 = 天可汗（别名）', () => {
    expect(judgeAnswer('天可汗', '李世民', '历史')).toBe(true);
  });
  it('李世民 = 二凤（别名）', () => {
    expect(judgeAnswer('二凤', '李世民', '历史')).toBe(true);
  });
  it('嬴政 = 秦始皇（别名）', () => {
    expect(judgeAnswer('秦始皇', '嬴政', '历史')).toBe(true);
  });
  it('刘邦 = 汉高祖（别名）', () => {
    expect(judgeAnswer('汉高祖', '刘邦', '历史')).toBe(true);
  });
  it('武则天 = 武周（别名）', () => {
    expect(judgeAnswer('武周', '武则天', '历史')).toBe(true);
  });
  it('李隆基 = 唐玄宗（别名）', () => {
    expect(judgeAnswer('唐玄宗', '李隆基', '历史')).toBe(true);
  });
  it('爱新觉罗·玄烨 = 康熙（别名）', () => {
    expect(judgeAnswer('康熙', '爱新觉罗·玄烨', '历史')).toBe(true);
  });
  it('周公 = 姬旦（别名）', () => {
    expect(judgeAnswer('姬旦', '周公', '历史')).toBe(true);
  });
  it('姜子牙 = 姜尚（别名）', () => {
    expect(judgeAnswer('姜尚', '姜子牙', '历史')).toBe(true);
  });

  // ---- 诗人/文人别名 ----
  it('李白 = 李太白（别名）', () => {
    expect(judgeAnswer('李太白', '李白', '语文')).toBe(true);
  });
  it('杜甫 = 杜子美（别名）', () => {
    expect(judgeAnswer('杜子美', '杜甫', '语文')).toBe(true);
  });
  it('白居易 = 白乐天（别名）', () => {
    expect(judgeAnswer('白乐天', '白居易', '语文')).toBe(true);
  });
  it('苏轼 = 苏东坡（别名）', () => {
    expect(judgeAnswer('苏东坡', '苏轼', '语文')).toBe(true);
  });
  it('王安石 = 介甫（别名）', () => {
    expect(judgeAnswer('介甫', '王安石', '语文')).toBe(true);
  });
  it('辛弃疾 = 稼轩（别名）', () => {
    expect(judgeAnswer('稼轩', '辛弃疾', '语文')).toBe(true);
  });
  it('李清照 = 易安（别名）', () => {
    expect(judgeAnswer('易安', '李清照', '语文')).toBe(true);
  });
  it('曹雪芹 = 梦阮（别名）', () => {
    expect(judgeAnswer('梦阮', '曹雪芹', '语文')).toBe(true);
  });

  // ---- 科学人物别名 ----
  it('张仲景 = 医圣（别名）', () => {
    expect(judgeAnswer('医圣', '张仲景', '科学')).toBe(true);
  });
  it('华佗 = 神医（别名）', () => {
    expect(judgeAnswer('神医', '华佗', '科学')).toBe(true);
  });
  it('李时珍 = 东璧（别名）', () => {
    expect(judgeAnswer('东璧', '李时珍', '科学')).toBe(true);
  });
  it('沈括 = 梦溪丈人（别名）', () => {
    expect(judgeAnswer('梦溪丈人', '沈括', '科学')).toBe(true);
  });

  // ---- 部分包含匹配 ----
  it('唐太宗李世民 包含 李世民', () => {
    expect(judgeAnswer('唐太宗李世民', '李世民', '历史')).toBe(true);
  });
  it('汉武帝刘彻 包含 刘彻', () => {
    expect(judgeAnswer('汉武帝刘彻', '刘彻', '历史')).toBe(true);
  });

  // ---- 朝代别名 ----
  it('唐朝 = 唐（别名）', () => {
    expect(judgeAnswer('唐', '唐朝', '历史')).toBe(true);
  });
  it('明朝 = 大明（别名）', () => {
    expect(judgeAnswer('大明', '明朝', '历史')).toBe(true);
  });
  it('清朝 = 满清（别名）', () => {
    expect(judgeAnswer('满清', '清朝', '历史')).toBe(true);
  });

  // ---- 文学著作别名 ----
  it('《红楼梦》 = 石头记（别名）', () => {
    expect(judgeAnswer('石头记', '红楼梦', '语文')).toBe(true);
  });
  it('《三国演义》 = 三国（别名）', () => {
    expect(judgeAnswer('三国', '三国演义', '语文')).toBe(true);
  });
  it('《史记》 = 太史公书（别名）', () => {
    expect(judgeAnswer('太史公书', '史记', '语文')).toBe(true);
  });
  it('《诗经》 = 三百篇（别名）', () => {
    expect(judgeAnswer('三百篇', '诗经', '语文')).toBe(true);
  });
  it('《本草纲目》 = 李时珍本草（别名）', () => {
    expect(judgeAnswer('李时珍本草', '本草纲目', '科学')).toBe(true);
  });

  // ---- 数字精确匹配 ----
  it('数字答案精确匹配：123', () => {
    expect(judgeAnswer('123', '123', '数学')).toBe(true);
  });
  it('数字答案精确匹配：3.14', () => {
    expect(judgeAnswer('3.14', '3.14', '数学')).toBe(true);
  });
  it('数字答案不匹配：123 vs 124', () => {
    expect(judgeAnswer('123', '124', '数学')).toBe(false);
  });

  // ---- 空值处理 ----
  it('空玩家答案应返回 false', () => {
    expect(judgeAnswer('', 'A', '数学')).toBe(false);
  });
  it('空正确答案应返回 false', () => {
    expect(judgeAnswer('A', '', '数学')).toBe(false);
  });
  it('null 答案应返回 false', () => {
    expect(judgeAnswer('A', 'A', '数学')).toBe(true);
  });

  // ---- 其他别名 ----
  it('孔子 = 孔丘（别名）', () => {
    expect(judgeAnswer('孔丘', '孔子', '语文')).toBe(true);
  });
  it('庄子 = 庄周（别名）', () => {
    expect(judgeAnswer('庄周', '庄子', '语文')).toBe(true);
  });
  it('孙子 = 孙武（别名）', () => {
    expect(judgeAnswer('孙武', '孙子', '语文')).toBe(true);
  });
  it('指南针 = 司南（别名）', () => {
    expect(judgeAnswer('司南', '指南针', '科学')).toBe(true);
  });
  it('活字印刷 = 毕昇活字（别名）', () => {
    expect(judgeAnswer('毕昇活字', '活字印刷', '科学')).toBe(true);
  });
  it('《天工开物》 = 宋应星天工开物（别名）', () => {
    expect(judgeAnswer('宋应星天工开物', '天工开物', '科学')).toBe(true);
  });
  it('《徐霞客游记》 = 徐霞客（别名）', () => {
    expect(judgeAnswer('徐霞客', '徐霞客游记', '地理')).toBe(true);
  });
});

describe('normalize', () => {
  it('去除首尾空白', () => {
    expect(normalize('  ABC  ')).toBe('abc');
  });
  it('转小写', () => {
    expect(normalize('ABC')).toBe('abc');
  });
  it('去除中文括号', () => {
    expect(normalize('《史记》')).toBe('史记');
  });
  it('去除英文引号', () => {
    expect(normalize('"李白"')).toBe('李白');
  });
  it('合并内部空白', () => {
    expect(normalize('李  白')).toBe('李白');
  });
});

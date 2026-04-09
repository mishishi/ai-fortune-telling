/**
 * 判断玩家回答是否正确。
 * 支持：精确匹配、部分包含、别名映射、关键词碎片匹配。
 */

interface AliasGroup {
  canonical: string;
  aliases: string[];
}

const ALIAS_GROUPS: AliasGroup[] = [
  // 皇帝别名
  {
    canonical: '李世民',
    aliases: ['唐太宗', '太宗', '天可汗', '二凤'],
  },
  {
    canonical: '刘邦',
    aliases: ['汉高祖', '高祖', '沛公'],
  },
  {
    canonical: '朱元璋',
    aliases: ['明太祖', '洪武', '洪武帝'],
  },
  {
    canonical: '赵匡胤',
    aliases: ['宋太祖', '太祖', '黄袍加身'],
  },
  {
    canonical: '嬴政',
    aliases: ['秦始皇', '秦王', '祖龙', '嬴秦'],
  },
  {
    canonical: '刘彻',
    aliases: ['汉武帝', '武帝', '武皇'],
  },
  {
    canonical: '爱新觉罗·玄烨',
    aliases: ['康熙', '康熙帝', '圣祖'],
  },
  {
    canonical: '爱新觉罗·弘历',
    aliases: ['乾隆', '乾隆帝', '十全老人'],
  },
  {
    canonical: '爱新觉罗·旻宁',
    aliases: ['道光', '道光帝'],
  },
  {
    canonical: '忽必烈',
    aliases: ['元世祖', '世祖'],
  },
  {
    canonical: '武则天',
    aliases: ['武周', '武媚娘', '则天大帝', '曌'],
  },
  {
    canonical: '李隆基',
    aliases: ['唐玄宗', '玄宗', '明皇', '三郎'],
  },
  {
    canonical: '李渊',
    aliases: ['唐高祖', '高祖'],
  },
  {
    canonical: '司马迁',
    aliases: ['太史公', '史迁'],
  },
  {
    canonical: '司马光',
    aliases: ['涑水先生', '温公'],
  },
  {
    canonical: '孔子',
    aliases: ['孔丘', '孔仲尼', '儒圣', '至圣'],
  },
  {
    canonical: '孟子',
    aliases: ['孟轲', '亚圣'],
  },
  {
    canonical: '老子',
    aliases: ['李耳', '太上老君', '道德天尊'],
  },
  {
    canonical: '庄子',
    aliases: ['庄周', '南华真人', '漆园吏'],
  },
  {
    canonical: '墨子',
    aliases: ['墨翟'],
  },
  {
    canonical: '韩非',
    aliases: ['韩非子'],
  },
  {
    canonical: '荀子',
    aliases: ['荀况', '孙卿'],
  },
  {
    canonical: '孙子',
    aliases: ['孙武', '兵圣', '吴孙子'],
  },
  {
    canonical: '杜甫',
    aliases: ['杜子美', '少陵野老', '诗圣'],
  },
  {
    canonical: '李白',
    aliases: ['李太白', '青莲居士', '诗仙'],
  },
  {
    canonical: '白居易',
    aliases: ['白乐天', '香山居士', '诗魔'],
  },
  {
    canonical: '苏轼',
    aliases: ['苏东坡', '东坡', '东坡居士', '文忠'],
  },
  {
    canonical: '王安石',
    aliases: ['介甫', '临川先生', '荆公'],
  },
  {
    canonical: '辛弃疾',
    aliases: ['稼轩', '辛幼安', '词龙'],
  },
  {
    canonical: '李清照',
    aliases: ['易安', '易安居士', '千古第一才女'],
  },
  {
    canonical: '曹雪芹',
    aliases: ['梦阮', '雪芹', '芹圃'],
  },
  {
    canonical: '蒲松龄',
    aliases: ['留仙', '聊斋先生', '柳泉居士'],
  },
  {
    canonical: '罗贯中',
    aliases: ['贯中', '湖海散人'],
  },
  {
    canonical: '施耐庵',
    aliases: ['耐庵', '兴化白驹场人'],
  },
  {
    canonical: '吴承恩',
    aliases: ['汝忠', '射阳山人'],
  },
  {
    canonical: '关汉卿',
    aliases: ['已斋叟', '杂剧领袖'],
  },
  {
    canonical: '王羲之',
    aliases: ['逸少', '书圣', '右将军'],
  },
  {
    canonical: '欧阳询',
    aliases: ['信本', '楷书四大家'],
  },
  {
    canonical: '张择端',
    aliases: ['正道', '文泓'],
  },
  {
    canonical: '沈括',
    aliases: ['存中', '梦溪丈人'],
  },
  {
    canonical: '宋应星',
    aliases: ['长庚', '天工开物'],
  },
  {
    canonical: '李时珍',
    aliases: ['东璧', '医圣'],
  },
  {
    canonical: '张仲景',
    aliases: ['机宜', '医圣', '长沙'],
  },
  {
    canonical: '华佗',
    aliases: ['元化', '神医', '麻沸散'],
  },
  {
    canonical: '扁鹊',
    aliases: ['秦越人', '脉圣'],
  },
  {
    canonical: '蔡伦',
    aliases: ['字公征', '纸圣'],
  },
  {
    canonical: '毕昇',
    aliases: ['延昌', '活字印刷术发明者'],
  },
  {
    canonical: '指南针',
    aliases: ['司南', '罗盘'],
  },
  {
    canonical: '火药',
    aliases: ['黑火药', '炼丹术副产品'],
  },
  {
    canonical: '印刷术',
    aliases: ['活字印刷', '雕版印刷', '毕昇活字'],
  },
  // 朝代/政权
  {
    canonical: '唐朝',
    aliases: ['唐', '李唐', '大唐'],
  },
  {
    canonical: '宋朝',
    aliases: ['宋', '赵宋', '南北宋'],
  },
  {
    canonical: '明朝',
    aliases: ['明', '朱明', '大明'],
  },
  {
    canonical: '清朝',
    aliases: ['清', '满清', '后金'],
  },
  {
    canonical: '元朝',
    aliases: ['元', '蒙古', '大元'],
  },
  {
    canonical: '贞观之治',
    aliases: ['贞观', '太宗之治'],
  },
  {
    canonical: '开元盛世',
    aliases: ['开元', '开元之治'],
  },
  {
    canonical: '康乾盛世',
    aliases: ['康乾', '康雍乾'],
  },
  {
    canonical: '文景之治',
    aliases: ['文景'],
  },
  {
    canonical: '汉武帝',
    aliases: ['刘彻', '武帝', '汉武'],
  },
  {
    canonical: '罢黜百家',
    aliases: ['独尊儒术', '罢黜百家独尊儒术'],
  },
  {
    canonical: '商鞅变法',
    aliases: ['商鞅', '卫鞅', '变法'],
  },
  {
    canonical: '管仲',
    aliases: ['管子', '夷吾', '鲍叔牙'],
  },
  {
    canonical: '商鞅',
    aliases: ['卫鞅', '公孙鞅', '商君'],
  },
  {
    canonical: '周公',
    aliases: ['姬旦', '周公旦', '元圣'],
  },
  {
    canonical: '召公',
    aliases: ['召康公', '姬奭'],
  },
  {
    canonical: '姜子牙',
    aliases: ['姜尚', '吕尚', '太公望', '师尚父'],
  },
  {
    canonical: '百里奚',
    aliases: ['百里子', '百里傒'],
  },
  {
    canonical: '范蠡',
    aliases: ['陶朱公', '鸱夷子皮', '范少伯'],
  },
  {
    canonical: '张仪',
    aliases: ['张子', '连横'],
  },
  {
    canonical: '苏秦',
    aliases: ['苏子', '合纵'],
  },
  {
    canonical: '秦桧',
    aliases: ['秦会之', '桧'],
  },
  {
    canonical: '岳飞',
    aliases: ['岳鹏举', '武穆', '鄂王', '精忠报国'],
  },
  {
    canonical: '文天祥',
    aliases: ['文文山', '文履善', '文少保', '正气歌'],
  },
  {
    canonical: '戚继光',
    aliases: ['戚元敬', '南塘', '孟诸', '武毅'],
  },
  {
    canonical: '郑和',
    aliases: ['马三保', '三保太监', '郑和七下西洋'],
  },
  {
    canonical: '鉴真',
    aliases: ['鉴真大师', '唐招提寺', '过海大师'],
  },
  {
    canonical: '玄奘',
    aliases: ['唐僧', '唐三藏', '三藏法师', '大奘'],
  },
  {
    canonical: '郑成功',
    aliases: ['成功', '国姓爷', '延平王', '招讨大将军'],
  },
  {
    canonical: '林则徐',
    aliases: ['元抚', '少穆', '石麟', '文忠'],
  },
  {
    canonical: '邓世昌',
    aliases: ['正卿', '邓壮节'],
  },
  {
    canonical: '谭嗣同',
    aliases: ['复生', '壮飞', '莽苍苍斋'],
  },
  {
    canonical: '梁启超',
    aliases: ['启超', '如晦', '饮冰室主人', '中国近代先驱'],
  },
  {
    canonical: '詹天佑',
    aliases: ['眷诚', '达朝', '中国铁路之父'],
  },
  {
    canonical: '侯德榜',
    aliases: ['阱之', '碱业大王', '侯氏制碱法'],
  },
  {
    canonical: '诺贝尔',
    aliases: ['诺贝尔奖', '炸药之父'],
  },
  {
    canonical: '爱迪生',
    aliases: ['爱迪生发明', '发明大王', '世界发明大王'],
  },
  {
    canonical: '瓦特',
    aliases: ['蒸汽机改良', '瓦特蒸汽机'],
  },
  {
    canonical: '法拉第',
    aliases: ['电磁感应', '电学之父'],
  },
  {
    canonical: '牛顿',
    aliases: ['牛顿定律', '万有引力', '艾萨克·牛顿'],
  },
  {
    canonical: '达尔文',
    aliases: ['进化论', '物种起源', '查尔斯·达尔文'],
  },
  {
    canonical: '居里夫人',
    aliases: ['玛丽·居里', '居里', '镭的发现者'],
  },
  {
    canonical: '爱因斯坦',
    aliases: ['相对论', '阿尔伯特·爱因斯坦', 'E=mc²'],
  },
  {
    canonical: '鲁迅',
    aliases: ['周树人', '周树人', '豫才', '文学巨匠'],
  },
  {
    canonical: '茅盾',
    aliases: ['沈德鸿', '雁冰', '矛盾'],
  },
  {
    canonical: '巴金',
    aliases: ['李尧棠', '芾甘', '巴金小说'],
  },
  {
    canonical: '老舍',
    aliases: ['舒庆春', '舍予', '老舍骆驼祥子'],
  },
  {
    canonical: '曹禺',
    aliases: ['万家宝', '曹禺剧本'],
  },
  {
    canonical: '梅兰芳',
    aliases: ['梅澜', '伶界大王', '四大名旦之首'],
  },
  {
    canonical: '聂耳',
    aliases: ['聂守信', '义勇军进行曲', '国歌作曲'],
  },
  {
    canonical: '洗星海',
    aliases: ['星海', '黄河大合唱', '人民音乐家'],
  },
  {
    canonical: '齐白石',
    aliases: ['齐璜', '白石', '木匠画家', '人民艺术家'],
  },
  {
    canonical: '徐悲鸿',
    aliases: ['徐寿康', '悲鸿', '画马圣手'],
  },
  {
    canonical: '张大千',
    aliases: ['张正权', '大千居士', '五百年来第一人'],
  },
  {
    canonical: '邓稼先',
    aliases: ['稼先', '两弹元勋', '中国原子弹之父'],
  },
  {
    canonical: '钱学森',
    aliases: ['钱老', '火箭之父', '中国航天之父'],
  },
  {
    canonical: '袁隆平',
    aliases: ['隆平', '杂交水稻之父', '解决中国粮食问题'],
  },
  {
    canonical: '钟南山',
    aliases: ['南山', '共和国勋章', '抗疫英雄'],
  },
  {
    canonical: '《史记》',
    aliases: ['史记', '太史公书'],
  },
  {
    canonical: '《资治通鉴》',
    aliases: ['资治通鉴', '司马光通鉴'],
  },
  {
    canonical: '《诗经》',
    aliases: ['诗经', '三百篇'],
  },
  {
    canonical: '《春秋》',
    aliases: ['春秋', '孔子春秋'],
  },
  {
    canonical: '《论语》',
    aliases: ['论语', '孔子论语'],
  },
  {
    canonical: '《礼记》',
    aliases: ['礼记', '小戴礼记'],
  },
  {
    canonical: '《周易》',
    aliases: ['周易', '易经', '易'],
  },
  {
    canonical: '《本草纲目》',
    aliases: ['本草纲目', '李时珍本草'],
  },
  {
    canonical: '《天工开物》',
    aliases: ['天工开物', '宋应星天工开物'],
  },
  {
    canonical: '《梦溪笔谈》',
    aliases: ['梦溪笔谈', '沈括笔谈'],
  },
  {
    canonical: '《齐民要术》',
    aliases: ['齐民要术', '贾思勰'],
  },
  {
    canonical: '《农政全书》',
    aliases: ['农政全书', '徐光启'],
  },
  {
    canonical: '《永乐大典》',
    aliases: ['永乐大典', '朱棣大典'],
  },
  {
    canonical: '《四库全书》',
    aliases: ['四库全书', '乾隆四库'],
  },
  {
    canonical: '《三国演义》',
    aliases: ['三国演义', '三国'],
  },
  {
    canonical: '《水浒传》',
    aliases: ['水浒传', '水浒', '梁山好汉'],
  },
  {
    canonical: '《西游记》',
    aliases: ['西游记', '西游', '唐僧取经'],
  },
  {
    canonical: '《红楼梦》',
    aliases: ['红楼梦', '石头记', '金陵十二钗'],
  },
  {
    canonical: '《聊斋志异》',
    aliases: ['聊斋志异', '聊斋', '鬼狐传'],
  },
  {
    canonical: '《儒林外史》',
    aliases: ['儒林外史', '外史'],
  },
  {
    canonical: '《西厢记》',
    aliases: ['西厢记', '崔莺莺待月西厢记'],
  },
  {
    canonical: '《牡丹亭》',
    aliases: ['牡丹亭', '还魂记', '汤显祖牡丹亭'],
  },
  {
    canonical: '《清明上河图》',
    aliases: ['清明上河图', '张择端清明图'],
  },
  {
    canonical: '《千里江山图》',
    aliases: ['千里江山图', '王希孟'],
  },
  {
    canonical: '《富春山居图》',
    aliases: ['富春山居图', '黄公望'],
  },
  {
    canonical: '《洛神赋图》',
    aliases: ['洛神赋图', '顾恺之洛神'],
  },
  {
    canonical: '《女史箴图》',
    aliases: ['女史箴图', '顾恺之女史'],
  },
  {
    canonical: '《九章算术》',
    aliases: ['九章算术', '算经十书'],
  },
  {
    canonical: '《周髀算经》',
    aliases: ['周髀算经', '髀'],
  },
  {
    canonical: '《甘石星经》',
    aliases: ['甘石星经', '甘德', '石申'],
  },
  {
    canonical: '《黄帝内经》',
    aliases: ['黄帝内经', '内经', '素问', '灵枢'],
  },
  {
    canonical: '《伤寒杂病论》',
    aliases: ['伤寒杂病论', '伤寒论', '张仲景医书'],
  },
  {
    canonical: '《神农本草经》',
    aliases: ['神农本草经', '神农经', '本经'],
  },
  {
    canonical: '《大唐西域记》',
    aliases: ['大唐西域记', '西域记', '玄奘西行'],
  },
  {
    canonical: '《徐霞客游记》',
    aliases: ['徐霞客游记', '徐霞客', '游记'],
  },
  {
    canonical: '《马可波罗行纪》',
    aliases: ['马可波罗行纪', '马可波罗', '马克波罗'],
  },
  {
    canonical: '《海国图志》',
    aliases: ['海国图志', '魏源'],
  },
  {
    canonical: '《四库全书》',
    aliases: ['四库全书', '四库'],
  },
  {
    canonical: '《盛世滋生图》',
    aliases: ['盛世滋生图', '乾隆南巡图'],
  },
];

/** 规范化：去除标点、空白、大小写 */
function normalize(s: string): string {
  return s.trim()
    .toLowerCase()
    .replace(/[（）()【】[\]「」『』《》〈〉""'']/g, '')
    .replace(/["'""'']/g, '')
    .replace(/\s+/g, '');
}

/** 判断两个字符串是否指向同一个别名组 */
function sameGroup(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return true;

  for (const group of ALIAS_GROUPS) {
    const all = [group.canonical, ...group.aliases];
    if (all.some(t => normalize(t) === na) && all.some(t => normalize(t) === nb)) {
      return true;
    }
  }
  return false;
}

/** 判断 playerAnswer 的关键token是否被正确答案的token覆盖 */
function tokensMatch(playerAnswer: string, correctAnswer: string): boolean {
  const normPlayer = normalize(playerAnswer);
  const normCorrect = normalize(correctAnswer);

  // 完全相等
  if (normPlayer === normCorrect) return true;

  // 互为别名组
  if (sameGroup(playerAnswer, correctAnswer)) return true;

  // 一方包含另一方（处理"李世民" vs "唐太宗李世民"）
  if (normPlayer.includes(normCorrect) || normCorrect.includes(normPlayer)) {
    // 但要避免太短的包含，比如"唐"包含在"唐太宗"里不算对
    const shorter = normPlayer.length < normCorrect.length ? normPlayer : normCorrect;
    const longer  = normPlayer.length < normCorrect.length ? normCorrect : normPlayer;
    // 短词至少2个字符才有效
    if (shorter.length >= 2) return true;
  }

  // 分词匹配：正确答案的每个关键token都在玩家回答中
  const correctTokens = normCorrect
    .replace(/[,，、。.]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2);

  if (correctTokens.length === 0) return normPlayer.length >= 2;

  // 至少80%的token被匹配
  const matched = correctTokens.filter(t => normPlayer.includes(t));
  return matched.length >= correctTokens.length * 0.8;
}

export function judgeAnswer(
  playerAnswer: string,
  correctAnswer: string,
  subject: string
): boolean {
  if (!playerAnswer || !correctAnswer) return false;

  // 数字精确匹配
  if (/^\d+(\.\d+)?$/.test(normalize(correctAnswer))) {
    return normalize(playerAnswer) === normalize(correctAnswer);
  }

  // 选择题选项（A/B/C/D）
  if (/^[A-Da-d]$/.test(playerAnswer.trim())) {
    return normalize(playerAnswer) === normalize(correctAnswer);
  }

  return tokensMatch(playerAnswer, correctAnswer);
}

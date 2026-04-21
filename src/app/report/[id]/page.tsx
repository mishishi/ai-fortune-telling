import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import ReportContent from '@/components/ReportContent';
import Timeline from '@/components/Timeline';
import UnlockButton from '@/components/UnlockButton';
import BaziRing from '@/components/BaziRing';
import { Accordion } from '@/components/ui/Accordion';

// Conversion maps for Bazi data
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// Element mapping tables (from bazi library)
const STEM_ELEMENTS: number[] = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]; // 甲乙=木, 丙丁=火, 戊己=土, 庚辛=金, 壬癸=水
const BRANCH_ELEMENTS: Record<number, number> = {
  0: 4, 1: 2, 2: 0, 3: 0, 4: 2, 5: 1, 6: 1, 7: 2, 8: 3, 9: 3, 10: 2, 11: 4
};

// Compute element for a pillar based on stem and branch
// Year pillar: element from stem
// Month pillar: element from branch
// Day pillar: element from dayMaster (stored separately)
// Hour pillar: element from branch
function computePillarElement(stem: number, branch: number, pillarType: 'year' | 'month' | 'hour'): string {
  let elementIndex: number;
  if (pillarType === 'year') {
    // Year pillar element comes from stem
    elementIndex = STEM_ELEMENTS[stem % 10];
  } else {
    // Month and hour pillar elements come from branch
    elementIndex = BRANCH_ELEMENTS[branch % 12];
  }
  return ELEMENTS[elementIndex] ?? ELEMENTS[0];
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id) as any;

  if (!report) {
    notFound();
  }

  // Parse JSON fields with error handling
  let baziData = {};
  let radarScores = { career: 0, love: 0, wealth: 0, health: 0, mentor: 0 };
  let aiAnalysis = {} as {
    overall: string;
    career: string;
    love: string;
    wealth: string;
    health: string;
    fortune: string;
    yearly: string;
  };

  try {
    baziData = JSON.parse(report.baziData || '{}');
  } catch (e) {
    baziData = {};
  }

  try {
    radarScores = JSON.parse(report.radarScores || '{"career":0,"love":0,"wealth":0,"health":0,"mentor":0}');
  } catch (e) {
    radarScores = { career: 0, love: 0, wealth: 0, health: 0, mentor: 0 };
  }

  try {
    aiAnalysis = JSON.parse(report.aiAnalysis || '{}');
  } catch (e) {
    aiAnalysis = {} as typeof aiAnalysis;
  }

  // Extract dayMaster element for dayPillar
  const rawDayMaster = (baziData as any).dayMaster;
  const dayMasterElementIndex = rawDayMaster?.element ?? 0;

  // Convert numeric baziData to BaziRing format
  // Note: Database stores bazi.pillar objects with only stem/branch (no element)
  // We compute element from stem/branch using traditional BaZi rules
  const rawBazi = (baziData as any).bazi ?? baziData;

  const birthData = {
    yearPillar: rawBazi.yearPillar ? {
      stem: STEMS[rawBazi.yearPillar.stem] ?? STEMS[0],
      branch: BRANCHES[rawBazi.yearPillar.branch] ?? BRANCHES[0],
      element: computePillarElement(rawBazi.yearPillar.stem, rawBazi.yearPillar.branch, 'year'),
    } : { stem: STEMS[0], branch: BRANCHES[0], element: ELEMENTS[0] },
    monthPillar: rawBazi.monthPillar ? {
      stem: STEMS[rawBazi.monthPillar.stem] ?? STEMS[0],
      branch: BRANCHES[rawBazi.monthPillar.branch] ?? BRANCHES[0],
      element: computePillarElement(rawBazi.monthPillar.stem, rawBazi.monthPillar.branch, 'month'),
    } : { stem: STEMS[0], branch: BRANCHES[0], element: ELEMENTS[0] },
    dayPillar: rawBazi.dayPillar ? {
      stem: STEMS[rawBazi.dayPillar.stem] ?? STEMS[0],
      branch: BRANCHES[rawBazi.dayPillar.branch] ?? BRANCHES[0],
      element: ELEMENTS[dayMasterElementIndex] ?? ELEMENTS[0],
    } : { stem: STEMS[0], branch: BRANCHES[0], element: ELEMENTS[0] },
    hourPillar: rawBazi.hourPillar ? {
      stem: STEMS[rawBazi.hourPillar.stem] ?? STEMS[0],
      branch: BRANCHES[rawBazi.hourPillar.branch] ?? BRANCHES[0],
      element: computePillarElement(rawBazi.hourPillar.stem, rawBazi.hourPillar.branch, 'hour'),
    } : { stem: STEMS[0], branch: BRANCHES[0], element: ELEMENTS[0] },
  };

  // Get zodiac from year branch
  const zodiac = rawBazi.yearPillar ? ZODIAC_ANIMALS[rawBazi.yearPillar.branch] ?? ZODIAC_ANIMALS[0] : ZODIAC_ANIMALS[0];

  // Get element display text from day pillar
  const elementMap: Record<string, string> = {
    wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
  };
  const elementInfo = birthData.dayPillar.element ? elementMap[birthData.dayPillar.element] || '未知' : '未知';

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto bg-[var(--color-bg-page)]">
      {/* Header */}
      <div className="text-center mb-10 relative">
        {/* Corner brackets decoration */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-[var(--color-accent)] opacity-40" />
        <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-[var(--color-accent)] opacity-40" />
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-[var(--color-accent)] opacity-40" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-[var(--color-accent)] opacity-40" />

        <h1
          className="text-h1 font-serif text-white mb-3 title-underline"
          style={{ textShadow: '0 0 30px rgba(196,30,58,0.5)' }}
        >
          {report.name} 的命盘
        </h1>
        <p className="text-gray-400 text-sm tracking-wide">
          生成时间：{new Date(report.createdAt).toLocaleDateString('zh-CN')}
        </p>
      </div>

      {/* BaziRing */}
      <div className="flex flex-col items-center py-6">
        <BaziRing birthData={birthData} size={320} />
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400 section-accent inline-block pl-3">
            生肖：{zodiac} · 五行：{elementInfo}
          </p>
        </div>
      </div>

      {/* Interactive Report Content */}
      <ReportContent radarScores={radarScores} aiAnalysis={aiAnalysis} isLocked={!report.unlocked} reportId={id} />

      {/* Timeline */}
      <div className="mt-8 corner-brackets px-4 py-4">
        <Accordion title="大运时间轴" defaultOpen={false}>
          <Timeline baziData={baziData} />
        </Accordion>
      </div>

      {/* Unlock prompt */}
      {!report.unlocked && (
        <UnlockButton reportId={id} />
      )}
    </main>
  );
}

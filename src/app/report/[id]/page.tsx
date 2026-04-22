import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import ReportContent from '@/components/ReportContent';
import Timeline from '@/components/Timeline';
import BaziRing from '@/components/BaziRing';
import BaZiDetailChart from '@/components/BaZiDetailChart';
import { Accordion } from '@/components/ui/Accordion';
import ReportHeaderActions from '@/components/ReportHeaderActions';
import ShareReport from '@/components/ShareReport';
import { BirthFormData } from '@/components/BirthForm';
import FengShuiCompass from '@/components/FengShuiCompass';
import IChingHexagram from '@/components/IChingHexagram';
import PalmReading from '@/components/PalmReading';
import FaceReading from '@/components/FaceReading';

// Conversion maps for Bazi data
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ELEMENTS: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];
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
type Element = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

function computePillarElement(stem: number, branch: number, pillarType: 'year' | 'month' | 'hour'): Element {
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

  // Parse stored birthData for edit functionality
  let storedBirthData: Partial<BirthFormData> = {};
  try {
    storedBirthData = JSON.parse(report.birthData || '{}');
  } catch (e) {
    storedBirthData = {};
  }

  // Determine timeSegment from stored hour
  const HOUR_TO_SEGMENT: Record<number, 'early' | 'middle' | 'late'> = {
    23: 'early', 0: 'middle', 0.5: 'late',
    1: 'early', 2: 'middle', 2.5: 'late',
    3: 'early', 4: 'middle', 4.5: 'late',
    5: 'early', 6: 'middle', 6.5: 'late',
    7: 'early', 8: 'middle', 8.5: 'late',
    9: 'early', 10: 'middle', 10.5: 'late',
    11: 'early', 12: 'middle', 12.5: 'late',
    13: 'early', 14: 'middle', 14.5: 'late',
    15: 'early', 16: 'middle', 16.5: 'late',
    17: 'early', 18: 'middle', 18.5: 'late',
    19: 'early', 20: 'middle', 20.5: 'late',
    21: 'early', 22: 'middle', 22.5: 'late',
  };
  const deriveTimeSegment = (hour: number): 'early' | 'middle' | 'late' => {
    if (HOUR_TO_SEGMENT[hour] !== undefined) return HOUR_TO_SEGMENT[hour];
    return 'middle';
  };

  const editBirthData: BirthFormData = {
    name: storedBirthData.name ?? report.name ?? '',
    gender: storedBirthData.gender ?? (report.gender === 'female' ? 'female' : 'male'),
    year: storedBirthData.year ?? new Date().getFullYear(),
    month: storedBirthData.month ?? 1,
    day: storedBirthData.day ?? 1,
    hour: storedBirthData.hour ?? 8,
    minute: storedBirthData.minute ?? 0,
    province: storedBirthData.province ?? '',
    timeSegment: storedBirthData.timeSegment ?? deriveTimeSegment(storedBirthData.hour ?? 8),
  };

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
      stemIndex: rawBazi.yearPillar.stem ?? 0,
      branchIndex: rawBazi.yearPillar.branch ?? 0,
    } : { stem: STEMS[0], branch: BRANCHES[0], element: ELEMENTS[0], stemIndex: 0, branchIndex: 0 },
    monthPillar: rawBazi.monthPillar ? {
      stem: STEMS[rawBazi.monthPillar.stem] ?? STEMS[0],
      branch: BRANCHES[rawBazi.monthPillar.branch] ?? BRANCHES[0],
      element: computePillarElement(rawBazi.monthPillar.stem, rawBazi.monthPillar.branch, 'month'),
      stemIndex: rawBazi.monthPillar.stem ?? 0,
      branchIndex: rawBazi.monthPillar.branch ?? 0,
    } : { stem: STEMS[0], branch: BRANCHES[0], element: ELEMENTS[0], stemIndex: 0, branchIndex: 0 },
    dayPillar: rawBazi.dayPillar ? {
      stem: STEMS[rawBazi.dayPillar.stem] ?? STEMS[0],
      branch: BRANCHES[rawBazi.dayPillar.branch] ?? BRANCHES[0],
      element: ELEMENTS[dayMasterElementIndex] ?? ELEMENTS[0],
      stemIndex: rawBazi.dayPillar.stem ?? 0,
      branchIndex: rawBazi.dayPillar.branch ?? 0,
    } : { stem: STEMS[0], branch: BRANCHES[0], element: ELEMENTS[0], stemIndex: 0, branchIndex: 0 },
    hourPillar: rawBazi.hourPillar ? {
      stem: STEMS[rawBazi.hourPillar.stem] ?? STEMS[0],
      branch: BRANCHES[rawBazi.hourPillar.branch] ?? BRANCHES[0],
      element: computePillarElement(rawBazi.hourPillar.stem, rawBazi.hourPillar.branch, 'hour'),
      stemIndex: rawBazi.hourPillar.stem ?? 0,
      branchIndex: rawBazi.hourPillar.branch ?? 0,
    } : { stem: STEMS[0], branch: BRANCHES[0], element: ELEMENTS[0], stemIndex: 0, branchIndex: 0 },
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

        {/* Edit button */}
        <ReportHeaderActions
          reportId={id}
          name={report.name}
          gender={report.gender}
          radarScores={radarScores}
          overall={aiAnalysis.overall}
          createdAt={report.createdAt}
          editBirthData={editBirthData}
        />

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

      {/* Detailed BaZi Chart */}
      <div className="mt-8 corner-brackets px-4 py-4">
        <Accordion title="详细命盘分析" defaultOpen={false}>
          <BaZiDetailChart
            yearPillar={birthData.yearPillar}
            monthPillar={birthData.monthPillar}
            dayPillar={birthData.dayPillar}
            hourPillar={birthData.hourPillar}
            gender={report.gender as 'male' | 'female'}
            birthYear={report.year ?? new Date().getFullYear()}
            birthMonth={report.month ?? 1}
            birthDay={report.day ?? 1}
            size={360}
          />
        </Accordion>
      </div>

      {/* Interactive Report Content */}
      <ReportContent radarScores={radarScores} aiAnalysis={aiAnalysis} isLocked={!report.unlocked} reportId={id} />

      {/* Timeline */}
      <div className="mt-8 corner-brackets px-4 py-4">
        <Accordion title="大运时间轴" defaultOpen={false}>
          <Timeline baziData={baziData} />
        </Accordion>
      </div>

      {/* Extended Fortune Tools */}
      <div className="mt-8 corner-brackets px-4 py-4">
        <Accordion title="扩展命理工具" defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feng Shui Compass */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-3 text-center">风水罗盘</h4>
              <FengShuiCompass birthElement={birthData.dayPillar.element} size={280} />
            </div>

            {/* I Ching Hexagram */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-3 text-center">易经卦象</h4>
              <IChingHexagram />
            </div>

            {/* Palm Reading */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-3 text-center">手相分析</h4>
              <PalmReading
                birthYear={report.year ?? new Date().getFullYear()}
                birthMonth={report.month ?? 1}
                birthDay={report.day ?? 1}
              />
            </div>

            {/* Face Reading */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="text-sm font-bold text-[var(--color-accent)] mb-3 text-center">面相分析</h4>
              <FaceReading
                birthYear={report.year ?? new Date().getFullYear()}
                birthMonth={report.month ?? 1}
                birthDay={report.day ?? 1}
                gender={report.gender}
              />
            </div>
          </div>
        </Accordion>
      </div>

      {/* Floating Share Report Button */}
      <ShareReport
        reportId={id}
        name={report.name}
        gender={report.gender}
        birthYear={report.year ?? new Date().getFullYear()}
        radarScores={radarScores}
        overall={aiAnalysis.overall}
        zodiac={zodiac}
        element={elementInfo}
        createdAt={report.createdAt}
      />

    </main>
  );
}

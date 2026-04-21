'use client';
import { useState, useEffect } from 'react';
import RadarChartComponent from '@/components/RadarChart';
import FortuneDisplay from '@/components/FortuneDisplay';
import { Accordion } from '@/components/ui/Accordion';

interface ReportContentProps {
  radarScores: {
    career: number;
    love: number;
    wealth: number;
    health: number;
    mentor: number;
  };
  aiAnalysis: {
    overall: string;
    career: string;
    love: string;
    wealth: string;
    health: string;
    fortune: string;
    yearly: string;
  };
  isLocked?: boolean;
}

const DIMENSION_TO_KEY: Record<string, string> = {
  '事业': 'career',
  '感情': 'love',
  '财运': 'wealth',
  '健康': 'health',
  '贵人': 'mentor',
};

export default function ReportContent({ radarScores, aiAnalysis, isLocked }: ReportContentProps) {
  const [activeSection, setActiveSection] = useState<string | null>('overall');

  const handleDimensionClick = (dimension: string) => {
    const key = DIMENSION_TO_KEY[dimension];
    if (key) {
      setActiveSection(activeSection === key ? null : key);
    }
  };

  // Sync active section to FortuneDisplay
  useEffect(() => {
    // When activeSection changes, FortuneDisplay will handle it via its own state
    // This component just passes the initial state
  }, [activeSection]);

  return (
    <>
      {/* Radar Chart */}
      <Accordion title="命盘雷达图" defaultOpen={false}>
        <RadarChartComponent
          scores={radarScores}
          onDimensionClick={handleDimensionClick}
          activeDimension={activeSection}
        />
        <div className="flex justify-center gap-6 text-sm text-gray-400 mt-4 flex-wrap">
          <span>事业 {radarScores.career}分</span>
          <span>感情 {radarScores.love}分</span>
          <span>财运 {radarScores.wealth}分</span>
          <span>健康 {radarScores.health}分</span>
          <span>贵人 {radarScores.mentor}分</span>
        </div>
      </Accordion>

      {/* Fortune Analysis */}
      <div>
        <span className="text-h3 font-semibold" style={{ color: 'var(--color-accent)' }}>
          命盘解读
        </span>
        <FortuneDisplay analysis={aiAnalysis} isLocked={isLocked} />
      </div>
    </>
  );
}

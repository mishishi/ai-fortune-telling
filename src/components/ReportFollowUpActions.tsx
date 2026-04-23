'use client';

import { useState } from 'react';
import AIReportFollowUpModal from './AIReportFollowUpModal';

interface ReportFollowUpActionsProps {
  reportId: string;
  aiAnalysis: {
    career?: string;
    love?: string;
    wealth?: string;
    health?: string;
    mentorDirection?: string;
  };
}

export default function ReportFollowUpActions({ reportId, aiAnalysis }: ReportFollowUpActionsProps) {
  const [showModal, setShowModal] = useState(false);

  const dimensionContents = {
    career: aiAnalysis.career || '',
    love: aiAnalysis.love || '',
    wealth: aiAnalysis.wealth || '',
    health: aiAnalysis.health || '',
    mentor: aiAnalysis.mentorDirection || '',
  };

  return (
    <>
      {/* Floating Follow-up Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed right-6 flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          boxShadow: '0 4px 20px rgba(196, 30, 58, 0.4)',
          bottom: '80px',
          zIndex: 110,
        }}
      >
        <span className="text-lg">💬</span>
        <span>追问</span>
      </button>

      {/* Follow-up Modal */}
      <AIReportFollowUpModal
        open={showModal}
        onClose={() => setShowModal(false)}
        reportId={reportId}
        dimensions={dimensionContents}
      />
    </>
  );
}
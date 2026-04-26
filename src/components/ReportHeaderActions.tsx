'use client';

import { useState } from 'react';
import BirthDataEditModal from './BirthDataEditModal';
import { BirthFormData } from './BirthForm';

interface ReportHeaderActionsProps {
  reportId: string;
  editBirthData: BirthFormData;
}

export default function ReportHeaderActions({
  reportId,
  editBirthData,
}: ReportHeaderActionsProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="absolute top-0 right-0 flex items-center gap-2">
      <button
        onClick={() => setEditOpen(true)}
        className="group flex items-center justify-center w-10 h-10 rounded-full transition-all hover:scale-110 active:scale-95"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
        aria-label="修改信息"
      >
        <svg
          className="w-5 h-5 transition-colors group-hover:text-[var(--color-accent)]"
          style={{ color: 'var(--color-text-muted)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <BirthDataEditModal
        open={editOpen}
        reportId={reportId}
        initialData={editBirthData}
        onClose={() => setEditOpen(false)}
        onSuccess={() => setEditOpen(false)}
      />
    </div>
  );
}

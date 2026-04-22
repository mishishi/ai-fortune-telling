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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:bg-white/10 hover:text-white text-sm"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label="修改信息"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        修改信息
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

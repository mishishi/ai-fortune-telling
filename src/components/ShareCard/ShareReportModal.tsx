'use client';
import { useState } from 'react';
import { ShareCardData, TemplateType } from './types';
import StarfieldTemplate from './templates/StarfieldTemplate';
import LandscapeTemplate from './templates/LandscapeTemplate';
import NeonTemplate from './templates/NeonTemplate';

const TEMPLATES = [
  { id: 'starfield' as TemplateType, name: '星河命盘', description: '深紫+金色流星' },
  { id: 'landscape' as TemplateType, name: '山水意境', description: '水墨风格' },
  { id: 'neon' as TemplateType, name: '极简霓虹', description: '赛博朋克' },
];

interface ShareReportModalProps {
  data: ShareCardData;
  open: boolean;
  onClose: () => void;
  onGenerateImage: () => void;
  onCopyLink: () => void;
  generating: boolean;
}

export default function ShareReportModal({ data, open, onClose, onGenerateImage, onCopyLink, generating }: ShareReportModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('starfield');

  if (!open) return null;

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'starfield':
        return <StarfieldTemplate data={data} />;
      case 'landscape':
        return <LandscapeTemplate data={data} />;
      case 'neon':
        return <NeonTemplate data={data} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-lg p-6 rounded-2xl overflow-y-auto"
        style={{ background: 'var(--color-surface)', border: '1px solid rgba(212,175,55,0.2)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-1 text-center" style={{ color: 'var(--color-accent)' }}>分享报告</h3>
        <p className="text-gray-400 text-xs mb-4 text-center">选择模板后生成分享图片</p>

        {/* 模板选择器 */}
        <div className="flex gap-2 mb-4">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs transition-all ${selectedTemplate === t.id ? 'bg-[var(--color-accent)] text-black' : 'bg-white/10 text-gray-300'}`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* 预览 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          {renderTemplate()}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onCopyLink}
            className="w-full py-3 rounded-xl font-medium text-sm"
            style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))', color: 'var(--color-bg)' }}
          >
            复制链接
          </button>
          <button
            onClick={onGenerateImage}
            disabled={generating}
            className="w-full py-3 rounded-xl font-medium text-sm disabled:opacity-50"
            style={{ background: 'rgba(196,30,58,0.2)', color: 'var(--color-primary)', border: '1px solid rgba(196,30,58,0.4)' }}
          >
            {generating ? '生成中...' : '生成分享图片'}
          </button>
        </div>

        <button onClick={onClose} className="mt-3 text-gray-500 hover:text-gray-300 text-xs w-full text-center">
          取消
        </button>
      </div>
    </div>
  );
}
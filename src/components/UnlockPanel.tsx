'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/contexts/ToastContext';

// Constants
const UNLOCK_PRICE = '¥29';
const SUCCESS_REDIRECT_DELAY = 800;
const BUTTON_HEIGHT = 48;
const BUTTON_RADIUS = 24;
const SPINNER_SIZE = 16;

interface LuckyElements {
  element?: string;
  color?: string;
  number?: string;
  direction?: string;
}

interface NameSuggestions {
  element?: string;
  suggestions?: string;
}

interface AnalysisData {
  overall?: string;
  overallPlain?: string;
  career?: string;
  careerSuggest?: string;
  mentorDirection?: string;
  love?: string;
  spouseDesc?: string;
  marriageAdvice?: string;
  wealth?: string;
  health?: string;
  fortune?: string;
  yearly?: string;
  luckyElements?: LuckyElements;
  nameSuggestions?: NameSuggestions;
}

interface UnlockPanelProps {
  reportId: string;
  hiddenSections: string[];
  isLocked: boolean;
  analysis?: AnalysisData;
}

// Truncate text to first sentence or max chars
function truncateText(text: string, maxChars: number = 60): string {
  if (!text) return '';
  // Find first sentence ending
  const firstSentence = text.match(/[^。；？]+[。；？]/);
  if (firstSentence) {
    return firstSentence[0].slice(0, maxChars + 3) + '...';
  }
  return text.slice(0, maxChars) + '...';
}

// Build preview items from actual analysis data
function buildPreviewItems(hiddenSections: string[], analysis?: AnalysisData) {
  const items: { key: string; label: string; content: string }[] = [];

  // Map section keys to analysis fields and labels
  const sectionMap: Record<string, { label: string; getValue: (a: AnalysisData) => string | undefined }> = {
    careerSuggest: {
      label: '职业推荐',
      getValue: (a) => a.careerSuggest,
    },
    mentorDirection: {
      label: '贵人方位',
      getValue: (a) => a.mentorDirection,
    },
    spouseDesc: {
      label: '配偶特征',
      getValue: (a) => a.spouseDesc,
    },
    marriageAdvice: {
      label: '婚恋建议',
      getValue: (a) => a.marriageAdvice,
    },
    luckyElements: {
      label: '幸运元素',
      getValue: (a) => {
        const le = a.luckyElements;
        if (!le) return undefined;
        const parts = [];
        if (le.color) parts.push(`幸运色：${le.color}`);
        if (le.number) parts.push(`幸运数字：${le.number}`);
        if (le.direction) parts.push(`宜往${le.direction}发展`);
        return parts.length > 0 ? parts.join('；') + '。' : undefined;
      },
    },
    nameSuggestions: {
      label: '起名建议',
      getValue: (a) => {
        const ns = a.nameSuggestions;
        if (!ns) return undefined;
        const parts = [];
        if (ns.element) parts.push(`补救五行：${ns.element}`);
        if (ns.suggestions) parts.push(`起名建议：${ns.suggestions}`);
        return parts.length > 0 ? parts.join('；') : undefined;
      },
    },
  };

  // Only show items that are in hiddenSections and have actual content
  for (const key of hiddenSections) {
    const def = sectionMap[key];
    if (!def) continue;
    const content = def.getValue(analysis || {});
    if (!content) continue;
    items.push({ key, label: def.label, content: truncateText(content, 50) });
  }

  return items;
}

export default function UnlockPanel({ reportId, hiddenSections, isLocked, analysis }: UnlockPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'success'>('default');
  const isUnlockingRef = useRef(false);
  const { showToast } = useToast();

  // Build preview items from actual analysis data
  const previewItems = buildPreviewItems(hiddenSections, analysis);

  // If already unlocked, don't render
  if (!isLocked) {
    return null;
  }

  const handleUnlock = async () => {
    if (isUnlockingRef.current) return;
    isUnlockingRef.current = true;

    setButtonState('loading');

    try {
      const res = await fetch(`/api/reports/${reportId}/unlock`, {
        method: 'POST',
      });

      if (res.ok) {
        setButtonState('success');
        // Wait SUCCESS_REDIRECT_DELAY then reload page
        setTimeout(() => {
          window.location.reload();
        }, SUCCESS_REDIRECT_DELAY);
      } else {
        throw new Error('Unlock failed');
      }
    } catch (error) {
      console.error('Failed to unlock:', error);
      showToast('解锁失败，请重试', 'error');
      setButtonState('default');
    } finally {
      isUnlockingRef.current = false;
    }
  };

  // Collapsed state - show single line with expand arrow
  if (!isExpanded) {
    return (
      <div
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: 'var(--color-accent)',
          fontFamily: 'var(--font-serif)',
        }}
        onClick={() => setIsExpanded(true)}
      >
        <span style={{ fontWeight: 600 }}>解锁完整报告查看更多详情</span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '24px 20px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Gold decorative divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
        }}
      >
        <span
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            color: 'var(--color-accent)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.1em',
          }}
        >
          解锁完整报告
        </span>
        <span
          style={{
            flex: 1,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
          }}
        />
      </div>

      {/* Content preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            marginBottom: '4px',
          }}
        >
          包含以下深度内容：
        </p>
        {previewItems.length > 0 ? previewItems.map((item) => (
          <div
            key={item.key}
            style={{
              display: 'flex',
              gap: '8px',
              fontSize: '14px',
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: 'var(--color-accent)', fontWeight: 500 }}>
              ·
            </span>
            <span>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                {item.label}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                {' '}
                — {item.content}
              </span>
            </span>
          </div>
        )) : (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center' }}>
            解锁后查看更多深度分析
          </p>
        )}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleUnlock}
        disabled={buttonState !== 'default'}
        aria-label="解锁完整报告"
        className="unlock-cta-button"
        style={{
          height: `${BUTTON_HEIGHT}px`,
          width: '100%',
          borderRadius: `${BUTTON_RADIUS}px`,
          border: 'none',
          cursor: buttonState === 'default' ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 600,
          background:
            buttonState === 'success'
              ? 'var(--color-success)'
              : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          color: buttonState === 'success' ? 'white' : 'var(--color-text)',
          transition: 'all 150ms ease',
          boxShadow:
            buttonState === 'default'
              ? '0 4px 16px rgba(212, 175, 55, 0.3)'
              : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {buttonState === 'loading' && (
          <>
            <span
              className="spinner"
              style={{
                display: 'inline-block',
                width: `${SPINNER_SIZE}px`,
                height: `${SPINNER_SIZE}px`,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'currentColor',
                borderRadius: '50%',
              }}
            />
            <span>处理中...</span>
          </>
        )}
        {buttonState === 'success' && <span>已解锁 ✓</span>}
        {buttonState === 'default' && <span>解锁完整报告 — {UNLOCK_PRICE}</span>}
      </button>

      {/* Collapse button */}
      <button
        onClick={() => setIsExpanded(false)}
        aria-label="收起面板"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px',
        }}
      >
        <span>收起</span>
        <span style={{ fontSize: '10px' }}>▲</span>
      </button>

      <style jsx>{`
        .unlock-cta-button {
          transform: translateY(0);
        }
        .unlock-cta-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.3);
        }
        .unlock-cta-button:active:not(:disabled) {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
}

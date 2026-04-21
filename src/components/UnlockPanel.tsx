'use client';

import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';

interface UnlockPanelProps {
  reportId: string;
  hiddenSections: string[];
  isLocked: boolean;
}

interface PreviewItem {
  key: string;
  label: string;
  sample: string;
}

const PREVIEW_ITEMS: PreviewItem[] = [
  {
    key: 'careerSuggest',
    label: '职业推荐',
    sample: '适合从事文化创意、教育培训类工作，如编辑、教师、设计师等',
  },
  {
    key: 'mentorDirection',
    label: '贵人方位',
    sample: '东北方向利于人脉拓展，农历三月、九月贵人运最旺',
  },
  {
    key: 'spouseDesc',
    label: '配偶特征',
    sample: '性格温和稳重，年长2-4岁为宜，旺夫/旺妻之相',
  },
  {
    key: 'marriageAdvice',
    label: '婚恋建议',
    sample: '今年姻缘运上升，把握秋季9-11月良机，可主动社交',
  },
  {
    key: 'luckyElements',
    label: '幸运元素',
    sample: '幸运色：金色、白色；幸运数字：3、7；宜往西北方发展',
  },
  {
    key: 'nameSuggestions',
    label: '起名建议',
    sample: '宜用带"金""玉"偏旁的字，五行补木，避免与长辈重字',
  },
];

export default function UnlockPanel({ reportId, hiddenSections, isLocked }: UnlockPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [buttonState, setButtonState] = useState<'default' | 'loading' | 'success'>('default');
  const { showToast } = useToast();

  // If already unlocked, don't render
  if (!isLocked) {
    return null;
  }

  const handleUnlock = async () => {
    if (buttonState !== 'default') return;

    setButtonState('loading');

    try {
      const res = await fetch(`/api/reports/${reportId}/unlock`, {
        method: 'POST',
      });

      if (res.ok) {
        setButtonState('success');
        // Wait 800ms then reload page
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        throw new Error('Unlock failed');
      }
    } catch (error) {
      console.error('Failed to unlock:', error);
      showToast('解锁失败，请重试', 'error');
      setButtonState('default');
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
        {PREVIEW_ITEMS.map((item) => (
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
                — {item.sample}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={handleUnlock}
        disabled={buttonState !== 'default'}
        style={{
          height: '48px',
          width: '100%',
          borderRadius: '24px',
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
          transform: 'translateY(0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
        onMouseEnter={(e) => {
          if (buttonState === 'default') {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (buttonState === 'default') {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(212, 175, 55, 0.3)';
          }
        }}
        onMouseDown={(e) => {
          if (buttonState === 'default') {
            e.currentTarget.style.transform = 'scale(0.98)';
          }
        }}
        onMouseUp={(e) => {
          if (buttonState === 'default') {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
      >
        {buttonState === 'loading' && (
          <>
            <span
              style={{
                display: 'inline-block',
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span>处理中...</span>
          </>
        )}
        {buttonState === 'success' && <span>已解锁 ✓</span>}
        {buttonState === 'default' && <span>解锁完整报告 — ¥29</span>}
      </button>

      {/* Collapse button */}
      <button
        onClick={() => setIsExpanded(false)}
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

      {/* Keyframes for spin animation */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

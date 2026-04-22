'use client';

import { useState, useEffect, useRef } from 'react';

interface BirthDatePickerProps {
  year: number;
  month: number;
  day: number;
  error?: string;
  onChange: (year: number, month: number, day: number) => void;
  onBlur: () => void;
}

const MIN_YEAR = 1980;
const MAX_YEAR = 2026;
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function BirthDatePicker({ year, month, day, error, onChange, onBlur }: BirthDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);
  const [viewMonth, setViewMonth] = useState(month);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync viewYear/viewMonth with props when popup closes
  useEffect(() => {
    if (!isOpen) {
      setViewYear(year);
      setViewMonth(month);
    }
  }, [isOpen, year, month]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Calendar calculation
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Build calendar grid (7 columns x 6 rows max)
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }
  while (calendarDays.length < 42) {
    calendarDays.push(null);
  }

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() + 1 && viewYear === today.getFullYear();

  const isSelected = (d: number) =>
    d === day && viewMonth === month && viewYear === year;

  const handleDayClick = (d: number) => {
    onChange(viewYear, viewMonth, d);
    setIsOpen(false);
  };

  const navigateMonth = (delta: number) => {
    let newMonth = viewMonth + delta;
    let newYear = viewYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    if (newYear >= MIN_YEAR && newYear <= MAX_YEAR) {
      setViewYear(newYear);
      setViewMonth(newMonth);
    }
  };

  const formattedDate = `${year}年${month}月${day}日`;

  return (
    <div>
      <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>出生日期</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onBlur={onBlur}
        className="w-full rounded-lg px-3 py-3 text-white text-center focus:outline-none transition-colors border flex items-center justify-between"
        style={{
          background: 'var(--color-surface)',
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
        }}
        aria-invalid={!!error}
        aria-describedby={error ? 'birth-date-error' : undefined}
      >
        <span className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formattedDate}</span>
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease-out',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {error && (
        <p id="birth-date-error" className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}

      {isOpen && (
        <div
          ref={popupRef}
          className="popup-overlay"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '16px',
            minWidth: '320px',
            animation: 'popupIn 200ms ease-out forwards',
          }}
        >
          <style>{`
            @keyframes popupIn {
              from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
            }
          `}</style>

          {/* Header Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                fontSize: '18px',
              }}
            >
              ◀
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value))}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-accent)',
                  padding: '4px 8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>

              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value))}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-accent)',
                  padding: '4px 8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => navigateMonth(1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                fontSize: '18px',
              }}
            >
              ▶
            </button>
          </div>

          {/* Weekday Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '8px',
            }}
          >
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
            }}
          >
            {calendarDays.map((d, index) => {
              if (d === null) {
                return <div key={`empty-${index}`} style={{ width: '40px', height: '40px' }} />;
              }

              const selected = isSelected(d);
              const todayMark = isToday(d);

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDayClick(d)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    border: todayMark ? '2px solid var(--color-accent)' : 'none',
                    background: selected
                      ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                      : 'transparent',
                    color: selected
                      ? '#fff'
                      : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) {
                      e.currentTarget.style.background = 'var(--color-surface)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

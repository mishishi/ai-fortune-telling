# Birth Date Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 3-column number input birth date picker with a custom calendar popup modal

**Architecture:** Modal-based calendar with year/month dropdown navigation, built as a controlled React component

**Tech Stack:** React, TypeScript, Tailwind CSS with CSS custom properties

---

## Task 1: Rewrite BirthDatePicker.tsx with Calendar Popup

**Files:**
- Modify: `src/components/BirthForm/BirthDatePicker.tsx` - Complete rewrite with calendar popup
- Read: `src/components/ui/CustomDropdown.tsx` - Reference for dropdown patterns
- Read: `docs/superpowers/specs/2026-04-22-birth-date-picker-design.md` - Design spec

- [ ] **Step 1: Rewrite BirthDatePicker.tsx with calendar popup base structure**

```typescript
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
const MAX_YEAR = new Date().getFullYear(); // 2026

export default function BirthDatePicker({ year, month, day, error, onChange, onBlur }: BirthDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(year);
  const [viewMonth, setViewMonth] = useState(month);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with props when closed
  useEffect(() => {
    if (!isOpen) {
      setViewYear(year);
      setViewMonth(month);
    }
  }, [isOpen, year, month]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Calculate calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const calendarDays: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete 6 rows
  while (calendarDays.length < 42) calendarDays.push(null);

  const handleDayClick = (d: number) => {
    onChange(viewYear, viewMonth, d);
    setIsOpen(false);
  };

  const displayDate = year && month && day
    ? `${year}年${month}月${day}日`
    : '请选择日期';

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
        出生日期
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] border transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        style={{
          background: 'var(--color-surface)',
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
        }}
      >
        <span className="text-white">{displayDate}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      {error && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{error}</p>}

      {isOpen && (
        <div
          className="absolute z-50 mt-1 p-4 rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] animate-fade-in-scale"
          style={{
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            width: '320px',
          }}
        >
          {/* Calendar grid - will be enhanced in Task 2 */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-xs py-1" style={{ color: 'var(--color-text-muted)' }}>{d}</div>
            ))}
            {calendarDays.map((d, i) => (
              <button
                key={i}
                type="button"
                disabled={!d}
                onClick={() => d && handleDayClick(d)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  !d ? 'invisible' : ''
                } ${d === day && viewYear === year && viewMonth === month ? 'text-white' : 'text-gray-300'} hover:bg-white/10`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Run dev server to verify it compiles**

Run: `cd D:/claude/workspace/ai-fortune-telling && npm run dev`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/BirthForm/BirthDatePicker.tsx
git commit -m "feat: rewrite BirthDatePicker with calendar popup base"
```

---

## Task 2: Add Year/Month Quick Jump Dropdowns

**Files:**
- Modify: `src/components/BirthForm/BirthDatePicker.tsx`

- [ ] **Step 1: Add year/month dropdown selectors and navigation arrows**

Replace the calendar popup section with enhanced version including:
- Left/right month navigation arrows
- Year dropdown (1980-2026)
- Month dropdown (1-12)
- Today button
- Better styling per spec

```typescript
// Add to the calendar popup div:
<div className="mb-3 flex items-center justify-between">
  <button
    type="button"
    onClick={() => setViewMonth(m => m === 1 ? 12 : m - 1)}
    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
    style={{ color: 'var(--color-accent)' }}
  >
    ◀
  </button>
  <div className="flex gap-2">
    <select
      value={viewYear}
      onChange={e => setViewYear(Number(e.target.value))}
      className="px-2 py-1 rounded-lg text-sm border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
    >
      {Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i).map(y => (
        <option key={y} value={y}>{y}年</option>
      ))}
    </select>
    <select
      value={viewMonth}
      onChange={e => setViewMonth(Number(e.target.value))}
      className="px-2 py-1 rounded-lg text-sm border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-accent)' }}
    >
      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
        <option key={m} value={m}>{m}月</option>
      ))}
    </select>
  </div>
  <button
    type="button"
    onClick={() => setViewMonth(m => m === 12 ? 1 : m + 1)}
    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
    style={{ color: 'var(--color-accent)' }}
  >
    ▶
  </button>
</div>
```

- [ ] **Step 2: Add Today button**

```typescript
<div className="text-center mb-2">
  <button
    type="button"
    onClick={() => {
      const today = new Date();
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth() + 1);
    }}
    className="text-xs px-3 py-1 rounded-full border"
    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
  >
    今天
  </button>
</div>
```

- [ ] **Step 3: Enhance day cells with proper styling per spec**

- [ ] **Step 4: Run dev server verify**

- [ ] **Step 5: Commit**

```bash
git add src/components/BirthForm/BirthDatePicker.tsx
git commit -m "feat: add year/month quick jump dropdowns to calendar"
```

---

## Task 3: Update BirthForm.tsx to Use New BirthDatePicker

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: Update imports to use BirthDatePicker**

Change from:
```typescript
// Currently uses native date input
```

To:
```typescript
import BirthDatePicker from './BirthForm/BirthDatePicker';
```

- [ ] **Step 2: Replace the native date input with BirthDatePicker component**

Find the date input section and replace with:
```typescript
<BirthDatePicker
  year={form.year}
  month={form.month}
  day={form.day}
  error={errors.date}
  onChange={(y, m, d) => {
    setForm({ ...form, year: y, month: m, day: d });
    clearError('date');
  }}
  onBlur={() => validate('date', null, form)}
/>
```

- [ ] **Step 3: Run dev server verify**

- [ ] **Step 4: Commit**

```bash
git add src/components/BirthForm.tsx
git commit -m "feat: integrate new BirthDatePicker component"
```

---

## Task 4: Manual Testing and Verification

**Files:**
- Test at `http://localhost:3004`

- [ ] **Step 1: Start dev server on port 3004**

- [ ] **Step 2: Test the calendar popup**
- [ ] **Step 3: Test year/month dropdown quick jump**
- [ ] **Step 4: Test day selection closes popup**
- [ ] **Step 5: Test click outside closes popup**
- [ ] **Step 6: Test validation works**
- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete custom birth date picker implementation"
```

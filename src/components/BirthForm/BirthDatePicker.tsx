'use client';

interface BirthDatePickerProps {
  year: number;
  month: number;
  day: number;
  error?: string;
  onChange: (field: 'year' | 'month' | 'day', value: number) => void;
  onBlur: () => void;
}

export default function BirthDatePicker({ year, month, day, error, onChange, onBlur }: BirthDatePickerProps) {
  return (
    <div>
      <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>出生日期</label>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <input
            id="birth-year"
            type="number"
            value={year}
            onChange={e => onChange('year', parseInt(e.target.value))}
            onBlur={onBlur}
            className="w-full rounded-lg px-3 py-3 text-white text-center focus:outline-none transition-colors border"
            style={{ background: 'var(--color-surface)', borderColor: error ? 'var(--color-error)' : 'var(--color-border)' }}
            placeholder="年"
            min={1900}
            max={2100}
            aria-invalid={!!error}
            aria-describedby={error ? 'birth-date-error' : undefined}
          />
        </div>
        <div>
          <input
            id="birth-month"
            type="number"
            value={month}
            onChange={e => onChange('month', parseInt(e.target.value))}
            onBlur={onBlur}
            className="w-full rounded-lg px-3 py-3 text-white text-center focus:outline-none transition-colors border"
            style={{ background: 'var(--color-surface)', borderColor: error ? 'var(--color-error)' : 'var(--color-border)' }}
            placeholder="月"
            min={1}
            max={12}
            aria-invalid={!!error}
          />
        </div>
        <div>
          <input
            id="birth-day"
            type="number"
            value={day}
            onChange={e => onChange('day', parseInt(e.target.value))}
            onBlur={onBlur}
            className="w-full rounded-lg px-3 py-3 text-white text-center focus:outline-none transition-colors border"
            style={{ background: 'var(--color-surface)', borderColor: error ? 'var(--color-error)' : 'var(--color-border)' }}
            placeholder="日"
            min={1}
            max={31}
            aria-invalid={!!error}
          />
        </div>
      </div>
      {error && <p id="birth-date-error" className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{error}</p>}
    </div>
  );
}

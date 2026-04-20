'use client';

import CustomDropdown from '@/components/ui/CustomDropdown';

interface BirthTimePickerProps {
  hour: number;
  minute: number;
  hourError?: string;
  minuteError?: string;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onMinuteBlur: () => void;
}

// 12 earthly branches with hour ranges
const EARTHLY_BRANCHES = [
  { name: '子时', range: '23:00-00:59', hour: 23 },
  { name: '丑时', range: '01:00-02:59', hour: 1 },
  { name: '寅时', range: '03:00-04:59', hour: 3 },
  { name: '卯时', range: '05:00-06:59', hour: 5 },
  { name: '辰时', range: '07:00-08:59', hour: 7 },
  { name: '巳时', range: '09:00-10:59', hour: 9 },
  { name: '午时', range: '11:00-12:59', hour: 11 },
  { name: '未时', range: '13:00-14:59', hour: 13 },
  { name: '申时', range: '15:00-16:59', hour: 15 },
  { name: '酉时', range: '17:00-18:59', hour: 17 },
  { name: '戌时', range: '19:00-20:59', hour: 19 },
  { name: '亥时', range: '21:00-22:59', hour: 21 },
];

export default function BirthTimePicker({
  hour,
  minute,
  hourError,
  minuteError,
  onHourChange,
  onMinuteChange,
  onMinuteBlur,
}: BirthTimePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>出生时辰</label>
        <CustomDropdown
          value={hour}
          options={EARTHLY_BRANCHES.map(b => ({
            label: `${b.name}（${b.range}）`,
            value: b.hour,
          }))}
          onChange={v => onHourChange(Number(v))}
          error={hourError}
        />
      </div>
      <div>
        <label htmlFor="birth-minute" className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>分</label>
        <input
          id="birth-minute"
          type="number"
          value={minute}
          onChange={e => onMinuteChange(parseInt(e.target.value))}
          onBlur={onMinuteBlur}
          className="w-full rounded-lg px-3 py-3 text-white text-center focus:outline-none transition-colors border"
          style={{ background: 'var(--color-surface)', borderColor: minuteError ? 'var(--color-error)' : 'var(--color-border)' }}
          min={0}
          max={59}
          aria-invalid={!!minuteError}
          aria-describedby={minuteError ? 'birth-minute-error' : undefined}
        />
        {minuteError && <p id="birth-minute-error" className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{minuteError}</p>}
      </div>
    </div>
  );
}

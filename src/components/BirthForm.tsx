'use client';
import { useState } from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import BirthDatePicker from './BirthForm/BirthDatePicker';
import { useFormValidation } from '@/hooks/useFormValidation';

type TimeSegment = 'early' | 'middle' | 'late';

// 时辰三段定义：每个时辰的早/中/晚对应的时钟小时和分钟
const TIME_SEGMENTS: Record<number, { early: { hour: number; minute: number }; middle: { hour: number; minute: number }; late: { hour: number; minute: number } }> = {
  23: { early: { hour: 23, minute: 0 }, middle: { hour: 0, minute: 0 }, late: { hour: 0, minute: 30 } }, // 子时
  1: { early: { hour: 1, minute: 0 }, middle: { hour: 2, minute: 0 }, late: { hour: 2, minute: 30 } },  // 丑时
  3: { early: { hour: 3, minute: 0 }, middle: { hour: 4, minute: 0 }, late: { hour: 4, minute: 30 } },  // 寅时
  5: { early: { hour: 5, minute: 0 }, middle: { hour: 6, minute: 0 }, late: { hour: 6, minute: 30 } },  // 卯时
  7: { early: { hour: 7, minute: 0 }, middle: { hour: 8, minute: 0 }, late: { hour: 8, minute: 30 } },  // 辰时
  9: { early: { hour: 9, minute: 0 }, middle: { hour: 10, minute: 0 }, late: { hour: 10, minute: 30 } }, // 巳时
  11: { early: { hour: 11, minute: 0 }, middle: { hour: 12, minute: 0 }, late: { hour: 12, minute: 30 } },// 午时
  13: { early: { hour: 13, minute: 0 }, middle: { hour: 14, minute: 0 }, late: { hour: 14, minute: 30 } },// 未时
  15: { early: { hour: 15, minute: 0 }, middle: { hour: 16, minute: 0 }, late: { hour: 16, minute: 30 } },// 申时
  17: { early: { hour: 17, minute: 0 }, middle: { hour: 18, minute: 0 }, late: { hour: 18, minute: 30 } },// 酉时
  19: { early: { hour: 19, minute: 0 }, middle: { hour: 20, minute: 0 }, late: { hour: 20, minute: 30 } },// 戌时
  21: { early: { hour: 21, minute: 0 }, middle: { hour: 22, minute: 0 }, late: { hour: 22, minute: 30 } },// 亥时
};

const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆',
];

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

interface BirthFormProps {
  onSubmit: (data: BirthFormData) => Promise<void>;
}

export interface BirthFormData {
  name: string;
  gender: 'male' | 'female';
  year: number;
  month: number;
  day: number;
  hour: number;        // 时钟小时（0-23）
  minute: number;      // 保留但固定为0
  province: string;
  timeSegment: TimeSegment; // 早/中/晚
}

function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Validation rules for the form
const validationRules = [
  {
    field: 'name',
    rules: [
      { test: (v: any) => typeof v === 'string' && v.trim().length > 0, message: '请输入姓名' },
      { test: (v: any) => typeof v === 'string' && v.trim().length >= 2, message: '姓名至少需要2个字符' },
    ],
  },
  {
    field: 'date',
    rules: [
      { test: (_: any, form: any) => isValidDate(form.year, form.month, form.day), message: '请输入有效的出生日期' },
    ],
  },
  {
    field: 'province',
    rules: [
      { test: (v: any) => !!v, message: '请选择出生省份' },
    ],
  },
];

export default function BirthForm({ onSubmit }: BirthFormProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BirthFormData>({
    name: '',
    gender: 'male',
    year: new Date().getFullYear(),
    month: 1,
    day: 1,
    hour: 8,
    minute: 0,  // 保留但UI不显示
    province: '',
    timeSegment: 'middle', // 默认选中"中"
  });

  const { errors, validate, clearError, validateAll } = useFormValidation(validationRules);

  // 将 year/month/day 组合为 YYYY-MM-DD 格式用于 date picker
  const birthDateString = form.year && form.month && form.day
    ? `${form.year}-${String(form.month).padStart(2, '0')}-${String(form.day).padStart(2, '0')}`
    : '';

  const handleReset = () => {
    setForm({
      name: '',
      gender: 'male',
      year: new Date().getFullYear(),
      month: 1,
      day: 1,
      hour: 8,
      minute: 0,
      province: '',
      timeSegment: 'middle',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll(form)) return;
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[var(--radius-xl)] p-[var(--space-xl)] space-y-5 w-full max-w-md">
      {/* Header with reset button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>出生信息</h2>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm flex items-center gap-1 transition-colors hover:scale-105"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          重置
        </button>
      </div>

      {/* Name field */}
      <div>
        <label htmlFor="birth-name" className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>姓名</label>
        <input
          id="birth-name"
          type="text"
          value={form.name}
          onChange={e => { setForm({ ...form, name: e.target.value }); clearError('name'); }}
          onBlur={() => validate('name', form.name)}
          className="w-full rounded-[var(--radius-md)] px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-colors border"
          style={{
            background: 'var(--color-surface)',
            borderColor: errors.name ? 'var(--color-error)' : 'var(--color-border)',
          }}
          placeholder="请输入姓名"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'birth-name-error' : undefined}
        />
        {errors.name && <p id="birth-name-error" className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.name}</p>}
      </div>

      {/* Gender field - compact pill style */}
      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>性别</label>
        <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--color-surface)' }}>
          {(['male', 'female'] as const).map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setForm({ ...form, gender: g })}
              className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium ${
                form.gender === g
                  ? 'text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              style={
                form.gender === g
                  ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }
                  : {}
              }
            >
              <span>{g === 'male' ? '👨' : '👩'}</span>
              <span>{g === 'male' ? '男' : '女'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 出生日期 - 自定义日历选择器 */}
      <div>
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
      </div>

      {/* 出生时辰 - 地支下拉 + 早/中/晚三段选择 */}
      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
          出生时辰
        </label>

        {/* 地支下拉选择 */}
        <div className="mb-3">
          <CustomDropdown
            value={form.hour}
            options={EARTHLY_BRANCHES.map(b => ({
              label: `${b.name} ${b.range}`,
              displayValue: b.range,
              value: b.hour,
            }))}
            onChange={v => {
              setForm({ ...form, hour: Number(v), timeSegment: 'middle' }); // 切换时辰时默认选中"中"
            }}
            dropUp={true}
          />
        </div>

        {/* 早/中/晚三段选择按钮 */}
        <div
          className="flex gap-2"
          role="radiogroup"
          aria-label="出生时辰段"
        >
          {(['early', 'middle', 'late'] as const).map(segment => (
            <button
              key={segment}
              type="button"
              onClick={() => {
                const segmentData = TIME_SEGMENTS[form.hour]?.[segment];
                if (segmentData) {
                  setForm({
                    ...form,
                    hour: segmentData.hour,
                    minute: segmentData.minute,
                    timeSegment: segment,
                  });
                }
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                form.timeSegment === segment
                  ? 'text-white'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              style={
                form.timeSegment === segment
                  ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }
                  : { background: 'var(--color-surface)' }
              }
            >
              {segment === 'early' ? '早' : segment === 'middle' ? '中' : '晚'}
            </button>
          ))}
        </div>
      </div>

      {/* Province field */}
      <div>
        <label id="birth-province-label" className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>出生省份</label>
        <CustomDropdown
          id="birth-province"
          value={form.province}
          options={PROVINCES.map(p => ({ label: p, value: p }))}
          onChange={v => { setForm({ ...form, province: String(v) }); clearError('province'); }}
          onBlur={() => validate('province', form.province)}
          placeholder="请选择省份"
          error={errors.province}
        />
        {errors.province && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{errors.province}</p>}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          color: 'white',
          boxShadow: 'var(--shadow-glow-primary)',
        }}
      >
        <span className="relative z-10">{loading ? '解读中...' : '开启命盘解读'}</span>
        <span
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-hover), var(--color-secondary))',
          }}
        />
      </button>

      {/* Privacy Notice */}
      <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        🔒 您的信息仅用于命理分析，绝不对外共享
      </p>
    </form>
  );
}

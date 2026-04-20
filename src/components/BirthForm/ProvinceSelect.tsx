'use client';
import CustomDropdown from '@/components/ui/CustomDropdown';

const PROVINCES = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆',
];

interface ProvinceSelectProps {
  value: string;
  onChange: (province: string) => void;
  onBlur: () => void;
  error?: string;
}

export default function ProvinceSelect({ value, onChange, onBlur, error }: ProvinceSelectProps) {
  return (
    <div>
      <label id="birth-province-label" className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>出生省份</label>
      <CustomDropdown
        id="birth-province"
        value={value}
        options={PROVINCES.map(p => ({ label: p, value: p }))}
        onChange={v => { onChange(String(v)); }}
        onBlur={onBlur}
        placeholder="请选择省份"
        error={error}
      />
      {error && <p className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{error}</p>}
    </div>
  );
}

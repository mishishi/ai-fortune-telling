'use client';

interface GenderSelectProps {
  value: 'male' | 'female';
  onChange: (gender: 'male' | 'female') => void;
}

export default function GenderSelect({ value, onChange }: GenderSelectProps) {
  return (
    <div>
      <label className="block text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>性别</label>
      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--color-surface)' }}>
        {(['male', 'female'] as const).map(g => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-medium ${
              value === g
                ? 'text-white shadow-md'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={
              value === g
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
  );
}

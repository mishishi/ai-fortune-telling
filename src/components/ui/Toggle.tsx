'use client';

import { KeyboardEvent } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeStyles = {
  sm: {
    track: 'w-9 h-[18px]',      // 36px × 18px
    thumb: 'w-[14px] h-[14px]',  // 14px diameter
    translate: 'translate-x-[22px]', // 36 - 14 = 22px
  },
  md: {
    track: 'w-12 h-6',           // 48px × 24px
    thumb: 'w-5 h-5',            // 20px diameter
    translate: 'translate-x-[28px]', // 48 - 20 = 28px
  },
  lg: {
    track: 'w-[60px] h-[30px]',   // 60px × 30px
    thumb: 'w-[26px] h-[26px]',  // 26px diameter
    translate: 'translate-x-[34px]', // 60 - 26 = 34px
  },
};

export function Toggle({ checked, onChange, disabled = false, size = 'md', label }: ToggleProps) {
  const styles = sizeStyles[size];

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={`
        relative ${styles.track}
        rounded-full
        overflow-hidden
        transition-colors duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] focus-visible:shadow-[0_0_12px_var(--color-gold)]
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked
          ? 'bg-gradient-to-r from-[var(--color-purple)] to-[var(--color-purple-dark)] hover:brightness-110'
          : 'bg-white/20 hover:bg-white/30 hover:brightness-110 hover:saturate-150'
        }
      `}
      style={{
        boxShadow: checked
          ? 'inset 0 0 0 1px var(--color-gold)'
          : 'none',
      }}
    >
      <span
        className={`
          absolute top-1/2 -translate-y-1/2
          ${styles.thumb}
          rounded-full
          bg-white
          transition-transform duration-200
          ${checked ? styles.translate : 'left-1'}
        `}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      />
    </button>
  );
}

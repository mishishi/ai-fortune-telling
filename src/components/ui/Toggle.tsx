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
      tabIndex={0}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={handleKeyDown}
      className={`
        relative ${styles.track}
        rounded-full
        transition-colors duration-200 ease-out
        focus:outline-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked
          ? 'bg-gradient-to-r from-[#7b68ee] to-[#4169e1]'
          : 'bg-white/20'
        }
      `}
      style={{
        boxShadow: checked
          ? '0 0 0 2px #f0c674'
          : 'none',
      }}
    >
      <span
        className={`
          absolute top-1/2 -translate-y-1/2
          ${styles.thumb}
          rounded-full
          bg-white
          shadow
          transition-transform duration-200 ease-out
          ${checked ? styles.translate : 'left-1'}
        `}
      />
    </button>
  );
}

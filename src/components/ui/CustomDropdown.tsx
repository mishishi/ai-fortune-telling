'use client';
import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';

interface CustomDropdownProps {
  id?: string;
  value: string | number;
  options: { label: string; value: string | number }[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  error?: string;
  onBlur?: () => void;
}

export default function CustomDropdown({ id, value, options, onChange, placeholder, error, onBlur }: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxId = id ? `${id}-listbox` : undefined;

  const selectedOption = options.find(o => String(o.value) === String(value));

  // Focus the option button when focusedIndex changes
  useEffect(() => {
    if (open && focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex, open]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = useCallback(() => {
    setOpen(prev => {
      if (!prev) {
        // Check if dropdown would go off screen bottom
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
          const spaceBelow = window.innerHeight - rect.bottom;
          setDropUp(spaceBelow < 300);
        }
        // Set focused index to selected option when opening
        const selectedIdx = options.findIndex(o => String(o.value) === String(value));
        setFocusedIndex(options.length > 0 ? (selectedIdx >= 0 ? selectedIdx : 0) : -1);
      } else {
        setFocusedIndex(-1);
      }
      return !prev;
    });
  }, [options, value]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        toggleOpen();
      } else {
        setFocusedIndex(prev => (prev + 1 >= options.length ? 0 : prev + 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        toggleOpen();
      } else {
        setFocusedIndex(prev => (prev - 1 < 0 ? options.length - 1 : prev - 1));
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (open) {
        setFocusedIndex(0);
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      if (open) {
        setFocusedIndex(options.length - 1);
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && focusedIndex >= 0) {
        onChange(options[focusedIndex].value);
        setOpen(false);
        setFocusedIndex(-1);
      } else {
        toggleOpen();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setFocusedIndex(-1);
    }
  }, [open, options, focusedIndex, onChange, toggleOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        id={id}
        type="button"
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        onBlur={() => onBlur?.()}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={id ? `${id}-label` : undefined}
        aria-activedescendant={open && focusedIndex >= 0 ? `${listboxId}-option-${focusedIndex}` : undefined}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] ${error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)']} hover:border-[var(--color-border-hover)] ${open ? 'border-[var(--color-primary)]' : ''}`}
        style={{
          background: 'var(--color-surface)',
          borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
        }}
      >
        <span className={selectedOption ? 'text-white' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : (placeholder || '请选择')}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          className={`absolute z-50 w-full rounded-lg shadow-xl max-h-[70vh] overflow-y-auto ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) transparent',
          }}
        >
          <style>{`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: rgba(255,255,255,0.05);
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb {
              background: rgba(255,255,255,0.3);
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: rgba(255,255,255,0.5);
            }
          `}</style>
          {options.length === 0 && (
            <div className="px-4 py-8 text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                暂无可选项目
              </p>
            </div>
          )}
          {options.length > 0 && (
            <div className="py-1">
              {options.map((option, index) => (
            <button
              key={String(option.value)}
              id={`${listboxId}-option-${index}`}
              ref={(el) => { optionRefs.current[index] = el; }}
              type="button"
              role="option"
              aria-selected={String(option.value) === String(value)}
              tabIndex={focusedIndex === index ? 0 : -1}
              onClick={() => { onChange(option.value); setOpen(false); setFocusedIndex(-1); }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`w-full px-4 py-2.5 text-left transition-colors focus:outline-none ${
                String(option.value) === String(value) ? 'text-white' : 'text-gray-300'
              }`}
              style={{
                background: focusedIndex === index
                  ? 'rgba(var(--color-primary-rgb), 0.25)'
                  : String(option.value) === String(value) ? 'rgba(var(--color-primary-rgb), 0.15)' : undefined,
              }}
            >
              {option.label}
            </button>
          ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

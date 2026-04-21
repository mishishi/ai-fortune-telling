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
  const [isAnimating, setIsAnimating] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
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
        if (open) {
          setIsAnimating(false);
          setFocusedIndex(-1);
          setTimeout(() => {
            setIsRendered(false);
          }, 200);
        }
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleOpen = useCallback(() => {
    if (open) {
      // Start exit animation
      setIsAnimating(false);
      setFocusedIndex(-1);
      // Delay unmount to allow exit animation
      setTimeout(() => {
        setIsRendered(false);
      }, 200);
    } else {
      // Prepare for entrance animation
      setIsRendered(true);
      // Check if dropdown would go off screen bottom
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        const spaceBelow = window.innerHeight - rect.bottom;
        setDropUp(spaceBelow < 300);
      }
      // Set focused index to selected option when opening
      const selectedIdx = options.findIndex(o => String(o.value) === String(value));
      setFocusedIndex(options.length > 0 ? (selectedIdx >= 0 ? selectedIdx : 0) : -1);
      // Start entrance animation after brief delay
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    }
    setOpen(prev => !prev);
  }, [options, value, open]);

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
        setIsAnimating(false);
        setFocusedIndex(-1);
        setTimeout(() => {
          setIsRendered(false);
        }, 200);
        setOpen(false);
      } else {
        toggleOpen();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (open) {
        setIsAnimating(false);
        setFocusedIndex(-1);
        setTimeout(() => {
          setIsRendered(false);
        }, 200);
      }
      setOpen(false);
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
        className={`w-full flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] border transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${error ? 'border-red-500' : 'border-white/10'} hover:border-white/20 ${open ? 'border-[var(--color-primary)]' : ''}`}
        style={{
          background: 'var(--color-surface)',
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

      {isRendered && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          className={`absolute z-50 w-full rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] max-h-[70vh] overflow-y-auto transition-all origin-top ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          } ${isAnimating ? 'animate-fade-in-scale' : 'opacity-0 scale-95'}`}
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
              onClick={() => { onChange(option.value); setIsAnimating(false); setTimeout(() => { setIsRendered(false); }, 200); setOpen(false); setFocusedIndex(-1); }}
              onMouseEnter={() => setFocusedIndex(index)}
              className={`w-full px-4 py-2.5 text-left transition-all duration-200 focus:outline-none stagger-item ${
                String(option.value) === String(value) ? 'text-white' : 'text-gray-300'
              } hover:-translate-y-0.5 hover:shadow-lg`}
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

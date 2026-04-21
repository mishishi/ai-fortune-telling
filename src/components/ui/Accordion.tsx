'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const headerRef = useRef<HTMLButtonElement>(null);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  // Get all accordion headers in the document for arrow navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      const current = headerRef.current;
      if (!current) return;

      const accordions = document.querySelectorAll('[data-accordion-header]');
      const headers = Array.from(accordions) as HTMLButtonElement[];
      const currentIndex = headers.indexOf(current);

      if (currentIndex === -1) return;

      e.preventDefault();
      let nextIndex: number;

      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex + 1 >= headers.length ? 0 : currentIndex + 1;
      } else {
        nextIndex = currentIndex - 1 < 0 ? headers.length - 1 : currentIndex - 1;
      }

      headers[nextIndex]?.focus();
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Header / Toggle */}
      <button
        ref={headerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${title.replace(/\s+/g, '-')}`}
        data-accordion-header
        tabIndex={0}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-3 flex items-center justify-between gap-4 hover:bg-[var(--color-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
        style={{
          background: 'transparent',
          transition: 'background 300ms var(--ease-smooth)',
        }}
      >
        <span
          className="font-bold text-left"
          style={{ color: 'var(--color-accent)' }}
        >
          {title}
        </span>

        {/* Chevron icon that rotates on expand */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 transition-transform duration-300 ease-out"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: 'var(--color-accent)',
          }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Content - using CSS grid for smooth height animation */}
      <div
        id={`accordion-content-${title.replace(/\s+/g, '-')}`}
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 300ms var(--ease-smooth)',
        }}
      >
        <div
          style={{
            minHeight: 0,
            overflow: 'hidden',
            transition: 'opacity 300ms var(--ease-smooth)',
            opacity: isOpen ? 1 : 0,
          }}
        >
          <div className="px-4 pb-4 pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback, MouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const overflowSetByThisModal = useRef(false);

  // Store the previously focused element before modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      setIsExiting(false);
    }
  }, [isOpen]);

  // Focus trap
  const trapFocus = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsExiting(true);
        setTimeout(() => {
          onClose();
        }, 200);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus modal when it opens and restore focus when it closes
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal itself or the first focusable element
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        modalRef.current.focus();
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      overflowSetByThisModal.current = true;
    } else {
      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      if (overflowSetByThisModal.current) {
        document.body.style.overflow = '';
        overflowSetByThisModal.current = false;
      }
    };
  }, [isOpen]);

  // Click outside to close
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExiting(true);
      setTimeout(() => {
        onClose();
      }, 200);
    }
  };

  // Trigger exit animation when isOpen becomes false
  useEffect(() => {
    if (!isOpen && !isExiting) {
      setIsExiting(true);
    }
  }, [isOpen, isExiting]);

  // Auto-unmount after exit animation completes
  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        setIsExiting(false);
      }, 200); // scale-out animation duration
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  if (!isOpen && !isExiting) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isExiting ? 'animate-fade-out' : 'animate-fade-in'}`}
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        onKeyDown={trapFocus}
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl ${isExiting ? 'animate-scale-out' : 'animate-fade-in-scale'}`}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: isFocused ? '0 0 0 2px var(--color-focus)' : undefined,
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Header */}
        {title && (
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <h2
              id="modal-title"
              className="text-lg font-bold"
              style={{ color: 'var(--color-accent)' }}
            >
              {title}
            </h2>
            <button
              onClick={() => {
                setIsExiting(true);
                setTimeout(() => {
                  onClose();
                }, 200);
              }}
              aria-label="Close modal"
              className="p-2 rounded-lg transition-all duration-150 ease-out hover:scale-110 hover:bg-white/10 focus:outline-none focus-visible:ring-2"
              style={{
                color: 'var(--color-text-secondary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-focus)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

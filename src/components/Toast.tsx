'use client';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <style jsx>{`
        .toast-success {
          animation: toast-appear 300ms ease-out;
        }
        .toast-error {
          animation: toast-shake 500ms ease-in-out;
        }
        .icon-success {
          animation: toast-success-pop 300ms ease-out;
          display: inline-block;
        }
      `}</style>
      <div
        className={`
          fixed top-24 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-3 px-5 py-3.5 rounded-xl
          border backdrop-blur-md
          transition-all duration-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          ${type === 'success' ? 'toast-success' : ''}
          ${type === 'error' ? 'toast-error' : ''}
        `}
        style={{
          minWidth: 240,
          maxWidth: 380,
          background: 'rgba(26, 31, 58, 0.95)',
          borderColor: type === 'success' ? 'rgba(80, 200, 120, 0.4)' : type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(123, 104, 238, 0.4)',
          boxShadow: type === 'success' ? '0 4px 20px rgba(80, 200, 120, 0.3)' : type === 'error' ? '0 4px 20px rgba(239, 68, 68, 0.3)' : '0 4px 20px rgba(123, 104, 238, 0.3)',
          color: 'white',
        }}
        role="alert"
        aria-atomic="true"
      >
        <span
          className={`text-base font-medium ${type === 'success' ? 'icon-success' : ''}`}
          style={{
            color: type === 'success' ? 'rgba(80, 200, 120, 1)' : type === 'error' ? 'rgba(239, 68, 68, 1)' : 'rgba(123, 104, 238, 1)',
          }}
        >
          {icons[type]}
        </span>
        <span className="text-base font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-sm">✕</span>
        </button>
      </div>
    </>
  );
}

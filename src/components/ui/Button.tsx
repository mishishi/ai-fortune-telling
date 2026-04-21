import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[var(--radius-lg)] hover-lift duration-150 active:scale-[0.98]';

    const variants = {
      primary: `
        bg-[var(--color-primary)] text-white
        hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-glow-primary)]
        active:bg-[var(--color-primary-hover)]
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      secondary: `
        bg-white/10 text-white
        hover:bg-white/15 hover:shadow-[var(--shadow-lg)]
        active:bg-white/20
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      ghost: `
        bg-transparent text-[var(--color-text-secondary)]
        hover:bg-white/5 hover:text-white
        active:bg-white/10
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
      danger: `
        bg-[var(--color-error)]/20 text-[var(--color-error)]
        hover:bg-[var(--color-error)]/30 hover:shadow-[var(--shadow-lg)]
        active:bg-[var(--color-error)]/40
        disabled:opacity-50 disabled:cursor-not-allowed
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles} ${variants[variant]} ${sizes[size]} ${className}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };

# UX Design System Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement comprehensive UX improvements including enhanced design tokens, reusable component library (Button/Card/Badge/Input), improved motion design, and skeleton loading states.

**Architecture:** Create a `src/components/ui/` folder for reusable primitive components. Enhance `globals.css` with expanded design tokens. Replace hardcoded styles with CSS variables and new component library across all pages.

**Tech Stack:** React, Tailwind CSS, CSS Custom Properties

---

## File Structure

```
src/
  components/
    ui/
      Button.tsx      (NEW - primary button component)
      Card.tsx       (NEW - card container component)
      Badge.tsx      (NEW - badge/tag component)
      Input.tsx      (NEW - form input component)
    Skeleton.tsx     (MODIFY - enhance skeleton styles)
  app/
    globals.css      (MODIFY - enhance design tokens)
    layout.tsx       (MODIFY - add font family)
    page.tsx         (MODIFY - use new components)
    login/page.tsx   (MODIFY - use new components)
    history/page.tsx (MODIFY - use new components and skeleton)
    profile/page.tsx (MODIFY - use new components)
    report/[id]/page.tsx (MODIFY - use new components)
  contexts/
    ToastContext.tsx (MODIFY - use new components)
```

---

## Task 1: Enhance Design Tokens (globals.css)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Update color system with additional text hierarchy**

```css
/* Add after existing text colors */
--color-text-secondary: #d1d5db;
--color-text-hint: #9ca3af;
```

- [ ] **Step 2: Add enhanced transition and easing tokens**

```css
/* Add after existing transitions */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: 400ms var(--ease-bounce);
--transition-smooth: 300ms var(--ease-smooth);
```

- [ ] **Step 3: Add surface hover state tokens**

```css
/* Add after --color-surface-elevated */
--color-surface-hover: #1e2545;
--color-overlay: rgba(10, 14, 39, 0.8);
```

- [ ] **Step 4: Update focus-visible styles**

```css
/* Replace existing :focus-visible */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(123, 104, 238, 0.4);
}
```

- [ ] **Step 5: Add skeleton animation improvements**

```css
/* Add after existing keyframes */
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-shimmer {
  background: linear-gradient(90deg, 
    rgba(123,104,238,0.08) 0%, 
    rgba(123,104,238,0.16) 50%, 
    rgba(123,104,238,0.08) 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}
```

- [ ] **Step 6: Add font family for Chinese**

```css
/* Update body */
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 7: Add utility classes for hover lift effect**

```css
/* Add hover-lift utility */
.hover-lift {
  transition: transform 200ms var(--ease-smooth), box-shadow 200ms var(--ease-smooth);
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

---

## Task 2: Create Button Component

**Files:**
- Create: `src/components/ui/Button.tsx`

- [ ] **Step 1: Create Button component with variants**

```tsx
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-[#7b68ee] to-[#4169e1] text-white shadow-[var(--shadow-glow-primary)] hover:scale-[1.02] active:scale-[0.98]',
  secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
  ghost: 'text-gray-300 hover:bg-white/10 hover:text-white',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2 font-medium
          transition-all duration-[var(--transition-smooth)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

- [ ] **Step 2: Export Button component**

Add to `src/components/ui/index.ts` (create file):
```tsx
export { Button } from './Button';
export { Card } from './Card';
export { Badge } from './Badge';
export { Input } from './Input';
```

---

## Task 3: Create Card Component

**Files:**
- Create: `src/components/ui/Card.tsx`

- [ ] **Step 1: Create Card component**

```tsx
'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = false, hover = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-xl border border-white/10
          ${elevated ? 'bg-[var(--color-surface-elevated)]' : 'bg-[var(--color-surface)]'}
          ${hover ? 'hover-lift cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
```

---

## Task 4: Create Badge Component

**Files:**
- Create: `src/components/ui/Badge.tsx`

- [ ] **Step 1: Create Badge component**

```tsx
'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-white/10 text-gray-300',
  primary: 'bg-[#7b68ee]/20 text-[#7b68ee]',
  accent: 'bg-[#f0c674]/20 text-[#f0c674]',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/20 text-red-400',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'sm', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center rounded-full font-medium
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
```

---

## Task 5: Create Input Component

**Files:**
- Create: `src/components/ui/Input.tsx`

- [ ] **Step 1: Create Input component**

```tsx
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`
            w-full rounded-lg px-4 py-3 text-white placeholder-gray-500
            transition-colors duration-[var(--transition-fast)]
            focus:outline-none
            border
            ${error 
              ? 'border-[var(--color-error)] focus:border-[var(--color-error)]' 
              : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'
            }
            bg-[var(--color-surface)]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

---

## Task 6: Create UI Components Index

**Files:**
- Create: `src/components/ui/index.ts`

- [ ] **Step 1: Create barrel export file**

```tsx
export { Button } from './Button';
export { Card } from './Card';
export { Badge } from './Badge';
export { Input } from './Input';
```

---

## Task 7: Refactor BirthForm to Use Design Tokens

**Files:**
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: Update inline borderColor styles to CSS variables**

Replace any `border-white/X` with `var(--color-border)`:
- Line ~102: `borderColor: error ? 'var(--color-error)' : 'var(--color-border)'`
- Line ~105: `borderColor: error ? 'var(--color-error)' : 'var(--color-border)'`
- Line ~108: `borderColor: error ? 'var(--color-error)' : 'var(--color-border)'`

Replace any `focus:border-[#7b68ee]` with `focus:border-[var(--color-primary)]`

- [ ] **Step 2: Update text colors to CSS variables**

Replace `text-gray-400` with `var(--color-text-muted)`

---

## Task 8: Update Home Page Loading States

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Update loading text colors**

Replace `text-gray-300` with `var(--color-text)`
Replace `text-gray-500` with `var(--color-text-subtle)`

- [ ] **Step 2: Update cancel button to use new tokens**

Replace `text-gray-400 bg-white/5` with `var(--color-surface)` background

---

## Task 9: Update Report Page

**Files:**
- Modify: `src/app/report/[id]/page.tsx`

- [ ] **Step 1: Update text colors**

Replace `text-gray-400` with `var(--color-text-muted)`

---

## Task 10: Enhance Skeleton Component

**Files:**
- Modify: `src/components/Skeleton.tsx`

- [ ] **Step 1: Enhance Skeleton with shimmer effect**

```tsx
export function Skeleton({ className, variant = 'default' }: { className?: string; variant?: 'default' | 'text' | 'circular' | 'rectangular' }) {
  const baseStyles = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded h-4' : 'rounded-lg';
  
  return (
    <div
      className={`skeleton-shimmer ${baseStyles} ${className || ''}`}
    />
  );
}
```

---

## Task 11: Update Layout Font Family

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Remove inline background, rely on globals.css**

Remove `style={{ background: '#0a0e27' }}` since it's now in `body` style

---

## Task 12: Final Review and Cleanup

- [ ] **Step 1: Run grep for remaining hardcoded colors**

Search for `#0a0e27`, `#1a1f3a` and evaluate if they should use CSS variables

- [ ] **Step 2: Search for remaining text-gray-X usage**

Grep for `text-gray-` and identify any that should use CSS variables

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Enhance Design Tokens | globals.css |
| 2 | Create Button Component | ui/Button.tsx |
| 3 | Create Card Component | ui/Card.tsx |
| 4 | Create Badge Component | ui/Badge.tsx |
| 5 | Create Input Component | ui/Input.tsx |
| 6 | Create UI Index | ui/index.ts |
| 7 | Refactor BirthForm | BirthForm.tsx |
| 8 | Update Home Page | page.tsx |
| 9 | Update Report Page | report/[id]/page.tsx |
| 10 | Enhance Skeleton | Skeleton.tsx |
| 11 | Update Layout | layout.tsx |
| 12 | Final Review | All files |

---

**Execution Options:**

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

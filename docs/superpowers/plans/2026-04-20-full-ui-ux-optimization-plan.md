# Full UI/UX Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Comprehensive UI/UX optimization maintaining cosmic starfield theme

**Architecture:** Component library extension + design tokens + accessibility improvements

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS

---

## Phase 1: P0 Core Interactions

### Task 1: Toggle Component

**Files:**
- Create: `src/components/ui/Toggle.tsx`
- Modify: `src/app/profile/page.tsx`

- [ ] **Step 1: Create Toggle component**

```tsx
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}
```

Visual specs:
- Track: 2:1 width-to-height ratio, full rounded corners
- Thumb: Circle, 4px smaller than track height
- ON: gradient #7b68ee → #4169e1
- OFF: rgba(255,255,255,0.2)
- Transition: transform 200ms ease-out
- Focus: 2px outline with #f0c674

ARIA requirements:
- `role="switch"`
- `aria-checked={checked}`
- `tabIndex={0}`
- Keyboard: Space/Enter to toggle

- [ ] **Step 2: Export from ui/index.ts**

```tsx
export { Toggle } from './Toggle';
```

- [ ] **Step 3: Replace inline Toggle in Profile page**

Find the inline toggle implementation in profile/page.tsx and replace with the new Toggle component.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Toggle.tsx src/components/ui/index.ts src/app/profile/page.tsx
git commit -m "feat(ui): add Toggle component with full ARIA support"
```

---

### Task 2: Real-time Form Validation

**Files:**
- Create: `src/hooks/useFormValidation.ts`
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: Create useFormValidation hook**

```tsx
interface ValidationRule {
  field: string;
  rules: Array<{
    test: (value: any) => boolean;
    message: string;
  }>;
}

export function useFormValidation(rules: ValidationRule[]) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (field: string, value: any) => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return true;
    
    for (const r of rule.rules) {
      if (!r.test(value)) {
        setErrors(prev => ({ ...prev, [field]: r.message }));
        return false;
      }
    }
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    return true;
  };
  
  const clearError = (field: string) => {
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };
  
  return { errors, validate, clearError };
}
```

- [ ] **Step 2: Integrate with BirthForm**

Add onBlur validation to each field, onChange to clear errors.

- [ ] **Step 3: Add error styling**

Error: red border + error message below field
Success (optional): green border

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useFormValidation.ts src/components/BirthForm.tsx
git commit -m "feat(form): add real-time validation with useFormValidation hook"
```

---

## Phase 2: P1 Visual & Layout

### Task 3: Report Page Zoning (Accordion)

**Files:**
- Create: `src/components/ui/Accordion.tsx`
- Modify: `src/app/report/[id]/page.tsx`

- [ ] **Step 1: Create Accordion component**

```tsx
interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}
```

Keyboard support:
- Tab to focus header
- Enter/Space to toggle
- Arrow keys to navigate between accordion panels

- [ ] **Step 2: Zone Report page**

Divide into 4 sections:
1. Basic Info (name, birth time, gender)
2. Main Analysis (radar chart + core insights)
3. Detailed Info (collapsible) - timeline + detailed analysis
4. Actions (unlock button, share, download)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Accordion.tsx src/components/ui/index.ts src/app/report/[id]/page.tsx
git commit -m "feat(report): add Accordion for content zoning"
```

---

### Task 4: Mobile Adaptation Audit

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add responsive utilities**

```css
/* Touch target minimum */
.touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Button padding minimum */
.btn-touch {
  padding: 12px 16px;
}
```

- [ ] **Step 2: Audit touch targets**

Check all buttons, dropdowns, and interactive elements:
- Minimum touch area: 44x44px
- Adequate spacing between targets

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(mobile): add touch target utilities and audit"
```

---

## Phase 3: P2 Accessibility

### Task 5: Keyboard Navigation Enhancement

**Files:**
- Modify: `src/components/ui/CustomDropdown.tsx`
- Modify: `src/components/ui/Accordion.tsx`
- Modify: `src/components/ui/Tabs.tsx` (from Task 7)

- [ ] **Step 1: Add keyboard support to CustomDropdown**

- Arrow Up/Down: navigate options
- Enter/Space: select option
- Escape: close dropdown
- Home/End: first/last option

- [ ] **Step 2: Add keyboard support to Accordion**

- Enter/Space: toggle
- Arrow Up/Down: move between accordion headers

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/CustomDropdown.tsx src/components/ui/Accordion.tsx
git commit -m "feat(a11y): add keyboard navigation to Dropdown and Accordion"
```

---

### Task 6: ARIA Enhancement

**Files:**
- Modify: `src/components/RadarChart.tsx`
- Modify: `src/components/Timeline.tsx`

- [ ] **Step 1: Add ARIA to RadarChart**

```tsx
<div
  role="img"
  aria-label="命盘分析雷达图：性格85分、事业78分、感情62分、健康90分、财运75分"
>
  {/* radar chart content */}
</div>
```

- [ ] **Step 2: Add ARIA to Timeline**

```tsx
<div role="list" aria-label="时间轴">
  {items.map(item => (
    <div role="listitem" key={item.id}>
      {/* timeline item */}
    </div>
  ))}
</div>
```

- [ ] **Step 3: Add loading status ARIA**

```tsx
<div role="status" aria-live="polite">
  {loading ? '加载中...' : '加载完成'}
</div>
```

- [ ] **Step 4: Add error alert ARIA**

```tsx
<div role="alert" aria-atomic="true">
  {errorMessage}
</div>
```

- [ ] **Step 5: Commit**

```bash
git add src/components/RadarChart.tsx src/components/Timeline.tsx
git commit -m "feat(a11y): add ARIA labels and live regions"
```

---

## Phase 4: P3 Architecture

### Task 7: Component Library (Tabs, Modal, Tooltip)

**Files:**
- Create: `src/components/ui/Tabs.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Tooltip.tsx`
- Modify: `src/components/ui/index.ts`

- [ ] **Step 1: Create Tabs component**

```tsx
interface TabsProps {
  tabs: { id: string; label: string; content: React.ReactNode }[];
  defaultTab?: string;
}
```

Keyboard: Arrow Left/Right to switch tabs

- [ ] **Step 2: Create Modal component**

```tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}
```

Features:
- Focus trap
- Escape to close
- Click outside to close
- ARIA: role="dialog", aria-modal="true"

- [ ] **Step 3: Create Tooltip component**

```tsx
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}
```

- [ ] **Step 4: Export all from ui/index.ts**

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Tabs.tsx src/components/ui/Modal.tsx src/components/ui/Tooltip.tsx src/components/ui/index.ts
git commit -m "feat(ui): add Tabs, Modal, and Tooltip components"
```

---

### Task 8: BirthForm Split

**Files:**
- Create: `src/components/BirthForm/BirthDatePicker.tsx`
- Create: `src/components/BirthForm/BirthTimePicker.tsx`
- Create: `src/components/BirthForm/GenderSelect.tsx`
- Modify: `src/components/BirthForm.tsx`

- [ ] **Step 1: Create BirthDatePicker**

Extract date selection (year/month/day) into separate component.

- [ ] **Step 2: Create BirthTimePicker**

Extract time selection (hour/minute) into separate component.

- [ ] **Step 3: Create GenderSelect**

Extract gender selection using CustomDropdown.

- [ ] **Step 4: Refactor BirthForm to use sub-components**

Original BirthForm.tsx (320 lines) should become ~100 lines.

- [ ] **Step 5: Commit**

```bash
git add src/components/BirthForm/
git commit -m "refactor: split BirthForm into focused sub-components"
```

---

## Motion System

### Task 9: CSS Animations

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add Staggered Reveal animation**

```css
.stagger-item {
  opacity: 0;
  transform: translateY(12px);
  animation: staggerFadeIn 400ms ease-out forwards;
}

@keyframes staggerFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 100ms; }
.stagger-item:nth-child(3) { animation-delay: 200ms; }
.stagger-item:nth-child(4) { animation-delay: 300ms; }
.stagger-item:nth-child(5) { animation-delay: 400ms; }
```

- [ ] **Step 2: Add Hover Lift utility**

```css
.hover-lift {
  transition: transform 200ms var(--ease-smooth), box-shadow 200ms var(--ease-smooth);
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
}
```

- [ ] **Step 3: Add Glow Pulse animation**

```css
.glow-pulse {
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(123, 104, 238, 0.4);
  }
  50% {
    box-shadow: 0 0 24px rgba(123, 104, 238, 0.8);
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(motion): add staggered reveal, hover lift, and glow pulse animations"
```

---

## Design Tokens

### Task 10: CSS Variable Extensions

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add interaction state colors**

Already exists: --color-focus: #f0c674

- [ ] **Step 2: Review existing tokens**

Existing tokens in globals.css already cover most needs:
- --color-error: #ef4444
- --color-success: #50c878
- Shadows already defined
- Transitions already defined

No changes needed if existing tokens meet requirements.

- [ ] **Step 3: Commit (if changes needed)**

---

## Summary

| Task | Component | Priority |
|------|-----------|----------|
| 1 | Toggle | P0 |
| 2 | Form Validation | P0 |
| 3 | Accordion + Report Zoning | P1 |
| 4 | Mobile Audit | P1 |
| 5 | Keyboard Nav | P2 |
| 6 | ARIA | P2 |
| 7 | Tabs/Modal/Tooltip | P3 |
| 8 | BirthForm Split | P3 |
| 9 | Motion System | All |
| 10 | CSS Tokens | All |

**Total: 10 tasks**

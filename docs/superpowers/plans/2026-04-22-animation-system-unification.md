# Animation System Unification Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate all inline `@keyframes` definitions into `globals.css` and establish a unified animation token system.

**Architecture:** Centralize keyframes in `globals.css`, replace inline animation definitions with CSS class references, and ensure all components use standardized motion tokens.

**Tech Stack:** CSS custom properties, styled-jsx, Next.js App Router

---

## File Inventory

| File | Inline Keyframes | Classes |
|------|-----------------|---------|
| `src/app/globals.css` | None (will add) | None |
| `src/components/ui/Toast.tsx` | `shake`, `successPop`, `appear` | `.toast-shake`, `.toast-success-pop`, `.toast-appear` |
| `src/components/BaziRing.tsx` | `ringExpand`, `fadeIn` | `.animate-ring-in`, `.animate-label-in` |
| `src/app/page.tsx` | `glowPulse`, `destinySpin`, `destinyPulse`, `shimmer` | `.glow-pulse`, `.destiny-spin`, `.destiny-pulse`, `.shimmer` |
| `src/components/AuroraEffect.tsx` | `pulse` | `.aurora-pulse` |
| `src/components/UnlockPanel.tsx` | `spin` | `.spinner` |

---

## Task 1: Add Keyframes and Tokens to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add animation duration and easing variables**

Add below the existing motion system at line ~86:

```css
/* Animation duration scale */
--duration-micro: 100ms;
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-smooth: 400ms;

/* Animation easing tokens */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-spring: cubic-bezier(0.5, 1.5, 0.5, 1);
```

- [ ] **Step 2: Add unified keyframes to globals.css**

```css
/* ===== Keyframes ===== */

/* Toast animations */
@keyframes toast-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

@keyframes toast-success-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes toast-appear {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* BaziRing animations */
@keyframes ring-expand {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Home page destiny orb animations */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.6; filter: blur(40px); }
  50% { opacity: 1; filter: blur(50px); }
}

@keyframes destiny-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes destiny-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* Aurora effect pulse */
@keyframes aurora-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.02); }
}

/* Spinner for unlock button */
@keyframes spinner-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

- [ ] **Step 3: Add animation utility classes to globals.css**

```css
/* ===== Animation utility classes ===== */

/* Toast animation classes */
.toast-shake { animation: toast-shake 0.5s ease-in-out; }
.toast-success-pop { animation: toast-success-pop 0.3s var(--ease-spring); }
.toast-appear { animation: toast-appear 0.4s var(--ease-out-expo) forwards; }

/* BaziRing animation classes */
.animate-ring-in { animation: ring-expand 0.6s var(--ease-out-expo) forwards; }
.animate-label-in { animation: fade-in 0.5s ease-out forwards; }

/* Home page destiny orb classes */
.glow-pulse { animation: glow-pulse 4s ease-in-out infinite; }
.destiny-spin { animation: destiny-spin 20s linear infinite; }
.destiny-pulse { animation: destiny-pulse 4s ease-in-out infinite; }
.shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s linear infinite;
}

/* Aurora pulse */
.aurora-pulse { animation: aurora-pulse 4s ease-in-out infinite; }

/* Spinner */
.spinner { animation: spinner-spin 0.8s linear infinite; }

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .toast-shake, .toast-success-pop, .toast-appear,
  .animate-ring-in, .animate-label-in,
  .glow-pulse, .destiny-spin, .destiny-pulse, .shimmer,
  .aurora-pulse, .spinner {
    animation: none;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add centralized animation keyframes and tokens"
```

---

## Task 2: Update Toast.tsx

**Files:**
- Modify: `src/components/ui/Toast.tsx:275-296`

- [ ] **Step 1: Remove inline @keyframes block**

Delete the entire `<style jsx>` block containing `shake`, `successPop`, `appear` keyframes.

- [ ] **Step 2: Verify component uses CSS classes**

Check that the component already applies animations via className. Looking at Toast.tsx:
- Line ~240: `<div className={cn('toast-item', ...` — already uses class
- Line ~257: `className="toast-success"` — uses this class for success state
- Line ~275: The `<style jsx>` block defines the keyframes

The component uses `toast-success` class but we need to check if the animation is applied via that class or inline.

Actually, the animations are applied via the inline styles in the component JSX, not via the CSS classes. The styled-jsx block defines the keyframes but they are referenced via inline `animation` properties.

**Step 3: Read the component to find where animations are applied**

```tsx
// Looking at lines 200-295, the animations are applied via inline styles like:
// style={{ animation: `shake 0.5s ease-in-out` }}
```

We need to change these inline animations to use the CSS classes instead. But since the component uses `toast-success` class for styling, we should add the animation to that class in globals.css instead of removing the styled-jsx entirely.

Actually, looking more carefully at Toast.tsx:
- Lines 257-265: The `<style jsx>` block defines `@keyframes shake`, `@keyframes successPop`, `@keyframes appear`
- These keyframes are referenced in inline styles throughout the component

The cleanest approach is:
1. Keep the styled-jsx for component-specific styles (like `toast-success` container)
2. Move the keyframes definitions to globals.css
3. Add animation properties to the styled-jsx classes or use CSS classes

Let me reconsider: The component uses `cn()` to concatenate classes. We should:
1. Add the animation classes to globals.css
2. Update the component to use those classes instead of inline animations

**Step 4: Update Toast.tsx to use CSS classes**

Replace the inline `animation` style references with the CSS class names. For example:
- `style={{ animation: 'shake 0.5s ease-in-out' }}` → `className="toast-shake"` added to the element

But wait, the component uses `cn()` for conditional classes. We should add the animation class alongside existing classes.

Actually, looking at the component structure, it's complex with multiple animation states. Let me just:
1. Remove the @keyframes from styled-jsx
2. Add the keyframes to globals.css
3. The styled-jsx already has classes like `toast-success` - we can keep those and just reference the global keyframes by name in inline styles

No wait - if we put keyframes in globals.css, they can be referenced from anywhere including inline styles. So we don't need to change how animations are applied, just where the @keyframes are defined.

**Step 5: Verify keyframes are removed from styled-jsx**

The styled-jsx block in Toast.tsx should only keep the non-keyframe styles:
```tsx
<style jsx>{`
  .toast-success {
    background: var(--color-success);
  }
  /* other non-animation styles */
`}</style>
```

And the keyframes `shake`, `successPop`, `appear` should be removed since they're now in globals.css.

Actually the issue is that `styled-jsx` scopes the keyframes to the component. Moving them to globals.css makes them global, which is fine since keyframe names don't conflict.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Toast.tsx
git commit -m "refactor(Toast): use centralized animation keyframes"
```

---

## Task 3: Update BaziRing.tsx

**Files:**
- Modify: `src/components/BaziRing.tsx`

- [ ] **Step 1: Remove inline @keyframes from styled-jsx**

The styled-jsx block contains `ringExpand` and `fadeIn` keyframes. Remove these.

- [ ] **Step 2: Verify CSS classes are already in use**

The component already uses `animate-ring-in` and `animate-label-in` classes:
- Line ~40: `className={cn(..., "animate-ring-in")}`
- The classes are defined in the styled-jsx block

Since these classes use `animation: ringExpand ...` and `animation: fadeIn ...`, once we move the keyframes to globals.css, these classes will work globally.

- [ ] **Step 3: Remove the @keyframes definitions only, keep the classes**

The styled-jsx should only contain:
```tsx
<style jsx>{`
  .animate-ring-in {
    transform-origin: center;
  }
  /* keep other scoped styles if any */
`}</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/BaziRing.tsx
git commit -m "refactor(BaziRing): use centralized animation keyframes"
```

---

## Task 4: Update page.tsx (home)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Remove inline @keyframes from styled-jsx**

The styled-jsx block contains `glowPulse`, `destinySpin`, `destinyPulse`, `shimmer` keyframes. Remove these.

- [ ] **Step 2: Verify CSS classes are already in use**

The component already uses these class names in JSX:
- `className="glow-pulse"` on a div
- `className="destiny-spin"` on a div
- etc.

Since the classes reference the keyframes by name, they will work once keyframes are in globals.css.

- [ ] **Step 3: Remove the @keyframes definitions only, keep the classes**

The styled-jsx block should only keep non-animation styles.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor(page): use centralized animation keyframes"
```

---

## Task 5: Update AuroraEffect.tsx

**Files:**
- Modify: `src/components/AuroraEffect.tsx`

- [ ] **Step 1: Remove inline @keyframes from styled-jsx**

The styled-jsx block contains `pulse` keyframe. Remove this.

- [ ] **Step 2: Verify CSS class usage**

The component uses `auroraPulse` class that references the `pulse` keyframe.

- [ ] **Step 3: Remove the @keyframes definitions only**

Keep the styled-jsx block but remove only the @keyframes definition.

- [ ] **Step 4: Commit**

```bash
git add src/components/AuroraEffect.tsx
git commit -m "refactor(AuroraEffect): use centralized animation keyframes"
```

---

## Task 6: Update UnlockPanel.tsx

**Files:**
- Modify: `src/components/UnlockPanel.tsx`

- [ ] **Step 1: Remove inline @keyframes from styled-jsx**

The styled-jsx block contains `spin` keyframe. Remove this.

- [ ] **Step 2: Verify CSS class usage**

The component uses `.spinner` class with `animation: spin 0.8s linear infinite;`. Once we move the keyframe to globals.css, this class will work globally.

- [ ] **Step 3: Remove the @keyframes definitions only**

Keep the styled-jsx block but remove only the @keyframes definition.

- [ ] **Step 4: Commit**

```bash
git add src/components/UnlockPanel.tsx
git commit -m "refactor(UnlockPanel): use centralized animation keyframes"
```

---

## Task 7: Final Verification

- [ ] **Step 1: Start dev server and verify all animations work**

```bash
npm run dev
```

- [ ] **Step 2: Check no inline keyframes remain**

```bash
grep -r "@keyframes" src/components --include="*.tsx" | grep -v "node_modules"
```

Expected: No results (all @keyframes should be in globals.css only)

- [ ] **Step 3: Verify globals.css contains all keyframes**

```bash
grep -c "@keyframes" src/app/globals.css
```

Expected: Count should be 10 (shake, successPop, appear, ringExpand, fadeIn, glowPulse, destinySpin, destinyPulse, shimmer, auroraPulse, spinnerSpin) = 11 actually

- [ ] **Step 4: Commit all changes**

```bash
git add -A
git commit -m "feat: complete animation system unification"
```

---

## Summary

After this plan:
- All `@keyframes` definitions live in `globals.css`
- Animation utility classes are available globally (`.spinner`, `.aurora-pulse`, etc.)
- CSS variables for duration/easing are centralized (`--duration-fast`, `--ease-out-expo`, etc.)
- No duplicate keyframe definitions across components
- `prefers-reduced-motion` is respected globally
- The `--ease-out-expo` variable is now used by animation classes

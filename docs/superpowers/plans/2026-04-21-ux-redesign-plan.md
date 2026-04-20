# UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 6 UX improvements per 2026-04-20-ux-redesign.md spec

**Tech Stack:** Next.js (App Router), Tailwind CSS, CSS keyframe animations

---

## Task 1: Fix Text Contrast (WCAG AA Compliance)
**Files:** Modify: src/app/globals.css

- [ ] Update text color variables to WCAG AA compliant values

```css
--color-text: #ffffff;           /* 21:1 */
--color-text-secondary: #d1d5db; /* 12:1 */
--color-text-muted: #9ca3af;     /* 4.6:1 */
```

- [ ] Commit: git add src/app/globals.css && git commit -m "fix: update text colors for WCAG AA compliance"

---

## Task 2: Update Five Elements Colors (Traditional Chinese)
**Files:** Modify: src/app/globals.css

- [ ] Update element color CSS variables to 五正色

```css
--color-element-wood: #4ade80;   /* 木青 */
--color-element-fire: #ef4444;   /* 火赤 */
--color-element-earth: #eab308;  /* 土黄 */
--color-element-metal: #e5e5e5;   /* 金白 */
--color-element-water: #1e293b;   /* 水黑 */
```

- [ ] Commit: git add src/app/globals.css && git commit -m "feat: use traditional Chinese five elements colors"

---

## Task 3: Enhance Loading Ritual
**Files:** Modify: src/app/globals.css, src/app/page.tsx

- [ ] Add destiny ring keyframes to globals.css (destinySpin, destinyPulse, elementGlow, shimmer)

- [ ] Update loading JSX in page.tsx with:
  - Animated concentric rings with ☯ center
  - Five element color progression for step indicators
  - Atmospheric Chinese text
  - Shimmer progress bar

- [ ] Commit: git add src/app/globals.css src/app/page.tsx && git commit -m "feat: enhance loading ritual with destiny ring animation"

---

## Task 4: Restructure Report Page Layout
**Files:** Modify: src/app/report/[id]/page.tsx

- [ ] Wrap RadarChart in collapsible details/summary
- [ ] Make Timeline collapsible with click to expand
- [ ] Increase BaziRing size to 320px on desktop

- [ ] Commit: git add src/app/report/[id]/page.tsx && git commit -m "feat: restructure report page with progressive disclosure"

---

## Task 5: Mobile BaziRing Optimization
**Files:** Modify: src/components/BaziRing.tsx

- [ ] Add responsive sizing: 180px (mobile <480px), 220px (tablet <768px), size prop (desktop)

- [ ] Hide stem text inside ring on mobile (effectiveSize <= 220)

- [ ] Update label layout to 2x2 grid on mobile

- [ ] Commit: git add src/components/BaziRing.tsx && git commit -m "feat: add mobile responsive optimization to BaziRing"

---

## Task 6: Enhance Toast with Variants
**Files:** Modify: src/components/Toast.tsx

- [ ] Add type-specific styling with border colors and glow effects:
  - success: green border/glow
  - error: red border/glow with shake animation
  - info: purple border/glow

- [ ] ToastContext.tsx already passes type - no changes needed

- [ ] Commit: git add src/components/Toast.tsx && git commit -m "feat: enhance toast with type variants and animations"

---

## Implementation Order
1. Text contrast fix (foundation)
2. Five elements colors (CSS update)
3. Loading ritual (component enhancement)
4. Report page hierarchy (layout restructure)
5. Mobile BaziRing (responsive)
6. Enhanced toast (polish)


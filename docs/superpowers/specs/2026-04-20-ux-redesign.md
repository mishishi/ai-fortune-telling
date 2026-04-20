# UX Redesign Specification

> **Goal:** Elevate the AI fortune-telling app's user experience to match its mystical Eastern philosophy theme

---

## 1. Loading Ritual Enhancement (优先级 2)

### Problem
Current loading state is utilitarian — just spinning icons with generic "加载中" text. Lacks the "destiny revelation" ceremonial feeling appropriate for a BaZi fortune-telling app.

### Solution

**A. Animated Destiny Ring**
- Rotating concentric circles with the center "☯" pulsing
- Outer ring rotates clockwise (3s), inner ring counter-clockwise (2s)
- Center symbol scales 0.95→1 with 1.5s ease-in-out infinite

**B. Five Elements Color Progression**
- Step indicators (☯八字排盘 → 🔮AI分析 → 📜生成报告) use element colors:
  - 木 (wood) green `#4ade80` for step 1
  - 火 (fire) red `#ef4444` for step 2
  - 土 (earth) yellow `#eab308` for step 3
- Active step glows with box-shadow

**C. Atmospheric Text**
Replace generic loading text with contextual messaging:
- Step 1: "☯ 八字命盘解析中..." → "天干地支，五行流转"
- Step 2: "🔮 AI 命理师分析中..." → "命盘已现，解读命运"
- Step 3: "📜 生成命盘报告..." → "命数已定，报告将成"

**D. Glow Effect**
- Subtle radial glow behind the ring, pulsing 2s ease-in-out infinite
- Color matches current step's element color

**E. Progress Bar**
- Width 200px, height 3px, rounded
- Background: `rgba(255,255,255,0.1)`
- Fill: `linear-gradient(90deg, #7b68ee, #f0c674)` with shimmer animation

### Implementation Files
- `src/app/page.tsx` — loading state JSX structure
- `src/app/globals.css` — add keyframes: `destinySpin`, `destinyPulse`, `elementGlow`

---

## 2. Five Elements Traditional Chinese Colors (优先级 3)

### Problem
Current element colors (`#4ade80` wood, `#f87171` fire, etc.) are WesternCSSnamed. BaZi is Chinese; colors should reflect the traditional 五正色 (Five Correct Colors).

### Solution

Replace CSS variables in `globals.css`:

```css
/* Five Elements — Traditional Chinese Colors (五正色) */
--color-element-wood: #4ade80;   /* 木青 — Tree Green */
--color-element-fire: #ef4444;   /* 火赤 — Flame Red */
--color-element-earth: #eab308;  /* 土黄 — Earth Yellow */
--color-element-metal: #e5e5e5;    /* 金白 — Metal White */
--color-element-water: #1e293b;   /* 水黑 — Water Black (dark slate) */
```

**Color mappings:**

| Element | Chinese | Hex | Usage |
|---------|---------|-----|-------|
| 木 Wood | 青 | `#4ade80` | Year pillar, growth |
| 火 Fire | 赤 | `#ef4444` | Day pillar warmth |
| 土 Earth | 黄 | `#eab308` | Stability, center |
| 金 Metal | 白 | `#e5e5e5` | Precision, clarity |
| 水 Water | 黑 | `#1e293b` | Depth, night |

**Additional refinements:**
- Ring segment fills: `elementColor + '15'` (10% opacity) — keep current
- Ring segment stroke: full element color — keep current
- Element badges in labels: full color with subtle glow `0 0 8px elementColor`

### Implementation Files
- `src/app/globals.css` — update `--color-element-*` variables
- `src/components/BaziRing.tsx` — verify ELEMENT_COLORS uses CSS variables

---

## 3. Report Page Information Hierarchy (优先级 1)

### Problem
Report page (`/report/[id]`) cram too many elements: BaziRing + RadarChart + FortuneDisplay + Timeline. No clear visual hierarchy or focal point.

### Solution

**A. Page Layout Restructure**

```
┌─────────────────────────────────────┐
│  Header: 姓名的命盘 + 生肖/五行 info  │
├─────────────────────────────────────┤
│  PRIMARY: BaziRing (larger, centered)│
│  ~320px on desktop                  │
├─────────────────────────────────────┤
│  SECONDARY: Radar Chart (collapsed) │
│  Click to expand                    │
├─────────────────────────────────────┤
│  TERTIARY: Fortune Analysis         │
│  Collapsible accordion sections     │
├─────────────────────────────────────┤
│  FOOTER: Timeline (expandable)      │
└─────────────────────────────────────┘
```

**B. Progressive Disclosure**
- Radar chart wrapped in collapsible `<Accordion>`
- Fortune analysis sections (career/love/wealth/health/fortune) each in collapsible cards
- Timeline hidden below fold, expandable

**C. BaziRing Size Increase**
- Desktop: increase from 280px to 320px
- More breathing room around the ring

### Implementation Files
- `src/app/report/[id]/page.tsx` — restructure layout
- `src/components/Accordion.tsx` — existing component, use for radar + fortune
- `src/components/BaziRing.tsx` — increase default size prop

---

## 4. Text Contrast Ratio Fix (优先级 4)

### Problem
`text-gray-400` (#9ca3af) on background #0a0e27 = ~4.5:1 (barely passes WCAG AA). `text-subtle` (#7c8290) = ~2.8:1 (fails WCAG AA).

### Solution

Update `globals.css` text color variables:

```css
/* Text Colors — WCAG AA Compliant */
--color-text: #ffffff;        /* 21:1 — headings, important */
--color-text-secondary: #d1d5db; /* 12:1 — body text */
--color-text-muted: #9ca3af;  /* 4.6:1 — labels, captions */
--color-text-subtle: #6b7280; /* REMOVE — fails WCAG */
```

**Actions:**
1. Remove or deprecate `--color-text-subtle`
2. Replace all `text-gray-500` or `text-subtle` usages with `text-muted` (#9ca3af)
3. For disabled states, use `opacity: 0.5` on normal text rather than a new low-contrast color

### Affected Components
- `src/components/ReportContent.tsx` — score labels
- `src/components/BaziRing.tsx` — pillar labels
- `src/components/FortuneDisplay.tsx` — analysis text
- Various `text-gray-400` usages across components

### Implementation Files
- `src/app/globals.css` — fix text variables
- Multiple component files — update classNames

---

## 5. Mobile BaziRing Optimization (优先级 5)

### Problem
240px ring on mobile is too dense. Text at 14px is cramped, element colors are hard to distinguish.

### Solution

**Responsive Ring Sizes:**

| Breakpoint | Ring Size | Stem Text | Day Branch | Labels Layout |
|------------|-----------|-----------|------------|---------------|
| ≥768px (desktop) | 280px | 14px | 17% of size | 4-column row |
| 480-767px (tablet) | 220px | 12px | 15% of size | 4-column row |
| <480px (mobile) | 180px | hidden | 14% of size | 2×2 grid |

**Mobile-specific:**
1. Hide stem text inside ring (too small to read)
2. Reduce segment thickness slightly
3. Labels below: 2×2 grid instead of 4 columns
4. Day branch remains visible at 14% of ring size

**Implementation:**
```tsx
// In BaziRing.tsx
const effectiveSize = isMobile 
  ? window.innerWidth < 480 ? 180 : 220 
  : size;
```

### Implementation Files
- `src/components/BaziRing.tsx` — add mobile responsive logic

---

## 6. Enhanced Feedback Mechanism (优先级 6)

### Problem
Toast notifications are plain. No visual distinction between success/error/info. Lacks tactile feedback.

### Solution

**A. Toast Type System**

```css
/* Toast Variants */
.toast-success {
  border: 1px solid rgba(80, 200, 120, 0.4);
  background: rgba(80, 200, 120, 0.1);
}

.toast-error {
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.1);
  animation: shake 500ms ease-in-out;
}

.toast-info {
  border: 1px solid rgba(123, 104, 238, 0.4);
  background: rgba(123, 104, 238, 0.1);
}
```

**B. Success Animation**
- On appear: scale 0.9→1 + opacity 0→1, 300ms ease-out
- Icon: checkmark with successPop animation

**C. Error Animation**
- shake animation (translateX ±4px, 5 iterations, 500ms)
- Red border glow

**D. Iconography**
- Success: ✓ (green)
- Error: ✕ (red)
- Info: ℹ (purple)
- Warning: ⚠ (yellow)

### Implementation Files
- `src/components/Toast.tsx` — add variant styles and animations
- `src/contexts/ToastContext.tsx` — add `type` parameter to `showToast`
- `src/app/globals.css` — add toast variant keyframes

---

## Implementation Order

1. **Text Contrast Fix** (优先级 4) — Foundation, affects everything
2. **Five Elements Colors** (优先级 3) — CSS variable update
3. **Loading Ritual** (优先级 2) — Component enhancement
4. **Report Page Hierarchy** (优先级 1) — Layout restructure
5. **Mobile BaziRing** (优先级 5) — Responsive refinement
6. **Enhanced Toast** (优先级 6) — Component polish

---

## Files to Modify

| Priority | File | Changes |
|----------|------|---------|
| 4 | `src/app/globals.css` | Fix text contrast, update element colors |
| 3 | `src/components/BaziRing.tsx` | Use CSS variables for colors |
| 2 | `src/app/page.tsx` | Enhanced loading UI |
| 1 | `src/app/report/[id]/page.tsx` | Layout restructure |
| 5 | `src/components/BaziRing.tsx` | Mobile responsive |
| 6 | `src/components/Toast.tsx` | Toast variants + animations |
| 6 | `src/contexts/ToastContext.tsx` | Add type parameter |
| All | Various | Replace `text-gray-400` with proper contrast |

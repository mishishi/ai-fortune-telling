# Information Hierarchy Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize FortuneDisplay content sections into a clear 4-tier priority structure with visual grouping, improving user comprehension and reducing cognitive load.

**Architecture:** Restructure the SECTIONS array with tier-based priority ordering, add visual group separators, enhance nested section styling, and add priority badges to high-value sections.

**Tech Stack:** React, CSS, Next.js

---

## File Inventory

| File | Changes |
|------|---------|
| `src/components/FortuneDisplay.tsx` | Complete restructure of SECTIONS array, add grouping component, enhance styling |

---

## Current Structure Analysis

**Problem:** 14 sections in flat alphabetical order with inconsistent nesting:
- `sub: true` = indented with `ml-3` but no visual group header
- `isNested: true` = same treatment as regular sections (no actual nesting)
- No priority distinction between sections
- Sections like `overall` and `overallPlain` should be grouped but aren't visually connected

**Proposed 4-Tier Structure:**

| Tier | Content | User Priority |
|------|---------|---------------|
| **Tier 1 - Core Overview** | 命局总评 + 通俗解读, 财运, 大运趋势 | 最高 (用户进来先看) |
| **Tier 2 - Life Dimensions** | 事业运+推荐, 感情运+建议, 健康运 | 高 (日常关注) |
| **Tier 3 - Predictions** | 流年预测, 幸运元素 | 中 (深度用户) |
| **Tier 4 - Tools** | 起名建议 | 低 (可选) |

---

## Task 1: Add Tier and Group Metadata to Sections

**Files:**
- Modify: `src/components/FortuneDisplay.tsx`

- [ ] **Step 1: Add tier and group metadata to SectionDef interface**

Replace the existing `SectionDef` interface (lines 38-45):

```typescript
interface SectionDef {
  key: string;
  title: string;
  color: string;
  sub?: boolean;
  isNested?: boolean;
  basic?: boolean; // Show in preview mode
  tier?: number; // 1-4, higher = more important
  group?: string; // Visual group identifier
}
```

- [ ] **Step 2: Add group labels constant**

Add after the `SECTIONS` constant definition (after line 64):

```typescript
// Group labels for visual separation
const GROUP_LABELS: Record<string, { label: string; tier: number }> = {
  'overview': { label: '命局总览', tier: 1 },
  'wealth': { label: '财富运势', tier: 1 },
  'career': { label: '事业维度', tier: 2 },
  'love': { label: '感情维度', tier: 2 },
  'health': { label: '健康维度', tier: 2 },
  'prediction': { label: '命运预测', tier: 3 },
  'tools': { label: '工具箱', tier: 4 },
};
```

- [ ] **Step 3: Restructure SECTIONS array with tier and group**

Replace the `SECTIONS` array (lines 49-64) with priority-ordered structure:

```typescript
const SECTIONS: SectionDef[] = [
  // ===== Tier 1: Core Overview (highest priority) =====
  // Overview Group
  { key: 'overall', title: '命局总评', color: 'var(--color-accent)', basic: true, tier: 1, group: 'overview' },
  { key: 'overallPlain', title: '通俗解读', color: 'var(--color-accent)', basic: true, sub: true, tier: 1, group: 'overview' },
  
  // Wealth Group
  { key: 'wealth', title: '财运', color: 'var(--color-dimension-wealth)', basic: true, tier: 1, group: 'wealth' },
  { key: 'fortune', title: '大运趋势', color: 'var(--color-secondary)', basic: true, tier: 1, group: 'wealth' },

  // ===== Tier 2: Life Dimensions =====
  // Career Group
  { key: 'career', title: '事业运', color: 'var(--color-dimension-career)', basic: true, tier: 2, group: 'career' },
  { key: 'careerSuggest', title: '职业推荐', color: 'var(--color-dimension-career)', sub: true, tier: 2, group: 'career' },
  { key: 'mentorDirection', title: '贵人方位', color: 'var(--color-dimension-mentor)', sub: true, tier: 2, group: 'career' },

  // Love Group
  { key: 'love', title: '感情运', color: 'var(--color-dimension-love)', basic: true, tier: 2, group: 'love' },
  { key: 'spouseDesc', title: '配偶特征', color: 'var(--color-dimension-love)', sub: true, tier: 2, group: 'love' },
  { key: 'marriageAdvice', title: '婚恋建议', color: 'var(--color-dimension-love)', sub: true, tier: 2, group: 'love' },

  // Health Group
  { key: 'health', title: '健康运', color: 'var(--color-dimension-health)', basic: true, tier: 2, group: 'health' },

  // ===== Tier 3: Predictions =====
  { key: 'yearly', title: '流年预测', color: 'var(--color-error)', basic: true, tier: 3, group: 'prediction' },
  { key: 'luckyElements', title: '幸运元素', color: 'var(--color-dimension-health)', isNested: true, tier: 3, group: 'prediction' },

  // ===== Tier 4: Tools =====
  { key: 'nameSuggestions', title: '起名建议', color: 'var(--color-dimension-health)', isNested: true, tier: 4, group: 'tools' },
];
```

- [ ] **Step 4: Commit**

```bash
git add src/components/FortuneDisplay.tsx
git commit -m "feat(FortuneDisplay): add tier and group metadata to sections"
```

---

## Task 2: Add Group Separator Component

**Files:**
- Modify: `src/components/FortuneDisplay.tsx`

- [ ] **Step 1: Add GroupSeparator helper component**

Add after the `NameSuggestionsDisplay` function (after line 137, before line 139):

```typescript
// Group separator with tier-based visual weight
function GroupSeparator({ label, tier }: { label: string; tier: number }) {
  const opacity = Math.max(0.3, 0.6 - (tier - 1) * 0.1);
  const leftPadding = (tier - 1) * 12; // Indent based on tier

  return (
    <div 
      className="flex items-center gap-3 my-4 px-2"
      style={{ paddingLeft: `${leftPadding}px` }}
    >
      <div 
        className="h-px flex-1"
        style={{ 
          background: `linear-gradient(90deg, transparent, rgba(212,175,55,${opacity}), transparent)` 
        }}
      />
      <span 
        className="text-xs font-medium tracking-widest uppercase"
        style={{ 
          color: `rgba(212,175,55,${opacity})`,
          fontFamily: 'var(--font-serif), serif',
        }}
      >
        {label}
      </span>
      <div 
        className="h-px flex-1"
        style={{ 
          background: `linear-gradient(90deg, transparent, rgba(212,175,55,${opacity}), transparent)` 
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Modify FortuneDisplay to render group separators**

Find the return statement in `FortuneDisplay` (lines 166-256) and update the rendering logic.

Replace the current flat mapping:
```typescript
{visibleSections.map((section) => {
```

With a grouped rendering approach. Add a helper function after `toggleSection`:

```typescript
// Get unique groups in order of first appearance
const getGroups = () => {
  const seen = new Set<string>();
  const groups: { key: string; section: SectionDef }[] = [];
  for (const section of visibleSections) {
    if (section.group && !seen.has(section.group)) {
      seen.add(section.group);
      groups.push({ key: section.group, section });
    }
  }
  return groups;
};
```

Then replace the rendering loop with:

```typescript
{getGroups().map(({ key: groupKey, section: firstSection }) => {
  const groupInfo = GROUP_LABELS[groupKey];
  const groupSections = visibleSections.filter(s => s.group === groupKey);
  
  return (
    <div key={groupKey}>
      <GroupSeparator label={groupInfo.label} tier={groupInfo.tier} />
      {groupSections.map((section) => {
        // ... existing section rendering logic
      })}
    </div>
  );
})}
```

- [ ] **Step 3: Adjust section styling for better hierarchy**

In the section container div style (lines 178-183), reduce left margin for `sub: true` sections since they're now visually grouped:

```typescript
style={{
  background: 'rgba(26, 21, 37, 0.5)',
  backdropFilter: 'blur(12px)',
  border: `1px solid ${isExpanded ? section.color + '50' : 'rgba(212,175,55,0.12)'}`,
  boxShadow: isExpanded ? `0 0 20px ${section.color}20` : 'none',
  marginLeft: section.sub ? '0' : undefined, // Remove ml-3 from flat sections
}}
```

And remove `section.sub ? 'ml-3' : ''` from the className (line 176).

- [ ] **Step 4: Commit**

```bash
git add src/components/FortuneDisplay.tsx
git commit -m "feat(FortuneDisplay): add group separators and restructure rendering"
```

---

## Task 3: Add Priority Badge to High-Tier Sections

**Files:**
- Modify: `src/components/FortuneDisplay.tsx`

- [ ] **Step 1: Add priority badge logic to section header**

In the header section (lines 186-236), after the title, add a priority badge for tier 1 sections:

In the header div (lines 190-220), after the title `h3` element closing tag (line 208), add:

```typescript
{section.tier === 1 && (
  <span
    className="text-xs px-2 py-0.5 rounded ml-2"
    style={{
      background: `linear-gradient(135deg, ${section.color}30, ${section.color}15)`,
      color: section.color,
      border: `1px solid ${section.color}40`,
    }}
  >
    核心
  </span>
)}
```

- [ ] **Step 2: Add subtle glow effect to tier 1 section headers**

In the button's style (line 188), update to add glow for tier 1:

```typescript
className={`w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-[var(--radius-md)] transition-colors stagger-item ${
  section.tier === 1 ? 'ring-1 ring-inset' : ''
}`}
style={{
  // ... existing styles
  ringColor: section.tier === 1 ? `${section.color}20` : 'transparent',
}}
```

Actually, this approach won't work well with inline styles. Instead, add to the existing button className:

```typescript
className={`w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/5 rounded-[var(--radius-md)] transition-colors stagger-item ${
  section.tier === 1 ? 'section-tier-1' : ''
}`}
```

Then add the style to globals.css (Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/components/FortuneDisplay.tsx
git commit -m "feat(FortuneDisplay): add priority badges to tier 1 sections"
```

---

## Task 4: Add Tier-Based Styling to globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add section tier utility classes**

Add at the end of globals.css (before the `/*# sourceMappingURL` line if present):

```css
/* ===== Fortune Section Tier Styling ===== */

/* Tier 1 sections - Core overview with subtle glow */
.section-tier-1 {
  background: linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 50%);
}

/* Tier 2 sections - Standard dimension sections */
.section-tier-2 {
  /* Default styling */
}

/* Group separator animations */
@keyframes group-fade-in {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

.group-separator {
  animation: group-fade-in 0.4s ease-out forwards;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(globals): add section tier utility classes"
```

---

## Task 5: Verify and Test

- [ ] **Step 1: Start dev server and verify changes**

```bash
npm run dev
```

Navigate to a report page (e.g., `/report/test-id`) to test:

1. **Group separators visible** - Each group should have a labeled separator line
2. **Section order correct** - Tier 1 (overview, wealth) appears first, then Tier 2, etc.
3. **"核心" badge visible** - On 命局总评 and 财运 sections
4. **Nested sections visually grouped** - 通俗解读 under 命局总评, 职业推荐+贵人方位 under 事业运
5. **No regression** - Accordion functionality still works

- [ ] **Step 2: Check accessibility**

```bash
grep -r "aria-" src/components/FortuneDisplay.tsx
```

Verify all interactive elements have proper ARIA labels.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete information hierarchy optimization in FortuneDisplay"
```

---

## Summary

After this plan:
- Sections organized into 4 tiers based on user priority
- Visual group separators with tier-based opacity
- "核心" badge on Tier 1 (most important) sections
- Sub-sections visually grouped under parent sections
- Consistent indentation and spacing
- Group labels use serif font for Eastern aesthetic

**Expected UX improvement:**
- Users can quickly scan for "命局总评" (Tier 1) first
- Related content (career + suggestions) visually grouped
- Clear visual hierarchy reduces cognitive load
- Premium feel with "核心" badges on important sections

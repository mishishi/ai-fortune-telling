# Yearly Fortune Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build yearly fortune tracking dashboard allowing users to compare their fortune reports across years and see trend analysis

**Architecture:** Tab-based layout on /history page with FortuneDashboard, RadarCompareView, YearlySummary, and TrendArrows components

**Tech Stack:** React, TypeScript, Tailwind CSS v4, Recharts, Next.js App Router

---

## Task 1: FortuneDashboard with Tab Switching

**Files:**
- Modify: `src/components/HistoryList.tsx` - Add tab switching between History List and Fortune Dashboard
- Create: `src/components/FortuneDashboard.tsx` - Main dashboard container
- Read: `src/components/HistoryList.tsx` - Current implementation
- Read: `docs/superpowers/specs/2026-04-22-yearly-fortune-tracking-design.md` - Design spec

- [ ] **Step 1: Add tab state and TabSwitcher component to HistoryList**

```typescript
// Add to HistoryList.tsx
const [activeTab, setActiveTab] = useState<'history' | 'fortune'>('history');
```

- [ ] **Step 2: Create FortuneDashboard component shell**

```typescript
// src/components/FortuneDashboard.tsx
'use client';
import { useState } from 'react';

interface FortuneDashboardProps {
  reports: any[];
  currentUserId: string;
}

export default function FortuneDashboard({ reports, currentUserId }: FortuneDashboardProps) {
  const [selectedReports, setSelectedReports] = useState<[any, any] | [null, null]>([null, null]);
  
  // Group reports by year
  const reportsByYear = reports.reduce((acc, report) => {
    const year = new Date(report.createdAt).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(report);
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <div className="space-y-6">
      <FortuneTimeline reports={reports} onSelect={setSelectedReports} />
      <YearlySummary latestReport={reports[0]} />
      {selectedReports[0] && selectedReports[1] && (
        <RadarCompareView reportA={selectedReports[0]} reportB={selectedReports[1]} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Implement tab switching UI**

Add two tabs: History and Fortune Tracking

- [ ] **Step 4: Render FortuneDashboard when tab is fortune**

- [ ] **Step 5: Commit**

```bash
git add src/components/HistoryList.tsx src/components/FortuneDashboard.tsx
git commit -m "feat(dashboard): add tab switching and FortuneDashboard shell"
```

---

## Task 2: FortuneTimeline Component

**Files:**
- Create: `src/components/FortuneTimeline.tsx` - Horizontal scrollable timeline of reports

- [ ] **Step 1: Create FortuneTimeline component with year grouping**

- [ ] **Step 2: Add TrendArrows for each dimension**

- [ ] **Step 3: Commit**

```bash
git add src/components/FortuneTimeline.tsx
git commit -m "feat(timeline): add FortuneTimeline with year grouping"
```

---

## Task 3: RadarCompareView with Dual Radar Charts

**Files:**
- Create: `src/components/RadarCompareView.tsx` - Side-by-side radar charts with diff highlighting
- Read: `src/components/RadarChart.tsx` - Existing radar chart implementation

- [ ] **Step 1: Create RadarCompareView with dual radar charts**

- [ ] **Step 2: Add comparison selection UI**

- [ ] **Step 3: Commit**

```bash
git add src/components/RadarCompareView.tsx
git commit -m "feat(radar): add RadarCompareView with diff highlighting"
```

---

## Task 4: TrendArrows Component

**Files:**
- Create: `src/components/TrendArrows.tsx` - Five-dimension trend indicator

- [ ] **Step 1: Create TrendArrows component**

- [ ] **Step 2: Commit**

```bash
git add src/components/TrendArrows.tsx
git commit -m "feat(trend): add TrendArrows component"
```

---

## Task 5: YearlySummary Component

**Files:**
- Create: `src/components/YearlySummary.tsx` - Current year fortune summary card

- [ ] **Step 1: Create YearlySummary component**

- [ ] **Step 2: Commit**

```bash
git add src/components/YearlySummary.tsx
git commit -m "feat(summary): add YearlySummary component"
```

---

## Validation

1. Run `npm run dev` (port 3004)
2. Navigate to `/history` page
3. Click Fortune Tracking tab
4. Verify timeline shows reports grouped by year
5. Verify radar comparison works with two selected reports
6. Run `npm run build` to verify no compilation errors

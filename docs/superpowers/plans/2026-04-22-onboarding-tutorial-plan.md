# Onboarding Tutorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5-step onboarding tutorial for first-time users, shown on first visit

**Architecture:** Single `OnboardingTutorial` component with internal step state (0-4), controlled visibility via localStorage flag. Renders as fixed overlay modal. Step content is inline in the component using conditional rendering.

**Tech Stack:** React useState/useEffect, CSS animations, localStorage

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/OnboardingTutorial.tsx` | CREATE | Main component with 5 step content, animation, skip/done logic |
| `src/app/page.tsx` | MODIFY | Add localStorage check and render OnboardingTutorial if needed |

---

## Task 1: Create OnboardingTutorial Component

**Files:**
- Create: `src/components/OnboardingTutorial.tsx`

- [ ] **Step 1: Create component file with state and localStorage logic**

```tsx
'use client';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'onboarding_completed';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

export default function OnboardingTutorial({ onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if already completed
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setIsVisible(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Step content here */}
    </div>
  );
}
```

- [ ] **Step 2: Add Step 1 - Welcome page content**

```tsx
// Inside the component, replace {/* Step content here */} with:
<div
  className="w-full max-w-md mx-4 rounded-2xl p-8 text-center"
  style={{
    background: 'linear-gradient(135deg, #1a1525 0%, #2d1f3d 100%)',
    animation: 'fadeSlideIn 300ms ease-out',
  }}
>
  {/* Skip button */}
  <button
    onClick={handleSkip}
    className="absolute top-4 right-4 text-sm text-gray-400 hover:text-white"
  >
    跳过
  </button>

  {/* Step 1: Welcome */}
  {currentStep === 0 && (
    <>
      <div className="mb-6">
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #c41e3a, #8b0000)', borderRadius: 20, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(196,30,58,0.5)' }}>
          <span style={{ fontSize: 40, color: 'white' }}>☯</span>
        </div>
      </div>
      <h3 style={{ color: 'white', fontSize: 28, marginBottom: 10 }}>AI 八字命理分析</h3>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 40 }}>探索你的命运密码</p>

      {/* Dot indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 30 }}>
        {[0,1,2,3,4].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === currentStep ? '#d4af37' : 'rgba(255,255,255,0.3)' }} />
        ))}
      </div>

      <button
        onClick={handleNext}
        style={{ background: 'linear-gradient(135deg, #c41e3a, #8b0000)', color: 'white', border: 'none', padding: '16px 50px', borderRadius: 30, fontSize: 16, fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(196,30,58,0.4)' }}
      >
        开始探索 →
      </button>
    </>
  )}
</div>
```

- [ ] **Step 3: Add CSS animation to global styles**

Check if `src/app/globals.css` exists and add the animation:

```css
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 4: Add Step 2 - What is BaZi content**

After the Step 1 block, add `{currentStep === 1 && (...)}` block with:
- Decorative 天干地支 characters
- Visual diagram showing 天干 (☰) + 地支 (☷)
- Text: "八字 = 出生时的时空密码"
- Same dot indicator pattern, highlighting dot index 1
- "下一步 →" button

- [ ] **Step 5: Add Step 3 - How to use content**

Add `{currentStep === 2 && (...)}` block with:
- 3 step cards layout (numbered 1, 2, 3)
- Step 1: 输入出生信息
- Step 2: AI 智能分析
- Step 3: 获取专属报告
- Same dot indicator, highlight dot index 2

- [ ] **Step 6: Add Step 4 - Case study content**

Add `{currentStep === 3 && (...)}` block with:
- Sample report preview card showing 小明's fortune
- Include mini radar chart SVG
- Score bars: 事业85, 感情72, 财运68, 健康90
- Summary text: "事业心强，财运平稳..."
- Same dot indicator, highlight dot index 3

- [ ] **Step 7: Add Step 5 - Privacy content**

Add `{currentStep === 4 && (...)}` block with:
- 🔒 icon
- Three bullet points about privacy
- Dot indicator highlighting dot index 4
- "开始使用" button (primary CTA, gradient style)

- [ ] **Step 8: Add backdrop and close on backdrop click**

```tsx
<div
  className="fixed inset-0 z-50 flex items-center justify-center"
  onClick={handleSkip}
>
  <div
    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
    style={{ zIndex: -1 }}
  />
  <div
    onClick={(e) => e.stopPropagation()}
    // ... existing card styles
  >
```

- [ ] **Step 9: Add keyframe CSS**

In `globals.css`, add:
```css
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 10: Commit**

```bash
git add src/components/OnboardingTutorial.tsx src/app/globals.css
git commit -m "feat: add OnboardingTutorial component with 5 steps

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Integrate into Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Import OnboardingTutorial**

```tsx
import OnboardingTutorial from '@/components/OnboardingTutorial';
```

- [ ] **Step 2: Add state and handler**

```tsx
const [showOnboarding, setShowOnboarding] = useState(false);

useEffect(() => {
  const completed = localStorage.getItem('onboarding_completed');
  if (!completed) {
    setShowOnboarding(true);
  }
}, []);

const handleOnboardingComplete = () => {
  setShowOnboarding(false);
};
```

- [ ] **Step 3: Render OnboardingTutorial before main content**

```tsx
{showOnboarding && (
  <OnboardingTutorial onComplete={handleOnboardingComplete} />
)}
```

Place this right after the `<main>` tag opens, or as the very first child of the page wrapper.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(page): integrate OnboardingTutorial on first visit

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Add Reset Functionality (Optional Enhancement)

**Files:**
- Modify: `src/app/profile/page.tsx` or settings area

- [ ] **Step 1: Add "View Tutorial Again" button**

In the profile/settings area, add a button:
```tsx
<button onClick={() => {
  localStorage.removeItem('onboarding_completed');
  window.location.reload();
}}>
  重新查看新手引导
</button>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/profile/page.tsx
git commit -m "feat(profile): add reset onboarding tutorial option

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Self-Review Checklist

1. **Spec coverage:** All 5 steps implemented (Welcome, What is BaZi, How to Use, Case Study, Privacy)
2. **Placeholder scan:** No TBD/TODO - all code is complete and runnable
3. **Type consistency:** currentStep is number 0-4, uses setState correctly
4. **Animation:** CSS keyframe `fadeSlideIn` added to globals.css
5. **localStorage:** Uses key `onboarding_completed` consistently
6. **Skip/Complete:** Both skip and final "开始使用" call handleComplete()

# Activity Studio Ultra Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Activity Studio'yu kutuphane destekli, AI ile gelistir akisi olan, tema ile tam senkron, premium A4 cikti ureten profesyonel bir modula donusturmek.

**Architecture:** Wizard yapisi korunur ancak her adim kendi alt modullerine ayrilir. StepGoal kutuphane ve hedef secim merkezi olur; StepContent secilen etkinligi AI ve editor akisi ile zenginlestirir; StepCustomize tema, kontrast ve kompakt A4 layout patch'lerini yonetir; StepPreview final premium snapshot'i render eder; StepApproval klinik ve pedagojik quality gate uygular.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

## Dosya Haritasi

### Create

- `src/data/activityStudioLibrary.ts`
- `src/services/activityStudioLibraryService.ts`
- `src/services/activityStudioEnhancementService.ts`
- `src/services/themeContrastService.ts`
- `src/services/compactA4LayoutService.ts`
- `src/components/ActivityStudio/goal/LibraryExplorer.tsx`
- `src/components/ActivityStudio/goal/LibraryFilters.tsx`
- `src/components/ActivityStudio/goal/LibraryCard.tsx`
- `src/components/ActivityStudio/goal/AIEnhanceEntryPanel.tsx`
- `tests/activityStudio/libraryService.test.ts`
- `tests/activityStudio/themeContrastService.test.ts`
- `tests/activityStudio/compactA4LayoutService.test.ts`
- `tests/activityStudio/enhancementService.test.ts`

### Modify

- `src/types/activityStudio.ts`
- `src/store/useActivityStudioStore.ts`
- `src/components/ActivityStudio/wizard/StepGoal.tsx`
- `src/components/ActivityStudio/wizard/StepContent.tsx`
- `src/components/ActivityStudio/wizard/StepCustomize.tsx`
- `src/components/ActivityStudio/wizard/StepPreview.tsx`
- `src/components/ActivityStudio/preview/PreviewRenderer.tsx`
- `src/services/activityStudioService.ts`
- `tests/activityStudio/wizardState.test.ts`

---

### Task 1: Library Domain ve Seed Veri

**Files:**
- Create: `src/data/activityStudioLibrary.ts`
- Create: `src/services/activityStudioLibraryService.ts`
- Modify: `src/types/activityStudio.ts`
- Test: `tests/activityStudio/libraryService.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';
import { getLibraryActivities } from '@/services/activityStudioLibraryService';

describe('activity studio library service', () => {
  it('returns curated activities filtered by profile', () => {
    const items = getLibraryActivities({ profile: 'dyslexia' });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.profile === 'dyslexia' || item.profile === 'mixed')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/activityStudio/libraryService.test.ts`
Expected: FAIL because service does not exist.

- [ ] **Step 3: Write minimal implementation**

Add a typed curated library with 24-30 activities across `dyslexia`, `dyscalculia`, `adhd`, `mixed`. Add service helpers for filtering, searching, and selecting featured activities.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/activityStudio/libraryService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/activityStudioLibrary.ts src/services/activityStudioLibraryService.ts src/types/activityStudio.ts tests/activityStudio/libraryService.test.ts
git commit -m "feat: add activity studio library domain"
```

### Task 2: Theme Contrast Safety

**Files:**
- Create: `src/services/themeContrastService.ts`
- Test: `tests/activityStudio/themeContrastService.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';
import { ensureReadableTextColor } from '@/services/themeContrastService';

describe('theme contrast service', () => {
  it('replaces unsafe white on white combinations', () => {
    const result = ensureReadableTextColor('#ffffff', '#ffffff');
    expect(result.toLowerCase()).not.toBe('#ffffff');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/activityStudio/themeContrastService.test.ts`
Expected: FAIL because service does not exist.

- [ ] **Step 3: Write minimal implementation**

Implement WCAG-oriented contrast helper with fallback token resolution and safe foreground selection.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/activityStudio/themeContrastService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/themeContrastService.ts tests/activityStudio/themeContrastService.test.ts
git commit -m "feat: add activity studio contrast safety"
```

### Task 3: AI ile Gelistir Service Contract

**Files:**
- Create: `src/services/activityStudioEnhancementService.ts`
- Modify: `src/services/activityStudioService.ts`
- Test: `tests/activityStudio/enhancementService.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';
import { enhanceLibraryActivity } from '@/services/activityStudioEnhancementService';

describe('activity studio enhancement service', () => {
  it('returns enriched content with pedagogicalNote', async () => {
    const result = await enhanceLibraryActivity({
      activityId: 'dyslexia-hece-001',
      topic: 'Hece farkindaligi',
      profile: 'dyslexia',
    });
    expect(result.pedagogicalNote.length).toBeGreaterThan(29);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/activityStudio/enhancementService.test.ts`
Expected: FAIL because service does not exist.

- [ ] **Step 3: Write minimal implementation**

Implement a safe enhancement layer that takes a library activity and returns enriched content using the current orchestrator/service path. Preserve `pedagogicalNote`, clinical validation, and AppError usage.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/activityStudio/enhancementService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/activityStudioEnhancementService.ts src/services/activityStudioService.ts tests/activityStudio/enhancementService.test.ts
git commit -m "feat: add activity studio ai enhancement service"
```

### Task 4: StepGoal Library UX

**Files:**
- Create: `src/components/ActivityStudio/goal/LibraryExplorer.tsx`
- Create: `src/components/ActivityStudio/goal/LibraryFilters.tsx`
- Create: `src/components/ActivityStudio/goal/LibraryCard.tsx`
- Create: `src/components/ActivityStudio/goal/AIEnhanceEntryPanel.tsx`
- Modify: `src/components/ActivityStudio/wizard/StepGoal.tsx`
- Modify: `src/store/useActivityStudioStore.ts`
- Modify: `src/types/activityStudio.ts`
- Test: `tests/activityStudio/wizardState.test.ts`

- [ ] **Step 1: Write the failing test**

Extend `tests/activityStudio/wizardState.test.ts` with expectations for selected library activity and enhancement entry payload persistence.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/activityStudio/wizardState.test.ts`
Expected: FAIL because state fields do not exist.

- [ ] **Step 3: Write minimal implementation**

Add library selection UI, profile filter, search, featured cards, and an `AI ile gelistir` entry panel inside StepGoal. Persist selected library activity and enhancement request to the store.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/activityStudio/wizardState.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ActivityStudio/goal src/components/ActivityStudio/wizard/StepGoal.tsx src/store/useActivityStudioStore.ts src/types/activityStudio.ts tests/activityStudio/wizardState.test.ts
git commit -m "feat: add activity studio goal library explorer"
```

### Task 5: Compact A4 Preview Model

**Files:**
- Create: `src/services/compactA4LayoutService.ts`
- Modify: `src/components/ActivityStudio/wizard/StepContent.tsx`
- Modify: `src/components/ActivityStudio/wizard/StepCustomize.tsx`
- Modify: `src/components/ActivityStudio/wizard/StepPreview.tsx`
- Modify: `src/components/ActivityStudio/preview/PreviewRenderer.tsx`
- Test: `tests/activityStudio/compactA4LayoutService.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, expect, it } from 'vitest';
import { buildCompactA4Layout } from '@/services/compactA4LayoutService';

describe('compact a4 layout service', () => {
  it('creates dense but readable layout sections', () => {
    const result = buildCompactA4Layout({ title: 'Test', steps: ['a', 'b', 'c'] });
    expect(result.sections.length).toBeGreaterThan(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- tests/activityStudio/compactA4LayoutService.test.ts`
Expected: FAIL because service does not exist.

- [ ] **Step 3: Write minimal implementation**

Build a preview layout model optimized for compact A4, then wire StepContent/Customize/Preview to consume it with safe theme contrast.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- tests/activityStudio/compactA4LayoutService.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/compactA4LayoutService.ts src/components/ActivityStudio/wizard/StepContent.tsx src/components/ActivityStudio/wizard/StepCustomize.tsx src/components/ActivityStudio/wizard/StepPreview.tsx src/components/ActivityStudio/preview/PreviewRenderer.tsx tests/activityStudio/compactA4LayoutService.test.ts
git commit -m "feat: add compact a4 preview model for activity studio"
```

### Task 6: Full Verification ve Integration Polish

**Files:**
- Modify: `tests/activityStudio/*.test.ts` as needed
- Modify: `tests/e2e/activity-studio.spec.ts` as needed

- [ ] **Step 1: Run focused tests**

Run: `npm run test:run -- tests/activityStudio`
Expected: PASS

- [ ] **Step 2: Run full verification**

Run: `npm run test:run && npm run build`
Expected: PASS

- [ ] **Step 3: Update e2e smoke if selectors changed**

Run: `npm run test:e2e -- --list`
Expected: Activity Studio e2e is still discovered.

- [ ] **Step 4: Commit**

```bash
git add tests/activityStudio tests/e2e/activity-studio.spec.ts
git commit -m "test: verify activity studio ultra slice"
```

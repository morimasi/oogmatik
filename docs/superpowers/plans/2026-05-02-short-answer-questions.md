# Short Answer Questions Infographic Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a premium, customizable "Short Answer Questions" activity under the Reading Comprehension category, mimicking the architectural structure of a 3x5 grid with colorful boxes, self-assessment circles, and answer lines.

**Architecture:** Extend the Infographic Studio v3 framework by adding a new `short-answer-grid` template to the `NativeInfographicRenderer`. This allows for ultra-customizable grid layouts (6, 9, 12, 15 items) with pedagogical notes and A4-optimized print support.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

### Task 1: Update Activity Types

**Files:**
- Modify: `src/types/activity.ts`

- [ ] **Step 1: Add INFOGRAPHIC_SHORT_ANSWER to ActivityType enum**
Add `INFOGRAPHIC_SHORT_ANSWER = 'INFOGRAPHIC_SHORT_ANSWER'` to the `ActivityType` enum under the Reading Comprehension (Kategori 2) section.

- [ ] **Step 2: Commit**
```bash
git add src/types/activity.ts
git commit -m "feat: add INFOGRAPHIC_SHORT_ANSWER activity type"
```

---

### Task 2: Create Short Answer Adapter

**Files:**
- Create: `src/services/generators/infographic/adapters/adapter_short_answer.ts`

- [ ] **Step 1: Implement the adapter with customization schema**
Define the `INFOGRAPHIC_SHORT_ANSWER` pair with parameters for `questionCount` (6, 9, 12, 15), `lineCount` (1-3), and `colorMode` (mixed, primary).

```typescript
import { InfographicGeneratorPair } from '../../../../types/infographic';
import { ActivityType } from '../../../../types/activity';

export const INFOGRAPHIC_SHORT_ANSWER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SHORT_ANSWER,
  title: 'Kısa Cevaplı Sorular (Ultra)',
  description: 'Görsel destekli, halkalı ve satırlı profesyonel soru panosu.',
  customizationSchema: {
    parameters: [
      {
        name: 'questionCount',
        label: 'Soru Sayısı',
        type: 'enum',
        options: ['6', '9', '12', '15'],
        defaultValue: '15',
        description: 'A4 sayfasına sığacak soru adedi.'
      },
      {
        name: 'lineCount',
        label: 'Satır Sayısı',
        type: 'number',
        defaultValue: 2,
        description: 'Her kutudaki cevap satırı sayısı (1-3).'
      },
      {
        name: 'colorMode',
        label: 'Renk Modu',
        type: 'enum',
        options: ['Karma Renkli', 'Tek Renk (Premium)'],
        defaultValue: 'Karma Renkli',
        description: 'Kutuların sınır renk düzeni.'
      }
    ]
  },
  template: 'short-answer-grid'
};
```

- [ ] **Step 2: Commit**
```bash
git add src/services/generators/infographic/adapters/adapter_short_answer.ts
git commit -m "feat: create short answer infographic adapter"
```

---

### Task 3: Register Adapter in Factory and Registry

**Files:**
- Modify: `src/services/generators/infographic/infographicFactory.ts`
- Modify: `src/services/generators/infographic/infographicRegistry.ts`

- [ ] **Step 1: Export from Factory**
Add `export { INFOGRAPHIC_SHORT_ANSWER } from './adapters/adapter_short_answer';` to `infographicFactory.ts`.

- [ ] **Step 2: Add to Registry**
Import and add `INFOGRAPHIC_SHORT_ANSWER` to the `FULL_REGISTRY` in `infographicRegistry.ts`.

- [ ] **Step 3: Commit**
```bash
git add src/services/generators/infographic/infographicFactory.ts src/services/generators/infographic/infographicRegistry.ts
git commit -m "feat: register short answer adapter in registry"
```

---

### Task 4: Implement Renderer in NativeInfographicRenderer

**Files:**
- Modify: `src/components/NativeInfographicRenderer.tsx`

- [ ] **Step 1: Update TemplateType enum**
Add `'short-answer-grid'` to the `TemplateType` union.

- [ ] **Step 2: Add to ParsedData interface**
```typescript
    shortAnswers?: Array<{ question: string; defaultAnswer?: string }>;
    config?: { questionCount: number; lineCount: number; colorMode: string };
```

- [ ] **Step 3: Implement ShortAnswerGridRenderer component**
Create a component that renders the grid. Use `getInfographicPalette` for colors.
Include:
- Flex/Grid layout based on `questionCount`.
- Colorful borders based on `colorMode`.
- Self-assessment circle at the top center of each box.
- Horizontal lines for answers (number of lines = `lineCount`).

- [ ] **Step 4: Update Parser**
Update `parseXmlInfographicSyntax` to handle `<short-answer-grid>` and its children `<item question="..." />`.
Update `resolveXmlTagToTemplate` to map `short-answer-grid` tag.

- [ ] **Step 5: Commit**
```bash
git add src/components/NativeInfographicRenderer.tsx
git commit -m "feat: implement short-answer-grid renderer"
```

---

### Task 5: Update Infographic Generator Logic

**Files:**
- Modify: `src/services/generators/infographicGenerator.ts`

- [ ] **Step 1: Add generator logic for SHORT_ANSWER**
Update the prompt construction to handle the new activity type and ensure it returns the correct XML syntax.
Ensure `pedagogicalNote` is included.

- [ ] **Step 2: Commit**
```bash
git add src/services/generators/infographicGenerator.ts
git commit -m "feat: update infographic generator for short answer"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Run tests**
Run: `npm run test:run`

- [ ] **Step 2: Build check**
Run: `npm run build`

- [ ] **Step 3: Commit**
```bash
git commit -m "chore: final verification and build check"
```

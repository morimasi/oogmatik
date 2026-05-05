# Open-Design Integration (Self-Critique & Design Schools) Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate open-design principles into Oogmatik by adding a 5-dimensional AI self-critique mechanism and top-bar selectable Design Schools (Visual Ecols).

**Architecture:** 
1. **Design Schools:** Add a global `designSchool` state to `useInfographicStudio` store. Expose a selector dropdown in the `PremiumEditToolbar` (top bar). Update `NativeInfographicRenderer` and `themeUtils` to dynamically apply CSS variables/palettes based on the selected school.
2. **AI Self-Critique:** Update `infographicGenerator.ts` schema to require a `selfCritique` object (scores and rationale). Update the system prompt to instruct the AI to self-evaluate and self-correct if scores are low, ensuring high pedagogical and visual quality.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

### Task 1: Update State and Types for Design Schools

**Files:**
- Modify: `src/types/infographic.ts` (if it exists, or `src/components/InfographicStudio/hooks/useInfographicStudio.ts`)
- Modify: `src/components/InfographicStudio/hooks/useInfographicStudio.ts`

- [ ] **Step 1: Define DesignSchool type and update store**
In `useInfographicStudio.ts`, add:
```typescript
export type DesignSchool = 'default' | 'brutalist' | 'warm-editorial' | 'tech-utility';
// Add designSchool to InfographicStudioState and setDesignSchool to InfographicStudioActions
```
Initialize `designSchool` with `'default'`.

- [ ] **Step 2: Commit**
```bash
git add src/components/InfographicStudio/hooks/useInfographicStudio.ts
git commit -m "feat: add designSchool state to infographic studio store"
```

---

### Task 2: Implement Design School Palettes

**Files:**
- Modify: `src/utils/themeUtils.ts`

- [ ] **Step 1: Update getInfographicPalette to support DesignSchools**
Update the function signature: `export function getInfographicPalette(forPrint = false, designSchool: string = 'default')`
Add palette definitions for the new schools:
- `brutalist`: high contrast, blacks, whites, sharp neon accents.
- `warm-editorial`: soft pastels, peachy neutrals, sepia text.
- `tech-utility`: dark mode, grays, cyan/green matrix accents.

- [ ] **Step 2: Commit**
```bash
git add src/utils/themeUtils.ts
git commit -m "feat: add design school palettes to themeUtils"
```

---

### Task 3: Add Design School Selector to Top Bar

**Files:**
- Modify: `src/components/InfographicStudio/Toolbar/PremiumEditToolbar.tsx`
- Modify: `src/components/InfographicStudio/panels/CenterPanel/InfographicPreview.tsx` (to pass the selected school to the renderer)

- [ ] **Step 1: Implement Dropdown in Toolbar**
Import `useInfographicStudio`. Add a sleek select/dropdown in the toolbar (perhaps next to the export/print buttons) allowing the user to switch between: "Standart (Eğitim)", "Brutalist (Yüksek Kontrast)", "Pastel (Göz Yormaz)", "Terminal (Analitik)".

- [ ] **Step 2: Pass designSchool to Renderer**
In `InfographicPreview.tsx` (and `A4PrintableSheetV2.tsx` if needed), read `designSchool` from the store and pass it down to `NativeInfographicRenderer` (or use it to wrap the container with a specific data-theme attribute).

- [ ] **Step 3: Update NativeInfographicRenderer**
Ensure `NativeInfographicRenderer` accepts `designSchool` as a prop and passes it to `getInfographicPalette`.

- [ ] **Step 4: Commit**
```bash
git add src/components/InfographicStudio/Toolbar/PremiumEditToolbar.tsx src/components/InfographicStudio/panels/CenterPanel/InfographicPreview.tsx src/components/NativeInfographicRenderer.tsx src/components/InfographicStudio/panels/CenterPanel/A4PrintableSheetV2.tsx
git commit -m "feat: add design school selector to top bar and wire to renderer"
```

---

### Task 4: Implement AI Self-Critique (5-Dimensional)

**Files:**
- Modify: `src/services/generators/infographicGenerator.ts`

- [ ] **Step 1: Update Schema**
Add a `selfCritique` object to the required schema:
```javascript
selfCritique: {
    type: 'OBJECT',
    properties: {
        pedagogyScore: { type: 'NUMBER' },
        hierarchyScore: { type: 'NUMBER' },
        zpdScore: { type: 'NUMBER' },
        readabilityScore: { type: 'NUMBER' },
        innovationScore: { type: 'NUMBER' },
        rationale: { type: 'STRING' }
    },
    required: ['pedagogyScore', 'hierarchyScore', 'zpdScore', 'readabilityScore', 'innovationScore', 'rationale']
}
```

- [ ] **Step 2: Update Prompt**
Add instructions: "Üretimi tamamlamadan önce kendini 5 boyutta (Pedagojik, Görsel Hiyerarşi, ZPD Uyumu, Okunabilirlik, İnovasyon) 1-10 arası puanla. Eğer herhangi bir puan 8'in altındaysa, içeriği BAŞTAN YAZ ve düzelt. selfCritique alanına son puanlarını ve nedenini ekle."

- [ ] **Step 3: Pass designSchool to prompt**
Update `generateInfographic` to accept `designSchool` in options and inject it into the prompt so the AI knows the visual tone.

- [ ] **Step 4: Commit**
```bash
git add src/services/generators/infographicGenerator.ts
git commit -m "feat: implement 5-dimensional AI self-critique mechanism"
```

---

### Task 5: Final Verification

- [ ] **Step 1: Run tests**
Run: `npm run test:run`

- [ ] **Step 2: Build check**
Run: `npm run build`

- [ ] **Step 3: Push**
```bash
git push -u origin feat/open-design-self-critique
```

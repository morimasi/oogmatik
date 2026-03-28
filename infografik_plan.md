# Infografik Stüdyosu Premium Upgrade Planı

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** İnfografik Stüdyosunu derinlemesine analiz edip, AppError ve sıfır-console kurallarına tam uyumlu hale getirmek; her biri hazır A4 çalışma kağıdı mimarisine entegre olabilen 4 temel Özel Öğrenme Güçlüğü (SpLD) alanı için en az 10'ar (toplam 40) premium aktivite şablonu eklemek.

**Architecture:**

1. **Şablon Mimarisi:** Mevcut `SPLD_PREMIUM_TEMPLATES` yapısı ayrı bir veri dosyasına (`src/data/infographicTemplates.ts`) taşınacak ve her kategori (Disleksi, Diskalkuli, DEHB, Disgrafi/Karma) için tam 10 adet zengin, pedagojik hedefleri belli prompt şablonu eklenecek.
2. **A4 Editor Entegrasyonu:** Üretilen infografikler SVG veya Base64 formatında doğrudan `useA4EditorStore` veya A4 çalışma kağıdına bir "Blok" (`ImageBlock`) olarak eklenebilecek "Çalışma Kağıdına Aktar" (Export to Worksheet) butonu eklenecek.
3. **Mühendislik Revizyonu:** `InfographicRenderer` ve `InfographicStudio` bileşenlerindeki `console.warn` ve ham hata fırlatmaları, Oogmatik `AppError` ve `logger` standardına geçirilecek.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + @antv/infographic

---

### Task 1: Premium Şablon Kütüphanesinin (40 Adet) Oluşturulması

**Files:**

- Create: `src/data/infographicTemplates.ts`
- Modify: `src/components/InfographicStudio/index.tsx`
- Test: `tests/infographicTemplates.test.ts`

- [ ] **Step 1: Write the failing test**
      A test to ensure exactly 4 categories exist and each has at least 10 items.
- [ ] **Step 2: Run test to verify it fails**
      Run: `npm run test:run -- tests/infographicTemplates.test.ts`
      Expected: FAIL
- [ ] **Step 3: Write minimal implementation**
      Create `src/data/infographicTemplates.ts` containing 4 categories (Disleksi, Diskalkuli, DEHB, Disgrafi/Duyusal) with 10 detailed templates each. Export `SPLD_PREMIUM_TEMPLATES`.
- [ ] **Step 4: Run test to verify it passes**
      Run: `npm run test:run -- tests/infographicTemplates.test.ts`
      Expected: PASS
- [ ] **Step 5: Commit**
      `git add src/data/infographicTemplates.ts tests/infographicTemplates.test.ts`
      `git commit -m "feat: add 40 premium SpLD infographic templates"`

### Task 2: Infographic Studio A4 Editor Entegrasyonu

**Files:**

- Modify: `src/components/InfographicStudio/index.tsx`
- Modify: `src/store/useA4EditorStore.ts`

- [ ] **Step 1: Write the failing test (or prepare the store)**
      Add `addBlock` action to `useA4EditorStore` if not already robust, or ensure `InfographicStudio` can dispatch to it.
- [ ] **Step 2: Run test to verify it fails**
      Run: `npx tsc --noEmit`
- [ ] **Step 3: Write minimal implementation**
      In `InfographicStudio/index.tsx`, import `useA4EditorStore`. Add a new button: "A4 Kağıdına Aktar". In its handler, grab the SVG outerHTML from `rendererRef`, convert it to a Data URL (Base64 SVG), and call `useA4EditorStore.getState().addBlock({ type: 'image', content: dataUrl })`.
- [ ] **Step 4: Run test to verify it passes**
      Run: `npx tsc --noEmit`
      Expected: PASS
- [ ] **Step 5: Commit**
      `git add src/components/InfographicStudio/index.tsx src/store/useA4EditorStore.ts`
      `git commit -m "feat: integrate infographic export to A4 editor"`

### Task 3: Mühendislik Standartları ve Hata Yönetimi Revizyonu

**Files:**

- Modify: `src/components/InfographicRenderer.tsx`
- Modify: `src/components/InfographicStudio/index.tsx`

- [ ] **Step 1: Write the failing test / Static Check**
      Use grep to find `console.warn` in these files.
- [ ] **Step 2: Run test to verify it fails**
      `npx tsc --noEmit` and check for linter/console.log warnings.
- [ ] **Step 3: Write minimal implementation**
      Replace `console.warn` with `logger.logError(new AppError(...))` in `InfographicRenderer.tsx` and `InfographicStudio/index.tsx`. Enhance Magic Enhance API call to use robust AppError handling instead of a silent try/catch block.
- [ ] **Step 4: Run test to verify it passes**
      Run: `npm run test:run`
- [ ] **Step 5: Commit**
      `git add src/components/InfographicRenderer.tsx src/components/InfographicStudio/index.tsx`
      `git commit -m "refactor: apply AppError and logger standards to infographic studio"`

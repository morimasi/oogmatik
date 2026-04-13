# Activity Studio Premium A4 Completion Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task. Each step has a clear "DONE" criteria. After each task, await spec+quality review approval before moving to next.

**Goal:** Complete the missing UI layers (StepContent blueprint, StepCustomize theme/contrast/density, Premium A4 renderer, PDF export) so students can generate full premium A4 activity pages end-to-end.

**Architecture:** TDD approach with parallel subagent workers. Each UI panel wires to existing services (themeContrastService, compactA4LayoutService, enhancementService). Store extended with missing config fields. New renderer components apply theme tokens + A4 layout. PDF export via jsPDF.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

## File Map (What Changes)

### Types & Store
- **Extend:** `src/types/activityStudio.ts` → Add `ContentBlock`, `ThemeConfig`, `CompactA4Config`, `ExportSettings` types
- **Extend:** `src/store/useActivityStudioStore.ts` → Add `content`, `themeConfig`, `compactA4Config`, `exportSettings` fields

### Components (New + Enhanced)
- **Create:** `src/components/ActivityStudio/wizard/StepContent.tsx` → Blueprint editor (replaces stub)
- **Create:** `src/components/ActivityStudio/wizard/panels/ThemeSyncPanel.tsx` → Color picker + contrast ratio live
- **Create:** `src/components/ActivityStudio/wizard/panels/ContrastSafetyPanel.tsx` → WCAG AA validation + auto-fix
- **Create:** `src/components/ActivityStudio/wizard/panels/CompactA4LayoutPanel.tsx` → Density + font + spacing sliders
- **Replace:** `src/components/ActivityStudio/preview/PreviewRenderer.tsx` → Call A4CompactRenderer
- **Create:** `src/components/ActivityStudio/preview/A4CompactRenderer.tsx` → Premium A4 visual at 210×297mm
- **Create:** `src/components/ActivityStudio/preview/ActivityBlockRenderer.tsx` → Render individual activity blocks
- **Create:** `src/components/ActivityStudio/preview/StudentEyeView.tsx` (enhance) → Use ActivityBlockRenderer

### Services (New Utils)
- **Create:** `src/services/activityStudioContentService.ts` → Blueprint editing (create/update blocks)
- **Enhance:** `src/components/ActivityStudio/preview/ExportEngine.ts` → PDF generation via jsPDF

### Tests
- **Create:** `tests/activityStudio/contentService.test.ts` → Content block CRUD
- **Create:** `tests/activityStudio/themeContrastPanel.test.ts` → Theme + contrast logic
- **Create:** `tests/activityStudio/a4Renderer.test.ts` → A4 compact render + layout
- **Create:** `tests/activityStudio/exportEngine.test.ts` → PDF export (jsPDF mock)
- **Create:** `tests/activityStudio/endToEndFlow.test.ts` → Full wizard: goal → content → customize → preview → export

---

## Task Breakdown

### Task 1: Extend Types & Store for Full Wizard State

**Files:**
- Modify: `src/types/activityStudio.ts`
- Modify: `src/store/useActivityStudioStore.ts`
- Test: `tests/activityStudio/store.test.ts` (new)

- [ ] **Step 1a:** Write test for store fields (content, themeConfig, compactA4Config, exportSettings) — RED
- [ ] **Step 1b:** Extend `ActivityStudioState` interface in types
- [ ] **Step 1c:** Add store setters (setContent, setThemeConfig, setCompactA4Config, setExportSettings)
- [ ] **Step 1d:** Run test → GREEN
- [ ] **Step 1e:** Commit "types: extend ActivityStudio state for content + theme + layout"

**Acceptance:** `npm run test:run` passes, store fields present + type-safe, no `any`

---

### Task 2: Content Blueprint Service & UI (StepContent)

**Files:**
- Create: `src/services/activityStudioContentService.ts`
- Create: `src/components/ActivityStudio/wizard/StepContent.tsx`
- Create: `tests/activityStudio/contentService.test.ts`

- [ ] **Step 2a:** Write test for `createActivityBlock()`, `updateActivityBlock()`, `removeActivityBlock()` — RED
- [ ] **Step 2b:** Implement `activityStudioContentService` with pure functions (no AI call yet)
- [ ] **Step 2c:** Run test → GREEN
- [ ] **Step 2d:** Write test for StepContent UI: renders library selection + materials + "Üret & Devam" button
- [ ] **Step 2e:** Create StepContent.tsx with ContentBlueprintEditor component (MaterialList, BlockEditor panels)
- [ ] **Step 2f:** Wire store + AI enhancement call (call `enhanceLibraryActivity()` service)
- [ ] **Step 2g:** Run full test suite → GREEN (including new content tests)
- [ ] **Step 2h:** Commit "feat: StepContent blueprint editor + content service"

**Acceptance:** Content blocks can be created/edited, materials list shown, AI enhancement callable, test passing

---

### Task 3: ThemeSyncPanel (Color Picker + Contrast Ratio Display)

**Files:**
- Create: `src/components/ActivityStudio/wizard/panels/ThemeSyncPanel.tsx`
- Create: `tests/activityStudio/themeContrastPanel.test.ts`

- [ ] **Step 3a:** Write test for panel: color picker inputs (primary, secondary, accent, bgPaper) — RED
- [ ] **Step 3b:** Write test for contrast ratio display (calls `themeContrastService.getContrastRatio()`)
- [ ] **Step 3c:** Implement ThemeSyncPanel.tsx with:
  - Color input fields for 4 theme tokens
  - Live contrast ratio numbers (e.g., "4.6:1 ✓ WCAG AA")
  - `onChange` callback to store
- [ ] **Step 3d:** Wire to store: `setThemeConfig()` on color change
- [ ] **Step 3e:** Run test → GREEN
- [ ] **Step 3f:** Commit "feat: ThemeSyncPanel with live contrast ratio"

**Acceptance:** Panel renders, color pickers work, store updates, contrast ratios display, test passing

---

### Task 4: ContrastSafetyPanel (WCAG AA Validation + Auto-Fix)

**Files:**
- Create: `src/components/ActivityStudio/wizard/panels/ContrastSafetyPanel.tsx`
- Extend: `tests/activityStudio/themeContrastPanel.test.ts`

- [ ] **Step 4a:** Write test for panel: validates theme colors against 4.5:1 threshold — RED
- [ ] **Step 4b:** Write test for auto-fix button: calls `ensureReadableTextColor()`, updates store
- [ ] **Step 4c:** Implement ContrastSafetyPanel.tsx with:
  - Validation report: "primary ↔ bgPaper: 6.2:1 ✓" or "secondary ↔ bgPaper: 2.1:1 ✗"
  - Warning messages for failed pairs
  - "Otomatik Düzelt" button calls `themeContrastService.ensureReadableTextColor()`
- [ ] **Step 4d:** Wire to store: `setThemeConfig()` after auto-fix
- [ ] **Step 4e:** Run test → GREEN
- [ ] **Step 4f:** Commit "feat: ContrastSafetyPanel with WCAG AA validation + auto-fix"

**Acceptance:** Panel shows validation status, auto-fix works, updates store, test passing

---

### Task 5: CompactA4LayoutPanel (Density + Font + Spacing Sliders)

**Files:**
- Create: `src/components/ActivityStudio/wizard/panels/CompactA4LayoutPanel.tsx`
- Create: `tests/activityStudio/compactA4Panel.test.ts`

- [ ] **Step 5a:** Write test for panel sliders: densityLevel (0–5), fontSize (11–13), lineSpacing (1.4–1.6), margins (10–20) — RED
- [ ] **Step 5b:** Implement CompactA4LayoutPanel.tsx with:
  - Slider for each config field
  - Preview text showing effect (font size + line height applied)
  - `onChange` callback to store
- [ ] **Step 5c:** Wire to store: `setCompactA4Config()` on slider change
- [ ] **Step 5d:** Run test → GREEN
- [ ] **Step 5e:** Commit "feat: CompactA4LayoutPanel with density/font/spacing controls"

**Acceptance:** Sliders work, preview updates, store updates, test passing

---

### Task 6: Integrate All 3 Panels into StepCustomize

**Files:**
- Modify: `src/components/ActivityStudio/wizard/StepCustomize.tsx`
- Create: `tests/activityStudio/stepCustomize.test.ts`

- [ ] **Step 6a:** Write test: StepCustomize renders all 3 panels in tab structure — RED
- [ ] **Step 6b:** Modify StepCustomize to integrate ThemeSyncPanel, ContrastSafetyPanel, CompactA4LayoutPanel
- [ ] **Step 6c:** Wire store reads + navigation (onNext → StepPreview)
- [ ] **Step 6d:** Run test → GREEN
- [ ] **Step 6e:** Commit "feat: StepCustomize integrates theme/contrast/density panels"

**Acceptance:** All 3 panels render, store updates flow correctly, navigation works, test passing

---

### Task 7: A4CompactRenderer (Premium A4 Layout Visual)

**Files:**
- Create: `src/components/ActivityStudio/preview/A4CompactRenderer.tsx`
- Create: `tests/activityStudio/a4Renderer.test.ts`

- [ ] **Step 7a:** Write test: A4CompactRenderer renders 210×297mm A4 container with theme tokens applied — RED
- [ ] **Step 7b:** Write test: Compact A4 renderer calls `compactA4LayoutService.buildCompactA4Layout()`
- [ ] **Step 7c:** Implement A4CompactRenderer.tsx with:
  - Div sized 210×297mm (CSS scale)
  - Apply theme tokens from store (primary color → headers, accent → buttons)
  - Use `compactA4ToHtml()` from service
  - Render sections with proper spacing/font-size from compactA4Config
- [ ] **Step 7d:** Create ActivityBlockRenderer.tsx: render individual blocks (question, explanation, activity) with theme colors
- [ ] **Step 7e:** Enhance StudentEyeView to use ActivityBlockRenderer
- [ ] **Step 7f:** Run test → GREEN
- [ ] **Step 7g:** Commit "feat: A4CompactRenderer with theme token + activity blocks"

**Acceptance:** A4 preview renders at correct dimensions, theme colors visible, blocks formatted correctly, test passing

---

### Task 8: PreviewRenderer Integration

**Files:**
- Modify: `src/components/ActivityStudio/preview/PreviewRenderer.tsx`
- Extend: `tests/activityStudio/a4Renderer.test.ts`

- [ ] **Step 8a:** Write test: PreviewRenderer calls A4CompactRenderer with store config — RED
- [ ] **Step 8b:** Modify PreviewRenderer to:
  - Replace StudentEyeView (plain text) with A4CompactRenderer
  - Pass themeConfig + compactA4Config from store
  - Show pedagogical note below A4 preview
- [ ] **Step 8c:** Run test → GREEN
- [ ] **Step 8d:** Commit "feat: PreviewRenderer uses A4CompactRenderer + theme config"

**Acceptance:** Preview shows full A4 layout with theme applied, test passing

---

### Task 9: ExportEngine PDF Generation

**Files:**
- Enhance: `src/components/ActivityStudio/preview/ExportEngine.ts`
- Create: `tests/activityStudio/exportEngine.test.ts`
- **Dependencies:** `jsPDF`, `html2canvas`

- [ ] **Step 9a:** Write test for `exportToPDF()`: takes activity data + theme config, returns Blob — RED
- [ ] **Step 9b:** Install jsPDF if not present: `npm install jspdf html2canvas`
- [ ] **Step 9c:** Implement exportEngine PDF generation:
  - Use `html2canvas()` to render PreviewRenderer div
  - Create jsPDF with A4 dimensions (210×297mm)
  - Embed canvas image
  - Add metadata (theme config, difficulty, profile)
  - Return PDF Blob
- [ ] **Step 9d:** Wire to StepPreview export button: call `exportToPDF()`
- [ ] **Step 9e:** Run test → GREEN (jsPDF will be mocked in test)
- [ ] **Step 9f:** Commit "feat: ExportEngine PDF generation via jsPDF + html2canvas"

**Acceptance:** PDF export functional, metadata embedded, test passing

---

### Task 10: End-to-End Wizard Flow Test

**Files:**
- Create: `tests/activityStudio/endToEndFlow.test.ts`

- [ ] **Step 10a:** Write test: Complete wizard flow from library select → content → customize → preview → PDF export — RED
- [ ] **Step 10b:** Implement test with:
  - Mock library item selection
  - Mock content creation
  - Mock theme + layout config
  - Mock preview rendering
  - Mock PDF export
  - Verify store state after each step
  - Verify no mutations between steps
- [ ] **Step 10c:** Run test → GREEN
- [ ] **Step 10d:** Commit "test: end-to-end wizard flow integration test"

**Acceptance:** Full flow tested, all state transitions verified, test passing

---

### Task 11: Full Regression + Build Verification

**Files:** (all of above)

- [ ] **Step 11a:** Run `npm run test:run` — all tests including new ones
- [ ] **Step 11b:** Run `npm run build` — no TypeScript errors
- [ ] **Step 11c:** Run `npm run lint` — no ESLint violations
- [ ] **Step 11d:** Manual test: Open wizard in browser, run through complete flow (library → content → theme → preview → export)

**Acceptance:** 800+ tests passing, build green, lint clean, wizard flow works end-to-end

---

### Task 12: Final Commit & Documentation

- [ ] **Step 12a:** Review all changes: `git diff main`
- [ ] **Step 12b:** Create commit message with detailed feature list
- [ ] **Step 12c:** `git add -A && git commit -m "feat: premium A4 activity studio completion..."`
- [ ] **Step 12d:** `git push origin main`
- [ ] **Step 12e:** Update `MODULE_KNOWLEDGE.md` with new components/services

**Acceptance:** All changes committed + pushed, documentation updated

---

## Oogmatik Rules (MANDATORY)

For all implementers:

- ✅ **TypeScript strict:** No `any` type; use `unknown` + type guard
- ✅ **AppError standard:** All errors via `AppError`, not raw `Error`
- ✅ **pedagogicalNote:** All AI outputs include pedagogical note (for teacher context)
- ✅ **Test first:** Every new function/component has failing test → implementation → passing test
- ✅ **No console.log:** Production code uses `logError()` from utils
- ✅ **gemini-2.5-flash:** Model is fixed (Selin Arslan rule)
- ✅ **Lexend font:** Never modify (disleksia standard)
- ✅ **KVKK:** Student name + diagnosis + scores never visible together
- ✅ **No diagnostic language:** Not "disleksisi var" but "disleksi desteğine ihtiyacı var"

---

## Agent Review Checkpoints

**After Task 1 (Type/Store):** Yazılım Mühendisi approval required  
**After Task 2 (Content BP):** Pedagoji (Elif) approval required  
**After Tasks 3–5 (Theme/Contrast/Layout):** Klinik (Dr. Ahmet) approval for contrast safety + AI (Selin) for enhancement integration  
**After Tasks 6–9 (Render/Export):** Yazılım Mühendisi + Pedagoji approval  
**After Task 11 (Full Regression):** All 4 agents final sign-off  

---

## Success Criteria (User Acceptance)

User can:
1. ✅ Open Activity Studio → Select library item + enhancement topic (DONE)
2. ✅ Create content blueprint with materials (NEW)
3. ✅ Customize theme colors + verify WCAG AA contrast (NEW)
4. ✅ Adjust compact A4 density + font + spacing (NEW)
5. ✅ Preview full premium A4 layout in 210×297mm at correct zoom (NEW)
6. ✅ Export to PDF file with metadata (NEW)
7. ✅ All tests passing, zero TypeScript errors (NEW)

---

## Timeline Estimate

- Task 1 (Type/Store): 15 min
- Task 2 (Content BP): 45 min
- Task 3 (Theme Sync): 30 min
- Task 4 (Contrast Safety): 30 min
- Task 5 (Compact A4 Panel): 30 min
- Task 6 (StepCustomize Integration): 20 min
- Task 7 (A4 Renderer): 60 min
- Task 8 (PreviewRenderer): 20 min
- Task 9 (PDF Export): 45 min
- Task 10 (E2E Test): 30 min
- Task 11 (Regression): 20 min
- Task 12 (Commit): 10 min

**Total: 4.5 hours**

---

## Next: Subagent Dispatch

Ready for `subagent-driven-development` execution with:
- Task 1 → yazılım-muhendisi
- Task 2 → ozel-ogrenme-uzmani (review) + yazılım-muhendisi (impl)
- Task 3-5 → yazılım-muhendisi (impl) + ozel-egitim-uzmani (review)
- Task 6-9 → yazılım-muhendisi (impl) + ai-muhendisi (review ExportEngine)
- Task 10-12 → All 4 agents final review

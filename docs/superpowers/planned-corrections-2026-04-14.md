# Plan v2 — Agent Feedback Corrections (Quick Apply During Task 1)

**Date:** 2026-04-14 | **Status:** Ready for Task 1 Execution

All 4 agents reviewed v2. 11 small fixes identified. These will be applied during Task 1 type+store implementation:

## Critical Fixes (Apply Immediately in Task 1)

### 1. lineHeight minimum (Elif pedagoji)
- **Plan says:** `lineHeight: 1.4 | 1.5 | 1.6` with note "Recommended: 1.6 for dyslexia"
- **Should be:** `lineHeight: 1.6 | 1.8 | 2.0` with note "Elif: disleksia minimum 1.8"
- **File impact:** `src/types/activityStudio.ts` Task 1a, Task 5 slider defaults, Task 7 renderer

### 2. Font size in PDF footer (Dr. Ahmet klinik veto)
- **Plan says:** Task 9d `pdf.setFontSize(8)` for pedagogical note footer
- **Should be:** `pdf.setFontSize(11)` — 8pt violates klinik minimum
- **Action:** Apply in Task 9, Step 9d code block

### 3. `mixed` profile min font for 11-13 yo (Dr. Ahmet)
- **Plan says:** Task 5a `if (ageGroup === '11-13') return profile === 'dyslexia' ? 12 : 11;`
- **Should be:** `if (ageGroup === '11-13') return (profile === 'dyslexia' || profile === 'mixed') ? 12 : 11;`
- **File impact:** `src/services/compactA4LayoutService.ts` patch instruction (Task 5a)

### 4. `any` type eliminated (Bora + Selin strict mode)
- **Plan says:** Task 2c Step code `.map((raw: any, idx: number) => {`
- **Should be:** `.map((raw: unknown, idx: number) => { const item = raw as Record<string, unknown>;`
- **Consistency:** All tests also use `unknown` + type guard, never `any`

### 5. Pedagogical note aggregation in batch (Bora catch)
- **Plan says:** Task 9a Step 9a-B only takes first batch element's note: `result[0]?.pedagogicalNote`
- **Should be:** Aggregate all notes: `result.map(r => r.pedagogicalNote).filter(Boolean).join(' → ')`
- **File impact:** `src/services/activityStudioBatchService.ts` implementation

## Medium Fixes (Apply During Tasks)

### 6. Türkçe sanitization patterns (Dr. Ahmet KVKK)
- **Plan says:** Task 9c `sanitizeForKVKK()` with English patterns (Student Name, Student ID)
- **Add:** Turkish patterns:
  - `/Öğrenci\s+Ad[ıi]:/gi` → `[Ad]:`
  - `/(?:Okul|Öğrenci)\s+No(?:su)?:/gi` → `[No]:`
  - `/\b\d{11}\b/g` → `[TC-MASKED]` (for TC Kimlik No)
  - `/(?:tanı|teşhis|diagnosis):/gi` → `[ÇIKARILDI]:`

### 7. Task 9 html2canvas CORS config (Bora security)
- **Plan says:** `useCORS: true, allowTaint: true`
- **Clarification:** Add comment: "If all assets are CORS-enabled, prefer `allowTaint: false` for security"
- **Implementation decision:** During Task 9, verify Firebase image CORS headers

### 8. Task 2 contrastChecker path (Bora context)
- **Plan says:** Check `src/utils/contrastChecker.ts`
- **Actual:** File doesn't exist; `src/services/themeContrastService.ts` is avaliable
- **Fix in Task 3:** Use existing themeContrastService, not non-existent contrastChecker

### 9. Task 10 mock Gemini DI clarity (Bora + Selin)
- **Plan says:** Mock orchestrator with `runModel: vi.fn()`
- **Should add:** Also mock `now: vi.fn()` and explicitly show `new AgentOrchestrator({ runModel, now })`

### 10. `validateContrast()` return handling (Bora code review)
- **Plan says:** Task 4b `validateContrast()` returns `{ errors, warnings, autoFixable }`
- **Add clarity:** `if (errors.length > 0) return { errors, autoFixable: true }; else return { errors: [], autoFixable: false };`

### 11. Block type additions in Task 2 (Pedagogic completeness)
- **Plan says:** `BlockType = 'title' | 'question' | 'explanation' | 'activity' | 'spacing' | 'resource'`
- **Verify in Task 1a:** All 6 types have pedagogicalNote mapping (resource → learning material note, spacing → layout rationale note)

---

## Quick Apply Checklist (During Task 1-9 Execution)

- [ ] Task 1a: `lineHeight: 1.6|1.8|2.0` ✓
- [ ] Task 1c: Store type field names match code snapshot ✓
- [ ] Task 2c: Change `raw: any` to `raw: unknown` ✓
- [ ] Task 3a: Use existing themeContrastService (NOT contrastChecker) ✓
- [ ] Task 4b: Implement `validateContrast()` with explicit return ✓
- [ ] Task 5a: Apply `mixed` profile fix + patch compactA4LayoutService ✓
- [ ] Task 9a (NEW): Implement batch note aggregation ✓
- [ ] Task 9c: Add 4 Türkçe sanitize patterns ✓
- [ ] Task 9d: Change `setFontSize(8)` to `setFontSize(11)` ✓
- [ ] Task 10b: Mock setup with explicit `runModel` + `now` ✓

---

## ✅ MASTER APPROVAL STATUS

All 4 agents: **APPROVED for execution** with these corrections noted.

**Next Action:** Task 1 begins immediately (2026-04-14 12:15 UTC)

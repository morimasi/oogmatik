# Application-Wide Turkish Localization Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure all application-authored text shown to users and students is Turkish, translate eligible legacy saved content before display, and prevent future English UI/content regressions.

**Architecture:** Audit user-visible string surfaces across `src/`, `api/`, data libraries, generators, and worksheet renderers; preserve technical identifiers and image-generation prompts behind Turkish display labels. Use the existing rate-limited `/api/generate` + `generateWithSchema` path for text-only legacy translation rather than adding an unprotected translation endpoint. Translate only schema-approved natural-language fields, omit all student/account/profile metadata, validate the translated result before updating local or Firestore archives, and keep the original record unchanged if translation fails.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

## File Map

| Path | Responsibility |
|---|---|
| `src/components/**` | User-facing application UI, studio controls, dialogs, notices, and worksheet renderers; translate any English UI literals found by the audit. |
| `src/components/ReadingStudio/**` | ReadingStudio controls, editing panels, archive workflow, and live worksheet renderer; correct 5N1K labels and English UI strings. |
| `src/components/sheets/**`, `src/components/SheetRenderer/**`, `src/components/sheet-renderers/**` | Student-facing worksheet strings and mappings from internal activity/question keys to Turkish labels. |
| `src/services/generators/**`, `src/services/offlineGenerators/**` | AI prompts, schema descriptions that constrain student-facing content, fixed/offline prompts, and fallback content. |
| `src/data/**`, `src/constants/**`, `src/utils/activityTurkishNames.ts` | Activity names, templates, reusable content, and display-name mappings. |
| `src/services/turkishContentService.ts` (new) | Schema-aware, text-only translation and Turkish-output validation for eligible historical worksheet content; no identity/profile data. |
| `src/utils/turkishDisplay.ts` (new, if audit demonstrates shared need) | Pure display normalization for fixed enum/question keys; never changes the stored technical value. |
| `src/components/ReadingStudio/Editor/ArchivePanel.tsx` | Local/Firebase ReadingStudio archive load flow; call translation before displaying and persist only validated output. |
| `src/components/ReadingStudio/ReadingStudio.tsx` | ReadingStudio UI labels and hydration paths where incoming saved content can be normalized before display. |
| `src/services/worksheetService.ts` and relevant worksheet hydration components | Other saved worksheet retrieval/update paths, identified from the repository-wide archive/load audit. |
| `src/utils/schemas.ts` (only if needed) | Reuse or extend existing validated AI-generation request schema; do not bypass `validateGenerateActivityRequest`. |
| `api/generate.ts`, `src/services/rateLimiter.ts` | Existing secure AI endpoint and rate-limit behavior; do not weaken or replace its middleware. Modify only if audit proves the translation request cannot safely use its current contract. |
| `tests/turkishContentAudit.test.ts` (new) | Regression checks for audited UI strings, technical-key display leakage, generator language constraints, and untranslated literals. |
| `tests/turkishContentService.test.ts` (new) | Translation candidate selection, allowed-field transformation, identity-data exclusion, output validation, and failure behavior. |
| `tests/readingStudioTurkish.test.tsx` (new) | ReadingStudio 5N1K labels, archive migration-on-load, persistence, and visible error behavior. |
| `tests/worksheetTurkishRegression.test.tsx` (new) | Representative common, verbal, math, visual, offline, and AI worksheet render paths. |
| `scripts/audit-user-facing-english.mjs` (new) | Repeatable candidate scan of UI/content literals with output suitable for reviewed classification; must not rewrite files. |
| `docs/superpowers/specs/2026-10-02-application-wide-turkish-localization-design.md` | Approved scope and acceptance criteria; update only if implementation discovers a necessary design change. |

## Implementation Rules

- Run tests first and prove each new test fails for the intended reason before implementation (TDD).
- Work in small, separately reviewable tasks; do not mass-replace English-looking identifiers or prose in one unreviewed operation.
- Every scanner hit must be classified as user-visible Turkish translation, technical/internal value with a Turkish display mapping, image/model prompt, user-authored content, or documented external/brand exception.
- Do not modify `services/geminiClient.ts` JSON repair logic or change the fixed model `gemini-2.5-flash`.
- Reuse `generateWithSchema` and the existing `/api/generate` validation, security checks, retry behavior, and rate limit for legacy translation. No new endpoint is planned. If this contract proves unsuitable, stop and revise the design before adding an endpoint.
- Legacy conversion must be idempotent, field-allowlisted, limited in size, and performed before the content is rendered/printed/shared/assigned. Persist only a fully validated translation; keep the original record on every failure.
- Never include student name, student ID, diagnosis, scores, account ID, or profile fields in translation requests. User-authored free-text must not be automatically translated.
- Do not add an `any` type. Use existing types, `unknown`, and guards.
- Preserve `pedagogicalNote` in every AI activity output and keep the established `AppError` and `logError()` handling patterns.
- No new endpoint is planned; if one becomes necessary, it must use `RateLimiter`, Zod request validation, `retryWithBackoff` for the AI call, standard `AppError` responses, and endpoint tests.

## Tasks

### Task 1: Establish the user-facing English inventory

**Files:**
- Create: `scripts/audit-user-facing-english.mjs`
- Create: `tests/turkishContentAudit.test.ts`
- Inspect: `src/components/**`, `src/services/generators/**`, `src/services/offlineGenerators/**`, `src/data/**`, `src/constants/**`, `src/utils/**`, `api/**`

- [ ] **Step 1: Write a failing audit test**

Create a test that invokes the scanner against a small fixture containing:
1. A visible literal `Loading...` that must be reported.
2. An internal key `who` rendered via a Turkish mapping that must not be reported as UI text.
3. An English `imagePrompt` value that is explicitly exempt from student-facing text scanning.
4. A Turkish phrase that must not be reported.

- [ ] **Step 2: Run the focused test and verify the intended failure**

Run: `npm run test:run -- tests/turkishContentAudit.test.ts`  
Expected: FAIL because the scanner and its classification behavior do not exist.

- [ ] **Step 3: Implement a read-only candidate scanner**

Add a Node script that searches only maintained runtime sources (not dependencies/build output), reports file/line/literal candidates, supports explicit exclusions for code identifiers and image prompts, and never edits files. Keep candidate detection conservative and treat output as a review inventory, not automatic proof that every English-looking token is user-visible.

- [ ] **Step 4: Capture and classify the repository inventory**

Run: `node scripts/audit-user-facing-english.mjs`  
Expected: report all candidates under the in-scope runtime directories. Review every hit and record the classification in the task notes/plan checklist while working; do not add a committed generated report unless it provides a lasting regression value.

- [ ] **Step 5: Run the focused audit test**

Run: `npm run test:run -- tests/turkishContentAudit.test.ts`  
Expected: PASS; technical identifiers and image-generation-only prompts are not treated as visible English.

- [ ] **Step 6: Run the repository suite after this task**

Run: `npm run test:run`  
Expected: PASS, or document any pre-existing baseline failures without hiding them.

### Task 2: Add Turkish display mapping for 5N1K and fixed enum values

**Files:**
- Create: `src/utils/turkishDisplay.ts` if shared display normalization is justified by the inventory
- Modify: `src/components/ReadingStudio/ReadingStudioContentRenderer.tsx`
- Modify: `src/components/ReadingStudio/Editor/ContentPanel.tsx`
- Modify: additional renderer/configuration files found by the audit where technical keys are rendered directly
- Test: `tests/readingStudioTurkish.test.tsx`

- [ ] **Step 1: Write failing renderer tests**

Render representative ReadingStudio 5N1K data with `who`, `what`, `where`, `when`, `why`, and `how` keys and assert the displayed labels are `Kim?`, `Ne?`, `Nerede?`, `Ne zaman?`, `Neden?`, and `Nasıl?`. Assert none of the English keys appear in the rendered text. Add a legacy mixed-case/space variant only if the inventory shows such values in persisted records.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm run test:run -- tests/readingStudioTurkish.test.tsx`  
Expected: FAIL because `q.type` currently renders as an uppercase English identifier.

- [ ] **Step 3: Implement a pure display mapping**

Map known internal enum values to Turkish labels at display boundaries. Preserve original serialized/API enum values. For unknown keys use a safe Turkish fallback such as `Soru` rather than leaking an English identifier.

- [ ] **Step 4: Update all mapped display call sites**

Apply the same mapping wherever audited code displays question/category/difficulty/logic keys, including the ReadingStudio worksheet preview, content editor selectors, and other student worksheet renderers. Translate English labels in these same focused files.

- [ ] **Step 5: Run focused tests**

Run: `npm run test:run -- tests/readingStudioTurkish.test.tsx`  
Expected: PASS with all six Turkish labels and no raw English type names.

- [ ] **Step 6: Run the repository suite after this task**

Run: `npm run test:run`  
Expected: PASS.

### Task 3: Translate ReadingStudio interface and future generated content

**Files:**
- Modify: `src/components/ReadingStudio/ReadingStudio.tsx`
- Modify: `src/components/ReadingStudio/ReadingStudioContentRenderer.tsx`
- Modify: all files under `src/components/ReadingStudio/Editor/` with English visible labels, placeholders, error/confirmation strings, or option labels
- Modify: `src/services/generators/readingStudio.ts`
- Test: `tests/readingStudioTurkish.test.tsx`

- [ ] **Step 1: Add tests for visible studio text and AI prompt constraints**

Assert the ReadingStudio header, controls, archive empty/loading/error states, style/config labels, and rendered worksheet headings are Turkish. Mock `generateWithSchema`, call `generateInteractiveStory`, and assert its prompt requires Turkish for every student-facing text field while explicitly excluding image-generation prompt language from display content.

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm run test:run -- tests/readingStudioTurkish.test.tsx`  
Expected: FAIL on visible English such as `Reading Studio Pro`, `Easy/Medium/Hard`, `Radius`, or English 5N1K values.

- [ ] **Step 3: Translate ReadingStudio interface strings**

Translate all user-facing strings in the listed studio files, including mixed-language labels and option values. Keep technical config values (for example `simple`, `moderate`, `advanced`, `left`, `right`) unchanged and provide Turkish option labels.

- [ ] **Step 4: Require Turkish in the ReadingStudio generator**

Update the generation prompt and schema descriptions so titles, story, 5N1K questions/answers, vocabulary definitions, pedagogical goals, multiple-choice questions/options, logic question, and creative prompt are Turkish. Preserve `imagePrompt` as model-only English and do not remove or weaken `pedagogicalGoals`/pedagogical notes.

- [ ] **Step 5: Run focused tests**

Run: `npm run test:run -- tests/readingStudioTurkish.test.tsx`  
Expected: PASS.

- [ ] **Step 6: Run the repository suite after this task**

Run: `npm run test:run`  
Expected: PASS.

### Task 4: Translate shared application UI surfaces

**Files:**
- Modify: audited files in `src/App.tsx`, `src/pages/**`, `src/components/**`, `src/components/*Studio/**`, `src/components/AdminDashboard/**`, `src/components/Student/**`, `src/components/Profile/**`, `src/components/Screening/**`, and shared dialogs/navigation
- Test: `tests/turkishContentAudit.test.ts`

- [ ] **Step 1: Convert the reviewed UI candidate inventory into regression fixtures**

For each visible English UI candidate from Task 1, add a fixture/assertion identifying its file and expected Turkish presentation. Exclude only categorized internal values, library/brand names, developer-only labels, and user-authored content.

- [ ] **Step 2: Run the UI regression test and verify failures**

Run: `npm run test:run -- tests/turkishContentAudit.test.ts`  
Expected: FAIL and report the remaining in-scope user-visible English strings.

- [ ] **Step 3: Translate shared navigation and common components**

Translate global header/sidebar/toolbars, authentication/settings, search, dialogs, toast/error/loading states, generic saved/shared worksheet views, and common action controls. Preserve route names, storage keys, enum values, accessibility semantics, and third-party product names.

- [ ] **Step 4: Translate domain/studio-specific controls in reviewed batches**

Use the inventory to handle configuration panels, student-facing controls, reports, profile/student/admin surfaces, and specialized studios in small batches. Do not mass-edit unreviewed matches; retain Turkish labels for technical English option values.

- [ ] **Step 5: Re-run the UI regression scan**

Run: `npm run test:run -- tests/turkishContentAudit.test.ts`  
Expected: PASS for the covered user-visible source literals; any remaining scanner candidates have a documented scope exclusion.

- [ ] **Step 6: Run the repository suite after this task**

Run: `npm run test:run`  
Expected: PASS.

### Task 5: Translate worksheet renderers and activity metadata

**Files:**
- Modify: audited files in `src/components/sheets/**`
- Modify: audited files in `src/components/SheetRenderer/**`, `src/components/sheet-renderers/**`, `src/components/UniversalStudio/**`
- Modify: `src/utils/activityTurkishNames.ts`, `src/constants/activities.ts`, `src/data/activityStudioLibrary.ts`, and other activity metadata found by Task 1
- Test: `tests/worksheetTurkishRegression.test.tsx`

- [ ] **Step 1: Add representative renderer tests**

Cover common worksheet headers/instructions and one renderer from each verbal, math, visual, logic, infographic, and generic fallback path. Include tests for English enum/data values and English fixed labels. Assert user-provided free-text is rendered as authored and is not mutated by display mapping.

- [ ] **Step 2: Run the focused renderer suite and confirm failures**

Run: `npm run test:run -- tests/worksheetTurkishRegression.test.tsx`  
Expected: FAIL for the known English renderer labels/defaults found in the audit.

- [ ] **Step 3: Translate student-facing renderer literals**

Translate headings, questions/instructions defaults, scoring/accessibility labels, print/export content and fallback UI. Keep stable activity IDs, layout block IDs, JSON schema keys, and external library names unchanged.

- [ ] **Step 4: Localize activity and template display metadata**

Translate visible activity titles/descriptions/options and add Turkish display mapping for any stable English IDs. Ensure unknown IDs use an existing safe Turkish fallback rather than exposing the ID itself.

- [ ] **Step 5: Run focused renderer tests**

Run: `npm run test:run -- tests/worksheetTurkishRegression.test.tsx`  
Expected: PASS across all representative renderer paths.

- [ ] **Step 6: Run the repository suite after this task**

Run: `npm run test:run`  
Expected: PASS.

### Task 6: Translate offline libraries, fixed prompts, and fallbacks

**Files:**
- Modify: audited files in `src/services/offlineGenerators/**`
- Modify: audited fixed libraries in `src/data/**`, `src/constants/**`, `src/kaynak/**`, `src/modules/**`
- Modify: any shared fallback generation code in `src/services/generators/core/**`
- Test: `tests/turkishContentAudit.test.ts`
- Test: existing offline generator smoke tests

- [ ] **Step 1: Add assertions for audited offline content**

Extend focused generator tests to assert generated titles, directions, question labels, choices, fallback strings, and default content are Turkish for the identified English candidates. Verify generated structures still satisfy their renderer contracts.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm run test:run -- tests/turkishContentAudit.test.ts tests/okudugunuAnlamaOfflineSmoke.test.ts tests/semanticLinkerSmoke.test.ts`  
Expected: FAIL on English offline/default strings included in the test fixtures.

- [ ] **Step 3: Translate offline and fixed learner-facing content**

Translate only application-authored content. Do not translate user-supplied topic/text fields, image-generation prompts, data IDs, or non-display developer comments. Keep answer keys consistent with their displayed options.

- [ ] **Step 4: Run focused offline tests**

Run: `npm run test:run -- tests/turkishContentAudit.test.ts tests/okudugunuAnlamaOfflineSmoke.test.ts tests/semanticLinkerSmoke.test.ts`  
Expected: PASS and stable expected content shapes.

- [ ] **Step 5: Run the repository suite after this task**

Run: `npm run test:run`  
Expected: PASS.

### Task 7: Enforce Turkish output across AI content generation

**Files:**
- Modify: audited user-content prompts under `src/services/generators/**`
- Modify: AI generation paths under `src/services/**` that send learner-visible content to `api/generate`
- Modify: `api/generate.ts` only if the shared system instruction can enforce Turkish without changing unrelated API behavior
- Test: `tests/turkishContentAudit.test.ts`
- Test: relevant existing generator tests

- [ ] **Step 1: Add prompt-contract tests for generator families**

Mock model calls and assert student-facing output fields in reading/language, math/logic, visual/spatial, assessment, and composite generators specify Turkish. Assert internal enum/schema values remain stable and `pedagogicalNote` remains in every affected AI activity output.

- [ ] **Step 2: Run focused prompt tests and confirm failure**

Run: `npm run test:run -- tests/turkishContentAudit.test.ts`  
Expected: FAIL where a student-visible field lacks a Turkish-language constraint or has an English fixed template.

- [ ] **Step 3: Translate and constrain AI-generated learner-facing fields**

Add concise Turkish-only instructions at the closest shared generator prompt layer that owns each field. Update activity-specific prompts and schemas where a shared rule is insufficient. Keep image prompts and model-only technical descriptions explicitly separated. Preserve existing model selection, validation, batching/cache behavior, and pedagogical metadata.

- [ ] **Step 4: Add output-language acceptance validation**

Use a typed, testable language-validation boundary for model-generated natural-language fields. It must not reject stable codes, proper nouns, Turkish text containing unavoidable foreign proper nouns, or image prompts. Do not claim perfect language detection: uncertain output must fail clearly or use a bounded same-operation regeneration path; never return it as validated Turkish.

- [ ] **Step 5: Run focused generator tests**

Run: `npm run test:run -- tests/turkishContentAudit.test.ts`  
Expected: PASS for prompt constraints, schema stability, `pedagogicalNote`, and validation decisions.

- [ ] **Step 6: Run the repository suite after this task**

Run: `npm run test:run`  
Expected: PASS.

### Task 8: Implement safe, schema-aware legacy-content translation

**Files:**
- Create: `src/services/turkishContentService.ts`
- Modify: `src/utils/schemas.ts` only if a schema-backed request addition is required
- Reuse: `src/services/geminiClient.ts`, `src/utils/errorHandler.ts`, `src/utils/AppError.ts`, existing `api/generate.ts` rate/security/validation path
- Test: `tests/turkishContentService.test.ts`

- [ ] **Step 1: Write service tests before implementation**

Test:
1. Turkish content is returned unchanged and does not call the model.
2. English in an allowlisted natural-language field requests translation.
3. Technical keys, enum values, timestamps, IDs, image prompts, and unknown properties are preserved and never included as translatable prose.
4. Student/account/profile/diagnosis/score fields are removed before any request.
5. Invalid/malformed output and translation failures throw a standard `AppError`.
6. The original input object is not mutated and a repeated call on translated content is idempotent.

- [ ] **Step 2: Run the focused service test and verify failure**

Run: `npm run test:run -- tests/turkishContentService.test.ts`  
Expected: FAIL because the service is not implemented.

- [ ] **Step 3: Implement a schema-aware allowlist transformer**

Support only identified persisted worksheet/story shapes and natural-language fields. Validate input size and nested structure with existing Zod conventions/type guards. Construct a separate translation payload containing only those fields; never serialize entire student/archive records into the model request.

- [ ] **Step 4: Use the existing rate-limited model path and validate response**

Call the existing `generateWithSchema` route using a fixed Turkish translation instruction and a strict output schema. Do not edit the Gemini JSON repair engine. Validate output keys, types, completeness, Turkish acceptance, and structural preservation before returning. Use `AppError`, `retryWithBackoff` only according to existing service conventions, and log failures through `logError()`.

- [ ] **Step 5: Run focused service tests**

Run: `npm run test:run -- tests/turkishContentService.test.ts`  
Expected: PASS, including PII exclusion and fail-closed cases.

- [ ] **Step 6: Run the repository suite after this task**

Run: `npm run test:run`  
Expected: PASS.

### Task 9: Migrate saved content before display and persist atomically

**Files:**
- Modify: `src/components/ReadingStudio/Editor/ArchivePanel.tsx`
- Modify: `src/components/ReadingStudio/ReadingStudio.tsx`
- Modify: `src/services/worksheetService.ts` and each audited saved worksheet hydration boundary
- Modify: local/Firebase persistence adapters used at those boundaries (use `updateDoc` only for owned, permission-checked existing records)
- Test: `tests/readingStudioTurkish.test.tsx`
- Test: `tests/worksheetTurkishRegression.test.tsx`

- [ ] **Step 1: Add legacy-load tests**

Mock local storage, Firestore, and translation service. Verify legacy English archive entries are not rendered before successful translation; Turkish entries do not call translation; translated content is persisted exactly once; IDs and metadata survive unchanged; and translation/write failures preserve the original archive and show a visible localized error.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `npm run test:run -- tests/readingStudioTurkish.test.tsx tests/worksheetTurkishRegression.test.tsx`  
Expected: FAIL because archive hydration currently displays stored content directly.

- [ ] **Step 3: Integrate the ReadingStudio local and cloud archive flow**

Translate only eligible content fields before setting store state. Persist local updates by replacing the matching archive record without losing unrelated records. For Firestore, verify the authenticated owner and existing authorization rules before updating; do not broaden read/write permissions.

- [ ] **Step 4: Integrate the remaining audited worksheet-load paths**

Apply the same pre-display flow to every persisted worksheet/fascicle/share route in the inventory. Where a record is read-only or not owned, translate into a safe in-memory copy and do not attempt a write. Do not alter user-authored free text.

- [ ] **Step 5: Verify atomic persistence and visible failures**

Run: `npm run test:run -- tests/readingStudioTurkish.test.tsx tests/worksheetTurkishRegression.test.tsx`  
Expected: PASS for success, idempotence, retained metadata, no premature render, and failure preserving source data.

- [ ] **Step 6: Run the repository suite after this task**

Run: `npm run test:run`  
Expected: PASS.

### Task 10: Close the audit and add ongoing regression protection

**Files:**
- Modify: `scripts/audit-user-facing-english.mjs`
- Modify: `tests/turkishContentAudit.test.ts`
- Modify: `tests/worksheetTurkishRegression.test.tsx`
- Modify: any remaining in-scope runtime files surfaced by the final audit
- Modify: approved design document only if implementation decisions changed

- [ ] **Step 1: Run the full audit after all translation batches**

Run: `node scripts/audit-user-facing-english.mjs`  
Expected: every remaining candidate is either fixed or explicitly classified as non-user-facing/allowed; no unexplained visible English remains.

- [ ] **Step 2: Turn unresolved in-scope hits into failing assertions**

Update scanner fixtures/allowlist so known English UI literals and technical key leakage fail the test, while clearly categorized prompts, internal values, code identifiers, and user-authored text do not create noisy false positives.

- [ ] **Step 3: Run the targeted localization regression tests**

Run: `npm run test:run -- tests/turkishContentAudit.test.ts tests/turkishContentService.test.ts tests/readingStudioTurkish.test.tsx tests/worksheetTurkishRegression.test.tsx`  
Expected: PASS.

- [ ] **Step 4: Run the complete test suite**

Run: `npm run test:run`  
Expected: PASS. If unrelated baseline failures exist, identify and report them separately; do not suppress them or expand scope unnecessarily.

- [ ] **Step 5: Run lint and production build**

Run: `npm run lint && npm run build`  
Expected: both commands complete successfully without new TypeScript/lint regressions.

- [ ] **Step 6: Perform final engineering and privacy review**

Confirm `pedagogicalNote` is preserved in all affected AI outputs; all new error paths use `AppError`/standard project handling; no `any` was introduced; no endpoint was added without rate limiting; no Gemini model/JSON repair changes occurred; and no student identity/clinical data enters legacy translation payloads.

- [ ] **Step 7: Commit each completed implementation task**

Use small commits after each completed task, with the repository's conventional commit style and required Copilot co-author trailer. Never amend an existing commit.

## Final Acceptance Checklist

- [ ] No unexplained application-authored English strings remain in user/student-visible runtime surfaces.
- [ ] 5N1K technical keys never appear in the UI or worksheets.
- [ ] New AI content is requested and accepted only as Turkish in user-facing natural-language fields.
- [ ] Legacy English archive text is translated before display, validated, persisted once where authorized, and never silently treated as success on failure.
- [ ] Translation requests contain only allowlisted text; they exclude names, identifiers, diagnoses, scores, and other personal/profile data.
- [ ] Student/teacher-authored free text, technical identifiers, API/schema keys, and image prompts are preserved.
- [ ] `pedagogicalNote`, Lexend, `AppError`, `logError`, strict typing, current Gemini model, JSON repair engine, existing validation/security/rate-limit behavior, and existing worksheet contracts remain intact.
- [ ] Focused tests, `npm run test:run`, `npm run lint`, and `npm run build` pass.

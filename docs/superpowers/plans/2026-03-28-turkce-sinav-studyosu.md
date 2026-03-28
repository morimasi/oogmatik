# Türkçe Sınav Stüdyosu (Bilgi Macerası) Ultra Premium Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MEB müfredatına uyumlu, 4 farklı soru tipi üretebilen, Bloom Taksonomisine dayalı, özel öğrenme güçlüğüne (ZPD) uygun ve gelişmiş sayfa/tablo konfigürasyonları ile donatılmış "Türkçe Sınav Stüdyosu" (Bilgi Macerası) inşa etmek. Bu modül; üretilen içerikleri kaydetme, yazdırma, kitapçığa ekleme, kullanıcılara paylaşma ve doğrudan öğrencilere atama (assignment) yetenekleriyle tam teşekküllü bir LMS aracı olarak çalışacaktır.

**Architecture:**

1. **Veri Modeli (Zod & TS):** "Discriminated Union" soru tipleri. Her veri `unknown` olarak karşılanıp Zod ile `AppError` standardında doğrulanacak.
2. **AI Servisi:** 10'dan fazla soruda "Batching" uygulanacak. Prompt içinde MEB kazanımı, Lexend font kuralı ve `pedagogicalNote` zorunluluğu olacak.
3. **Sayfa ve Tablo Konfigürasyon Arayüzü:** Öğretmene, A4 üzerindeki tablonun sütun (column), satır (row), aralık (gap) ve kenarlık (border) değerlerini milimetrik ayarlayabileceği bileşenler sunulacak.
4. **Metadata (Başlık) Kontrolleri:** Sınav kağıdı üzerindeki "Öğrenci İsmi, Tarih, Hedef, Kazanım, Ünite, Sınıf" alanlarının açılıp kapanmasını (toggle) sağlayan switch bileşenleri eklenecek.
5. **Aksiyon ve Dağıtım (Action Bar):** Üretilen sınavlar veritabanına kaydedilecek (Save), indirilecek/yazdırılacak (Print/PDF), "Kitapçığa Ekle"ilecek (Workbook), diğer öğretmenlerle paylaşılabilecek (Share) ve mevcut öğrencilere ev ödevi/sınav olarak atanabilecek (Assign).

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

### Task 1: Zod Şemaları, Layout Metadata ve TypeScript Arayüzleri

**Files:**

- Modify: `src/utils/schemas.ts`
- Create: `src/types/exam.ts`
- Create: `tests/examSchema.test.ts`

- [ ] **Step 1:** Create `tests/examSchema.test.ts` checking if `ExamQuestionSchema` and `ExamLayoutSchema` validate correctly and reject missing `pedagogicalNote`.
- [ ] **Step 2:** Define `ExamQuestionType` enum and discriminated unions for questions in `exam.ts`.
- [ ] **Step 3:** Define `ExamLayoutConfig` containing settings for grid (cols, gap, padding, borderStyle) and visibility toggles (`showTitle`, `showUnit`, `showStudentName`, `showObjective`, `showDate`).
- [ ] **Step 4:** Run tests and commit: `feat(exam): define strict typescript interfaces and layout configs for exam studio`

### Task 2: Yapay Zeka Soru Üretici Servisi (ExamGenerator)

**Files:**

- Create: `src/services/generators/examGenerator.ts`
- Modify: `src/services/geminiClient.ts`
- Create: `tests/examGenerator.test.ts`

- [ ] **Step 1:** Create `tests/examGenerator.test.ts` mocking `generateWithSchema`.
- [ ] **Step 2:** Implement `generateExamQuestions(params)`. Include strict system instructions for MEB compliance, Bloom taxonomy, 4 question types. Add chunking logic if `params.questionCount > 10`. Use `AppError` for failures.
- [ ] **Step 3:** Run tests and commit: `feat(exam): implement ai exam generator with chunking and strict pedagogical prompt`

### Task 3: "Bilgi Macerası" (Exam Studio) Konfigürasyon ve Ayar Paneli

**Files:**

- Create: `src/components/ExamStudio/index.tsx`
- Create: `src/components/ExamStudio/ExamConfigPanel.tsx`
- Create: `src/components/ExamStudio/ExamLayoutSettings.tsx`

- [ ] **Step 1:** Implement the `ExamConfigPanel` for selecting grade level (4-9), unit, difficulty, and question type.
- [ ] **Step 2:** Implement `ExamLayoutSettings` providing Slider/Toggle UI for grid columns, borders, paddings, and header metadata toggles (showStudentName, showUnit, etc.).
- [ ] **Step 3:** Run static validation (`npx tsc --noEmit`) and commit: `feat(exam): build exam studio config ui with advanced layout and metadata controls`

### Task 4: Dinamik Sınav Önizlemesi ve A4 Çalışma Kağıdı Render Motoru

**Files:**

- Create: `src/components/ExamStudio/ExamPreview.tsx`
- Modify: `src/store/useA4EditorStore.ts`

- [ ] **Step 1:** In `ExamPreview.tsx`, map the questions into a DOM structure respecting the `ExamLayoutConfig` (CSS Grid styles, border classes, gap values).
- [ ] **Step 2:** Conditionally render the header section based on toggles (`showStudentName`, `showUnit` vs).
- [ ] **Step 3:** At the end of the question list, insert a special page-break for the "Çözüm Anahtarı" (Solution Key) so it prints on a separate page.
- [ ] **Step 4:** Add "A4 Kağıdına Aktar" button logic mapped to `useA4EditorStore`.
- [ ] **Step 5:** Run static validation and commit: `feat(exam): implement dynamic grid preview and A4 mapping for exams`

### Task 5: Aksiyon Barı: Kaydetme, İndirme, Yazdırma ve Kitapçık

**Files:**

- Create: `src/components/ExamStudio/ExamActionBar.tsx`

- [ ] **Step 1:** In `ExamActionBar.tsx`, implement "Yazdır" (Print) calling `printService.generatePdf()` on the Preview ref.
- [ ] **Step 2:** Implement "PDF İndir" (Download) logic.
- [ ] **Step 3:** Implement "Kitapçığa Ekle" (Add to Workbook) calling `onAddToWorkbook(examData)`.
- [ ] **Step 4:** Implement "Kaydet" (Save) calling `activityService.saveActivity(user.id, examData)` with `ActivityType.EXAM`.
- [ ] **Step 5:** Run static validation and commit: `feat(exam): add save, print, download and workbook integration to exam studio`

### Task 6: Etkileşim: Paylaşım ve Öğrenciye Atama (Share & Assign)

**Files:**

- Modify: `src/components/ExamStudio/ExamActionBar.tsx`
- Modify: `src/components/ExamStudio/index.tsx`

- [ ] **Step 1:** Ensure `ShareModal` and `StudentAssignmentModal` (or logic) exist and are strictly typed.
- [ ] **Step 2:** In `ExamActionBar.tsx`, add "Paylaş" (Share) which opens `ShareModal`. On submit, calls `activityService.shareActivity(...)` with other users.
- [ ] **Step 3:** Add "Öğrenciye Ata" (Assign) which opens a dropdown/modal of the teacher's students. On submit, calls `studentService.assignActivityToStudent(studentId, examData)`.
- [ ] **Step 4:** Run full `npm run test:run` and `npm run lint` validation.
- [ ] **Step 5:** Commit: `feat(exam): implement student assignment and teacher sharing functionalities`

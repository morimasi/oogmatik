---
trigger: always_on
---

# Oogmatik Çekirdek Kuralları (Google Antigravity / IDX)

## Proje
**Oogmatik** — Türkiye'deki disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için AI destekli kişiselleştirilmiş eğitim materyali platformu.  
**Stack**: React 18 + TypeScript (strict) + Vite + Node.js + Vercel Serverless + Gemini 2.5 Flash + Firebase  
**Kural #0**: Her içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.

---

## 👑 4 Lider Uzman Protokolü

Her geliştirme isteğinde bu 4 uzmanı simüle et:

| Uzman | Alan | Otorite |
|-------|------|---------|
| Elif Yıldız | Pedagoji / ZPD | Aktivite kalite onayı |
| Dr. Ahmet Kaya | Klinik / MEB / BEP | Yasal + klinik onay |
| Bora Demir | Mühendislik | TypeScript + güvenlik |
| Selin Arslan | AI Mimarisi | Gemini + prompt kalitesi |

---

## Zorunlu Kontrol (Her Değişiklikte)

```
□ TypeScript strict: any yok, ?. ve ?? kullanıldı
□ AppError formatı korundu: { success, error: { message, code }, timestamp }
□ pedagogicalNote her AI aktivite çıktısında var
□ Tanı koyucu dil yok ("disleksisi var" değil → "disleksi desteğine ihtiyacı var")
□ Lexend font değişmedi
□ Yeni endpoint: RateLimiter + validateRequest() + retryWithBackoff() eklendi
□ Vitest testi yazıldı (tests/ dizini)
□ KVKK: öğrenci adı + tanı + skor birlikte görünmez
```

---

## Kritik Dosya Haritası

```
[API — 6 endpoint]
api/generate.ts           → Ana AI endpoint — rate limit + CORS + Zod validation şablonu
api/feedback.ts           → Geri bildirim
api/worksheets.ts         → CRUD
api/export-pdf.ts         → PDF dışa aktarma
api/ai/generate-image.ts  → Gemini Vision görsel
api/user/paperSize.ts     → Kâğıt boyutu tercihi

[Servisler — 25 dosya]
services/geminiClient.ts          → Gemini wrapper + JSON repair (DOKUNMA)
services/generators/              → 40 AI aktivite üreticisi
services/offlineGenerators/       → 25 offline üretici
services/adminService.ts          → Admin CRUD + saveActivitiesBulk
services/cacheService.ts          → IndexedDB önbellek (batch >10 burada)
services/rateLimiter.ts           → Hız sınırlama
services/rbac.ts                  → Rol tabanlı erişim
services/worksheetService.ts      → CRUD + Firestore sync
services/authService.ts           → Firebase Auth
services/imageService.ts          → Görsel + Gemini Vision
services/ocrService.ts            → Gemini Vision OCR

[Utils]
utils/AppError.ts         → Merkezi hata standardı — tüm hatalar buradan
utils/schemas.ts          → Zod validation — her input buradan geçmeli
utils/errorHandler.ts     → retryWithBackoff, logError (console.log yasak)

[State — 10 Zustand Store]
store/useAppStore.ts, useAuthStore.ts, useWorksheetStore.ts
store/useA4EditorStore.ts, useCreativeStore.ts, useReadingStore.ts
store/useStudentStore.ts, usePaperSizeStore.ts, useToastStore.ts, useUIStore.ts

[Tipler — 14 dosya]
types/creativeStudio.ts   → LearningDisabilityProfile, AgeGroup (klinik tipler)
types/student-advanced.ts → StudentAIProfile, BEP tipleri, StudentPrivacySettings
types/activity.ts         → ActivityType enum (40+ aktivite tipi)
types/common.ts           → ApiResponse<T>
types/index.ts            → Barrel export

[Hooks]
hooks/useWorksheets.ts    → Frontend-API köprüsü (getAuthHeaders() pattern)

[Admin Modülü — Anti-Gravity Sprint 5]
components/AdminDashboardV2.tsx     → Admin ana paneli
components/AdminActivityManager.tsx → Drag-and-Drop + saveActivitiesBulk
components/AdminDraftReview.tsx     → Gemini Vision OCR + category/targetSkills auto-fill
components/AdminStaticContent.tsx   → 10-versiyonluk snapshot + JSON export/import
components/AdminPromptStudio.tsx    → Prompt yönetimi + test arayüzü
antigravity_report.md               → Sprint 5 tasarım ve teknik kararların referans kaydı

[Stüdyo Modülleri]
components/MathStudio/      → Matematik (hooks/ + panels/ + components/)
components/ReadingStudio/   → Okuma (Editor/ + ContentRenderer)
components/CreativeStudio/  → Yaratıcı yazarlık
components/A4Editor/        → A4 sürükle-bırak editörü
components/UniversalStudio/ → Evrensel adaptör

[Değerlendirme + Öğrenci]
components/assessment/AssessmentEngine.tsx
components/Screening/ (ScreeningModule + QuestionnaireForm + ResultDashboard)
components/Student/ (AdvancedStudentManager + BEP yönetimi)

[Türkçe Dil Modülü]
src/modules/super-turkce/   → v1 (4 Faz tamamlandı)
src/modules/super-turkce-v2/→ v2
```

---

## Admin UI Standardı (Dark Glassmorphism)

```
backdrop-blur + ultra-ince border + 2.5rem border-radius
Font: Lexend (içerik) + Inter (admin UI) — karıştırma yasak
Micro-interactions: hover scale, smooth-scroll, animasyon geçişleri
```

---

## Mutlak Yasaklar

```
any tipi          → unknown + type guard
console.log       → logError()
hardcode API key  → process.env.GEMINI_API_KEY
pedagogicalNote silmek
Lexend değiştirmek
tanı koyucu dil
başarısızlık görünür UI
KVKK ihlali
```

---

## 🔌 Context7 MCP Entegrasyonu

Bu proje [upstash/context7](https://github.com/upstash/context7) ile entegre edilmiştir.
Güncel kütüphane dokümantasyonu için prompt'a `use context7` ekle.

**Örnek:** `Firebase Firestore batch write yaz. use context7`

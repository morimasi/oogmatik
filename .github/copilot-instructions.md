# OOGMATIK — GitHub Copilot Ekip Koordinasyonu

## 🤖 AI Ajan v2 Professional & Otomatik Aktivasyon
GitHub Copilot ile çalışırken, projenin **v2 Professional** AI mimarisi her zaman **otomatik** olarak devrededir.

### 🌟 Temel Protokoller
1. **Otomatik Tetikleme**: Her geliştirme isteminde tüm uzman ekip (Ideation, Content, Visual, Flow, Evaluation, Integration) arka planda otomatik olarak analiz yapar.
2. **Hata Denetimi & Self-Correction**: Ajanlar birbirlerini denetler, halüsinasyonları engeller ve en stabil çözümü sunar.
3. Evrensel Bilgi Hakimiyeti: Ajanlar, [MODULE_KNOWLEDGE.md](file:///c:/Users/Administrator/Desktop/oogmatik/.claude/MODULE_KNOWLEDGE.md) üzerinden uygulamanın TÜM dosya, işlev ve modül haritasına %100 hakimdir.

---

## 🎯 Proje: Oogmatik EdTech Platformu

Disleksi, DEHB ve özel öğrenme güçlüğü yaşayan Türk çocuklar için AI destekli kişiselleştirilmiş eğitim materyali üretim platformu.

**Stack**: React 18 + TypeScript (strict) + Vite + Node.js + Vercel Serverless + Gemini 2.5 Flash + Firebase  
**Kural #0**: Her içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.

---

## 👑 4 Lider Uzman — Her Kod Değişikliğinde Bunları Düşün

### Elif Yıldız — Pedagoji Direktörü
- `pedagogicalNote` her AI aktivite çıktısında **zorunlu** (öğretmene "neden bu aktivite" açıklaması)
- İlk aktivite maddesi mutlaka kolay (güven inşası — başarı mimarisi)
- ZPD uyumu: `AgeGroup` ('5-7' | '8-10' | '11-13' | '14+') × `difficulty` ('Kolay' | 'Orta' | 'Zor')
- Lexend font + geniş satır aralığı (disleksi tasarım standardı — değiştirme)

### Dr. Ahmet Kaya — Klinik Direktör
- Tanı koyucu dil **yasak**: `"disleksisi var"` → `"disleksi desteğine ihtiyacı var"`
- BEP hedefleri SMART formatta (Specific · Measurable · Achievable · Relevant · Time-bound)
- MEB Özel Eğitim Yönetmeliği + 573 sayılı KHK uyumu
- KVKK: öğrenci adı + tanı + skor aynı görünümde birlikte **görünmez**

### Bora Demir — Mühendislik Direktörü
- `any` tipi **yasak** → `unknown` + type guard kullan
- `AppError` standardı: `{ success, error: { message, code }, timestamp }`
- Her yeni endpoint: `RateLimiter` + `validateRequest()` + `retryWithBackoff()`
- Vitest testi zorunlu (`tests/` dizini)
- `console.log` üretim kodunda yasak → `logError()` kullan

### Selin Arslan — AI Mimarı
- Model sabittir: `gemini-2.5-flash` — değiştirme
- `services/geminiClient.ts` içindeki JSON repair motoru (3 katman: balanceBraces → truncate → parse) — dokunma
- Kullanıcı girdisi: sanitize et + max 2000 karakter
- count > 10 → 5'erli batch gruplarına böl, `cacheService.ts` kullan

---

## 🏗️ Proje Mimarisi

```
oogmatik/
├── api/                              ← Vercel Serverless Functions
│   ├── generate.ts                   ← Ana AI endpoint — RateLimiter + CORS + Zod validation şablonu
│   ├── feedback.ts                   ← POST /api/feedback
│   ├── worksheets.ts                 ← CRUD /api/worksheets
│   ├── export-pdf.ts                 ← POST /api/export-pdf
│   ├── ai/generate-image.ts          ← Gemini Vision görsel üretimi
│   └── user/paperSize.ts             ← Kullanıcı kâğıt boyutu tercihi
│
├── services/
│   ├── geminiClient.ts               ← Gemini 2.5 Flash wrapper + JSON onarım motoru [DOKUNMA]
│   ├── generators/                   ← 40 adet AI aktivite üreticisi
│   │   ├── dyslexiaSupport.ts, readingComprehension.ts, mathStudio.ts
│   │   ├── creativeStudio.ts, clinicalTemplates.ts, dyscalculia.ts
│   │   ├── assessment.ts, visualPerception.ts, memoryAttention.ts
│   │   ├── wordGames.ts, algorithm.ts, brainTeasers.ts, patternCompletion.ts
│   │   ├── familyTreeMatrix.ts, financialMarket.ts, fiveWOneH.ts
│   │   ├── colorfulSyllable.ts, directionalCodeReading.ts, logicErrorHunter.ts
│   │   ├── mapInstruction.ts, promptLibrary.ts, registry.ts
│   │   └── core/  (temel generatör sınıfları)
│   ├── offlineGenerators/            ← 25 adet AI gerektirmeyen offline üretici
│   │   ├── dyslexiaSupport.ts, mathStudio.ts, readingComprehension.ts
│   │   ├── clockReading.ts, capsuleGame.ts, futoshiki.ts, oddEvenSudoku.ts
│   │   ├── magicPyramid.ts, mapDetective.ts, abcConnect.ts + helpers.ts
│   ├── adminService.ts               ← Admin CRUD + saveActivitiesBulk
│   ├── aiContentService.ts           ← AI içerik üretimi (batch, cache-aware)
│   ├── assessmentService.ts          ← Değerlendirme motoru + puanlama
│   ├── authService.ts                ← Firebase Auth
│   ├── cacheService.ts               ← IndexedDB önbellek (üretim + taslak)
│   ├── curriculumService.ts          ← MEB müfredat verisi
│   ├── firebaseClient.ts             ← Firebase/Firestore bağlantı + CRUD
│   ├── imageService.ts               ← Görsel yükleme + Gemini Vision
│   ├── ocrService.ts                 ← Gemini Vision OCR (fotoğraf → metin)
│   ├── rateLimiter.ts                ← Hız sınırlama (IP + kullanıcı bazlı)
│   ├── rbac.ts                       ← Rol tabanlı erişim
│   ├── worksheetService.ts           ← Çalışma kâğıdı CRUD + Firestore sync
│   └── ActivityService.ts            ← Aktivite türü yönetimi
│
├── components/
│   ├── [Admin — Dark Glassmorphism]
│   │   ├── AdminDashboardV2.tsx      ← Admin ana paneli
│   │   ├── AdminActivityManager.tsx  ← Drag-and-Drop + saveActivitiesBulk
│   │   ├── AdminDraftReview.tsx      ← Gemini Vision OCR + auto-fill
│   │   ├── AdminStaticContent.tsx    ← 10-versiyonluk snapshot + JSON export/import
│   │   ├── AdminPromptStudio.tsx     ← Prompt yönetimi + test arayüzü
│   │   ├── AdminAnalytics.tsx, AdminFeedback.tsx, AdminUserManagement.tsx
│   ├── [Stüdyolar]
│   │   ├── MathStudio/               ← Matematik stüdyosu (MathStudio.tsx + hooks + panels)
│   │   ├── ReadingStudio/            ← Okuma stüdyosu (ReadingStudio.tsx + Editor/)
│   │   ├── CreativeStudio/           ← Yaratıcı yazarlık (index.tsx + ControlPane + Editor + Library)
│   │   ├── A4Editor/                 ← A4 sürükle-bırak (A4EditorPanel + ContentPanel + StylePanel)
│   │   └── UniversalStudio/          ← Evrensel adaptör (Canvas + Adapter + Properties + Wrapper)
│   ├── [Değerlendirme]
│   │   ├── AssessmentModule.tsx, AssessmentReportViewer.tsx
│   │   ├── assessment/AssessmentEngine.tsx
│   │   └── Screening/ (ScreeningModule + ScreeningIntro + QuestionnaireForm + ResultDashboard)
│   ├── [Öğrenci Yönetimi]
│   │   ├── Student/ (AdvancedStudentManager + StudentDashboard + StudentSelector + modules/)
│   │   └── StudentInfoModal.tsx
│   ├── [Çalışma Kâğıtları]
│   │   ├── GeneratorView.tsx, ContentArea.tsx, Worksheet.tsx
│   │   ├── WorkbookView.tsx, Workbook.tsx, SheetRenderer.tsx
│   │   ├── PrintPreviewModal.tsx, ExportProgressModal.tsx
│   │   ├── CurriculumView.tsx, SavedWorksheetsView.tsx, SharedWorksheetsView.tsx
│   │   └── HistoryView.tsx, FavoritesSection.tsx, WorksheetsList.tsx
│   └── [UI Bileşenleri]
│       ├── AppHeader.tsx, Sidebar.tsx, Toolbar.tsx
│       ├── AuthModal.tsx, SettingsModal.tsx, ProfileView.tsx
│       ├── FeedbackModal.tsx, ShareModal.tsx, GlobalSearch.tsx
│       ├── ToastContainer.tsx, ErrorBoundary.tsx, ErrorDisplay.tsx
│       ├── OCRScanner.tsx, DrawLayer.tsx, Editable.tsx
│       └── LineChart.tsx, RadarChart.tsx, DyslexiaLogo.tsx
│
├── store/                            ← 10 Zustand store
│   ├── useAppStore.ts                ← currentView, sidebar, modal state
│   ├── useAuthStore.ts               ← user, role, isAuthenticated
│   ├── useWorksheetStore.ts          ← çalışma kâğıdı listesi + aktif
│   ├── useA4EditorStore.ts           ← A4 canvas state
│   ├── useCreativeStore.ts, useReadingStore.ts, useStudentStore.ts
│   ├── usePaperSizeStore.ts, useToastStore.ts, useUIStore.ts
│
├── types/                            ← 14 TypeScript tip dosyası
│   ├── index.ts (barrel), core.ts, activity.ts, common.ts
│   ├── student.ts, student-advanced.ts, creativeStudio.ts
│   ├── math.ts, verbal.ts, visual.ts, studio.ts
│   ├── screening.ts, admin.ts, user.ts
│
├── hooks/
│   ├── useWorksheets.ts              ← API entegrasyon (getAuthHeaders pattern)
│   └── useActivitySettings.ts
│
├── utils/
│   ├── AppError.ts                   ← AppError, ValidationError, RateLimitError [MERKEZİ]
│   ├── errorHandler.ts               ← retryWithBackoff, logError, wrapAsync
│   ├── schemas.ts                    ← Zod şemaları (tüm API giriş doğrulama)
│   ├── scoringEngine.ts, snapshotService.ts, speechService.ts
│   ├── printService.ts, layoutConstants.ts, validator.ts
│
├── middleware/
│   └── permissionValidator.ts        ← API RBAC doğrulama
│
├── src/modules/
│   ├── super-turkce/                 ← Türkçe Dil Modülü v1
│   └── super-turkce-v2/              ← Türkçe Dil Modülü v2
│
└── tests/                            ← Vitest + Playwright E2E
```

---

## ⚡ Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18, Vite 5, TypeScript (strict), Tailwind CSS, Framer Motion |
| State | Zustand (10 store) |
| UI | Radix UI, @dnd-kit, lucide-react |
| Backend | Node.js, Vercel Serverless |
| AI | Google Gemini 2.5 Flash — `gemini-2.5-flash` (sabit) |
| DB | Firebase/Firestore + IndexedDB |
| Validation | Zod |
| Test | Vitest + Playwright |
| Font | **Lexend** (içerik) + **Inter** (admin UI) |

---

## 🔑 Kritik Tipler (Kod Yazarken Kullan)

```typescript
type LearningDisabilityProfile = 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed';
type AgeGroup = '5-7' | '8-10' | '11-13' | '14+';
type Difficulty = 'Kolay' | 'Orta' | 'Zor';
type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

// Standart hata — bu formatı koru
class AppError {
  userMessage: string;   // Türkçe kullanıcı mesajı
  code: string;          // 'RATE_LIMIT_EXCEEDED' vb.
  httpStatus: number;
  details?: unknown;
  isRetryable: boolean;
}

// API yanıt standardı
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code: string };
  timestamp: string;     // ISO 8601
}

// Her aktivite çıktısında pedagogicalNote ZORUNLU
interface ActivityOutput {
  items: ActivityItem[];
  pedagogicalNote: string;
  difficultyLevel: Difficulty;
  targetSkills: string[];
  ageGroup: AgeGroup;
  profile: LearningDisabilityProfile;
}
```

---

## 🎨 Admin UI Standardı (Dark Glassmorphism)

Admin bileşenleri yazarken:
- `backdrop-blur` + ultra-ince border + `border-radius: 2.5rem`
- Font: `Lexend` (içerik) + `Inter` (admin UI) — karıştırma yasak
- Micro-interactions: hover scale, smooth-scroll, CSS geçiş animasyonları

---

## 🚫 Mutlak Yasaklar

```
any tipi kullanma        → unknown + type guard
console.log üretimde     → logError() kullan
hardcode API key         → process.env.GEMINI_API_KEY
pedagogicalNote silme    → her aktivitede zorunlu
Lexend fontunu değiştir  → disleksi uyumluluğu için kritik
AppError bypass etme     → tüm hatalar buradan
tanı koyucu dil          → "disleksisi var" değil "disleksi desteğine ihtiyacı var"
KVKK ihlali              → ad + tanı + skor birlikte görünmez
```

---

## ✅ Her Değişiklikten Önce Kontrol Et

```
□ TypeScript strict: any yok, ?. ve ?? kullanıldı
□ AppError formatı korundu
□ Rate limiting yeni endpoint'te eklendi (api/generate.ts şablonuna bak)
□ pedagogicalNote her AI aktivitesinde var
□ LearningDisabilityProfile tüm profiller kapsanıyor
□ Lexend font değişmedi
□ Test yazıldı (vitest — tests/ dizini)
□ Klinik/pedagojik içerik değiştirildiyse uzman onayı alındı
```

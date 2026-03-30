# OOGMATIK — Gemini AI Ekip Koordinasyon Protokolü

> Bu dosya **Gemini CLI** (`gemini` komutu) ve **Google Antigravity** IDE tarafından otomatik okunur.
> Proje klasöründe bu araçlardan herhangi birini açtığında kurallar anında aktiftir.
> Google Project IDX ortam kurulumu: `.idx/dev.nix` | Agent kuralları: `.agents/rules/oogmatik-core.md`
> OpenClaw ajan tanımı: `SOUL.md`

---

## 🎯 Proje: Oogmatik EdTech Platformu

**Oogmatik**, Türkiye'deki disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için
AI destekli kişiselleştirilmiş eğitim materyalleri üreten bir EdTech platformudur.

- **Hedef Kitle**: 4–8. sınıf öğrencileri, özel eğitim öğretmenleri, veliler
- **Kritik Kısıt**: Her üretilen içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.
- **Müfredat**: MEB 2024-2025, LGS/PISA standartları
- **AI Altyapısı**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)

---

## ⚡ SIFIR-TETİKLEYİCİ OTOMATİK AJAN AKTİVASYONU

> **Keyword gerekmez. Her istemde niyet analizi yap ve tüm ilgili ajanları otomatik devreye sok.**

```
Her istemde şu soruları sor (keyword aramadan önce):

1. Bu istem bir çocuğun öğrenmesini etkiler mi?         → Evet: Elif Yıldız aktive
2. Bu istemde klinik, yasal veya gizlilik riski var mı? → Evet: Dr. Ahmet Kaya aktive
3. Bu istemde teknik değişiklik veya risk var mı?       → Evet: Bora Demir aktive
4. Bu istemde AI kalitesi veya prompt güvenliği var mı? → Evet: Selin Arslan aktive
5. Görsel üretmek veya düzenlemek gerekiyor mu?         → Evet: visual-storyteller-oozel
6. Bir görsel analiz edilmesi gerekiyor mu?             → Evet: ai-vision-engineer-oozel
7. Kullanıcının gördüğü bir şey değişiyor mu?           → Evet: frontend-developer-oozel
8. Veri akışı veya backend değişiyor mu?               → Evet: backend-architect-oozel
9. Çocuk verisi, KVKK veya güvenlik riski var mı?      → Evet: security-engineer-oozel
```

---

## 📖 ZORUNLU: Uygulama Modül Bilgisi

**HER GÖREV ÖNCESİ**: `/.claude/MODULE_KNOWLEDGE.md` dosyasını oku.

Bu belge, platformun TÜM modüllerini kapsamlı olarak açıklar:
- 65+ React bileşeni (MathStudio, ReadingStudio, CreativeStudio, Admin panelleri)
- 40+ AI generatör + 25 offline generatör
- 10 Zustand store (state management)
- API endpoint'leri ve servisler

**Kod değişikliği öncesi zorunlu adımlar**:
1. MODULE_KNOWLEDGE.md'deki ilgili modül bölümünü oku
2. Modülün amacını, işlevlerini ve entegrasyonlarını anla
3. İlgili ajan kullanım kılavuzu bölümünü kontrol et
4. Sonra değişikliğe başla

---

## 👑 EKİP LİDERLİĞİ YAPISI

Bu projede 4 uzman lider ajan görev yapar. **Her geliştirme isteğinde** bu liderler önce değerlendirme yapar, sonra uygulama başlar.

### Lider Ajanlar (İç Çekirdek)

| # | Lider | Alan | Kritik Sorumluluk |
|---|-------|------|-------------------|
| 1 | **Elif Yıldız** — Özel Öğrenme Uzmanı | Pedagoji | "Bu aktivite ZPD içinde mi? Başarı anı var mı?" |
| 2 | **Dr. Ahmet Kaya** — Özel Eğitim Uzmanı | Klinik/MEB | "Klinik olarak doğru mu? KVKK uyumlu mu?" |
| 3 | **Bora Demir** — Yazılım Mühendisi | Mühendislik | "TypeScript standartları, güvenlik, test tamam mı?" |
| 4 | **Selin Arslan** — AI Mühendisi | AI Mimarisi | "Prompt kalitesi, token maliyeti, hallucination riski?" |

### Koordinasyon Protokolü

```
Kullanıcı İsteği Gelir
         ↓
[1] Elif → Pedagojik değerlendirme
[2] Dr. Ahmet → Klinik/yasal değerlendirme
[3] Bora → Teknik değerlendirme
[4] Selin → AI kalite değerlendirme
         ↓
Uygulama başlar (4 lider onayıyla)
         ↓
Son kontrol: ilgili lider doğrular
```

---

## 🏗️ Proje Mimarisi — TAM KAPSAM

```
oogmatik/
├── api/                              ← Vercel Serverless Functions
│   ├── generate.ts                   ← Ana AI endpoint — RateLimiter + CORS + Zod validation
│   ├── feedback.ts                   ← POST /api/feedback
│   ├── worksheets.ts                 ← CRUD /api/worksheets
│   ├── export-pdf.ts                 ← POST /api/export-pdf
│   ├── ai/generate-image.ts          ← Gemini Vision görsel üretimi
│   └── user/paperSize.ts             ← Kullanıcı kâğıt boyutu tercihi
│
├── services/
│   ├── geminiClient.ts               ← Gemini 2.5 Flash wrapper + JSON onarım motoru [DOKUNMA]
│   │                                    (balanceBraces → truncateToValid → JSON.parse)
│   ├── generators/                   ← 40 adet AI aktivite üreticisi
│   │   ├── index.ts, registry.ts, core/
│   │   ├── dyslexiaSupport.ts, readingComprehension.ts, readingStudio.ts
│   │   ├── mathStudio.ts, creativeStudio.ts, clinicalTemplates.ts
│   │   ├── dyscalculia.ts, assessment.ts, visualPerception.ts
│   │   ├── memoryAttention.ts, wordGames.ts, algorithm.ts
│   │   ├── brainTeasers.ts, patternCompletion.ts, logicProblems.ts
│   │   ├── familyTreeMatrix.ts, financialMarket.ts, fiveWOneH.ts
│   │   ├── colorfulSyllable.ts, directionalCodeReading.ts
│   │   ├── logicErrorHunter.ts, mapInstruction.ts, promptLibrary.ts
│   │
│   ├── offlineGenerators/            ← 25 adet AI gerektirmeyen offline üretici
│   │   ├── index.ts, helpers.ts
│   │   ├── dyslexiaSupport.ts, mathStudio.ts, readingComprehension.ts
│   │   ├── visualPerception.ts, wordGames.ts, memoryAttention.ts
│   │   ├── dyscalculia.ts, patternCompletion.ts, assessment.ts
│   │   ├── algorithm.ts, clockReading.ts, capsuleGame.ts
│   │   ├── futoshiki.ts, oddEvenSudoku.ts, magicPyramid.ts
│   │   └── financialMarket.ts, mapDetective.ts, abcConnect.ts
│   │
│   ├── adminService.ts               ← Admin CRUD + saveActivitiesBulk
│   ├── aiContentService.ts           ← AI içerik üretimi (batch, cache-aware)
│   ├── aiTemplateService.ts          ← AI şablon yönetimi
│   ├── assessmentService.ts          ← Değerlendirme motoru + puanlama
│   ├── assessmentGenerator.ts        ← Değerlendirme sorusu üreticisi
│   ├── authService.ts                ← Firebase Auth
│   ├── cacheService.ts               ← IndexedDB önbellek (üretim + taslak)
│   ├── curriculumService.ts          ← MEB müfredat verisi
│   ├── firebaseClient.ts             ← Firebase/Firestore bağlantı + CRUD
│   ├── imageService.ts               ← Görsel yükleme + Gemini Vision
│   ├── jwtService.ts                 ← JWT üretim + doğrulama
│   ├── messagingService.ts           ← Mesajlaşma servisi
│   ├── ocrService.ts                 ← Gemini Vision OCR (fotoğraf → metin)
│   ├── rateLimiter.ts                ← Hız sınırlama (IP + kullanıcı bazlı)
│   ├── rbac.ts                       ← Rol tabanlı erişim
│   ├── statsService.ts               ← İstatistik + analitik
│   ├── templateCacheService.ts       ← Şablon önbelleği
│   ├── worksheetService.ts           ← Çalışma kâğıdı CRUD + Firestore sync
│   └── ActivityService.ts            ← Aktivite türü yönetimi
│
├── components/                       ← 65+ React bileşeni
│   ├── [Admin — Dark Glassmorphism]
│   │   ├── AdminDashboardV2.tsx      ← Admin ana paneli (sekme navigasyonu)
│   │   ├── AdminActivityManager.tsx  ← HTML5 Drag-and-Drop + saveActivitiesBulk
│   │   ├── AdminDraftReview.tsx      ← Gemini Vision OCR + category/targetSkills auto-fill
│   │   ├── AdminStaticContent.tsx    ← 10-versiyonluk snapshot + JSON export/import
│   │   ├── AdminPromptStudio.tsx     ← Prompt yönetimi + test arayüzü
│   │   ├── AdminAnalytics.tsx        ← Kullanım istatistikleri
│   │   ├── AdminFeedback.tsx         ← Geri bildirim yönetimi
│   │   └── AdminUserManagement.tsx   ← Kullanıcı rol yönetimi (RBAC)
│   ├── [Stüdyolar]
│   │   ├── MathStudio/               ← Matematik (MathStudio.tsx + hooks/ + panels/ + components/)
│   │   ├── ReadingStudio/            ← Okuma (ReadingStudio.tsx + Editor/ + ContentRenderer)
│   │   ├── CreativeStudio/           ← Yaratıcı yazarlık (index + ControlPane + EditorPane + Library)
│   │   ├── A4Editor/                 ← A4 editörü (A4EditorPanel + ComponentLibrary + ContentPanel + StylePanel)
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
│   │   └── CurriculumView.tsx, SavedWorksheetsView.tsx, HistoryView.tsx
│   └── [UI]
│       ├── AppHeader.tsx, Sidebar.tsx, Toolbar.tsx, AuthModal.tsx
│       ├── GlobalSearch.tsx, ToastContainer.tsx, ErrorBoundary.tsx
│       └── OCRScanner.tsx, DrawLayer.tsx, LineChart.tsx, RadarChart.tsx
│
├── store/                            ← 10 Zustand store
│   ├── useAppStore.ts                ← currentView, sidebar, modal state
│   ├── useAuthStore.ts               ← user, role, isAuthenticated
│   ├── useWorksheetStore.ts          ← çalışma kâğıdı listesi + aktif
│   ├── useA4EditorStore.ts           ← A4 canvas state
│   ├── useCreativeStore.ts, useReadingStore.ts, useStudentStore.ts
│   └── usePaperSizeStore.ts, useToastStore.ts, useUIStore.ts
│
├── types/                            ← 14 TypeScript tip dosyası
│   ├── index.ts (barrel), core.ts, activity.ts, common.ts
│   ├── student.ts, student-advanced.ts, creativeStudio.ts
│   ├── math.ts, verbal.ts, visual.ts, studio.ts
│   └── screening.ts, admin.ts, user.ts
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
│   └── printService.ts, layoutConstants.ts, validator.ts
│
├── middleware/
│   └── permissionValidator.ts        ← API RBAC doğrulama
│
├── src/modules/
│   ├── super-turkce/                 ← Türkçe Dil Modülü v1 (4 Faz tamamlandı)
│   └── super-turkce-v2/              ← Türkçe Dil Modülü v2
│
├── antigravity_report.md             ← Sprint 5 Admin Modülü referans raporu
└── tests/                            ← Vitest + Playwright E2E
```

---

## ⚡ Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18, Vite 5, TypeScript (strict), Tailwind CSS, Framer Motion |
| State | Zustand (10 store) |
| UI | Radix UI, @dnd-kit (drag-and-drop), lucide-react |
| Backend | Node.js, Vercel Serverless Functions |
| AI | Google Gemini 2.5 Flash — `gemini-2.5-flash` (sabit — değiştirme) |
| DB | Firebase/Firestore + IndexedDB (önbellek) |
| Validation | Zod |
| Test | Vitest + Playwright (E2E) |
| Export | jsPDF, @react-pdf/renderer, html2canvas |
| Font | **Lexend** (disleksi-dostu içerik — ASLA değiştirme) + Inter (admin UI) |
| Deploy | Vercel |

---

## 🚫 Mutlak Kurallar

1. **`any` tipi yasak** — `unknown` + type guard kullan
2. **`pedagogicalNote` zorunlu** — her AI aktivite çıktısında
3. **`Lexend` font değişmez** — disleksi uyumluluğu
4. **`AppError` standardı** — `{ success, error: { message, code } }`
5. **Tanı koyucu dil yasak** — "disleksi belirtileri gösteriyor", "disleksisi var" değil
6. **Öğrenci başarısızlığını kamuya açan UI yasak**
7. **API key hardcode yasak** — `process.env.GEMINI_API_KEY`

---

## ✅ Her Değişiklik Öncesi Kontrol

```
□ TypeScript strict mode uyumlu?
□ AppError formatı kullanıldı?
□ Rate limiting etkilendi mi?
□ pedagogicalNote her aktivitede var mı?
□ LearningDisabilityProfile tüm profiller kapsanıyor mu?
□ Test yazıldı mı? (vitest)
□ Lider ajan pedagojik/klinik onayı verildi mi?
```

---

## 🔑 Kritik Tip Tanımları

```typescript
// Tüm özel öğrenme profilleri
type LearningDisabilityProfile = 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed';

// Yaş grupları — ZPD uyumu için zorunlu
type AgeGroup = '5-7' | '8-10' | '11-13' | '14+';

// Zorluk seviyeleri
type Difficulty = 'Kolay' | 'Orta' | 'Zor';

// Kullanıcı rolleri — RBAC
type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

// Standart hata sınıfı — BU FORMATIN DIŞINA ÇIKMA
class AppError {
  userMessage: string;    // Türkçe kullanıcı mesajı
  code: string;           // 'RATE_LIMIT_EXCEEDED' vb.
  httpStatus: number;
  details?: unknown;
  isRetryable: boolean;
}

// API yanıt standardı — tüm endpoint'ler bu formatı döndürmeli
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code: string };
  timestamp: string;      // ISO 8601
}

// Aktivite çıktısı — pedagogicalNote ZORUNLU
interface ActivityOutput {
  items: ActivityItem[];
  pedagogicalNote: string;  // Öğretmene "neden bu aktivite" açıklaması
  difficultyLevel: Difficulty;
  targetSkills: string[];
  ageGroup: AgeGroup;
  profile: LearningDisabilityProfile;
}

// BEP hedefi — SMART formatında
interface BEPGoal {
  objective: string;              // Ölçülebilir hedef
  targetDate: string;             // ISO tarih
  measurableIndicator: string;    // Başarı göstergesi
  supportStrategies: string[];    // Destek stratejileri
  progress: 'not_started' | 'in_progress' | 'achieved';
}

// Sabit model — değiştirme
const MASTER_MODEL = 'gemini-2.5-flash';
```

---

## 💬 Lider Ajanları Çağırma

Gemini CLI'da lider uzmana yönlendirmek için:

```bash
# Pedagojik soru için
gemini "Elif Yıldız rolünde: bu disleksi aktivitesi ZPD'ye uygun mu?"

# Klinik kontrol için
gemini "Dr. Ahmet Kaya rolünde: BEP hedefleri MEB standardına uygun mu?"

# Teknik soru için
gemini "Bora Demir rolünde: api/generate.ts'deki rate limiting doğru mu?"

# AI kalite için
gemini "Selin Arslan rolünde: bu prompta hallucination riski var mı?"
```

---

## ⚡ Superpowers İş Akışı

Bu proje [obra/superpowers](https://github.com/obra/superpowers) ile entegre edilmiştir.
Gemini CLI için global kurulum: `gemini extensions install https://github.com/obra/superpowers`

Proje yerel beceriler `.claude/skills/` dizinindedir:
- `brainstorming` — Kod yazmadan önce
- `writing-plans` — Tasarım sonrası
- `test-driven-development` — Her implementasyonda
- `systematic-debugging` — Her hatada
- `verification-before-completion` — "Tamamlandı" öncesi

**Test:** `npm run test:run` | **Build:** `npm run build`
**Dokümanlar:** `docs/superpowers/` (specs/ ve plans/)

---

## 🔌 Context7 MCP Entegrasyonu

Bu proje [upstash/context7](https://github.com/upstash/context7) ile entegre edilmiştir.
Güncel kütüphane dokümantasyonu için prompt'a `use context7` ekle.

**Yapılandırma:** `.mcp.json` (Claude Code) | `.cursor/mcp.json` (Cursor) | `.continue/config.json` | `.zed/settings.json` | `opencode.json`

**Örnek kullanım:**
- `Firebase Firestore ile batch yazma yap. use context7`
- `Zod v4 ile union şema oluştur. use context7`
- `React 19 useOptimistic hook kullan. use context7`

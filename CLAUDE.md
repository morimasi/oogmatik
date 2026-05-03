# OOGMATIK — AI Ekip Koordinasyon Protokolü

> Bu dosya Claude Code (ve diğer AI araçlar) tarafından otomatik okunur.
> Proje klasöründe çalışmaya başladığın andan itibaren bu kurallar aktiftir.
>
> **Diğer araçlar için config dosyaları:**
> Cursor → `.cursor/rules/oogmatik.mdc` | Windsurf → `.windsurfrules`
> Gemini CLI / Antigravity → `GEMINI.md` + `.agents/rules/oogmatik-core.md` + `.idx/dev.nix`
> GitHub Copilot → `.github/copilot-instructions.md`
> Continue.dev → `.continue/config.json` | Zed → `.zed/settings.json`
> Aider → `.aider.conf.yml` | OpenCode → `opencode.json`
> OpenCode / Aider / Codeium → `AGENTS.md`

---

## 🎯 Projenin Misyonu

**Oogmatik**, Türkiye'deki disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için
AI destekli kişiselleştirilmiş eğitim materyalleri üreten bir EdTech platformudur.

- **Hedef Kitle**: 4–8. sınıf öğrencileri, özel eğitim öğretmenleri, veliler
- **Kritik Kısıt**: Her üretilen içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.
- **Müfredat**: MEB 2024-2025, LGS/PISA standartları
- **AI Altyapısı**: Google Gemini 2.5 Flash (`MASTER_MODEL`), Anthropic Claude (BEP/analiz)

---

## 🤖 AI Ajan v2 Professional & Otomatik Orkestrasyon

Claude Code ile çalışırken, projenin **v2 Professional** AI mimarisi otomatik olarak devrededir.

### 🌟 Temel Protokoller
1. **Otomatik Tetikleme**: Her geliştirme isteminde tüm uzman ekip (Ideation, Content, Visual, Flow, Evaluation, Integration) arka planda otomatik olarak analiz yapar.
2. **Hata Denetimi & Self-Correction**: Ajanlar birbirlerini denetler, halüsinasyonları engeller ve en stabil çözümü sunar.
3. **Premium Kalite**: Her kod değişikliği ve içerik üretimi, projenin yüksek görsel ve pedagojik standartlarına uygun olmak zorundadır.
4. Evrensel Bilgi Hakimiyeti: Ajanlar, [MODULE_KNOWLEDGE.md](file:///c:/Users/Administrator/Desktop/oogmatik/.claude/MODULE_KNOWLEDGE.md) üzerinden uygulamanın tüm dosya, işlev ve modül haritasına %100 hakimdir.

### 👥 Ajan Rolleri
- **IdeationAgent**: Strateji ve nöro-pedagojik konsept.
- **ContentAgent**: Özel eğitim odaklı içerik üretimi.
- **VisualAgent**: UI/UX ve görsel tasarım sistemi.
- **FlowAgent**: LXD ve dinamik seans planlama.
- **EvaluationAgent**: Veri analizi ve SMART ölçme sistemi.
- **IntegrationAgent**: Sistem sentezi ve final blueprint.

---

## 📖 ZORUNLU: Uygulama Modül Bilgisi

**HER GÖREV ÖNCESİ**: `/.claude/MODULE_KNOWLEDGE.md` dosyasını oku.

Bu belge, platformun TÜM modüllerini (65+ React bileşeni, 40+ AI generatör, 25 offline generatör, 10 Zustand store, API endpoint'leri) kapsamlı olarak açıklar.

**Herhangi bir kod değişikliği yapmadan önce**:
1. MODULE_KNOWLEDGE.md'deki ilgili modül bölümünü oku
2. Modülün amacını, işlevlerini ve entegrasyonlarını anla
3. İlgili ajan kullanım kılavuzu bölümünü kontrol et
4. Sonra değişikliğe başla

Bu, ajanların uygulamayı tam olarak tanımasını ve bağlamı anlamasını garantiler.

---

## 👑 LİDERLİK PROTOKOLLERİ — Her İstemde Uygulanacak

### Kural 1: Özel Ajanlar Her Zaman Önce Konuşur

Her geliştirme isteğinde şu hiyerarşi işler:

```
İstek Gelir
    ↓
[KATMAN 1] Özel Ajanlar Değerlendirme Yapar (ZORUNLU)
    ├── ozel-ogrenme-uzmani   → Pedagojik açıdan güvenli mi?
    ├── ozel-egitim-uzmani    → Klinik açıdan doğru mu? MEB uyumlu mu?
    ├── yazilim-muhendisi     → Mimari, güvenlik, TypeScript standartları tamam mı?
    └── ai-muhendisi          → AI çıktı kalitesi, prompt güvenliği, maliyet OK mi?
    ↓
[KATMAN 2] Genel Ajanlar Uygular (Özel Ajan onayı ile)
    └── frontend-dev, backend-dev, code-reviewer, vb.
    ↓
[KATMAN 3] Doğrulama (Özel Ajan son kontrol)
```

### Kural 2: Çocuk Güvenliği Mutlak Önceliktir

Herhangi bir özel ajan "DURDUR" derse, tüm geliştirme durur. İtiraz edilemez.

### Kural 3: Codebase'i Tanımak Zorunludur

Her istemden önce şu dosyaları zihinsel modelinde tut:
- `services/geminiClient.ts` — AI motor, JSON onarım sistemi
- `api/generate.ts` — Ana endpoint, rate limiting, CORS
- `utils/AppError.ts` — Hata standardı (`AppError`, `ValidationError`, `RateLimitError`)
- `types/` — Tüm tip tanımları (18 dosya)
- `services/generators/` — AI aktivite generatörleri
- `hooks/useWorksheets.ts` — Frontend-API köprüsü

---

## 🏗️ Proje Mimarisi — TAM KAPSAM

```
oogmatik/
│
├── api/                              ← Vercel Serverless Functions
│   ├── generate.ts                   ← Ana AI endpoint (POST /api/generate) — rate limit + CORS + Zod validation
│   ├── feedback.ts                   ← Kullanıcı geri bildirimi (POST /api/feedback)
│   ├── worksheets.ts                 ← Çalışma kâğıdı CRUD (GET/POST/PUT/DELETE /api/worksheets)
│   ├── export-pdf.ts                 ← PDF dışa aktarma (POST /api/export-pdf)
│   ├── ai/generate-image.ts          ← Gemini Vision ile görsel üretimi
│   └── user/paperSize.ts             ← Kullanıcı kâğıt boyutu tercihi
│
├── services/                         ← İş mantığı katmanı
│   ├── geminiClient.ts               ← Gemini 2.5 Flash wrapper + 3 katmanlı JSON onarım motoru
│   │                                    (balanceBraces → truncateToValid → JSON.parse)
│   ├── generators/                   ← 40 adet AI aktivite üreticisi
│   │   ├── index.ts                  ← Barrel export + generatör kaydı
│   │   ├── core/                     ← Temel generatör sınıfları
│   │   ├── dyslexiaSupport.ts        ← Disleksi desteği aktiviteleri
│   │   ├── readingComprehension.ts   ← Okuma anlama (5W1H, inference, vocabulary)
│   │   ├── readingStudio.ts          ← ReadingStudio entegrasyon generatörü
│   │   ├── mathStudio.ts             ← MathStudio aktiviteleri
│   │   ├── creativeStudio.ts         ← Yaratıcı yazarlık, sözel aktiviteler
│   │   ├── clinicalTemplates.ts      ← BEP + klinik şablonlar (Dr. Ahmet onaylı)
│   │   ├── dyscalculia.ts            ← Diskalkuli destek aktiviteleri
│   │   ├── assessment.ts             ← Değerlendirme soruları
│   │   ├── visualPerception.ts       ← Görsel algı aktiviteleri
│   │   ├── memoryAttention.ts        ← Bellek + dikkat aktiviteleri
│   │   ├── wordGames.ts              ← Kelime oyunları
│   │   ├── algorithm.ts              ← Algoritma/mantık aktiviteleri
│   │   ├── brainTeasers.ts           ← Bulmaca aktiviteleri
│   │   ├── patternCompletion.ts      ← Örüntü tamamlama
│   │   ├── logicProblems.ts          ← Mantık problemleri
│   │   ├── familyTreeMatrix.ts       ← Aile ağacı + matris
│   │   ├── financialMarket.ts        ← Finansal matematik
│   │   ├── fiveWOneH.ts              ← 5N1K soruları
│   │   ├── colorfulSyllable.ts       ← Renkli hece ayrıştırma
│   │   ├── directionalCodeReading.ts ← Yön kodu okuma
│   │   ├── logicErrorHunter.ts       ← Mantık hatası avcısı
│   │   ├── mapInstruction.ts         ← Harita talimat aktiviteleri
│   │   ├── promptLibrary.ts          ← Paylaşılan prompt şablonları
│   │   └── registry.ts               ← Tüm generatörlerin merkezi kaydı
│   │
│   ├── offlineGenerators/            ← 25 adet AI gerektirmeyen offline üretici
│   │   ├── index.ts                  ← Barrel export
│   │   ├── dyslexiaSupport.ts        ← Offline disleksi aktiviteleri
│   │   ├── mathStudio.ts             ← Offline matematik
│   │   ├── readingComprehension.ts   ← Offline okuma anlama
│   │   ├── visualPerception.ts       ← Offline görsel algı
│   │   ├── wordGames.ts              ← Offline kelime oyunları
│   │   ├── memoryAttention.ts        ← Offline bellek/dikkat
│   │   ├── dyscalculia.ts            ← Offline diskalkuli
│   │   ├── patternCompletion.ts      ← Offline örüntü tamamlama
│   │   ├── assessment.ts             ← Offline değerlendirme
│   │   ├── algorithm.ts              ← Offline algoritma
│   │   ├── clockReading.ts           ← Saat okuma
│   │   ├── capsuleGame.ts            ← Kapsül oyunu
│   │   ├── futoshiki.ts              ← Futoshiki bulmacası
│   │   ├── oddEvenSudoku.ts          ← Tek-Çift Sudoku
│   │   ├── magicPyramid.ts           ← Sihirli piramit
│   │   ├── financialMarket.ts        ← Offline finansal
│   │   ├── mapDetective.ts           ← Harita dedektifi
│   │   ├── abcConnect.ts             ← ABC bağlantı
│   │   └── helpers.ts                ← Offline yardımcı fonksiyonlar
│   │
│   ├── adminService.ts               ← Admin CRUD: aktivite, içerik, kullanıcı, bulk save
│   ├── aiContentService.ts           ← AI içerik üretim servisi (batch, cache-aware)
│   ├── aiTemplateService.ts          ← AI şablon yönetimi
│   ├── assessmentGenerator.ts        ← Değerlendirme sorusu generatörü
│   ├── assessmentService.ts          ← Değerlendirme motoru + puanlama
│   ├── auditLogger.ts                ← İşlem denetim kaydı
│   ├── auditService.ts               ← Denetim servisi
│   ├── authService.ts                ← Firebase Auth işlemleri (giriş/çıkış/kayıt)
│   ├── cacheService.ts               ← IndexedDB tabanlı önbellekleme (üretim + taslak store)
│   ├── curriculumService.ts          ← MEB müfredat verisi yönetimi
│   ├── firebaseClient.ts             ← Firebase/Firestore bağlantı ve CRUD
│   ├── imageService.ts               ← Görsel yükleme + Gemini Vision entegrasyonu
│   ├── jwtService.ts                 ← JWT üretim + doğrulama
│   ├── messagingService.ts           ← Mesajlaşma servisi
│   ├── ocrService.ts                 ← Gemini Vision OCR (fotoğraf → metin)
│   ├── offlineGenerators.ts          ← Offline generatör orkestratörü
│   ├── paginationService.ts          ← Sayfalama yardımcısı
│   ├── paperSizeApi.ts               ← Kâğıt boyutu API istemcisi
│   ├── rateLimiter.ts                ← İstek hız sınırlama (IP + kullanıcı bazlı)
│   ├── rbac.ts                       ← Rol tabanlı erişim (admin/teacher/parent/student)
│   ├── statsService.ts               ← İstatistik + analitik servisi
│   ├── templateCacheService.ts       ← Şablon önbelleği (prompt cache)
│   ├── worksheetService.ts           ← Çalışma kâğıdı CRUD + Firestore senkronizasyonu
│   └── ActivityService.ts            ← Aktivite türü yönetimi
│
├── components/                       ← 65+ React bileşeni
│   │
│   ├── [ADMIN MODÜLü — Dark Glassmorphism]
│   ├── AdminDashboardV2.tsx          ← Admin ana paneli (sekme navigasyonu)
│   ├── AdminActivityManager.tsx      ← Müfredat aktivite yönetimi (HTML5 Drag-and-Drop)
│   │                                    → adminService.saveActivitiesBulk
│   ├── AdminDraftReview.tsx          ← AI taslak inceleme (Gemini Vision OCR)
│   │                                    → category, targetSkills, learningObjectives auto-fill
│   ├── AdminStaticContent.tsx        ← Statik içerik yönetimi (10-versiyonluk snapshot)
│   │                                    → JSON export/import
│   ├── AdminPromptStudio.tsx         ← Prompt şablonu yönetimi + test arayüzü
│   ├── AdminAnalytics.tsx            ← Kullanım istatistikleri + grafikler
│   ├── AdminFeedback.tsx             ← Kullanıcı geri bildirimleri yönetimi
│   ├── AdminUserManagement.tsx       ← Kullanıcı rol yönetimi (RBAC)
│   │
│   ├── [STÜDYO MODÜLLERİ]
│   ├── MathStudio/                   ← Matematik stüdyosu
│   │   ├── MathStudio.tsx            ← Ana matematik stüdyosu bileşeni
│   │   ├── constants.ts              ← Matematik sabitleri
│   │   ├── utils.ts                  ← Matematik yardımcı fonksiyonlar
│   │   ├── hooks/                    ← MathStudio custom hook'ları
│   │   ├── panels/                   ← Kontrol paneli bileşenleri
│   │   └── components/               ← Alt bileşenler
│   ├── ReadingStudio/                ← Okuma anlama stüdyosu
│   │   ├── ReadingStudio.tsx         ← Ana okuma stüdyosu
│   │   ├── ReadingStudioContentRenderer.tsx  ← Aktivite render motoru
│   │   └── Editor/                   ← Metin editörü bileşenleri
│   ├── CreativeStudio/               ← Yaratıcı yazarlık stüdyosu
│   │   ├── index.tsx                 ← Ana yaratıcı stüdyo
│   │   ├── ControlPane.tsx           ← Kontrol paneli
│   │   ├── EditorPane.tsx            ← Editör paneli
│   │   ├── LibraryPane.tsx           ← Aktivite kütüphanesi
│   │   └── components/               ← Alt bileşenler
│   ├── A4Editor/                     ← A4 sürükle-bırak düzenleyici
│   │   ├── A4EditorPanel.tsx         ← Ana A4 düzenleyici
│   │   ├── ComponentLibrary.tsx      ← Bileşen kütüphanesi
│   │   ├── ContentPanel.tsx          ← İçerik paneli
│   │   └── StylePanel.tsx            ← Stil paneli
│   ├── UniversalStudio/              ← Evrensel çalışma kâğıdı adaptörü
│   │   ├── UniversalCanvas.tsx       ← Evrensel tuval
│   │   ├── UniversalAdapter.ts       ← Format dönüşüm adaptörü
│   │   ├── UniversalPropertiesPanel.tsx  ← Özellik paneli
│   │   └── UniversalWorksheetWrapper.tsx ← Çalışma kâğıdı sarmalayıcı
│   │
│   ├── [DEĞERLENDİRME MODÜLü]
│   ├── AssessmentModule.tsx          ← Değerlendirme modülü ana bileşeni
│   ├── AssessmentReportViewer.tsx    ← Değerlendirme raporu görüntüleyici
│   ├── assessment/                   ← Değerlendirme alt bileşenleri
│   │   └── AssessmentEngine.tsx      ← Değerlendirme motoru
│   ├── Screening/                    ← Tarama modülü
│   │   ├── ScreeningModule.tsx       ← Ana tarama bileşeni
│   │   ├── ScreeningIntro.tsx        ← Giriş ekranı
│   │   ├── QuestionnaireForm.tsx     ← Anket formu
│   │   └── ResultDashboard.tsx       ← Sonuç panosu
│   │
│   ├── [ÖĞRENCİ YÖNETİMİ]
│   ├── Student/                      ← Öğrenci modülü
│   │   ├── AdvancedStudentManager.tsx ← Gelişmiş öğrenci yönetimi + BEP
│   │   ├── StudentDashboard.tsx      ← Öğrenci panosu
│   │   ├── StudentSelector.tsx       ← Öğrenci seçici
│   │   └── modules/                  ← Öğrenci alt modülleri
│   ├── StudentInfoModal.tsx          ← Öğrenci bilgi modalı
│   │
│   ├── [ÇALIŞMA KÂĞIDI GÖRÜNÜMLERİ]
│   ├── GeneratorView.tsx             ← Aktivite generatörü arayüzü
│   ├── ContentArea.tsx               ← Ana içerik alanı (view routing)
│   ├── Worksheet.tsx                 ← Tek çalışma kâğıdı bileşeni
│   ├── WorkbookView.tsx              ← Çalışma kitabı görünümü
│   ├── Workbook.tsx                  ← Çalışma kitabı ana bileşeni
│   ├── SheetRenderer.tsx             ← Sayfa render motoru
│   ├── PrintPreviewModal.tsx         ← Yazdırma önizleme
│   ├── ExportProgressModal.tsx       ← PDF dışa aktarma ilerleme
│   ├── CurriculumView.tsx            ← Müfredat görünümü
│   ├── SavedWorksheetsView.tsx       ← Kaydedilmiş çalışmalar
│   ├── SharedWorksheetsView.tsx      ← Paylaşılan çalışmalar
│   ├── HistoryView.tsx               ← Geçmiş görünümü
│   ├── FavoritesSection.tsx          ← Favoriler bölümü
│   ├── WorksheetsList.tsx            ← Çalışma kâğıtları listesi
│   ├── ActivityImporterModal.tsx     ← Aktivite içe aktarma modalı
│   │
│   ├── [ARAYÜZ BİLEŞENLERİ]
│   ├── AppHeader.tsx                 ← Uygulama başlık çubuğu
│   ├── Sidebar.tsx                   ← Yan menü (modül navigasyonu)
│   ├── Toolbar.tsx                   ← Araç çubuğu
│   ├── AuthModal.tsx                 ← Giriş/Kayıt modalı (Firebase)
│   ├── SettingsModal.tsx             ← Kullanıcı ayarları
│   ├── ProfileView.tsx               ← Kullanıcı profil sayfası
│   ├── FeedbackModal.tsx             ← Geri bildirim modalı
│   ├── ShareModal.tsx                ← Paylaşma modalı
│   ├── GlobalSearch.tsx              ← Global arama
│   ├── TourGuide.tsx                 ← Kullanıcı tur rehberi
│   ├── SkeletonLoader.tsx            ← Yükleme iskelet bileşeni
│   ├── ErrorBoundary.tsx             ← React hata sınırı
│   ├── ErrorDisplay.tsx              ← Hata görüntüleme
│   ├── ToastContainer.tsx            ← Bildirim toast'ları
│   ├── PremiumPaperSizeSelector.tsx  ← Premium kâğıt boyutu seçici
│   ├── PaperSizeInitializer.tsx      ← Kâğıt boyutu başlatıcı
│   ├── OCRScanner.tsx                ← OCR tarayıcı arayüzü (Gemini Vision)
│   ├── DrawLayer.tsx                 ← Çizim katmanı
│   ├── Editable.tsx                  ← Düzenlenebilir metin bileşeni
│   ├── StickerPicker.tsx             ← Çıkartma seçici
│   ├── LineChart.tsx                 ← Çizgi grafiği
│   ├── RadarChart.tsx                ← Radar grafik (değerlendirme)
│   ├── PromptSimulator.tsx           ← Prompt simülatörü (geliştirici)
│   ├── DeveloperModal.tsx            ← Geliştirici araçları modalı
│   ├── MessagesView.tsx              ← Mesaj görünümü
│   ├── DyslexiaLogo.tsx              ← Disleksi logolu ikon
│   └── VisualAssets.tsx              ← Görsel varlıklar bileşeni
│
├── store/                            ← Zustand global state stores
│   ├── useAppStore.ts                ← Global app: currentView, sidebar, modal'lar
│   ├── useAuthStore.ts               ← Auth: user, role, isAuthenticated, Firebase state
│   ├── useWorksheetStore.ts          ← Çalışma kâğıdı: liste, aktif, CRUD işlemleri
│   ├── useA4EditorStore.ts           ← A4 editör: canvas state, bileşenler, seçim
│   ├── useCreativeStore.ts           ← Yaratıcı stüdyo state
│   ├── useReadingStore.ts            ← Okuma stüdyosu state
│   ├── useStudentStore.ts            ← Öğrenci yönetimi + BEP state
│   ├── usePaperSizeStore.ts          ← Kâğıt boyutu tercihi (A4/Letter/B5)
│   ├── useToastStore.ts              ← Bildirim toast state
│   └── useUIStore.ts                 ← UI state: loading, modals, drawer
│
├── types/                            ← TypeScript tip tanımları (14 dosya)
│   ├── index.ts                      ← Barrel export (tüm tipler buradan import)
│   ├── core.ts                       ← WorksheetData, ActivityBase, GeneratorConfig
│   ├── activity.ts                   ← ActivityType enum (40+ aktivite tipi), Activity
│   ├── common.ts                     ← ApiResponse<T>, PaginatedResponse, LoadingState
│   ├── student.ts                    ← Student, StudentProfile temel tipler
│   ├── student-advanced.ts           ← StudentAIProfile, BEPGoal, StudentPrivacySettings
│   │                                    IEPDocument, LearningProgressRecord
│   ├── creativeStudio.ts             ← LearningDisabilityProfile, AgeGroup, CreativeActivity
│   │                                    ('dyslexia'|'dyscalculia'|'adhd'|'mixed')
│   │                                    ('5-7'|'8-10'|'11-13'|'14+')
│   ├── math.ts                       ← MathActivity, MathProblemType, DyscalculiaLevel
│   ├── verbal.ts                     ← VerbalActivity, ReadingLevel, ComprehensionType
│   ├── visual.ts                     ← VisualActivity, PerceptionType
│   ├── studio.ts                     ← StudioConfig, StudioSession, LayoutConfig
│   ├── screening.ts                  ← ScreeningResult, RiskLevel, DomainScore
│   ├── admin.ts                      ← AdminActivity, ContentVersion, DraftStatus
│   └── user.ts                       ← UserRole('admin'|'teacher'|'parent'|'student'), User
│
├── hooks/                            ← Custom React hooks
│   ├── useWorksheets.ts              ← API entegrasyon hook (getAuthHeaders pattern)
│   └── useActivitySettings.ts        ← Aktivite ayarları hook
│
├── utils/                            ← Yardımcı fonksiyonlar
│   ├── AppError.ts                   ← AppError, ValidationError, RateLimitError (MERKEZİ)
│   ├── errorHandler.ts               ← retryWithBackoff, logError, wrapAsync
│   ├── schemas.ts                    ← Zod şemaları (tüm API giriş doğrulama)
│   ├── scoringEngine.ts              ← Puanlama motoru (değerlendirme)
│   ├── snapshotService.ts            ← 10-versiyonluk snapshot yönetimi
│   ├── speechService.ts              ← Web Speech API entegrasyonu
│   ├── printService.ts               ← Yazdırma servisi
│   ├── layoutConstants.ts            ← A4 + kâğıt boyutu sabitleri
│   └── validator.ts                  ← Genel doğrulama yardımcıları
│
├── middleware/
│   └── permissionValidator.ts        ← API endpoint izin doğrulama (RBAC)
│
├── src/                              ← Alternatif kaynak dizini (mirrors root)
│   ├── modules/
│   │   ├── super-turkce/             ← Türkçe Dil Modülü v1 (4 Faz tamamlandı)
│   │   └── super-turkce-v2/          ← Türkçe Dil Modülü v2 (studios, features)
│   ├── store/                        ← src/ içindeki store kopyaları
│   ├── types/                        ← src/ içindeki type kopyaları
│   ├── services/                     ← src/ içindeki service kopyaları
│   └── utils/                        ← src/ içindeki util kopyaları
│
├── tests/                            ← Vitest test suite
│   ├── ActivityService.test.ts
│   ├── AppError.test.ts
│   ├── FiveWOneHGenerator.test.ts
│   ├── GenericActivityGenerator.test.ts
│   ├── Integration.test.ts
│   ├── RBAC.test.ts
│   ├── RateLimiter.test.ts
│   ├── Validators.test.ts
│   ├── printService.test.ts
│   └── e2e/                          ← Playwright E2E testleri
│       ├── print.spec.ts
│       ├── print-margin.spec.ts
│       ├── print-regression.spec.ts
│       └── turkce-super-studyo.spec.ts
│
├── .idx/dev.nix                      ← Google Project IDX / Antigravity ortam yapılandırması
├── .agents/rules/oogmatik-core.md    ← Antigravity always-on agent kuralları
├── .claude/agents/                   ← Claude Code özel ajan tanımları
│   ├── ozel-ogrenme-uzmani.md        ← Elif Yıldız — Pedagoji
│   ├── ozel-egitim-uzmani.md         ← Dr. Ahmet Kaya — Klinik/MEB
│   ├── yazilim-muhendisi.md          ← Bora Demir — Mühendislik
│   └── ai-muhendisi.md               ← Selin Arslan — AI Mimarisi
├── .cursor/rules/oogmatik.mdc        ← Cursor AI kuralları
├── .windsurfrules                    ← Windsurf AI kuralları
├── .github/copilot-instructions.md   ← GitHub Copilot kuralları
├── .continue/config.json             ← Continue.dev yapılandırması
├── .zed/settings.json                ← Zed AI yapılandırması
├── .aider.conf.yml                   ← Aider yapılandırması
├── opencode.json                     ← OpenCode yapılandırması
├── App.tsx                           ← React uygulama kök bileşeni + routing
├── vercel.json                       ← Vercel dağıtım yapılandırması
├── vite.config.ts                    ← Vite derleme yapılandırması
├── tailwind.config.js                ← Tailwind CSS yapılandırması
├── tsconfig.json                     ← TypeScript sıkı mod yapılandırması
├── swagger.yaml                      ← API dokümantasyonu
└── antigravity_report.md             ← Sprint 5 Admin Modülü referans belgesi
```

---

## ⚡ Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18, Vite 5, TypeScript (strict), Tailwind CSS, Framer Motion |
| State | Zustand (10 store) |
| UI Kütüphanesi | Radix UI, @dnd-kit (drag-and-drop), lucide-react (ikonlar) |
| Backend | Node.js, Vercel Serverless Functions |
| AI | Google Gemini 2.5 Flash (`gemini-2.5-flash`) — sabit, değiştirme |
| Veritabanı | Firebase/Firestore + IndexedDB (önbellek) |
| Validation | Zod |
| Test | Vitest + Playwright (E2E) |
| Export | jsPDF, @react-pdf/renderer, html2canvas |
| Font | **Lexend** (disleksi-dostu içerik — ASLA değiştirme) + Inter (admin UI) |
| Deploy | Vercel |

---

## 🔑 Kritik Tip Tanımları

```typescript
// Özel öğrenme profilleri — TÜM generatörler bu değerleri desteklemeli
type LearningDisabilityProfile = 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed';

// Yaş grupları — ZPD uyumu için zorunlu
type AgeGroup = '5-7' | '8-10' | '11-13' | '14+';

// Zorluk seviyeleri
type Difficulty = 'Kolay' | 'Orta' | 'Zor';

// Kullanıcı rolleri — RBAC
type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

// Standart hata sınıfı — BU FORMATIN DIŞINA ÇIKMA
class AppError {
  userMessage: string;    // Kullanıcıya gösterilecek Türkçe mesaj
  code: string;           // Hata kodu (örn: 'RATE_LIMIT_EXCEEDED')
  httpStatus: number;     // HTTP durum kodu
  details?: unknown;      // Geliştirici detayları (production'da gizle)
  isRetryable: boolean;   // Yeniden denenebilir mi?
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
  objective: string;       // Ölçülebilir hedef
  targetDate: string;      // ISO tarih
  measurableIndicator: string;  // Başarı göstergesi
  supportStrategies: string[];  // Destek stratejileri
  progress: 'not_started' | 'in_progress' | 'achieved';
}
```

---

## 🚫 Mutlak Yasaklar (Tüm Ekip İçin)

1. `any` tipi kullanma — `unknown` + type guard kullan
2. `console.log` üretim koduna koyma — `logError()` kullan
3. API key'leri hardcode etme — `process.env.XXX`
4. `pedagogicalNote` alanını aktivite çıktısından çıkarma
5. Lexend fontunu değiştirme (disleksi uyumluluğu için kritik)
6. `AppError` formatını bypass etme
7. Özel ajan onayı olmadan klinik içerik değiştirme

---

## ✅ Her Değişiklikten Önce Kontrol Listesi

```
□ TypeScript strict mode uyumlu?
□ AppError formatı kullanıldı mı?
□ Rate limiting etkilendi mi? (api/generate.ts)
□ pedagogicalNote her aktivitede var mı?
□ LearningDisabilityProfile tüm senaryolar kapsıyor mu?
□ Lexend font korunuyor mu?
□ Test yazıldı mı? (vitest)
□ Özel ajan pedagojik onayı verildi mi?
```

---

## 🧑‍💼 Ekip Ajanları

### İç Çekirdek (Proje Özel — `.claude/agents/`)

| Ajan | Rol | Liderlik Alanı |
|------|-----|----------------|
| `ozel-ogrenme-uzmani` | Elif Yıldız | Tüm pedagojik kararlar |
| `ozel-egitim-uzmani` | Dr. Ahmet Kaya | Klinik doğruluk, BEP, MEB |
| `yazilim-muhendisi` | Bora Demir | Mühendislik standartları |
| `ai-muhendisi` | Selin Arslan | AI kalitesi, prompt, maliyet |

### Genel Kadro (vibecosystem — `~/.claude/agents/`)

`frontend-dev`, `backend-dev`, `code-reviewer`, `security-analyst`, `tdd-guide`, `qa-engineer`, `architect` — bu ajanlar **İç Çekirdek'in direktifleriyle** çalışır.

---

## ⚡ Superpowers İş Akışı

Bu proje **[obra/superpowers](https://github.com/obra/superpowers)** ile entegre edilmiştir. Superpowers, AI kodlama ajanları için yapılandırılmış bir geliştirme iş akışı sağlar.

### Beceriler (`.claude/skills/`)

Her görev başlamadan önce ilgili beceriyi çağır:

| Beceri | Tetikleyici |
|--------|-------------|
| `brainstorming` | Herhangi bir özellik/bileşen yapmadan önce |
| `writing-plans` | Tasarım onaylandıktan sonra |
| `test-driven-development` | Her implementasyon adımında |
| `subagent-driven-development` | Plan yürütülürken (tavsiye edilen) |
| `executing-plans` | Tek oturumda plan yürütürken |
| `systematic-debugging` | Herhangi bir hata/test başarısızlığında |
| `requesting-code-review` | Görev tamamlandıktan sonra |
| `verification-before-completion` | "Tamamlandı" demeden önce |
| `finishing-a-development-branch` | Uygulama bittiğinde |
| `using-git-worktrees` | Özellik dalı oluştururken |

### Öncelik Sırası

```
1. CLAUDE.md + Oogmatik kuralları  ← EN YÜKSEK
2. Superpowers skills (iş akışı)
3. Default AI behavior             ← EN DÜŞÜK
```

Superpowers becerileri Oogmatik kurallarını asla geçemez. `pedagogicalNote`, `AppError`, `any` yasağı, KVKK — bunlar mutlak.

### Dokümanlar

- **Tasarım dokümanları:** `docs/superpowers/specs/YYYY-MM-DD-<konu>.md`
- **Uygulama planları:** `docs/superpowers/plans/YYYY-MM-DD-<özellik>.md`
- **Entegrasyon kılavuzu:** `docs/superpowers/README.md`

### Test Komutları

```bash
npm run test:run    # Vitest (tüm testler)
npm run build       # TypeScript derleme
npm run lint        # ESLint
```

---

## 🔌 Context7 MCP Entegrasyonu

Bu proje **[upstash/context7](https://github.com/upstash/context7)** MCP sunucusuyla entegre edilmiştir. Context7, AI kodlama araçlarına güncel, sürüme özel kütüphane dokümantasyonu ve kod örnekleri sağlar.

### Neden Context7?

- React 19, Firebase, Zod, Tailwind CSS gibi kütüphanelerin **güncel** dokümantasyonunu doğrudan prompt'a enjekte eder
- Halüsinasyon riskini azaltır — AI eski API'leri önermez
- Oogmatik stack'i (Gemini, Firebase, Vercel) için özellikle kritik

### Desteklenen Araçlar

| Araç | Config Dosyası | Durum |
|------|---------------|-------|
| Claude Code | `.mcp.json` | ✅ Aktif |
| Cursor | `.cursor/mcp.json` | ✅ Aktif |
| Continue.dev | `.continue/config.json` | ✅ Aktif |
| Zed | `.zed/settings.json` | ✅ Aktif |
| OpenCode | `opencode.json` | ✅ Aktif |
| GitHub Copilot | Repo Settings → Copilot → MCP | ⚙️ Manuel kurulum gerekli |

### GitHub Copilot Coding Agent İçin Manuel Kurulum

Repository → Settings → Copilot → Coding agent → MCP configuration bölümüne şunu ekle:

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "tools": ["query-docs", "resolve-library-id"]
    }
  }
}
```

### Kullanım

Herhangi bir prompt'a `use context7` ekle:

```
# Örnek: Firebase ile Firestore sorgusu yaz. use context7
# Örnek: Zod v4 ile şema oluştur. use context7
# Örnek: React 19 ile useOptimistic kullan. use context7
```

### Oogmatik Stack Kütüphane ID'leri

Sık kullanılan kütüphaneler için hazır ID'ler:

| Kütüphane | Context7 ID |
|-----------|-------------|
| React | `/facebook/react` |
| Firebase | `/firebase/firebase-js-sdk` |
| Zod | `/colinhacks/zod` |
| Tailwind CSS | `/tailwindlabs/tailwindcss` |
| Vite | `/vitejs/vite` |
| Zustand | `/pmndrs/zustand` |
| Framer Motion | `/framer/motion` |


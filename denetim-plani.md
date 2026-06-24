# 🎯 OOGMATIK PLATFORM — DERİNLEMESİNE ANALİZ PLANI
> **Tarih:** 24 Haziran 2026 | **Temel:** `gel.md` (513 satır denetim raporu)  
> **Durum:** TÜM AJANLAR AKTİF — 7 uzman, 4 haftalık program

---

## 🧠 ORKESTRASYON ŞEMASI

```
gel.md (513 satır)
  ├── Elif Yıldız (Pedagoji)    → Aktivite üreticileri, ZPD, pedagogicalNote
  ├── Dr. Ahmet Kaya (Klinik)   → Tanı dili, KVKK, BEP, MEB uyumu
  ├── Bora Demir (Müh.)         → Hook'lar, store'lar, servisler, hata yönetimi
  ├── Selin Arslan (AI)         → Gemini entegrasyonu, token, hallucination
  ├── Caner Tekin (UI/UX)       → God Components, tema, erişilebilirlik
  ├── Gizem Başar (Güvenlik)    → RBAC, şifreleme, Firestore kuralları
  └── Tolga Yılmaz (Cloud/DB)   → Firestore şema, index'ler, serverless
```

---

## 1. ELİF YILDIZ — Pedagoji Uzmanı

### 🔍 Odak Alanı
Aktivite üreticilerinde `pedagogicalNote` kalitesi, ZPD (Yakınsak Gelişim Alanı) uyumu, disleksi/DEHB pedagojik standartları.

### 📂 Denetlenecek Dosyalar

| Dosya | Satır | İlgili Sorun |
|-------|-------|-------------|
| `src/types/activity.ts` | Tümü | `ActivityType` (268 değer) — her aktivitede pedagogicalNote zorunlu mu? |
| `src/constants.ts` | 1-567 | `ACTIVITIES[]` — her aktivite maddesinde `difficulty` x `AgeGroup` eşleşmesi |
| `src/types/creativeStudio.ts` | Tümü | `AgeGroup` ('5-7'\|'8-10'\|'11-13'\|'14+'), `LearningDisabilityProfile` |
| `src/services/geminiClient.ts` | Tümü | Prompt'larda pedagogicalNote kontrolü |
| `api/generate.ts` | Tümü | AI üretiminde ZPD parametreleri |
| `src/components/FascicleStudio/FascicleTemplatesModal.tsx` | 47-51 | Şablon içerikleri — pedagojik temellendirme eksik |
| `src/components/FascicleStudio/FascicleCoverPage.tsx` | 56-57 | Kapak teması — pedagojik renk psikolojisi |
| `src/store/useFascicleStore.ts` | Tümü | Undo/redo — pedagojik akış bütünlüğü |
| `src/hooks/useWorksheets.ts` | Tümü | Aktivite üretim zinciri |

### ✅ Kontrol Listesi
- [ ] `pedagogicalNote` her aktivitede zorunlu mu? (AGENTS.md Kural #0)
- [ ] İlk aktivite maddesi her zaman **Kolay** seviyede mi? (güven inşası)
- [ ] ZPD uyumu: `AgeGroup` x `difficulty` matrisi doğru mu?
- [ ] Lexend font + geniş satır aralığı tüm aktivitelerde korunuyor mu?
- [ ] Aktivite türleri disleksi/DEHB/diskalkuli profiline göre filtrelenebiliyor mu?
- [ ] `FascicleTemplatesModal` içindeki 4 şablon (disleksi, DEHB, diskalkuli, LGS) pedagojik olarak doğru mu?
- [ ] AI üretim prompt'ları ZPD parametrelerini içeriyor mu?

### 🎯 Teslimat
- `pedagoji-raporu.md`: Her aktivite kategorisi için pedagogicalNote kalite skoru
- ZPD uyumsuzluk raporu
- Düzeltme önerileri (kod + prompt)

---

## 2. DR. AHMET KAYA — Klinik/MEB Uzmanı

### 🔍 Odak Alanı
Tanı koyucu dil denetimi, KVKK Madde 7 uyumu, BEP (Bireyselleştirilmiş Eğitim Programı) akışı, MEB Özel Eğitim Yönetmeliği + 573 KHK.

### 📂 Denetlenecek Dosyalar

| Dosya | Satır | İlgili Sorun |
|-------|-------|-------------|
| `src/services/privacyService.ts` | Tümü (421 satır) | KVKK kontrol listesi: öğrenci adı + tanı + skor birlikte görünür mü? |
| `src/services/bepEngine.ts` | Tümü | BEP hedefleri SMART formatında mı? |
| `src/types/student-advanced.ts` | Tümü | `StudentAIProfile`, `BEPGoal`, `StudentPrivacySettings` |
| `src/services/sinavService.ts` | 18 | Anonim sınav kaydı — KVKK ihlali riski |
| `src/services/fascicleService.ts` | 60-63 | Öğrenci atama — KVKK veri minimizasyonu |
| `src/components/Profile/hooks/useProfileData.ts` | 91 | Streak = 0 — gamification'da klinik etik |
| `src/services/worksheetService.ts` | Tümü | Paylaşım mekanizması — KVKK açık onay |
| `src/components/SharedWorksheetsView.tsx` | 163 | Değerlendirme raporu — tanı + skor birlikte mi? |
| `src/database/schema.sql` | Tümü | Veri modeli — KVKK uyumu |
| `src/utils/piiAnonymizer.ts` | Tümü | PII anonimleştirme |
| `src/utils/validator.ts` | Tümü | Zod şemaları — KVKK validasyonları |
| `firestore.rules` | Tümü (148 satır) | KVKK erişim kontrolleri |

### ✅ Kontrol Listesi
- [ ] **Tanı koyucu dil yasak:** "disleksisi var" → "disleksi desteğine ihtiyacı var" (TÜM UI'larda)
- [ ] **KVKK Madde 7:** Veri silme endpoint'i çalışıyor mu?
- [ ] Öğrenci adı + tanı + skor hiçbir UI'da birlikte görünmüyor mu?
- [ ] Paylaşım (sharedWith) için açık onay alınıyor mu?
- [ ] `sharedWith` silindiğinde cascade temizleniyor mu?
- [ ] BEP hedefleri SMART formatında mı? (Spesifik, Ölçülebilir, Ulaşılabilir, İlgili, Süreli)
- [ ] MEB Özel Eğitim Yönetmeliği + 573 KHK uyumu
- [ ] Tüm AI prompt'larında tanı koyucu dil filtresi var mı?
- [ ] `sinavService.ts` userId sorunu KVKK ihlali oluşturur mu? (anonim veri kaydı)

### 🎯 Teslimat
- `klinik-raporu.md`: Tanı koyucu dil içeren tüm satırlar
- KVKK uyumsuzluk raporu (her madde için risk seviyesi)
- BEP SMART uyum raporu
- Düzeltme şablonları

---

## 3. BORA DEMİR — Mühendislik Uzmanı

### 🔍 Odak Alanı
Tüm hook'lar, store'lar, servisler, hata yönetimi (`AppError`), tip güvenliği, test coverage, kod kalitesi.

### 📂 Denetlenecek Dosyalar

| Dosya | Satır | İlgili Sorun |
|-------|-------|-------------|
| `src/store/useFascicleStore.ts` | Tümü (185) | `past` sınırsız (#10), localStorage boyutu (#15), `any` kullanımı |
| `src/services/fascicleService.ts` | 59-63 | `getAssignedFascicles` stub (#3) |
| `src/services/fascicleStorageService.ts` | 44-48 | `viewCount` increment eksik (#4) |
| `src/services/sinavService.ts` | 18-19 | userId hardcoded (#5) |
| `src/services/analyticsEngine.ts` | 124, 367 | Tüm fetch stub (#6) |
| `src/services/activityVisibilityManager.ts` | 118, 146, 194 | Firestore persistence yok (#7) |
| `src/services/jwtService.ts` | 232 | DB doğrulama yok (#9) |
| `src/services/geminiClient.ts` | Tümü (278) | Retry, backoff, error handling |
| `src/services/messagingService.ts` | Tümü (239) | Real-time pattern |
| `src/services/worksheetService.ts` | Tümü | Paylaşım akışı |
| `src/services/adminService.ts` | Tümü | Admin operasyonları |
| `src/services/rbac.ts` | Tümü (212) | Legacy RBAC — kullanılıyor mu? |
| `src/services/rbacService.ts` | Tümü (202) | Yeni RBAC — Firestore entegrasyonu |
| `src/hooks/useWorksheetManager.ts` | Tümü | Worksheet CRUD orchestration |
| `src/hooks/useNavigationLogic.ts` | Tümü | Navigasyon state machine |
| `src/hooks/useHistoryManager.ts` | Tümü | Undo/redo mimarisi |
| `src/hooks/useWorksheets.ts` | Tümü | Frontend-API köprüsü |
| `src/hooks/useRBAC.ts` | Tümü | RBAC yardımcısı |
| `src/utils/AppError.ts` | Tümü | Merkezi hata standardı |
| `src/utils/errorHandler.ts` | Tümü | Hata işleme |
| `src/utils/logger.ts` | 124, 135, 143 | TODO'lar — Analytics, Sentry, Audit |
| `src/utils/schemas.ts` | Tümü | Zod validation |
| `src/services/rateLimiter.ts` | Tümü | Rate limiting |
| `src/middleware/permissionValidator.ts` | Tümü | Permission validation |
| `src/FasciclePreview.tsx` | 50 | `as any` kullanımı (#13) |
| `src/components/FascicleStudio/index.tsx` | 91 | `as any` kullanımı (#13) |
| `src/components/FascicleStudio/FascicleCoverSettingsModal.tsx` | 42 | `value: any` (#13) |

### ✅ Kontrol Listesi
- [ ] **`any` tipi yasak:** Tüm `as any` kullanımları tespit edildi mi? (satır 261-265)
- [ ] Tüm servisler `AppError` standardını kullanıyor mu? `{ success, error: { message, code }, timestamp }`
- [ ] `past.slice(-30)` eklendi mi? (FascicleStore)
- [ ] `partialize` ile localStorage boyutu optimize edildi mi?
- [ ] Rate limiter her yeni endpoint'te var mı?
- [ ] `validateRequest()` tüm API girişlerinde kullanılıyor mu?
- [ ] retryWithBackoff pattern'i tüm Firestore yazmalarında var mı?
- [ ] Vitest testleri her servis için yazıldı mı? (`tests/` dizini)
- [ ] TODO borçları (20+ kritik/orta) takip ediliyor mu?
- [ ] `rbac.ts` vs `rbacService.ts` — hangisi aktif? Import'lar karışık mı? (#14)
- [ ] `logger.ts` TODO'ları tamamlandı mı? (analytics, Sentry, audit log)
- [ ] `console.log` üretim kodunda var mı?

### 🎯 Teslimat
- `muhendislik-raporu.md`: Tüm `any` kullanımları envanteri
- Store performans analizi (past, localStorage, memory)
- Servis TODO takip tablosu (20+ madde, ilerleme yüzdesi)
- Test coverage raporu
- Düzeltme branch planı

---

## 4. SELİN ARSLAN — AI Uzmanı

### 🔍 Odak Alanı
Gemini entegrasyonu, token maliyeti optimizasyonu, hallucination riski, prompt injection güvenliği, batch işleme.

### 📂 Denetlenecek Dosyalar

| Dosya | Satır | İlgili Sorun |
|-------|-------|-------------|
| `src/services/geminiClient.ts` | Tümü (278) | Model sabiti, retry, JSON repair, multimodal |
| `api/generate.ts` | Tümü | Ana AI endpoint — rate limit, CORS, validation |
| `api/generate-exam.ts` | Tümü | Sınav üretimi |
| `api/ai/` | Tümü | AI proxy routes |
| `src/utils/promptSecurity.ts` | Tümü | Prompt injection sanitizasyonu |
| `src/services/analyticsEngine.ts` | 124, 367 | AI analitik — hallucination riski |
| `src/services/advancedAI.ts` | 102, 150, 174, 225 | TODO'lar: STT, TTS, Emotion, Vision |
| `src/services/cacheService.ts` | Tümü | Batch cache (count > 10 için) |
| `src/services/mlEngine.ts` | 347 | Gerçek ML eğitimi TODO |
| `src/components/ScreeningAssessment/services/assessmentEngineService.ts` | Tümü | AI prompt motoru |
| `src/registry.ts` | Tümü | Component registry — AI bileşenleri |
| `src/store/useFascicleStore.ts` | Tümü | AI destekli fasikül önerileri |
| `_boilerplate/generators.ts` | 9 | `generateWithSchema` çağrısı TODO |
| `src/services/teacherService.ts` | Tümü | AI öğretmen asistanı |

### ✅ Kontrol Listesi
- [ ] **Model sabit:** `gemini-2.5-flash` — tüm dosyalarda MASTER_MODEL tutarlı mı?
- [ ] **JSON repair:** 3 katmanlı (balanceBraces → truncate → parse) çalışıyor mu?
- [ ] **Prompt injection:** User input sanitize ediliyor mu? (max 2000 karakter)
- [ ] **Hallucination riski:** AI yanıtları doğrulanıyor mu? (validateAndCorrect pattern)
- [ ] **Token maliyeti:** Batch işleme (count > 10 → 5'erli gruplar) aktif mi?
- [ ] **Rate limiting:** `/api/generate`'de rate limiter var mı?
- [ ] **CORS:** API endpoint'lerinde CORS başlıkları doğru mu?
- [ ] **Prompt şablonları:** ZPD, pedagogicalNote, tanı dili, KVKK filtresi içeriyor mu?
- [ ] **Retry stratejisi:** 5 deneme, exponential backoff — çalışıyor mu?
- [ ] **Token sayacı:** Her AI çağrısı için token tüketimi loglanıyor mu?
- [ ] `advancedAI.ts` TODO'ları (STT, TTS, Emotion, Vision) için önceliklendirme
- [ ] `_boilerplate/generators.ts` TODO — generateWithSchema çağrısı (orta öncelik)

### 🎯 Teslimat
- `ai-raporu.md`: AI servis envanteri + token maliyet analizi
- Hallucination risk değerlendirmesi (her prompt tipi için)
- Prompt injection güvenlik test sonuçları
- Batch/cache stratejisi optimizasyon önerileri
- Model değişiklik risk analizi

---

## 5. CANER TEKİN — UI/UX Uzmanı

### 🔍 Odak Alanı
God Components (bölme stratejisi), tema uyumu (CSS variable, Tailwind), erişilebilirlik (WCAG), micro-interactions, studio UX akışı.

### 📂 Denetlenecek Dosyalar

| Dosya | Satır | Boyut | İlgili Sorun |
|-------|-------|-------|-------------|
| `src/components/SheetRenderer.tsx` | Tümü | 🟡 59KB | God Component — her aktivite türü için ayrı renderer |
| `src/components/OCRScanner.tsx` | Tümü | 🟡 58KB | OCRUploader + OCRResults + OCRVariations |
| `src/components/CurriculumView.tsx` | Tümü | 🔴 71KB | PlanEditor + DayView + ActivityPicker |
| `src/components/MatSinavStudyosu/index.tsx` | Tümü | 🟡 50KB | SoruEditor + Önizleme + Ayarlar |
| `src/components/SinavStudyosu/index.tsx` | Tümü | 🟡 38KB | Benzer bölünme |
| `src/components/AssignmentsModule.tsx` | Tümü | 🟡 41KB | AssignmentList + Detail + Form |
| `src/components/AcademicPlanModule.tsx` | Tümü | 🟡 40KB | PlanHeader + WeekGrid + ActivityCard |
| `src/components/AssessmentModule.tsx` | Tümü | 🟡 35KB | TestSetup + QuestionDisplay + ResultView |
| `src/App.tsx` | 588-736 | 🟡 600+ satır | Studio render bloğu (M5) |
| `src/components/FascicleStudio/index.tsx` | 163 | 🟡 | Header statik metin (#12) |
| `src/components/FascicleStudio/FascicleCoverPage.tsx` | 56-57 | 🔴 | Dinamik Tailwind class (#2) |
| `src/components/FascicleStudio/FascicleTemplatesModal.tsx` | 47-51 | 🟡 | Şablon UX yanıltıcı (#11) |
| `src/styles/theme-tokens.css` | Tümü | CSS variable teması |
| `src/styles/theme-premium.css` | Tümü | Premium tema |
| `src/styles/theme-oled.css` | Tümü | OLED tema |
| `src/styles/tailwind.css` | Tümü | Tailwind yapılandırması |
| `tailwind.config.js` | Tümü | Tailwind config |
| `src/components/Sidebar.tsx` | 117, 129 | Navigasyon |
| `src/components/ProtectedRoute.tsx` | Tümü | Route guard UX |
| `src/components/Profile/hooks/useProfileData.ts` | 91 | Streak UI (gamification) |

### ✅ Kontrol Listesi
- [ ] **God Components:** CurriculumView (71KB) → 3 bileşene bölme planı hazır mı?
- [ ] **App.tsx:** Studio render bloğu `<StudioRenderer>`'a taşınabilir mi? (M5)
- [ ] **Tema uyumu:** Tüm bileşenler CSS variable kullanıyor mu? (`var(--primary-color)` vb.)
- [ ] **Dinamik Tailwind:** `bg-${renk}-200/40` gibi JIT-uyumsuz class'lar var mı? (#2)
- [ ] **Erişilebilirlik:**
  - [ ] `aria-label` tüm ikon butonlarda var mı?
  - [ ] Klavye navigasyonu çalışıyor mu? (Tab, Enter, Escape)
  - [ ] Renk kontrastı WCAG AA standardında mı?
  - [ ] Focus indicator görünür mü?
- [ ] **Micro-interactions:** hover scale, smooth scroll, animasyon geçişleri tutarlı mı?
- [ ] **Loading state:** Lazy-loaded bileşenlerde LoadingSpinner her yerde var mı?
- [ ] **Error state:** Hata durumlarında kullanıcıya anlamlı geri bildirim veriliyor mu?
- [ ] **Empty state:** Boş liste/durumlarda anlamlı mesaj gösteriliyor mu?
- [ ] **Mobile:** `MobileWorksheetViewer` — hangisi aktif? (M2)
- [ ] **Duplikasyon:** `AdminPermissionsIDE.tsx` kullanılıyor mu? (M1)
- [ ] **Constants:** `constants.ts` (567 satır) `constants/` klasörüne bölünebilir mi? (M4)
- [ ] **Print teması:** `theme-print.css` tüm studio'larda çalışıyor mu?
- [ ] **FascicleStudio header:** Dinamik başlık gösteriliyor mu? (#12)
- [ ] **FascicleTemplatesModal:** "Çok Yakında" UX'i mi, gerçek içerik mi? (#11)

### 🎯 Teslimat
- `uiux-raporu.md`: God Component bölme planı (öncelik: CurriculumView → SheetRenderer → OCRScanner)
- Tema uyum testi sonuçları (tüm temalarda görsel regresyon)
- WCAG erişilebilirlik denetim raporu
- App.tsx refactor önerisi (StudioRenderer)
- Micro-interaction iyileştirme önerileri

---

## 6. GİZEM BAŞAR — Güvenlik Uzmanı

### 🔍 Odak Alanı
RBAC zayıflıkları, veri şifreleme (istemci/sunucu), Firestore güvenlik kuralları, JWT güvenliği, KVKK veri koruması (güvenlik perspektifi).

### 📂 Denetlenecek Dosyalar

| Dosya | Satır | Boyut/Önem | İlgili Sorun |
|-------|-------|------------|-------------|
| `firestore.rules` | Tümü | 148 satır | 🔴 RBAC doğrulama zayıflıkları |
| `src/services/jwtService.ts` | 232 | 🔴 KRİTİK | DB doğrulaması yok (#9) |
| `src/services/rbac.ts` | Tümü | 212 satır | 🟡 Legacy RBAC — güvenlik deliği |
| `src/services/rbacService.ts` | Tümü | 202 satır | 🔵 Yeni RBAC — denetim |
| `src/types/rbac-advanced.ts` | Tümü | 286 satır | 29 modül, 5 kategori |
| `src/services/privacyService.ts` | Tümü | 421 satır | 🔵 DLP — KVKK güvenlik |
| `src/services/authService.ts` | Tümü | 🔵 Firebase Auth |
| `src/middleware/permissionValidator.ts` | Tümü | 🔵 Permission middleware |
| `src/services/fascicleService.ts` | Tümü | 🔴 `creatorId` doğrulama yok (S3) |
| `src/utils/piiAnonymizer.ts` | Tümü | 🔵 PII güvenliği |
| `src/utils/promptSecurity.ts` | Tümü | 🔵 Prompt injection |
| `src/components/AdminDashboard/PermissionsIDE.tsx` | 49-76 | 🟡 İkon eksik — yetki yanılgısı riski |
| `src/database/firestore-indexes.ts` | Tümü | 🟢 Index güvenliği |
| `src/services/rateLimiter.ts` | Tümü | 🔵 Rate limiting |
| `firestore.indexes.json` | Tümü | 🟢 Index konfigürasyonu |
| `.env.example` | Tümü | 🟡 API key sızıntısı riski |

### ✅ Kontrol Listesi
- [ ] **Firestore Rules (RBAC):**
  - [ ] `students` koleksiyonu sadece admin/teacher erişimine açık mı?
  - [ ] `saved_worksheets`'de `sharedWith` doğrulaması yapılıyor mu?
  - [ ] Settings koleksiyonu sadece admin yazımına açık mı?
  - [ ] Validation rules'ları eksik mi? (ör: `request.resource.data` kontrolleri)
- [ ] **JWT Güvenliği:**
  - [ ] `jwtService.ts` loginHandler — DB doğrulaması eklenmemiş (#9)
  - [ ] Token süresi ve refresh mekanizması güvenli mi?
  - [ ] JWT secret environment variable'da mı? (hardcode yasak)
- [ ] **RBAC Zayıflıkları:**
  - [ ] `rbac.ts` hala kullanılıyorsa — hangi route'lar eski sisteme bağlı? (#14)
  - [ ] `ProtectedRoute` hangi RBAC sistemini kullanıyor? (App.tsx'te incele)
  - [ ] `fascicle-studio` RBAC kaydı tam mı? (gel.md düzeltme yapıldı ama ikon eksik)
  - [ ] `PermissionsIDE`'de `fascicle-studio` ikonu eksik — yetki yönetiminde karışıklık
- [ ] **Veri Şifreleme:**
  - [ ] PII (TC Kimlik, ad, tanı) istemci tarafında maskeleniyor mu?
  - [ ] Firestore'da hassas veri şifreleniyor mu? (Firestore at-rest encryption yeterli mi?)
  - [ ] AI API'ye gönderilen verilerde PII filtresi var mı?
- [ ] **creatorId Doğrulama:**
  - [ ] `fascicleService.publishFascicle`'da `creatorId` kontrolü yok (S3)
  - [ ] Başkasının fasikülünü yayınlama riski
- [ ] **API Güvenliği:**
  - [ ] Rate limiter tüm endpoint'lerde aktif mi?
  - [ ] CORS yapılandırması doğru mu? (sadece güvenli origin'ler)
  - [ ] Input validasyonu (Zod) her endpoint'te var mı?
- [ ] **RBAC İkili Sistem:**
  - [ ] `rbac.ts` (eski) — hala import ediliyor mu?
  - [ ] `rbacService.ts` (yeni) — tüm modülleri kapsıyor mu?
  - [ ] Firestore rules RBAC sistemle tutarlı mı?

### 🎯 Teslimat
- `guvenlik-raporu.md`: Firestore rules güvenlik denetimi
- RBAC zayıflık raporu (eski/yeni sistem farkları)
- JWT güvenlik açığı değerlendirmesi (#9)
- KVKK güvenlik kontrol listesi (şifreleme, erişim, silme)
- creatorId doğrulama risk analizi
- Düzeltme öncelik sırası (kritik → yüksek → orta)

---

## 7. TOLGA YILMAZ — Cloud/DB Uzmanı

### 🔍 Odak Alanı
Firestore şema tasarımı, index performansı, serverless mimari, veri modeli optimizasyonu, query deseni, maliyet optimizasyonu.

### 📂 Denetlenecek Dosyalar

| Dosya | Satır | Boyut | İlgili Sorun |
|-------|-------|-------|-------------|
| `src/database/firestore-indexes.ts` | Tümü | 407 satır | Index dokümantasyonu + yönetimi |
| `firestore.indexes.json` | Tümü | 6 index | Mevcut composite index'ler |
| `firestore.rules` | Tümü | 148 satır | Erişim kuralları |
| `src/services/fascicleService.ts` | Tümü | 66 satır | `getAssignedFascicles` — yeni sorgu planı |
| `src/services/fascicleStorageService.ts` | 44-48 | viewCount increment — Firestore write cost |
| `src/services/analyticsEngine.ts` | 124, 367 | Analitik sorguları — read cost |
| `src/services/activityVisibilityManager.ts` | 118, 146 | Firestore persistence — write pattern |
| `src/services/messagingService.ts` | Tümü | Real-time onSnapshot — cost analizi |
| `src/services/worksheetService.ts` | Tümü | Worksheet CRUD + share queries |
| `src/services/rbacService.ts` | Tümü | RBAC settings — Firestore reads |
| `src/services/authService.ts` | Tümü | Auth + Firestore entegrasyonu |
| `src/database/schema.sql` | Tümü | SQL referans şeması |
| `src/store/useFascicleStore.ts` | 176-183 | localStorage → IndexedDB/Firestore geçişi |
| `src/services/teacherService.ts` | Tümü | Öğretmen sorguları — index coverage |
| `src/services/studentService.ts` | Tümü | Öğrenci sorguları |
| `scripts/firestore-reset-for-launch.mjs` | Tümü | Reset script — şema değişiklikleri |
| `firebase.json` | Tümü | Firebase yapılandırması |
| `vercel.json` | Tümü | Serverless yapılandırma |

### ✅ Kontrol Listesi
- [ ] **Index Coverage:**
  - [ ] Mevcut 6 index tüm sorguları kapsıyor mu?
  - [ ] `saved_worksheets` üzerinde 5 farklı sorgu deseni — index coverage tablosu
  - [ ] `getAssignedFascicles` (fascicleService) için yeni index gerekli mi?
  - [ ] `shared_profile_content` sorguları index'lenmiş mi?
- [ ] **Schema Tasarımı:**
  - [ ] `saved_worksheets`'de `sharedWith` array — ARRAY_CONTAINS performansı
  - [ ] Subcollection vs root collection kararları doğru mu?
  - [ ] `denormalization` pattern'i tutarlı mı? (örn: userId her belgede var mı?)
  - [ ] Document size limit (1MB) — fasikül içerikleri için risk var mı?
- [ ] **Query Deseni:**
  - [ ] Tüm sorgular `where` + `orderBy` + `limit` kullanıyor mu?
  - [ ] `!=` veya `NOT_IN` gibi pahalı sorgular var mı?
  - [ ] `in` sorguları 10 eleman sınırına dikkat ediyor mu?
  - [ ] `onSnapshot` kullanımı gereksiz real-time dinleme yapıyor mu?
- [ ] **Write Cost Optimizasyonu:**
  - [ ] `viewCount: increment(1)` yerine ayrı bir analytics koleksiyonu daha iyi olur mu?
  - [ ] `activityVisibilityManager` — sık yazma işlemi Firestore maliyeti
  - [ ] Batch writes kullanılıyor mu? (writeBatch)
  - [ ] `autoSaveDraft` (2sn debounce) yeterli mi? Debounce süresi optimize mi?
- [ ] **Serverless (Vercel):**
  - [ ] `api/` altındaki 10 endpoint — cold start süreleri
  - [ ] Edge functions vs Serverless Functions kararı doğru mu?
  - [ ] Firebase Admin SDK serverless'ta güvenli mi?
  - [ ] `vercel.json` — rewrites, headers, cron doğru yapılandırılmış mı?
- [ ] **Veri Modeli:**
  - [ ] `types.ts` vs `types/index.ts` — import karışıklığı (M3)
  - [ ] `constants.ts` vs `constants/` — monolithic 567 satır (M4)
  - [ ] Fazla koleksiyon var mı? (18+ koleksiyon — birleştirme önerisi?)
  - [ ] `fascicles/{fascicleId}` — subcollection olarak interactionLogs mantıklı mı?
- [ ] **Memory/Storage:**
  - [ ] `useFascicleStore` localStorage persist (#15) — IndexedDB geçişi gerekli mi?
  - [ ] Firebase Cache (persist) vs Firestore direct reads dengesi
  - [ ] `past` array sınırlaması (#10) — bellek optimizasyonu

### 🎯 Teslimat
- `cloud-db-raporu.md`: Mevcut Firestore şema diyagramı (koleksiyonlar, ilişkiler, alanlar)
- Index coverage matrisi (sorgu → index eşleme)
- Eksik index önerileri
- Write cost analizi (her servis için aylık tahmini yazma sayısı)
- Serverless performans raporu (cold start, memory, timeout)
- Şema migrasyon planı (öncelikli: fasikül + activity visibility)
- localStorage → IndexedDB geçiş stratejisi

---

## 📋 UYGULAMA PROGRAMI (4 HAFTA)

### Hafta 1 — Eşzamanlı Derinlemesine Analiz
| Gün | Sabah | Öğle | Akşam |
|-----|-------|------|-------|
| 1 | Elif + Ahmet (pedagoji + klinik) | Bora (servis TODO'ları) | Selin (AI güvenlik) |
| 2 | Caner (God Components) | Gizem (RBAC + Firestore rules) | Tolga (index + schema) |
| 3 | **Sentez:** Tüm raporlar birleştirme | Çapraz doğrulama | Önceliklendirme |
| 4 | **Kritik düzeltmeler** (gel.md Hafta 1) | Kod + test | PR + review |

### Hafta 2 — Servis İyileştirme
| Gün | Sabah | Öğle | Akşam |
|-----|-------|------|-------|
| 1 | Bora: servis stub'ları | Elif: pedagojik notlar | Tolga: index ekleme |
| 2 | Selin: AI optimizasyon | Caner: tema düzeltme | Gizem: RBAC hardening |
| 3 | Ahmet: KVKK denetimi | **Entegrasyon testleri** | Bug fix |
| 4 | **Orta öncelikli düzeltmeler** (gel.md Hafta 2) | Kod + test | PR + review |

### Hafta 3 — Analitik & UX
| Gün | Sabah | Öğle | Akşam |
|-----|-------|------|-------|
| 1 | Bora: analytics + streak | Selin: AI batch | Caner: God Component bölme |
| 2 | Tolga: serverless perf | Gizem: JWT fix | Ahmet: BEP SMART |
| 3 | Elif: ZPD + yeni aktivite | **E2E test** | Bug fix |
| 4 | **Yüksek öncelikli düzeltmeler** (gel.md Hafta 3) | Kod + test | PR + review |

### Hafta 4 — Güvenlik & Refactor
| Gün | Sabah | Öğle | Akşam |
|-----|-------|------|-------|
| 1 | Gizem: güvenlik denetimi | Tolga: şema migrasyon | Bora: test coverage |
| 2 | Caner: App.tsx refactor | Selin: prompt audit | Ahmet: MEB compliance |
| 3 | Elif: pedagoji final | **Load test** | Performance tuning |
| 4 | **Kritik + orta düzeltmeler** (gel.md Hafta 4) | Final PR | Kapanış raporu |

---

## 🔗 ÇAPRAZ BAĞIMLILIKLAR

```
FascicleCoverPage.tsx (satır 56-57)
  ├── Caner (Tailwind JIT fix) ← ÖNCELİKLİ
  └── Elif (renk psikolojisi pedagojisi)

sinavService.ts (satır 18)
  ├── Bora (userId fix) ← ÖNCELİKLİ
  ├── Ahmet (KVKK anonim kayıt)
  └── Selin (AI sınav üretimi)

fascicleService.getAssignedFascicles
  ├── Bora (Firestore sorgu) ← ÖNCELİKLİ
  ├── Tolga (index gerekiyor mu?)
  └── Gizem (creatorId doğrulama)

activityVisibilityManager.ts
  ├── Bora (Firestore persistence) ← ÖNCELİKLİ
  ├── Tolga (write cost)
  └── Gizem (erişim kontrolü)

jwtService.ts (satır 232)
  └── Gizem (güvenlik açığı) ← KRİTİK TEK BAŞINA

analyticsEngine.ts
  ├── Bora (fetch tamamlama)
  ├── Tolga (query optimizasyonu)
  └── Selin (AI analitik)

useFascicleStore.ts
  ├── Bora (past.slice, partialize)
  └── Tolga (IndexedDB stratejisi)
```

---

## 📊 RAPOR ŞABLONLARI

Her ajan, analiz tamamlandığında aşağıdaki formatta bir `<alan>-raporu.md` dosyası üretir:

```markdown
# [Alan Adı] — Detaylı Analiz Raporu
> **Tarih:** 2026-06-24 | **Analiz Eden:** [Ajan Adı]

## 🚨 KRİTİK BULGULAR
| # | Dosya | Satır | Sorun | Şiddet | Çözüm |
|---|-------|-------|-------|--------|-------|

## ⚠️ ORTA BULGULAR
...

## ✅ OLUMLU TESPİTLER
...

## 📈 İSTATİSTİKLER
- Toplam denetlenen dosya: N
- Kritik hata: N
- Orta: N
- Öneri: N

## 🎯 ÖNCELİKLİ EYLEMLER
1. [hedef tarih] ...

## 🔗 REFERANSLAR
- gel.md madde X
- İlgili dosya yolu:satır
```

---

## 🧪 DOĞRULAMA ADIMLARI (Tüm Değişiklikler İçin)

```
□ TypeScript strict: any yok, ?. ve ?? kullanıldı
□ AppError formatı korundu: { success, error: { message, code }, timestamp }
□ pedagogicalNote her AI aktivitesinde var
□ Tanı koyucu dil yok (disleksisi var → ...desteğine ihtiyacı var)
□ Lexend font değişmedi
□ KVKK: öğrenci adı + tanı + skor birlikte görünmüyor
□ Rate limiting yeni endpoint'te eklendi
□ Test yazıldı (vitest): npm run test:run
□ Build: npm run build
□ Lint: npm run lint
```

---

*Plan referansı: `gel.md` (513 satır, v2.5) + `AGENTS.md` (bdmind v2 Professional)*  
*Güncelleme: 2026-06-24 | Tüm ajanlar aktif | Derinlemesine analiz başlıyor*

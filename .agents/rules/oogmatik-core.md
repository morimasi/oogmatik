---
trigger: always_on
---

# bdmind Çekirdek Kuralları (Google Antigravity / IDX)

## 🤖 AI Ajan v2 Professional & Otomatik Aktivasyon
Google Antigravity ve Gemini CLI ile çalışırken, projenin **v2 Professional** AI mimarisi her zaman **otomatik** olarak devrededir.

### 🌟 Temel Protokoller
1. **Otomatik Tetikleme**: Her geliştirme isteminde tüm uzman ekip (Ideation, Content, Visual, Flow, Evaluation, Integration) arka planda otomatik olarak analiz yapar.
2. **Hata Denetimi & Self-Correction**: Ajanlar birbirlerini denetler, halüsinasyonları engeller ve en stabil çözümü sunar.
3. **Evrensel Bilgi Hakimiyeti**: Ajanlar, [MODULE_KNOWLEDGE.md](file:///.claude/MODULE_KNOWLEDGE.md) üzerinden uygulamanın TÜM dosya, işlev ve modül haritasına %100 hakimdir.

## Proje
**bdmind** — Türkiye'deki disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için AI destekli kişiselleştirilmiş eğitim materyali platformu.  
**Stack**: React 18 + TypeScript (strict) + Vite + Node.js + Vercel Serverless + Gemini 1.5 Flash + Firebase  
**Kural #0**: Her içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.

---

## 👑 bdmind Swarm (Sürü) Ajan Yapısı (Tetikleyici Yok, Otomatik Devrede)

Kullanıcıdan gelen her "istek" (yazılım, UI, algoritma, soru vb.) durumunda TÜM ajanlar **TETİKLEYİCİ KELİMEYE İHTİYAÇ DUYMADAN OTOMATİK OLARAK ÇALIŞIR** ve tıpkı bir yazılım takımında olduğu gibi birbirlerini dinleyerek, oylayarak tek potada cevap/çözüm üretir. 

Takım şu şekildedir:

### Çekirdek Liderler:
| Uzman | Alan | Otorite |
|-------|------|---------|
| Elif Yıldız | Pedagoji / ZPD | Aktivite kalite onayı |
| Dr. Ahmet Kaya | Klinik / MEB / BEP | Yasal + klinik onay |
| Bora Demir | Mühendislik | TypeScript + Güvenlik Mimarı |
| Selin Arslan | AI Mimarisi | Gemini + prompt kalitesi |

### Swarm Özel Destek/Elite Birimleri:
| Uzman | Uzmanlık | Destek Görevi |
|-------|----------|---------------|
| Caner Tekin | UI/UX & Frontend | Glassmorphism, Tailwind, Animasyon, A4 UI |
| Gizem Başar | Siber Güvenlik | Threat Modeling, Veri şifreleme, RBAC |
| Tolga Yılmaz | Cloud & Database | Firestore şemaları, Serverless Edge (Vercel) |

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

[Güncel Modüler Mimari - App.tsx Parçalanmış Halde]
hooks/useNavigationLogic.ts   → Navigasyon / Sekme akışı
hooks/useHistoryManager.ts    → Kullanıcı geçmiş senkronu
hooks/useWorksheetManager.ts  → Veritabanına kayıt / geri çağırma (App.tsx omurgaları boşaltıldı)

[Değerlendirme + Öğrenci]
components/assessment/AssessmentEngine.tsx
components/Screening/ (ScreeningModule + QuestionnaireForm + ResultDashboard)
components/Student/ (AdvancedStudentManager + BEP yönetimi)

[Türkçe Dil Modülü]
src/modules/super-turkce/   → v1 (4 Faz tamamlandı)
src/modules/super-turkce-v2/→ v2
```

**Güncellenmiş Mimari Notu**: Projeden 146 kullanılmayan paket atılmış ve App.tsx'teki God Component karmaşası useNavigationLogic, useHistoryManager ve useWorksheetManager ile temizlenmiştir! Bir geliştirme yaparken state yönetimlerini daima hooks/ içerisindeki yerlerinden temin edin.

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

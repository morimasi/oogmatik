# OOGMATIK — Gemini AI Ekip Koordinasyon Protokolü

> Bu dosya **Gemini CLI** (`gemini` komutu) ve **Google Antigravity** IDE tarafından otomatik okunur.
> Proje klasöründe bu araçlardan herhangi birini açtığında kurallar anında aktiftir.
> Google Project IDX ortam kurulumu: `.idx/dev.nix` | Agent kuralları: `.agents/rules/oogmatik-core.md`

---

## 🎯 Proje: Oogmatik EdTech Platformu

**Oogmatik**, Türkiye'deki disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için
AI destekli kişiselleştirilmiş eğitim materyalleri üreten bir EdTech platformudur.

- **Hedef Kitle**: 4–8. sınıf öğrencileri, özel eğitim öğretmenleri, veliler
- **Kritik Kısıt**: Her üretilen içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.
- **Müfredat**: MEB 2024-2025, LGS/PISA standartları
- **AI Altyapısı**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)

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

## 🏗️ Proje Mimarisi

```
oogmatik/
├── api/                    ← Vercel Serverless Functions
│   ├── generate.ts         ← Ana AI endpoint (POST /api/generate)
│   ├── feedback.ts         ← Geri bildirim
│   └── worksheets.ts       ← CRUD
├── services/
│   ├── geminiClient.ts     ← Gemini 2.5 Flash wrapper + JSON repair engine
│   ├── generators/         ← AI aktivite üreticileri (15+ generatör)
│   │   ├── dyslexiaSupport.ts
│   │   ├── readingComprehension.ts
│   │   └── clinicalTemplates.ts
│   ├── rateLimiter.ts
│   └── worksheetService.ts
├── types/                  ← TypeScript tip tanımları (18 dosya)
│   ├── student-advanced.ts ← StudentAIProfile, BEP tipleri
│   └── creativeStudio.ts   ← LearningDisabilityProfile, AgeGroup
├── components/
│   ├── AdminActivityManager.tsx  ← Drag-and-Drop müfredat yönetimi
│   ├── AdminDraftReview.tsx      ← Gemini Vision OCR + AI auto-fill
│   ├── AdminStaticContent.tsx    ← 10-versiyonluk snapshot sistemi
│   └── AdminDashboardV2.tsx      ← Dark Glassmorphism admin paneli
├── utils/
│   ├── AppError.ts         ← Merkezi hata yönetimi
│   └── schemas.ts          ← Zod validation
├── antigravity_report.md   ← Sprint 5 Admin Modülü referans raporu
└── tests/                  ← Vitest test suite
```

---

## ⚡ Tech Stack

```
Frontend:  React 18, Vite, TypeScript (strict), Tailwind CSS
Backend:   Node.js, Vercel Serverless Functions
AI:        Google Gemini 2.5 Flash (gemini-2.5-flash)
Database:  Firebase/Firestore
Test:      Vitest
Font:      Lexend (disleksi-dostu — DEĞİŞTİRME)
Deploy:    Vercel
```

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

// Yaş grupları
type AgeGroup = '5-7' | '8-10' | '11-13' | '14+';

// Standart hata — bu formatın dışına çıkma
class AppError { userMessage, code, httpStatus, details, isRetryable }

// API yanıt standardı
interface ApiResponse<T> { success: boolean; data?: T; error?: { message: string; code: string } }

// Mevcut AI modeli
const MASTER_MODEL = 'gemini-2.5-flash'; // değiştirme
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

# OOGMATIK — AI Ekip Koordinasyon Protokolü

> Bu dosya Claude Code (ve diğer AI araçlar) tarafından otomatik okunur.
> Proje klasöründe çalışmaya başladığın andan itibaren bu kurallar aktiftir.

---

## 🎯 Projenin Misyonu

**Oogmatik**, Türkiye'deki disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için
AI destekli kişiselleştirilmiş eğitim materyalleri üreten bir EdTech platformudur.

- **Hedef Kitle**: 4–8. sınıf öğrencileri, özel eğitim öğretmenleri, veliler
- **Kritik Kısıt**: Her üretilen içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.
- **Müfredat**: MEB 2024-2025, LGS/PISA standartları
- **AI Altyapısı**: Google Gemini 2.5 Flash (`MASTER_MODEL`), Anthropic Claude (BEP/analiz)

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

## 🏗️ Proje Mimarisi (Hızlı Referans)

```
oogmatik/
├── api/                    ← Vercel Serverless Functions
│   ├── generate.ts         ← Ana AI endpoint (POST /api/generate)
│   ├── feedback.ts         ← Geri bildirim endpoint
│   └── worksheets.ts       ← CRUD endpoint
├── services/
│   ├── geminiClient.ts     ← Gemini API wrapper + JSON repair engine
│   ├── generators/         ← AI aktivite üreticileri (15+ generatör)
│   │   ├── dyslexiaSupport.ts
│   │   ├── readingComprehension.ts
│   │   ├── readingStudio.ts
│   │   └── clinicalTemplates.ts
│   ├── offlineGenerators/  ← AI gerektirmeyen offline üreticiler
│   ├── worksheetService.ts ← CRUD operasyonları
│   ├── aiTemplateService.ts
│   └── rateLimiter.ts      ← Rate limiting servisi
├── components/             ← React bileşenleri (50+)
├── hooks/                  ← Custom React hooks
│   └── useWorksheets.ts    ← API entegrasyon hook'u
├── types/                  ← TypeScript tip tanımları
│   ├── student-advanced.ts ← StudentAIProfile, BEP tipleri
│   ├── creativeStudio.ts   ← LearningDisabilityProfile, AgeGroup
│   └── index.ts            ← Barrel exports
├── utils/
│   ├── AppError.ts         ← Merkezi hata yönetimi
│   ├── schemas.ts          ← Zod validation şemaları
│   └── errorHandler.ts     ← retry, logging utilities
├── middleware/
│   └── permissionValidator.ts
├── src/
│   └── modules/super-turkce/ ← Türkçe dil modülü
│       └── core/ai/          ← PromptEngine, geminiClient
└── tests/                  ← Vitest test suite
```

### Kritik Tip Tanımları

```typescript
// Tüm özel öğrenme profilleri
type LearningDisabilityProfile = 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed';

// Yaş grupları
type AgeGroup = '5-7' | '8-10' | '11-13' | '14+';

// Standart hata yapısı — BU FORMATIN DIŞINA ÇIKMA
class AppError { userMessage, code, httpStatus, details, isRetryable }

// API yanıt standardı
interface ApiResponse<T> { success: boolean; data?: T; error?: { message: string; code: string } }
```

---

## ⚡ Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18, Vite, TypeScript (strict), Tailwind CSS |
| Backend | Node.js, Vercel Serverless Functions |
| AI | Google Gemini 2.5 Flash (`gemini-2.5-flash`) |
| Veritabanı | Firebase/Firestore |
| Test | Vitest, React Testing Library |
| Font | Lexend (disleksi-dostu — değiştirme!) |
| Deploy | Vercel |

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

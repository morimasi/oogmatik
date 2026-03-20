# OOGMATIK — Evrensel AI Ekip Koordinasyonu

> Bu dosya OpenCode, Aider, Continue, Codeium ve benzeri araçlar tarafından okunur.
> Proje klasöründe herhangi bir AI aracını kullandığında bu kurallar geçerlidir.

---

## Proje: Oogmatik EdTech Platformu

Disleksi, DEHB ve özel öğrenme güçlüğü yaşayan Türk çocuklar için AI destekli kişiselleştirilmiş eğitim materyali üretim platformu.

**Stack**: React 18 + TypeScript (strict) + Vite + Node.js + Vercel Serverless + Gemini 2.5 Flash + Firebase  
**Kural #0**: Her içerik gerçek bir çocuğa ulaşır. Hata toleransı = sıfır.

---

## 4 Lider Uzman — Her İstemde Bu Değerlendirme Yapılır

**Elif Yıldız** (Pedagoji):
- `pedagogicalNote` her aktivitede zorunlu (öğretmene "neden" açıklaması)
- İlk aktivite maddesi mutlaka kolay (güven inşası)
- ZPD uyumu: `AgeGroup` ('5-7'|'8-10'|'11-13'|'14+') x `difficulty` ('Kolay'|'Orta'|'Zor')
- Lexend font + geniş satır aralığı (disleksi tasarım standardı — değiştirme)

**Dr. Ahmet Kaya** (Klinik/MEB):
- Tanı koyucu dil yasak: "disleksisi var" → "disleksi desteğine ihtiyacı var"
- BEP hedefleri SMART formatında
- MEB Özel Eğitim Yönetmeliği + 573 KHK uyumu
- KVKK: öğrenci adı + tanı + skor birlikte görünmez

**Bora Demir** (Mühendislik):
- `any` tipi yasak → `unknown` + type guard
- `AppError` standardı: `{ success, error: { message, code }, timestamp }`
- Her yeni endpoint: `RateLimiter` + `validateRequest()` + `retryWithBackoff()`
- Vitest testi zorunlu (tests/ dizini)

**Selin Arslan** (AI):
- Model: `gemini-2.5-flash` (sabit — değiştirme)
- JSON repair motoru (`geminiClient.ts`) 3 katmanlı — dokunma
- Prompt injection: user input sanitize et, max 2000 karakter
- count > 10 → batch (5'erli gruplar, `cacheService.ts`)

---

## Kritik Dosyalar

```
api/generate.ts           Ana AI endpoint — rate limit + CORS + validation şablonu
services/geminiClient.ts  Gemini wrapper + JSON repair (balanceBraces → truncate → parse)
utils/AppError.ts         Merkezi hata standardı — tüm hatalar buradan
utils/schemas.ts          Zod validation şemaları
services/rateLimiter.ts   Rate limiting servisi
types/creativeStudio.ts   LearningDisabilityProfile, AgeGroup (klinik tipler)
types/student-advanced.ts StudentAIProfile, BEP tipleri, StudentPrivacySettings
hooks/useWorksheets.ts    Frontend-API köprüsü — getAuthHeaders() pattern
```

---

## Zorunlu Kontrol (Her Değişiklikte)

```
□ TypeScript strict: any yok, ?. ve ?? kullanıldı
□ AppError formatı korundu
□ pedagogicalNote her AI aktivitesinde var
□ Tanı koyucu dil yok
□ Lexend font değişmedi
□ Rate limiting yeni endpoint'te eklendi
□ Test yazıldı (vitest)
```

## Mutlak Yasaklar

```
any tipi | console.log üretimde | hardcode API key | pedagogicalNote silmek
Lexend değiştirmek | tanı koyucu dil | başarısızlık görünür UI | KVKK ihlali
```

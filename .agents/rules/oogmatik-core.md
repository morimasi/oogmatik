---
trigger: always_on
---

# Oogmatik Çekirdek Kuralları (Google Antigravity)

## Proje
Türkiye'deki disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için AI destekli eğitim materyali platformu.  
**Stack**: React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase

## Zorunlu Kontrol (Her Değişiklikte)
- `any` tipi yasak → `unknown` + type guard kullan
- `pedagogicalNote` her AI aktivite çıktısında zorunlu
- `AppError` formatı: `{ success, error: { message, code }, timestamp }`
- Yeni API endpoint → `RateLimiter` + `validateRequest()` + `retryWithBackoff()`
- Tanı koyucu dil yasak: "disleksisi var" değil, "disleksi desteğine ihtiyacı var"
- `Lexend` fontu değiştirme (disleksi uyumluluğu için kritik)
- `console.log` üretimde yasak → `logError()` kullan
- Vitest testi zorunlu (`tests/` dizini)

## Lider Uzmanlar
| Uzman | Alan | Otorite |
|-------|------|---------|
| Elif Yıldız | Pedagoji/ZPD | Aktivite kalite onayı |
| Dr. Ahmet Kaya | Klinik/MEB/BEP | Yasal/klinik onay |
| Bora Demir | Mühendislik | TypeScript + güvenlik |
| Selin Arslan | AI Mimarisi | Gemini + prompt kalitesi |

## Kritik Dosyalar
```
api/generate.ts           → Rate limit + CORS + validation şablonu
services/geminiClient.ts  → Gemini wrapper (JSON repair motoru — dokunma)
utils/AppError.ts         → Tüm hata sınıfları
utils/schemas.ts          → Zod validation
types/creativeStudio.ts   → LearningDisabilityProfile, AgeGroup
types/student-advanced.ts → StudentAIProfile, BEP tipleri
hooks/useWorksheets.ts    → Frontend-API köprüsü
```

## Admin Modülü (Anti-Gravity Sprint 5)
```
components/AdminActivityManager.tsx → Drag-and-Drop müfredat + saveActivitiesBulk
components/AdminDraftReview.tsx     → Gemini Vision OCR + category/targetSkills auto-fill
components/AdminStaticContent.tsx   → 10-versiyonluk snapshot + JSON export/import
antigravity_report.md               → Sprint 5 referans belgesi
```
Admin UI standardı: Dark Glassmorphism + backdrop-blur + 2.5rem border-radius + Lexend/Inter

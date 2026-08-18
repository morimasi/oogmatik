---
description: Etkinlik ve stüdyo dışındaki platform modüllerinde (store, hooks, services, utils, types, API, admin, auth vb.) değişiklik yapılırken uyulması ZORUNLU olan kontrol listesi
---

# Genel Modül Değişikliği Kontrol Listesi

> **KAPSAM**: Bu kurallar etkinlik (`activities`) ve stüdyo (`studios`) dışındaki tüm modüller için geçerlidir: Store, Hooks, Services, Utils, Types, API Endpoints, Admin Panel, Auth, Middleware vb.

---

## Modül Haritası

| Katman | Dizin | Örnek Dosyalar |
|---|---|---|
| **API** | `api/` | `generate.ts`, `feedback.ts`, `worksheets.ts`, `export-pdf.ts` |
| **Services** | `services/` | `geminiClient.ts`, `authService.ts`, `cacheService.ts`, `rateLimiter.ts` |
| **Store** | `store/` | `useAppStore.ts`, `useAuthStore.ts`, `useWorksheetStore.ts` |
| **Hooks** | `hooks/` | `useNavigationLogic.ts`, `useHistoryManager.ts`, `useWorksheetManager.ts` |
| **Utils** | `utils/` | `AppError.ts`, `errorHandler.ts`, `schemas.ts`, `printService.ts` |
| **Types** | `types/` | `index.ts`, `core.ts`, `activity.ts`, `student.ts`, `admin.ts` |
| **Admin** | `components/AdminDashboard/` | `AdminDashboardV2.tsx`, `AdminActivityManager.tsx` |
| **Auth** | `services/authService.ts` | Firebase Auth + JWT |
| **Middleware** | `middleware/` | `permissionValidator.ts` |

---

## BÖLÜM A — GENEL DEĞİŞİKLİK KURALLARI

### A1. API Endpoint Değişiklikleri (`api/`)
- ✅ Her endpoint `RateLimiter` + `CORS` + `Zod validation` içermeli.
- ✅ Yanıt formatı `ApiResponse<T>` standardında: `{ success, data?, error?, timestamp }`.
- ✅ `process.env.GEMINI_API_KEY` — API key hardcode YASAK.
- ✅ Hata durumunda `AppError` fırlat, `try-catch` ile sarmalama.
- ✅ `retryWithBackoff()` ile ağ hatalarını yönet.

### A2. Servis Katmanı Değişiklikleri (`services/`)
- ✅ `geminiClient.ts` — **DOKUNMA!** (JSON repair motoru hassas, değiştirme).
- ✅ Her yeni servis fonksiyonunda `logError()` ile hata loglama (`console.log` YASAK).
- ✅ Firestore CRUD işlemleri `firebaseClient.ts` üzerinden standardize.
- ✅ Cache işlemleri `cacheService.ts` (IndexedDB) üzerinden.

### A3. State (Store) Değişiklikleri (`store/`)
- ✅ Store action'ları tam tiplenmiş olmalı (`any` YASAK).
- ✅ Store içinde API çağrısı YASAK → Servis katmanına delege et.
- ✅ `persist` middleware sadece user tercihleri için (büyük data YASAK).
- ✅ Yeni store alanı eklerken, bu alanı kullanan TÜM bileşenleri güncelle.

### A4. Hook Değişiklikleri (`hooks/`)
- ✅ Hook adlandırma: `use<Amaç>.ts` (ör: `useNavigationLogic.ts`).
- ✅ Hook, tek sorumluluk prensibine uymalı.
- ✅ Hook içinde doğrudan DOM manipülasyonu YASAK → React ref kullan.
- ✅ Hook değişikliğinde, bu hook'u kullanan TÜM bileşenleri kontrol et.

### A5. Tip Değişiklikleri (`types/`)
- ✅ Yeni tip eklerken `types/index.ts` barrel export dosyasını güncelle.
- ✅ Tip silme/değiştirme durumunda **tüm import noktalarını** kontrol et.
- ✅ `LearningDisabilityProfile`, `AgeGroup`, `Difficulty`, `UserRole` → bunlar sabit. Değiştirme.
- ✅ `ActivityType` enum'una yeni değer eklerken `constants/activities.ts`'i de güncelle.

### A6. Utils Değişiklikleri (`utils/`)
- ✅ `AppError.ts` — Merkezi hata sınıfı. Format: `{ userMessage, code, httpStatus, isRetryable }`.
- ✅ `schemas.ts` — Tüm API girişleri buradan doğrulanmalı (Zod).
- ✅ `errorHandler.ts` — `retryWithBackoff()`, `logError()`, `wrapAsync()` burada.
- ❌ Yeni bir hata yönetim mekanizması icat etme — mevcut standardı kullan.

### A7. Admin Panel Değişiklikleri (`components/AdminDashboard/`)
- ✅ Dark glassmorphism UI standardı korunmalı.
- ✅ RBAC (`rbac.ts`) ile yetki kontrolü yapılmalı.
- ✅ Veri tabloları `saveActivitiesBulk` ile batch kayıt yapabilmeli.
- ✅ Admin-only veriler `KVKK uyumlu` — öğrenci adı + tanı + skor birlikte görünmez.

### A8. Auth/Middleware Değişiklikleri
- ✅ JWT doğrulama `jwtService.ts` üzerinden.
- ✅ RBAC kuralları `rbac.ts` ve `permissionValidator.ts` üzerinden.
- ✅ Yeni rol/yetki eklerken `UserRole` tipini ve RBAC matrisini güncelle.

---

## BÖLÜM B — ÇAPRAZ ETKİ ANALİZİ

> Bir modülde değişiklik yaparken, o modülün **hangi diğer modülleri etkilediğini** kontrol et.

### Etki Matrisi

| Değişen Modül | Kontrol Edilecekler |
|---|---|
| `types/activity.ts` | `constants/activities.ts`, `registry.ts`, tüm jeneratörler, tüm config'ler |
| `store/useAppStore.ts` | `App.tsx`, `Sidebar.tsx`, `useNavigationLogic.ts`, tüm stüdyolar |
| `services/authService.ts` | `store/useAuthStore.ts`, `middleware/permissionValidator.ts`, tüm API endpoint'leri |
| `utils/AppError.ts` | Tüm `try-catch` blokları, tüm API endpoint'leri |
| `services/cacheService.ts` | `aiContentService.ts`, tüm jeneratörler |
| `hooks/useNavigationLogic.ts` | `App.tsx`, `Sidebar.tsx`, tüm menü bağlantıları |

---

## BÖLÜM C — DOĞRULAMA ADIMLARI

// turbo-all

1. **TypeScript Doğrulama**: `npx tsc --noEmit` — Sıfır tip hatası
2. **Çapraz Etki Kontrolü**: Değiştirilen modülü kullanan diğer dosyaları `grep` ile tara
3. **Store Tutarlılığı**: Eklenen/silinen store alanlarının tüm tüketicilerini kontrol et
4. **API Uyumu**: Endpoint değişikliğinde frontend çağrılarını güncelle
5. **Git Push**: `git add . && git commit -m "feat/fix(modul-adi): açıklama" && git push origin main`

---

## BÖLÜM D — MUTLAK YASAKLAR (Proje Geneli)

- ❌ `any` tipi → `unknown` + type guard kullan
- ❌ `console.log` → `logError()` kullan
- ❌ API key hardcode → `process.env.GEMINI_API_KEY`
- ❌ `geminiClient.ts`'e dokunmak (JSON repair motoru hassas)
- ❌ `pedagogicalNote` silmek (her AI çıktısında zorunlu)
- ❌ `Lexend` fontunu değiştirmek (disleksi uyumu)
- ❌ Tanı koyucu dil kullanmak ("disleksisi var" değil → "disleksi desteğine ihtiyacı var")
- ❌ Öğrenci başarısızlığını kamuya açan UI oluşturmak
- ❌ KVKK ihlali (öğrenci adı + tanı + skor birlikte gösterilmez)
- ❌ Store içinde API çağrısı yapmak
- ❌ Yeni hata yönetim mekanizması icat etmek (AppError standardı var)

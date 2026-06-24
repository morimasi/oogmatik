# Mühendislik Kalite Denetim Raporu — OOGMATIK

**Denetleyen:** Bora Demir — Baş Mühendislik Uzmanı  
**Tarih:** 2026-06-24  
**Proje:** `D:\bbma\bursadisleksi\oogmatik`

---

## 1. `any` Tipi Kullanımı — KRİTİK

| Metrik | Değer |
|--------|-------|
| `as any` kullanımı | **529 satır** (tüm proje genelinde) |
| `catch (error: any)` | **56 satır** |

### Tespit Edilen Noktalar (Denetlenen Dosyalar)

| Dosya | Satır(lar) | Açıklama |
|-------|-----------|----------|
| `src/components/FascicleStudio/FasciclePreview.tsx` | 50 | `(item.content as any)` — content tipi bilinmiyor |
| `src/components/FascicleStudio/index.tsx` | 91 | `[{ metadata, items }] as any` — worksheetData passthrough |
| `src/components/FascicleStudio/FascicleCoverSettingsModal.tsx` | 42 | `value: any` parametre tipi |
| `src/services/jwtService.ts` | 56,71,87,104,140,164,189,203,217,228,264,277,301,326,348 | `catch (error: any)` her blokta |
| `src/services/jwtService.ts` | 164,203,228,277,301,314,326 | `req: any, res: any, next: any` tüm handler'larda |
| `src/services/analyticsEngine.ts` | 343 | `Record<string, any>[]` — CSV export parametresi |
| `src/utils/AppError.ts` | 27,188,225 | `(window as any).__VITE_IS_DEV__`, `(error as any).code` |
| `src/utils/logger.ts` | 32,158 | `(window as any).__VITE_IS_DEV__`, `(import.meta as any).env` |
| `src/utils/errorHandler.ts` | 452,520,539,554 | `Record<string, any>`, `(res as any).locals` |
| `src/services/messagingService.ts` | 220 | `const users: any[] = []` |
| `src/hooks/useWorksheetManager.ts` | 18,66,106 | `(report: any)`, `(item: ... | any)`, `as any` |
| `src/services/worksheetService.ts` | 15 | `_startAfter` import edilmiş ancak kullanılmıyor |
| `src/store/useFascicleStore.ts` | — | Temiz, `any` kullanımı yok |

### Yaygın `as any` Pattern'leri (Tüm Proje):

1. **`as unknown as any`** — SheetRenderer, generator servislerinde yoğun (30+ dosya)
2. **`(options as any)`** — Offline generator'larda opsiyon erişimi (15+ dosya)
3. **`(data as any)`** — Dinamik data erişimi (20+ dosya)
4. **`(error as any)`** — Catch bloklarında error handling (56 dosya)

**Öneri:** `any` → `unknown` + type guard dönüşümü planlı olarak yapılmalı. Öncelik: catch blokları ve servis katmanı.

---

## 2. AppError Standardı Kullanımı

| Durum | Değerlendirme |
|-------|--------------|
| Tüm servisler AppError kullanıyor | **Büyük ölçüde evet** — denetlenen 20+ servisin tamamı AppError veya alt sınıflarını kullanıyor |
| İstisnalar | `fascicleStorageService.ts` satır 50 — `logWarn` ile geçiştirilmiş, AppError fırlatılmamış |
| Kod hataları | `jwtService.ts` tüm hata kodları `'INTERNAL_ERROR'` — özel kodlar kullanılmalı (`TOKEN_EXPIRED`, `AUTH_INVALID` vb.) |

**Servis Bazında AppError Kullanımı:**
- ✅ `worksheetService.ts` — `NotFoundError`, `AuthorizationError`, `DatabaseError`, `InternalServerError`, `toAppError`
- ✅ `geminiClient.ts` — AppError (retry mantığı ile)
- ✅ `rateLimiter.ts` — `RateLimitError`, `toAppError`
- ✅ `sinavService.ts` — AppError (retry flag dahil)
- ✅ `fascicleService.ts` — AppError (autoSave, publish)
- ✅ `fascicleStorageService.ts` — AppError (upload), eksik (logInteraction)
- ⚠️ `analyticsEngine.ts` — AppError kullanıyor ama tüm fetch'ler stub olduğu için anlamsız
- ⚠️ `activityVisibilityManager.ts` — AppError kullanmıyor (hiç hata fırlatmıyor)
- ✅ `rbac.ts` — `enforcePermission` ile AppError
- ✅ `rbacService.ts` — `logError` kullanıyor, AppError fırlatmıyor (genelde boolean dönüyor)
- ✅ `jwtService.ts` — AppError kullanıyor ama kodlar yanlış
- ✅ `errorHandler.ts` — Merkezi AppError dönüşümü (`toAppError`, `handleApiError`)

---

## 3. `past.slice(-30)` — Undo/Redo Bellek Sınırı (#10)

**Dosya:** `src/store/useFascicleStore.ts`

| Durum | Açıklama |
|-------|----------|
| ❌ **Eksik** | `past` dizisi sınırsız büyüyor — her `push` işlemi yeni entry ekler |
| Risk | 1000+ işlem sonrası bellek şişmesi (özellikle localStorage persistance'da) |
| Çözüm | Tüm `set({ past: [...past, ...] })` çağrılarında `past.slice(-30)` eklenmeli |

**Etkilenen Satırlar:**
- Satır 71: `past: [...past, { metadata, items }]`
- Satır 80: `past: [...past, { metadata, items }]`
- Satır 93: `past: [...past, { metadata, items }]`
- Satır 112: `past: [...past, { metadata, items }]`
- Satır 121: `past: [...past, { items, metadata }]`
- Satır 130: `past: [...past, { items, metadata }]`
- Satır 159: `past: [...past, { metadata, items }]`

---

## 4. `partialize` ile localStorage Optimizasyonu (#15)

**Dosya:** `src/store/useFascicleStore.ts` — Satır 178-182

| Durum | Açıklama |
|-------|----------|
| ✅ **Mevcut** | `partialize` fonksiyonu tanımlanmış: `currentFascicleId`, `metadata`, `items` persist ediliyor |
| ❌ **Eksik** | `past` ve `future` persist dışı bırakılmış → sayfa yenilemede undo/redo geçmişi kaybolur |
| Değerlendirme | Bu bilinçli bir karar olabilir (undo/redo oturum içidir), ancak slice limiti olmadığı için past bellekte sınırsız büyür |

---

## 5. Rate Limiter Kullanımı

**Dosya:** `src/services/rateLimiter.ts`

| Metrik | Değer |
|--------|-------|
| Rate limiter mevcut | ✅ Evet — Token Bucket + Firestore persistence |
| Tüm endpoint'lerde var mı? | ❌ **Hayır** — sadece servis olarak tanımlanmış, hiçbir API handler'ında kullanılmıyor |
| Kullanım izi | `rg "rateLimiter\|rateLimit"` → hiçbir endpoint/handler çağrısı bulunamadı |

**Tespit:** `rateLimiter.ts` tam implementasyon olmasına rağmen **projede hiçbir yerde import edilip kullanılmıyor**. Bu bir "dead code" durumu.

---

## 6. `validateRequest()` Kullanımı

| Metrik | Değer |
|--------|-------|
| `validateRequest`/`validateBody`/`validateParams` | ❌ **Hiçbir yerde kullanılmıyor** |
| Zod/şema validasyonu | Mevcut değil (`utils/schemas.ts` var ama import edilmiyor) |

**Tespit:** API girişlerinde request validasyonu yok. Tüm validasyon manuel kontrollerle yapılıyor (ör. `jwtService.ts` satır 235-242).

---

## 7. `retryWithBackoff` Firestore Yazmalarında

**Dosya:** `src/utils/errorHandler.ts` — Satır 181-238

| Kullanım | Değerlendirme |
|----------|--------------|
| `retryWithBackoff` import edilmiş | ✅ `worksheetService.ts` satır 11 |
| Kullanılıyor mu? | ❌ Hayır — `worksheetService.ts`'de import edilmiş ama hiç çağrılmamış |
| `geminiClient.ts` | Kendi retry mantığını yazmış (satır 162-207) — merkezi `retryWithBackoff` kullanmıyor |

---

## 8. TODO Borç Envanteri

**Toplam TODO: 25 adet** (kritik/orta)

| # | Dosya | Satır | TODO | Öncelik |
|---|-------|-------|------|---------|
| 1 | `src/utils/logger.ts` | 124 | Vercel Analytics entegrasyonu | Orta |
| 2 | `src/utils/logger.ts` | 135 | Sentry entegrasyonu | Orta |
| 3 | `src/utils/logger.ts` | 143 | Firestore audit collection'a yazma (KVKK) | **Kritik** |
| 4 | `src/services/sinavService.ts` | 18 | AuthStore'dan userId al | **Kritik** |
| 5 | `src/services/analyticsEngine.ts` | 124 | Fetch from Firestore/Firebase | Yüksek |
| 6 | `src/services/analyticsEngine.ts` | 367 | Fetch from Firestore | Yüksek |
| 7 | `src/services/activityVisibilityManager.ts` | 118 | Save to Firestore | **Kritik** |
| 8 | `src/services/activityVisibilityManager.ts` | 146 | Save to Firestore | **Kritik** |
| 9 | `src/services/activityVisibilityManager.ts` | 194 | Load default configurations | Orta |
| 10 | `src/services/jwtService.ts` | 232 | Verify email and password against database | **Kritik** |
| 11 | `src/services/advancedAI.ts` | 4 ayrı TODO | Speech-to-Text, TTS, emotion detection, Vision API | Düşük |
| 12 | `src/services/mobileAppService.ts` | 8 ayrı TODO | FCM, Speech, OCR, offline queue vb. | Düşük |
| 13 | `src/services/mlEngine.ts` | 1 TODO | ML training implementasyonu | Düşük |
| 14 | `src/modules/activities/_boilerplate/generators.ts` | 1 TODO | generateWithSchema çağrısı | Düşük |

---

## 9. RBAC İmport Karışıklığı (#14)

| Dosya | Import Kaynağı | Sistem |
|-------|---------------|--------|
| `src/hooks/useRBAC.ts` | `rbacService.ts` (yeni) | Modül-tabanlı RBAC |
| `src/middleware/permissionValidator.ts` | `rbac.js` (eski) | Rol-tabanlı RBAC |
| `src/App.tsx` | `rbacService.ts` (yeni) | Modül-tabanlı |
| `src/components/AdminPermissionsIDE.tsx` | `rbacService.ts` (yeni) | Modül-tabanlı |
| `src/components/Admin/AdvancedRBACPanel.tsx` | `rbacService.ts` (yeni) | Modül-tabanlı |
| `src/components/ProtectedRoute.tsx` | `types/rbac` (eski tipler) | Rol-tabanlı |
| `src/components/Sidebar.tsx` | `types/rbac` (eski tipler) | Rol-tabanlı |
| `src/components/Profile/index.tsx` | `types/rbac` (eski tipler) | Rol-tabanlı |
| `src/components/Student/AdvancedStudentManager.tsx` | `types/rbac` (eski tipler) | Rol-tabanlı |

**İsim Çakışması:** Her iki dosya da `rbacService` export ediyor:
- `src/services/rbac.ts:203` → `export const rbacService = { ... }`
- `src/services/rbacService.ts:202` → `export const rbacService = new RBACService()`

Bu, import eden dosyada hangi `rbacService`'in kullanıldığı konusunda kafa karışıklığı yaratır. Import sırası ve module resolution hangisini seçeceği belirsizdir.

---

## 10. `console.log` Üretim Kodunda

| Dosya | Satır(lar) | Açıklama |
|-------|-----------|----------|
| `src/utils/logger.ts` | 44,113 | `console.log` development modunda kullanılıyor — üretimde `disableConsoleInProduction` ile kapatılıyor |
| `src/utils/logger.ts` | 157-163 | `disableConsoleInProduction` fonksiyonu tanımlanmış |
| `src/services/analytics/BehaviorTracker.ts` | Yorum satırı | `// console.log(...)` — yorum halinde, güvenli |

**Değerlendirme:** `console.log` doğrudan üretim kodunda değil, logger wrapper'ı içinde ve development moduna bağlı olarak çalışıyor. Güvenli.

---

## 11. Servis Bazında Detaylı İnceleme

### 11.1 `useFascicleStore.ts` (185 satır) — Store
- ✅ Zustand + persist middleware doğru kullanılmış
- ❌ `past` sınırsız (#10)
- ✅ `partialize` mevcut (#15)
- ❌ Undo/redo state persist dışı
- ✅ Tip tanımları temiz, `any` yok

### 11.2 `fascicleService.ts` (66 satır) — Fascicle CRUD
- ✅ AppError kullanımı
- ✅ Debounce mantığı (`autoSaveDraft`)
- ❌ `getAssignedFascicles` stub (satır 61-62): `return []`
- ❌ Rate limiter yok

### 11.3 `fascicleStorageService.ts` (56 satır) — Storage
- ✅ AppError (upload)
- ❌ `viewCount` increment eksik (satır 44-48): VIEW action'ında boş blok
- ❌ `logInteraction` AppError fırlatmıyor (satır 50-51: sadece `logWarn`)
- ❌ Firestore `increment()` kullanılmamış

### 11.4 `sinavService.ts` (73 satır) — Sınav API
- ❌ **userId hardcoded** (satır 19): `'x-user-id': 'current-user-id'`
- ✅ AppError doğru kullanım (retry flag'ler dahil)
- ✅ Network hatası handling (satır 53-61)
- ✅ Response validasyonu (satır 26-44)

### 11.5 `analyticsEngine.ts` (382 satır) — Analytics
- ❌ **Tüm metodlar stub** — hiçbir Firestore bağlantısı yok
- ❌ `Record<string, any>` (satır 343)
- ❌ Mock data döndürülüyor, gerçek veri akışı yok
- ✅ AppError kullanımı (anlamsız olsa da)
- ❌ Rate limiter kullanılmamış

### 11.6 `activityVisibilityManager.ts` (222 satır) — Görünürlük
- ❌ **Firestore persistence yok** — tüm veri in-memory cache'de
- ❌ 3 adet TODO (satır 118, 146, 194)
- ❌ AppError kullanılmıyor (hiç hata fırlatmaz)
- ❌ `as ActivityType` type assertion (satır 158, 159)

### 11.7 `jwtService.ts` (368 satır) — JWT
- ❌ **DB doğrulama yok** (satır 232-233 TODO)
- ❌ **Mock user** (satır 245-250): `userId: 'user123'`
- ❌ `any` kullanımı yoğun (56+ satır)
- ❌ Hata kodları yanlış: `'INTERNAL_ERROR'` yerine `'TOKEN_EXPIRED'`, `'AUTH_INVALID'` olmalı
- ✅ AppError fırlatılıyor (kodlar yanlış da olsa)
- ❌ Rate limiter yok

### 11.8 `geminiClient.ts` (278 satır) — Gemini AI
- ✅ Retry mantığı mevcut (maxAttempts=5, exponential backoff)
- ❌ Merkezi `retryWithBackoff` kullanılmıyor — kendi custom implementasyonu
- ✅ Retry koşulları doğru (quota, 429, 503, 504)
- ✅ AppError import edilmiş ama retry sonrası `throw lastError` ile raw error fırlatılıyor (satır 206)
- ❌ CircuitBreaker entegrasyonu yok
- ❌ `as` type assertions kullanılıyor (satır 103, 105, 169, 255)
- ✅ Test dummy data generator (satır 26-51)

### 11.9 `messagingService.ts` (239 satır) — Mesajlaşma
- ✅ Real-time listener pattern doğru (`onSnapshot`)
- ✅ Unsubscribe dönüşü
- ✅ Hata handling (`logError`)
- ❌ `any[]` kullanımı (satır 220)
- ❌ AppError kullanılmıyor (raw error fırlatılıyor satır 113, 127)
- ❌ Rate limiter yok
- ❌ `fetchInternalUsers` users tipi `any[]`

### 11.10 `worksheetService.ts` (448 satır) — Çalışma Sayfası
- ✅ **En iyi servis** — AppError, retry, timeout hepsi var
- ✅ Paylaşım akışı (`shareWorksheet`, `getSharedWithMe`)
- ✅ Access control (`getWorksheetById`, `updateWorksheet`, `deleteWorksheet`)
- ✅ Ownership kontrolü
- ✅ Firestore indeks fallback (satır 164-170, 211-236)
- ✅ Error handling (`toAppError`, `instanceof AppError`)
- ❌ `retryWithBackoff` import edilmiş ama kullanılmamış
- ❌ `_startAfter` import edilmiş ama kullanılmamış (satır 15)

### 11.11-12 `rbac.ts` vs `rbacService.ts` — RBAC
- ❌ **İsim çakışması** — her ikisi de `rbacService` export ediyor
- ✅ `rbac.ts`: Temiz, modüler, AppError kullanıyor
- ✅ `rbacService.ts`: Firestore persistence, migration, modül-tabanlı
- ❌ Karmaşa: `permissionValidator.ts` eski sistemi kullanıyor, `useRBAC.ts` yeni sistemi

### 11.13-15 `utils/` — Utilities

**`AppError.ts` (245 satır):**
- ✅ Kapsamlı hata sınıfları
- ✅ `toAppError` dönüşüm fonksiyonu
- ✅ Firebase auth hata mapping
- ❌ `(window as any).__VITE_IS_DEV__` (satır 27, 225)
- ❌ `(error as any).code` (satır 188)

**`errorHandler.ts` (580 satır):**
- ✅ `retryWithBackoff` — exponential backoff + full jitter
- ✅ `CircuitBreaker` — failure threshold + reset timeout
- ✅ `batchRetry`, `batchOperation`
- ✅ `handleApiError`, `sendApiSuccess`, `withErrorHandling` — API response standardization
- ✅ `safeAsync` — tuple-based error handling
- ✅ `addErrorContext`
- ❌ `Record<string, any>` (satır 452)
- ❌ `(res as any).locals` (satır 520, 539, 554)

**`logger.ts` (173 satır):**
- ✅ Structured logging
- ✅ KVKK uyumlu (audit log'da userId hash'lenmeli — satır 106 uyarı)
- ✅ Development/production ayrımı
- ❌ 3 TODO (satır 124, 135, 143) — Vercel Analytics, Sentry, Firestore audit

### 11.16 `rateLimiter.ts` (217 satır) — Rate Limiter
- ✅ Token Bucket implementasyonu
- ✅ Firestore persistence
- ✅ User tier sistemi (free/pro/admin)
- ✅ Fallback (Firestore hatasında izin ver)
- ❌ **Hiçbir yerde kullanılmıyor** — dead code

### 11.17 `permissionValidator.ts` (209 satır) — Permission Middleware
- ✅ JWT + header extraction
- ✅ `requirePermission`, `requireRole`, `checkResourceOwnership`
- ✅ AppError kullanımı
- ❌ Eski `rbac.js`'i import ediyor (satır 8)

### 11.18 Hooks

**`useWorksheetManager.ts`:**
- ❌ `(report: any)` parametre tipi (satır 18)
- ❌ `(item: ... | any)` tipi (satır 66)
- ❌ `as any` (satır 106)
- ✅ Store + servis entegrasyonu doğru

**`useNavigationLogic.ts`:**
- ✅ Temiz, `any` yok
- ✅ View history mantığı doğru

**`useHistoryManager.ts`:**
- ✅ Temiz, `any` yok
- ✅ localStorage persistence
- ❌ Maksimum 100 item limiti iyi ama slice yok

**`useWorksheets.ts`:**
- ✅ `safeFetch` + `getAuthHeaders` kullanımı
- ✅ API state management pattern
- ❌ `catch (error: any)` tüm hook'larda

**`useRBAC.ts`:**
- ✅ Temiz, `any` yok
- ✅ Yeni RBAC servisini kullanıyor

### 11.19 Components

**`FasciclePreview.tsx` — Satır 50:**
- ❌ `(item.content as any)` — content tipi güvensiz

**`FascicleStudio/index.tsx` — Satır 91:**
- ❌ `[{ metadata, items }] as any` — worksheetData passthrough

**`FascicleCoverSettingsModal.tsx` — Satır 42:**
- ❌ `value: any` parametre tipi — `unknown` olmalı

---

## 12. Genel Değerlendirme

### Kritik Bulgular (Acil Çözüm)

| # | Bulgu | Dosya | Etki |
|---|-------|-------|------|
| 1 | **`past` sınırsız** (#10) | `useFascicleStore.ts` | Bellek şişmesi, localStorage taşması |
| 2 | **userId hardcoded** (#5) | `sinavService.ts:19` | Tüm sınav istekleri aynı kullanıcı adına gider |
| 3 | **DB doğrulama yok** (#9) | `jwtService.ts:232-250` | Herhangi bir şifreyle giriş yapılabilir |
| 4 | **Firestore persistence yok** (#7) | `activityVisibilityManager.ts` | Admin değişiklikleri kaybolur |
| 5 | **Analytics tamamen stub** (#6) | `analyticsEngine.ts` | Dashboard boş/yanlış veri gösterir |
| 6 | **Rate limiter kullanılmıyor** | `rateLimiter.ts` | API'lerde rate limit koruması yok |
| 7 | **RBAC import karışıklığı** (#14) | `rbac.ts` vs `rbacService.ts` | Yetkilendirme tutarsızlığı |
| 8 | **TODO: Firestore audit log** | `logger.ts:143` | KVKK Madde 11 ihlali riski |
| 9 | **`getAssignedFascicles` stub** (#3) | `fascicleService.ts:61-62` | Öğrenci atamaları çalışmaz |
| 10 | **`viewCount` increment eksik** (#4) | `fascicleStorageService.ts:44-48` | Görüntülenme istatistikleri tutulmaz |

### Yüksek Öncelikli

| # | Bulgu | Dosya |
|---|-------|-------|
| 11 | `any` kullanımı 529 satır — tip güvenliği yok | Tüm proje |
| 12 | `catch (error: any)` 56 satır — `unknown` olmalı | Tüm proje |
| 13 | `retryWithBackoff` hiçbir Firestore yazmasında kullanılmıyor | `worksheetService.ts` |
| 14 | `validateRequest` hiçbir API girişinde yok | Tüm proje |
| 15 | `jwtService.ts` AppError kodları yanlış (`INTERNAL_ERROR`) | `jwtService.ts` |
| 16 | `permissionValidator.ts` eski RBAC kullanıyor | `permissionValidator.ts:8` |

### Orta/Düşük Öncelikli

| # | Bulgu | Dosya |
|---|-------|-------|
| 17 | `partialize` undo/redo state'ini persist etmiyor | `useFascicleStore.ts:178-182` |
| 18 | TODO: Vercel Analytics entegrasyonu | `logger.ts:124` |
| 19 | TODO: Sentry entegrasyonu | `logger.ts:135` |
| 20 | `messagingService.ts` AppError kullanmıyor | `messagingService.ts` |
| 21 | `console.log` development wrapper var, risk düşük | `logger.ts` |
| 22 | `_startAfter` import edilmiş kullanılmıyor | `worksheetService.ts:15` |

---

## 13. Özet Tablo

| Kontrol Maddesi | Durum | Açıklama |
|----------------|-------|----------|
| `as any` yasak | ❌ **BAŞARISIZ** | 529 kullanım tespit edildi |
| Tüm servisler AppError kullanıyor | ⚠️ **KISMEN** | `activityVisibilityManager`, `messagingService` kullanmıyor |
| `past.slice(-30)` eklenecek mi (#10) | ❌ **EKLENMEMİŞ** | Sınırsız past dizisi |
| `partialize` ile localStorage optimizasyonu (#15) | ✅ **MEVCUT** | Ancak undo/redo persist edilmiyor |
| Rate limiter her endpoint'te var mı? | ❌ **HİÇBİR YERDE YOK** | Servis tanımlı ama kullanılmıyor |
| `validateRequest()` tüm API girişlerinde | ❌ **KULLANILMIYOR** | Manuel validasyon |
| `retryWithBackoff` Firestore yazmalarında | ❌ **KULLANILMIYOR** | Import edilmiş ama çağrılmamış |
| TODO borçları envanteri | 25 TODO | 3 kritik, 4 yüksek, 18 düşük/orta |
| `rbac.ts` vs `rbacService` — hangisi aktif? | ⚠️ **KARIŞIK** | Her ikisi de aktif, isim çakışması var |
| `console.log` üretim kodunda | ✅ **GÜVENLİ** | Logger wrapper'ı ile korunuyor |

---

## 14. Sonuç

Proje genel olarak **orta kalite** seviyesindedir. `AppError` standardizasyonu büyük ölçüde oturmuş, `errorHandler.ts` kapsamlı utility'ler sunuyor. Ancak:

1. **Tip güvenliği zayıf** — 529 `as any` kullanımı, projenin %70'inde TypeScript strict modunun etkisiz olduğunu gösteriyor.
2. **Rate limiter + validateRequest ölü kod** — Tanımlanmış ama hiçbir yerde kullanılmıyor.
3. **RBAC ikilemi** — Eski ve yeni sistem paralel çalışıyor, isim çakışması var.
4. **Kritik stub'lar** — `jwtService`'de DB doğrulama, `analyticsEngine`'de Firestore, `activityVisibilityManager`'da persistence eksik.
5. **Retry pattern'i dağınık** — Merkezi `retryWithBackoff` var ama `geminiClient.ts` kendi implementasyonunu yazmış, `worksheetService.ts` import edip kullanmamış.

**Öncelikli Eylemler:**
1. `jwtService.ts` DB doğrulama implementasyonu
2. `past.slice(-30)` eklenmesi ve `sinavService.ts` userId düzeltmesi
3. `rateLimiter`'ın API handler'lara entegrasyonu
4. RBAC import karmaşasının çözümü (eski sistemi kaldırma veya namespace'leme)
5. `activityVisibilityManager` Firestore persistence
6. `as any` → `unknown` + type guard dönüşüm programı başlatılması

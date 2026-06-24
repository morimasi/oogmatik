# OOGMATIK Güvenlik Denetim Raporu

**Denetleyen:** Gizem Başar — Güvenlik Uzmanı
**Tarih:** 2026-06-24
**Kapsam:** Firestore Rules, JWT, RBAC (ikili sistem), creatorId, API güvenliği, PII, Prompt Injection

---

## 🔴 KRİTİK BULGULAR

### C-1: `loginHandler` DB Doğrulaması Yapmıyor (#9)
**Dosya:** `src/services/jwtService.ts:232-250`

```typescript
// TODO: Verify email and password against database
// This is a placeholder for demonstration
// Mock user (in production, fetch from database)
const user = {
    userId: 'user123',
    email: email,
    name: 'John Doe',
    role: 'teacher' as const,
};
```

**Risk:** Herhangi bir email/şifre kombinasyonu ile giriş yapılabilir. Kullanıcıya `userId: 'user123'`, `role: 'teacher'` atanır. Saldırgan bu endpoint'e istek atarak geçerli bir JWT token alabilir ve tüm teacher yetkilerine erişebilir.

**Öneri:** `loginHandler` Firestore'da `users` koleksiyonunda email eşleşmesi yapmalı, bcrypt ile password hash doğrulaması gerçekleştirmeli. Firebase Auth kullanılıyorsa (`authService.ts`), bu endpoint kaldırılmalı.

---

### C-2: `publishFascicle` creatorId Doğrulaması Yok (S3)
**Dosya:** `src/services/fascicleService.ts:43-54`

```typescript
public async publishFascicle(fascicle: FascicleDocument, pdfUrl: string): Promise<void> {
    const fascicleRef = doc(collection(db, 'fascicles'), fascicle.id);
    await setDoc(fascicleRef, { ...fascicle, isDraft: false, pdfUrl, updatedAt: serverTimestamp() }, { merge: true });
}
```

**Risk:** Herhangi bir kullanıcı, başkasının creatorId'si ile fasikül oluşturup yayınlayabilir. `FascicleDocument.creatorId` (`src/types/fascicle.ts:46`) alanı mevcut ancak hiçbir yerde `request.user.userId` ile karşılaştırılmıyor.

**Öneri:** `publishFascicle` ve `autoSaveDraft` metodlarında `fascicle.creatorId === authenticatedUserId` kontrolü eklenmeli. Firestore rules'da `fascicles` koleksiyonu için kural tanımlanmamış (rules dosyasında yok).

---

### C-3: İkili RBAC Sistemi — Tip Çakışması Riski
**Legacy:** `src/services/rbac.ts` — `permissionValidator.ts` tarafından kullanılıyor (server-side)
**Yeni:** `src/services/rbacService.ts` — `useRBAC.ts`, `App.tsx`, admin panelleri tarafından kullanılıyor
**Tip A: `src/types/rbac.ts`** — 30 modül (küçük farklılıklar)
**Tip B: `src/types/rbac-advanced.ts`** — 29 modül + 5 kategori

**PermissonValidator Middleware** (`src/middleware/permissionValidator.ts:8`) legacy `rbac.js`'i import ediyor:
```typescript
import { hasPermission, hasRole, UserRole, Permission } from '../services/rbac.js';
```
**Hata:** `.js` uzantısı TypeScript projesinde derleme hatasına yol açabilir.

**ProtectedRoute** (`src/components/ProtectedRoute.tsx`) `types/rbac`'den `PermissionModule` import ediyor ama `useRBAC` hook'u üzerinden `rbacService`'e (yeni sistem) yönleniyor. Bu çalışır çünkü iki tip dosyası da aynı string literal'leri tanımlıyor — ancak `types/rbac.ts`'de `developer-tools` tanımlı mı kontrol edilmeli.

**`types/rbac.ts:45`** `fascicle-studio` tanımlı — OK. Ama `types/rbac.ts`'de `developer-tools` tanımlı değil (satır 14-46), `types/rbac-advanced.ts`'de tanımlı (satır 56). Bu tip uyumsuzluğu potansiyel derleme hatası.

**Risk:** İki ayrı RBAC sistemi paralel çalışıyor. Geçiş sürecinde bir sistemde verilen yetki diğerinde yok sayılabilir.

**Öneri:** Legacy `rbac.ts` tamamen kaldırılmalı, `permissionValidator.ts` yeni `rbacService`'e geçirilmeli. `types/rbac.ts` silinip `types/rbac-advanced.ts` tek kaynak olarak bırakılmalı.

---

## 🟠 YÜKSEK ÖNCELİKLİ BULGULAR

### H-1: Firestore Rules — `request.resource.data` Validasyonu Yok
**Dosya:** `firestore.rules`

Hiçbir koleksiyonda `request.resource.data` ile alan bazlı validasyon yok. Örneğin:
- `saved_worksheets` create: herhangi bir alanla belge oluşturulabilir (userId, sharedWith doğrulanmıyor)
- `workbooks` create: userId alanı kontrol edilmiyor
- `feedbacks` create: feedback içeriği validasyonu yok

### H-2: `students` Koleksiyonu Subcollection Güvenliği
**Dosya:** `firestore.rules:36-38`
```
match /{allSubcollections=**} {
    allow read, write: if isAdmin() || isTeacher();
}
```
Tüm alt koleksiyonlar aynı kuralla korunuyor. Bir öğretmen tüm öğrencilerin alt koleksiyonlarına erişebilir. KVKK gereği öğretmen yalnızca kendi öğrencilerine erişebilmelidir. `request.resource.data.assignedTeachers` veya benzer bir alan kontrolü eklenmeli.

### H-3: JWT Güvenlik Açıkları
**Dosya:** `src/services/jwtService.ts`

| Sorun | Detay |
|-------|-------|
| Secret fallback | `'your-secret-key-change-in-production'` (satır 41) |
| Dev secret | `'dev-secret-key-do-not-use-in-production'` (satır 37) |
| Simetrik algoritma | HS256 — RS256 (asimetrik) önerilir |
| Logout pasif | `logoutHandler` (satır 314) token blacklist yapmıyor |
| `.env.example`'da yok | JWT_SECRET değişkeni tanımlı değil |

### H-4: Firestore Rules'da `fascicles` Koleksiyonu Yok
`fascicleService.ts` `fascicles` koleksiyonuna yazıyor ancak `firestore.rules`'da bu koleksiyon tanımlı değil. Varsayılan Firestore davranışı tüm erişimleri reddeder — bu servisin çalışmasını engeller. Ancak kural eklenirse ve hatalı yazılırsa güvenlik açığı oluşur.

### H-5: Rate Limiter Kullanımı Eksik
**Dosya:** `src/services/rateLimiter.ts`

Rate limiter servisi mevcut ancak API endpoint'lerinde (`generate.ts`, `fascicleService.ts`) kullanılmıyor. Grep sonucunda `rateLimiter` veya `enforceRateLimit` çağrısı yalnızca `rateLimiter.ts` içinde referans alınmış. Hiçbir API handler'ında çağrılmıyor. Admin kullanıcıları için `apiGeneration: 10000 req/hour` limiti var — bu da yüksek.

### H-6: CORS Yapılandırması Bulunamadı
Projede CORS middleware'i veya yapılandırması taranan dosyalarda bulunamadı. Vercel sunucusuz fonksiyonlarda CORS başlıkları eklenmezse cross-origin istekler reddedilir veya güvenlik zafiyeti oluşur.

---

## 🟡 ORTA ÖNCELİKLİ BULGULAR

### M-1: PermissionsIDE Eksik Modül İkonları
**Dosya:** `src/components/AdminDashboard/PermissionsIDE.tsx:49-76`

`MODULE_ICONS` objesinde şu 5 modülün ikonu tanımlı **değil**:
- `analytics`
- `planning`
- `reports`
- `settings`
- `bep`

Satır 370'te `MODULE_ICONS[moduleName] || <Layout size={16} />` fallback'i var ancak eksik ikonlar kullanıcı deneyimini ve UI tutarlılığını etkiler.

### M-2: `authService.ts` SUPER_ADMIN_EMAIL Hardcode'a Yakın
**Dosya:** `src/services/authService.ts:20`
```typescript
const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'morimasi@gmail.com';
```
Fallback email sabit kodlanmış. VITE_ ön eki olduğu için client-side'da görünür. Bu email'in superadmin olarak atanması, developer ortamında güvenlik riski oluşturur.

### M-3: PII Anonymizer Reversible Mapping
**Dosya:** `src/utils/piiAnonymizer.ts:145-179`

`restorePII()` metodu orijinal veriyi geri getirebilir. Mapping `mappingCache`'te (Map) tutuluyor. `clearCache()` metodu var ancak otomatik temizleme/timeout mekanizması yok. Bellekte biriken mapping'ler sızıntı riski oluşturur.

### M-4: `permissionValidator.ts` Header Fallback Güvenlik Açığı
**Dosya:** `src/middleware/permissionValidator.ts:43-49`
```typescript
// Fallback to custom headers (Secondary Method / Dev)
return { userId: userId || null, role: role || null };
```
`x-user-id` ve `x-user-role` header'larına güveniyor. JWT doğrulaması başarısız olursa bu header'lardaki değerler kullanılıyor. Production'da bu fallback devre dışı bırakılmalı.

### M-5: Firestore Index Kesintisi Riski
`firestore.indexes.json`'da tanımlı index'ler ile `src/database/firestore-indexes.ts`'de tanımlı index'ler arasında fark var:
- JSON'da `conversations` ve `messages` index'leri var, TS'de yok
- TS'de `activityType` + `createdAt` index'i var, JSON'da yok
- JSON'da `sharedWith` + `userId` + `createdAt` index'i var, TS'de yok

### M-6: `activityLogService.logActivity()` Sürekli Çağrılıyor
**Dosya:** `src/services/authService.ts:75`
Her login işleminde email açık metin olarak loglanıyor. KVKK gereği email adresleri log'da maskelenmeli.

---

## 🟢 DÜŞÜK ÖNCELİKLİ / BİLGİ NOTLARI

### L-1: `workbook_pages` ve `workbook_versions` Koleksiyonları Tüm Kullanıcılara Açık Yazma
`firestore.rules:118-124` — Herhangi bir authenticated kullanıcı bu koleksiyonlara yazabilir. Eğer bu koleksiyonlar public ise sorun yok, ancak KVKK hassasiyeti varsa kısıtlama eklenmeli.

### L-2: `feedback_signals` create herkese açık
`firestore.rules:107` — Authenticated her kullanıcı feedback_signals oluşturabilir. Spam/Sybil saldırılarına karşı rate limiting veya günde maksimum sayı sınırı getirilmeli.

### L-3: JWT Token 24 Saat Geçerli
Uzun ömürlü token. Refresh token 7 gün geçerli. Token revocation mekanizması yok. Öneri: access token 1 saat, refresh token 24 saat.

### L-4: `.env.example` Eksik Değişkenler
`JWT_SECRET` değişkeni `.env.example`'da tanımlı değil. Developer'ların JWT secret'ı environment'a eklemeyi unutma riski var.

### L-5: `any` Tipi Kullanımı
- `jwtService.ts:181` — `req.user` tip ataması yok
- `authService.ts:23` — `Record<string, any>` kullanılmış
- `privacyService.ts:282` — `sanitizeObject(obj: any)` parametresi

---

## ÖZET TABLO

| ID | Bulgu | Etki | Öncelik |
|----|-------|------|---------|
| C-1 | loginHandler DB doğrulaması yok | Authentication bypass | 🔴 Kritik |
| C-2 | publishFascicle creatorId kontrolü yok | Yetkisiz yayın | 🔴 Kritik |
| C-3 | İkili RBAC sistemi çakışması | Yetki karmaşası | 🔴 Kritik |
| H-1 | Firestore rules validasyon eksik | Veri bütünlüğü | 🟠 Yüksek |
| H-2 | students subcollection aşırı yetki | KVKK ihlali | 🟠 Yüksek |
| H-3 | JWT secret fallback, blacklist yok | Token güvenliği | 🟠 Yüksek |
| H-4 | fascicles koleksiyonu rules'da yok | Servis çalışmaz | 🟠 Yüksek |
| H-5 | Rate limiter API'lerde kullanılmıyor | DoS riski | 🟠 Yüksek |
| H-6 | CORS yapılandırması yok | Cross-origin | 🟠 Yüksek |
| M-1 | Eksik modül ikonları (5 adet) | UI bozulması | 🟡 Orta |
| M-2 | SUPER_ADMIN_EMAIL hardcode | Dev sızıntısı | 🟡 Orta |
| M-3 | PII reversibility otomatik temizlik yok | Veri sızıntısı | 🟡 Orta |
| M-4 | Header fallback JWT'yi bypass eder | Yetki atlama | 🟡 Orta |
| M-5 | Index konfigürasyon tutarsızlığı | Performans | 🟡 Orta |
| M-6 | Email log'da açık metin | KVKK ihlali | 🟡 Orta |

---

## ACİL YAPILMASI GEREKENLER

1. **`loginHandler`** hemen kaldırılmalı veya Firebase Auth + DB doğrulaması eklenmeli
2. **`publishFascicle`** creatorId kontrolü eklenmeli
3. **Legacy `rbac.ts`** kaldırılıp `permissionValidator.ts` yeni sisteme geçirilmeli
4. **`firestore.rules`** fascicles koleksiyonu + request.resource.data validasyonu + students subcollection kısıtlaması eklenmeli
5. **JWT_SECRET** `.env.example`'a eklenmeli, production'da güçlü bir secret kullanılmalı
6. **Rate limiter** tüm API endpoint'lerine entegre edilmeli
7. **CORS middleware** eklenmeli

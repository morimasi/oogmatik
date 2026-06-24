# OOGMATIK Firestore Şema, Index & Serverless Denetim Raporu

**Hazırlayan:** Tolga Yılmaz — Cloud/DB Mimarı  
**Tarih:** 2026-06-24  
**Proje:** OOGMATIK (bdmind EdTech Platformu)  
**Kapsam:** Firestore koleksiyon yapısı, index coverage, query desenleri, write cost, serverless konfigürasyonu

---

## 1. KOLEKSİYON ENVANTERİ

Toplam **31 koleksiyon/subcollection** tespit edilmiştir.

### 1.1 Root Koleksiyonlar

| # | Koleksiyon | Kaynak Dosya | Kullanım | Sorgu Deseni | Index Gerekli mi? |
|---|-----------|-------------|----------|-------------|-------------------|
| 1 | `users` | authService, messagingService, adminService | Kullanıcı profilleri, kişi listesi | `getDoc`, `query(limit)`, `query(orderBy)`, `query(documentId in)` | Single-field (auto) |
| 2 | `students` | teacherService, aiStudentService, adminService | Öğrenci kayıtları | `where(teacherId)`, `where(assignedTeachers array-contains)`, `getDoc`, tümü | Single-field (auto) |
| 3 | `saved_worksheets` | worksheetService, teacherService | Çalışma kağıdı arşivi | **5 farklı sorgu deseni** (bkz. §2) | **6 composite** |
| 4 | `saved_assessments` | assessmentService, teacherService | Değerlendirme kayıtları | `where(userId)`, `where(studentId)` | Single-field (auto) |
| 5 | `saved_curriculums` | curriculumService, teacherService | Müfredat planları | `where(userId)`, `where(studentId)` | Single-field (auto) |
| 6 | `saved_screenings` | — (rules var) | Tarama kayıtları | `getDoc` (tahmini) | Yok |
| 7 | `templates` | — (rules var) | Aktivite şablonları | `getDocs` | Yok |
| 8 | `messages` | messagingService | Mesajlar (root-collection model) | `where(participantIds array-contains)`, `where(studentId)`, `where(isGlobal)`, `where(readBy not-in)`, `where(senderId !=)` | **3+ composite gerekli** |
| 9 | `conversations` | messageService (messaging/) | Sohbet başlıkları | `where(participantIds array-contains)` | Index #5 (mevcut) + orderBy |
| 10 | `fascicles` | fascicleService | Fasikül dokümanları | `getDoc`, `setDoc`, `getAssignedFascicles (TODO)` | **Beklemede** |
| 11 | `fascicleInteractionLogs` | fascicleStorageService | Etkileşim logları (VIEW/DOWNLOAD) | `addDoc` | Yok |
| 12 | `shared_profile_content` | profileShareService | Profil paylaşımı | `where(recipientId)`, `where(ownerId)` | Single-field (auto) |
| 13 | `activity_stats` | statsService, reset script | Aktivite istatistikleri | `getDocs`, `setDoc`, `updateDoc(increment)` | Single-field (auto) |
| 14 | `assignments` | assignmentService, reset script | Ödev atamaları | `where(studentId)`, `where(teacherId)` | Single-field (auto) |
| 15 | `workbooks` | — (rules var) | Workbook v2 | `getDoc` (tahmini) | Yok |
| 16 | `workbook_pages` | — (rules var) | Workbook sayfaları | — | Yok |
| 17 | `workbook_versions` | — (rules var) | Workbook versiyon | — | Yok |
| 18 | `config_activities` | adminService | Admin aktivite konfig | `getDocs`, `setDoc`, `updateDoc` | Yok |
| 19 | `config_prompts` | adminService | Admin prompt konfig | `getDocs`, `getDoc`, `setDoc` | Yok |
| 20 | `config_snippets` | adminService | Admin snippet konfig | `getDocs`, `setDoc` | Yok |
| 21 | `config_static_content` | adminService | Admin statik içerik | `getDocs`, `getDoc`, `setDoc` | Yok |
| 22 | `activity_drafts` | activityApprovalService, reset script | Aktivite taslakları | `getDocs`, `getDoc`, `setDoc` | Yok |
| 23 | `approval_queue` | activityApprovalService, reset script | Onay kuyruğu | `query(where)`, `getDoc` | Single-field (auto) |
| 24 | `feedback_signals` | activityApprovalService, reset script | Geri bildirim sinyalleri | `getDocs`, `setDoc` | Yok |
| 25 | `feedbacks` | — (rules var) | Kullanıcı geri bildirimi | — | Yok |
| 26 | `settings` | rbacService | Global ayarlar (rbac dokümanı) | `getDoc(settings/rbac)`, `setDoc` | Yok |
| 27 | `sent_emails` | emailService | E-posta logları | `addDoc` | Yok |
| 28 | `agent_tasks` | — (reset script) | AI ajan görevleri | — | Yok |
| 29 | `agent_conversations` | — (reset script) | AI ajan konuşmaları | — | Yok |
| 30 | `activity_logs` | activityLogService | Aktivite log akışı | `where(userId)` | Single-field (auto) |
| 31 | `activityVisibility` | activityVisibilityManager | **(TASLAK - henüz yazılmıyor)** | — | — |
| 32 | `categoryVisibility` | activityVisibilityManager | **(TASLAK - henüz yazılmıyor)** | — | — |

### 1.2 Subcollection'lar

| Subcollection | Parent | Kullanım |
|--------------|--------|----------|
| `conversations/{id}/messages` | conversations | Mesaj içerikleri (new messaging module) |
| `students/{id}/progress_history` | students | İlerleme geçmişi |
| `students/{id}/progress_summary` | students | İlerleme özeti |

---

## 2. İNDEX COVERAGE ANALİZİ

### 2.1 Mevcut Composite Index'ler (`firestore.indexes.json`)

| # | Collection | Fields | Kapsadığı Sorgular |
|---|-----------|-------|-------------------|
| I1 | `saved_worksheets` | `userId↑, sharedWith↑, category.id↑, createdAt↓` | getUserWorksheets (full) |
| I2 | `saved_worksheets` | `sharedWith↑, createdAt↓` | getSharedWithMe (string eşitlik) |
| I3 | `saved_worksheets` | `studentId↑, createdAt↓` | getWorksheetsByStudent (no orderBy — kısmi) |
| I4 | `saved_worksheets` | `sharedWith↑, userId↑, createdAt↓` | **(Tanımsız — nerede kullanıldığı belirsiz)** |
| I5 | `conversations` | `participantIds array-contains, updatedAt↓` | subscribeToConversations ✅ |
| I6 | `messages` | `threadId↑, createdAt↑` | subscribeToThreadMessages (kısmi) |

### 2.2 saved_worksheets Sorgu-Index Coverage Matrisi

| Sorgu | Kullanılan where/orderBy | Gerekli Index | Kapsanıyor mu? |
|-------|------------------------|--------------|:---:|
| **Q1** getUserWorksheets | `where(userId==) + orderBy(createdAt desc)` | `userId↑, createdAt↓` | **❌ YOK** (fallback: in-memory sort) |
| **Q2** getUserWorksheets (full) | `where(userId==) + where(category.id==) + orderBy(createdAt desc)` | `userId↑, category.id↑, createdAt↓` | **❌ YOK** (I1 sharedWith içerir — fazla alan) |
| **Q3** getSharedWithMe | `where(sharedWith array-contains) + orderBy(createdAt desc)` | `sharedWith array-contains, createdAt↓` | **❌ YOK** (I2 string eşitlik, array-contains değil) |
| **Q4** getWorksheetsByStudent | `where(studentId==)` | Single-field studentId (auto) | ✅ |
| **Q5** teacherService (userId) | `where(userId==) + in-memory sort` | Single-field userId (auto) | ✅ |

**Kritik Bulgu:** I2 (`sharedWith ASC, createdAt DESC`) string eşitlik içindir, `array-contains` sorgusu için çalışmaz. `getSharedWithMe` **array-contains** kullandığı için I2 yetersizdir — başka bir composite index gerekir.

### 2.3 messages Koleksiyonu Index Eksikleri

| Sorgu | Desen | Gerekli Index |
|-------|-------|--------------|
| listenToMessages (participantIds) | `where(participantIds array-contains) + orderBy(dbTimestamp desc) + limit(50)` | `participantIds ARRAY_CONTAINS, dbTimestamp DESC` |
| listenToMessages (studentId) | `where(studentId==) + orderBy(dbTimestamp desc) + limit(50)` | `studentId ASC, dbTimestamp DESC` |
| listenToMessages (isGlobal) | `where(isGlobal==) + orderBy(dbTimestamp desc) + limit(50)` | `isGlobal ASC, dbTimestamp DESC` |
| subscribeToDeletedMessages | `collectionGroup(messages) where(isDeleted==) + orderBy(deletedAt desc)` | `isDeleted ASC, deletedAt DESC` (collectionGroup!) |

**⚠️ Acil:** listenToMessages her üç deseni de `onSnapshot` ile çalışır. Indexsiz her biri full scan yapar → real-time maliyeti katlanır.

### 2.4 getAssignedFascicles — Yeni Index İhtiyacı

`fascicleService.getAssignedFascicles(studentId)` şu an `return []` (mock). Gerçek sorgu şöyle olacak:

```
query(collection(db, 'fascicles'), where('assignedStudentIds', 'array-contains', studentId))
```

**Gerekli Index:** `fascicles` koleksiyonu için `assignedStudentIds ARRAY_CONTAINS` (single-field yeterli, auto-created).

### 2.5 shared_profile_content Index Durumu

| Sorgu | Desen | Index |
|-------|-------|-------|
| getSharedWithMe | `where(recipientId==)` | Single-field (auto) ✅ |
| getMySharedContent | `where(ownerId==)` | Single-field (auto) ✅ |

Composite index gerekmez (orderBy yok, in-memory sort).

---

## 3. KRİTİK SORUNLAR

### 3.1 🔴 CRITICAL — `messagingService.listenToUnreadCount` (satır 150-178)

```typescript
where('readBy', 'not-in', [[userId]])
// 'not-in' beklenen: array of values
// Gönderilen: array of single-element array → HATALI
```

- `not-in` dizisi `[[userId]]` şeklinde — `[userId]` olmalıydı.
- `readBy` alanı array olduğu için `not-in` doğru çalışmaz. Array alanlarda `not-in` desteklenmez.
- Her onSnapshot tetiklendiğinde tüm `messages` taranır → okuma maliyeti okunmamış mesaj başına **değil**, toplam mesaj sayısı kadardır.

**Öneri:** `readBy` için `not-in` yerine `array-contains` ile client-side filtering, veya her kullanıcı için ayrı unreadCount alanı.

### 3.2 🔴 CRITICAL — `messagingService.listenToUnreadCountPerContact` (satır 184-211)

```typescript
where('senderId', '!=', userId)
```

- `!=` sorgusu tüm dokümanları senderId != userId şartıyla tarar → esasen **full scan minus bir doküman**.
- 10K mesajda, her tetiklenişte 10K doküman okunur.
- `limit(200)` sadece client-side'e 200 döner, Firestore yine 10K'yı tarar.

**Öneri:** Kaldırılmalı, yerine her conversation'da `unreadCount` field'ı veya Cloud Function ile hesaplanan önbelleklenmiş değer.

### 3.3 🟡 HIGH — `getUserWorksheets` Fallback Mimarisi

```typescript
// worksheetService.ts:159-169
query(saved_worksheets, where('userId', '==', userId), orderBy('createdAt', 'desc'))
// Fallback: query(saved_worksheets, where('userId', '==', userId)) + in-memory sort
```

- **Index eksik:** `userId ASC, createdAt DESC` composite index'i yok.
- Fallback modunda tüm userId dokümanları çekilir + JS'de sort → 1000 kayıtta 1000 okuma.
- `_MAX_ARCHIVE_ROWS = 2800` — her sayfa yüklemede 2800 doküman okunabilir.

**Öneri:** `userId↑, createdAt↓` composite index'i ekleyin. Firestore'un önerdiği index bağlantısını kabul edin.

### 3.4 🟡 HIGH — viewsCount Increment (fascicleStorageService.ts:44-48)

```typescript
// Increment logic generally needs array or increment payload, using basic update here
```

- Kod **TODO** olarak işaretlenmiş. Increment gerçekleşmiyor.
- Her VIEW'de `fascicleInteractionLogs`'a bir doküman yazılıyor (1 write). Ayrıca fascicle dokümanında viewCount increment edilse 1 write daha → toplam 2 write/view.
- Aylık 10K VIEW = 20K write.

**Öneri:** View count için ayrı `activity_stats` benzeri bir sayaç koleksiyonu veya Firestore `increment()` kullanımı. Analytics için BigQuery export düşünülebilir.

### 3.5 🟡 HIGH — localStorage Persist Sınırı (useFascicleStore.ts:176-183)

```typescript
persist({
  name: 'bdmind-fascicle-draft-storage',
  partialize: (state) => ({ currentFascicleId, metadata, items }),
})
```

- `items` dizisi büyüdükçe (50+ madde, her biri AI içeriği) localStorage 5MB sınırı aşılabilir.
- `past`/`future` undoredo dizileri persist edilmiyor (doğru karar).
- Undo/Redo bellekte tutuluyor — çoklu adım (20+) fazla RAM tüketir.

**Öneri:** IndexedDB'ye geçiş (idb-keyval veya Dexie.js). `past` array için max 20 snapshot sınırı.

### 3.6 🟡 MEDIUM — `array-contains` vs String Eşitlik Çakışması

`saved_worksheets.sharedWith` hem string (`worksheetService.ts:96`: `sharedWith?: string | string[]`) hem array olabilir.

- `getSharedWithMe` (line 260-265): `where("sharedWith", "array-contains", userId)` — sharedWith string ise çalışmaz.
- `shareWorksheet` (line 292-314): sharedWith'i array'e dönüştürür (arrayUnion benzeri manuel merge).
- `worksheetMatchesArchiveCategory`: `sharedWith` için **hiçbir index tanımı yok**.

**Öneri:** sharedWith her zaman `string[]` tipinde zorlanmalı. Firestore rules'da `validation: sharedWith is list` kontrolü eklenmeli.

### 3.7 🟡 MEDIUM — onSnapshot Aşırı Kullanımı

| Fonksiyon | Collection | Açıklama | Maliyet |
|-----------|-----------|----------|---------|
| listenToMessages | messages | Her mesaj değişiminde tetiklenir | Kabul edilebilir (sohbet UI) |
| listenToUnreadCount | messages | Her mesaj oluşumunda/silmede tetiklenir | **Aşırı** — tüm mesajlar taranır |
| listenToUnreadCountPerContact | messages | `!=` sorgusu + aynı koleksiyon | **Aşırı** — full scan |
| subscribeToMessages | conversations/{id}/messages | Gerçek zamanlı sohbet | Kabul edilebilir |
| subscribeToConversations | conversations | Sohbet listesi real-time | Kabul edilebilir |
| subscribeToDeletedMessages | messages (collectionGroup) | Silinen mesaj arşivi | Düşük frekans — kabul edilebilir |

**Öneri:** Unread count için `onSnapshot` yerine Cloud Function + Firestore trigger ile ön hesaplama + client polling (30sn).

### 3.8 🟢 LOW — Batch Write Kullanımı

| Yer | Batch? | Açıklama |
|----|--------|----------|
| teacherService.assignStudentsToTeacher | ✅ `writeBatch` | 500 limit, doğru kullanım |
| messageService.clearConversation | ✅ `writeBatch` | Toplu soft-delete |
| authService.getMultipleUsers | N/A | `in` ile 10'arlı batch okuma |
| Update sonrası getDoc (örn. updateProfile) | ❌ | 1 write + 1 read, batch yapılabilir |

---

## 4. ŞEMA TASARIM DEĞERLENDİRMESİ

### 4.1 Document Size Limit (1MB) Riski

| Doküman Türü | Riskli Alan | Tahmini Boyut |
|-------------|-----------|--------------|
| `saved_worksheets` | `worksheetData` (JSON string) | 5-50 KB / orta boyut ✅ |
| `fascicles/{id}` | `items[]` (AI içerikleri) | 20-200 KB / yüksek içerikli ⚠️ |
| `messages` | Metadata + text | <10 KB ✅ |

Fasikül içerikleri (resim base64, uzun metinler) 1MB'a yaklaşabilir. Subcollection modeli daha güvenlidir.

### 4.2 Subcollection vs Root Collection Kararları

| Karar | Mevcut Durum | Değerlendirme |
|-------|-------------|--------------|
| `conversations/{id}/messages` | ✅ Subcollection | Doğru — mesajlar bağımsız sorgulanır, conversation silinince temizlenir |
| `students/{id}/progress_*` | ✅ Subcollection | Doğru — KVKK gereği öğrenci silinince progress de silinir |
| `messages` (root) | ❌ Root collection | `participantIds` ile çalışır ama `conversations/{id}/messages` ile çakışma potansiyeli. İki farklı mesaj modeli var. |
| `fascicleInteractionLogs` (root) | ⚠️ Root collection | Subcollection olarak `fascicles/{id}/interactionLogs` daha mantıklı (fasikül silinince loglar da silinir) |
| `activity_logs` (root) | ✅ Root collection | Tüm kullanıcıların logları merkezi — doğru |

### 4.3 Koleksiyon Sayısı — Birleştirme Önerisi

31 koleksiyon fazladır. Önerilen birleştirmeler:

| Mevcut | Öneri |
|--------|-------|
| `config_activities`, `config_prompts`, `config_snippets`, `config_static_content` | → `admin_config` (type field ile ayrıştır) |
| `workbooks`, `workbook_pages`, `workbook_versions` | → `workbooks/{id}/pages` + `workbooks/{id}/versions` subcollection |
| `agent_tasks`, `agent_conversations` | → `agents/{agentId}/tasks` |
| `activity_drafts`, `approval_queue` | → `content_pipeline/{id}` (status field ile) |

Hedef: **31 → ~18 koleksiyon**

---

## 5. VERİ MODELİ TUTARLILIĞI

### 5.1 `types.ts` vs `types/index.ts` Çakışması (M3)

- `src/types.ts` — kök düzeyde tek dosya, eski/legacy tipler
- `src/types/index.ts` — `types/` dizininden barrel export
- `worksheetService.ts` satır 8: `from '../types.js'` → `types.ts`'i hedefler
- `types/student.ts`, `types/user.ts` vb. ayrı dosyalar → `types/index.ts` üzerinden erişilebilir

**İkili yapı kafa karıştırıcıdır.** `types/index.ts` tüm import'ları `types.ts`'den re-export etmeli veya `types.ts` tamamen kaldırılmalıdır.

### 5.2 `constants.ts` vs `constants/` Dizini (M4)

- `src/constants.ts` — tek dosya, legacy
- `constants/` dizini mevcut **değil** (requirements'ta belirtilmişti)

Tek dosya yeterlidir. Dizine ihtiyaç yok.

### 5.3 `fascicles/{fascicleId}/interactionLogs` — Subcollection Kararı

`fascicleStorageService.logInteraction`: `fascicleInteractionLogs` root koleksiyonuna yazar.

```
Root: fascicleInteractionLogs/{autoId}
Öneri: fascicles/{fascicleId}/interactionLogs/{autoId}
```

**Subcollection avantajı:** Bir fasikül silinince tüm logları otomatik temizlenir. Sorgular `fascicles/{id}/interactionLogs` üzerinden yapılır, daha hızlıdır.

---

## 6. YAZMA MALİYET ANALİZİ (Write Cost)

### 6.1 Aylık Tahmini Write Maliyeti

| Operasyon | Frekans | Write/Op | Aylık Write | Maliyet ($) |
|-----------|---------|----------|------------|:-----------:|
| Worksheet kaydetme | 500/ay | 2 (worksheet + user.count) | 1,000 | ~$0.02 |
| Worksheet paylaşma | 200/ay | 1 update | 200 | ~$0.004 |
| autoSaveDraft | 3,000/ay | 1 setDoc(merge) | 3,000 | ~$0.06 |
| Mesaj gönderme | 2,000/ay | 2 (message + conversation) | 4,000 | ~$0.08 |
| VIEW log (fascicle) | 10,000/ay | 1 log | 10,000 | ~$0.20 |
| Öğrenci atama | 100/ay | 1 update | 100 | ~$0.002 |
| RBASettings kaydetme | 20/ay | 1 setDoc | 20 | ~$0.0004 |
| Aktivite logları | 5,000/ay | 1 addDoc | 5,000 | ~$0.10 |
| **Toplam** | | | **~23,320** | **~$0.47/ay** |

### 6.2 autoSaveDraft 2sn Debounce

`fascicleService.ts:9`: `AUTO_SAVE_DELAY_MS = 2000`

- 2 saniye debounce makuldür.
- Her setDoc `{ merge: true }` ile sadece değişen alanları yazar.
- Kullanıcı 10dk boyunca yazarsa ~300 write (10dk / 2sn = 300).
- Ayda 10 aktif kullanıcı = 3,000 write → kabul edilebilir.

---

## 7. SERVERLESS (VERCEL) DENETİMİ

### 7.1 API Endpointleri (10 adet)

| # | Endpoint | Dosya | maxDuration | Cold Start |
|---|----------|-------|:-----------:|:----------:|
| 1 | `api/generate.ts` | AI içerik üretimi | 300sn | ~500ms |
| 2 | `api/generate-exam.ts` | Sınav üretimi | varsayılan | ~250ms |
| 3 | `api/worksheets.ts` | Worksheet CRUD | varsayılan | ~250ms |
| 4 | `api/progress.ts` | İlerleme verisi | varsayılan | ~250ms |
| 5 | `api/user/paperSize.ts` | Kullanıcı tercihi | varsayılan | ~250ms |
| 6 | `api/sari-kitap/generate.ts` | Sarı Kitap | varsayılan | ~250ms |
| 7 | `api/ocr/generate-variations.ts` | OCR varyasyon | varsayılan | ~250ms |
| 8 | `api/ai/generate-image.ts` | Görsel üretim | varsayılan | ~500ms |
| 9 | `api/admin/fs-proxy.ts` | Firestore admin proxy | varsayılan | ~250ms |
| 10 | `api/activity-studio/[action].ts` | Activity Studio | varsayılan | ~250ms |

### 7.2 `api/generate.ts` Cold Start

```json
"functions": { "api/generate.ts": { "maxDuration": 300 } }
```

- 300sn timeout AI üretimi için makul.
- Cold start: Node.js runtime ~250ms + Firebase Admin SDK init ~500ms + Gemini client init ~300ms ≈ **1-1.5 saniye**.
- serverless-warmup veya keep-alive ile cold start azaltılabilir.

### 7.3 Firebase Admin SDK Güvenliği

- API endpointleri **client SDK** (`firebase/firestore`) kullanır, Admin SDK değil.
- `scripts/firestore-reset-for-launch.mjs` Admin SDK kullanır — bu sadece script amaçlı, Vercel'de çalışmaz.
- Güvenlik: client SDK kullanımı doğrudur. Admin SDK serverless'ta Service Account credential gerektirir — güvenli olabilir ama gereksiz risk.

### 7.4 vercel.json Konfigürasyonu

| Ayarlar | Durum | Değerlendirme |
|---------|-------|--------------|
| `framework: "vite"` | ✅ | Doğru |
| `buildCommand: "npm run build"` | ✅ | Doğru |
| `functions.api/generate.maxDuration: 300` | ✅ | Doğru |
| `headers: Cross-Origin-Opener-Policy: unsafe-none` | ⚠️ | `unsafe-none` cross-origin isolation'ı devre dışı bırakır. SharedArrayBuffer gerekmiyorsa sorun yok. |
| **EKSİK: rewrites** | ❌ | SPA için `/* → index.html` rewrites yok. Client-side routing çalışmaz. |
| **EKSİK: security headers** | ❌ | `X-Content-Type-Options`, `X-Frame-Options`, `CSP` header'ları yok. |
| **EKSİK: cron jobs** | ❌ | Vercel Cron Jobs tanımlanmamış. Periyodik temizlik/backup için gerekli. |

---

## 8. PERFORMANS & GÜVENLİK ÖNERİLERİ

### 8.1 Query İyileştirmeleri

| # | Sorun | Öneri | Öncelik |
|---|-------|-------|:-------:|
| P1 | saved_worksheets'de `userId↑, createdAt↓` index eksik | Composite index oluştur | 🔴 YÜKSEK |
| P2 | messages'de 3 farklı sorgu deseni indexsiz | 3 composite index | 🔴 YÜKSEK |
| P3 | `!=` ve `not-in` pahalı sorgular | Unread count mimarisini değiştir | 🔴 YÜKSEK |
| P4 | getUserWorksheets fallback'te 2800 doküman okuma | Index ekle + sayfalama düzelt | 🟡 ORTA |
| P5 | getSharedWithMe array-contains indexsiz | `sharedWith ARRAY_CONTAINS, createdAt DESC` index | 🟡 ORTA |
| P6 | `in` sorgusu 10 eleman sınırı (authService) | ✅ Zaten batch'liyor — doğru | 🟢 DÜŞÜK |
| P7 | getAllTeachers: her öğretmen için 5+ ayrı sorgu | N+1 problemi — batch read veya aggregate collection | 🟡 ORTA |

### 8.2 Firestore Rules İyileştirmeleri

| Kural | Durum | Öneri |
|-------|-------|-------|
| `users` okuma: herkes okuyabilir | ⚠️ | `getContacts` ve `fetchInternalUsers` tüm kullanıcıları çeker. `users` koleksiyonu hassas veri içerebilir. Okuma yetkisi kısıtlanmalı. |
| `worksheets` yazma: owner kontrolü | ✅ | Doğru |
| `saved_worksheets` yazma: userId==request.auth.uid | ✅ | Doğru |
| `shared_profile_content` yazma: ownerId kontrolü | ✅ | Doğru |
| students altındaki tüm subcollection'lar teacher/admin | ✅ | KVKK uyumlu |
| `workbook_pages`, `workbook_versions` herkes yazabilir | ❌ | `isAuthenticated()` yeterli değil, owner kontrolü eklenmeli |

### 8.3 Bellek/Storage Optimizasyonu

| # | Sorun | Öneri | Öncelik |
|---|-------|-------|:-------:|
| M1 | localStorage 5MB sınırı (fascicle store) | IndexedDB'ye geçiş | 🟡 ORTA |
| M2 | past array'de sınırsız undo snapshot | Max 20 snapshot limiti | 🟢 DÜŞÜK |
| M3 | worksheetData JSON string büyümesi | Subcollection'a taşı | 🟢 DÜŞÜK |

---

## 9. KOLEKSİYON BAZLI HAREKET PLANI

| Koleksiyon | Eylem | Öncelik |
|-----------|-------|:-------:|
| `saved_worksheets` | `userId↑, createdAt↓` + `sharedWith ARRAY_CONTAINS, createdAt↓` index ekle | 🔴 Hemen |
| `messages` | 3 composite index + `!=`/`not-in` kaldır | 🔴 Hemen |
| `fascicles` | `assignedStudentIds` index planla | 🟡 Sprint |
| `users` | getContacts/tumunu limit+index kontrol | 🟡 Sprint |
| `config_*` | Birleştir: `admin_config` | 🟢 Arka plan |
| `workbook_*` | Subcollection'a taşı | 🟢 Arka plan |

---

## 10. ÖZET: BULGULAR VE SKORLAR

| Kategori | 🔴 Kritik | 🟡 Yüksek | 🟢 Bilgi |
|----------|:---------:|:---------:|:--------:|
| Index Coverage | 3 | 4 | 2 |
| Query Deseni | 2 | 1 | 3 |
| Write Cost | 0 | 2 | 1 |
| Schema Tasarımı | 0 | 2 | 3 |
| Serverless | 0 | 2 | 1 |
| Veri Modeli | 0 | 1 | 2 |
| **Toplam** | **5** | **12** | **12** |

### Öncelikli Aksiyonlar (İlk 5)

1. **🔴 messages `!=`/`not-in` sorgularını kaldır** — Unread count mimarisini Cloud Function + aggregate field ile değiştir.
2. **🔴 saved_worksheets `userId↑, createdAt↓` index'i ekle** — getUserWorksheets 2800 doküman okumasını sonlandır.
3. **🔴 messages 3 composite index'i oluştur** — listenToMessages'in onSnapshot'ı indexsiz çalışıyor.
4. **🟡 getSharedWithMe için `sharedWith ARRAY_CONTAINS, createdAt↓` index'i ekle** — array-contains sorgusu indexsiz.
5. **🟡 useFascicleStore localStorage → IndexedDB** — 5MB sınırı aşılabilir.

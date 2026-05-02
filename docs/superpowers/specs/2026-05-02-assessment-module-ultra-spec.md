# Assessment Modülü 2.0 — Ultra Premium Teknik Spesifikasyon

**Tarih:** 2026-05-02  
**Durum:** Onay bekleyen tasarım (implementation öncesi)  
**İlgili kod:** `src/components/AssessmentModule.tsx`, `src/components/AssessmentReportViewer.tsx`, `src/components/assessment/*`, `src/components/Screening/*`, `src/services/assessmentService.ts`, `src/services/assessmentGenerator.ts`

---

## 1. Amaç

Değerlendirme modülünü **klinik güvenli**, **KVKK uyumlu**, **aksiyona dönük** ve **kurumsal premium UX** ile ikinci nesil bir ürüne yükseltmek:

1. Öğretmen uzman görüşü için derin katmanlı rapor üretimi.
2. Veli ve kurum kullanıcıları için maskelemeli ve anlaşılır özet.
3. Rapor arşivi, öğrenciye atama, kitapçığa entegrasyon, güvenli paylaşım.
4. Değerlendirme bulgularından **şema zorunlu**, **doğrulanmış** AI destekli müdahale planı (Plan modülü ile köprü).

---

## 2. Kapsam ve Sınırlar

**Kapsamda:**

- Bilişsel batarya akışı (setup → running → report).
- Tarama modülü (`ScreeningModule`) ile tutarlı dil ve risk çerçevesi.
- Firestore veri modeli, Vercel API sözleşmeleri, güvenlik kuralları yönlendirmesi.
- AI plan üretim hattı (prompt versiyonlama, guardrail, kalite skoru).

**Kapsam dışı (bu spec’in sonraki fazı):**

- Resmi psikometrik norm tabloları MEB lisanslı testlerle değiştirme (ayrı klinik onay gerekir).
- Tam offline klinik arşiv (yalnızca pointer + export stratejisi bu spec’te tanımlanır).

---

## 3. Paydaş ve Uyum Gereksinimleri

| Alan | Gereksinim |
|------|------------|
| Pedagoji | ZPD, profil bazlı uyarlanabilirlik, `pedagogicalNote` zorunluluğu (plan çıktılarında) |
| Klinik / MEB | Tanı koyucu dil yok; tarama = “eğitsel risk göstergesi”; zorunlu feragat metni |
| Mühendislik | `AppError`, Zod validation, `any` yok, yeni endpoint’lerde `RateLimiter` |
| AI | `gemini-2.5-flash`, structured output + JSON repair stratejisi ile uyumlu pipeline |
| KVKK | Veri minimizasyonu, rol bazlı görünüm, audit log, retention |

---

## 4. Mevcut Durumdan Kritik Çıkarımlar

Aşağıdaki maddeler implementation önceliğini belirler (kod referansı ile):

1. **Yetkilendirme:** `getAssessmentsByStudent` yalnızca `studentId` ile sorguluyor; tenant/owner filtresi zorunlu (`assessmentService.ts`).
2. **Paylaşım:** `shareAssessment` sahiplik doğrulaması ve tek kaynaklı rapor modeli olmadan kopya doküman üretiyor.
3. **Dil:** “Tanısal Değerlendirme”, “Çocuğum Disleksi mi?” gibi ifadeler klinik sınırı bulanıklaştırıyor.
4. **Ölçüm:** `skipped` testlerin skor tablosuna karışma riski; raporda “ölçülemedi” ayrımı net olmalı.
5. **UI:** `alert`/`confirm` yerine kurumsal modal/toast pattern’i.

---

## 5. Bilgi Mimarisi ve Ekran Akışları

### 5.1 Ana Akış: Batarya Değerlendirmesi

| Adım | Ekran | İçerik |
|------|-------|--------|
| 1 | **Setup** | Öğrenci seçimi (kayıtlı/yeni), yaş, profil (`LearningDisabilityProfile` opsiyonel), seçilecek alt testler, tahmini süre |
| 2 | **Running** | Tam ekran test alanı + daraltılabilir gözlem paneli (drawer); ilerleme stepper |
| 3 | **Report** | Executive summary → risk özeti (nötr dil) → grafik/tab → rotası → aksiyonlar |

**Premium UX gereksinimleri:**

- Üstte sürekli stepper (`1 Kurulum · 2 Uygulama · 3 Rapor`).
- Running’de mobilde gözlem **bottom sheet**.
- Birincil CTA hierarchy: rapor ekranında **“Plan Oluştur”** veya **“Atamalara Gönder”** öne çıkar; PDF/Yazdır/Paylaş secondary veya overflow menüde.

### 5.2 Tarama (`ScreeningModule`) Hizalama

- Başlık ve metinler **“ön tarama / eğitsel risk”** çerçevesinde yeniden yazılır.
- Sonuç ekranından “Değerlendirme bataryasına devam” veya “Plan oluştur” bağlantıları tek veri modeli üzerinden gider.

### 5.3 Rapor Görünüm Katmanları

| Katman | Hedef kitle | İçerik |
|--------|-------------|--------|
| **Özet** | Veli / genel | Maskeleme, güçlü yönler, önerilen 2–3 adım, feragat bandı |
| **Uzman** | Öğretmen / BEP | Gözlem notları, alt test detayı, hata paternleri |
| **Operasyon** | Kurum | Arşiv versiyonu, paylaşım geçmişi, audit girişleri |

---

## 6. Veri Modeli (Firestore Önerisi)

### 6.1 Koleksiyonlar

**`assessment_reports` (master)**

- `id`, `ownerId`, `organizationId?`, `studentId?`
- `studentSnapshot`: `{ displayName, age, grade, gender }` — paylaşımda maskelenebilir alt alan
- `reportPayload`: mevcut `AssessmentReport` ile uyumlu genişletilmiş tip
- `status`: `active | archived | deleted`
- `version`, `source`: `battery | screening | imported`
- `createdAt`, `updatedAt`, `archivedAt?`
- `riskSummary` (normalized, nötr dil alanları)

**`assessment_share_grants`** (kopya rapor yerine ilişki)

- `reportId`, `ownerId`, `granteeUserId`, `permission`: `view_summary | view_full | comment | plan_edit`
- `expiresAt?`, `revokedAt?`, `createdBy`

**`assessment_assignments`**

- `reportId`, `studentId`, `assignedBy`, `items[]` (roadmap/plan aktiviteleri)
- `dueDate?`, `status`, `completedAt?`

**`assessment_archive_snapshots`**

- `reportId`, `version`, `snapshotPayload`, `reason`, `archivedBy`, `createdAt`

**`ai_intervention_plans`** (plan modülü köprüsü)

- `reportId`, `studentId`, `ownerId`
- `goals[]`, `weeklyPlan[]`, `adaptations[]`, `pedagogicalNote`, `riskFlags[]`, `confidence`
- `modelMeta`: `{ provider, model, promptVersion, tokenUsage }`
- `status`: `draft | pending_review | active | superseded`

**`workbook_entries`** genişlemesi (mevcut `workbooks` yapısı ile uyumlu)

- `sourceType`: `assessment_roadmap | intervention_plan_activity`
- `sourceId`: `reportId` veya `planId`

### 6.2 İndeksler (öneri)

- `assessment_reports`: `(ownerId, createdAt desc)`, `(studentId, ownerId)`
- `assessment_share_grants`: `(granteeUserId, reportId)`, `(reportId, granteeUserId)`
- `assessment_assignments`: `(studentId, status)`

### 6.3 Migration Stratejisi

1. Yeni koleksiyonları ekle; mevcut `saved_assessments` okumaya devam.
2. Yazma yolu yeni master’a yönlendir; eski koleksiyon dual-read ile okunur.
3. Paylaşım kayıtlarını `assessment_share_grants` ile normalize et; gereksiz kopyaları pasifleştir.
4. Eski koleksiyon deprecate bildirimi + tek seferlik admin script.

---

## 7. API Sözleşmeleri (Vercel Serverless)

Tüm endpoint’ler: `ApiResponse<T>` (`types/common.ts`), `AppError`, Zod şema (`utils/schemas.ts`), `RateLimiter`, `middleware/permissionValidator.ts` uyumu.

### 7.1 Rapor CRUD ve Arşiv

| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/api/assessments` | Yeni master rapor |
| GET | `/api/assessments` | Liste: `ownerId`, `studentId?`, `status?` |
| GET | `/api/assessments/:id` | Detay — paylaşım grant kontrolü |
| PATCH | `/api/assessments/:id` | Metadata / status |
| POST | `/api/assessments/:id/archive` | Snapshot oluştur |
| GET | `/api/assessments/:id/archive` | Versiyon listesi |

**Örnek istek gövdesi — POST `/api/assessments`**

```json
{
  "studentId": "string | null",
  "studentSnapshot": { "displayName": "", "age": 8, "grade": "", "gender": "" },
  "reportPayload": {},
  "source": "battery"
}
```

**Örnek yanıt**

```json
{
  "success": true,
  "data": { "id": "...", "createdAt": "ISO8601" },
  "timestamp": "ISO8601"
}
```

### 7.2 Paylaşım

| Method | Path | Açıklama |
|--------|------|----------|
| POST | `/api/assessments/:id/shares` | Grant oluştur |
| DELETE | `/api/assessments/:id/shares/:granteeId` | Revoke |
| GET | `/api/me/shared-assessments` | Gelen paylaşımlar |

İstek gövdesinde `permission`, `expiresAt`, `redactionProfile`: `family | teacher | clinical` zorunlu.

### 7.3 Atama

| Method | Path |
|--------|------|
| POST | `/api/assessments/:id/assignments` |
| PATCH | `/api/assignments/:assignmentId` |
| GET | `/api/students/:studentId/assignments` |

### 7.4 Kitapçık Girişi

| Method | Path |
|--------|------|
| POST | `/api/workbooks/:workbookId/entries` |

Gövde: `{ sourceType, sourceId, roadmapItemIds?: string[], planActivityIds?: string[] }`

### 7.5 AI Plan Üretimi

| Method | Path |
|--------|------|
| POST | `/api/assessments/:id/generate-plan` |
| GET | `/api/assessments/:id/plans` |
| POST | `/api/plans/:planId/promote` |

**Rate limit önerisi:** kullanıcı başına saatlik limit (örn. assessment plan: 30/saat); kurum paketinde yükseltilebilir.

---

## 8. AI Plan Motoru — Pipeline

1. **Normalize:** Ham rapor → `AssessmentSnapshot` (PII azaltımı seçenekli).
2. **Deterministic özellik çıkarımı:** beceri vektörü, güçlü/zayıf alanlar, güvenilirlik işaretleri.
3. **LLM structured generation:** Tek şema çıktısı; başarısızsa repair + bounded retry (`services/geminiClient.ts`).
4. **Policy gate:** Tanı dili filtresi, yaş/profil uyumu, zorunlu `pedagogicalNote`.
5. **Quality score:** Şema uyumu + rubric skoru + confidence.
6. **Human review:** Düşük skor veya `requiresClinicalReview` → bekleyen onay kuyruğu (opsiyonel admin entegrasyonu).

**Şema zorunlu alanları (özet):** `planId`, `version`, `goals[]`, `weeklyPlan[]`, `adaptations[]`, `pedagogicalNote`, `riskFlags[]`, `confidence`, `evidenceRefs[]` (hangi alt test/satıra dayandığı).

---

## 9. Güvenlik ve KVKK

1. Firestore kuralları: `ownerId` veya geçerli `share_grant` olmadan okuma/yazma yok.
2. `getAssessmentsByStudent`: her zaman **owner veya atanmış kurum filtresi** ile.
3. `shareAssessment`: server-side kaynak doğrulama; client nesnesine güvenilmez.
4. Export (PDF/yazdır): `redactionProfile`; veli çıktısında klinik notlar varsayılan kapalı.
5. Audit: `assessment_audit_log` koleksiyonu veya mevcut `auditService` entegrasyonu — `view`, `share`, `export`, `plan_generate`.
6. Retention: politikaya göre `deleted` + zamanlanmış purge (implementasyon fazı 2).

---

## 10. Sprint Backlog ve Kabul Ölçütleri

### Sprint A — Güvenlik ve Dil (P0)

| Görev | Kabul ölçütü |
|-------|----------------|
| Firestore/API ile owner filtresi | Yetkisiz `studentId` ile başka kullanıcı raporu listelenmez |
| Paylaşım server doğrulama | Taklit assessment objesi ile paylaşım başarısız |
| Dil düzeltmeleri | Başlık/labels “tarama / eğitsel risk”; feragat bandı raporda sabit blok |
| `skipped` test ayrımı | Tablo ve grafiklerde “ölçülemedi” etiketi; skora dahil değil |

### Sprint B — UX Premium

| Görev | Kabul ölçütü |
|-------|----------------|
| alert/confirm kaldırma | Tüm doğrulamalar modal/toast ile |
| Stepper + drawer gözlem | 1024px altında gözlem bottom sheet |
| Rapor tabs | Özet/Uzman/Rotası sekmeleri erişilebilir navigasyon ile |

### Sprint C — Veri Modeli ve API

| Görev | Kabul ölçütü |
|-------|----------------|
| `assessment_reports` yazımı | Yeni kayıtlar master’da; POST `/api/assessments` 200 |
| Share grants | Duplicate rapor oluşmadan paylaşım |
| Migration script | Çift okuma süresinde veri kaybı yok |

### Sprint D — Atama ve Kitapçık

| Görev | Kabul ölçütü |
|-------|----------------|
| Assignment CRUD | Öğrenci panelinde atanmış liste |
| Workbook entry | Roadmap öğesi kitapçıkta izlenebilir `sourceId` ile |

### Sprint E — AI Plan

| Görev | Kabul ölçütü |
|-------|----------------|
| Şema doğrulama | Geçersiz JSON prod’a düşmez |
| pedagogicalNote | Boş plan kabul edilmez |
| Quality gate | Düşük skor pending_review durumunda |

---

## 11. Test Stratejisi

1. **Birim:** risk/roadmap kural fonksiyonları, snapshot parser, Zod şemaları.
2. **Servis integration:** `/api/assessments`, shares, assignments (Vitest veya mocked Firestore admin).
3. **E2E (Playwright):** setup → tek alt test tamamla → rapor → PDF indir (mock) → paylaşım akışı.
4. **Regresyon:** AI plan golden set (bilinenAssessmentSnapshot → beklenen alanların varlığı).

---

## 12. Dokümantasyon ve Operasyon

- Bu spec onaylandıktan sonra implementation planı: `docs/superpowers/plans/YYYY-MM-DD-assessment-module-2.md`
- MODULE_KNOWLEDGE.md içindeki “Değerlendirme Modülleri” bölümü yeni model ile güncellenmeli.

---

## 13. Onay

Bu belge ile **Assessment 2.0** teknik doğrultusu kesinleşir. Implementation’a başlamadan önce: pedagoji + klinik + yazılım liderleri imza/onayı (iş süreci dahilinde).

**Son sürüm:** repo kökünde `docs/superpowers/specs/2026-05-02-assessment-module-ultra-spec.md`.

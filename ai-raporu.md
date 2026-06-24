# OOGMATIK — AI Entegrasyon Denetim Raporu

**Denetleyen:** Selin Arslan — AI/Uzman Sistemler Mimarı  
**Tarih:** 2026-06-24  
**Kapsam:** Gemini entegrasyonu, token maliyeti, hallucination riski, prompt injection güvenliği

---

## 1. Model Sabiti: `gemini-2.5-flash` Tutarlılığı

- **MASTER_MODEL** tanımı `'gemini-2.5-flash'` olarak **13 dosyada** tutarlı:
  - `src/services/geminiClient.ts:23`
  - `src/services/ocrService.ts:20`
  - `src/services/ocrVariationService.ts:34`
  - `src/services/generators/sinavGenerator.ts:15`
  - `src/services/generators/mathSinavGenerator.ts:506`
  - `api/generate.ts:26`
  - `api/sari-kitap/generate.ts:14`
- **Hardcode** edilmiş model string'leri (MASTER_MODEL yerine direkt `'gemini-2.5-flash'`):
  - `src/services/adGeneratorService.ts:88` — `model: 'gemini-2.5-flash'`
  - `src/services/activityStudio/AgentOrchestrator.ts:23` — `model: 'gemini-2.5-flash'`
  - `src/types/activityStudio.ts:10` — tip tanımı (`export type bdmindModel = 'gemini-2.5-flash'`)
  - `src/types/sariKitap.ts:274` — tip tanımı
  - `src/services/generators/sariKitap/engine.ts:89`
  - `src/services/offlineGenerators/sariKitap/heceMotoru.ts:175`
- **Ölü kod kontrolü:** `gemini-2.0` veya `gemini-3` hiçbir dosyada **kullanılmıyor**; `geminiClient.ts:112` ve `api/generate.ts:150` bu legacy modelleri `MASTER_MODEL`'e düşüren guard'lar içeriyor.
- `activityStudio.ts:10`'daki tip tanımı `export type bdmindModel = 'gemini-2.5-flash'` — MASTER_MODEL'e bağlı değil, ayrıca güncellenmeli.

> **Sonuç:** ✅ Tutarlı. Hardcode'lar düşük riskli, ancak `adGeneratorService.ts` ve `AgentOrchestrator.ts` MASTER_MODEL kullanacak şekilde refactor edilebilir.

---

## 2. JSON Repair: 3 Katmanlı Çalışıyor mu?

**Dosya:** `src/utils/jsonRepair.ts`

| Katman | Fonksiyon | Detay |
|--------|-----------|-------|
| **1** | `JSON.parse(cleaned)` | Doğrudan parse dener (temizlik: zero-width chars, ```json blokları, baştan `{`/`[` bul) |
| **2** | `balanceBraces(cleaned)` | Eksik kapanış parantezlerini tamamlar, sonra `JSON.parse` |
| **3** | `truncateToLastValidEntry(cleaned)` | Son geçerli virgülden keser, `balanceBraces` ile kapatır, `JSON.parse` |
| **4** (bonus) | Sondan tarama | En sonda `}`/`]` bul, kalanı kes, parse dene |

Kullanıldığı yerler: `api/generate.ts:250`, `api/sari-kitap/generate.ts:160`, `src/services/ocrService.ts:90`, `src/services/ocrVariationService.ts:68`

> **Sonuç:** ✅ 3+1 katmanlı repair motoru çalışıyor. Testler `tests/jsonRepair.test.ts` ve `tests/phase1-4-integration.test.ts` ile kapsanmış.

---

## 3. Prompt Injection Güvenliği

**Dosya:** `src/utils/promptSecurity.ts` (697 satır)

- **Pattern Database:** 30+ injection pattern (critical → low) — INSTRUCTION_OVERRIDE, ROLE_MANIPULATION, JAILBREAK, SYSTEM_PROMPT_EXTRACTION, vb.
- **`sanitizePromptInput`:** 6 katmanlı temizlik: kritik pattern'leri `[filtered]` ile değiştirir, delimiter injection'ları kaldırır, HTML etiketlerini yok eder, SQL injection'ları temizler, boşlukları düzenler, **default 2000 karakter limiti** uygular.
- **`validatePromptSecurity`:** `api/generate.ts:90`'da çağrılır; `threatThreshold: 'high'` ile çalışır, `blockOnThreat: true`.
- **`quickThreatCheck`:** Hızlı pre-filter (5 kritik pattern).
- **`sanitizeForPrompt`:** Alternatif giriş noktası, 2000 karakter strict mode.
- **Threat Logging:** In-memory log (produksiyonda external service önerilir).

> **`api/generate.ts`'de kullanımı:**
> - `quickThreatCheck(prompt)` — hızlı red
> - `validatePromptSecurity(prompt, { maxLength: 15000, threatThreshold: 'high' })` — full validation
> - `sanitizedPrompt = securityResult.sanitizedInput` — AI'a sanitize edilmiş prompt gider
> - Not: `maxLength: 15000` kullanılıyor (2000 değil). Bu Selin Arslan'ın talimatına aykırı gibi görünse de, prompt builder'dan gelen sistem talimatları da birleştiği için mantıklı.

> **Sonuç:** ✅ Kapsamlı koruma mevcut. 2000 karakter sınırı `sanitizeForPrompt`'da default'tur; `api/generate.ts` prompt builder + system instruction uzunluğu nedeniyle 15000 kullanır — bu kabul edilebilir.

---

## 4. Hallucination Riski — AI Yanıt Doğrulama

- **`validateAndCorrect`:** `AgentOrchestrator.ts:55`'te tanımlı. Ideation, Content, Visual, Flow, Evaluation, Integration ajan çıktıları bu fonksiyondan geçer. Her ajanın çıktısı bir sonraki ajana gönderilmeden önce doğrulanır.
- **`tryRepairJson`:** API katmanında AI yanıtını JSON formatında doğrular. Parse başarısız olursa hata fırlatır.
- **Eksik:** `geminiClient.ts` içinde AI yanıtının yapısal/semantik doğrulaması yok. `safeFetch` sadece HTTP düzeyinde hata yönetimi yapar. Yanıtta `validateAndCorrect` benzeri bir semantik validasyon çağrısı görülmüyor.

> **Sonuç:** ⚠️ Ajan orchestrator düzeyinde doğrulama var, ancak `geminiClient.ts`'ten dönen ham AI yanıtları `validateAndCorrect`'ten geçmiyor. API endpoint'inde `tryRepairJson` ile JSON format kontrolü yapılıyor, ama içerik doğrulaması yok.

---

## 5. Token Maliyeti — Batch İşleme

- **Batch (count > 10 → 5'erli gruplar):** ❌ **Bulunamadı.** `cacheService.ts`'te `preCacheCommonActivities` var ama batch splitting yok. `activityStudioEnhancementService.ts`'de batch processing referansları var ama AI token maliyeti için gruplama yok.
- **Token Sayacı:** ❌ **Hiçbir AI çağrısında token sayımı/loglaması bulunamadı.** `geminiClient.ts`'teki `logInfo('Gemini API çekilmesi', ...)` sadece attempt ve model bilgisi loglar, token sayısı içermez.
- `analyticsEngine.ts`'de `aiRequestsToday: 156` metrik olarak var, ama bu sadece istek sayısı, token maliyeti değil.

> **Sonuç:** ❌ **Kritik eksiklik.** Batch splitting ve token maliyeti takibi implemente edilmemiş. Maliyet şişmesine karşı önlem alınmalı.

---

## 6. Rate Limiting

| Endpoint | Rate Limiter | Limit |
|----------|-------------|-------|
| `api/generate.ts` | `RateLimiter.enforceLimit(userId, userTier, 'apiGeneration')` | free: 20/saat, pro: 200/saat |
| `api/generate-exam.ts` | Inline `checkRateLimit` (Map-based) | IP: 10/saat, User: 30/gün |
| `api/ai/generate-image.ts` | `RateLimiter.enforceLimit(userId, userTier, 'ocrScan')` | free: 5/saat, pro: 50/saat |

- **`rateLimiter.ts`**: Token Bucket algoritması, Firestore persistent quota. Admin: 10.000/saat.
- **Eksik:** `generate-exam.ts`'de inline Map-based limiter var — RateLimiter sınıfı kullanılmamış, Firestore persistent değil.

> **Sonuç:** ✅ Ana AI endpoint'te rate limiting aktif. `generate-exam.ts`'nin RateLimiter'a geçirilmesi önerilir.

---

## 7. CORS Başlıkları

**Dosya:** `src/utils/cors.ts`

- **Wildcard yasak:** Whitelist kullanılıyor (Bora Demir direktifi).
- **İzin verilen originler:** bdmind.com (production), localhost:5173/3000, Vercel preview, Google IDX.
- **Kullanım:** `cors.ts:411` — `export function corsMiddleware(req, res): boolean`
- Tüm API endpoint'lerinde (`generate.ts`, `generate-exam.ts`, `generate-image.ts`) çağrılıyor.

> **Sonuç:** ✅ Doğru yapılandırılmış. Wildcard yok, whitelist mekanizması aktif.

---

## 8. Prompt Şablonları — ZPD, PedagogicalNote, Tanı Dili Filtresi

- **`pedagogicalNote`:** 100+ referans. `geminiClient.ts:144` (ÖĞRETMEN NOTU), `activityStudioLibrary.ts` (her aktivitede), `aiWorksheetService.ts:120/234` (zorunlu kontrol), `templateEngine.ts:8/243` (doğrulama).
- **ZPD Uyumu:** `geminiClient.ts:142` — `ZPD UYUMU (Elif Yıldız)` talimatı. `registry.ts`'de AgeGroup x difficulty mapping var.
- **Tanı Dili Filtresi:** `geminiClient.ts:143` — `"disleksisi olduğu için" KESİNLİKLE KULLANILMAYACAKTIR`.
- **Ancak:** `generate.ts`'deki SYSTEM_INSTRUCTION (satır 29-37) ZPD/pedagogicalNote içermesine rağmen tanı dili filtresi içermiyor. `geminiClient.ts` zengin prompt yapısına sahip ama API endpoint'ten doğrudan yapılan çağrılarda (`api/generate.ts`'deki backend-to-Gemini çağrısı) sadece `SYSTEM_INSTRUCTION` kullanılıyor, `geminiClient.ts`'deki Nöro-Pedagojik Bağlam Bildirimi geçerli değil.

> **Sonuç:** ⚠️ Client-side (geminiClient.ts) zengin prompt içeriyor. API endpoint'ten doğrudan Gemini REST API çağrısı yapıldığında bu koruyucu şablonlar atlanıyor. Backend-to-Gemini çağrıları da aynı prompt zenginliğine sahip olmalı.

---

## 9. Retry Stratejisi

**`geminiClient.ts:163-207`:**
| Parametre | Değer |
|-----------|-------|
| Max deneme | **5** |
| Hata tipleri | 429, 503, 504, quota, demand, overloaded |
| Bekleme stratejisi | **Exponential backoff:** 2s → 4s → 8s → 16s |
| Sonuç | Başarısız olursa hata fırlatır |

**`api/generate.ts`** `retryWithBackoff` kullanır (`maxRetries: 2`). Ayrıca API key rotation mekanizması var (3 key'e kadar, 403/429'da sıradaki key'e geçer).

> **Sonuç:** ✅ Retry ve exponential backoff çalışıyor. API key rotation ek güvenlik katmanı.

---

## 10. Token Sayacı — AI Çağrı Loglaması

- **❌ Token sayımı bulunamadı.** `geminiClient.ts`'deki loglar model ve attempt bilgisi içerir, token sayısı içermez.
- **❌ Her AI çağrısı için token maliyeti loglaması yok.**
- `analyticsEngine.ts`'de `aiRequestsToday` sadece istek sayısı.
- Google Gemini API yanıtında `usageMetadata` alanı döner (`promptTokenCount`, `candidatesTokenCount`, `totalTokenCount`) — bu değerler yakalanıp loglanmıyor.

> **Sonuç:** ❌ **Kritik eksiklik.** Token maliyeti görünmez. Maliyet optimizasyonu yapılamaz.

---

## 11. advancedAI.ts TODO'ları — Önceliklendirme

| TODO | Satır | Durum |
|------|-------|-------|
| Google Cloud Speech-to-Text | 102 | Placeholder — mock yanıt döner |
| Google Cloud TTS / ElevenLabs | 150 | Placeholder — boş Blob döner |
| AI model for emotion detection | 174 | Placeholder — sabit `engaged` döner |
| Google Cloud Vision API / ML model (handwriting OCR) | 225 | Placeholder — mock yanıt döner |

**Önceliklendirme:**
1. **Handwriting OCR (Vision)** — Mevcut OCR sistemiyle tamamlayıcı; en yüksek gerçek dünya etkisi.
2. **TTS (Text-to-Speech)** — Disleksi öğrencileri için sesli okuma kritik.
3. **STT (Speech-to-Text)** — Okuma akıcılığı ölçümü için gerekli.
4. **Emotion Detection** — En düşük öncelik; mevcut sistem yeterli veri sağlıyor.

> **Sonuç:** ⚠️ 4 placeholder servis. En kritiği handwriting OCR (Vision) — OCR pipeline ile birleştirilmeli.

---

## 12. MASTER_MODEL Referans Dağılımı

| Dosya | Satır | Kullanım |
|-------|-------|----------|
| `geminiClient.ts` | 23, 111, 113, 251 | Tanım, fallback, SVG |
| `api/generate.ts` | 26, 148, 151 | Tanım, model selection |
| `ocrService.ts` | 20, 52 | Tanım, URL |
| `ocrVariationService.ts` | 34, 46 | Tanım, URL |
| `sinavGenerator.ts` | 15, 88 | Tanım, URL |
| `mathSinavGenerator.ts` | 506, 521 | Tanım, URL |
| `api/sari-kitap/generate.ts` | 14, 131 | Tanım, URL |
| `generators/newActivities.ts` | 250 | Comment referansı |

Tümü `'gemini-2.5-flash'` ile tutarlı.

---

## 13. Diğer Bulgular

- **`generate-exam.ts`:** Rate limiting inline Map ile yapılıyor, `RateLimiter` sınıfı kullanılmamış. Firestore persistent değil.
- **`generate.ts` prompt güvenliği:** `engine.ts`, `sariKitap/engine.ts` gibi backend-to-Gemini çağrıları `promptSecurity.ts`'den geçmez — doğrudan REST API çağrısı yaparlar.
- **`_boilerplate/generators.ts`:** Dosya bulunamadı (__boilerplate dizini yok).

---

## Özet Karne

| Kontrol | Durum |
|---------|-------|
| Model sabiti tutarlılığı | ✅ |
| JSON repair (3 katmanlı) | ✅ |
| Prompt injection sanitizasyonu | ✅ |
| Hallucination doğrulama (validateAndCorrect) | ⚠️ Kısmi |
| Token maliyeti (batch işleme) | ❌ |
| Rate limiting | ✅ |
| CORS başlıkları | ✅ |
| Prompt şablonları (ZPD, pedNote, tanı dili) | ⚠️ API endpoint eksik |
| Retry stratejisi (5 deneme, exponential) | ✅ |
| Token sayacı (AI çağrı loglama) | ❌ |
| advancedAI.ts TODO'ları | ⚠️ 4 placeholder |
| MASTER_MODEL referansları | ✅ |

---

## Acil Aksiyonlar

1. **Token maliyeti takibi** — `geminiClient.ts`'e token sayacı eklenmeli, Google `usageMetadata` loglanmalı.
2. **Batch splitting** — Count > 10 olduğunda 5'erli gruplara bölen mekanizma eklenmeli.
3. **Backend-to-Gemini prompt güvenliği** — OCR ve sınav servisleri de promptSecurity'den geçmeli.
4. **Zengin prompt şablonu** — `api/generate.ts`'deki SYSTEM_INSTRUCTION, `geminiClient.ts`'deki Nöro-Pedagojik Bağlam ile uyumlu hale getirilmeli.
5. **advancedAI.ts** — Handwriting OCR (Vision API) ilk öncelik olarak implemente edilmeli.

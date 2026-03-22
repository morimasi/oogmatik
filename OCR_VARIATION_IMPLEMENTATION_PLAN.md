# OCR Varyasyon Sistemi — İmplementasyon Planı

**Mühendis**: Bora Demir
**Tarih**: 2026-03-21
**Sprint**: 6
**Tahmini Süre**: 8-10 saat (1 geliştirici)

---

## 📋 Sprint Görevleri (Priority Order)

### Phase 1: Foundation & Validation (2-3 saat)

#### Task 1.1: Image Validator Utility ✅
**Dosya**: `utils/imageValidator.ts`
**Açıklama**: Gemini Vision için dosya boyut/format/güvenlik kontrolü

```typescript
// Özellikler:
- MAX_FILE_SIZE: 15MB kontrolü
- MIME type whitelist (jpg/png/webp/heic)
- Dimension kontrolü (max 4096px)
- Base64 validation
- Memory-safe image dimension reader
```

**Test**: `tests/ImageValidator.test.ts`
```bash
npm run test -- ImageValidator.test.ts
```

**Çıktı kriterleri:**
- Tüm testler geçmeli
- 15MB+ dosya reddedilmeli
- GIF/BMP formatı reddedilmeli
- Base64 header kontrolü çalışmalı

---

#### Task 1.2: OCR Service Refactor (LRU Cache + Retry) ✅
**Dosya**: `services/ocrService.ts`
**Açıklama**: Memory leak fix + retry logic iyileştirme

**Değişiklikler:**
1. LRU Cache implementasyonu (FIFO → LRU)
2. `retryWithBackoff` entegrasyonu
3. Canvas cleanup (memory leak fix)
4. Type safety iyileştirmeleri (`as OCRDetectedType` → type guard)

**Test**: Mevcut testleri kırmamalı
```bash
npm run test -- ocrService.test.ts
```

**Validasyon:**
```typescript
// Cache stats API
ocrService.getCacheStats() // { size, maxSize, hitRate }
```

---

### Phase 2: Variation Engine (3-4 saat)

#### Task 2.1: OCR Variation Service ✅
**Dosya**: `services/ocrVariationService.ts`
**Açıklama**: Blueprint → WorksheetData[] dönüştürücü

**Özellikler:**
- `generateVariations(request: VariationRequest): Promise<VariationResult>`
- Gemini batch generation (1 API call = N varyant)
- Quality control (pedagogicalNote zorunlu)
- Post-processing (metadata ekleme)

**Prompt Engineering:**
```
KURALLAR:
1. MİMARİ AYNI: Layout, sütun, format korunur
2. VERİ FARKLI: Sayılar, metinler, kelimeler farklı
3. ZORLUK AYNI: Blueprint'teki zorluk seviyesi
4. PEDAGOJİK UYUM: Profile göre uyarlama
```

**Test**: `tests/OCRVariation.test.ts`
```bash
npm run test -- OCRVariation.test.ts
```

---

#### Task 2.2: API Endpoints ✅
**Dosyalar**:
- `api/ocr/analyze.ts` → POST /api/ocr/analyze
- `api/ocr/generate-variations.ts` → POST /api/ocr/generate-variations

**Standart Pattern:**
```typescript
// CORS + Method Guard
res.setHeader('Access-Control-Allow-Origin', '*');
if (req.method !== 'POST') { ... }

// Zod Validation
validateOCRAnalyzeRequest(req.body);

// Rate Limiting
rateLimiter.checkLimit(userId, 'OCR_ANALYZE');

// retryWithBackoff
const result = await retryWithBackoff(() => ocrService.processImage(...));

// AppError standardı
return res.status(200).json({ success: true, data, timestamp });
```

**Test**: Postman/cURL testleri
```bash
curl -X POST http://localhost:5173/api/ocr/analyze \
  -H "Content-Type: application/json" \
  -d '{"image":"data:image/jpeg;base64,...","userId":"test"}'
```

---

### Phase 3: Frontend Integration (2-3 saat)

#### Task 3.1: OCRScanner.tsx Refactor ✅
**Dosya**: `components/OCRScanner.tsx`

**Değişiklikler:**

1. **Dosya Validasyonu** (line ~330)
```typescript
import { validateImageFile } from '../utils/imageValidator.js';

const processFiles = useCallback(async (fileList: File[]) => {
    // Validasyon + warning toast
    const validationResults = await Promise.all(
        fileList.map(file => validateImageFile(file))
    );
    // ...
}, []);
```

2. **Retry Logic** (line ~503 - ESKİSİ KALDIRILACAK)
```typescript
// Eski manuel retry kaldırılacak
// retryWithBackoff kullanılacak
const startAnalysis = async (img: string) => {
    const result = await retryWithBackoff(
        () => fetch('/api/ocr/analyze', {...}),
        { maxRetries: 3, initialDelay: 1500 }
    );
};
```

3. **Varyasyon Modal UI**
```typescript
// Blueprint analiz sonrası gösterilecek modal
const [showVariationModal, setShowVariationModal] = useState(false);
const [variationCount, setVariationCount] = useState(3);

<VariationModal
    isOpen={showVariationModal}
    blueprint={analysisResult}
    onGenerate={handleGenerateVariations}
/>
```

**UI Tasarımı:**
```
┌─────────────────────────────────────┐
│  ✅ Blueprint Analizi Tamamlandı    │
├─────────────────────────────────────┤
│  Mimari DNA: 2 sütun, 10 soru       │
│  Kalite: Yüksek ⭐⭐⭐               │
├─────────────────────────────────────┤
│  Kaç varyant üretmek istersiniz?    │
│  [━━━━●━━━━━] 5 varyant             │
├─────────────────────────────────────┤
│  [İptal]  [Varyantları Üret 🚀]     │
└─────────────────────────────────────┘
```

---

#### Task 3.2: Varyasyon Sonuç Görüntüleme ✅
**Bileşen**: `components/VariationResultsView.tsx` (YENİ)

**Özellikler:**
- Grid layout (3 varyant → 3 kart)
- Her kart: thumbnail + başlık + "İncele" butonu
- Tek tıkla WorksheetStore'a ekleme
- Toplu ekleme: "Tümünü Ekle"

```typescript
interface VariationCardProps {
  variation: WorksheetData;
  index: number;
  onAdd: (variation: WorksheetData) => void;
}

const VariationCard: React.FC<VariationCardProps> = ({ variation, index, onAdd }) => {
  return (
    <div className="variation-card">
      <h4>Varyant {index + 1}</h4>
      <div className="preview" dangerouslySetInnerHTML={{ __html: variation.content }} />
      <button onClick={() => onAdd(variation)}>Ekle</button>
    </div>
  );
};
```

---

### Phase 4: Testing & Validation (1-2 saat)

#### Task 4.1: Unit Tests ✅
**Dosyalar:**
- `tests/ImageValidator.test.ts`
- `tests/OCRVariation.test.ts`
- `tests/OCRService.test.ts` (mevcut, güncellenecek)

**Test Senaryoları:**

1. **ImageValidator**
   - ✅ 15MB+ dosya reddedilir
   - ✅ GIF/BMP reddedilir
   - ✅ Geçerli JPEG/PNG kabul edilir
   - ✅ Base64 validation çalışır

2. **OCRVariation**
   - ✅ 1-10 arası varyasyon üretir
   - ✅ 11+ count ValidationError fırlatır
   - ✅ Low quality blueprint reddedilir
   - ✅ Her varyasyonda pedagogicalNote var

3. **OCRService**
   - ✅ LRU cache hit rate >70%
   - ✅ TTL geçmiş cache silinir
   - ✅ Retry 3 kez dener
   - ✅ Canvas memory leak yok

**Çalıştırma:**
```bash
npm run test
npm run test:coverage # >80% hedef
```

---

#### Task 4.2: Integration Tests ✅
**Dosya**: `tests/e2e/ocrVariation.spec.ts` (Playwright)

**Senaryo:**
```typescript
test('Kullanıcı OCR ile 3 varyant üretir', async ({ page }) => {
  // 1. OCR Scanner aç
  await page.goto('/');
  await page.click('[data-testid="ocr-scanner-btn"]');

  // 2. Görsel yükle
  await page.setInputFiles('input[type="file"]', 'test-fixtures/math-worksheet.jpg');

  // 3. Analiz tamamlanana kadar bekle
  await page.waitForSelector('[data-testid="variation-modal"]');

  // 4. 3 varyant seç
  await page.fill('input[type="range"]', '3');
  await page.click('button:has-text("Varyantları Üret")');

  // 5. Sonuçları kontrol et
  await page.waitForSelector('[data-testid="variation-card"]');
  const cards = await page.$$('[data-testid="variation-card"]');
  expect(cards.length).toBe(3);

  // 6. Tümünü ekle
  await page.click('button:has-text("Tümünü Ekle")');
  await page.waitForSelector('[data-testid="toast-success"]');
});
```

**Çalıştırma:**
```bash
npx playwright test ocrVariation.spec.ts
```

---

#### Task 4.3: Performance Tests ✅
**Araç**: k6 (load testing)

**Senaryo 1: Concurrent OCR Analyze**
```javascript
// tests/performance/ocr-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // 10 concurrent users
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const payload = JSON.stringify({
    image: 'data:image/jpeg;base64,...',
    userId: `user_${__VU}`,
  });

  const res = http.post('http://localhost:5173/api/ocr/analyze', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(1);
}
```

**Çalıştırma:**
```bash
k6 run tests/performance/ocr-load.js
```

**Hedef Metrikler:**
- p95 response time: <5s
- Error rate: <2%
- Throughput: >10 req/s

---

### Phase 5: Documentation & Deploy (1 saat)

#### Task 5.1: API Documentation ✅
**Dosya**: `swagger.yaml` (güncelle)

```yaml
paths:
  /api/ocr/analyze:
    post:
      summary: OCR Blueprint Analizi
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                image:
                  type: string
                  description: Base64 encoded image
                userId:
                  type: string
      responses:
        200:
          description: Başarılı analiz
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OCRResult'
        400:
          $ref: '#/components/responses/ValidationError'
        429:
          $ref: '#/components/responses/RateLimitError'

  /api/ocr/generate-variations:
    post:
      summary: Blueprint Varyasyon Üretimi
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VariationRequest'
      responses:
        200:
          description: Varyasyonlar üretildi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VariationResult'
```

---

#### Task 5.2: Kullanıcı Dokümantasyonu ✅
**Dosya**: `docs/OCR_VARIATION_GUIDE.md`

**İçerik:**
1. Özellik Tanıtımı
2. Adım Adım Kullanım
3. En İyi Pratikler (görsel kalitesi, format seçimi)
4. Sık Sorulan Sorular
5. Hata Çözümleri

---

#### Task 5.3: Vercel Deployment ✅
**Adımlar:**

1. **Environment Variables** (Vercel Dashboard)
```bash
GEMINI_API_KEY=***
NODE_ENV=production
```

2. **Vercel Config** (`vercel.json` - güncelle)
```json
{
  "functions": {
    "api/ocr/*.ts": {
      "memory": 3008,
      "maxDuration": 30
    }
  }
}
```

3. **Deploy**
```bash
vercel --prod
```

4. **Smoke Test** (Production)
```bash
curl -X POST https://oogmatik.vercel.app/api/ocr/analyze \
  -H "Content-Type: application/json" \
  -d '{"image":"...","userId":"smoke_test"}'
```

---

## 🔄 Rollback Plan

Eğer production'da kritik hata olursa:

```bash
# 1. Önceki versiyona dön
vercel rollback

# 2. Feature flag ile OCR variation'ı devre dışı bırak
# utils/featureFlags.ts
export const FEATURE_FLAGS = {
  OCR_VARIATION: false, // ← bu değişecek
};

# 3. Hotfix branch oluştur
git checkout -b hotfix/ocr-variation-v1.0.1
```

---

## 📊 Success Metrics

| Metrik | Hedef | Ölçüm |
|--------|-------|-------|
| Blueprint Analiz Başarı Oranı | >95% | API logs |
| Varyasyon Kalitesi (pedagogicalNote var) | 100% | Validation tests |
| Kullanıcı Tatmini | >4.5/5 | Feedback modal |
| API Response Time (p95) | <5s | Performance monitoring |
| Cache Hit Rate | >70% | `getCacheStats()` |
| Memory Leak | 0 | Heap snapshots |

---

## 🚨 Risk Mitigation

| Risk | Olasılık | Etki | Çözüm |
|------|----------|------|-------|
| Gemini API rate limit | Orta | Yüksek | Retry + user feedback |
| Low quality blueprint | Yüksek | Orta | Validation + warning toast |
| Memory leak (canvas) | Düşük | Yüksek | LRU cache + cleanup |
| Large file upload | Orta | Orta | 15MB limit + compression |

---

## 📝 Commit Mesaj Şablonu

```
feat(ocr): Add variation generation system

- Implement LRU cache for blueprint storage
- Add image validation utility (max 15MB)
- Create variation service with Gemini batch API
- Update OCRScanner UI with variation modal
- Add retry logic with exponential backoff
- Fix memory leak in canvas cleanup

Tests:
- Unit tests: ImageValidator, OCRVariation
- E2E test: Upload → Analyze → Generate 3 variations
- Performance test: 20 concurrent requests

Closes #XXX

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## ✅ Pre-Launch Checklist

```
□ Tüm unit testler geçiyor (npm run test)
□ E2E testler geçiyor (playwright)
□ Performance testleri geçiyor (k6)
□ Memory leak yok (heap profiling)
□ TypeScript strict mode error yok
□ AppError standardı her yerde kullanılıyor
□ Rate limiting test edildi
□ CORS ayarları doğru
□ Swagger dokümantasyonu güncellendi
□ Kullanıcı dokümantasyonu hazır
□ Rollback planı test edildi
□ Production smoke test başarılı
```

---

**İmplementasyon bu plana göre başlayabilir. Her task tamamlandığında bu doküman güncellenecek.**

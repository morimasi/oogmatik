# OCR Varyasyon Sistemi — Dosya Yapısı ve Değişiklik Matrisi

**Proje**: Oogmatik
**Sprint**: 6 - OCR Variation Enhancement
**Mühendis**: Bora Demir

---

## 📁 Eklenecek Dosyalar (7 yeni dosya)

```
utils/
└── imageValidator.ts                     [YENİ] 200 satır — Dosya boyut/format kontrolü

services/
└── ocrVariationService.ts                [YENİ] 180 satır — Varyasyon orkestratörü

api/ocr/
├── analyze.ts                            [YENİ] 80 satır — POST /api/ocr/analyze
└── generate-variations.ts                [YENİ] 90 satır — POST /api/ocr/generate-variations

components/
└── VariationResultsView.tsx              [YENİ] 150 satır — Varyasyon sonuç grid UI

tests/
├── ImageValidator.test.ts                [YENİ] 120 satır — Image validator unit tests
├── OCRVariation.test.ts                  [YENİ] 150 satır — Variation service tests
└── e2e/
    └── ocrVariation.spec.ts              [YENİ] 80 satır — E2E Playwright test

docs/
└── OCR_VARIATION_GUIDE.md                [YENİ] Kullanıcı dokümantasyonu
```

---

## 🔄 Güncellenecek Dosyalar (6 dosya)

### 1. `services/ocrService.ts` [GÜNCELLE]
**Satır Sayısı**: 167 → ~280 (+113 satır)

**Değişiklikler:**
```typescript
// ❌ ESKİ: FIFO Cache
const blueprintCache = new Map<string, { result: OCRResult; timestamp: number }>();

// ✅ YENİ: LRU Cache
class LRUCache<K, V extends { timestamp: number; accessCount: number }> { ... }
const blueprintCache = new LRUCache<string, CacheEntry>(20);

// ❌ ESKİ: Manuel retry yok
const result = await analyzeImage(base64Image, prompt, schema);

// ✅ YENİ: retryWithBackoff entegrasyonu
const result = await retryWithBackoff<OCRBlueprint>(
    () => analyzeImage(base64Image, prompt, schema),
    { maxRetries: 3, initialDelay: 1500 }
);

// ✅ YENİ: Cache stats API
getCacheStats: () => ({ size: blueprintCache.size(), maxSize: 20 })
```

**Risk**: Düşük — Mevcut API aynı, internal logic değişiyor

---

### 2. `components/OCRScanner.tsx` [GÜNCELLE]
**Satır Sayısı**: 917 → ~1050 (+133 satır)

**Değişiklikler:**

**Line ~330: processFiles() — Validation ekleme**
```typescript
// ✅ YENİ: Dosya validasyonu
import { validateImageFile } from '../utils/imageValidator.js';

const validationResults = await Promise.all(
    fileList.map(file => validateImageFile(file))
);

const errors = validationResults.filter(v => !v.isValid);
if (errors.length > 0) {
    setError(errors[0].error || 'Dosya geçersiz.');
    return;
}
```

**Line ~503: startAnalysis() — Retry logic değiştirme**
```typescript
// ❌ ESKİ: Manuel retry (3 satır if-else)
if (currentRetry < 2) {
    setTimeout(() => startAnalysis(img, attemptNumber + 1), delayMs);
}

// ✅ YENİ: retryWithBackoff
const result = await retryWithBackoff(
    () => fetch('/api/ocr/analyze', {...}),
    { maxRetries: 3, initialDelay: 1500 }
);
```

**Yeni State + Modal**
```typescript
// ✅ YENİ: Varyasyon modalı state
const [showVariationModal, setShowVariationModal] = useState(false);
const [variationCount, setVariationCount] = useState(3);
const [variationResult, setVariationResult] = useState<VariationResult | null>(null);

// ✅ YENİ: Modal render
{showVariationModal && (
    <VariationModal
        isOpen={showVariationModal}
        blueprint={analysisResult}
        onGenerate={handleGenerateVariations}
        onClose={() => setShowVariationModal(false)}
    />
)}
```

**Risk**: Orta — UI değişiklikleri dikkatli test edilmeli

---

### 3. `types/core.ts` [GÜNCELLE]
**Satır Sayısı**: ~600 → ~650 (+50 satır)

**Eklemeler:**
```typescript
// ✅ YENİ: Varyasyon metadata tipi
export interface VariationMetadata {
  source: 'ocr_variation';
  originalBlueprint: string;
  variationIndex: number;
  totalVariations: number;
}

// ✅ GÜNCELLE: WorksheetData interface
export interface WorksheetData {
  // ... mevcut alanlar
  metadata?: VariationMetadata; // ← YENİ ALAN
}

// ✅ YENİ: Varyasyon request/response tipleri
export interface VariationRequest {
  blueprint: OCRResult;
  count: number; // 1-10
  targetProfile?: LearningDisabilityProfile;
  ageGroup?: AgeGroup;
  userId: string;
}

export interface VariationResult {
  variations: WorksheetData[];
  metadata: {
    requestedCount: number;
    successfulCount: number;
    failedCount: number;
    quality: 'high' | 'medium' | 'low';
    warnings?: string[];
  };
}
```

**Risk**: Çok Düşük — Type-safe eklemeler, breaking change yok

---

### 4. `services/rateLimiter.ts` [GÜNCELLE]
**Satır Sayısı**: ~150 → ~165 (+15 satır)

**Eklemeler:**
```typescript
// ✅ YENİ: OCR limit tanımı
const RATE_LIMITS = {
  // ... mevcut limitler
  OCR_ANALYZE: {
    windowMs: 60 * 60 * 1000, // 1 saat
    maxRequests: 10, // 10 analiz/saat
  },
  GENERATE: {
    // Mevcut ama not: 10 varyasyon = 1 GENERATE olarak sayılır
    windowMs: 24 * 60 * 60 * 1000,
    maxRequests: 50,
  },
};
```

**Risk**: Çok Düşük — Sadece yeni limit ekleniyor

---

### 5. `swagger.yaml` [GÜNCELLE]
**Satır Sayısı**: ~800 → ~950 (+150 satır)

**Eklemeler:**
```yaml
paths:
  /api/ocr/analyze: # ← YENİ endpoint
    post:
      summary: OCR Blueprint Analizi
      # ... schema definitions

  /api/ocr/generate-variations: # ← YENİ endpoint
    post:
      summary: Blueprint Varyasyon Üretimi
      # ... schema definitions

components:
  schemas:
    VariationRequest: # ← YENİ schema
    VariationResult:  # ← YENİ schema
    OCRResult:        # ← MEVCUT (reference eklenecek)
```

**Risk**: Yok — Sadece dokümantasyon

---

### 6. `vercel.json` [GÜNCELLE]
**Eklemeler:**
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

**Risk**: Düşük — Production'da test edilmeli

---

## 🔗 Bağımlılık Grafiği

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│            components/OCRScanner.tsx [GÜNCELLE]             │
│                          ↓                                   │
│         components/VariationResultsView.tsx [YENİ]          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                            │
│         api/ocr/analyze.ts [YENİ]                           │
│         api/ocr/generate-variations.ts [YENİ]               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  BUSINESS LOGIC                             │
│      services/ocrService.ts [GÜNCELLE]                      │
│      services/ocrVariationService.ts [YENİ]                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    UTILITIES                                │
│      utils/imageValidator.ts [YENİ]                         │
│      utils/errorHandler.ts [MEVCUT - retryWithBackoff]      │
│      services/rateLimiter.ts [GÜNCELLE]                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   EXTERNAL API                              │
│         services/geminiClient.ts [MEVCUT]                   │
│              analyzeImage(), generateWithSchema()           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test Bağımlılıkları

```
tests/ImageValidator.test.ts
    └── utils/imageValidator.ts

tests/OCRVariation.test.ts
    ├── services/ocrVariationService.ts
    ├── services/ocrService.ts (mock)
    └── services/geminiClient.ts (mock)

tests/e2e/ocrVariation.spec.ts
    ├── components/OCRScanner.tsx
    ├── api/ocr/analyze.ts
    ├── api/ocr/generate-variations.ts
    └── components/VariationResultsView.tsx
```

---

## 📊 Dosya Boyut Tahmini

| Dosya | Satır | KB (tahmini) |
|-------|-------|--------------|
| **YENİ Dosyalar** | | |
| utils/imageValidator.ts | 200 | 6 KB |
| services/ocrVariationService.ts | 180 | 5 KB |
| api/ocr/analyze.ts | 80 | 2 KB |
| api/ocr/generate-variations.ts | 90 | 2 KB |
| components/VariationResultsView.tsx | 150 | 4 KB |
| tests/ImageValidator.test.ts | 120 | 3 KB |
| tests/OCRVariation.test.ts | 150 | 4 KB |
| tests/e2e/ocrVariation.spec.ts | 80 | 2 KB |
| **Toplam YENİ** | **1050** | **28 KB** |
| | | |
| **GÜNCELLENEN Dosyalar** | | |
| services/ocrService.ts | +113 | +3 KB |
| components/OCRScanner.tsx | +133 | +4 KB |
| types/core.ts | +50 | +1 KB |
| services/rateLimiter.ts | +15 | +0.5 KB |
| swagger.yaml | +150 | +4 KB |
| **Toplam GÜNCELLE** | **+461** | **+12.5 KB** |
| | | |
| **GENEL TOPLAM** | **+1511 satır** | **+40.5 KB** |

---

## 🔍 Breaking Changes Kontrolü

### ✅ HAYIR — Breaking Change Yok

**Neden?**
1. Mevcut API'ler değişmiyor
2. `ocrService.processImage()` signature aynı
3. `OCRResult` tipine sadece optional alan ekleniyor
4. UI'da yeni modal, mevcut akış etkilenmiyor

**Backward Compatibility:**
- Eski OCR Scanner aynı çalışmaya devam eder
- Yeni varyasyon özelliği opt-in (modal ile)

---

## 🚀 Deploy Stratejisi

### 1. Staging Deploy
```bash
git checkout -b feat/ocr-variation
# ... implementasyon
git push origin feat/ocr-variation
vercel --env=staging
```

**Smoke Test (Staging):**
```bash
curl https://oogmatik-staging.vercel.app/api/ocr/analyze
```

### 2. Production Deploy (Feature Flag)
```typescript
// utils/featureFlags.ts
export const FEATURE_FLAGS = {
  OCR_VARIATION: process.env.ENABLE_OCR_VARIATION === 'true',
};

// OCRScanner.tsx
{FEATURE_FLAGS.OCR_VARIATION && showVariationModal && <VariationModal />}
```

**Environment Variable:**
```bash
vercel env add ENABLE_OCR_VARIATION
> false # İlk deploy'da kapalı

# Test sonrası:
vercel env rm ENABLE_OCR_VARIATION
vercel env add ENABLE_OCR_VARIATION
> true # Aktifleştir
```

### 3. Rollout Plan
```
Week 1: Internal testing (feature flag = true, admin only)
Week 2: Beta testing (50% user rollout)
Week 3: Full rollout (100% users)
```

---

## 🔐 Güvenlik Değişiklik Matrisi

| Dosya | Güvenlik Riski | Çözüm |
|-------|----------------|-------|
| imageValidator.ts | File size bomb | 15MB hard limit |
| api/ocr/analyze.ts | Base64 injection | MIME type whitelist |
| api/ocr/generate-variations.ts | Rate limit bypass | rateLimiter entegrasyonu |
| ocrVariationService.ts | Prompt injection | Schema validation + Gemini safe mode |
| OCRScanner.tsx | XSS (dangerouslySetInnerHTML) | ⚠️ DİKKAT: Variation preview'da sanitize gerekli |

**Action Required:**
```typescript
// VariationResultsView.tsx
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(variation.content)
}} />
```

---

## 📋 Pre-Commit Checklist

```
□ TypeScript strict mode error yok (npm run build)
□ Tüm import path'ler .js extension'lı
□ AppError formatı her endpoint'te kullanılıyor
□ pedagogicalNote her varyasyonda var
□ Rate limiting test edildi
□ Image validation test edildi
□ Memory leak test edildi (Chrome DevTools)
□ LRU cache test edildi
□ retryWithBackoff çalışıyor
□ CORS header'lar doğru
□ swagger.yaml güncel
□ Test coverage >80%
```

---

## 🎯 Post-Deploy Monitoring

### Metrikler (Vercel Analytics)

```javascript
// Custom events
analytics.track('ocr_analyze_success', { quality, duration });
analytics.track('ocr_variation_generated', { count, quality });
analytics.track('ocr_error', { code, message });
```

### Dashboard (Örnek)
```
┌─────────────────────────────────────────┐
│  OCR Varyasyon Metrikleri (24h)         │
├─────────────────────────────────────────┤
│  Toplam Analiz: 1,245                   │
│  Başarı Oranı: 97.2% ✅                 │
│  Avg Duration: 3.8s                     │
├─────────────────────────────────────────┤
│  Varyasyon Üretimi: 324                 │
│  Avg Count: 4.2 varyant/istek           │
│  Kalite Dağılımı:                       │
│    High: 78% | Medium: 19% | Low: 3%    │
├─────────────────────────────────────────┤
│  Cache Hit Rate: 73% 🎯                 │
│  Rate Limit Exceeded: 12 (0.9%)         │
└─────────────────────────────────────────┘
```

---

**Bu dosya yapısı ve değişiklik planı implementasyon boyunca referans alınacaktır.**

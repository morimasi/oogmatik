# İçerik Motoru — Kapsamlı Analiz ve Geliştirme Planı

> **Proje:** BDMIND EdTech Platformu (Oogmatik)
> **Tarih:** 2026-06-25
> **Versiyon:** 1.0
> **Kapsam:** Tüm AI içerik üretim mimarisi, stüdyolar, generatörler, prompt sistemleri

---

## 1. MEVCUT MİMARİ ÖZETİ

### 1.1 Sistem Genel Görünümü

```
Kullanıcı Girdisi (Stüdyo UI)
    ↓
[Stüdyo Bileşeni] (SuperStudio / CreativeStudio / ActivityStudio / vb.)
    ↓
[State Yönetimi] (Zustand Store'ları)
    ↓
[Generator Servisi] (ActivityService → Registry → AI/Offline)
    ↓
[Prompt Builder] (Template bazlı prompt oluşturma)
    ↓
[Gemini Client] (geminiClient.ts → gemini-2.5-flash)
    ↓
[Response İşleme] (JSON Repair → WorksheetBuilder → Cache)
    ↓
[Çıktı] (A4 Önizleme / PDF / JSON)
```

### 1.2 Stüdyo Sistemi (5 Ana Stüdyo)

| Stüdyo | Dosya | Satır | Amaç |
|--------|-------|-------|------|
| **SuperStudio** (Süper Türkçe) | `SuperStudio/index.tsx` | 114 | Türkçe anlama, 8 şablon, AI + Hızlı mod |
| **CreativeStudio** (Ultra Etkinlik) | `CreativeStudio/index.tsx` | 257 | Serbest form AI, klinik profilleme |
| **ActivityStudio** (Etkinlik Stüdyosu) | `ActivityStudio/` | 600+ | 5 adımlı sihirbaz, 6 ajan pipeline |
| **WordSentenceStudio** | `WordSentenceStudio/` | 150 | Boşluk doldurma, çoktan seçmeli |
| **FascicleStudio** | `FascicleStudio/` | 300+ | Çok sayfalık fasikül compose |

### 1.3 Generator Altyapısı

| Bileşen | Dosya | Satır | Amaç |
|---------|-------|-------|------|
| ActivityService (Facade) | `generators/ActivityService.ts` | 202 | Tek giriş noktası, toplu işleme |
| Registry | `generators/registry.ts` | 523 | 80+ aktivite tipi eşleme |
| SmartFallbackGenerator | `generators/core/SmartFallbackGenerator.ts` | 152 | Premium AI üretimi |
| WorksheetBuilder | `generators/core/WorksheetBuilder.ts` | 130 | A4 sayfa oluşturma |
| promptTemplates | `generators/core/promptTemplates.ts` | 758 | 47 aktivite bazlı prompt |
| SuperStudio Generator | `generators/superStudioGenerator.ts` | 429 | Türkçe stüdyo üretimi |
| creativeStudio | `generators/creativeStudio.ts` | 171 | Yaratıcı stüdyo üretimi |
| VariationEngine | `generators/VariationEngine.ts` | 46 | 3 zorluk varyantı |
| DynamicActivityFactory | `generators/DynamicActivityFactory.ts` | 49 | Runtime çözümleme |

### 1.4 AI İstemci Katmanı

| Bileşen | Dosya | Satır | Amaç |
|---------|-------|-------|------|
| geminiClient | `services/geminiClient.ts` | 305 | Merkezi Gemini sarmalayıcı |
| api/generate.ts | `api/generate.ts` | 266 | Vercel serverless endpoint |
| Rate Limiter | `services/rateLimiter.ts` | — | Kullanıcı kota yönetimi |
| Cache Service | `services/cacheService.ts` | 145 | IndexedDB önbellek |
| JSON Repair | `utils/jsonRepair.ts` | 107 | 3 katmanlı JSON onarımı |
| Prompt Security | `utils/promptSecurity.ts` | 697 | Enjeksiyon koruması |
| Retry | `utils/retry.ts` | 20 | Üstel geri bekleme |

### 1.5 Prompt Sistemi

| Dosya | Satır | İçerik |
|-------|-------|--------|
| `prompts.ts` | 257 | Pedagojik temel, klinik kılavuzlar |
| `promptLibrary.ts` | 421 | 50 pedagojik aktivite şablonu (5 metodoloji) |
| `clinicalTemplates.ts` | 416 | 60+ klinik şablon |
| `promptTemplates.ts` | 758 | 47 aktivite bazlı prompt template |
| `ocrPromptLibrary.ts` | 245 | OCR-specific promptlar |
| `mathVisualPromptLibrary.ts` | 1093 | Matematiksel görsel promptlar |
| 8× SuperStudio `promptBuilder.ts` | ~800 | Şablon bazlı prompt oluşturucular |

### 1.6 Doğrulama Sistemi

| Dosya | Satır | Amaç |
|-------|-------|------|
| `contentValidator.ts` | 33 | İçerik kalitesi (başlık ≥3, senaryo ≥20) |
| `pedagogicValidator.ts` | 56 | ZPD uyumu, pedagojik not kontrolü |
| `clinicalValidator.ts` | 291 | Klinik dil, PII, KVKK doğrulama |
| `aiWorksheetService.ts` | 494 | 4 ajanlı paralel doğrulama |

### 1.7 Çıktı/Dışa Aktarma

| Dosya | Satır | Amaç |
|-------|-------|------|
| `ExportEngine.ts` | 242 | PDF/PNG/JSON dışa aktarma |
| `ShareEngine.ts` | — | Paylaşım |
| `printService.ts` | — | Yüksek sadakatli PDF |

---

## 2. TESPİT EDİLEN EKSİKLİKLER VE SORUNLAR

### 2.1 Kritik Eksiklikler

| # | Eksiklik | Açıklama | Etki |
|---|----------|----------|------|
| 1 | **Model seçim arayüzü yok** | Tüm generatörlerde `gemini-2.5-flash` hardcoded. Kullanıcı model seçemez. | Düşük esneklik |
| 2 | **Temperature/topP kontrolü yok** | Sadece kod içinden ayarlanabilir, UI'dan değiştirilemez. | Düşük kişiselleştirme |
| 3 | **Thinking Budget kontrolü yok** | Gemini'nin thinking bütçesi sabit, kullanıcı ayarlayamaz. | Düşük kontrol |
| 4 | **Prompt önizleme yok** | Oluşturulan promptu kullanıcı göremez/düzenleyemez. | Şeffaflık eksikliği |
| 5 | **Çoklu dil desteği eksik** | Sadece Türkçe. İngilizce/Arapça/Almanca içerik üretilemez. | Pazar kısıtlaması |
| 6 | **Gerçek zamanlı Kalite Skoru yok** | Üretim sonrası kalite puanı hesaplanmıyor (sadece manuel doğrulama var). | Kalite kontrol eksik |
| 7 | **Batch Queue UI'ı yok** | Toplu üretim arka planda çalışıyor, ilerleme gösterilmiyor. | Kullanıcı deneyimi |
| 8 | **Tema bazlı görsel üretim eksik** | Metin tabanlı üretim var ama tema bazlı görsel/illüstrasyon üretimi sınırlı. | Görsel zenginlik |
| 9 | **Prompt versiyonlama yok** | Prompt değişiklikleri takip edilmiyor, eski sürümlere dönülemez. | Versiyon kontrolü |
| 10 | **A/B testing altyapısı yok** | Farklı prompt stratejileri karşılaştırılamaz. | Optimizasyon |

### 2.2 Yapısal Sorunlar

| # | Sorun | Açıklama | Çözüm Önerisi |
|---|-------|----------|---------------|
| 11 | **Registry dosyası çok büyük (523 satır)** | Tek dosyada 80+ mapping. Bakım zor. | Modular registry'e böl |
| 12 | **promptTemplates dosyası çok büyük (758 satır)** | 47 template tek dosyada. | Kategori bazlı dosyalara böl |
| 13 | **Offline generatörlerde tutarsızlık** | Bazı AI generatörlerin offline karşılığı yok. | Eksik offline generatörler ekle |
| 14 | **Hata yönetimi tutarsız** | Bazı generatörler try-catch, bazları Promise.allSettled kullanıyor. | Standart hata yönetimi |
| 15 | **Cache stratejisi tutarsız** | Bazı generatörler cache kullanıyor, bazıları kullanmıyor. | Universal cache stratejisi |
| 16 | **Prompt enjeksiyon koruması yetersiz** | 697 satır ama sadece regex tabanlı. | LLM-based guardrail ekle |
| 17 | **Test coverage düşük** | Generatörlerin çoğunda test yok. | Her generatör için unit test |

### 2.3 UI/UX Eksiklikleri

| # | Eksiklik | Açıklama |
|---|----------|----------|
| 18 | **Üretim geçmişi görünmüyor** | Önceki üretimler listelenemiyor |
| 19 | **Prompt şablonları yönetilemez** | Özel prompt şablonu oluşturulamaz |
| 20 | **Aktivite kütüphanesi zayıf** | Üretilen aktiviteler kolayca kategorize edilemez |
| 21 | **İşbirliği desteği yok** | Öğretmenler arası içerik paylaşımı sınırlı |
| 22 | **Otomatik test üretimi yok** | Üretilen içeriğin otomatik test edilmesi |
| 23 | **Responsive tasarım eksik** | Stüdyolar mobilde tam çalışmıyor |
| 24 | **Klavye kısayolları eksik** | Hızlı üretim için kısayol desteği yok |

### 2.4 Performans Sorunları

| # | Sorun | Açıklama | Çözüm |
|---|-------|----------|-------|
| 25 | **Yavaş toplu üretim** | 10+ aktivite paralel işleniyor ama UI donuyor | Web Worker'a taşı |
| 26 | **Büyük prompt maliyeti** | Bazı promptlar 1000+ token, maliyet yüksek | Prompt optimizasyonu |
| 27 | **Cache hit rate düşük** | IndexedDB cache'i yeterince kullanılmıyor | Cache warming stratejisi |
| 28 | **Memory leak riski** | Uzun oturumlarda store büyümesi | Garbage collection |
| 29 | **Re-render sorunları** | Stüdyo bileşenleri sık yeniden render oluyor | Memoization + lazy loading |

---

## 3. YENİ ÖZELLİK ÖNERİLERİ

### 3.1 Yüksek Öncelik

| # | Özellik | Açıklama | Tahmini Süre |
|---|---------|----------|--------------|
| 1 | **Model Seçici UI** | Kullanıcının model seçmesine olanak tanır (gemini-2.5-flash, gemini-2.5-pro, vb.) | 2 gün |
| 2 | **Temperature/TopP Slider** | Üretim parametrelerini UI'dan ayarlama | 1 gün |
| 3 | **Prompt Önizleme** | Oluşturulan promptu gösterme + düzenleme | 3 gün |
| 4 | **Üretim İlerleme Çubuğu** | Toplu üretimde gerçek zamanlı ilerleme göstergesi | 2 gün |
| 5 | **Üretim Geçmişi** | Önceki tüm üretimlerin listesi + detay görüntüleme | 3 gün |
| 6 | **Kalite Otomatik Puanlama** | Üretim sonrası otomatik kalite skoru (0-100) | 4 gün |
| 7 | **Çoklu Dil Desteği** | İngilizce, Arapça, Almanca içerik üretimi | 5 gün |

### 3.2 Orta Öncelik

| # | Özellik | Açıklama | Tahmini Süre |
|---|---------|----------|--------------|
| 8 | **Prompt Şablon Yöneticisi** | Özel prompt şablonu oluşturma/düzenleme | 3 gün |
| 9 | **A/B Testing** | Farklı prompt stratejilerini karşılaştırma | 4 gün |
| 10 | **Otomatik Görsel Üretim** | Aktiviteye otomatik görsel/illüstrasyon ekleme | 5 gün |
| 11 | **Mobil Stüdyo** | Responsive stüdyo tasarımı | 5 gün |
| 12 | **Klavye Kısayolları** | Hızlı üretim kısayolları | 1 gün |
| 13 | **İçerik Kütüphanesi** | Kategorize edilmiş aktivite kütüphanesi | 3 gün |
| 14 | **Varyasyon Üretimi** | Mevcut aktiviteden otomatik 3 varyant üretme | 2 gün |

### 3.3 Düşük Öncelik

| # | Özellik | Açıklama | Tahmini Süre |
|---|---------|----------|--------------|
| 15 | **İşbirliği Modu** | Öğretmenler arası içerik paylaşma | 5 gün |
| 16 | **Prompt Versiyonlama** | Prompt değişikliklerini takip etme | 3 gün |
| 17 | **Otomatik Test Üretimi** | İçerik otomatik test edilsin | 4 gün |
| 18 | **Analytics Dashboard** | Üretim istatistikleri, kalite trendleri | 3 gün |
| 19 | **Web Worker Entegrasyonu** | Ağır işlemleri arka plana taşıma | 3 gün |
| 20 | **LLM Guardrail** | Prompt enjeksiyon için LLM tabanlı koruma | 4 gün |

---

## 4. DETAYLI GELİŞTİRME PLANI

### Faz 1: Temel İyileştirmeler (1 hafta)

#### 1.1 Model Seçici UI
```
SuperStudio/ConfiguratorCascade.tsx
  → ModelSelector bileşeni ekle
  → Seçenekler: gemini-2.5-flash (varsayılan), gemini-2.5-pro
  → Store'a model alanı ekle
  → Generator'lara model parametresi geçir
```

#### 1.2 Temperature/TopP Slider
```
SuperStudio/ConfiguratorCascade.tsx
  → GenerationParams bileşeni ekle
  → Temperature: 0.0 - 1.0 (slider, varsayılan 0.7)
  → TopP: 0.0 - 1.0 (slider, varsayılan 0.9)
  → ThinkingBudget: 0 - 8192 (slider, varsayılan 2048)
  → Store'a parametre alanları ekle
```

#### 1.3 Prompt Önizleme
```
SuperStudio/ConfiguratorCascade.tsx
  → PromptPreviewPanel bileşeni ekle
  → Seçili şablonun prompt'unu göster
  → Düzenleme modu (textarea)
  → Değişiklikleri generator'a geçir
```

#### 1.4 Üretim İlerleme Çubuğu
```
SuperStudio/index.tsx
  → GenerationProgress bileşeni ekle
  → Adım bazlı ilerleme: Prompt → API → İşleme → Kaydetme
  → Yüzde gösterimi
  → İptal butonu
```

### Faz 2: İçerik Kalitesi (1 hafta)

#### 2.1 Otomatik Kalite Puanlama
```
services/aiWorksheetService.ts
  → generateQualityScore() fonksiyonu
  → Kriterler: Pedagojik uyumluluk, zorluk dengesi, görsel yük, kelime seçimi
  → 0-100 arası skor
  → Düşük skorlarda otomatik iyileştirme önerisi
```

#### 2.2 Varyasyon Üretimi
```
generators/VariationEngine.ts
  → 3 varyant üret: Kolay, Orta, Zor
  → Her varyant için farklı temperature
  → Yan yana karşılaştırma UI'ı
```

#### 2.3 Prompt Optimizasyonu
```
utils/promptOptimizer.ts (YENİ)
  → Prompt token sayısını azalt
  → Gereksiz tekrarları kaldır
  → Domain-specific keyword optimizasyonu
  → Prompt compression techniques
```

### Faz 3: UI/UX Geliştirmeleri (1 hafta)

#### 3.1 Üretim Geçmişi
```
store/useGenerationHistoryStore.ts (YENİ)
  → Tüm üretimleri kaydet (prompt, parametreler, çıktı, zaman damgası)
  → Liste görünümü (tarih, tür, zorluk)
  → Detay görüntüleme
  → Tekrar üret butonu
  → Favorilere ekleme
```

#### 3.2 Prompt Şablon Yöneticisi
```
components/PromptTemplateManager.tsx (YENİ)
  → Özel prompt şablonları oluşturma
  → Şablonları kategorilere ayırma
  → Şablonları dışa/içe aktarma (JSON)
  → Topluluk şablonları (gelecek)
```

#### 3.3 Klavye Kısayolları
```
SuperStudio/index.tsx
  → Ctrl+Enter: Üretimi başlat
  → Ctrl+S: Kaydet
  → Ctrl+Z: Geri al
  → Ctrl+1-8: Şablon seçimi
  → Escape: İptal
```

### Faz 4: İleri Düzey Özellikler (2 hafta)

#### 4.1 Çoklu Dil Desteği
```
generators/multilingualEngine.ts (YENİ)
  → Dil seçici: TR, EN, AR, DE
  → Her dil için prompt şablonları
  → Çeviri API entegrasyonu
  → Dil-bazlı kalite kontrolü
```

#### 4.2 A/B Testing
```
services/abTestingService.ts (YENİ)
  → Farklı prompt stratejilerini tanımla
  → Rastgele dağıtım
  → Sonuçları karşılaştır
  → İstatistiksel anlamlılık kontrolü
  → Kazanan stratejiyi otomatik seç
```

#### 4.3 Görsel Üretim Entegrasyonu
```
api/ai/generate-image.ts
  → Aktivite bazlı görsel üretimi
  → Tema bazlı illüstrasyon
  → Çocuk dostu görsel stili
  → Görsel kalite kontrolü
```

---

## 5. MİMARİ İYİLEŞTİRME ÖNERİLERİ

### 5.1 Modular Registry
```typescript
// ÖNCEKİ: registry.ts (523 satır, tek dosya)
// SONRAKİ: registry/ directory
registry/
  ├── index.ts              // Ana export
  ├── readingRegistry.ts    // Okuma aktiviteleri
  ├── mathRegistry.ts       // Matematik aktiviteleri
  ├── visualRegistry.ts     // Görsel aktiviteler
  ├── puzzleRegistry.ts     // Bulmaca aktiviteleri
  └── types.ts              // Ortak tipler
```

### 5.2 Universal Cache Stratejisi
```typescript
// ÖNCEKİ: Bazı generatörler cache kullanıyor, bazıları kullanmıyor
// SONRAKİ: Tüm generatörler için zorunlu cache katmanı
interface CacheStrategy {
  key: string;           // Cache anahtarı
  ttl: number;           // Time-to-live (ms)
  invalidateOn: string[]; // Geçersiz kılan koşullar
  warmUp: boolean;       // Idle'da önceden yükle
}
```

### 5.3 Standart Hata Yönetimi
```typescript
// ÖNCEKİ: Farklı generatörler farklı hata yönetimi
// SONRAKİ: Tek merkezi hata handler
interface GeneratorError {
  code: 'RATE_LIMIT' | 'INVALID_RESPONSE' | 'CACHE_MISS' | 'NETWORK_ERROR' | 'VALIDATION_FAILED';
  message: string;
  retryable: boolean;
  fallbackToOffline: boolean;
  userMessage: string; // Kullanıcıya gösterilecek mesaj
}
```

### 5.4 Prompt Katman Mimarisi
```typescript
// ÖNCEKİ: Tek seviyeli prompt
// SONRAKİ: Katmanlı prompt mimarisi
interface PromptLayer {
  base: string;           // Temel pedagojik prompt
  domain: string;         // Alan bazlı prompt (okuma/matematik/görsel)
  activity: string;       // Aktivite bazlı prompt
  student: string;        // Öğrenci profili prompt
  clinical: string;       // Klinik düzeltme prompt
  security: string;       // Güvenlik katmanı
}
```

---

## 6. PERFORMANS OPTİMİZASYONLARI

| # | Optimizasyon | Açıklama | Beklenen Etki |
|---|-------------|----------|---------------|
| 1 | **Web Worker** | Ağır JSON işleme ve markdown parse işlemlerini worker'a taşı | %40 daha az UI blocking |
| 2 | **Lazy Loading** | Stüdyo bileşenlerini lazy import et | %25 daha hızlı ilk yükleme |
| 3 | **Memoization** | useMemo/useCallback ile expensive hesaplamaları cachele | %30 daha az re-render |
| 4 | **Debounced Updates** | Input değişimlerinde debounce uygula | %50 daha az state güncellemesi |
| 5 | **Virtual Scroll** | Büyük listelerde virtual scroll kullan | Daha az DOM node'u |
| 6 | **Image Optimization** | Görselleri lazy load + WebP formatı | %60 daha az bant genişliği |
| 7 | **Bundle Splitting** | Stüdyoları ayrı chunk'lara böl | %35 daha hızlı initial load |
| 8 | **Cache Warming** | Idle'da sık kullanılan aktiviteleri önceden cache'le | %80 daha az cache miss |

---

## 7. GÜVENLİK İYİLEŞTİRMELERİ

| # | İyileştirme | Açıklama |
|---|-------------|----------|
| 1 | **LLM Guardrail** | Prompt enjeksiyon için LLM tabanlı ikincil kontrol |
| 2 | **Output Sanitization** | AI çıktısında PII tespiti ve temizleme |
| 3 | **Rate Limit Per User** | Kullanıcı bazlı detaylı kota yönetimi |
| 4 | **Audit Log** | Tüm AI çağrılarını loglama (KVKK uyumlu) |
| 5 | **Content Moderation** | Üretilen içeriğin otomatik moderasyonu |
| 6 | **API Key Rotation** | Otomatik API anahtarı döndürme |
| 7 | **CSP Headers** | Content Security Policy başlıkları |

---

## 8. TEST STRATEJİSİ

### 8.1 Unit Testler (Her Generatör İçin)
```typescript
// Örnek test yapısı
describe('ReadingComprehensionGenerator', () => {
  it('should generate valid worksheet data', async () => { ... });
  it('should include pedagogical note', async () => { ... });
  it('should respect ZPD constraints', async () => { ... });
  it('should handle API errors gracefully', async () => { ... });
  it('should fallback to offline on failure', async () => { ... });
});
```

### 8.2 Integration Testler
```typescript
describe('ActivityService Integration', () => {
  it('should route to correct generator', async () => { ... });
  it('should handle batch processing', async () => { ... });
  it('should cache and retrieve results', async () => { ... });
});
```

### 8.3 E2E Testler
```typescript
describe('SuperStudio E2E', () => {
  it('should complete full generation flow', async () => { ... });
  it('should allow model selection', async () => { ... });
  it('should preview and edit prompt', async () => { ... });
});
```

---

## 9. BAŞARI KRİTERLERİ

| Metrik | Mevcut | Hedef |
|--------|--------|-------|
| İlk Yüklenme | ~3.5s | < 2s |
| Üretim Süresi (tek aktivite) | ~25s | < 15s |
| Toplu Üretim (10 aktivite) | ~180s | < 60s |
| Cache Hit Rate | ~40% | > 80% |
| Hata Oranı | ~5% | < 1% |
| Kalite Skoru Ortalaması | — | > 80/100 |
| Test Coverage | ~20% | > 70% |
| Prompt Token Maliyeti | — | %30 azaltma |
| UI Blocking Süresi | ~60% | < 20% |
| Mobil Uyumluluk | ~30% | > 90% |

---

## 10. DOSYA HARİTASI (Tüm İlgili Dosyalar)

### Core Engine
```
src/services/generators/
  ├── core/
  │   ├── types.ts                    (24 satır)
  │   ├── BaseGenerator.ts            (41 satır)
  │   ├── GenericActivityGenerator.ts (46 satır)
  │   ├── SmartFallbackGenerator.ts   (152 satır)
  │   ├── WorksheetBuilder.ts         (130 satır)
  │   └── promptTemplates.ts          (758 satır)
  ├── ActivityService.ts              (202 satır)
  ├── registry.ts                     (523 satır)
  ├── DynamicActivityFactory.ts       (49 satır)
  ├── superStudioGenerator.ts         (429 satır)
  ├── superOfflineEngine.ts           (195 satır)
  ├── creativeStudio.ts               (171 satır)
  ├── VariationEngine.ts              (46 satır)
  ├── prompts.ts                      (257 satır)
  ├── promptLibrary.ts                (421 satır)
  ├── clinicalTemplates.ts            (416 satır)
  └── [55 bireysel generatör]         ~10,000+ satır
```

### Stüdyo Bileşenleri
```
src/components/
  ├── SuperStudio/
  │   ├── index.tsx                   (114 satır)
  │   ├── components/
  │   │   ├── MainSettingsPanel.tsx   (78 satır)
  │   │   ├── TemplateMenu.tsx        (44 satır)
  │   │   ├── ConfiguratorCascade.tsx (90 satır)
  │   │   ├── A4PreviewPanel.tsx      (307 satır)
  │   │   └── ActionToolbar.tsx       (115 satır)
  │   └── templates/
  │       ├── registry.ts             (139 satır)
  │       └── [8 şablon dizini]       ~800 satır
  ├── CreativeStudio/
  │   ├── index.tsx                   (257 satır)
  │   ├── EditorPane.tsx
  │   ├── LibraryPane.tsx
  │   ├── ControlPane.tsx
  │   └── components/
  ├── ActivityStudio/
  │   ├── validation/                 (380 satır)
  │   └── preview/                    (242 satır)
  └── WordSentenceStudio/             (150 satır)
```

### AI Altyapısı
```
src/services/
  ├── geminiClient.ts                 (305 satır)
  ├── aiContentService.ts             (236 satır)
  ├── aiWorksheetService.ts           (494 satır)
  ├── cacheService.ts                 (145 satır)
  ├── rateLimiter.ts                  (— satır)
  └── activityStudio/                 (841 satır)
      ├── AgentOrchestrator.ts        (295 satır)
      └── agents/                     (6 ajan)
```

### API Endpointleri
```
api/
  ├── generate.ts                     (266 satır)
  ├── sari-kitap/generate.ts          (176 satır)
  ├── ai/generate-image.ts            (101 satır)
  ├── generate-exam.ts                (100 satır)
  ├── ocr/generate-variations.ts      (91 satır)
  └── worksheets.ts                   (440 satır)
```

### Yardımcı Dosyalar
```
src/utils/
  ├── promptSecurity.ts               (697 satır)
  ├── jsonRepair.ts                   (107 satır)
  ├── retry.ts                        (20 satır)
  └── promptOptimizer.ts             (YENİ - önerilen)
```

---

## 11. SONUÇ

Mevcut İçerik Motoru güçlü bir altyapıya sahip (80+ aktivite tipi, 55 AI generatör, 57 offline generatör, 6 ajanlı pipeline) ancak birkaç kritik eksiklik bulunuyor:

**Öncelikli Gereksinimler:**
1. Model/seçenek UI'ı (kullanıcı kontrolü için)
2. Prompt önizleme (şeffaflık için)
3. Üretim geçmişi (kullanıcı deneyimi için)
4. Otomatik kalite puanlama (kalite kontrol için)
5. Performans optimizasyonları (Web Worker, lazy loading)

**Yapısal İyileştirmeler:**
1. Modular registry (bakım kolaylığı için)
2. Universal cache stratejisi (tutarlılık için)
3. Standart hata yönetimi (tutarlılık için)
4. Prompt katman mimarisi (esneklik için)

Bu planlama 6 fazda toplam 4-5 haftada tamamlanabilir.

---

## 12. UYGULAMA DURUMU

> Güncelleme: 2026-06-25 — Faz 1 (Temel İyileştirmeler) ve Faz 2-3 (Kalite/UI) kısmen uygulandı.

### ✅ Uygulanan Özellikler

| # | Özellik | Durum | Dosya |
|---|---------|-------|-------|
| 1 | **Temperature/TopP/ThinkingBudget Slider** | ✅ | `ConfiguratorCascade.tsx`, `useSuperStudioStore.ts` |
| 2 | **Generation Progress Bar** (adım bazlı, yüzde, iptal) | ✅ | `SuperStudio/index.tsx` |
| 3 | **Kalite Otomatik Puanlama** (6 kriter, 0-100) | ✅ | `utils/contentQuality.ts` |
| 4 | **Prompt Optimizer** (token azaltma, kelime sadeleştirme) | ✅ | `utils/promptOptimizer.ts` |
| 5 | **Varyasyon Üretimi Enhancement** (4 varyant + kalite skoru) | ✅ | `VariationEngine.ts` |
| 6 | **Üretim Geçmişi Store** (son 100 kayıt, Zustand) | ✅ | `useSuperStudioStore.ts` (inline) |
| 7 | **Klavye Kısayolları** (Ctrl+Enter üret, Esc iptal) | ✅ | `SuperStudio/index.tsx` |
| 8 | **Standart Hata Yönetimi** (`GeneratorError` type) | ✅ | `types/superStudio.ts` |
| 9 | **Universal Cache Strategy** (TTL, stats, cleanup, warmUp) | ✅ | `services/cacheService.ts` |
| 10 | **Generation Params Pipeline** (temperature→geminiClient→API) | ✅ | `geminiClient.ts`, `superStudioGenerator.ts` |

### ⏳ Bekleyen Özellikler

| # | Özellik | Plan |
|---|---------|------|
| 1 | **Model Seçici UI** | Selin Arslan kuralı nedeniyle (`gemini-2.5-flash` sabit) ertelendi |
| 2 | **Prompt Önizleme Panel** | Faz 2'ye planlandı |
| 3 | **Batch Queue UI** | Faz 2'ye planlandı |
| 4 | **Çoklu Dil Desteği** | Faz 4'e planlandı |
| 5 | **Modular Registry** | Faz 3'e planlandı |
| 6 | **Prompt Şablon Yöneticisi** | Faz 3'e planlandı |
| 7 | **A/B Testing** | Faz 4'e planlandı |
| 8 | **Web Worker** | Faz 4'e planlandı |
| 9 | **LLM Guardrail** | Faz 4'e planlandı |

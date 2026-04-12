# OCR Modülü — Görsel Üretim Sorunu Analiz Raporu

**Tarih**: 2026-04-05  
**Analiz Yapan**: Tüm Uzman Ajanlar (Elif Yıldız · Dr. Ahmet Kaya · Bora Demir · Selin Arslan · AI Vision Engineer · Visual Storyteller)  
**Versiyon**: 1.0.0  
**Statü**: KRİTİK SORUN TESPİT EDİLDİ

---

## 🎯 Sorunun Özeti

OCR modülünde bir görsel yüklenip aktivite üretildiğinde, A4 sayfasında **hiçbir görsel (SVG, tablo, grafik, geometrik şekil, bileşen)** görünmüyor. Aktiviteler yalnızca ham metin olarak render ediliyor.

Bu bir **bug** değil; OCR modülünün **mimarisi gereği görsellerden habersiz tasarlanmış** olmasının sonucudur.

---

## 📁 OCR Modülü Dosya Envanteri

| Dosya | Yol | Satır | Rol |
|-------|-----|-------|-----|
| **OCRScanner** | `src/components/OCRScanner.tsx` | ~1400 | Ana OCR UI bileşeni |
| **ocrService** | `src/services/ocrService.ts` | 268 | Gemini Vision entegrasyonu, blueprint çıkarımı |
| **ocrVariationService** | `src/services/ocrVariationService.ts` | 443 | Varyasyon üretim orkestratörü |
| **VariationResultsView** | `src/components/VariationResultsView.tsx` | 326 | Varyasyon sonuçlarını gösteren bileşen |
| **OCR Tipleri** | `src/types/ocr-activity.ts` | 277 | Type tanımları |
| **OCR Store** | `src/store/useOCRActivityStore.ts` | 99 | Zustand durum yönetimi |
| **API Endpoint** | `/api/ocr/generate-variations` | — | ❌ **MEVCUT DEĞİL** |

---

## 🔬 Tam Akış Analizi: Sorunun Tespiti

### Akış 1: OCR ile Üretim (Mevcut — Kırık)

```
[1] Kullanıcı görsel yükler (OCRScanner.tsx)
         ↓
[2] ocrService.processImage() — Gemini Vision çağrısı
         ↓ Prompt: "SADECE metni okuma; sayfa hiyerarşisini, 
           mimari yapısını ve ASIL VERİYİ eksiksiz çöz."
         ↓ ❌ GÖRSEL/SVG/GRAFİK VERİSİ İSTENMİYOR
         ↓
[3] OCRResult döner:
         {
           rawText: "Blueprint metni...",   ← YALNIZCA METİN
           detectedType: "MATH_WORKSHEET",
           title: "...",
           structuredData: { ... },
           // ❌ grafikVeri YOK
           // ❌ gorsel YOK
           // ❌ svg YOK
           // ❌ layoutArchitecture.blocks[].grafikVeri YOK
         }
         ↓
[4] POST /api/ocr/generate-variations
         ↓ ❌ BU ENDPOINT MEVCUT DEĞİL (404 döner)
         ↓
[5] ocrVariationService.generateVariations() — Schema:
         {
           title: STRING,
           content: STRING,   ← HTML metni
           pedagogicalNote: STRING,
           targetSkills: ARRAY
           // ❌ grafikVeri YOK
           // ❌ gorsel YOK
           // ❌ svg YOK
         }
         ↓
[6] VariationResultsView.tsx — Render:
         dangerouslySetInnerHTML={{ __html: variation.content }}
         ← Yalnızca HTML metin renderı
         ← ❌ SheetRenderer kullanılmıyor
         ← ❌ GraphicRenderer kullanılmıyor
         ← ❌ WorksheetBlock görsel tipler yorumlanmıyor
         ↓
[7] A4'e eklendiğinde — Worksheet.tsx → SheetRenderer.tsx
         ← grafikVeri alanı yok → GraphicRenderer çağrılmıyor
         ← SONUÇ: YALNIZCA METİN BLOKLAR ✗
```

### Akış 2: Normal Aktivite Üretimi (Çalışan — Görselli)

```
[1] AI ile aktivite üretimi (örn: MathStudio, MatSınav)
         ↓
[2] Aktivite JSON'ı:
         {
           grafik_verisi: {
             tip: "sutun_grafigi",  ← GrafikVeriTipi (32 tip)
             veri: [
               { etiket: "A", deger: 5 },
               { etiket: "B", deger: 8 }
             ],
             ozellikler: { kenarlar: [3,4,5] }
           },
           layoutArchitecture: { blocks: [...] }
         }
         ↓
[3] SheetRenderer.tsx → aktivite tipine göre dispatch
         ↓
[4] GraphicRenderer.tsx çağrılır:
         - parseGeometryVeri() → vertex, kenar, açı verisi
         - normalizeTip() → Türkçe karakter düzeltme
         - 32 görsel tipi SVG olarak render eder
         ↓
[5] SONUÇ: SVG grafikler + tablolar + geometrik şekiller ✓
```

---

## 🔍 Tespit Edilen Sorunlar (Öncelik Sırası)

### 🔴 SORUN 1: `/api/ocr/generate-variations` Endpoint'i Yok

**Konum**: `src/components/OCRScanner.tsx:771`  
**Hata Türü**: 404 Not Found — API çağrısı başarısız olur

```typescript
// OCRScanner.tsx:771 — BU ENDPOINT MEVCUT DEĞİL:
const response = await fetch('/api/ocr/generate-variations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ blueprint, count, userId, config })
});
```

`/api/` dizininde bu endpoint'e karşılık gelen hiçbir dosya yok:
```
api/
├── generate.ts        ✓
├── worksheets.ts      ✓
├── workbooks.ts       ✓
├── feedback.ts        ✓
├── generate-exam.ts   ✓
├── export-infographic.ts ✓
├── activity/approve.ts ✓
├── ai/generate-image.ts ✓
├── user/paperSize.ts  ✓
└── ocr/               ❌ DİZİN YOK
    └── generate-variations.ts ❌
```

---

### 🔴 SORUN 2: OCR Prompt'u Görsel Verisi İstemiyor

**Konum**: `src/services/ocrService.ts:187-200`

```typescript
const prompt = `
[MİMARİ KLONLAMA MOTORU]
SADECE metni okuma; sayfa hiyerarşisini, mimari yapısını ve ASIL VERİYİ eksiksiz çöz.

ANALİZ PROTOKOLÜ:
1. ROOT_CONTAINER: Sayfa genel yerleşimi
2. LOGIC_MODULES: Soru bloklarının teknik yapısı
3. EXACT_TEXT_EXTRACTION: Metinleri 1:1 aktar
4. SOLUTION_LOGIC: Mantıksal yol
5. DETECTED_TYPE: Materyal türü
6. LAYOUT_HINTS: Sütun sayısı, görsel varlığı, soru sayısı
`;
```

Prompt `layoutHints.hasImages` ile görselin *var olup olmadığını* tespit ediyor ama **görselin içeriğini/yapısını çıkarmıyor**. Grafik tipi, eksen etiketleri, şekil boyutları, tablo satır/sütun verileri hiç talep edilmiyor.

**OCR Schema'sında görsel alan yok**:
```typescript
const _schema = {
  properties: {
    title: { type: 'STRING' },
    detectedType: { type: 'STRING' },
    worksheetBlueprint: { type: 'STRING' },
    layoutHints: {
      properties: {
        columns: { type: 'NUMBER' },
        hasImages: { type: 'BOOLEAN' },  // ← Yalnızca "var mı?" sorusu
        questionCount: { type: 'NUMBER' }
      }
    }
    // ❌ grafikVeri YOK
    // ❌ tablo yapısı YOK
    // ❌ şekil koordinatları YOK
    // ❌ grafik eksenleri YOK
  }
};
```

---

### 🔴 SORUN 3: Varyasyon Schema'sında Görsel Alan Yok

**Konum**: `src/services/ocrVariationService.ts:211-250`

```typescript
const getVariationSchema = () => ({
  variations: {
    items: {
      properties: {
        title: STRING,
        type: STRING,
        content: STRING,           // HTML metin — yalnızca text
        pedagogicalNote: STRING,
        difficultyLevel: STRING,
        targetSkills: ARRAY
        // ❌ grafikVeri YOK — GraphicRenderer çalışamaz
        // ❌ layoutArchitecture.blocks YOK
        // ❌ svg YOK
        // ❌ tablo verisi yapılandırılmamış
      },
      required: ['title', 'type', 'content', 'pedagogicalNote', 
                 'difficultyLevel', 'targetSkills']
    }
  }
});
```

Gemini'ye `grafikVeri` üretmesi söylenmediğinden, sonuçta hiçbir zaman yapılandırılmış görsel verisi dönmez.

---

### 🔴 SORUN 4: VariationResultsView Yalnızca HTML Metin Render Ediyor

**Konum**: `src/components/VariationResultsView.tsx:199`

```tsx
// Tüm içerik sadece DOMPurify + dangerouslySetInnerHTML ile render ediliyor:
<div
  className="prose prose-sm prose-invert"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(String(variation.content || ''), {
      ALLOWED_TAGS: ['div','p','span','strong','em','u','br',
                     'ul','ol','li','table','tr','td','th'],
      ALLOWED_ATTR: ['class', 'style'],
    }),
  }}
/>
```

Bu yaklaşımın sorunları:
- `SheetRenderer.tsx` kullanılmıyor → aktivite tiplerine göre dispatch yok
- `GraphicRenderer.tsx` hiç çağrılmıyor → 32 görsel tip render edilemiyor
- `WorksheetBlock[]` yapısı yorumlanmıyor → blok tabanlı layout kullanılamıyor
- `<svg>` etiketine `ALLOWED_TAGS`'de yer verilmemiş → gelse bile engelleniyor

---

### 🟡 SORUN 5: WorksheetBlock Tipinde Görsel Blok Desteği Eksik

**Konum**: `src/types/core.ts:44-58`

OCR aktivitelerinin `layoutArchitecture.blocks[]` yapısına bakıldığında, mevcut `WorksheetBlock` tipi görsel/grafik blok türü içermiyor. Görseller için `'image'` bloğu var ancak bu yalnızca görsel URL'i destekliyor; yapılandırılmış grafik verisini (`grafikVeri: GrafikVerisi`) taşıyamıyor.

---

### 🟡 SORUN 6: OCR Sonrası A4'e Eklenince Boş Görsel

**Konum**: `src/components/Worksheet.tsx` → `src/components/SheetRenderer.tsx`

OCR aktivitesi `onAddToWorksheet()` ile çalışma kitabına eklendiğinde:
- `SheetRenderer.tsx` aktivite tipine göre render yapıyor
- `type: 'OCR_CONTENT'` için özel bir renderer yok
- Fallback renderer sadece `content` string'ini gösteriyor
- `grafik_verisi` alanı olmadığından `GraphicRenderer` hiç tetiklenmiyor
- **Sessiz başarısızlık**: Hata fırlatılmıyor, görseller sessizce gösterilmiyor

---

### 🟡 SORUN 7: VariationResultsView → A4 Geçişinde Veri Kaybı

`onAddToWorksheet(variation)` çağrıldığında `variation` objesi doğrudan `useWorksheetStore`'a ekleniyor. Bu obje:

```typescript
{
  id: string,
  title: string,
  type: 'OCR_CONTENT',
  content: string,          // HTML string
  pedagogicalNote: string,
  targetSkills: string[],
  difficultyLevel: string,
  metadata: {
    originalBlueprint: string,
    variationIndex: number,
    generatedFrom: 'blueprint_cloning'
  }
  // ❌ layoutArchitecture yok
  // ❌ grafikVeri / gorsel / svg yok
}
```

A4 sayfası, `layoutArchitecture.blocks[]` yapısını bekliyor. Bu yapı olmadığında fallback content string gösterimi devreye giriyor.

---

## 🏗️ Mevcut GraphicRenderer Kapasitesi (Kullanılmıyor)

`components/MatSinavStudyosu/components/GraphicRenderer.tsx` 33 görsel tipi destekliyor. OCR aktiviteleri bu sistemden tamamen yararlanamıyor:

| Kategori | Desteklenen Tipler |
|----------|-------------------|
| **Veri Grafikleri** | sutun_grafigi, pasta_grafigi, cizgi_grafigi, siklik_tablosu, cetele_tablosu |
| **Geometri** | ucgen, kare, dikdortgen, daire, paralel_kenar, cokgen, dik_ucgen |
| **3D Geometri** | kup, silindir, koni, piramit |
| **Analitik** | koordinat_sistemi, koordinat_grafigi, sayi_dogrusu, venn_diyagrami |
| **Olasılık** | olaslik_cark |
| **Çizgiler** | dogru_parcasi, aci, isin, dogru, dik_kesisen_dogrular |
| **Dönüşümler** | koordinat_donusum (yansıma+öteleme) |
| **Tablolar** | nesne_grafigi |

OCR aktivitesindeki herhangi bir grafik/tablo/şekil bu sistemle render edilebilecekken, veri hiç üretilmediği için kullanılamıyor.

---

## 📊 Sorun Özet Tablosu

| Bileşen | Durum | Sorun |
|---------|-------|-------|
| OCR Blueprint Analizi (metin) | ✅ Çalışıyor | — |
| OCR Blueprint Kalite Kontrolü | ✅ Çalışıyor | — |
| Görsel İçerik Tespiti | ⚠️ Kısmi | Yalnızca `hasImages: boolean` — içerik çıkarılmıyor |
| `/api/ocr/generate-variations` | ❌ YOK | Endpoint hiç oluşturulmamış |
| Varyasyon Schema'sı (görsel) | ❌ Yok | `grafikVeri` / görsel alanlar yok |
| VariationResultsView Render | ❌ Metin-only | SVG/grafik gösterimi yok |
| A4 Görsel Render (OCR) | ❌ Hiç yok | `grafikVeri` alanı olmadığı için |
| GraphicRenderer entegrasyonu | ❌ Bağlantısız | OCR aktiviteleriyle hiç bağlantısı yok |
| SheetRenderer (OCR tipi) | ⚠️ Eksik | `OCR_CONTENT` için özel renderer yok |
| Sessiz başarısızlık | ❌ Var | Hata fırlatılmıyor, görseller sessizce kaybolıyor |

---

## 🛠️ Çözüm Önerileri

### Öncelik 1 — Eksik API Endpoint'i Oluştur

**Dosya**: `api/ocr/generate-variations.ts` (yeni)

```typescript
// api/ocr/generate-variations.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ocrVariationService } from '../../src/services/ocrVariationService.js';
import { RateLimiter } from '../../src/services/rateLimiter.js';
import { AppError } from '../../src/utils/AppError.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS + Rate Limiting + Zod validation
  // ...
  const result = await ocrVariationService.generateVariations(req.body);
  return res.status(200).json({ success: true, data: result, timestamp: new Date().toISOString() });
}
```

---

### Öncelik 2 — OCR Prompt'unu Görsel Farkındalıklı Hale Getir

**Dosya**: `src/services/ocrService.ts:187-200`

OCR schema'sına görsel descriptor ekle:

```typescript
// Schema'ya eklenecek:
visualDescriptors: {
  type: 'ARRAY',
  items: {
    properties: {
      tipi: { 
        type: 'STRING',
        description: "sutun_grafigi | pasta_grafigi | tablo | ucgen | daire | koordinat_sistemi | vb."
      },
      aciklama: {
        type: 'STRING',
        description: "Grafiğin/şeklin içeriğini Türkçe açıkla"
      },
      veriler: {
        type: 'ARRAY',
        description: "Grafik/tablo verileri: { etiket, deger } çiftleri veya satır/sütun verileri"
      }
    }
  }
}
```

Prompt'a eklenecek:
```
7. VISUAL_EXTRACTION: Sayfadaki her grafik, tablo, şekil için:
   - Tip: sutun_grafigi | pasta_grafigi | ucgen | daire | koordinat | tablo | vb.
   - Veri: Tüm sayısal/metinsel değerleri çıkar (eksen etiketleri, hücre değerleri, köşe koordinatları)
   - Başlık: Grafiğin/şeklin başlığını çıkar
```

---

### Öncelik 3 — Varyasyon Schema'sına Görsel Alan Ekle

**Dosya**: `src/services/ocrVariationService.ts`

```typescript
const getVariationSchema = () => ({
  variations: {
    items: {
      properties: {
        // Mevcut alanlar...
        
        // YENİ: Görsel alanlar
        grafikVeri: {
          type: 'OBJECT',
          nullable: true,
          properties: {
            tip: { type: 'STRING' },
            baslik: { type: 'STRING' },
            veri: {
              type: 'ARRAY',
              items: {
                properties: {
                  etiket: { type: 'STRING' },
                  deger: { type: 'NUMBER' }
                }
              }
            },
            ozellikler: {
              type: 'OBJECT',
              nullable: true,
              properties: {
                kenarlar: { type: 'ARRAY', items: { type: 'NUMBER' } },
                acilar: { type: 'ARRAY', items: { type: 'NUMBER' } },
                yaricap: { type: 'NUMBER', nullable: true }
              }
            }
          }
        }
      }
    }
  }
});
```

---

### Öncelik 4 — VariationResultsView'da GraphicRenderer Entegrasyonu

**Dosya**: `src/components/VariationResultsView.tsx`

```tsx
import { GraphicRenderer } from '../MatSinavStudyosu/components/GraphicRenderer';

// Mevcut render:
<div dangerouslySetInnerHTML={{ __html: ... }} />

// Yeni render:
<div className="prose prose-sm prose-invert">
  {/* HTML içerik */}
  <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  
  {/* Görsel render */}
  {variation.grafikVeri && (
    <div className="mt-3 flex justify-center">
      <GraphicRenderer
        grafikVeri={variation.grafikVeri}
        width={320}
        height={240}
      />
    </div>
  )}
</div>
```

---

### Öncelik 5 — SheetRenderer'a OCR_CONTENT Tipi Ekle

**Dosya**: `src/components/SheetRenderer.tsx`

```typescript
case 'OCR_CONTENT':
  return <OCRContentSheet 
    activity={activity}
    grafikVeri={activity.grafikVeri}
  />;
```

**Yeni dosya**: `src/components/sheets/ocr/OCRContentSheet.tsx`

```tsx
import { GraphicRenderer } from '../../MatSinavStudyosu/components/GraphicRenderer';

export const OCRContentSheet = ({ activity, grafikVeri }) => (
  <div className="ocr-content-sheet font-['Lexend']">
    <h2>{activity.title}</h2>
    
    {/* Görsel blok */}
    {grafikVeri && (
      <div className="visual-block">
        <GraphicRenderer grafikVeri={grafikVeri} width={400} height={300} />
      </div>
    )}
    
    {/* Metin içerik */}
    <div dangerouslySetInnerHTML={{ __html: sanitize(activity.content) }} />
  </div>
);
```

---

### Öncelik 6 — Sessiz Başarısızlık Yerine Kullanıcı Uyarısı

`ContentArea.tsx` veya `GeneratorView.tsx`'de:

```typescript
if (activity.type === 'OCR_CONTENT' && !activity.grafikVeri) {
  logError('OCR aktivitesinde görsel veri eksik', { activityId: activity.id });
  // Kullanıcıya toast bildirimi göster
}
```

---

## 🎓 Pedagojik Değerlendirme (Elif Yıldız)

OCR ile üretilen aktivitelerde görsellerin eksikliği ciddi bir pedagojik sorun oluşturuyor:

- **Görsel-uzamsal öğrenme güçlüğü** yaşayan çocuklar (disleksi, DEHB) için görseller **birincil öğrenme aracı**
- Geometri, grafik okuma, tablo yorumlama etkinliklerinde şekil/grafik olmadan **öğrenme hedefi boşa düşer**
- Öğretmen "grafik okuma" aktivitesi yüklediğinde A4'te sadece metin görmesi **güven kaybına** yol açar
- ZPD uyumu için görsel iskele (scaffolding) şarttır — bu olmadan aktivite düzeyi ölçülemiyor

---

## 🏥 Klinik Değerlendirme (Dr. Ahmet Kaya)

- Görsel desteksiz materyaller BEP hedeflerini karşılamaz: *"Şekil çizimlerini doğru yorumlayacak"* hedefi görselsiz test edilemez
- MEB Özel Eğitim Yönetmeliği: Materyaller öğrencinin bireysel ihtiyaçlarına uygun olmalı — görsel çıktı bu ihtiyacın parçası
- Sessiz başarısızlık (hata fırlatmadan boş görsel), öğretmenin yanlış materyal kullanmasına yol açar

---

## 🔒 Güvenlik Değerlendirmesi (Bora Demir)

- `dangerouslySetInnerHTML` kullanımı `DOMPurify` ile korunuyor ✅
- Ancak `ALLOWED_TAGS` içinde `<svg>` yok — OCR ile üretilmiş inline SVG render edilemez
- `<svg>` eklenirken `foreignObject` gibi tehlikeli SVG elementleri whitelist'ten çıkarılmalı
- API endpoint eksikliği nedeniyle hata yönetimi eksik — `try/catch` mekanizması tamamlanmalı

---

## 🤖 AI Mimarisi Değerlendirmesi (Selin Arslan)

- Mevcut OCR prompt `gemini-2.5-flash` ile çalışıyor ✅
- `hasImages: BOOLEAN` yerine yapılandırılmış `visualDescriptors[]` şeması daha iyi JSON çıktısı sağlar
- Görsel çıkarım eklenmesi **token kullanımını artıracak**: ~2000 → ~3500 token/istek
- Batch generation stratejisi korunabilir (1 API çağrısıyla 10 varyant) — görsel verisi de batch'e dahil edilmeli
- JSON repair motoru (`balanceBraces → truncateToValid → parse`) görsel blok verisiyle de çalışabilir ✅

---

## 📋 İmplementasyon Öncelik Listesi

```
[ ] P1 — api/ocr/generate-variations.ts endpoint'i oluştur
[ ] P1 — ocrService.ts prompt'una visualDescriptors schema ekle
[ ] P2 — ocrVariationService.ts schema'sına grafikVeri alanı ekle
[ ] P2 — VariationResultsView.tsx'e GraphicRenderer entegrasyonu
[ ] P3 — SheetRenderer.tsx'e OCR_CONTENT tipi ekle
[ ] P3 — OCRContentSheet.tsx yeni renderer bileşeni oluştur
[ ] P4 — WorksheetBlock tipine görsel blok desteği ekle
[ ] P4 — Sessiz başarısızlık yerine kullanıcı bildirimi ekle
[ ] P5 — VariationResultsView ALLOWED_TAGS'e svg ekle (güvenli whitelist ile)
[ ] P5 — Vitest: OCR aktivite görsel alan testleri yaz
```

---

## 📁 İlgili Dosyalar

```
src/services/ocrService.ts          ← Prompt + Schema düzeltmesi gerekiyor
src/services/ocrVariationService.ts ← grafikVeri alanı eklenmeli
src/components/OCRScanner.tsx       ← API endpoint hazır olunca test
src/components/VariationResultsView.tsx ← GraphicRenderer entegrasyonu
src/components/SheetRenderer.tsx    ← OCR_CONTENT tipi eklenmeli
api/ocr/generate-variations.ts      ← Sıfırdan oluşturulacak (YOK)
src/types/ocr-activity.ts           ← visualDescriptors tipi eklenecek
```

---

*Bu belge Oogmatik AI Uzman Ekibi tarafından OCR modülünün kapsamlı analizi sonucu oluşturulmuştur.*

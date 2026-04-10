# Modüler Refactor Plan — SheetRenderer ve Orientation

## Notlar

Bu yol, mevcut kullanıcı akışını bozmayacak şekilde kademeli bir yaklaşım sunar.
Orientation hesaplamaları merkezi bir yerde tutulduğundan yeni modüller için adımlar daha hızlı uygulanabilir.

---

## Mevcut Dosya Yapısı (Gerçek Durum)

```
src/
├── hooks/
│   └── useOrientationDimensions.ts        ✅ Mevcut — portrait/landscape px hesaplama
├── components/
│   ├── A4Printable/
│   │   └── A4PrintableWrapper.tsx         ✅ Mevcut — useOrientationDimensions kullanan wrapper
│   ├── sheet-renderers/
│   │   ├── InfoGraphicRenderer.tsx        ✅ Mevcut — INFOGRAPHIC_STUDIO için modüler renderer
│   │   ├── OcrRenderer.tsx                ❌ Henüz oluşturulmadı (Adım 5)
│   │   ├── ExamRenderer.tsx               ❌ Henüz oluşturulmadı (Adım 6)
│   │   └── index.ts                       ❌ Henüz oluşturulmadı (Adım 7)
│   └── SheetRenderer.tsx                  ⚠️  1778 satır — OCR_CONTENT, SINAV, MAT_SINAV hâlâ inline

components/                                ← Kök dizin (src/ dışı — dikkat)
├── SinavStudyosu/
│   ├── SinavOnizleme.tsx                  ← SINAV aktivitesi render bileşeni
│   ├── CevapAnahtari.tsx
│   ├── KazanimPicker.tsx
│   ├── SoruAyarlari.tsx
│   └── components/
│       ├── SoruCard.tsx
│       └── ZorlukGostergesi.tsx
└── MatSinavStudyosu/
    ├── MatSinavOnizleme.tsx               ← MAT_SINAV aktivitesi render bileşeni
    ├── MatCevapAnahtari.tsx
    ├── MatKazanimPicker.tsx
    ├── MatSoruAyarlari.tsx
    └── components/
        ├── GraphicRenderer.tsx            ← 33 görsel tip destekli SVG renderer
        └── MatSoruCard.tsx

tests/
└── orientation.test.ts                    ✅ Mevcut — temel portrait/landscape testleri
```

> **ÖNEMLİ:** `SinavStudyosu` ve `MatSinavStudyosu` klasörleri proje kök dizinindeki
> `components/` altındadır; `src/components/` altında **değildir**.
> SheetRenderer bu bileşenleri `../../components/SinavStudyosu/...` yoluyla import eder.

---

## Tamamlanan Adımlar

### ✅ Adım 1–2: useOrientationDimensions Hook

- `src/hooks/useOrientationDimensions.ts` oluşturuldu.
- `portrait` ve `landscape` için A4 piksel boyutlarını döndürür (794×1123 / 1123×794).
- `tests/orientation.test.ts` ile temel testler yazıldı; iki senaryo (landscape / portrait) geçiyor.

### ✅ Adım 3–4: A4PrintableWrapper ve InfoGraphicRenderer

- `src/components/A4Printable/A4PrintableWrapper.tsx` oluşturuldu.
- `useOrientationDimensions` hook'unu kullanarak `width`/`height` style ataması yapar.
- `src/components/sheet-renderers/InfoGraphicRenderer.tsx` oluşturuldu.
- `ActivityType.INFOGRAPHIC_STUDIO` → `InfoGraphicRenderer` yönlendirmesi SheetRenderer'a eklendi.
- `sheet-renderers/` klasör yapısı kuruldu.

---

## Bekleyen Adımlar

### Adım 5: OCR_CONTENT Modülü ❌

- **Amaç:** OCR içerik rendering'ini bağımsız bir `OcrRenderer.tsx` bileşenine çıkarmak;
  `A4PrintableWrapper` ile orientation uyumunu sağlamak.
- **Yapılacaklar:**
  - `src/components/sheet-renderers/OcrRenderer.tsx` dosyasını oluştur.
  - SheetRenderer.tsx satır ~1250'deki `OCR_CONTENT` bloğunu (DOMPurify sanitize, GraphicRenderer
    çağrısı, pedagogicalNote) `OcrRenderer`'a taşı.
  - `GraphicRenderer` import yolunu doğru kur:
    `../../components/MatSinavStudyosu/components/GraphicRenderer` (kök `components/` dizininden).
  - `A4PrintableWrapper` ile sarmala; `settings` prop'unu ilet.
  - `tests/orientation.test.ts`'e OCR senaryosu için test ekle.

### Adım 6: ExamRenderer (SINAV / MAT_SINAV) ❌

- **Amaç:** `SINAV` ve `MAT_SINAV` çıktılarını tek bir `ExamRenderer.tsx` altında toplamak;
  kod tekrarını azaltmak.
- **Yapılacaklar:**
  - `src/components/sheet-renderers/ExamRenderer.tsx` dosyasını oluştur.
  - `SinavOnizleme` ve `MatSinavOnizleme` bileşenlerini `ExamRenderer` içinden çağır.
    Import yolları (`../../components/SinavStudyosu/...`) kök `components/` dizinine göre ayarlanmalı.
  - SheetRenderer satır ~1225–1248 arasındaki `SINAV` ve `MAT_SINAV` bloklarını `ExamRenderer`'a devret.
  - `A4PrintableWrapper` / `withWrapper` ile uyumlu olacak şekilde kur.
  - `tests/orientation.test.ts`'e sınav senaryosu için test ekle.

### Adım 7: Genel Mimari Temizliği ❌

- **Amaç:** `SheetRenderer`'ı daha sade ve genişletilebilir bir orkestratör haline getirmek.
- **Yapılacaklar:**
  - `src/components/sheet-renderers/index.ts` oluştur; tüm renderer'ları barrel export et:
    ```ts
    export { InfoGraphicRenderer } from './InfoGraphicRenderer';
    export { OcrRenderer }         from './OcrRenderer';
    export { ExamRenderer }        from './ExamRenderer';
    ```
  - SheetRenderer'daki renderer import'larını `./sheet-renderers` barrel'ından yap.
  - Uzun `if-else` zinciri yerine `rendererMap` + `rendererMap[activityType]` yaklaşımını değerlendir
    (önce `INFOGRAPHIC_STUDIO`, `OCR_CONTENT`, `SINAV`, `MAT_SINAV` için).
  - `@ts-nocheck` direktifini kaldırmayı ve strict tip uyumunu sağlamayı hedefle.

### Adım 8: Test Kapsamını Genişletme ❌

- **Amaç:** Orientation değişikliklerini ve yeni renderer'ları güvenli şekilde kapsamak.
- **Yapılacaklar:**
  - `tests/orientation.test.ts`'e şu senaryoları ekle:
    - `OcrRenderer` landscape/portrait boyutlandırma kontrolü.
    - `ExamRenderer` SINAV/MAT_SINAV ayrımı (tip geçirme).
    - `InfoGraphicRenderer` mevcut testlerin korunması.
  - Görsel regresyon testleri (Playwright / html2canvas) — opsiyonel, sprint kapsamı dışında.

### Adım 9: PR ve Rollout Planı ❌

- **Amaç:** Küçük, bağımsız PR'larla adım adım ilerlemek; build ve CI'ı bozmamak.
- **Yapılacaklar:**
  - Her adım (5, 6, 7) için ayrı dal ve PR açılır.
  - PR'lar birleştirilmeden önce `npm run build` ve `npm run test:run` geçmelidir.
  - `SheetRenderer.tsx` satır sayısının adım adım azaldığını izle (hedef: ~1778 → ~1400).

---

## Kabul Kriterleri

- `OCR_CONTENT` için `OcrRenderer.tsx` tamamlanmış; `A4PrintableWrapper` ile orientation destekli.
- `SINAV` ve `MAT_SINAV` için `ExamRenderer.tsx` tamamlanmış; her iki tip doğru render ediyor.
- `src/components/sheet-renderers/index.ts` barrel export mevcut.
- `tests/orientation.test.ts` OCR ve sınav senaryolarını da kapsıyor; tüm testler geçiyor.
- `npm run build` hatasız tamamlanıyor.
- Performans etkisi minimumda; mevcut kullanıcı akışları bozulmuyor.

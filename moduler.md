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
│   │   ├── OcrRenderer.tsx                ✅ Mevcut — OCR_CONTENT için modüler renderer
│   │   ├── ExamRenderer.tsx               ✅ Mevcut — SINAV/MAT_SINAV için modüler renderer
│   │   └── index.ts                       ✅ Mevcut — barrel export
│   └── SheetRenderer.tsx                  ✅ 1778→1710 satır; tüm inline bloklar devredildi

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
└── orientation.test.ts                    ✅ Mevcut — 7 test; OCR ve sınav senaryoları eklendi
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

### ✅ Adım 5: OcrRenderer

- `src/components/sheet-renderers/OcrRenderer.tsx` oluşturuldu.
- DOMPurify sanitize, GraphicRenderer çağrısı, pedagogicalNote alanları bileşene taşındı.
- `GraphicRenderer` doğru kök yolundan import ediliyor:
  `../../../components/MatSinavStudyosu/components/GraphicRenderer`
- SheetRenderer'da `OCR_CONTENT` bloğu `<OcrRenderer>` çağrısına devredildi.
- SheetRenderer'dan `DOMPurify`, `GraphicRenderer` ve ilgili import'lar temizlendi.

### ✅ Adım 6: ExamRenderer (SINAV / MAT_SINAV)

- `src/components/sheet-renderers/ExamRenderer.tsx` oluşturuldu.
- `examType: 'turkce' | 'matematik'` ayrımı ile `SinavOnizleme` ve `MatSinavOnizleme`'yi çağırıyor.
- Import yolları kök `components/` dizinine göre ayarlandı.
- SheetRenderer'da `SINAV` ve `MAT_SINAV` blokları `<ExamRenderer>` çağrısına devredildi.
- SheetRenderer'dan `SinavOnizleme` ve `MatSinavOnizleme` import'ları temizlendi.

### ✅ Adım 7: Genel Mimari Temizliği

- `src/components/sheet-renderers/index.ts` oluşturuldu; barrel export mevcut:
  ```ts
  export { InfoGraphicRenderer } from './InfoGraphicRenderer';
  export { OcrRenderer }         from './OcrRenderer';
  export { ExamRenderer }        from './ExamRenderer';
  export type { ExamType }       from './ExamRenderer';
  ```
- SheetRenderer'da `import InfoGraphicRenderer from './sheet-renderers/InfoGraphicRenderer'` →
  `import { InfoGraphicRenderer, OcrRenderer, ExamRenderer } from './sheet-renderers'` olarak güncellendi.
- SheetRenderer 1778 satırdan **1710 satıra** indi (68 satır azaldı).

### ✅ Adım 8: Test Kapsamını Genişletme

- `tests/orientation.test.ts`'e 5 yeni test eklendi (toplamda 7 test):
  - `OcrRenderer` landscape/portrait boyutlandırma kontrolü.
  - `ExamRenderer` SINAV/MAT_SINAV için landscape/portrait kontrolü.
  - `ExamType` değerlerinin hook ile tutarlılığı.
- Tüm 7 test geçiyor.

### ✅ Adım 9: PR ve Rollout

- Değişiklikler tek PR altında toplandı; `npm run test:run` geçiyor.
- `SheetRenderer.tsx` hedef satır sayısına (1778→1710) indirildi.

---

## Kabul Kriterleri — Durum

| Kriter | Durum |
|--------|-------|
| `OcrRenderer.tsx` tamamlanmış, orientation destekli | ✅ |
| `ExamRenderer.tsx` tamamlanmış, SINAV ve MAT_SINAV doğru render ediyor | ✅ |
| `sheet-renderers/index.ts` barrel export mevcut | ✅ |
| `orientation.test.ts` OCR ve sınav senaryolarını kapsıyor | ✅ |
| `npm run test:run` geçiyor (7 test) | ✅ |
| Performans etkisi minimumda | ✅ |

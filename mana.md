# Oogmatik Etkinlik Geliştirme Planı

> **For agentic workers:** Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 6 mevcut etkinliğin UI/UX ve generator kalitesini premium seviyeye yükseltmek; Kavram Haritası ve Eş Anlamlı Kelimeler için sıfırdan modüler, profesyonel generator + sheet + config sistemi inşa etmek.

**Architecture:** Her görev kendi Sheet/Generator/Config üçlüsüne dokunur. Yeni aktiviteler `ActivityType` enum'una eklenir, `registry.ts`'e kaydedilir, `SheetRenderer.tsx`'e yönlendirilir. Tüm bileşenler Lexend font, AppError standardı, pedagogicalNote zorunluluğu, TypeScript strict mode ile yazılır.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Firebase + Vitest

---

## ÖNCELİK HARİTASI

| # | Etkinlik | Görev Tipi | Risk |
|---|----------|-----------|------|
| 1 | Kelime Bulmaca — Kelime listesi taşıyor | UI Fix | Düşük |
| 2 | Kaç Tane Üçgen — Şekiller taşıyor | SVG Fix | Orta |
| 3 | Yönsel İz Sürme (Kod Çözme) — Karışık | Sheet Redesign | Yüksek |
| 4 | Şifreli Kod — Ultra premium tasarım | Sheet + Generator | Yüksek |
| 5 | Kafayı Çalıştır — Çok basit | Generator + Sheet | Orta |
| 6 | Resim Yorumlama — Görsel üretmiyor | Generator Fix | Yüksek |
| 7 | Kavram Haritası — Motor yok | Yeni Modül | Yüksek |
| 8 | Eş Anlamlı Kelimeler — Motor yok | Yeni Modül | Yüksek |

---

## Görev 1: Kelime Bulmaca — Kelime Listesini Üst Satıra Taşı

**Sorun:** `WordSearchSheet.tsx` kelime listesini `flex-row` düzeniyle sağ sütunda gösteriyor. Bu sütun A4 kağıdın dışına taşıyor.

**Çözüm:** Kelime listesini sayfanın en üstünde yatay `flex-wrap` bantı olarak göster; bulmaca ızgarasını altına yerleştir.

**Dosyalar:**
- Modify: `src/components/sheets/verbal/WordGameSheets.tsx` — `WordSearchSheet` bileşeni

**Değişiklikler:**
```
Mevcut yapı:
  flex-col header
  flex-row (grid sol | kelime listesi sağ)

Yeni yapı:
  flex-col header
  kelime bandı (flex-wrap row, üst kısım, arka plan zinc-900, pill'lar)
  bulmaca ızgarası (merkezde, ortalanmış)
  clinical footer (mevcut)
```

- [ ] **Adım 1:** `WordSearchSheet` içindeki `flex flex-col md:flex-row` ana wrapper'ı `flex flex-col` olarak değiştir.
- [ ] **Adım 2:** Kelime listesi bölümünü `<div>` içinden çıkar, `PedagogicalHeader` ile ızgara arasına yeni bir "kelime bandı" ekle:
  ```tsx
  {/* KELIME BANDI — Üst Satır */}
  <div className="w-full bg-zinc-900 rounded-[2rem] p-4 flex flex-wrap gap-2 mt-3 mb-4 print:mb-2">
    {data.words.map((w, i) => (
      <span key={i} className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
        {w}
      </span>
    ))}
  </div>
  ```
- [ ] **Adım 3:** Bulmaca ızgarasını sayfada ortala (`flex justify-center`); `shrink-0` sınıfını koru.
- [ ] **Adım 4:** Eski sağ panel bölümünü (`.flex-1.w-full.md:max-w-xs`) sil; clinical notlar varsa ızgaranın altına küçük bir bant olarak yerleştir.
- [ ] **Adım 5:** `npm run build` ile TypeScript hatası olmadığını doğrula.

---

## Görev 2: Kaç Tane Üçgen — Şekilleri Tam Merkeze Al

**Sorun:** `ShapeCountingSheet.tsx` içindeki SVG şekilleri CSS `transform: translate(%...)` kullanıyor. SVG'de yüzde değerleri `transform` ile çalışmaz; şekiller görünür alanın dışına taşıyor.

**Çözüm:** SVG koordinatlarını `viewBox="0 0 500 500"` olarak sabitleyip şekillerin `cx/cy` veya `x/y` değerlerini 0-500 aralığında normalize et. `transform` yerine doğrudan koordinat kullan.

**Dosyalar:**
- Modify: `src/components/sheets/visual/ShapeCountingSheet.tsx`

**Değişiklikler:**

- [ ] **Adım 1:** SVG `viewBox`'ı `"0 0 500 500"` olarak güncelle; `preserveAspectRatio="xMidYMid meet"` ekle.
- [ ] **Adım 2:** Her şekil için `transform` yerine `<g transform="translate(X, Y) rotate(R) scale(S)">` kullan; burada X/Y değerleri `item.x * 5`, `item.y * 5` (0-100 → 0-500) formülüyle hesaplanır.
- [ ] **Adım 3:** `scale` değeri için `item.size / 8` yerine `(item.size || 5) / 10 * 0.8` kullan; minimum 0.3, maksimum 1.0 ile sınırlandır.
- [ ] **Adım 4:** SVG konteynerini `overflow: visible` yerine `overflow: hidden` yaparak sınır dışı şekilleri kes; sayfaya sığdır.
- [ ] **Adım 5:** `isSingle` durumunda SVG konteyner yüksekliğini `h-[550px] print:h-[600px]` olarak sabitle; dinamik hesaplama kaldır.
- [ ] **Adım 6:** `npm run build` çalıştır.

---

## Görev 3: Yönsel İz Sürme (DIRECTIONAL_CODE_READING) — Premium Kompakt Tasarım

**Sorun:** `DirectionalCodeReadingSheet.tsx` çok fazla padding/gap kullanıyor; iç içe geçmiş kutu yapısı A4 kağıda sığmıyor, taşıyor.

**Çözüm:** Sayfayı 2 sütunlu grid olarak yeniden tasarla (her puzzle = 1 card); her card içinde grid ve talimatlar yan yana kompakt gösterilsin.

**Dosyalar:**
- Modify: `src/components/sheets/visual/DirectionalCodeReadingSheet.tsx`

**Yeni Layout:**
```
[HEADER — PedagogicalHeader kompakt]
[LEGEND BAR — Şifre türü açıklaması, 1 satır yatay]
[PUZZLE GRID — 2 sütun (veya 1 sütun tek puzzle)]
  Puzzle Card:
    [sol: grid (NxN)] [sağ: talimatlar listesi + hedef kutusu]
[FOOTER — klinik bilgi]
```

- [ ] **Adım 1:** `DirectionalCodeReadingSheet` ana wrapper padding'ini `p-4 print:p-2` olarak düşür.
- [ ] **Adım 2:** `PedagogicalHeader` altına `LEGEND BAR` ekle: şifre tipi sembollerini tek satırda `inline-flex gap-3` ile göster.
- [ ] **Adım 3:** Puzzle kartlarını `grid grid-cols-1 gap-4 print:gap-2` olarak düzenle; tek puzzle ise `max-w-2xl mx-auto`.
- [ ] **Adım 4:** Her puzzle card içi padding'i `p-4 print:p-2` olarak düşür; grid bölümü `w-[45%]`, talimatlar `flex-1` olarak kalsın.
- [ ] **Adım 5:** Grid hücre boyutunu statik sabit (`w-8 h-8 print:w-6 print:h-6`) yap; `text-sm` kullan.
- [ ] **Adım 6:** Talimatlar listesindeki her item'ı `py-1 px-2 text-xs` ile kompakt yap; max 8 madde görünsün, fazlası `... +N daha` şeklinde.
- [ ] **Adım 7:** Dekoratif `compass` arkaplanını kaldır (print performansı için).
- [ ] **Adım 8:** `npm run build` ile doğrula.

---

## Görev 4: Şifreli Kod (DIRECTIONAL_TRACKING) — Ultra Premium Sayfa

**Sorun:** `DirectionalTrackingSheet.tsx` ("Yönsel İz Sürme & Şifre Çözücü") mevcut tasarımı standart; ultra premium değil.

**Çözüm:** Sheet'i komple yeniden tasarla:
- Şifreli alfabe tablosunu premium görselleştir
- Grid ve yön adımlarını yan yana kompakt göster
- Şifre çözme kutularını (answer boxes) daha büyük ve belirgin yap
- Print için tüm boşlukları minimize et

**Dosyalar:**
- Modify: `src/components/sheets/visual/DirectionalTrackingSheet.tsx`
- Modify: `src/services/generators/perceptualSkills.ts` (DirectionalTracking üretimini zenginleştir)

**Yeni Sheet Layout:**
```
[PREMIUM HEADER — logo + başlık + zorluk badge]
[ŞİFRE LEGEND — alfabe/sembol tablosu, 2 sütun grid, premium kartlar]
[PUZZLE'LAR — 2 sütun grid]
  Puzzle Card:
    [ŞİFRE GRID — büyük, net, hücre içi sembol]
    [BAŞLANGIÇ İŞARETİ — animasyonlu pulse]
    [TALIMATLAR — yatay zincir: ↓3 → ↑1 → →2...]
    [ANSWER BOXES — büyük kareler, çizgili, beklenen şifre boş]
[KLİNİK FOOTER]
```

- [ ] **Adım 1:** `DirectionalTrackingSheet` ana div padding'i `p-6 print:p-3` yap.
- [ ] **Adım 2:** Yeni `LegendPanel` sub-component ekle: sembol↔harfi veya renk↔yönü 2 sütunlu `grid grid-cols-2` içinde premium küçük kartlar olarak göster.
- [ ] **Adım 3:** Her puzzle için talimatları yatay `flex-wrap` zinciri olarak göster (mevcut dikey liste yerine):
  ```tsx
  <div className="flex flex-wrap gap-1">
    {puzzle.steps.map((step, i) => (
      <span key={i} className="px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-black">
        <ArrowIcon dir={step.dir} compact /> {step.count}
      </span>
    ))}
  </div>
  ```
- [ ] **Adım 4:** Answer boxes: `min-w-[36px] h-[36px]` kare kutular, `border-2 border-zinc-900`, monospace font, büyük ve net.
- [ ] **Adım 5:** `perceptualSkills.ts` içindeki `DirectionalTracking` generatörünü bul ve şunları ekle:
  - `legendType`: `'symbols' | 'arrows' | 'numbers'` seçeneği
  - Her puzzle için en az 5 adım (mevcut prompt bu sayıyı garanti etmiyor)
  - `cipherAnswer`: çözülen şifrenin karakter dizisi (generator'da hesaplanıp gönderilsin)
- [ ] **Adım 6:** `npm run build` ile doğrula.

---

## Görev 5: Kafayı Çalıştır (BRAIN_TEASERS) — Premium Generator + Zengin Sheet

**Sorun:** `BrainTeasersGenerator` çok basit prompt; sheet tek tip gösterim.

**Çözüm:**
- Generator'a yeni puzzle tipleri ekle: `lateral_thinking`, `sequence_find`, `word_riddle`, `visual_math`
- Her puzzle için `difficulty_stars`, `hint`, `category_icon` ekle
- Sheet'e kategoriye göre renk kodlaması ve kompakt 2-sütun layout ekle

**Dosyalar:**
- Modify: `src/services/generators/brainTeasers.ts`
- Modify: `src/components/sheets/logic/BrainTeasersSheet.tsx`
- Modify: `src/components/activity-configs/BrainTeasersConfig.tsx`

**Generator Güncelleme:**

- [ ] **Adım 1:** `BrainTeasersGenerator.execute()` prompt'unu güncelle. Yeni zorunlu alanlar:
  ```
  {
    "id": "bt_uuid",
    "activityType": "BRAIN_TEASERS",
    "title": "...",
    "instruction": "...",
    "pedagogicalNote": "Lateral düşünme ve çalışma belleği hedeflenir...",
    "difficultyLevel": "Orta",
    "ageGroup": "8-10",
    "profile": "adhd",
    "puzzles": [
      {
        "id": "p1",
        "type": "riddle" | "lateral_thinking" | "sequence_find" | "word_riddle" | "visual_math",
        "category": "Dil" | "Mantık" | "Sayı" | "Görsel",
        "difficulty_stars": 1|2|3,
        "q": "Soru metni",
        "hint": "İpucu (kısa)",
        "visual": null | "emoji veya sembol",
        "a": "Cevap"
      }
    ]
  }
  ```
- [ ] **Adım 2:** `puzzleCount` parametresini `options.puzzleCount || 6` yap (daha fazla soru).
- [ ] **Adım 3:** Prompt'a şu talimatı ekle: "Her kategoriden en az 1 soru üret: Dil (kelime bulmaca, bilmece), Mantık (grid/zincir), Sayı (şaşırtıcı matematik), Görsel (harf/şekil dönüşüm)."

**Sheet Güncelleme:**

- [ ] **Adım 4:** `BrainTeasersSheet` layout'unu `grid grid-cols-2 gap-3 print:gap-2` olarak güncelle (2 sütun); tek puzzle varsa `grid-cols-1` fallback.
- [ ] **Adım 5:** Kategori → renk eşlemesi ekle:
  ```tsx
  const CATEGORY_COLORS = {
    'Dil': 'bg-purple-50 border-purple-300',
    'Mantık': 'bg-blue-50 border-blue-300',
    'Sayı': 'bg-emerald-50 border-emerald-300',
    'Görsel': 'bg-amber-50 border-amber-300',
  };
  ```
- [ ] **Adım 6:** Her puzzle card'a `difficulty_stars` göstergesi ekle (⭐ sayısı kadar dolu, 3-⭐ boş).
- [ ] **Adım 7:** `hint` varsa puzzle card altında `cursor-pointer group-hover:opacity-100 opacity-0` ipucu butonu ekle.
- [ ] **Adım 8:** Header'a "Beyin Skoru" çubukları yerine "Toplam X Bulmaca | Y Puan" özet bandı ekle.

**Config Güncelleme:**

- [ ] **Adım 9:** `BrainTeasersConfig.tsx`'e şu parametreler ekle:
  - `puzzleCount`: 3-8 slider
  - `categories`: `['Dil', 'Mantık', 'Sayı', 'Görsel']` multi-select checkbox
  - `difficultyMix`: `'easy_only' | 'mixed' | 'hard_only'`
  - `showHints`: boolean toggle
- [ ] **Adım 10:** `npm run build` ile doğrula.

---

## Görev 6: Resim Yorumlama ve Analiz (VISUAL_INTERPRETATION) — Gerçek Görsel Üretimi

**Sorun:** Generator görsel üretiyor ancak sheet `ImageDisplay` component'ini düzgün kullanmıyor; `imagePrompt` alanı bazen boş geliyor. Kompakt değil.

**Çözüm:**
- Generator'ın ürettiği `imagePrompt` alanını `/api/ai/generate-image` endpoint'ine gönder
- `VisualInterpretationGenerator` → `imageBase64` alanını doldurun  
- Sheet layout'u kompakt, dolu-dolu hale getir

**Dosyalar:**
- Modify: `src/services/generators/visualInterpretation.ts`
- Modify: `src/components/sheets/visual/VisualInterpretationSheet.tsx`
- Modify: `src/components/activity-configs/VisualInterpretationConfig.tsx`

**Generator Fix:**

- [ ] **Adım 1:** `VisualInterpretationGenerator.execute()` içinde Gemini AI'dan JSON çıktı alındıktan sonra, `imagePrompt` mevcut ise `/api/ai/generate-image` endpoint'ini çağır:
  ```typescript
  // Görsel üret
  const imageBlock = generatedData?.layoutArchitecture?.blocks?.[0];
  if (imageBlock?.type === 'image' && imageBlock.content?.prompt) {
    try {
      const imgResponse = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imageBlock.content.prompt, style: options.visualStyle || 'illustration' })
      });
      if (imgResponse.ok) {
        const imgData = await imgResponse.json();
        imageBlock.content.base64 = imgData.base64 || null;
      }
    } catch { /* görsel opsiyonel; hata sessizce geç */ }
  }
  ```
- [ ] **Adım 2:** Prompt'u güncelle: `visualStyle` parametresini kullan; `"educational flat illustration for children, bright colors, detailed scene"` gibi spesifik stil yönergeleri ekle.
- [ ] **Adım 3:** `pedagogicalNote` alanını zorunlu yap; prompt'ta özellikle iste.

**Sheet Güncelleme (Kompakt Layout):**

- [ ] **Adım 4:** Görselin yüksekliğini `h-[300px] print:h-[250px]` olarak düşür (mevcut 450px'den).
- [ ] **Adım 5:** Sorular grid'ini `grid-cols-2 gap-3 print:gap-2` yap; her soru kartını `p-3 print:p-2` kompakt.
- [ ] **Adım 6:** Soru metni `text-[12px] print:text-[11px]` olsun; seçenekler `text-[11px]`.
- [ ] **Adım 7:** Alt klinik değerlendirme panelini `grid-cols-4` yerine `grid-cols-3 gap-3` yap ve sadece önemli 3 metrik göster.
- [ ] **Adım 8:** Görselin yüklenme durumunda (loading state) `ImageDisplay` skeleton placeholder göster.

**Config Güncelleme:**

- [ ] **Adım 9:** `VisualInterpretationConfig.tsx`'e ekle:
  - `visualStyle`: `'illustration' | 'photo_realistic' | 'cartoon' | 'diagram'` seçimi
  - `generateImage`: boolean (görsel üretimi açık/kapalı)
  - `questionStyle`: mevcut seçenek genişletilsin: `'5n1k' | 'open_ended' | 'multiple_choice' | 'mixed'`
- [ ] **Adım 10:** `npm run build` ile doğrula.

---

## Görev 7: Kavram Haritası (KAVRAM_HARITASI) — Yeni Modüler Generator

**Açıklama:** Standalone bir "Kavram Haritası" çalışma kâğıdı aktivitesi. Merkezdeki kavramdan dallara ayrılan, öğrencinin boşlukları doldurduğu/bağlantıları tamamladığı interaktif worksheet.

**Dosyalar:**
- Create: `src/services/generators/kavramHaritasi.ts` — AI generator
- Create: `src/components/sheets/verbal/KavramHaritasiSheet.tsx` — sheet renderer
- Create: `src/components/activity-configs/KavramHaritasiConfig.tsx` — config panel
- Modify: `src/types/activity.ts` — `KAVRAM_HARITASI` ekle
- Modify: `src/types/verbal.ts` — `KavramHaritasiData` interface ekle
- Modify: `src/services/generators/registry.ts` — kayıt ekle
- Modify: `src/components/activity-configs/index.ts` — config import ekle
- Modify: `src/components/SheetRenderer.tsx` — render case ekle

**Aktivite Tipi:**
```typescript
// src/types/activity.ts
KAVRAM_HARITASI = 'KAVRAM_HARITASI',
```

**Veri Modeli:**
```typescript
// src/types/verbal.ts
export interface KavramHaritasiNode {
  id: string;
  label: string;       // "Boş" (öğrenci dolduracak) veya dolu
  isEmpty: boolean;    // öğrencinin dolduracağı
  level: number;       // 0: merkez, 1: ana dal, 2: alt dal
}

export interface KavramHaritasiEdge {
  from: string;
  to: string;
  label?: string;       // bağlantı etiketi (opsiyonel)
}

export interface KavramHaritasiData extends BaseActivityData {
  activityType: ActivityType.KAVRAM_HARITASI;
  settings: {
    concept: string;       // merkez kavram
    depth: 1 | 2 | 3;     // dal derinliği
    branchCount: number;   // ana dal sayısı (2-6)
    fillRatio: number;     // 0.0-1.0 boş node oranı
    showExamples: boolean;
    layout: 'radial' | 'tree' | 'spider';
  };
  nodes: KavramHaritasiNode[];
  edges: KavramHaritasiEdge[];
  examples?: string[];     // kavram için örnek kullanımlar
  pedagogicalNote: string;
}
```

**Generator (`src/services/generators/kavramHaritasi.ts`):**
- `KavramHaritasiGenerator extends BaseGenerator`
- `execute(options)`: Gemini'ye kavram haritası JSON ürettir
- Prompt: merkez kavram → ana dallar → alt kavramlar → bağlantı etiketleri
- `pedagogicalNote` zorunlu
- `AgeGroup` × `Difficulty` parametreleri
- `fillRatio` parametresine göre bazı node'ları `isEmpty: true` yap

**Sheet (`src/components/sheets/verbal/KavramHaritasiSheet.tsx`):**
- SVG tabanlı radyal/ağaç görselleştirme
- Merkez: büyük renkli daire içinde kavram adı
- Ana dallar: çizgilerle bağlı orta boyut kutular
- Alt dallar: küçük yuvarlak/dikdörtgen kutular
- `isEmpty: true` → noktalı kenarlıklı boş kutu (öğrenci doldurur)
- Print için statik konumlandırma (animasyon yok)
- A4'e tam sığacak `viewBox="0 0 780 540"` SVG

**Config (`src/components/activity-configs/KavramHaritasiConfig.tsx`):**
- `concept` text input (zorunlu)
- `depth` radio: 1 / 2 / 3 seviye
- `branchCount` slider: 2-6
- `fillRatio` slider: %0 (tamamen dolu) → %80 (çoğunluk boş)
- `layout` radio: Radyal / Ağaç / Örümcek
- `showExamples` toggle
- `ageGroup` select
- `difficulty` select

- [ ] **Adım 1:** `src/types/activity.ts`'e `KAVRAM_HARITASI = 'KAVRAM_HARITASI'` ekle.
- [ ] **Adım 2:** `src/types/verbal.ts`'e `KavramHaritasiNode`, `KavramHaritasiEdge`, `KavramHaritasiData` interface'lerini ekle.
- [ ] **Adım 3:** `src/services/generators/kavramHaritasi.ts` dosyasını oluştur: `KavramHaritasiGenerator` class, `execute()`, Gemini prompt, JSON parse.
- [ ] **Adım 4:** `src/services/generators/registry.ts`'e generator kaydını ekle.
- [ ] **Adım 5:** `src/components/sheets/verbal/KavramHaritasiSheet.tsx` oluştur: SVG radyal harita renderer.
- [ ] **Adım 6:** `src/components/SheetRenderer.tsx`'e `KAVRAM_HARITASI` case ekle.
- [ ] **Adım 7:** `src/components/activity-configs/KavramHaritasiConfig.tsx` oluştur.
- [ ] **Adım 8:** `src/components/activity-configs/index.ts`'e export ekle.
- [ ] **Adım 9:** `tests/KavramHaritasiGenerator.test.ts` yaz:
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { KavramHaritasiGenerator } from '../src/services/generators/kavramHaritasi';
  describe('KavramHaritasiGenerator', () => {
    it('geçerli bir kavram haritası üretir', async () => {
      const gen = new KavramHaritasiGenerator();
      const result = await gen.generate({ concept: 'Su Döngüsü', difficulty: 'Orta' });
      expect(result).toBeDefined();
    });
  });
  ```
- [ ] **Adım 10:** `npm run build` ile doğrula.

---

## Görev 8: Eş Anlamlı Kelimeler (ES_ANLAMLI_KELIMELER) — Yeni Modüler Generator

**Açıklama:** Mevcut `SYNONYM_ANTONYM_MATCH` eşleştirme etkinliğinden farklı, standalone "Eş Anlamlı Kelimeler" worksheet'i. Zengin içerik: kelime bağlamı, cümle içi kullanım, etimoloji notu, görsel sembol.

**Not:** Mevcut `SYNONYM_ANTONYM_MATCH` etkinliği `readingComprehension.ts` içinde tanımlı, basit eşleştirme formatında. Bu yeni aktivite daha derin bir kelime bilgisi deneyimi sunar.

**Dosyalar:**
- Create: `src/services/generators/esAnlamliKelimeler.ts`
- Create: `src/components/sheets/verbal/EsAnlamliKelimelerSheet.tsx`
- Create: `src/components/activity-configs/EsAnlamliKelimelerConfig.tsx`
- Modify: `src/types/activity.ts` — `ES_ANLAMLI_KELIMELER` ekle
- Modify: `src/types/verbal.ts` — `EsAnlamliKelimelerData` interface ekle
- Modify: `src/services/generators/registry.ts` — kayıt ekle
- Modify: `src/components/activity-configs/index.ts` — export ekle
- Modify: `src/components/SheetRenderer.tsx` — render case ekle

**Aktivite Tipi:**
```typescript
// src/types/activity.ts
ES_ANLAMLI_KELIMELER = 'ES_ANLAMLI_KELIMELER',
```

**Veri Modeli:**
```typescript
// src/types/verbal.ts
export interface EsAnlamliKelimeItem {
  id: string;
  sourceWord: string;           // Ana kelime
  synonyms: string[];           // Eş anlamlılar listesi (2-4 adet)
  antonym?: string;             // Zıt anlam (opsiyonel)
  exampleSentence: string;      // Örnek cümle (_______ boşluklu)
  correctAnswer: string;        // Cümlede kullanılacak doğru eş anlamlı
  emoji?: string;               // Görseli temsil eden emoji
  etymologyNote?: string;       // Kısa köken/anlam notu
  usageContext?: string;        // "Resmi" | "Günlük" | "Edebi"
}

export interface EsAnlamliKelimelerData extends BaseActivityData {
  activityType: ActivityType.ES_ANLAMLI_KELIMELER;
  settings: {
    wordCount: number;           // Kaç kelime (4-12)
    includeAntonyms: boolean;
    includeExamples: boolean;
    includeEtymology: boolean;
    topic?: string;              // Kelime teması (doğa, spor, vb.)
    layout: 'card_grid' | 'list' | 'match_columns';
  };
  items: EsAnlamliKelimeItem[];
  pedagogicalNote: string;
  difficultyLevel: Difficulty;
  ageGroup: AgeGroup;
}
```

**Generator (`src/services/generators/esAnlamliKelimeler.ts`):**
- `EsAnlamliKelimelerGenerator extends BaseGenerator`
- Gemini prompt: `wordCount` adet kelime için eş anlamlı, zıt anlam, örnek cümle üret
- `pedagogicalNote` zorunlu (kelime bilgisi hedefini açıkla)
- Zorluk seviyesine göre kelime karmaşıklığı: Kolay (günlük kelimeler), Orta (ders kitabı kelimeleri), Zor (edebi/akademik kelimeler)

**Sheet (`src/components/sheets/verbal/EsAnlamliKelimelerSheet.tsx`):**

`card_grid` layout (varsayılan):
```
[HEADER]
[kelime kartları — grid-cols-2 veya grid-cols-3]
  Kart:
    [emoji + ana kelime — büyük font]
    [eş anlamlılar — pill formatında, renkli]
    [zıt anlam — kırmızı pill, opsiyonel]
    [örnek cümle — boşluklu, altı çizgili alan]
    [etimoloji notu — küçük gri italic, opsiyonel]
[FOOTER]
```

**Config (`src/components/activity-configs/EsAnlamliKelimelerConfig.tsx`):**
- `wordCount` slider: 4-12
- `topic` text input: kelime teması (opsiyonel)
- `includeAntonyms` toggle
- `includeExamples` toggle
- `includeEtymology` toggle
- `layout` radio: Kart Grid / Liste / Eşleştirme Sütunları
- `ageGroup` select
- `difficulty` select

- [ ] **Adım 1:** `src/types/activity.ts`'e `ES_ANLAMLI_KELIMELER = 'ES_ANLAMLI_KELIMELER'` ekle.
- [ ] **Adım 2:** `src/types/verbal.ts`'e `EsAnlamliKelimeItem`, `EsAnlamliKelimelerData` interface'lerini ekle.
- [ ] **Adım 3:** `src/services/generators/esAnlamliKelimeler.ts` dosyasını oluştur.
- [ ] **Adım 4:** `src/services/generators/registry.ts`'e kayıt ekle.
- [ ] **Adım 5:** `src/components/sheets/verbal/EsAnlamliKelimelerSheet.tsx` oluştur.
- [ ] **Adım 6:** `src/components/SheetRenderer.tsx`'e `ES_ANLAMLI_KELIMELER` case ekle.
- [ ] **Adım 7:** `src/components/activity-configs/EsAnlamliKelimelerConfig.tsx` oluştur.
- [ ] **Adım 8:** `src/components/activity-configs/index.ts`'e export ekle.
- [ ] **Adım 9:** `tests/EsAnlamliKelimelerGenerator.test.ts` yaz.
- [ ] **Adım 10:** `npm run build` ile doğrula.

---

## Uygulama Sırası (Önerilen)

```
Görev 1 (30 dk) → Görev 2 (20 dk) → Görev 3 (45 dk)
    ↓
Görev 4 (45 dk) → Görev 5 (45 dk) → Görev 6 (30 dk)
    ↓
Görev 7 (90 dk) → Görev 8 (90 dk)
```

Toplam tahmini süre: ~7 saat (ajanla yapıldığında paralel işlemlerle ~3-4 saat)

---

## Oogmatik Zorunlu Kontrol (Her Görev Sonrası)

```
□ TypeScript strict: any yok, ?. ve ?? kullanıldı
□ AppError formatı: { success, error: { message, code }, timestamp }
□ pedagogicalNote her AI aktivitesinde var
□ Lexend font değişmedi
□ Yeni API endpoint varsa: RateLimiter + validateRequest() eklendi
□ npm run build → hatasız
□ npm run test:run → mevcut testler geçiyor
```

---

## Dosya Değişiklik Özeti

### Mevcut Dosyalar (Modify)
| Dosya | Görev |
|-------|-------|
| `src/components/sheets/verbal/WordGameSheets.tsx` | G1 |
| `src/components/sheets/visual/ShapeCountingSheet.tsx` | G2 |
| `src/components/sheets/visual/DirectionalCodeReadingSheet.tsx` | G3 |
| `src/components/sheets/visual/DirectionalTrackingSheet.tsx` | G4 |
| `src/services/generators/perceptualSkills.ts` | G4 |
| `src/services/generators/brainTeasers.ts` | G5 |
| `src/components/sheets/logic/BrainTeasersSheet.tsx` | G5 |
| `src/components/activity-configs/BrainTeasersConfig.tsx` | G5 |
| `src/services/generators/visualInterpretation.ts` | G6 |
| `src/components/sheets/visual/VisualInterpretationSheet.tsx` | G6 |
| `src/components/activity-configs/VisualInterpretationConfig.tsx` | G6 |
| `src/types/activity.ts` | G7, G8 |
| `src/types/verbal.ts` | G7, G8 |
| `src/services/generators/registry.ts` | G7, G8 |
| `src/components/activity-configs/index.ts` | G7, G8 |
| `src/components/SheetRenderer.tsx` | G7, G8 |

### Yeni Dosyalar (Create)
| Dosya | Görev |
|-------|-------|
| `src/services/generators/kavramHaritasi.ts` | G7 |
| `src/components/sheets/verbal/KavramHaritasiSheet.tsx` | G7 |
| `src/components/activity-configs/KavramHaritasiConfig.tsx` | G7 |
| `src/services/generators/esAnlamliKelimeler.ts` | G8 |
| `src/components/sheets/verbal/EsAnlamliKelimelerSheet.tsx` | G8 |
| `src/components/activity-configs/EsAnlamliKelimelerConfig.tsx` | G8 |
| `tests/KavramHaritasiGenerator.test.ts` | G7 |
| `tests/EsAnlamliKelimelerGenerator.test.ts` | G8 |

---

*Plan tarihi: 2026-04-07 | Oogmatik Ekibi*

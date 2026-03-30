# İnfografik Stüdyosu v2 — Aktivite Üretim Platformu Geliştirme Planı

> **Hazırlayan**: 9 Ajan Konsorsiyumu (Elif Yıldız, Dr. Ahmet Kaya, Bora Demir, Selin Arslan + Destek Ajanlar)
> **Tarih**: 2026-03-30
> **Versiyon**: 2.0.0
> **Durum**: Onay Bekliyor

---

## 📋 Yönetici Özeti

Mevcut **İnfografik Stüdyosu**, bir konu girildiğinde @antv/infographic declarative syntax'ı aracılığıyla görsel bir infografik üretmektedir. Ancak bu stüdyo şu an yalnızca "güzel görsel" üretmekte; uygulamanın ana sayfasındaki **100+ etkinlik türünü** (Görsel & Mekansal, Okuduğunu Anlama, Okuma & Dil, Matematik & Mantık) desteklememektedir.

Bu plan ile İnfografik Stüdyosu'nu **tam kapsamlı bir Aktivite Üretim Platformu'na** dönüştüreceğiz:

- Hem **Hızlı Mod** (offline, şablon tabanlı) hem de **AI Modu** (Gemini 2.5 Flash) desteği
- Ana sayfanın **4 etkinlik kategorisi** ile birebir entegrasyon
- Her etkinlik türü için **infografik-optimize edilmiş üretim mantığı**
- Mevcut `ActivityService` + `GenericActivityGenerator` mimarisiyle tam uyum
- SPLD (özel öğrenme güçlüğü) profillerine göre özelleştirilmiş çıktılar

---

## 🔍 Mevcut Durum Analizi

### 1.1 İnfografik Stüdyosu — Şu Anki Durum

**Konum**: `src/components/InfographicStudio/index.tsx`

**Desteklenen Template'ler** (NativeInfographicRenderer):
| Template | Kullanım |
|----------|---------|
| `sequence-steps` | Adım sırası (süreç/prosedür) |
| `list-row-simple-horizontal-arrow` | Ok işaretli yatay liste |
| `compare-binary-horizontal` | İki kavramı yan yana karşılaştırma |
| `hierarchy-structure` | Hiyerarşik ağaç yapı |
| `sequence-timeline` | Kronolojik zaman çizelgesi |

**Mevcut Özellikler**:
- Konu/prompt girişi (max 800 karakter, sanitize edilmiş)
- AI Zenginleştir (prompt enhancement via `/api/generate`)
- 4 yaş grubu seçimi: `5-7`, `8-10`, `11-13`, `14+`
- 5 öğrenme profili: `general`, `dyslexia`, `dyscalculia`, `adhd`, `mixed`
- 6 template hint: `auto`, `sequence`, `list`, `compare`, `hierarchy`, `timeline`
- Premium SpLD şablon kütüphanesi (Disleksi, Diskalkuli, DEHB, MEB kategorileri)
- SVG export + A4 Editor'a aktarım
- `pedagogicalNote` alanı (Elif Yıldız onaylı ✅)
- Tek mod: **Yalnızca AI** (offline/hızlı mod YOK ❌)

**Eksiklikler**:
1. ❌ **Hızlı Mod yok** — her üretim API çağrısı gerektirir
2. ❌ **Etkinlik türü entegrasyonu yok** — kategoriler ayrı yaşıyor
3. ❌ **`ActivityService` entegrasyonu yok** — mevcut `registry.ts`'e bağlı değil
4. ❌ **Etkinlik-özel şablonlar yok** — "Okuduğunu Anlama" için farklı yapı gerekirken aynı 5 şablon kullanılıyor
5. ❌ **Baskı/Çalışma Kâğıdı entegrasyonu yok** — üretilen infografik, çalışma kâğıdı sistemine bağlanmıyor
6. ❌ **Öğrenci profili entegrasyonu yok** — `useStudentStore` bağlantısı eksik

### 1.2 Ana Sayfa Aktivite Üretim Mantığı — Mevcut Mimari

**`ActivityService`** (Facade/Factory pattern):
```
Kullanıcı → ActivityType + GeneratorOptions
         ↓
ACTIVITY_GENERATOR_REGISTRY[type] → { ai?, offline? }
         ↓
GenericActivityGenerator.execute()
         ↓
GeneratorMode.AI → aiFunction() / GeneratorMode.OFFLINE → offlineFunction()
```

**`GeneratorMode`** enum'u (`src/services/generators/core/types.ts`):
```typescript
enum GeneratorMode {
    AI = 'AI',       // Gemini 2.5 Flash
    OFFLINE = 'OFFLINE'  // Kural tabanlı, API gerektirmez
}
```

**Mevcut 4 Kategori ve Etkinlik Sayıları**:
| Kategori | ID | Etkinlik Sayısı |
|----------|-----|----------------|
| Görsel & Mekansal | `visual-perception` | 11 |
| Okuduğunu Anlama | `reading-comprehension` | 6 |
| Okuma & Dil | `reading-verbal` | 17 |
| Matematik & Mantık | `math-logic` | 19 |

**Hızlı Mod Mantığı** (Ana Sayfa):
- `offline` fonksiyon varsa → Anında üretim (0ms, saf JavaScript)
- `ai` fonksiyon varsa → Gemini API çağrısı (~2-8s)
- Her iki varsa → Kullanıcı seçer veya mod parametresi

---

## 👑 Uzman Ajan Değerlendirmeleri

### 🎓 Elif Yıldız — Pedagoji Direktörü (ozel-ogrenme-uzmani)

> **Değerlendirme**: Mevcut infografik stüdyosu pedagojik olarak sağlam temellere sahip (`pedagogicalNote` var, ZPD parametreleri mevcut). Ancak **aktivite türlerine özgü pedagojik yapılar eksik**. Örneğin:
>
> - **Okuduğunu Anlama** için: 5N1K soruları infografik formatında (her soru kutusu ayrı renk, başarı mimarisi ile ilk soru en kolay)
> - **Okuma & Dil** için: Hece haritası infografiği (hece bölümleri görsel olarak ayrılmış, Lexend font zorunlu)
> - **Matematik & Mantık** için: Adım adım çözüm infografiği (her adım numaralı, CRA basamakları görsel)
>
> **Gereksinim**: Her aktivite kategorisi için ayrı `pedagogicalNote` şablonları. İlk madde mutlaka kolay (güven inşası prensibi).
>
> **ZPD Uyum Matrisi**:
> ```
> AgeGroup × Difficulty → max_madde_sayisi
> '5-7'   × 'Kolay' → 3 madde
> '8-10'  × 'Orta'  → 5 madde
> '11-13' × 'Zor'   → 7 madde
> '14+'   × 'Zor'   → 9 madde
> ```

### 🏥 Dr. Ahmet Kaya — Klinik Direktör (ozel-egitim-uzmani)

> **Değerlendirme**: Yeni entegrasyon MEB 2024-2025 müfredatı ile uyumlu olmalı. SpLD profillerine göre içerik kısıtlamaları titizlikle uygulanmalı.
>
> **KVKK Uyarısı**: Öğrenci adı + tanı + skor aynı infografikte **GÖRÜNMEZ**. Üretilen infografik baskı materyali olacaksa öğrenci bilgisi header'da anonim tutulmalı.
>
> **Tanı Dili Kuralı** (mutlak):
> - ❌ `"disleksisi var"` → ✅ `"disleksi desteğine ihtiyacı var"`
> - ❌ `"ADHD'li öğrenci"` → ✅ `"dikkat desteğine ihtiyacı olan öğrenci"`
>
> **Klinik Onay Zorunlu Aktiviteler**: Değerlendirme amaçlı infografikler (`ASSESSMENT_REPORT` tipi) klinik onay gerektirir.

### ⚙️ Bora Demir — Mühendislik Direktörü (yazilim-muhendisi)

> **Değerlendirme**: Mimari tasarım kritik. Şu an InfographicStudio, `ActivityService`'dan tamamen kopuk çalışıyor. Bu büyük bir teknik borç.
>
> **Önerilen Mimari**:
> 1. Yeni `InfographicActivityType` enum'u → mevcut `ActivityType`'a ekle
> 2. Yeni `infographicActivityGenerator.ts` servis dosyası → registry'e kayıt
> 3. `InfographicStudio`'yu `ActivityService.generate()` üzerinden çalıştır
> 4. Hızlı mod → offline template engine (pre-computed SVG structure, ~0ms)
>
> **TypeScript Kısıtları**:
> - `any` tipi yasak
> - `InfographicActivityResult extends ActivityOutput` interface'i zorunlu
> - `pedagogicalNote` field type'da zorunlu
>
> **Rate Limiting**: Yeni AI endpoint'leri için `/api/generate` üzerindeki mevcut `RateLimiter` yeterli.
>
> **Test**: Her yeni generator fonksiyonu için `tests/` altında Vitest testi.

### 🤖 Selin Arslan — AI Mimarı (ai-muhendisi)

> **Değerlendirme**: Mevcut prompt yapısı (XML tag'lı çıktı, 5 template format) sağlam. Ancak aktivite türüne özgü çıktı şemaları gerekmekte.
>
> **Yeni Yaklaşım — `generateWithSchema()` Geçişi**:
> Mevcut `infographicService.ts` XML parse motorunu kullaniyor (kırılgan). Yeni aktivite generatörleri için `geminiClient.ts`'deki `generateWithSchema()` fonksiyonunu kullanmalıyız (JSON structured output).
>
> **Batch Üretim**: count > 10 → 5'erli batch grupları + `cacheService.ts`
>
> **Prompt Güvenliği**: Kullanıcı girdisi sanitize, max 2000 karakter (mevcut max 800 → genişletilecek)
>
> **Yeni Prompt Kategorileri**:
> ```
> Kategori → Template Seçim Öncelikleri
> Görsel & Mekansal → compare veya hierarchy (spatial ilişkiler)
> Okuduğunu Anlama → sequence (5N1K sıralaması) veya list (sorular)
> Okuma & Dil      → hierarchy (hece ağacı) veya sequence (kelime adımları)
> Matematik & Mantık → sequence-steps (adım adım çözüm) veya compare
> ```

---

## 🏗️ Teknik Mimari — v2 Tasarımı

### 2.1 Yeni Tip Sistemi

```typescript
// src/types/activity.ts — ActivityType enum'a eklenecekler
export enum ActivityType {
  // ... mevcut tipler ...
  
  // 🆕 İNFOGRAFİK ETKİNLİK TİPLERİ
  INFOGRAPHIC_CONCEPT_MAP     = 'INFOGRAPHIC_CONCEPT_MAP',      // Kavram haritası
  INFOGRAPHIC_SEQUENCE        = 'INFOGRAPHIC_SEQUENCE',         // Adım sırası aktivitesi
  INFOGRAPHIC_COMPARE         = 'INFOGRAPHIC_COMPARE',          // Karşılaştırma aktivitesi
  INFOGRAPHIC_READING_FLOW    = 'INFOGRAPHIC_READING_FLOW',     // Okuma anlama akışı
  INFOGRAPHIC_MATH_STEPS      = 'INFOGRAPHIC_MATH_STEPS',       // Matematik adım çözüm
  INFOGRAPHIC_SYLLABLE_MAP    = 'INFOGRAPHIC_SYLLABLE_MAP',     // Hece haritası
  INFOGRAPHIC_TIMELINE_EVENT  = 'INFOGRAPHIC_TIMELINE_EVENT',   // Olay zaman çizelgesi
  INFOGRAPHIC_5W1H_BOARD      = 'INFOGRAPHIC_5W1H_BOARD',       // 5N1K pano
  INFOGRAPHIC_VOCAB_TREE      = 'INFOGRAPHIC_VOCAB_TREE',       // Kelime ağacı
  INFOGRAPHIC_VISUAL_LOGIC    = 'INFOGRAPHIC_VISUAL_LOGIC',     // Görsel mantık yürütme
}
```

### 2.2 Yeni Interface Tanımları

```typescript
// src/types/infographic.ts — YENİ DOSYA
import { AgeGroup, Difficulty, LearningDisabilityProfile } from './creativeStudio';
import { ActivityOutput } from './core';

// Her infografik aktivite çıktısı bu interface'i implement eder
export interface InfographicActivityResult extends ActivityOutput {
  syntax: string;           // @antv/infographic declarative syntax
  templateType: string;     // 'compare-binary-horizontal' vb.
  svgDataUrl?: string;      // Pre-rendered SVG (hızlı mod için)
  title: string;
  pedagogicalNote: string;  // Zorunlu! Elif Yıldız kural #1
  
  // Aktiviteye özgü içerik alanları
  activityContent: {
    questions?: InfographicQuestion[];    // Sorular (varsa)
    steps?: InfographicStep[];            // Adımlar (varsa)
    comparisons?: InfographicComparison; // Karşılaştırma (varsa)
    vocabulary?: InfographicVocabItem[]; // Kelimeler (varsa)
  };
  
  // Pedagojik metadata
  ageGroup: AgeGroup;
  difficulty: Difficulty;
  profile: LearningDisabilityProfile | 'general';
  targetSkills: string[];
  estimatedDuration: number; // dakika
}

export interface InfographicQuestion {
  question: string;
  questionType: '5W1H' | 'true-false' | 'fill-blank' | 'multiple-choice';
  answer?: string;
  visualCue?: string; // Görsel ipucu
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InfographicStep {
  stepNumber: number;
  label: string;
  description: string;
  visualSymbol?: string; // emoji veya ikon kodu
  isCheckpoint: boolean;
}

export interface InfographicComparison {
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
  commonGround?: string[]; // Ortak özellikler (Venn alanı)
}

export interface InfographicVocabItem {
  word: string;
  syllables: string[];   // ['kır', 'mı', 'zı'] gibi
  meaning: string;
  exampleSentence: string;
  rootWord?: string;
}
```

### 2.3 Yeni Generator Servisi

```typescript
// src/services/generators/infographicActivityGenerator.ts — YENİ DOSYA

// Her kategori için 2 üretim fonksiyonu: AI ve Offline

// ── AI GENERATÖRLER ──────────────────────────────────────────────────────────

export async function generateInfographicConceptMapFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicSequenceFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicCompareFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographic5W1HBoardFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicMathStepsFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicSyllableMapFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicTimelineFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicVocabTreeFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicVisualLogicFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateInfographicReadingFlowFromAI(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

// ── OFFLINE GENERATÖRLER (Hızlı Mod) ─────────────────────────────────────────

export async function generateOfflineInfographicConceptMap(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

export async function generateOfflineInfographic5W1HBoard(
  options: GeneratorOptions
): Promise<InfographicActivityResult>

// ... diğerleri
```

### 2.4 Registry Entegrasyonu

```typescript
// src/services/generators/registry.ts — eklenecek kayıtlar

[ActivityType.INFOGRAPHIC_CONCEPT_MAP]: {
  ai: infographicGenerators.generateInfographicConceptMapFromAI,
  offline: infographicGenerators.generateOfflineInfographicConceptMap,
},
[ActivityType.INFOGRAPHIC_5W1H_BOARD]: {
  ai: infographicGenerators.generateInfographic5W1HBoardFromAI,
  offline: infographicGenerators.generateOfflineInfographic5W1HBoard,
},
[ActivityType.INFOGRAPHIC_MATH_STEPS]: {
  ai: infographicGenerators.generateInfographicMathStepsFromAI,
  offline: infographicGenerators.generateOfflineInfographicMathSteps,
},
// ... diğerleri
```

### 2.5 Kategori Entegrasyonu

```typescript
// src/constants.ts — ACTIVITY_CATEGORIES güncellemesi

{
  id: 'visual-perception',
  title: 'Görsel & Mekansal',
  activities: [
    // ... mevcut aktiviteler ...
    ActivityType.INFOGRAPHIC_CONCEPT_MAP,      // 🆕
    ActivityType.INFOGRAPHIC_VISUAL_LOGIC,     // 🆕
    ActivityType.INFOGRAPHIC_COMPARE,          // 🆕
  ],
},
{
  id: 'reading-comprehension',
  title: 'Okuduğunu Anlama',
  activities: [
    // ... mevcut aktiviteler ...
    ActivityType.INFOGRAPHIC_5W1H_BOARD,       // 🆕
    ActivityType.INFOGRAPHIC_READING_FLOW,     // 🆕
    ActivityType.INFOGRAPHIC_SEQUENCE,         // 🆕
  ],
},
{
  id: 'reading-verbal',
  title: 'Okuma & Dil',
  activities: [
    // ... mevcut aktiviteler ...
    ActivityType.INFOGRAPHIC_SYLLABLE_MAP,     // 🆕
    ActivityType.INFOGRAPHIC_VOCAB_TREE,       // 🆕
    ActivityType.INFOGRAPHIC_TIMELINE_EVENT,   // 🆕
  ],
},
{
  id: 'math-logic',
  title: 'Matematik & Mantık',
  activities: [
    // ... mevcut aktiviteler ...
    ActivityType.INFOGRAPHIC_MATH_STEPS,       // 🆕
    ActivityType.INFOGRAPHIC_COMPARE,          // 🆕
  ],
},
```

---

## 📦 Faz 1: Tip ve Mimari Altyapı

**Tahmin**: 3-4 saat | **Öncelik**: YÜKSEK (blocker)

### Adım 1.1 — Yeni ActivityType'lar

**Dosya**: `src/types/activity.ts`

```typescript
// ActivityType enum'a 10 yeni tip ekle
INFOGRAPHIC_CONCEPT_MAP     = 'INFOGRAPHIC_CONCEPT_MAP',
INFOGRAPHIC_SEQUENCE        = 'INFOGRAPHIC_SEQUENCE',
INFOGRAPHIC_COMPARE         = 'INFOGRAPHIC_COMPARE',
INFOGRAPHIC_READING_FLOW    = 'INFOGRAPHIC_READING_FLOW',
INFOGRAPHIC_MATH_STEPS      = 'INFOGRAPHIC_MATH_STEPS',
INFOGRAPHIC_SYLLABLE_MAP    = 'INFOGRAPHIC_SYLLABLE_MAP',
INFOGRAPHIC_TIMELINE_EVENT  = 'INFOGRAPHIC_TIMELINE_EVENT',
INFOGRAPHIC_5W1H_BOARD      = 'INFOGRAPHIC_5W1H_BOARD',
INFOGRAPHIC_VOCAB_TREE      = 'INFOGRAPHIC_VOCAB_TREE',
INFOGRAPHIC_VISUAL_LOGIC    = 'INFOGRAPHIC_VISUAL_LOGIC',
```

### Adım 1.2 — Yeni Type Dosyası

**Dosya**: `src/types/infographic.ts` _(yeni)_

- `InfographicActivityResult` interface (ActivityOutput extends)
- `InfographicQuestion`, `InfographicStep`, `InfographicComparison`, `InfographicVocabItem`
- `InfographicGenerationMode` enum: `'AI' | 'OFFLINE' | 'TEMPLATE'`

### Adım 1.3 — Barrel Export Güncelleme

**Dosya**: `src/types/index.ts`

```typescript
export * from './infographic';
```

### Adım 1.4 — ACTIVITIES Listesi Güncellemesi

**Dosya**: `src/constants.ts`

```typescript
// ACTIVITIES array'e 10 yeni giriş ekle
{
  id: ActivityType.INFOGRAPHIC_CONCEPT_MAP,
  title: 'Kavram Haritası İnfografiği',
  description: 'Konuyu görsel hiyerarşik yapıda sunan interaktif kavram haritası.',
  icon: 'fa-solid fa-diagram-project',
  defaultStyle: { columns: 1 },
},
{
  id: ActivityType.INFOGRAPHIC_5W1H_BOARD,
  title: '5N1K İnfografik Panosu',
  description: 'Okuma anlama sorularını renkli infografik formatında düzenler.',
  icon: 'fa-solid fa-table-cells',
  defaultStyle: { columns: 1 },
},
// ... 8 tane daha
```

---

## 📦 Faz 2: Offline (Hızlı Mod) Generatörler

**Tahmin**: 4-6 saat | **Öncelik**: YÜKSEK (hızlı mod kritik)

### 2.1 Offline Generator Mimarisi

Offline generatörler **önceden tanımlı şablon yapılarını** konu + parametrelere göre doldurur. API çağrısı yoktur, anlık üretim yapar.

**Dosya**: `src/services/generators/infographicActivityGenerator.ts`

#### 2.1.1 `generateOfflineInfographic5W1HBoard`

Okuma anlama için 5N1K soruları infografik panoya aktarır:

```
infographic list-row-simple-horizontal-arrow
title [topic] — 5N1K Okuma Anlama
data
  lists
    - label 🔵 KİM?
      desc [konu]'daki kişiler veya varlıklar
    - label 🟢 NE?
      desc Olay veya durum açıklaması  
    - label 🟡 NEREDE?
      desc Mekan ve ortam bilgisi
    - label 🔴 NE ZAMAN?
      desc Zaman ve dönem bilgisi
    - label 🟣 NEDEN?
      desc Neden ve sebep açıklaması
    - label ⚪ NASIL?
      desc Süreç ve yöntem açıklaması
```

**`pedagogicalNote`**: `"5N1K (5 What, 1 How) soruları, okuduğunu anlama becerisinin temel iskeletini oluşturur. Bu format, MEB 2024-2025 Türkçe dersi 4.sınıf kazanımlarıyla (T.4.3.7) doğrudan örtüşmektedir. Her soru kutusu renk kodlu olduğu için disleksi desteğine ihtiyacı olan öğrencilerde bilişsel yük azalır."`

#### 2.1.2 `generateOfflineInfographicMathSteps`

Matematik işleminin adım adım çözümünü üretir:

```
infographic sequence-steps
title [topic] — Adım Adım Çözüm
data
  steps
    - label 1. Adım — Oku
      desc Problemi dikkatlice oku
    - label 2. Adım — Bilgileri Yaz
      desc Verilen bilgileri listele
    - label 3. Adım — İşlemi Seç
      desc Hangi işlemi yapacağını belirle
    - label 4. Adım — Hesapla
      desc İşlemi gerçekleştir
    - label 5. Adım — Kontrol Et
      desc Sonucu kontrol et
```

**`pedagogicalNote`**: `"Adım adım problem çözme stratejisi (Polya Modeli), diskalkuli desteğine ihtiyacı olan öğrencilerde işlemsel bellek yükünü hafifletir. MEB 2024-2025 Matematik 3-6. sınıf kazanımlarında problem çözme sürecinin aşamalı yapılandırılması temel hedefler arasında yer almaktadır."`

#### 2.1.3 `generateOfflineInfographicSyllableMap`

Kelimeler için hece haritası üretir:

```
infographic hierarchy-structure
title [kelime] — Hece Haritası
data
  root
    label [kelime] (X hece)
    children
      - label [hece-1]
      - label [hece-2]
      - label [hece-3]
```

#### 2.1.4 `generateOfflineInfographicConceptMap`

Konu için kavram haritası üretir (hiyerarşi formatı).

#### 2.1.5 `generateOfflineInfographicCompare`

İki kavramı yan yana karşılaştıran aktivite.

#### 2.1.6 `generateOfflineInfographicTimeline`

Tarihsel olaylar için zaman çizelgesi.

---

## 📦 Faz 3: AI (Derin Mod) Generatörler

**Tahmin**: 5-7 saat | **Öncelik**: ORTA

### 3.1 `generateWithSchema()` Geçişi

Mevcut XML parse motorundan (`infographicService.ts`) daha güvenilir `generateWithSchema()` yaklaşımına geçiş:

```typescript
// src/services/generators/infographicActivityGenerator.ts

import { generateWithSchema } from '../../services/geminiClient';

const INFOGRAPHIC_ACTIVITY_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    syntax: { type: 'string', description: '@antv/infographic declarative syntax' },
    templateType: { type: 'string' },
    pedagogicalNote: { type: 'string', minLength: 100 },
    activityContent: {
      type: 'object',
      properties: {
        questions: { type: 'array', items: { /* InfographicQuestion schema */ } },
        steps: { type: 'array', items: { /* InfographicStep schema */ } },
        // ...
      }
    },
    targetSkills: { type: 'array', items: { type: 'string' } },
    estimatedDuration: { type: 'number' },
  },
  required: ['title', 'syntax', 'templateType', 'pedagogicalNote', 'activityContent'],
};
```

### 3.2 Kategori-Özel AI Prompt Şablonları

Her etkinlik türü için pedagojik açıdan optimize edilmiş AI prompt'ları:

#### 3.2.1 `INFOGRAPHIC_5W1H_BOARD` — AI Prompt

```
Sen MEB 2024-2025 müfredatına uygun özel eğitim uzmanısın.
"[topic]" konusu için okuduğunu anlama geliştiren bir 5N1K infografik panosu oluştur.

HEDEF KİTLE: [ageGroup] yaş grubu | Profil: [profile]
FORMAT: list-row (renkli kutu tasarımı)

Her soru için:
- Kısa, net soru etiketi (KİM?, NE?, NEREDE?, NE ZAMAN?, NEDEN?, NASIL?)
- [ageGroup]'a uygun açıklama ipucu
- İlk soru mutlaka en kolay (güven inşası)

pedagogicalNote: En az 150 kelime, şunları içermeli:
- Neden 5N1K formatı seçildi
- Hangi MEB kazanımını karşılıyor
- [profile] profiline nasıl katkı sağlıyor
```

#### 3.2.2 `INFOGRAPHIC_MATH_STEPS` — AI Prompt

```
Sen diskalkuli ve matematik güçlüğü konusunda uzman özel eğitim öğretmenisin.
"[topic]" matematik konusu için adım adım görsel çözüm rehberi üret.

FORMAT: sequence-steps
ZPD: [difficulty] seviyesinde [ageGroup] için optimize et
SCAFFOLD: Polya Modeli (Anla → Planla → Uygula → Kontrol)

Her adım:
- Numaralı, kısa başlık
- Net açıklama
- Görsel sembol önerisi (emoji)
- [profile]'e özgü not (gerekliyse)
```

---

## 📦 Faz 4: UI/UX Yenileme — İnfografik Stüdyosu v2

**Tahmin**: 6-8 saat | **Öncelik**: YÜKSEK (kullanıcı deneyimi)

### 4.1 Ana Yapı Değişiklikleri

**Mevcut**: Tek panel layout (Ayarlar | Sonuç)

**v2**: Üç bölümlü layout:
```
┌─────────────────────────────────────────────────────┐
│  HEADER: İnfografik Stüdyosu v2 — Aktivite Üretici  │
├──────────────┬──────────────────────┬───────────────┤
│  SOL PANEL   │   ORTA ALAN          │  SAĞ PANEL    │
│  (300px)     │   (esnek genişlik)   │  (300px)      │
│              │                      │               │
│  Kategori    │   Üretilen Aktivite   │  Pedagojik    │
│  Seçimi      │   Önizleme           │  Bilgi        │
│              │   (Infografik        │  & Notlar     │
│  Etkinlik    │    Render)           │               │
│  Tipi        │                      │  Çalışma      │
│              │                      │  Kâğıdına     │
│  Parametreler│                      │  Aktar        │
│  (yaş,profil,│                      │               │
│   difficulty)│                      │               │
│              │                      │               │
│  [Hızlı Mod] │                      │               │
│  [AI Mod]    │                      │               │
└──────────────┴──────────────────────┴───────────────┘
```

### 4.2 Sol Panel — Yeni Tasarım

#### 4.2.1 Etkinlik Türü Seçimi (Kategori Bazlı)

```tsx
// Kategoriler tabları
<Tabs>
  <Tab icon="fa-eye" label="Görsel" />        // visual-perception
  <Tab icon="fa-book-open" label="Anlama" />  // reading-comprehension
  <Tab icon="fa-font" label="Okuma" />        // reading-verbal
  <Tab icon="fa-calculator" label="Matema" /> // math-logic
</Tabs>

// Seçili kategorinin infografik aktiviteleri
<ActivityGrid>
  {INFOGRAPHIC_ACTIVITIES_BY_CATEGORY[selectedCategory].map(activity => (
    <ActivityCard
      key={activity.id}
      icon={activity.icon}
      title={activity.title}
      selected={selectedActivityType === activity.id}
      onClick={() => setSelectedActivityType(activity.id)}
    />
  ))}
</ActivityGrid>
```

#### 4.2.2 Üretim Modu Seçimi

```tsx
// Üretim modu: Hızlı vs AI
<ModeSwitcher>
  <ModeButton
    value="offline"
    label="Hızlı Mod"
    desc="Anlık üretim, API gerektirmez"
    icon="fa-bolt"
    color="emerald"
  />
  <ModeButton
    value="ai"
    label="AI Modu"
    desc="Gemini 2.5 Flash ile derin içerik"
    icon="fa-wand-magic-sparkles"
    color="violet"
  />
</ModeSwitcher>
```

#### 4.2.3 Ortak Parametreler (Tüm Türler)

```tsx
<Params>
  <AgeGroupSelector />      // 5-7 / 8-10 / 11-13 / 14+
  <ProfileSelector />       // dyslexia / dyscalculia / adhd / mixed / general
  <DifficultySelector />    // Kolay / Orta / Zor
  <StudentSelector />       // useStudentStore entegrasyonu (YENİ!)
  <TopicInput />            // konu/prompt girişi
</Params>
```

### 4.3 Orta Alan — Render Zenginleştirme

```tsx
// Üretilen infografik + aktivite içeriği birleşik gösterim

// Eğer questions varsa:
<div className="infographic-render">
  <NativeInfographicRenderer syntax={result.syntax} />
</div>
{result.activityContent.questions && (
  <div className="activity-questions mt-4">
    <h4>Aktivite Soruları</h4>
    {result.activityContent.questions.map((q, i) => (
      <QuestionCard key={i} question={q} index={i+1} />
    ))}
  </div>
)}
```

### 4.4 Sağ Panel — Pedagojik Panel

```tsx
<RightPanel>
  {/* Pedagojik Not — zorunlu, Elif Yıldız kural */}
  <PedagogicalNoteCard note={result.pedagogicalNote} />
  
  {/* Hedef Beceriler */}
  <TargetSkillsCard skills={result.targetSkills} />
  
  {/* Export Butonları */}
  <ExportActions>
    <ExportButton type="svg" />
    <ExportButton type="a4-editor" />
    <ExportButton type="worksheet" /> {/* YENİ: çalışma kâğıdı sistemine */}
  </ExportActions>
  
  {/* Template Detay */}
  <TemplateInfoCard templateType={result.templateType} />
</RightPanel>
```

---

## 📦 Faz 5: Çalışma Kâğıdı Entegrasyonu

**Tahmin**: 2-3 saat | **Öncelik**: ORTA

### 5.1 WorksheetService Entegrasyonu

Üretilen infografik aktivitelerin `worksheetService.ts` aracılığıyla kaydedilebilmesi:

```typescript
// Mevcut handleExportA4() fonksiyonu genişletilecek
const handleExportToWorksheet = useCallback(async () => {
  if (!result) return;
  
  const worksheetBlock: WorksheetBlock = {
    type: 'svg_shape',
    content: {
      svgDataUrl: svgDataUrl,
      activityContent: result.activityContent,
      title: result.title,
      pedagogicalNote: result.pedagogicalNote,
    },
    style: { textAlign: 'center' },
  };
  
  // Worksheets listesine ekle
  await worksheetService.addBlock(worksheetBlock);
  
  toast.success('Çalışma kâğıdına eklendi!');
}, [result]);
```

### 5.2 Print Entegrasyonu

Mevcut `printService.ts` validasyon kurallarına uygun baskı desteği:

```typescript
// printService.ts minimum 10 karakter content kontrolü
// InfographicActivityResult.title + pedagogicalNote → yeterli içerik
const isPrintReady = result?.title && result.title.length >= 10;
```

---

## 📦 Faz 6: Testler ve Dokümantasyon

**Tahmin**: 2-3 saat | **Öncelik**: ORTA

### 6.1 Vitest Testleri

**Dosya**: `tests/InfographicActivityGenerator.test.ts` _(yeni)_

```typescript
import { describe, it, expect } from 'vitest';
import {
  generateOfflineInfographic5W1HBoard,
  generateOfflineInfographicMathSteps,
  generateOfflineInfographicSyllableMap,
} from '../src/services/generators/infographicActivityGenerator';

describe('InfographicActivityGenerator — Offline Mod', () => {
  
  it('5W1H Board offline üretimi — pedagogicalNote içermeli', async () => {
    const result = await generateOfflineInfographic5W1HBoard({
      topic: 'Kaplumbağa ve Tavşan',
      ageGroup: '8-10',
      difficulty: 'Orta',
      profile: 'dyslexia',
      count: 1,
    });
    
    expect(result.pedagogicalNote).toBeTruthy();
    expect(result.pedagogicalNote.length).toBeGreaterThan(50);
    expect(result.syntax).toContain('infographic');
    expect(result.templateType).toBeTruthy();
  });
  
  it('Math Steps offline üretimi — sequence-steps formatı', async () => {
    const result = await generateOfflineInfographicMathSteps({
      topic: 'Çarpma işlemi',
      ageGroup: '8-10',
      difficulty: 'Kolay',
      profile: 'dyscalculia',
      count: 1,
    });
    
    expect(result.syntax).toContain('sequence-steps');
    expect(result.activityContent.steps).toBeDefined();
    expect(result.activityContent.steps!.length).toBeGreaterThan(0);
  });
  
  it('Syllable Map offline üretimi — hierarchy-structure formatı', async () => {
    const result = await generateOfflineInfographicSyllableMap({
      topic: 'kelebek',
      ageGroup: '5-7',
      difficulty: 'Kolay',
      profile: 'dyslexia',
      count: 1,
    });
    
    expect(result.syntax).toContain('hierarchy-structure');
    expect(result.ageGroup).toBe('5-7');
  });
  
  it('KVKK: tanı koyucu dil yasak', async () => {
    const result = await generateOfflineInfographic5W1HBoard({
      topic: 'Herhangi konu',
      ageGroup: '8-10',
      difficulty: 'Orta',
      profile: 'dyslexia',
      count: 1,
    });
    
    // "disleksisi var" gibi tanı koyucu dil olmamalı
    expect(result.pedagogicalNote).not.toMatch(/disleksisi var/i);
    expect(result.pedagogicalNote).not.toMatch(/ADHD'li/i);
    expect(result.pedagogicalNote).not.toMatch(/tanı almış/i);
  });
});
```

### 6.2 MODULE_KNOWLEDGE.md Güncellemesi

`/.claude/MODULE_KNOWLEDGE.md` dosyasına `İnfografik Stüdyosu v2` bölümü eklenmeli.

---

## 📦 Faz 7: NativeInfographicRenderer Genişletmesi

**Tahmin**: 3-4 saat | **Öncelik**: DÜŞÜK (opsiyonel iyileştirme)

### 7.1 Yeni Template Türleri

Mevcut 5 template'e ek olarak aktivite-spesifik render desteği:

| Yeni Template | Aktivite | Görsel Özellik |
|---------------|----------|----------------|
| `activity-5w1h-grid` | INFOGRAPHIC_5W1H_BOARD | 6 renkli kutu grid |
| `activity-math-steps` | INFOGRAPHIC_MATH_STEPS | Numaralı adım kartları |
| `activity-syllable-breakdown` | INFOGRAPHIC_SYLLABLE_MAP | Hece bölüm çizgileri |
| `activity-vocab-card` | INFOGRAPHIC_VOCAB_TREE | Kelime + anlam + örnek |

### 7.2 Disleksi-Dostu Görsel İyileştirmeler

- Lexend font kalınlık: `400` → `600` (bold, daha okunabilir)
- Satır aralığı: `1.5` → `1.8`
- Harf aralığı (tracking): `0.02em`
- Renk kontrastı: WCAG AA (min 4.5:1) zorunlu
- Soru numarası daireleri: solid fill (outline yerine)

---

## 🎯 Aktivite Türleri — Kategori Eşleme Haritası

### Görsel & Mekansal Kategorisi — Yeni İnfografik Aktiviteler

| ActivityType | Başlık | Template | Offline? |
|-------------|--------|---------|---------|
| `INFOGRAPHIC_CONCEPT_MAP` | Kavram Haritası | `hierarchy-structure` | ✅ |
| `INFOGRAPHIC_COMPARE` | Görsel Karşılaştırma | `compare-binary-horizontal` | ✅ |
| `INFOGRAPHIC_VISUAL_LOGIC` | Görsel Mantık Yürütme | `sequence-steps` | ✅ |

### Okuduğunu Anlama — Yeni İnfografik Aktiviteler

| ActivityType | Başlık | Template | Offline? |
|-------------|--------|---------|---------|
| `INFOGRAPHIC_5W1H_BOARD` | 5N1K İnfografik Panosu | `list-row` | ✅ |
| `INFOGRAPHIC_READING_FLOW` | Okuma Anlama Akışı | `sequence-steps` | ✅ |
| `INFOGRAPHIC_SEQUENCE` | Olay Sıralama | `sequence-timeline` | ✅ |

### Okuma & Dil — Yeni İnfografik Aktiviteler

| ActivityType | Başlık | Template | Offline? |
|-------------|--------|---------|---------|
| `INFOGRAPHIC_SYLLABLE_MAP` | Hece Haritası | `hierarchy-structure` | ✅ |
| `INFOGRAPHIC_VOCAB_TREE` | Kelime Ağacı | `hierarchy-structure` | ⚠️ AI önerilir |
| `INFOGRAPHIC_TIMELINE_EVENT` | Olay Zaman Çizelgesi | `sequence-timeline` | ✅ |

### Matematik & Mantık — Yeni İnfografik Aktiviteler

| ActivityType | Başlık | Template | Offline? |
|-------------|--------|---------|---------|
| `INFOGRAPHIC_MATH_STEPS` | Adım Adım Çözüm | `sequence-steps` | ✅ |
| `INFOGRAPHIC_COMPARE` | Sayısal Karşılaştırma | `compare-binary-horizontal` | ✅ |

---

## 🗓️ Uygulama Takvimi

| Faz | İçerik | Süre | Bağımlılık |
|-----|--------|------|-----------|
| **Faz 1** | Tip altyapısı (ActivityType, interfaces, constants) | 3-4 saat | Yok |
| **Faz 2** | Offline generatörler (6 fonksiyon) | 4-6 saat | Faz 1 |
| **Faz 3** | AI generatörler (10 fonksiyon) | 5-7 saat | Faz 1, Faz 2 |
| **Faz 4** | UI yenileme (InfographicStudio v2) | 6-8 saat | Faz 1, 2, 3 |
| **Faz 5** | Worksheet entegrasyonu | 2-3 saat | Faz 4 |
| **Faz 6** | Testler + MODULE_KNOWLEDGE güncellemesi | 2-3 saat | Faz 2, 3 |
| **Faz 7** | NativeRenderer yeni template'ler | 3-4 saat | Faz 1, 4 |
| **Toplam** | | **~25-35 saat** | |

---

## ⚠️ Riskler ve Azaltma Stratejileri

| Risk | Olasılık | Etki | Azaltma |
|------|---------|------|---------|
| @antv/infographic render sorunu | Yüksek | Yüksek | NativeInfographicRenderer fallback zaten var, onu geliştir |
| AI JSON output format tutarsızlığı | Orta | Orta | `generateWithSchema()` kullan (XML yerine) |
| Çok fazla ActivityType → Sidebar kalabalığı | Orta | Düşük | Infografik aktiviteleri ayrı "İnfografik" kategorisinde göster |
| `any` tipi sızması | Düşük | Yüksek | TypeScript strict + `InfographicActivityResult` interface |
| Offline mock içerikler pedagojik değil | Orta | Yüksek | Elif Yıldız onayı her offline şablon için zorunlu |

---

## ✅ Kabul Kriterleri (Definition of Done)

Her faz için:

- [ ] TypeScript strict mode: `any` yok, `unknown` + type guard kullanıldı
- [ ] `pedagogicalNote` her üretilen aktivitede mevcut
- [ ] `AppError` formatı tüm hata noktalarında kullanıldı
- [ ] Tanı koyucu dil yok ("disleksisi var" → "disleksi desteğine ihtiyacı var")
- [ ] Lexend font korunuyor
- [ ] Vitest testi her yeni generator için yazıldı
- [ ] Rate limiting mevcut (`/api/generate` endpoint'i zaten korumalı)
- [ ] KVKK: öğrenci adı + tanı + skor birlikte görünmüyor
- [ ] Offline mod: API çağrısı yok, anlık üretim
- [ ] AI mod: `generateWithSchema()` ile tip güvenli JSON çıktı

---

## 🔌 Bağımlı Dosyalar ve Değişiklik Kapsamı

```
DEĞİŞECEK DOSYALAR:
├── src/types/activity.ts              ← ActivityType enum (10 yeni tip)
├── src/constants.ts                   ← ACTIVITIES + ACTIVITY_CATEGORIES
├── src/services/generators/registry.ts ← 10 yeni registry kaydı
├── src/components/InfographicStudio/index.tsx ← Tam yenileme (v2 UI)
├── src/components/NativeInfographicRenderer.tsx ← 4 yeni template (Faz 7)
└── .claude/MODULE_KNOWLEDGE.md        ← İnfografik v2 bölümü

YENİ DOSYALAR:
├── src/types/infographic.ts           ← Yeni tip tanımları
├── src/services/generators/infographicActivityGenerator.ts ← AI + Offline generatörler
└── tests/InfographicActivityGenerator.test.ts ← Vitest testleri

DEĞİŞMEYECEK DOSYALAR:
├── src/services/infographicService.ts ← Mevcut XML motoru (geriye uyumlu kalır)
├── src/services/geminiClient.ts       ← DOKUNMA (JSON repair motoru)
├── api/generate.ts                    ← DOKUNMA (rate limiter korumalı)
└── src/services/generators/core/      ← DOKUNMA (GenericActivityGenerator)
```

---

## 🏆 Başarı Metrikleri

Uygulama tamamlandığında:

1. **Hızlı Mod Kullanım Oranı**: İnfografik aktivitelerin %40+'ı offline modda üretilebilmeli
2. **Öğretmen Memnuniyeti**: Aktivite üretim süresi < 30 saniye (hızlı mod)
3. **Kategori Kapsamı**: 4 kategorinin tamamında en az 2 infografik aktivite türü
4. **pedagojicalNote Kalitesi**: Her çıktıda minimum 100 kelime pedagojik açıklama
5. **TypeScript Uyum**: `npm run build` sıfır hata
6. **Test Kapsamı**: 10 yeni generator fonksiyonu için 10+ test senaryosu

---

## 📎 Ek: Mevcut Kod ile Karşılaştırma

### Mevcut Akış (v1)

```
Kullanıcı → [Konu Yaz] → [AI ile Oluştur] → @antv/infographic syntax → Render
```

### Yeni Akış (v2)

```
Kullanıcı → [Kategori Seç] → [Aktivite Türü Seç] → [Mod Seç]
              ↓                      ↓                   ↓
       Görsel & Mekansal       5N1K Panosu          Hızlı Mod ─→ Offline Generator
       Okuduğunu Anlama        Hece Haritası    veya
       Okuma & Dil             Adım Çözüm           AI Mod    ─→ generateWithSchema()
       Matematik & Mantık      Kavram Haritası           ↓
                                                   InfographicActivityResult
                                                          ↓
                                                   NativeInfographicRenderer
                                                   + QuestionCards + PedagogyPanel
                                                          ↓
                                                   SVG / A4Editor / Worksheet Export
```

---

*Bu plan, 4 lider uzman ajan (Elif Yıldız, Dr. Ahmet Kaya, Bora Demir, Selin Arslan) ile visual-storyteller-oozel ve ai-vision-engineer-oozel destek ajanlarının kapsamlı değerlendirmesiyle hazırlanmıştır. Uygulama başlamadan önce her fazın uzman ajan onayı alınmalıdır.*

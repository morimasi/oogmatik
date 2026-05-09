# 🤖 OTONOM ETKİNLİK OLUŞTURMA SİSTEMİ (Activity Scaffold Engine v1.0)

> **Proje**: Oogmatik EdTech Platformu  
> **Tarih**: 2026-05-09  
> **Durum**: 🔴 PLAN AŞAMASI — Geliştirme Onayı Bekleniyor  
> **Hedef**: Tek bir Blueprint tanımından 14 dosya/lokasyonda otonom değişiklik yaparak yeni bir etkinliği eksiksiz, test edilmiş ve menüye entegre şekilde üreten sistem.

---

## 📋 İÇİNDEKİLER

1. [Problem Tanımı](#1-problem-tanımı)
2. [Mimari Analiz — Mevcut Entegrasyon Haritası](#2-mimari-analiz)
3. [Çözüm Mimarisi — Scaffold Engine](#3-çözüm-mimarisi)
4. [Blueprint Şeması (Tek Kaynak)](#4-blueprint-şeması)
5. [Dosya Üretim Kataloğu (14 Nokta)](#5-dosya-üretim-kataloğu)
6. [CLI Modülü Tasarımı](#6-cli-modülü)
7. [Admin UI Modülü Tasarımı](#7-admin-ui-modülü)
8. [Template Engine (Şablon Motoru)](#8-template-engine)
9. [Doğrulama Katmanı (Validator)](#9-doğrulama-katmanı)
10. [Rollback Mekanizması](#10-rollback-mekanizması)
11. [Uygulama Fazları ve Görev Listesi](#11-uygulama-fazları)
12. [Dosya Ağacı (Yeni Dosyalar)](#12-dosya-ağacı)
13. [Kararlar ve Kısıtlar](#13-kararlar)
14. [Risk Analizi](#14-risk-analizi)

---

## 1. PROBLEM TANIMI

### Şu Anki Durum
Oogmatik platformuna yeni bir etkinlik eklemek için **14 ayrı dosya/lokasyonda** manuel değişiklik yapılması gerekiyor. Bu süreç:
- ⏱️ **Zaman kaybı**: Her etkinlik için 2-4 saat geliştirme
- 🐛 **Hata riski**: Import eksiklikleri, registry kayıtlarının unutulması, tip uyumsuzlukları
- 🔗 **Bağımlılık zinciri**: Bir dosyadaki eksiklik tüm sistemi kırar
- 📚 **Bilgi gereksinimi**: 14 dosyanın yapısını bilmek zorunda olma

### Hedef Durum
Tek bir **Activity Blueprint** tanımından:
1. ✅ Tüm dosyalar **otonom** olarak üretilsin
2. ✅ Tüm import/export bağlantıları **eksiksiz** kurulsun
3. ✅ Menüye **otomatik** eklensin
4. ✅ Hem Hızlı Mod hem AI Mod **çalışır** durumda olsun
5. ✅ A4 yazdırma çıktısı **premium** kalitede olsun
6. ✅ Config paneli **tam fonksiyonel** olsun
7. ✅ TypeScript build **hatasız** geçsin
8. ✅ Hem **CLI** hem **Admin UI** ile tetiklenebilsin
9. ✅ Hem **geliştiriciler** hem **admin kullanıcılar** kullanabilsin

---

## 2. MİMARİ ANALİZ

### 2.1 Entegrasyon Noktaları Haritası

Bir etkinliğin sisteme tam entegrasyonu 14 noktadan geçer:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ETKİNLİK ENTEGRASYON HARİTASI                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  📦 TİP SİSTEMİ (2 nokta)                                         │
│  ├── [1] types/activity.ts → ActivityType enum'a ekleme            │
│  └── [2] types/math.ts veya types/verbal.ts → Data interface       │
│                                                                     │
│  ⚙️ GENERATOR SİSTEMİ (4 nokta)                                   │
│  ├── [3] services/offlineGenerators/{name}.ts → YENI DOSYA         │
│  ├── [4] services/offlineGenerators/index.ts → export ekleme       │
│  ├── [5] services/generators/{name}.ts → YENI DOSYA                │
│  └── [6] services/generators/index.ts → export ekleme              │
│                                                                     │
│  📋 REGISTRY SİSTEMİ (2 nokta)                                    │
│  ├── [7] services/generators/registry.ts → AI+Offline eşleme      │
│  └── [8] registry.ts → defaultOptions + clinicalPriorities         │
│                                                                     │
│  🎨 UI SİSTEMİ (4 nokta)                                          │
│  ├── [9]  components/sheets/{cat}/{Name}Sheet.tsx → YENI DOSYA     │
│  ├── [10] components/SheetRenderer.tsx → routing case              │
│  ├── [11] components/activity-configs/{Name}Config.tsx → YENI DOSYA│
│  └── [12] components/activity-configs/index.ts → registry kaydı    │
│                                                                     │
│  📂 MENÜ SİSTEMİ (2 nokta)                                        │
│  ├── [13] constants.ts → ACTIVITIES[] dizisi                       │
│  └── [14] constants.ts → ACTIVITY_CATEGORIES[] kategori ekleme     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Dosya Boyut ve Karmaşıklık Analizi

| Dosya | Satır | Boyut | Risk | Ekleme Stratejisi |
|-------|-------|-------|------|-------------------|
| `types/activity.ts` | 333 | 14KB | 🟢 Düşük | Enum sonuna ekleme |
| `constants.ts` | 520 | 19KB | 🟡 Orta | Dizi sonuna + kategori içine ekleme |
| `offlineGenerators/index.ts` | 45 | 1.6KB | 🟢 Düşük | Satır sonuna `export *` ekleme |
| `generators/index.ts` | 41 | 1.4KB | 🟢 Düşük | Satır sonuna `export *` ekleme |
| `generators/registry.ts` | 533 | 21KB | 🟡 Orta | Spread öncesine yeni kayıt ekleme |
| `SheetRenderer.tsx` | 1875 | 74KB | 🔴 Yüksek | switch/case veya if-bloğu ekleme |
| `activity-configs/index.ts` | 102 | 6KB | 🟡 Orta | Import + Registry kaydı |
| `registry.ts` | 209 | 7KB | 🟡 Orta | switch case + CLINICAL_PRIORITIES |

### 2.3 Mevcut Kod Paternleri (Referans)

**Offline Generator Paterni** (boxMath.ts referans):
```typescript
import { BoxMathData, BoxMathProblem, GeneratorOptions } from '../../types';
import { getRandomInt } from './helpers';

export const generateOffline{Name} = async (options: GeneratorOptions): Promise<{Name}Data[]> => {
  const { worksheetCount = 1, difficulty = 'Orta', itemCount = 10 } = options;
  const pages: {Name}Data[] = [];
  // ... üretim mantığı
  return pages;
};
```

**AI Generator Paterni** (boxMath.ts referans):
```typescript
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';

export const generate{Name}FromAI = async (options: GeneratorOptions) => {
  const prompt = `[ROL: ...] GÖREV: ... ZORLUK: ${options.difficulty}`;
  const schema = { type: 'OBJECT', properties: {...}, required: [...] };
  return await generateWithSchema(prompt, schema);
};
```

**Sheet Renderer Paterni** (BoxMathSheet.tsx referans):
```tsx
import React from 'react';
import { {Name}Data } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText, EditableElement } from '../../Editable';

export const {Name}Sheet: React.FC<{ data: {Name}Data }> = ({ data }) => {
  return (
    <div className="flex flex-col bg-white p-2 text-black font-lexend overflow-visible min-h-[1123px]">
      <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
      {/* İçerik */}
    </div>
  );
};
```

**Config Panel Paterni** (BoxMathConfig.tsx referans):
```tsx
import React from 'react';
import { GeneratorOptions } from '../../types';

interface Props {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const {Name}Config: React.FC<Props> = ({ options, onChange }) => {
  return <div className="space-y-6">...</div>;
};
```

---

## 3. ÇÖZÜM MİMARİSİ

### 3.1 Sistem Mimarisi Diyagramı

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        SCAFFOLD ENGINE v1.0                              │
│                                                                          │
│  ┌─────────────┐    ┌─────────────────┐    ┌──────────────────────────┐ │
│  │  CLI Modülü  │    │  Admin UI Modülü │    │  Blueprint JSON/TS      │ │
│  │  (Terminal)  │───▶│  (Tarayıcı)     │───▶│  (Tek Kaynak)           │ │
│  └──────┬──────┘    └────────┬────────┘    └────────────┬─────────────┘ │
│         │                    │                           │               │
│         └────────────────────┴───────────────────────────┘               │
│                              │                                           │
│                    ┌─────────▼──────────┐                                │
│                    │  Blueprint Parser  │                                │
│                    │  (Şema Doğrulama)  │                                │
│                    └─────────┬──────────┘                                │
│                              │                                           │
│                    ┌─────────▼──────────┐                                │
│                    │  Template Engine   │                                │
│                    │  (Kod Üretimi)     │                                │
│                    └─────────┬──────────┘                                │
│                              │                                           │
│              ┌───────────────┼───────────────┐                           │
│              │               │               │                           │
│     ┌────────▼────┐  ┌──────▼──────┐  ┌─────▼──────┐                   │
│     │ File Writer │  │ File Patcher│  │ Validator  │                    │
│     │ (Yeni Dosya)│  │ (Mevcut     │  │ (Doğrulama)│                    │
│     │             │  │  Dosyaları  │  │            │                    │
│     │ 5 dosya üret│  │  Güncelle)  │  │ 8 kontrol │                    │
│     └─────────────┘  └─────────────┘  └────────────┘                    │
│                              │                                           │
│                    ┌─────────▼──────────┐                                │
│                    │  Build Test        │                                │
│                    │  (npm run build)   │                                │
│                    └─────────┬──────────┘                                │
│                              │                                           │
│              ┌───────────────┼───────────────┐                           │
│              │               │               │                           │
│        ┌─────▼────┐   ┌─────▼────┐   ┌──────▼────┐                     │
│        │ ✅ Başarı │   │ ❌ Hata  │   │ ↩️ Rollback│                     │
│        │ Etkinlik  │   │ Raporu   │   │ (Geri al) │                     │
│        │ Hazır!    │   │          │   │           │                     │
│        └──────────┘   └──────────┘   └───────────┘                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Modüler Yapı

```
src/tools/scaffold/
├── engine/
│   ├── ActivityScaffoldEngine.ts      ← Ana orkestratör
│   ├── BlueprintParser.ts             ← Blueprint doğrulama + parse
│   ├── FileWriter.ts                  ← Yeni dosya yazımı
│   ├── FilePatcher.ts                 ← Mevcut dosya güncelleme (AST-safe)
│   ├── ActivityValidator.ts           ← Post-scaffold doğrulama
│   └── RollbackManager.ts            ← Hata durumunda geri alma
│
├── templates/
│   ├── offlineGenerator.template.ts   ← Offline generator şablonu
│   ├── aiGenerator.template.ts        ← AI generator şablonu
│   ├── sheetRenderer.template.tsx     ← Sheet renderer şablonu
│   ├── configPanel.template.tsx       ← Config panel şablonu
│   └── dataType.template.ts           ← Data interface şablonu
│
├── blueprints/
│   ├── _example.blueprint.json        ← Örnek blueprint
│   └── _schema.json                   ← Blueprint JSON şeması
│
├── cli/
│   └── scaffoldCLI.ts                 ← Terminal CLI aracı
│
└── ui/
    └── AdminScaffoldPanel.tsx          ← Admin UI bileşeni
```

---

## 4. BLUEPRINT ŞEMASI

Blueprint, yeni bir etkinliğin **tek ve tam tanımıdır**. Tüm 14 nokta bu tek dosyadan türetilir.

```typescript
// src/tools/scaffold/engine/BlueprintParser.ts

export interface ActivityBlueprint {
  // ═══════════════════════════════════════════════
  // BÖLÜM 1: KİMLİK (Identity)
  // ═══════════════════════════════════════════════
  
  /** Enum anahtarı — BÜYÜK_HARF_SNAKE_CASE (Ör: 'LETTER_MAZE') */
  enumKey: string;
  
  /** Türkçe başlık (Ör: 'Harf Labirenti') */
  title: string;
  
  /** Türkçe açıklama — 1-2 cümle (Ör: 'Harfler arasında doğru yolu bulma bulmacası.') */
  description: string;
  
  /** FontAwesome 6 ikon sınıfı (Ör: 'fa-solid fa-route') */
  icon: string;

  // ═══════════════════════════════════════════════
  // BÖLÜM 2: KATEGORİ (Categorization)
  // ═══════════════════════════════════════════════
  
  /** Mevcut kategori ID'si: 
   *  'visual-perception' | 'reading-comprehension' | 'reading-verbal' | 
   *  'math-logic' | 'social-history' | 'spld-premium' */
  categoryId: string;
  
  /** Sheet dosyasının konulacağı alt klasör: 'math' | 'verbal' | 'visual' | 'logic' | 'attention' */
  sheetCategory: 'math' | 'verbal' | 'visual' | 'logic' | 'attention';

  /** Varsayılan sütun sayısı (1 veya 2) */
  defaultColumns: 1 | 2;

  // ═══════════════════════════════════════════════
  // BÖLÜM 3: VERİ MODELİ (Data Model)
  // ═══════════════════════════════════════════════
  
  /** Ana veri arayüzü tanımı */
  dataInterface: {
    /** Interface adı — PascalCase + "Data" soneki (Ör: 'LetterMazeData') */
    name: string;
    
    /** Alanlar */
    fields: Array<{
      name: string;
      type: string;       // 'string' | 'number' | 'boolean' | 'string[]' | custom
      required: boolean;
      description: string;
    }>;
  };
  
  /** Tekrarlanan öğe arayüzü (opsiyonel — items/problems dizisi için) */
  itemInterface?: {
    /** Interface adı — PascalCase + "Item" soneki (Ör: 'LetterMazeItem') */
    name: string;
    
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
  };

  // ═══════════════════════════════════════════════
  // BÖLÜM 4: OFFLINE GENERATOR (Hızlı Mod)
  // ═══════════════════════════════════════════════
  
  offlineGenerator: {
    /** Export fonksiyon adı (Ör: 'generateOfflineLetterMaze') */
    functionName: string;
    
    /** Dosya adı (uzantısız) (Ör: 'letterMaze') */
    fileName: string;
    
    /** Zorluk seviyelerine göre parametre aralıkları */
    difficultyConfig: {
      'Başlangıç': Record<string, unknown>;
      'Orta': Record<string, unknown>;
      'Zor': Record<string, unknown>;
      'Uzman': Record<string, unknown>;
    };
    
    /** Üretim algoritmasının Türkçe açıklaması (AI ajanlar için) */
    algorithmDescription: string;
    
    /** Kullanılacak yardımcı fonksiyonlar (helpers.ts'den) */
    helperImports: string[];  // Ör: ['getRandomInt', 'shuffleArray', 'pickRandom']
  };

  // ═══════════════════════════════════════════════
  // BÖLÜM 5: AI GENERATOR (Derin AI Modu)
  // ═══════════════════════════════════════════════
  
  aiGenerator: {
    /** Export fonksiyon adı (Ör: 'generateLetterMazeFromAI') */
    functionName: string;
    
    /** Dosya adı (uzantısız) (Ör: 'letterMaze') */
    fileName: string;
    
    /** AI Prompt şablonu */
    prompt: {
      /** Rol tanımı (Ör: 'TÜRKÇE DİL UZMANI VE ÖZEL EĞİTİM UZMANI') */
      role: string;
      
      /** Görev açıklaması (değişkenler ${difficulty}, ${itemCount} vb. ile) */
      task: string;
      
      /** Kurallar listesi */
      rules: string[];
    };
    
    /** Gemini JSON Schema (generateWithSchema için) */
    outputSchema: {
      type: 'OBJECT';
      properties: Record<string, { type: string; description?: string }>;
      required: string[];
    };
  };

  // ═══════════════════════════════════════════════
  // BÖLÜM 6: A4 SHEET RENDERER (Görsel Çıktı)
  // ═══════════════════════════════════════════════
  
  sheetRenderer: {
    /** Bileşen adı — PascalCase + "Sheet" soneki (Ör: 'LetterMazeSheet') */
    componentName: string;
    
    /** Dosya adı (uzantısız) (Ör: 'LetterMazeSheet') */
    fileName: string;
    
    /** Render stratejisi */
    strategy: 'grid' | 'list' | 'table' | 'custom' | 'card-grid';
    
    /** Ayarlar */
    config: {
      /** PedagogicalHeader gösterilsin mi */
      showPedagogicalHeader: boolean;
      /** Alt bilgi gösterilsin mi */
      showFooter: boolean;
      /** Punto (font boyutu) tercihi seçeneği olsun mu */
      hasFontSizePreference: boolean;
      /** Öğe başına grid sütun sayısı (responsive) */
      gridColumns: number;
      /** Öğeler arası boşluk CSS sınıfı */
      gapClass: string;
    };
    
    /** Öğe render şablonu — Her bir item/problem nasıl görünecek */
    itemTemplate: {
      /** Ana metin alanı */
      primaryField: string;      // data'daki alan adı (Ör: 'expression')
      /** İkincil metin alanı (opsiyonel) */
      secondaryField?: string;
      /** Soru numarası gösterilsin mi */
      showIndex: boolean;
      /** Cevap alanı gösterilsin mi */
      showAnswerBox: boolean;
    };
  };

  // ═══════════════════════════════════════════════
  // BÖLÜM 7: CONFIG PANEL (Ayar Paneli)
  // ═══════════════════════════════════════════════
  
  configPanel: {
    /** Bileşen adı (Ör: 'LetterMazeConfig') */
    componentName: string;
    
    /** Dosya adı (Ör: 'LetterMazeConfig') */
    fileName: string;
    
    /** Ayar alanları */
    fields: Array<{
      /** GeneratorOptions key'i */
      optionKey: string;
      
      /** Gösterim etiketi (Türkçe) */
      label: string;
      
      /** Alan tipi */
      type: 'select' | 'range' | 'toggle' | 'button-group' | 'number';
      
      /** Seçenekler (select ve button-group için) */
      options?: Array<{
        id: string;
        label: string;
        icon?: string;
        description?: string;
      }>;
      
      /** min/max (range ve number için) */
      min?: number;
      max?: number;
      step?: number;
      
      /** Varsayılan değer */
      defaultValue: unknown;
    }>;
  };

  // ═══════════════════════════════════════════════
  // BÖLÜM 8: VARSAYILAN SEÇENEKLER (Registry)
  // ═══════════════════════════════════════════════
  
  defaultOptions: {
    mode: 'fast' | 'ai';
    itemCount: number;
    difficulty: string;
    /** Ek seçenekler (variant, gridSize vb.) */
    [key: string]: unknown;
  };

  // ═══════════════════════════════════════════════
  // BÖLÜM 9: PEDAGOJİK META VERİ
  // ═══════════════════════════════════════════════
  
  pedagogical: {
    /** Hedef beceriler */
    targetSkills: string[];
    
    /** Bilişsel hata etiketleri (CognitiveErrorTag tipinden) */
    cognitiveErrorTags: Array<
      'visual_discrimination' | 'attention_lapse' | 'impulsivity_error' |
      'phonological_substitution' | 'sequencing_error' | 'visual_reversal' |
      'visual_inversion' | 'working_memory_overflow' | 'logical_reasoning' |
      'visual_spatial_memory' | 'selective_attention' | 'processing_speed' |
      'phonological_loop'
    >;
    
    /** Uygun yaş grupları */
    ageGroups: Array<'5-7' | '8-10' | '11-13' | '14+'>;
    
    /** Uygun öğrenme profilleri */
    profiles: Array<'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed'>;
    
    /** Pedagojik not şablonu (pedagogicalNote için) */
    pedagogicalNoteTemplate: string;
  };
}
```

---

## 5. DOSYA ÜRETİM KATALOĞU (14 NOKTA)

Her noktanın tam olarak nasıl üretileceği:

### NOKTA 1: `types/activity.ts` — Enum Ekleme

```
KONUM: ActivityType enum'un son elemanından önce (SARI_KITAP_STUDIO öncesi)
YÖNTEM: Regex ile enum kapanış süslü parantezini bul, öncesine ekle
EKLENEN KOD:
  {blueprint.enumKey} = '{blueprint.enumKey}',
DOĞRULAMA: Enum değeri benzersiz olmalı
```

### NOKTA 2: `types/` — Data Interface

```
KONUM: types/ klasörüne mevcut dosyaya (math.ts / verbal.ts) veya yeni dosyaya
YÖNTEM: Yeni export interface bloğu ekle
EKLENEN KOD:
  export interface {Name}Data { ... }
  export interface {Name}Item { ... }  // opsiyonel
DOĞRULAMA: Interface adı benzersiz, tüm alanlar typed
```

### NOKTA 3: `services/offlineGenerators/{name}.ts` — YENİ DOSYA

```
KONUM: services/offlineGenerators/{blueprint.offlineGenerator.fileName}.ts
YÖNTEM: Template'den üretim — offlineGenerator.template.ts
İÇERİK: Tam çalışan offline generator fonksiyonu
  - Difficulty scaling
  - worksheetCount döngüsü
  - itemCount döngüsü
  - title, instruction, pedagogicalNote alanları
DOĞRULAMA: Fonksiyon imzası GeneratorOptions → Promise<{Name}Data[]>
```

### NOKTA 4: `services/offlineGenerators/index.ts` — Export

```
KONUM: Dosya sonuna yeni satır
YÖNTEM: Append
EKLENEN KOD:
  export * from './{blueprint.offlineGenerator.fileName}';
DOĞRULAMA: Duplicate export kontrolü
```

### NOKTA 5: `services/generators/{name}.ts` — YENİ DOSYA

```
KONUM: services/generators/{blueprint.aiGenerator.fileName}.ts
YÖNTEM: Template'den üretim — aiGenerator.template.ts
İÇERİK:
  - import { generateWithSchema } from '../geminiClient.js';
  - Prompt + Schema tanımı
  - generateWithSchema çağrısı
DOĞRULAMA: Schema yapısı blueprint.aiGenerator.outputSchema ile uyumlu
```

### NOKTA 6: `services/generators/index.ts` — Export

```
KONUM: Dosya sonuna yeni satır
YÖNTEM: Append
EKLENEN KOD:
  export * from './{blueprint.aiGenerator.fileName}';
DOĞRULAMA: Duplicate export kontrolü
```

### NOKTA 7: `services/generators/registry.ts` — Generator Eşleme

```
KONUM: INFOGRAPHIC_ADAPTERS spread'inden ÖNCE (satır ~479)
YÖNTEM: Regex ile "// ── INFOGRAPHIC ADAPTERS" yorumunu bul, öncesine ekle
EKLENEN KOD:
  [ActivityType.{ENUM_KEY}]: {
    ai: aiGenerators.{aiFunctionName},
    offline: offlineGenerators.{offlineFunctionName},
  },
DOĞRULAMA: Fonksiyon adları import'larda mevcut
```

### NOKTA 8: `registry.ts` — Default Options + Clinical

```
KONUM-A: CLINICAL_PRIORITIES objesine yeni kayıt
KONUM-B: getDefaultOptionsForActivity switch/case'e yeni case
YÖNTEM: Regex ile uygun pozisyonu bul, ekle
EKLENEN KOD-A:
  [ActivityType.{ENUM_KEY}]: [{cognitiveErrorTags}],
EKLENEN KOD-B:
  case ActivityType.{ENUM_KEY}:
    return { ...base, ...{defaultOptions} };
DOĞRULAMA: Default options GeneratorOptions tipine uygun
```

### NOKTA 9: `components/sheets/{cat}/{Name}Sheet.tsx` — YENİ DOSYA

```
KONUM: components/sheets/{sheetCategory}/{componentName}.tsx
YÖNTEM: Template'den üretim — sheetRenderer.template.tsx
İÇERİK:
  - PedagogicalHeader
  - Grid/List/Table yapısı
  - EditableText/EditableElement
  - Premium CSS sınıfları (Lexend font, rounded-2xl, shadow-sm vb.)
  - min-h-[1123px] (A4 yüksekliği)
  - Soru numarası badge'leri
  - Cevap alanları
DOĞRULAMA: TSX yapısı valid, data prop'u doğru tipte
```

### NOKTA 10: `components/SheetRenderer.tsx` — Routing

```
KONUM: switch (activityType) bloğunun default'undan ÖNCE (~satır 1395+)
YÖNTEM: Regex ile "default:" satırını bul, öncesine case ekle
EKLENEN KOD:
  case ActivityType.{ENUM_KEY}:
    renderedSheet = <{ComponentName}Sheet data={data as any} />;
    break;
EKLENEN IMPORT:
  import { {ComponentName}Sheet } from './sheets/{cat}/{ComponentName}Sheet';
DOĞRULAMA: Import yolu doğru, bileşen adı eşleşiyor
```

### NOKTA 11: `components/activity-configs/{Name}Config.tsx` — YENİ DOSYA

```
KONUM: components/activity-configs/{configFileName}.tsx
YÖNTEM: Template'den üretim — configPanel.template.tsx
İÇERİK:
  - Zorluk seçici
  - Öğe sayısı slider/input
  - Etkinliğe özel ayarlar (blueprint.configPanel.fields)
  - Premium UI (rounded-2xl, indigo vurgular, uppercase etiketler)
DOĞRULAMA: Props { options: GeneratorOptions, onChange: fn } uyumlu
```

### NOKTA 12: `components/activity-configs/index.ts` — Config Registry

```
KONUM-A: Import bölümüne yeni import satırı
KONUM-B: ActivityConfigRegistry objesine yeni kayıt
YÖNTEM: Regex ile uygun pozisyonları bul, ekle
EKLENEN KOD-A:
  import { {ConfigName} } from './{ConfigFileName}';
EKLENEN KOD-B:
  [ActivityType.{ENUM_KEY}]: {ConfigName},
DOĞRULAMA: Import yolu doğru, kayıt enum değeri ile eşleşiyor
```

### NOKTA 13: `constants.ts` — ACTIVITIES Dizisi

```
KONUM: ACTIVITIES dizisinin son elemanından sonra ("];" öncesi)
YÖNTEM: Regex ile dizinin kapanışını bul, öncesine ekle
EKLENEN KOD:
  {
    id: ActivityType.{ENUM_KEY},
    title: '{title}',
    description: '{description}',
    icon: '{icon}',
    defaultStyle: { columns: {defaultColumns} },
  },
DOĞRULAMA: ID benzersiz, icon FontAwesome 6 formatında
```

### NOKTA 14: `constants.ts` — ACTIVITY_CATEGORIES

```
KONUM: İlgili kategori objesindeki activities dizisine
YÖNTEM: Regex ile categoryId'yi bul, activities dizisine ekle
EKLENEN KOD:
  ActivityType.{ENUM_KEY},
DOĞRULAMA: Kategori ID'si mevcut kategorilerden biri
```

---

## 6. CLI MODÜLÜ

### 6.1 Kullanım

```bash
# Blueprint dosyasından etkinlik oluştur
npx ts-node src/tools/scaffold/cli/scaffoldCLI.ts create --blueprint ./blueprint.json

# Mevcut etkinliği sil (rollback)  
npx ts-node src/tools/scaffold/cli/scaffoldCLI.ts remove --activity LETTER_MAZE

# Tüm entegrasyon noktalarını doğrula
npx ts-node src/tools/scaffold/cli/scaffoldCLI.ts validate --activity LETTER_MAZE

# Blueprint şablonu oluştur
npx ts-node src/tools/scaffold/cli/scaffoldCLI.ts init --name "Harf Labirenti"

# Mevcut bir etkinlikten blueprint çıkar (reverse engineer)
npx ts-node src/tools/scaffold/cli/scaffoldCLI.ts extract --activity BOX_MATH
```

### 6.2 CLI Çıktı Formatı

```
╔══════════════════════════════════════════════════╗
║   🏗️  OOGMATIK SCAFFOLD ENGINE v1.0              ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  📋 Blueprint: letter_maze.blueprint.json        ║
║  🏷️  Etkinlik: Harf Labirenti (LETTER_MAZE)      ║
║  📂 Kategori: reading-verbal                     ║
║                                                  ║
║  ── DOSYA ÜRETİMİ ──────────────────────────── ║
║  ✅ [1/14] types/activity.ts — enum eklendi      ║
║  ✅ [2/14] types/verbal.ts — interface eklendi   ║
║  ✅ [3/14] offlineGenerators/letterMaze.ts       ║
║  ✅ [4/14] offlineGenerators/index.ts — export   ║
║  ✅ [5/14] generators/letterMaze.ts              ║
║  ✅ [6/14] generators/index.ts — export          ║
║  ✅ [7/14] generators/registry.ts — kayıt        ║
║  ✅ [8/14] registry.ts — defaults + clinical     ║
║  ✅ [9/14] sheets/verbal/LetterMazeSheet.tsx     ║
║  ✅ [10/14] SheetRenderer.tsx — routing           ║
║  ✅ [11/14] activity-configs/LetterMazeConfig.tsx ║
║  ✅ [12/14] activity-configs/index.ts — registry  ║
║  ✅ [13/14] constants.ts — ACTIVITIES            ║
║  ✅ [14/14] constants.ts — CATEGORIES            ║
║                                                  ║
║  ── DOĞRULAMA ──────────────────────────────── ║
║  ✅ TypeScript strict uyumlu                     ║
║  ✅ Import/export tutarlı                        ║
║  ✅ pedagogicalNote mevcut                       ║
║  ✅ any tipi yok                                 ║
║  ✅ Lexend font korunuyor                        ║
║  ✅ Build başarılı (npm run build)               ║
║                                                  ║
║  🎉 ETKİNLİK BAŞARIYLA OLUŞTURULDU!             ║
╚══════════════════════════════════════════════════╝
```

---

## 7. ADMIN UI MODÜLÜ

### 7.1 Konum ve Erişim

- **Konum**: `AdminDashboardV2.tsx` içinde yeni bir sekme olarak
- **Erişim**: Admin kullanıcılar → Admin Panel → "Etkinlik Fabrikası" sekmesi
- **UI Standardı**: Dark Glassmorphism (mevcut admin UI ile uyumlu)

### 7.2 Arayüz Bileşenleri

```
┌────────────────────────────────────────────────────────────────┐
│  🏭 ETKİNLİK FABRİKASI                                [×]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ 1. Kimlik │ │ 2. Veri  │ │ 3. Motor │ │ 4. Görsel│         │
│  │          │ │ Modeli   │ │ (AI/Hızlı)│ │ (Render) │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ADIM 1: KİMLİK BİLGİLERİ                              │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  Enum Anahtarı: [_LETTER_MAZE_____________]             │  │
│  │  Türkçe Başlık: [_Harf Labirenti__________]             │  │
│  │  Açıklama:      [_Harfler arasında yol bulma_]          │  │
│  │  İkon:          [fa-solid fa-route      ] 🔍            │  │
│  │  Kategori:      [reading-verbal         ▼]              │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────┐  ┌────────────────┐  ┌──────────────────┐       │
│  │Blueprint│  │ 🔍 Doğrula    │  │ 🚀 Oluştur      │       │
│  │ İndir   │  │               │  │                  │       │
│  └─────────┘  └────────────────┘  └──────────────────┘       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 7.3 Admin UI Akışı

```
1. Wizard Adım 1: Kimlik → Enum, başlık, açıklama, ikon, kategori
2. Wizard Adım 2: Veri Modeli → Interface alanları (görsel form builder)
3. Wizard Adım 3: Motor → AI prompt, offline algoritma açıklaması
4. Wizard Adım 4: Görsel → Render stratejisi, config panel alanları
5. Önizleme → Blueprint JSON görüntüleme
6. Doğrulama → Şema kontrolü
7. Oluştur → Scaffold Engine tetiklenir
8. Sonuç → Başarı/hata raporu
```

---

## 8. TEMPLATE ENGINE

### 8.1 Yaklaşım

String interpolation tabanlı, bağımlılıksız bir template sistemi. Placeholder'lar `{{variable}}` formatında.

### 8.2 Template Değişkenleri

| Değişken | Kaynak | Örnek Değer |
|----------|--------|-------------|
| `{{ENUM_KEY}}` | blueprint.enumKey | `LETTER_MAZE` |
| `{{PascalName}}` | enumKey'den türetme | `LetterMaze` |
| `{{camelName}}` | enumKey'den türetme | `letterMaze` |
| `{{title}}` | blueprint.title | `Harf Labirenti` |
| `{{description}}` | blueprint.description | `Harfler arasında...` |
| `{{icon}}` | blueprint.icon | `fa-solid fa-route` |
| `{{DataInterface}}` | blueprint.dataInterface.name | `LetterMazeData` |
| `{{ItemInterface}}` | blueprint.itemInterface?.name | `LetterMazeItem` |
| `{{offlineFunctionName}}` | blueprint.offlineGenerator.functionName | `generateOfflineLetterMaze` |
| `{{aiFunctionName}}` | blueprint.aiGenerator.functionName | `generateLetterMazeFromAI` |
| `{{SheetComponent}}` | blueprint.sheetRenderer.componentName | `LetterMazeSheet` |
| `{{ConfigComponent}}` | blueprint.configPanel.componentName | `LetterMazeConfig` |
| `{{categoryId}}` | blueprint.categoryId | `reading-verbal` |
| `{{sheetCategory}}` | blueprint.sheetCategory | `verbal` |
| `{{columns}}` | blueprint.defaultColumns | `1` |
| `{{gridColumns}}` | sheetRenderer.config.gridColumns | `2` |
| `{{role}}` | aiGenerator.prompt.role | `TÜRKÇE DİL UZMANI` |
| `{{task}}` | aiGenerator.prompt.task | `Harf labirenti üret...` |
| `{{rules}}` | aiGenerator.prompt.rules | `1. ...\n2. ...` |
| `{{schema}}` | JSON.stringify(aiGenerator.outputSchema) | `{...}` |
| `{{difficultyConfig}}` | JSON.stringify(offlineGenerator.difficultyConfig) | `{...}` |

---

## 9. DOĞRULAMA KATMANI

### 9.1 Pre-Scaffold Doğrulama (Blueprint)

| # | Kontrol | Hata Mesajı |
|---|---------|-------------|
| 1 | `enumKey` format (BÜYÜK_HARF) | "Enum key UPPER_SNAKE_CASE olmalı" |
| 2 | `enumKey` benzersizlik | "Bu enum key zaten activity.ts'de mevcut" |
| 3 | `categoryId` geçerlilik | "Kategori bulunamadı: {id}" |
| 4 | `icon` format (fa-) | "İkon 'fa-' ile başlamalı" |
| 5 | `dataInterface.name` format (PascalCase + Data) | "Interface adı PascalCase ve 'Data' soneki olmalı" |
| 6 | Fonksiyon adları benzersizlik | "Bu fonksiyon adı zaten mevcut" |
| 7 | `pedagogicalNoteTemplate` boş değil | "Pedagojik not şablonu zorunlu" |
| 8 | `cognitiveErrorTags` en az 1 | "En az 1 bilişsel hata etiketi gerekli" |

### 9.2 Post-Scaffold Doğrulama (Üretilen Kod)

| # | Kontrol | Yöntem |
|---|---------|--------|
| 1 | TypeScript strict uyum | `tsc --noEmit` çalıştır |
| 2 | Import/export tutarlılık | Her yeni export'un ilgili index.ts'de olduğunu doğrula |
| 3 | Registry tutarlılık | enum → registry → config eşleşmesini kontrol et |
| 4 | `any` tipi kontrolü | Üretilen dosyalarda `any` tarama |
| 5 | `pedagogicalNote` varlığı | Offline generator çıktısında alan kontrolü |
| 6 | `Lexend` font referansı | Sheet renderer'da font-lexend sınıfı kontrolü |
| 7 | Build testi | `npm run build` hatasız geçmeli |
| 8 | Dosya boyutu kontrolü | Üretilen dosyalar > 0 byte |

---

## 10. ROLLBACK MEKANİZMASI

### 10.1 Strateji

Her scaffold operasyonundan ÖNCE:
1. Değiştirilecek dosyaların snapshot'ını al (`.scaffold-backup/` dizinine)
2. Yeni oluşturulan dosyaların listesini kaydet
3. Build başarısız olursa → otomatik rollback

### 10.2 Rollback Akışı

```
1. .scaffold-backup/{timestamp}/ dizini oluştur
2. Değiştirilecek 9 dosyanın kopyasını al
3. scaffold işlemini çalıştır
4. doğrulama çalıştır
   ├── ✅ Başarılı → backup'ı sil
   └── ❌ Başarısız → 
       ├── Yeni dosyaları (5 adet) sil
       ├── Backup'tan orijinal dosyaları geri yükle
       └── Hata raporu oluştur
```

### 10.3 Manuel Rollback Komutu

```bash
npx ts-node src/tools/scaffold/cli/scaffoldCLI.ts remove --activity LETTER_MAZE
```

---

## 11. UYGULAMA FAZLARI

### FAZ 1: Temel Altyapı (Çekirdek Motor)
- [ ] `BlueprintParser.ts` — Blueprint şema doğrulama
- [ ] `ActivityScaffoldEngine.ts` — Ana orkestratör sınıfı
- [ ] `FileWriter.ts` — Yeni dosya yazma servisi
- [ ] `FilePatcher.ts` — Mevcut dosyaları güncelleme servisi (regex-safe)
- [ ] `RollbackManager.ts` — Snapshot + geri yükleme

### FAZ 2: Template Sistemi
- [ ] `offlineGenerator.template.ts` — Offline generator şablonu
- [ ] `aiGenerator.template.ts` — AI generator şablonu
- [ ] `sheetRenderer.template.tsx` — Sheet renderer şablonu
- [ ] `configPanel.template.tsx` — Config panel şablonu
- [ ] `dataType.template.ts` — Data interface şablonu

### FAZ 3: CLI Modülü
- [ ] `scaffoldCLI.ts` — Komut satırı arayüzü
- [ ] `create` komutu — Blueprint'ten etkinlik oluşturma
- [ ] `remove` komutu — Etkinlik silme (rollback)
- [ ] `validate` komutu — Tekil etkinlik doğrulama
- [ ] `init` komutu — Boş blueprint şablonu oluşturma

### FAZ 4: Admin UI Modülü
- [ ] `AdminScaffoldPanel.tsx` — Wizard UI bileşeni
- [ ] Blueprint form builder (4 adımlı wizard)
- [ ] Gerçek zamanlı doğrulama
- [ ] Sonuç/hata raporu görünümü
- [ ] AdminDashboardV2'ye sekme entegrasyonu

### FAZ 5: Doğrulama ve Test
- [ ] `ActivityValidator.ts` — Post-scaffold doğrulama
- [ ] Örnek blueprint oluştur (`_example.blueprint.json`)
- [ ] Blueprint JSON şeması oluştur (`_schema.json`)
- [ ] CLI ile uçtan uca test
- [ ] Admin UI ile uçtan uca test
- [ ] npm run build doğrulaması
- [ ] Hızlı Mod + AI Mod üretim testi
- [ ] Yazdırma önizleme testi

---

## 12. DOSYA AĞACI (Yeni Dosyalar)

```
src/tools/scaffold/
├── engine/
│   ├── ActivityScaffoldEngine.ts      [FAZ 1] Ana orkestratör
│   ├── BlueprintParser.ts             [FAZ 1] Blueprint doğrulama
│   ├── FileWriter.ts                  [FAZ 1] Dosya yazma
│   ├── FilePatcher.ts                 [FAZ 1] Dosya güncelleme
│   ├── RollbackManager.ts             [FAZ 1] Geri alma
│   └── ActivityValidator.ts           [FAZ 5] Doğrulama
│
├── templates/
│   ├── offlineGenerator.template.ts   [FAZ 2] Offline gen şablonu
│   ├── aiGenerator.template.ts        [FAZ 2] AI gen şablonu
│   ├── sheetRenderer.template.tsx     [FAZ 2] Sheet şablonu
│   ├── configPanel.template.tsx       [FAZ 2] Config şablonu
│   └── dataType.template.ts           [FAZ 2] Tip şablonu
│
├── blueprints/
│   ├── _example.blueprint.json        [FAZ 5] Örnek blueprint
│   └── _schema.json                   [FAZ 5] JSON şema
│
├── cli/
│   └── scaffoldCLI.ts                 [FAZ 3] CLI aracı
│
└── ui/
    └── AdminScaffoldPanel.tsx          [FAZ 4] Admin UI

Toplam: 14 yeni dosya
```

---

## 13. KARARLAR VE KISITLAR

### ✅ Kesinleşmiş Kararlar

| # | Karar | Değer | Gerekçe |
|---|-------|-------|---------|
| 1 | Tetikleme Yöntemi | CLI + Admin UI | Hem geliştirici hem admin erişimi |
| 2 | Kullanıcı Profili | Geliştirici + Admin | Her iki profil de kullanabilecek |
| 3 | Blueprint Formatı | JSON | Evrensel uyumluluk, UI form builder ile üretilebilirlik |
| 4 | Template Engine | String interpolation | Bağımlılıksız, TypeScript native |
| 5 | Doğrulama | Pre + Post scaffold | Hem giriş hem çıkış kontrolü |
| 6 | Rollback | Otomatik (build failure) + Manuel (CLI komutu) | Güvenlik katmanı |

### 🔒 Değiştirilemez Kısıtlar (Proje Kuralları)

| Kısıt | Değer |
|-------|-------|
| Font | Lexend (içerik) — **DEĞİŞTİRİLEMEZ** |
| AI Modeli | gemini-1.5-flash — **DEĞİŞTİRİLEMEZ** |
| `any` tipi | **YASAK** → `unknown` + type guard |
| `pedagogicalNote` | Her etkinlik çıktısında **ZORUNLU** |
| Tanı koyucu dil | **YASAK** |
| `console.log` | **YASAK** → `logError()` |
| AppError formatı | `{ success, error: { message, code }, timestamp }` |
| TypeScript | strict mode |

### 📌 Açık Noktalar (Sonra Karar Verilecek)

| # | Konu | Not |
|---|------|-----|
| 1 | İlk test etkinliği | Kullanıcı daha sonra belirleyecek |
| 2 | Hot-reload desteği | Statik dosya üretimi mi, dinamik yükleme mi? |
| 3 | Versiyon kontrolü | scaffold sonrası otomatik git commit? |

---

## 14. RİSK ANALİZİ

| Risk | Olasılık | Etki | Önlem |
|------|----------|------|-------|
| SheetRenderer.tsx (74KB) güncelleme hatası | 🟡 Orta | 🔴 Yüksek | Regex testi + rollback + backup |
| Template'den üretilen kodda syntax hatası | 🟡 Orta | 🟡 Orta | Post-scaffold tsc kontrolü |
| Duplicate enum/fonksiyon adı | 🟢 Düşük | 🟡 Orta | Pre-scaffold benzersizlik kontrolü |
| Import yolu hatası | 🟡 Orta | 🔴 Yüksek | Path resolution doğrulama |
| Admin UI'da form validation eksikliği | 🟢 Düşük | 🟢 Düşük | Blueprint şema doğrulaması |
| Üretilen etkinlik pedagojik olarak yetersiz | 🟡 Orta | 🟡 Orta | pedagogicalNote zorunluluğu + template kalitesi |

---

## 📊 ÖZET METRİKLER

| Metrik | Değer |
|--------|-------|
| Toplam yeni dosya | 14 |
| Toplam güncellenen dosya | 9 (14 noktada) |
| Uygulama fazı | 5 |
| Tahmini toplam geliştirme | ~2-3 gün |
| Blueprint alanı | 9 bölüm, ~40 alan |
| Doğrulama noktası | 8 pre + 8 post = 16 |
| Rollback kapsamı | 14 dosya (5 yeni + 9 güncellenen) |

---

> **SONRAKİ ADIM**: Bu planın onaylanmasının ardından FAZ 1'den başlanarak sıralı uygulama yapılacaktır.  
> **DURUM**: 🔴 Kullanıcı onayı bekleniyor.

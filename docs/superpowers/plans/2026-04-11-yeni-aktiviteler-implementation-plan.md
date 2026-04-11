# Yeni Aktiviteler Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 7 yeni aktivite (Gizemli Sayılar, Meyveli Toplama, Sayı Dedektifi, Kavram Haritası, Eş Anlamlı Kelimeler, 5N1K Panosu, Meyveli Toplama Bulmacası) için hem AI hem Offline modda çalışan, tam özelleştirilebilir modüler altyapı.

**Architecture:** Her aktivite için ayrı dosyalarda offline generator + Super Studio prompt + Sheet bileşeni + Config bileşeni. ActivityType ID'ler core.ts'e option tipleri olarak eklenir.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Vercel Serverless + Gemini 2.5 Flash + Vitest

---

## Ön Hazırlık: Type Tanımları

### Task 1: Type Tanımları Ekle (core.ts)

**Files:**

- Modify: `src/types/core.ts`
- Test: `tests/Types.test.ts` (varsa)

- [ ] **Step 1: Read core.ts mevcut yapıyı anla**

```bash
# Read src/types/core.ts - ActivityType enum ve GeneratorOptions interface
```

- [ ] **Step 2: Yeni ActivityType ID'leri ekle**

```typescript
// src/types/core.ts dosyasına eklenecek:
export type ActivityType =
  // ... mevcutlar ...
  | 'GIZEMLI_SAYILAR'
  | 'MEYVELI_TOPLAMA'
  | 'SAYI_DEDEKTIFI'
  | 'KAVRAM_HARITASI'
  | 'ES_ANLAMLI_KELIMELER'
  | 'FIVE_W_ONE_H';
```

- [ ] **Step 3: Option tiplerini ekle** (GeneratorOptions interface'e)

```typescript
// GeneratorOptions içine eklenecek:
gizemliSayilar?: {
  numberRange?: [number, number];
  clueCount?: number;
  operationTypes?: ('topla' | 'cikar' | 'carp' | 'bol')[];
  includeMultiStep?: boolean;
  includeModular?: boolean;
  includeDigitClue?: boolean;
  layoutStyle?: 'ipucu-liste' | 'matris' | 'kartezyen';
};

meyveliToplama?: {
  gridSize?: number;
  fruitTypes?: string[];
  maxSum?: number;
  maxFruitCount?: number;
  mode?: 'classic' | 'bulmaca' | 'savas';
  includeNegative?: boolean;
};

sayiDedektifi?: {
  mysteryNumber?: number;
  clueCount?: number;
  clueTypes?: ('greater' | 'less' | 'mod' | 'digit' | 'prime' | 'square')[];
  includeRangeClue?: boolean;
};

kavramHaritasi?: {
  concept?: string;
  depth?: number;
  branchCount?: number;
  fillRatio?: number;
  layout?: 'radial' | 'tree' | 'horizontal' | 'vertical';
  nodeStyle?: 'rounded' | 'sharp' | 'circle';
};

esAnlamliKelimeler?: {
  wordCount?: number;
  pairsPerRow?: number;
  includeAntonyms?: boolean;
  includeHomophones?: boolean;
  wordCategory?: 'all' | 'nouns' | 'verbs' | 'adjectives';
};

fiveWOneH?: {
  questionCount?: number;
  includeAllQuestions?: boolean;
  passageLength?: 'short' | 'medium' | 'long';
  includeMultipleChoice?: boolean;
};
```

- [ ] **Step 4: Data tiplerini ekle**

```typescript
// src/types/ altına eklenecek (yeni dosyalar veya mevcut dosyaya):
interface GizemliSayilarData {
  id: string;
  activityType: 'GIZEMLI_SAYILAR';
  title: string;
  instruction: string;
  pedagogicalNote: string;
  mysteryNumber: number;
  clues: { id: string; text: string; type: string }[];
  settings: GeneratorOptions['gizemliSayilar'];
}

interface MeyveliToplamaData {
  id: string;
  activityType: 'MEYVELI_TOPLAMA';
  title: string;
  instruction: string;
  pedagogicalNote: string;
  grid: { fruits: string[]; counts: number[][]; rowSum: number[] }[];
  targetSum: number;
  settings: GeneratorOptions['meyveliToplama'];
}
// ... diğerleri de benzer şekilde
```

- [ ] **Step 5: npm run test:run çalıştır**
- [ ] **Step 6: Commit**

---

## Aktivite 1: GİZEMLİ SAYILAR

### Task 2: Gizemli Sayılar Offline Generator

**Files:**

- Create: `src/services/offlineGenerators/gizemliSayilar.ts`
- Test: `tests/GizemliSayilar.test.ts`

- [ ] **Step 1: Offline generator dosyası oluştur**

```typescript
// src/services/offlineGenerators/gizemliSayilar.ts
import { GeneratorOptions } from '../../types';
import { GizemliSayilarData } from '../../types/core';
import { getRandomInt } from './helpers';

export const generateOfflineGizemliSayilar = async (
  options: GeneratorOptions
): Promise<GizemliSayilarData[]> => {
  const opts = options.gizemliSayilar || {};
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    numberRange = [1, 100],
    clueCount = 3,
    operationTypes = ['topla', 'cikar'],
    includeMultiStep = false,
    includeModular = false,
    includeDigitClue = true,
    layoutStyle = 'ipucu-liste',
  } = opts;

  const pages: GizemliSayilarData[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    const mysteryNumber = getRandomInt(numberRange[0], numberRange[1]);
    const clues = generateClues(mysteryNumber, {
      clueCount,
      operationTypes,
      includeDigitClue,
      difficulty,
    });

    pages.push({
      id: `gizemli_${Date.now()}_${i}`,
      activityType: 'GIZEMLI_SAYILAR',
      title: 'Gizemli Sayı: İpuçlarını Takip Et!',
      instruction: 'Aşağıdaki ipuçlarını oku ve gizemi sayıyı bul.',
      pedagogicalNote:
        'Bu etkinlik mantıksal çıkarım, sayı hissi ve çok adımlı düşünme becerisini geliştirir.',
      mysteryNumber,
      clues,
      settings: { difficulty, numberRange, clueCount, operationTypes, layoutStyle },
    });
  }

  return pages;
};

function generateClues(number: number, opts: any): { id: string; text: string; type: string }[] {
  const clues: { id: string; text: string; type: string }[] = [];

  // Range clue
  clues.push({
    id: 'c1',
    text: `Gizemli sayı ${Math.floor(number / 2)} ile ${number + 30} arasındadır`,
    type: 'range',
  });

  // Digit sum clue
  if (opts.includeDigitClue) {
    const digitSum = String(number)
      .split('')
      .reduce((a, b) => a + Number(b), 0);
    clues.push({
      id: 'c2',
      text: `Rakamları toplamı ${digitSum}'dır`,
      type: 'digit',
    });
  }

  // Parity clue
  clues.push({
    id: 'c3',
    text: number % 2 === 0 ? 'Çift bir sayıdır' : 'Tek bir sayıdır',
    type: 'parity',
  });

  return clues.slice(0, opts.clueCount);
}
```

- [ ] **Step 2: Register to index.ts**

```bash
# src/services/offlineGenerators/index.ts dosyasına ekle:
export { generateOfflineGizemliSayilar } from './gizemliSayilar';
```

- [ ] **Step 3: npm run test:run**
- [ ] **Step 4: Commit**

### Task 3: Gizemli Sayılar Sheet Bileşeni

**Files:**

- Create: `src/components/sheets/math/GizemliSayilarSheet.tsx`
- Modify: `src/components/SheetRenderer.tsx` (register)

- [ ] **Step 1: Sheet bileşeni oluştur**

```tsx
// src/components/sheets/math/GizemliSayilarSheet.tsx
import React from 'react';
import { GizemliSayilarData } from '../../../types/core';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';

export const GizemliSayilarSheet: React.FC<{ data: GizemliSayilarData }> = ({ data }) => {
  return (
    <div className="flex flex-col bg-white p-8 text-black font-lexend min-h-[1123px]">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      <div className="mt-8 space-y-4">
        {data.clues?.map((clue, idx) => (
          <div key={clue.id} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
              {idx + 1}
            </div>
            <EditableText value={clue.text} tag="p" className="text-lg font-medium" />
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-bold text-zinc-500 uppercase">Gizli Sayı</label>
          <div className="w-32 h-16 bg-white border-4 border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-3xl font-bold">
            ?
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: SheetRenderer.tsx'e kaydet**

```typescript
// src/components/SheetRenderer.tsx içine:
import { GizemliSayilarSheet } from './sheets/math/GizemliSayilarSheet';

// Switch case içine:
case 'GIZEMLI_SAYILAR':
  return <GizemliSayilarSheet data={data as any} />;
```

- [ ] **Step 3: Commit**

### Task 4: Gizemli Sayılar Config Bileşeni

**Files:**

- Create: `src/components/activity-configs/GizemliSayilarConfig.tsx`

- [ ] **Step 1: Config bileşeni oluştur**

```tsx
// src/components/activity-configs/GizemliSayilarConfig.tsx
import React from 'react';

interface Props {
  options: any;
  onChange: (opts: any) => void;
}

export const GizemliSayilarConfig: React.FC<Props> = ({ options, onChange }) => {
  const opts = options.gizemliSayilar || {};

  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Sayı Aralığı</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={opts.numberRange?.[0] || 1}
            onChange={(e) =>
              onChange({
                gizemliSayilar: {
                  ...opts,
                  numberRange: [Number(e.target.value), opts.numberRange?.[1] || 100],
                },
              })
            }
            className="w-20 p-2 border rounded"
          />
          <span>-</span>
          <input
            type="number"
            value={opts.numberRange?.[1] || 100}
            onChange={(e) =>
              onChange({
                gizemliSayilar: {
                  ...opts,
                  numberRange: [opts.numberRange?.[0] || 1, Number(e.target.value)],
                },
              })
            }
            className="w-20 p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">İpucu Sayısı</label>
        <input
          type="number"
          min={2}
          max={6}
          value={opts.clueCount || 3}
          onChange={(e) =>
            onChange({ gizemliSayilar: { ...opts, clueCount: Number(e.target.value) } })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Zorluk</label>
        <select
          value={opts.difficulty || 'Orta'}
          onChange={(e) => onChange({ gizemliSayilar: { ...opts, difficulty: e.target.value } })}
          className="w-full p-2 border rounded"
        >
          <option value="Başlangıç">Başlangıç</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

---

## Aktivite 2: MEYVELİ TOPLAMA

### Task 5: Meyveli Toplama Offline Generator

**Files:**

- Create: `src/services/offlineGenerators/meyveliToplama.ts`

- [ ] **Step 1: Generator oluştur** (Task 2 benzeri yapı)
- [ ] **Step 2: Index'e kaydet**
- [ ] **Step 3: Commit**

### Task 6: Meyveli Toplama Sheet

**Files:**

- Create: `src/components/sheets/math/MeyveliToplamaSheet.tsx`

- [ ] **Step 1: Sheet oluştur**
- [ ] **Step 2: SheetRenderer'a kaydet**
- [ ] **Step 3: Commit**

### Task 7: Meyveli Toplama Config

**Files:**

- Create: `src/components/activity-configs/MeyveliToplamaConfig.tsx`

- [ ] **Step 1: Config olu��tur**
- [ ] **Step 2: Commit**

---

## Aktivite 3: SAYI DEDEKTİFİ

### Task 8: Sayı Dedektifi Generator

**Files:**

- Create: `src/services/offlineGenerators/sayiDedektifi.ts`

- [ ] **Step 1-3: Generator + Index + Commit**

### Task 9: Sayı Dedektifi Sheet + Config

- [ ] **Step 1-3: Sheet + Config + Commit**

---

## Aktivite 4: KAVRAM HARİTASI

### Task 10: Kavram Haritası Generator

**Files:**

- Create: `src/services/offlineGenerators/kavramHaritasi.ts`

- [ ] **Step 1-3: Generator + Index + Commit**

### Task 11: Kavram Haritası Sheet + Config

- [ ] **Step 1-3: Sheet + Config + Commit**

---

## Aktivite 5: EŞ ANLAMLI KELİMELER

### Task 12: Eş Anlamlı Kelimeler Generator

**Files:**

- Create: `src/services/offlineGenerators/esAnlamliKelimeler.ts`

- [ ] **Step 1-3: Generator + Index + Commit**

### Task 13: Eş Anlamlı Kelimeler Sheet + Config

- [ ] **Step 1-3: Sheet + Config + Commit**

---

## Aktivite 6: 5N1K PANOSU

### Task 14: 5N1K Generator

**Files:**

- Create: `src/services/offlineGenerators/fiveWOneH.ts`

- [ ] **Step 1-3: Generator + Index + Commit**

### Task 15: 5N1K Sheet + Config

- [ ] **Step 1-3: Sheet + Config + Commit**

---

## Aktivite 7: MEYVELİ TOPLAMA BULMACASI

(Meyveli Toplama'nın farklı modu - aynı generator kullanılır, config'de mode değişir)

---

## Final: Registry Entegrasyonu

### Task 16: Generator Registry Kayıtları

**Files:**

- Modify: `src/services/generators/registry.ts`

```
# Her aktivite için:
{
  activity: ActivityType.GIZEMLI_SAYILAR,
  ai: withAI(ActivityType.GIZEMLI_SAYILAR),
  offline: withOffline(ActivityType.GIZEMLI_SAYILAR),
},
```

### Task 17: Final Test ve Build

**Files:**

- Build: `npm run build`
- Test: `npm run test:run`

---

## Özet: Task Listesi

- [ ] Task 1: Type tanımları (core.ts)
- [ ] Task 2: Gizemli Sayılar Generator
- [ ] Task 3: Gizemli Sayılar Sheet
- [ ] Task 4: Gizemli Sayılar Config
- [ ] Task 5: Meyveli Toplama Generator
- [ ] Task 6: Meyveli Toplama Sheet
- [ ] Task 7: Meyveli Toplama Config
- [ ] Task 8: Sayı Dedektifi Generator
- [ ] Task 9: Sayı Dedektifi Sheet + Config
- [ ] Task 10: Kavram Haritası Generator
- [ ] Task 11: Kavram Haritası Sheet + Config
- [ ] Task 12: Eş Anlamlı Kelimeler Generator
- [ ] Task 13: Eş Anlamlı Kelimeler Sheet + Config
- [ ] Task 14: 5N1K Generator
- [ ] Task 15: 5N1K Sheet + Config
- [ ] Task 16: Registry Kayıtları
- [ ] Task 17: Build + Test

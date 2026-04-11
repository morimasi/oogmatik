# Yeni Matematik & Dil Aktivite Generatorleri - TAM SPEC

## Genel Bakış

7 yeni aktivite için hem AI (Gemini) hem Offline modda çalışan, tam özelleştirilebilir modüler altyapı.

---

## 1. GİZEMLİ SAYILAR: İpuçlarını Takip Et!

### 1.1 Activity Type ID

```
GIZEMLI_SAYILAR
```

### 1.2 Option Type Tanımı (src/types/core.ts)

```typescript
interface GizemliSayilarOptions {
  // Aktivite özel ayarları
  numberRange: [number, number]; // Gizemli sayı aralığı [min, max]
  clueCount: number; // İpucu sayısı (2-6)
  operationTypes: ('topla' | 'cikar' | 'carp' | 'bol')[]; // İşlem türleri
  includeMultiStep: boolean; // Çok adımlı ipuçları
  includeModular: boolean; // Modüler aritmetik
  includeDigitClue: boolean; // Basamak ipuçları (rakam topla vs)
  includeNegative: boolean; // Negatif sayılar

  // Görsel & Layout
  layoutStyle: 'ipucu-liste' | 'matris' | 'kartezyen';
  showNumberLine: boolean; // Sayı doğrusunu göster
  clueOrder: 'random' | 'difficulty'; // İpucu sıralama

  // Zorluk seviyesi
  difficulty: 'Başlangıç' | 'Orta' | 'Zor';
}
```

### 1.3 AI Prompt Şablonu (Super Studio)

```typescript
// Prompt Builder
export const promptBuilder = ({ topic, difficulty, grade, settings }) => {
  const { clueCount, operationTypes, layoutStyle } = settings;

  return `Sen eğitim materyali uzmanısın. "${topic}" konusu için "Gizli Sayı" bulmaca üret.

PARAMETRELER:
- Zorluk: ${difficulty}
- İpucu Sayısı: ${clueCount}
- İşlem Türleri: ${operationTypes.join(', ')}
- Görsel Düzen: ${layoutStyle}

ÖRNEK İPUÇLARI:
- "Gizemli sayı 15'ten büyük ve 25'ten küçük"
- "Tek basamaklı rakamlarının toplamı 9'dur"
- "Çift bir sayıdır"
- "3 ile bölünebilir"

ZORUNLU JSON ÇIKTISI:
{
  "title": "Gizli Sayı Bulmacası",
  "content": "A4 formatında tüm ipuçları ve cevap kutusu",
  "pedagogicalNote": "Mantıksal çıkarım ve sayı hissi geliştirir.",
  "mysteryNumber": gizli_sayı,
  "clues": [
    {"id": 1, "text": "İpucu metni", "type": "range|digit|operation|parity"}
  ],
  "answerBox": "Gizli sayıyı yazacağınız kutu"
}`;
}

// Settings Bileşeni
export const Settings = ({ settings, onChange }) => (
  <div className="space-y-4">
    <NumberRangeSlider value={settings.numberRange} onChange={v => onChange({ numberRange: v })} />
    <ClueTypeSelector value={settings.operationTypes} onChange={v => onChange({ operationTypes: v })} />
    <DifficultyPicker value={settings.difficulty} onChange={v => onChange({ difficulty: v })} />
    <LayoutStylePicker value={settings.layoutStyle} onChange={v => onChange({ layoutStyle: v })} />
  </div>
);
```

### 1.4 Offline Generator (src/services/offlineGenerators/gizemliSayilar.ts)

```typescript
interface GizemliSayilarData {
  id: string;
  activityType: 'GIZEMLI_SAYILAR';
  title: string;
  instruction: string;
  pedagogicalNote: string;
  mysteryNumber: number;
  clues: { id: string; text: string; type: string }[];
  settings: GizemliSayilarOptions;
}

export const generateOfflineGizemliSayilar = async (
  options: GeneratorOptions
): Promise<GizemliSayilarData[]> => {
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
  } = options;

  const pages: GizemliSayilarData[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    // 1. Gizemli sayıyı belirle
    const mysteryNumber = getRandomInt(numberRange[0], numberRange[1]);

    // 2. İpuçlarını üret
    const clues = generateClues(mysteryNumber, {
      count: clueCount,
      operationTypes,
      includeMultiStep,
      includeModular,
      includeDigitClue,
      difficulty,
    });

    pages.push({
      id: `gizemli_${Date.now()}_${i}`,
      activityType: 'GIZEMLI_SAYILAR' as any,
      title: 'Gizemli Sayı: İpuçlarını Takip Et!',
      instruction: 'Aşağıdaki ipuçlarını oku ve gizemi sayıyı bul.',
      pedagogicalNote:
        'Bu etkinlik mantıksal çıkarım, sayı hissi ve çok adımlı düşünme becerisini geliştirir. Öğrenci ipuçlarını analiz ederek gizli sayıya ulaşır.',
      mysteryNumber,
      clues,
      settings: { difficulty, numberRange, clueCount, operationTypes, layoutStyle },
    });
  }

  return pages;
};

function generateClues(number: number, opts: any): any[] {
  const clues = [];
  const types = ['range', 'digit', 'parity', 'operation', 'mod'];

  //_range ipucu
  clues.push({
    id: `c1`,
    text: `Gizemli sayı ${Math.floor(number / 2)} ile ${number + 20} arasındadır`,
    type: 'range',
  });

  // digit ipucu
  if (opts.includeDigitClue) {
    clues.push({
      id: `c2`,
      text: `Rakamları toplamı ${String(number)
        .split('')
        .reduce((a, b) => a + Number(b), 0)}'dır`,
      type: 'digit',
    });
  }

  // parity
  clues.push({
    id: `c3`,
    text: number % 2 === 0 ? 'Çift bir sayıdır' : 'Tek bir sayıdır',
    type: 'parity',
  });

  return clues;
}
```

### 1.5 Sheet Bileşeni (src/components/sheets/math/GizemliSayilarSheet.tsx)

```tsx
import React from 'react';
import { PedagogicalHeader } from '../common';
import { EditableText, EditableElement } from '../../Editable';

interface Props {
  data: GizemliSayilarData;
}

export const GizemliSayilarSheet: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex flex-col bg-white p-8 text-black font-lexend min-h-[1123px]">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      {/* İpuçları Listesi */}
      <div className="mt-8 space-y-4">
        {(data.clues || []).map((clue, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
            <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
              {idx + 1}
            </div>
            <EditableText value={clue.text} tag="p" className="text-lg font-medium" />
          </div>
        ))}
      </div>

      {/* Cevap Kutusu */}
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

### 1.6 Config Bileşeni (src/components/activity-configs/GizemliSayilarConfig.tsx)

```tsx
export const GizemliSayilarConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
  return (
    <div className="space-y-6 p-4">
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Sayı Aralığı</label>
        <RangeSlider
          min={1}
          max={500}
          value={options.numberRange}
          onChange={(v) => onChange({ numberRange: v })}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">İpucu Sayısı</label>
        <NumberInput
          min={2}
          max={6}
          value={options.clueCount}
          onChange={(v) => onChange({ clueCount: v })}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">
          İşlem Türleri
        </label>
        <CheckboxGroup
          options={[
            { label: 'Toplama', value: 'topla' },
            { label: 'Çıkarma', value: 'cikar' },
            { label: 'Çarpma', value: 'carp' },
            { label: 'Bölme', value: 'bol' },
          ]}
          value={options.operationTypes}
          onChange={(v) => onChange({ operationTypes: v })}
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Zorluk</label>
        <DifficultySelector
          value={options.difficulty}
          onChange={(v) => onChange({ difficulty: v })}
        />
      </div>

      <Toggle
        label="Çok Adımlı İpuçları"
        value={options.includeMultiStep}
        onChange={(v) => onChange({ includeMultiStep: v })}
      />
      <Toggle
        label="Modüler Aritmetik"
        value={options.includeModular}
        onChange={(v) => onChange({ includeModular: v })}
      />
    </div>
  );
};
```

---

## 2. MEYVELİ TOPLAMA BULMACASI

### 2.1 Activity Type ID

```
MEYVELI_TOPLAMA
```

### 2.2 Option Type Tanımı

```typescript
interface MeyveliToplamaOptions {
  // Meyve & Sayı
  fruitTypes: string[]; // ['elma', 'armut', 'nar', ...]
  gridSize: number; // 3 | 4 | 5
  maxFruitCount: number; // Her meyve max kaç tane
  maxSum: number; // Hedef toplam

  // Oyun Modu
  mode: 'classic' | 'bulmaca' | 'savas';
  includeNegative: boolean; // Negatif meyveler
  includePriceTag: boolean; // Fiyat etiketi

  // Zorluk
  difficulty: 'Başlangıç' | 'Orta' | 'Zor';
}
```

### 2.3 AI + Offline Generator (hibrit yapı)

```typescript
interface MeyveliToplamaData {
  id: string;
  activityType: 'MEYVELI_TOPLAMA';
  title: string;
  instruction: string;
  pedagogicalNote: string;
  grid: { fruits: string[]; counts: number[][] }[];
  targetSum: number;
  settings: MeyveliToplamaOptions;
}

export const generateOfflineMeyveliToplama = async (
  options: GeneratorOptions
): Promise<MeyveliToplamaData[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    gridSize = 3,
    fruitTypes = ['elma', 'armut', 'nar', 'üzüm', 'karpuz', 'çilek'],
    maxSum = 20,
    maxFruitCount = 5,
    mode = 'classic',
  } = options;

  const defaultFruits = ['🍎', '🍐', '🍇', '🍊', '🍋', '🍓'];
  const selectedFruits =
    fruitTypes.length >= gridSize ? fruitTypes.slice(0, gridSize) : defaultFruits;

  const pages: MeyveliToplamaData[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    // Grid üret
    const grid = Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => getRandomInt(1, maxFruitCount))
    );

    // Her satır/sütun toplamını hesapla
    const rowSums = grid.map((row) => row.reduce((a, b) => a + b, 0));
    const colSums = Array.from({ length: gridSize }, (_, c) =>
      grid.reduce((a, row) => a + row[c], 0)
    );

    pages.push({
      id: `meyveli_${Date.now()}_${i}`,
      activityType: 'MEYVELI_TOPLAMA' as any,
      title: 'Meyveli Toplama Bulmacası',
      instruction: `${selectedFruits.join(', ')} meyvelerinin sayılarını bulup toplamları eşitle.`,
      pedagogicalNote:
        'Bu etkinlik toplama işlemi, mantıksal düşünme ve problem çözme becerisini geliştirir. Disleksi dostu görseller ile desteklenir.',
      grid: grid.map((row, ri) => ({
        fruits: selectedFruits,
        counts: row,
        rowSum: rowSums[ri],
      })),
      targetSum: maxSum,
      settings: { difficulty, gridSize, fruitTypes: selectedFruits, maxSum, mode },
    });
  }

  return pages;
};
```

### 2.4 Sheet Bileşeni

```tsx
export const MeyveliToplamaSheet: React.FC<{ data: MeyveliToplamaData }> = ({ data }) => {
  const fruits = ['🍎', '🍐', '🍇', '🍊', '🍋', '🍓'];

  return (
    <div className="flex flex-col bg-white p-8 text-black font-lexend">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      {/* Meyve Legenda */}
      <div className="flex gap-4 mt-6 justify-center">
        {fruits.slice(0, data.grid.length).map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-2xl">{f}</span>
            <span className="text-xs font-bold text-zinc-500">
              {data.grid[i]?.fruits?.[i] || ''}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        className={`grid gap-2 mt-6 mx-auto`}
        style={{ gridTemplateColumns: `repeat(${data.grid.length}, minmax(0, 1fr))` }}
      >
        {data.grid.map((row, ri) =>
          row.counts.map((count, ci) => (
            <div
              key={`${ri}-${ci}`}
              className="w-16 h-16 bg-zinc-50 rounded-lg flex items-center justify-center text-2xl font-bold border-2 border-zinc-200"
            >
              {count}
            </div>
          ))
        )}
      </div>

      {/* Toplam Satırı */}
      <div className="flex justify-center gap-8 mt-4">
        {data.grid[0]?.rowSum !== undefined &&
          Array.from({ length: data.grid.length }).map((_, i) => (
            <div
              key={i}
              className="w-16 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-lg font-bold text-indigo-600"
            >
              = {data.targetSum}
            </div>
          ))}
      </div>
    </div>
  );
};
```

---

## 3. SAYI DEDEKTİFİ MACERASI

### 3.1 Activity Type ID

```
SAYI_DEDEKTIFI
```

### 3.2 Option Type Tanımı

```typescript
interface SayiDedektifiOptions {
  mysteryNumber: number;
  clueCount: number;
  clueTypes: ('greater' | 'less' | 'mod' | 'digit' | 'prime' | 'square')[];
  includeRangeClue: boolean;
  includeDigitClue: boolean;
  includeModClue: boolean;
  includePatternClue: boolean;
  difficulty: 'Başlangıç' | 'Orta' | 'Zor';
}
```

### 3.3 Sheet Bileşeni

```tsx
export const SayiDedektifiSheet: React.FC<{ data: SayiDedektifiData }> = ({ data }) => {
  return (
    <div className="flex flex-col bg-white p-8 font-lexend">
      <PedagogicalHeader
        title="Sayı Dedektifi Macerası"
        instruction="İpuçlarını takip et, gizli sayıyı bul!"
        note={data.pedagogicalNote}
      />

      {/* Dedektif Not Defteri görünümü */}
      <div className="mt-8 bg-amber-50 p-6 rounded-2xl border-2 border-amber-200">
        <h3 className="text-amber-800 font-bold mb-4">🔍 Dedektif İpuçları</h3>
        {data.clues.map((clue, i) => (
          <div key={i} className="flex gap-3 mb-2 p-2 bg-white rounded-lg">
            <span className="text-amber-600">✓</span>
            <span>{clue.text}</span>
          </div>
        ))}
      </div>

      {/* Cevap Alanı */}
      <div className="mt-8 flex justify-center">
        <div className="bg-zinc-900 text-white px-8 py-4 rounded-xl text-2xl font-bold">
          Gizli Sayı: _______
        </div>
      </div>
    </div>
  );
};
```

---

## 4. KAVRAM HARİTASI (İNFOGRAFİK)

### 4.1 Activity Type ID

```
KAVRAM_HARITASI
```

### 4.2 Option Type Tanımı

```typescript
interface KavramHaritasiOptions {
  concept: string;
  depth: number; // 1-3 (kaç seviye)
  branchCount: number; // 3-6 (ana dal sayısı)
  fillRatio: number; // 0.3-0.7 (boş node oranı)
  layout: 'radial' | 'tree' | 'horizontal' | 'vertical';
  nodeStyle: 'rounded' | 'sharp' | 'circle';
  edgeStyle: 'straight' | 'curved' | ' orthogonal';
  includeExamples: boolean;
  includeDefinitions: boolean;
  colorScheme: 'monochrome' | 'rainbow' | 'pastel';
  difficulty: 'Başlangıç' | 'Orta' | 'Zor';
}
```

### 4.3 AI + Offline Generator

```typescript
interface KavramHaritasiData {
  id: string;
  activityType: 'KAVRAM_HARITASI';
  title: string;
  instruction: string;
  pedagogicalNote: string;
  nodes: { id: string; label: string; level: number; isEmpty: boolean; x?: number; y?: number }[];
  edges: { from: string; to: string; label?: string }[];
  settings: KavramHaritasiOptions;
}

export const generateOfflineKavramHaritasi = async (
  options: GeneratorOptions
): Promise<KavramHaritasiData[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    concept = 'Canlılar Dünyası',
    depth = 2,
    branchCount = 3,
    fillRatio = 0.4,
    layout = 'radial',
    nodeStyle = 'rounded',
  } = options;

  // Merkez node
  const centerNode = { id: 'center', label: concept, level: 0, isEmpty: false };

  // Ana dallar
  const mainNodes = Array.from({ length: branchCount }, (_, i) => ({
    id: `m${i + 1}`,
    level: 1,
    isEmpty: Math.random() < fillRatio,
  }));

  // Alt dallar (depth >= 2 ise)
  const subNodes =
    depth >= 2
      ? mainNodes.flatMap((m, mi) =>
          Array.from({ length: getRandomInt(1, 3) }, (_, si) => ({
            id: `${m.id}_s${si + 1}`,
            level: 2,
            isEmpty: Math.random() < fillRatio,
          }))
        )
      : [];

  return [
    {
      id: `kavram_${Date.now()}`,
      activityType: 'KAVRAM_HARITASI' as any,
      title: `${concept} Kavram Haritası`,
      instruction: 'Boş kutucuklara uygun kavramları yazarak haritayı tamamla.',
      pedagogicalNote:
        'Bu etkinlik kavramlar arası ilişkileri görsel-mekansal olarak organize etme becerisini geliştirir.',
      nodes: [centerNode, ...mainNodes, ...subNodes],
      edges: mainNodes.map((m) => ({ from: 'center', to: m.id })),
      settings: { difficulty, concept, depth, branchCount, fillRatio, layout },
    },
  ];
};
```

### 4.4 Sheet Bileşeni

```tsx
export const KavramHaritasiSheet: React.FC<{ data: KavramHaritasiData }> = ({ data }) => {
  // Radyal düzen: merkez node, etrafında dallar
  return (
    <div className="flex flex-col bg-white p-8 font-lexend">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      {/* Kavram Haritası - Radyal Düzen */}
      <div className="mt-12 relative min-h-[600px]">
        {/* Merkez */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-6 py-3 rounded-full font-bold shadow-xl">
          {data.nodes.find((n) => n.id === 'center')?.label}
        </div>

        {/* Dallar */}
        {data.nodes
          .filter((n) => n.level === 1)
          .map((node, i) => {
            const angle =
              ((i * 360) / data.nodes.filter((n) => n.level === 1).length - 90) * (Math.PI / 180);
            const radius = 200;
            const x = 400 + radius * Math.cos(angle);
            const y = 300 + radius * Math.sin(angle);

            return (
              <div
                key={node.id}
                className={`absolute px-4 py-2 rounded-xl font-medium ${
                  node.isEmpty
                    ? 'border-2 border-dashed border-indigo-300 bg-white text-indigo-300'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
                style={{ left: x, top: y }}
              >
                {node.isEmpty ? '_____' : node.label}
              </div>
            );
          })}
      </div>
    </div>
  );
};
```

---

## 5. EŞ ANLAMLI KELİMELER: KELİME BAĞLAMA OYUNU

### 5.1 Activity Type ID

```
ES_ANLAMLI_KELIMELER
```

### 5.2 Option Type Tanımı

```typescript
interface EsAnlamliKelimelerOptions {
  wordCount: number; // Kaç kelime
  pairsPerRow: number; // Her satırda kaç çift
  includeAntonyms: boolean; // Zıt anlamlılar da
  includeHomophones: boolean; // Ses benzerleri
  wordCategory: 'all' | 'nouns' | 'verbs' | 'adjectives';
  difficulty: 'Başlangıç' | 'Orta' | 'Zor';
}
```

### 5.3 Sheet Bileşeni

```tsx
export const EsAnlamliKelimelerSheet: React.FC<{ data: EsAnlamliKelimelerData }> = ({ data }) => {
  return (
    <div className="flex flex-col bg-white p-8 font-lexend">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      <div className="mt-8 grid grid-cols-2 gap-4">
        {data.pairs.map((pair, i) => (
          <div key={i} className="flex items-center gap-2 p-3 bg-zinc-50 rounded-xl">
            {/* Ana Kelime */}
            <div className="flex-1 bg-white border-2 border-zinc-200 rounded-lg px-3 py-2 font-bold text-center">
              {pair.word}
            </div>
            {/* Eş Anlamlı Kutuları */}
            <div className="flex gap-1">
              {Array.from({ length: pair.synonymCount || 2 }).map((_, si) => (
                <input
                  key={si}
                  type="text"
                  className="w-16 h-10 border-2 border-dashed border-indigo-200 rounded-lg text-center"
                  placeholder="?"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 6. 5N1K PANOSU

### 6.1 Activity Type ID

```
FIVE_W_ONE_H
```

### 6.2 Option Type Tanımı

```typescript
interface FiveWOneHOptions {
  questionCount: number;
  includeAllQuestions: boolean; // Tüm 5N1K soruları
  questionTypes: ('who' | 'where' | 'when' | 'what' | 'why' | 'how')[];
  passageLength: 'short' | 'medium' | 'long';
  includeMultipleChoice: boolean;
  includeOpenEnded: boolean;
  difficulty: 'Başlangıç' | 'Orta' | 'Zor';
}
```

### 6.3 Sheet Bileşeni

```tsx
export const FiveWOneHSheet: React.FC<{ data: FiveWOneHData }> = ({ data }) => {
  const questionLabels = {
    who: 'Kim?',
    what: 'Ne?',
    where: 'Nerede?',
    when: 'Ne zaman?',
    why: 'Neden?',
    how: 'Nasıl?',
  };

  return (
    <div className="flex flex-col bg-white p-8 font-lexend">
      <PedagogicalHeader
        title={data.title}
        instruction={data.instruction}
        note={data.pedagogicalNote}
      />

      {/* Okuma Metni */}
      <div className="mt-8 p-4 bg-zinc-50 rounded-xl text-base leading-relaxed">
        {data.passage?.text}
      </div>

      {/* Sorular */}
      <div className="mt-6 space-y-4">
        {data.questions?.map((q, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold shrink-0">
              {i + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium">{questionLabels[q.type as keyof typeof questionLabels]}</p>
              {q.answerType === 'multiple_choice' ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {q.options?.map((opt, oi) => (
                    <div key={oi} className="p-2 border rounded-lg">
                      {opt}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 h-12 border-2 border-dashed border-zinc-300 rounded-lg" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 7. MEYVELİ TOPLAMA

### 7.1 Activity Type ID - Aynı MeyveliToplama ama farklı mod

```
MEYVELI_TOPLAMA_BULMACA  // Bulmaca modu
```

---

## 8. REGISTRY KAYITLARI

### 8.1 Generator Registry (src/services/generators/registry.ts)

```typescript
{
  activity: ActivityType.GIZEMLI_SAYILAR,
  ai: withAI(ActivityType.GIZEMLI_SAYILAR),
  offline: withOffline(ActivityType.GIZEMLI_SAYILAR),
},
{
  activity: ActivityType.MEYVELI_TOPLAMA,
  ai: withAI(ActivityType.MEYVELI_TOPLAMA),
  offline: withOffline(ActivityType.MEYVELI_TOPLAMA),
},
{
  activity: ActivityType.SAYI_DEDEKTIFI,
  ai: withAI(ActivityType.SAYI_DEDEKTIFI),
  offline: withOffline(ActivityType.SAYI_DEDEKTIFI),
},
{
  activity: ActivityType.KAVRAM_HARITASI,
  ai: withAI(ActivityType.KAVRAM_HARITASI),
  offline: withOffline(ActivityType.KAVRAM_HARITASI),
},
{
  activity: ActivityType.ES_ANLAMLI_KELIMELER,
  ai: withAI(ActivityType.ES_ANLAMLI_KELIMELER),
  offline: withOffline(ActivityType.ES_ANLAMLI_KELIMELER),
},
{
  activity: ActivityType.FIVE_W_ONE_H,
  ai: withAI(ActivityType.FIVE_W_ONE_H),
  offline: withOffline(ActivityType.FIVE_W_ONE_H),
},
```

### 8.2 Sidebar Kategori Entegrasyonu

**Görsel & Mekansal:**

- Kavram Haritası (İnfografik)

**Okuduğunu Anlama:**

- 5N1K Panosu

**Okuma & Dil:**

- Eş Anlamlı Kelimeler: Kelime Bağlama Oyunu

**Matematik & Mantık:**

- Gizemli Sayılar: İpuçlarını Takip Et!
- Meyveli Toplama Bulmacası
- Sayı Dedektifi Macerası
- Meyveli Toplama

---

## 9. ÖZET: TÜM AKTİVİTELER İÇİN EKSLER TABLO

| ID  | Aktivite                | AI  | Offline | Sheet | Config | Özel Option Sayısı |
| --- | ----------------------- | --- | ------- | ----- | ------ | ------------------ |
| 1   | Gizemli Sayılar         | ✅  | ✅      | ✅    | ✅     | 9                  |
| 2   | Meyveli Toplama         | ✅  | ✅      | ✅    | ✅     | 7                  |
| 3   | Sayı Dedektifi          | ✅  | ✅      | ✅    | ✅     | 6                  |
| 4   | Kavram Haritası         | ✅  | ✅      | ✅    | ✅     | 10                 |
| 5   | Eş Anlamlı Kelimeler    | ✅  | ✅      | ✅    | ✅     | 5                  |
| 6   | 5N1K Panosu             | ✅  | ✅      | ✅    | ✅     | 6                  |
| 7   | Meyveli Toplama Bulmaca | ✅  | ✅      | ✅    | ✅     | 7                  |

Toplam: 7 aktivite × 6 dosya = 42 yeni/modifiye dosya

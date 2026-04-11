# Yeni Matematik Aktivite Generatorleri Tasarım Doc

## Genel Bakış

7 yeni matematik/düşünme etkinliği için hem AI (Gemini) hem Offline modda çalışan modüler generator altyapısı.

## Aktivite Listesi ve Kategoriler

| ID  | Aktivite Adı              | Kategori           | Mod        |
| --- | ------------------------- | ------------------ | ---------- |
| 1   | Kavram Haritası           | Görsel & Mekansal  | AI+Offline |
| 2   | Eş Anlamlı Kelimeler      | Okuma & Dil        | AI+Offline |
| 3   | 5N1K Panosu               | Okuduğunu Anlama   | AI+Offline |
| 4   | Gizemli Sayılar           | Matematik & Mantık | AI+Offline |
| 5   | Meyveli Toplama           | Matematik & Mantık | AI+Offline |
| 6   | Sayı Dedektifi            | Matematik & Mantık | AI+Offline |
| 7   | Meyveli Toplama Bulmacası | Matematik & Mantık | AI+Offline |

## Her Aktivite İçin Yapı

### Dosya Yapısı

```
src/services/offlineGenerators/
├── kavramHaritasi.ts       # Offline generator (varsa)
├── esAnlamliKelimeler.ts  # Offline generator (varsa)
├── ...
src/services/generators/
├── kavramHaritasi.ts     # AI generator
├── esAnlamliKelimeler.ts # AI generator
├── ...
src/components/sheets/math/
├── KavramHaritasiSheet.tsx
├── EsAnlamliKelimelerSheet.tsx
├── ...
src/components/activity-configs/
├── KavramHaritasiConfig.tsx
├── ...
```

### Type Tanımları (src/types/core.ts)

```typescript
// Her aktivite için option tipi
interface KavramHaritasiOptions {
  concept: string;
  depth: number; // 1-3
  branchCount: number; // 3-6
  fillRatio: number; // 0.3-0.7 (boş node oranı)
  layout: 'radial' | 'tree' | 'horizontal';
  difficulty: DifficultyLevel;
}

interface GizemliSayilarOptions {
  range: [number, number];
  clueCount: number; // 2-5
  operationTypes: ('+' | '-' | 'x' | '/')[];
  difficulty: DifficultyLevel;
  includeMultiStep: boolean;
}

interface MeyveliToplamaOptions {
  fruitTypes: string[]; // meyve isimleri
  maxSum: number; // max toplam
  gridSize: number; // 3x3, 4x4, 5x5
  includeNegative: boolean;
  difficulty: DifficultyLevel;
}

interface SayiDedektifiOptions {
  mysteryNumber: number;
  clueCount: number;
  clueTypes: ('greater' | 'less' | 'mod' | 'digit')[];
  difficulty: DifficultyLevel;
}
```

## Her Generator İçin Standart

### Offline Generator Şablonu

```typescript
import { GeneratorOptions } from '../../types';

interface [Aktivite]Data {
  id: string;
  activityType: string;
  title: string;
  instruction: string;
  pedagogicalNote: string;
  problems: any[];
  settings: Record<string, any>;
}

export const generateOffline[Aktivite] = async (options: GeneratorOptions): Promise<[Aktivite]Data[]> => {
  const {
    worksheetCount = 1,
    difficulty = 'Orta',
    // ... özel seçenekler
  } = options;

  const pages: [Aktivite]Data[] = [];

  for (let i = 0; i < worksheetCount; i++) {
    // Problemları üret
    const problems = generateProblems(options);

    pages.push({
      id: `[aktivite]_${Date.now()}_${i}`,
      activityType: '[ACTIVITY_TYPE]' as any,
      title: '...',
      instruction: '...',
      pedagogicalNote: 'Bu etkinlik ... becerisini geliştirir.',
      problems,
      settings: { difficulty, ... }
    });
  }

  return pages;
};

function generateProblems(options: GeneratorOptions): any[] {
  // Zorluk seviyesine göre problem üretimi
  switch (options.difficulty) {
    case 'Başlangıç': return generateEasy();
    case 'Orta': return generateMedium();
    case 'Zor': return generateHard();
  }
}
```

### AI Generator Şablonu (Super Studio format)

```typescript
import { SuperTemplateDefinition } from '../components/SuperStudio/templates/registry';

export const DEFAULT_SETTINGS = {
  // Şablon-specific defaults
};

export const promptBuilder = ({ topic, difficulty, grade, settings }: IPromptBuilderContext) => {
  return `Sen eğitim materyali uzmanısın. "${topic}" konusu için ...

  ZORUNLU ÇIKTI (VALID JSON):
  {
    "title": "...",
    "content": "A4 formatında içerik",
    "pedagogicalNote": "Öğretmene not"
  }`;
};

export const Settings = ({ settings, onChange }) => (
  // Premium customize bileşenleri
);
```

## Sheet Bileşeni Standartları

### A4 Layout Kuralları

- Sayfa boyutu: 794px × 1123px (A4 @ 96dpi)
- Kenar boşlukları: min 40px
- Satır aralığı: 1.5 (min)
- Font: Lexend (zorunlu)
- Font boyutları: min 12px (body), 16px (başlık)
  -Boşluk: elementler arası min 16px

### Bileşen Yapısı

```tsx
export const [Aktivite]Sheet: React.FC<{ data: [Aktivite]Data }> = ({ data }) => {
  return (
    <div className="flex flex-col bg-white p-8 text-black font-lexend">
      <Header title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />

      <div className="grid grid-cols-2 gap-6 mt-8">
        {data.problems.map((p, i) => (
          <ProblemCard key={i} problem={p} index={i} />
        ))}
      </div>

      <Footer />
    </div>
  );
};
```

## Registry Entegrasyonu

### Generator Registry (src/services/generators/registry.ts)

```typescript
// Her aktivite için kayıt
{
  activity: ActivityType.[AKTIVITE],
  ai: withAI(ActivityType.[AKTIVITE]),
  offline: withOffline(ActivityType.[AKTIVITE]),
}
```

### Sidebar Menu (src/components/Sidebar.tsx)

- Görsel & Mekansal: Kavram Haritası
- Okuduğunu Anlama: 5N1K Panosu
- Okuma & Dil: Eş Anlamlı Kelimeler
- Matematik & Mantık: Gizemli Sayılar, Meyveli Toplama, Sayı Dedektifi

## Planlanan Adımlar

1. **Type tanımları** - core.ts'e option tipleri ekle
2. **Offline generatorlar** - Her aktivite için ts dosyası
3. **AI prompts** - Super Studio formatında
4. **Sheet bileşenleri** - A4 layout ile
5. **Config bileşenleri** - Özelleştirme options
6. **Registry kayıtları** - Generator + UI entegrasyonu

## Öncelik Sırası

1. Gizemli Sayılar (en basit)
2. Meyveli Toplama
3. Sayı Dedektifi
4. 5N1K Panosu
5. Eş Anlamlı Kelimeler
6. Kavram Haritası
7. Meyveli Toplama Bulmacası

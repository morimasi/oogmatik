
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';
import { ActivityType } from '../../types/activity.js';

/**
 * Matematik Bulmacaları AI Üretici — Premium Kompakt
 * Ayarları dinler: puzzleType, operationType, numberRange, storyMode, colorfulText, compactLayout, fastMode
 */
export const generateMathPuzzleFromAI = async (options: GeneratorOptions) => {
  const opts = options as Record<string, unknown>;
  const {
    difficulty = 'Orta',
    itemCount = 6,
    ageGroup = '8-10',
  } = opts;

  const puzzleType = (opts.puzzleType as string) || 'visual';
  const operationType = (opts.operationType as string) || 'mixed';
  const numberRange = (opts.numberRange as string) || '1-20';
  const storyMode = (opts.storyMode as boolean) ?? true;
  const colorfulText = (opts.colorfulText as boolean) ?? false;
  const compactLayout = (opts.compactLayout as boolean) ?? true;
  const fastMode = (opts.fastMode as boolean) ?? false;

  const storyInstruction = storyMode
    ? 'Her bulmacayı kısa bir hikaye/kurgu içine yerleştir (örn: "Elmanın bahçede kayıp değeri...").'
    : 'Bulmacaları direkt denklem formatında sun, hikaye ekleme.';

  const colorfulInstruction = colorfulText
    ? 'Denklemlerdeki nesne isimlerini ve sayıları renkli/heceli formatta düşün.'
    : 'Standart düz metin formatı kullan.';

  const puzzleTypeDesc = puzzleType === 'visual'
    ? 'Görsel Denklem: Meyveli/nesneli denklemler (🍎+🍎=10)'
    : puzzleType === 'logic'
    ? 'Mantık Bilmecesi: Sayı tabanlı mantık soruları ve çıkarımlar'
    : puzzleType === 'magic_square'
    ? 'Sihirli Kare & Piramit: Toplam eşitliği tablosu'
    : 'Karma: Tüm türlerden karışık bulmacalar';

  const operationDesc = operationType === 'add'
    ? 'Sadece toplama (+)'
    : operationType === 'mixed'
    ? 'Toplama ve çıkarma (+, -)'
    : operationType === 'mult'
    ? 'Çarpma ve bölme (×, ÷)'
    : 'Dört işlem (+, -, ×, ÷)';

  const prompt = `
[ROL: MATEMATIKSEL MANTIK UZMANI + ÖZEL EĞİTİM TASARIMCISI]
GÖREV: ${ageGroup} yaş grubu için ${difficulty} seviyesinde ${itemCount} adet "Matematik Bulmacası" üret.

TASARIM PRENSİPLERİ:
- Tür: ${puzzleTypeDesc}
- İşlem: ${operationDesc}
- Sayı Aralığı: ${numberRange}
- ${storyInstruction}
- ${colorfulInstruction}
- Düzen: ${compactLayout ? 'Kompakt A4 — Sayfa dolu dolu, minimum boşluk, maksimum bulmaca.' : 'Standart A4 — Rahat boşluklar.'}
- Mod: ${fastMode ? 'Hızlı mod — Basit, net, hızlı çözülebilir sorular.' : 'Normal mod — Derinlemesine düşünme gerektiren sorular.'}

PEDAGOJİK HEDEF:
Öğrencinin cebirsel düşünme başlangıcı, görsel mantık, eşitlik kavramı ve işlem hızını geliştirir. Disleksi dostu: net, kısa yönergeler.

ÇIKTI FORMATI (JSON — SADECE GEÇERLİ JSON):
{
  "title": "Gizemli Denklemler",
  "instruction": "Nesnelerin değerini bularak soru işaretini cevapla.",
  "pedagogicalNote": "Öğrencinin görsel sembolleri sayılarla eşleştirme ve mantıksal çıkarım yapma becerisi hedeflenir.",
  "puzzles": [
    {
      "objects": [
        { "name": "Elma", "imagePrompt": "minimalist red apple icon, vector art, white background", "value": 5 }
      ],
      "equations": [
        { "leftSide": [ { "objectName": "Elma", "multiplier": 2 } ], "rightSide": 10 }
      ],
      "finalQuestion": "Elma + Elma",
      "answer": 10
    }
  ]
}

KURALLAR:
1. Tam ${itemCount} adet bulmaca üret.
2. Her bulmacada 2-4 nesne, 3-4 denklem olsun.
3. Denklemler kademeli zorlaşsın (son denklem en zor).
4. Final soru önceki denklemlerin çözümüne dayansın.
5. Nesne isimleri Türkçe ve ${ageGroup} yaşa uygun olsun.
6. imagePrompt İngilizce, minimalist, beyaz arka plan.
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      instruction: { type: 'STRING' },
      pedagogicalNote: { type: 'STRING' },
      puzzles: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            objects: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  imagePrompt: { type: 'STRING' },
                  value: { type: 'NUMBER' }
                },
                required: ['name', 'imagePrompt', 'value']
              }
            },
            equations: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  leftSide: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        objectName: { type: 'STRING' },
                        multiplier: { type: 'NUMBER' }
                      },
                      required: ['objectName', 'multiplier']
                    }
                  },
                  rightSide: { type: 'NUMBER' }
                },
                required: ['leftSide', 'rightSide']
              }
            },
            finalQuestion: { type: 'STRING' },
            answer: { type: 'NUMBER' }
          },
          required: ['objects', 'equations', 'finalQuestion', 'answer']
        }
      }
    },
    required: ['title', 'instruction', 'puzzles', 'pedagogicalNote'],
  };

  const result = await generateWithSchema(prompt, schema) as unknown as Record<string, unknown>;

  return {
    id: `math_puzzle_${Date.now()}`,
    activityType: ActivityType.MATH_PUZZLE,
    title: (result.title as string) || 'Matematik Bulmacaları',
    instruction: (result.instruction as string) || 'Denklemleri çöz, gizli sayıları bul.',
    pedagogicalNote: (result.pedagogicalNote as string) || '',
    settings: {
      difficulty,
      itemCount,
      ageGroup,
      puzzleType,
      operationType,
      numberRange,
      storyMode,
      colorfulText,
      compactLayout,
      fastMode,
    },
    content: result,
    puzzles: result.puzzles,
  };
};

/**
 * Hızlı Mod — Offline Üretici (AI beklemeden anında üretir)
 * Ayarları dinler ve anında bulmaca oluşturur
 */
export const generateMathPuzzleOffline = (options: GeneratorOptions) => {
  const opts = options as Record<string, unknown>;
  const itemCount = (opts.itemCount as number) || 6;
  const difficulty = (opts.difficulty as string) || 'Orta';
  const puzzleType = (opts.puzzleType as string) || 'visual';
  const operationType = (opts.operationType as string) || 'mixed';
  const numberRange = (opts.numberRange as string) || '1-20';

  const [minVal, maxVal] = numberRange.split('-').map(Number);
  const min = minVal || 1;
  const max = maxVal || 20;

  const objects = [
    { name: 'Elma', imagePrompt: 'minimalist red apple icon, vector art, white background' },
    { name: 'Armut', imagePrompt: 'minimalist green pear icon, vector art, white background' },
    { name: 'Portakal', imagePrompt: 'minimalist orange fruit icon, vector art, white background' },
    { name: 'Çilek', imagePrompt: 'minimalist strawberry icon, vector art, white background' },
    { name: 'Muz', imagePrompt: 'minimalist yellow banana icon, vector art, white background' },
    { name: 'Karpuz', imagePrompt: 'minimalist watermelon slice icon, vector art, white background' },
    { name: 'Üzüm', imagePrompt: 'minimalist grape bunch icon, vector art, white background' },
    { name: 'Kiraz', imagePrompt: 'minimalist cherry pair icon, vector art, white background' },
  ];

  const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

  const puzzles = Array.from({ length: itemCount }, (_, idx) => {
    const usedObjects = objects.slice(idx % objects.length, (idx % objects.length) + 3);
    if (usedObjects.length < 2) usedObjects.push(...objects.slice(0, 2 - usedObjects.length));

    const values = usedObjects.map(() => rand(min, max));
    const namedObjects = usedObjects.map((o, i) => ({ ...o, value: values[i] }));

    const equations = [
      {
        leftSide: [{ objectName: namedObjects[0].name, multiplier: 1 }],
        rightSide: values[0],
      },
      {
        leftSide: [
          { objectName: namedObjects[0].name, multiplier: 1 },
          { objectName: namedObjects[1].name, multiplier: 1 },
        ],
        rightSide: values[0] + values[1],
      },
      {
        leftSide: [
          { objectName: namedObjects[0].name, multiplier: 1 },
          { objectName: namedObjects[1].name, multiplier: 1 },
          ...(namedObjects[2] ? [{ objectName: namedObjects[2].name, multiplier: 1 }] : []),
        ],
        rightSide: values[0] + values[1] + (values[2] || 0),
      },
    ];

    return {
      objects: namedObjects,
      equations,
      finalQuestion: namedObjects.map(o => o.name).join(' + '),
      answer: values.reduce((a, b) => a + b, 0),
    };
  });

  return {
    id: `math_puzzle_offline_${Date.now()}`,
    activityType: ActivityType.MATH_PUZZLE,
    title: 'Matematik Bulmacaları',
    instruction: 'Nesnelerin değerini bularak soru işaretini cevapla.',
    pedagogicalNote: 'Görsel sembollerle cebirsel düşünme ve mantıksal çıkarım becerisi geliştirilir.',
    settings: { difficulty, itemCount, puzzleType, operationType, numberRange, fastMode: true },
    puzzles,
    content: { puzzles },
  };
};

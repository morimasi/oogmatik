
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';
import { ActivityType } from '../../types/activity.js';

/**
 * Matematik Bulmacaları AI Üretici
 */
export const generateMathPuzzleFromAI = async (options: GeneratorOptions) => {
  const { 
    difficulty = 'Orta', 
    itemCount = 2, 
    ageGroup = '8-10',
    profile = 'general',
    topic = 'Genel Matematik',
    params = {}
  } = options;

  const puzzleType = params.puzzleType || 'visual';
  const operationType = params.operationType || 'mixed';
  const numberRange = params.numberRange || '1-20';

  const prompt = `
[ROL: MATEMATİKSEL MANTIK UZMANI]
GÖREV: ${ageGroup} yaş grubu için ${difficulty} seviyesinde ${itemCount} adet "Matematik Bulmacası" üret.

STRATEJİ:
1. "Görsel Denklem" tarzında (meyveli/nesneli) bulmacalar üret. 
2. Bulmaca Türü: ${puzzleType}
3. İşlem Kurgusu: ${operationType} (Add: Toplama, Mixed: Toplama/Çıkarma, Expert: Dört İşlem)
4. Sayı Aralığı: ${numberRange}
5. Her bulmaca birbirini takip eden 3 denklem ve finalde bilinmeyen 1 sonuç içermelidir.

PEDAGOJİK HEDEF:
Bu etkinlik, öğrencinin cebirsel düşünme başlangıcı, görsel mantık, eşitlik kavramı ve işlem hızını geliştirir.

ÇIKTI FORMATI (JSON):
{
  "title": "Gizemli Denklemler: ${topic}",
  "instruction": "Aşağıdaki nesnelerin değerini bularak soru işaretini cevaplayınız.",
  "pedagogicalNote": "Öğrencinin görsel sembolleri sayılarla eşleştirme ve mantıksal çıkarım yapma becerisi hedeflenir.",
  "puzzles": [
    {
      "id": "p1",
      "objects": [
        { "name": "Elma", "imagePrompt": "minimalist red apple icon, vector art", "value": 5 },
        { "name": "Armut", "imagePrompt": "minimalist green pear icon, vector art", "value": 3 }
      ],
      "equations": [
        { "leftSide": [ { "objectName": "Elma", "multiplier": 1 }, { "objectName": "Elma", "multiplier": 1 } ], "rightSide": 10 },
        { "leftSide": [ { "objectName": "Elma", "multiplier": 1 }, { "objectName": "Armut", "multiplier": 1 } ], "rightSide": 8 }
      ],
      "finalQuestion": "Elma + Armut",
      "answer": 8
    }
  ]
}
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
            id: { type: 'STRING' },
            objects: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  name: { type: 'STRING' },
                  imagePrompt: { type: 'STRING' },
                  value: { type: 'NUMBER' }
                }
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
                      }
                    }
                  },
                  rightSide: { type: 'NUMBER' }
                }
              }
            },
            finalQuestion: { type: 'STRING' },
            answer: { type: 'NUMBER' }
          }
        }
      }
    },
    required: ['title', 'instruction', 'puzzles', 'pedagogicalNote'],
  };

  const result = await generateWithSchema(prompt, schema);

  return {
    id: `math_puzzle_${Date.now()}`,
    activityType: ActivityType.MATH_PUZZLE,
    title: result.title,
    instruction: result.instruction,
    pedagogicalNote: result.pedagogicalNote,
    settings: { ...options, ...params },
    content: result, // Doğrudan result'ı content olarak pass ediyoruz (puzzles içinde)
    puzzles: result.puzzles // Gerekirse root'ta da kalsın
  };
};

import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { DirectionalCodeReadingData } from '../../types/visual';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts.js';

export const generateDirectionalCodeReadingFromAI = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData> => {
  const difficulty = options.difficulty || 'Orta';
  const gridSize = options.gridSize || 6;
  const obstacleDensity = options.obstacleDensity || 20;
  const cipherType = options.cipherType || 'arrows';
  const puzzleCount = options.puzzleCount || (difficulty === 'Zor' ? 1 : 2);
  const aestheticMode = (options as any).aestheticMode || 'standard';
  const student = options.studentContext;

  const prompt = `
${PEDAGOGICAL_BASE}
${CLINICAL_DIAGNOSTIC_GUIDE}

GÖREV: [ULTRA-PROFESYONEL ALGORİTMİK ROTA ANALİZİ & KOD OKUMA]

PARAMETRELER:
- Zorluk: ${difficulty}.
- Izgara: ${gridSize}x${gridSize}.
- Engel Yoğunluğu: %${obstacleDensity}.
- Şifreleme Türü: ${cipherType} (arrows: oklar, letters: yön harfleri, colors: renk kodları).
- Estetik Stil: ${aestheticMode}.
${student ? `Öğrenci Senaryosu: ${student.interests?.join(', ')} temalı bir görev kurgula.` : ''}

ALGORİTMA KURALLARI:
1. Her bulmaca için "empty", "obstacle", "start", "target" tiplerini içeren bir grid üret.
2. [KRİTİK]: Talimatlar (instructions), başlangıçtan hedefe ulaştıran geçerli bir rota oluşturmalıdır. Engellerin üzerinden GEÇME.
3. Şifreleme türü "${cipherType}" ise:
   - arrows: "up", "down", "left", "right" yön isimlerini kullan.
   - letters: Y (Yukarı), A (Aşağı), S (Sağa), L (Sola) yönlerini kullan.
   - colors: Mavi (Y), Sarı (A), Kırmızı (S), Yeşil (L) renklerini kullan.
4. "puzzles" dizisinde tam ${puzzleCount} adet bağımsız görev oluştur.
5. Her puzzle için "clinicalMeta" (bilişsel yük, planlama zorluğu) ekle.

Aşağıdaki JSON formatında (DirectionalCodeReadingData) çıktı ver:
- id: "directional_code_premium"
- activityType: "DIRECTIONAL_CODE_READING"
- settings: { "difficulty", "gridSize", "cipherType", "aestheticMode" }
- content: { "title", "storyIntro", "puzzles": [...] }
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      id: { type: 'STRING' },
      activityType: { type: 'STRING' },
      settings: {
        type: 'OBJECT',
        properties: {
          difficulty: { type: 'STRING' },
          gridSize: { type: 'INTEGER' },
          cipherType: { type: 'STRING' },
          aestheticMode: { type: 'STRING' }
        }
      },
      content: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          storyIntro: { type: 'STRING' },
          puzzles: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                title: { type: 'STRING' },
                grid: {
                  type: 'ARRAY',
                  items: {
                    type: 'ARRAY',
                    items: {
                      type: 'OBJECT',
                      properties: {
                        x: { type: 'INTEGER' },
                        y: { type: 'INTEGER' },
                        type: { type: 'STRING' },
                        icon: { type: 'STRING' }
                      }
                    }
                  }
                },
                startPos: { type: 'OBJECT', properties: { x: { type: 'INTEGER' }, y: { type: 'INTEGER' } } },
                targetPos: { type: 'OBJECT', properties: { x: { type: 'INTEGER' }, y: { type: 'INTEGER' } } },
                instructions: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      step: { type: 'INTEGER' },
                      count: { type: 'INTEGER' },
                      direction: { type: 'STRING' },
                      label: { type: 'STRING' }
                    }
                  }
                },
                clinicalMeta: {
                    type: 'OBJECT',
                    properties: {
                        cognitiveLoad: { type: 'NUMBER' },
                        planningComplexity: { type: 'STRING' }
                    }
                }
              },
              required: ['id', 'grid', 'instructions']
            }
          }
        },
        required: ['title', 'puzzles']
      }
    },
    required: ['id', 'content']
  };

  const parsedData = await generateCreativeMultimodal({
    prompt: prompt,
    schema: schema,
    temperature: 0.5,
  });

  return parsedData as DirectionalCodeReadingData;
};

import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { DirectionalCodeReadingData } from '../../types/visual';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts.js';

export const generateDirectionalCodeReadingFromAI = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData> => {
  const difficulty = options.difficulty || 'Orta';
  const gridSize = options.gridSize || 10; // Tek büyük labirent için ızgarayı büyüt
  const obstacleDensity = options.obstacleDensity || 25;
  const cipherType = options.cipherType || 'arrows';
  const puzzleCount = 1; // HER ZAMAN TEK GÖREV (A4-Dolu)
  const aestheticMode = (options as unknown as any).aestheticMode || 'ultra-premium';
  const compactMode = false; // Tek görev olduğu için kompakt yerine geniş yerleşim
  const student = options.studentContext;

  const prompt = `
${PEDAGOGICAL_BASE}
${CLINICAL_DIAGNOSTIC_GUIDE}

GÖREV: [🚀 ULTRA PREMIUM YÖNSEL İZ SÜRME - TEKİL & DEVASA A4 LABİRENT]

PARAMETRELER:
- Zorluk: ${difficulty}
- Izgara: ${gridSize}x${gridSize} (Sayfayı kaplayacak büyüklükte)
- Engel Yoğunluğu: %${obstacleDensity}
- Şifreleme Türü: ${cipherType}
- Estetik Stil: ${aestheticMode}
- Bulmaca Sayısı: 1 (KESİNLİKLE sadece 1 adet devasa görev üret)
${student ? `Öğrenci Senaryosu: ${student.interests?.join(', ')} temalı derinlemesine bir görev kurgula.` : ''}

🎯 ULTRA PREMIUM KURALLAR:
1. [KRİTİK]: Sayfanın tamamını kaplayacak, karmaşık ve uzun rotalı TEK BİR puzzle oluştur.
2. Grid boyutu ${gridSize}x${gridSize} olmalı ve her hücreyi stratejik olarak doldur.
3. [GEÇERLİ ROTA]: Başlangıçtan hedefe giden ve en az 15-20 adımdan oluşan zengin bir rota kurgula.
4. Talimatları (instructions) net ama zorlayıcı tut.
5. Görsel ikonlar ve tema hikayesini (storyIntro) sayfa geneline yay.
6. "clinicalMeta": { planningComplexity: "High", visualScanRequirement: "Intense" } gibi veriler ekle.

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

  return parsedData as unknown as DirectionalCodeReadingData;
};

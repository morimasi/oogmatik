import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { DirectionalCodeReadingData } from '../../types/visual';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts.js';

export const generateDirectionalCodeReadingFromAI = async (
  options: GeneratorOptions
): Promise<DirectionalCodeReadingData> => {
  const difficulty = options.difficulty || 'Orta';
  const gridSize = options.gridSize || 8; // Ultra kompakt için 8x8
  const obstacleDensity = options.obstacleDensity || 20;
  const cipherType = options.cipherType || 'arrows';
  const puzzleCount = options.puzzleCount || (difficulty === 'Zor' ? 4 : 3); // Ultra dolu sayfa
  const aestheticMode = (options as any).aestheticMode || 'ultra-compact';
  const compactMode = (options as any).compactMode || true;
  const student = options.studentContext;

  const prompt = `
${PEDAGOGICAL_BASE}
${CLINICAL_DIAGNOSTIC_GUIDE}

GÖREV: [🚀 ULTRA PREMIUM YÖNSEL İZ SÜRME - KOMPAKT & DOLDURULMUŞ SAYFA]

PARAMETRELER:
- Zorluk: ${difficulty}
- Izgara: ${gridSize}x${gridSize} (Ultra kompakt)
- Engel Yoğunluğu: %${obstacleDensity}
- Şifreleme Türü: ${cipherType} (arrows: oklar, letters: yön harfleri, colors: renk kodları)
- Estetik Stil: ${aestheticMode}
- Bulmaca Sayısı: ${puzzleCount} (Ultra dolu sayfa için)
- Kompakt Mod: ${compactMode}
${student ? `Öğrenci Senaryosu: ${student.interests?.join(', ')} temalı görevler kurgula.` : ''}

🎯 ULTRA PREMIUM KURALLAR:
1. [KRİTİK] Tam ${puzzleCount} adet FARKLI tema ve zorlukta bağımsız puzzle oluştur
2. Her puzzle için "empty", "obstacle", "start", "target" tiplerini içeren ${gridSize}x${gridSize} grid üret
3. [GEÇERLİ ROTA]: Talimatlar (instructions) başlangıçtan hedefe KESİNLİKLE geçerli rota oluşturmalı
4. Ultra kompakt mod için talimatları sıkıştır: "3➡️", "2⬇️", "1⬅️" formatında
5. Görsel ikonlar kullan: start: "🎯", target: "🏁", obstacle: "🚫"
6. Premium temalar: Uzay Lojistiği, Gizli Operasyon, Hazine Macerası, Acil Yardım, Bilimsel Görev
7. Her puzzle için "ultraMode" objesi ekle: {compactLayout: true, minimalPadding: true, densePacking: true}
8. "pedagogicalNote" alanına detaylı açıklama ekle (ZPD, bilişsel yük vurgulu)
9. "visualHints" alanı ekle: {startIcon: "🎯", targetIcon: "🏁", pathColor: tema rengi}

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

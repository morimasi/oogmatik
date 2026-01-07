
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { MathPuzzleData, ShapeCountingData } from '../../types';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **CRA Modeli:** Somut (nesneler) -> Temsili (denklemler) -> Soyut (sayılar) akışını izle.
3.  **Çıktı:** Sadece geçerli JSON.
4.  **"pedagogicalNote":** Etkinliğin diskalkuli rehabilitasyonundaki önemini teknik terimlerle açıkla.
5.  **"imagePrompt":** SVG üretimi için: "Minimalist, flat vector, white background, high contrast, children friendly educational icon" tarzını kullan.
`;

export const generateMathPuzzleFromAI = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
  const { topic, itemCount, difficulty, worksheetCount, operationType, numberRange } = options;
  
  const prompt = `
    [GÖREV]: "${difficulty}" seviyesinde, '${topic || 'Genel'}' temalı ${itemCount} adet "Matematiksel Gizem (Sistemik Denklem)" bulmacası üret.
    
    KURALLAR:
    1. Her bulmaca 3 satırlık bir denklem sistemi içermeli.
    2. Satır 1: İki aynı nesnenin toplamı (Örn: Elma + Elma = 10 -> Elma = 5).
    3. Satır 2: Bilinen nesne + Bilinmeyen nesne (Örn: Elma + Armut = 12 -> Armut = 7).
    4. Satır 3 (Final): Bu nesnelerin karışımından oluşan bir soru (Örn: Armut - Elma = ?).
    5. Sayılar TAM SAYI ve POZİTİF olmalı. ${numberRange ? `Menzil: ${numberRange}` : 'Menzil: 1-50'}.
    6. Nesneler temaya uygun olsun.
    
    ${PEDAGOGICAL_PROMPT}
  `;

  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      puzzles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            equations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  leftSide: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        objectName: { type: Type.STRING }, 
                        multiplier: { type: Type.NUMBER } 
                      } 
                    } 
                  },
                  operator: { type: Type.STRING },
                  rightSide: { type: Type.NUMBER }
                },
                required: ['leftSide', 'operator', 'rightSide']
              }
            },
            finalQuestion: { type: Type.STRING },
            answer: { type: Type.STRING },
            objects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  imagePrompt: { type: Type.STRING }
                },
                required: ['name', 'value', 'imagePrompt']
              }
            }
          },
          required: ['equations', 'finalQuestion', 'answer', 'objects']
        }
      }
    },
    required: ['title', 'puzzles', 'instruction']
  };

  return await generateWithSchema(prompt, { type: Type.ARRAY, items: singleSchema }, 'gemini-3-flash-preview');
};

export const generateShapeCountingFromAI = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Şekil Sayma" (Örn: Kaç üçgen var?).
    Karmaşık, iç içe geçmiş şekillerden oluşan SVG path verileri üret.
    SVG pathleri 'd' attribute olarak ve renkleri 'fill' olarak ver.
    Şekiller birbirini kesmeli ve dikkatli saymayı gerektirmeli.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            figures: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        svgPaths: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    d: { type: Type.STRING },
                                    fill: { type: Type.STRING }
                                },
                                required: ["d", "fill"]
                            }
                        },
                        targetShape: { type: Type.STRING },
                        correctCount: { type: Type.INTEGER }
                    },
                    required: ["svgPaths", "targetShape", "correctCount"]
                }
            }
        },
        required: ["title", "instruction", "figures", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ShapeCountingData[]>;
};

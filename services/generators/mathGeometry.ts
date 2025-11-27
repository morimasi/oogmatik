
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { MathPuzzleData, ShapeCountingData } from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bu etkinlik hangi bilişsel beceriyi (örn: sayı hissi, geometrik algı) desteklediğini açıkla.
3. "instruction": Öğrenciye yönelik net ve anlaşılır bir yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Konuyla ilgili sevimli, renkli bir illüstrasyon.
5. İçerik "Lorem ipsum" olmamalı, gerçek matematiksel problemler içermeli.
`;

export const generateMathPuzzleFromAI = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
  const { topic, itemCount, difficulty, worksheetCount, operations, numberRange } = options;
  
  let rangeDesc = numberRange || (difficulty === 'Orta' ? "1-20" : difficulty === 'Zor' ? "1-50" : "1-10");
  let opsDesc = operations === 'add' ? "toplama" : operations === 'mult' ? "çarpma" : "dört işlem";
  
  const prompt = `
    "${difficulty}" seviyesinde, '${topic || 'Genel'}' temalı ${itemCount} adet Matematik Bulmacası.
    Sayı Aralığı: ${rangeDesc}. İşlemler: ${opsDesc}.
    Nesneler (Elma, Armut vb.) sayılar yerine geçsin.
    Her nesne için **İngilizce** 'imagePrompt' oluştur. Stil: "Simple flat vector icon, colorful".
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
  `;
    const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING }, // Added
      puzzles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            problem: { type: Type.STRING },
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            objects: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ['name', 'imagePrompt']
                }
            }
          },
          required: ['problem', 'question', 'answer', 'objects']
        },
      },
    },
    required: ['title', 'puzzles', 'instruction', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<MathPuzzleData[]>;
};

export const generateShapeCountingFromAI = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde "Şekil Sayma" (Örn: Kaç üçgen var?).
    Karmaşık, iç içe geçmiş şekillerden oluşan SVG path verileri üret.
    SVG pathleri 'd' attribute olarak ve renkleri 'fill' olarak ver.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
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


import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { MathPuzzleData, ShapeCountingData } from '../../types';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"pedagogicalNote":** Bu alan veli/öğretmen içindir. Etkinliğin hangi spesifik bilişsel beceriyi (örn: sayı hissi, geometrik algı, parça-bütün ilişkisi) nasıl desteklediğini akademik ama anlaşılır bir dille açıkla.
4.  **"instruction":** Öğrenciye hitap et. Net, motive edici ve anlaşılır ol.
5.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Flat Vector Art Style", "Educational Illustration", "Clean Lines", "Vibrant Colors".
    - **Detay:** Asla "bir nesne" deme. "Kırmızı, parlak, tek yapraklı bir elma vektörü" de.
    - **Amaç:** Görsel, matematiksel kavramı somutlaştırmalı.
6.  **İçerik:**
    - "Lorem ipsum" yasak.
    - Gerçek, tutarlı ve çözülebilir matematiksel problemler üret.
`;

export const generateMathPuzzleFromAI = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
  const { topic, itemCount, difficulty, worksheetCount, operationType, numberRange } = options;
  
  let rangeDesc = numberRange || (difficulty === 'Orta' ? "1-20" : difficulty === 'Zor' ? "1-50" : "1-10");
  let opsDesc = operationType === 'add' ? "toplama" : operationType === 'mult' ? "çarpma" : "dört işlem";
  
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
      imagePrompt: { type: Type.STRING },
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

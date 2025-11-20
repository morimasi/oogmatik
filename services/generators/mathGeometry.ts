import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { MathPuzzleData, ShapeCountingData } from '../../types';

export const generateMathPuzzleFromAI = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
  const { topic, itemCount, difficulty, worksheetCount, operations, numberRange } = options;
  
  let rangeDesc = numberRange || "1-10";
  if (!numberRange) {
      if (difficulty === 'Orta') rangeDesc = "1-20";
      else if (difficulty === 'Zor') rangeDesc = "1-50";
      else if (difficulty === 'Uzman') rangeDesc = "1-100";
  }

  let opsDesc = "toplama ve çıkarma (+, -)";
  if (operations === 'add') opsDesc = "sadece toplama (+)";
  else if (operations === 'mult') opsDesc = "toplama, çıkarma ve çarpma";
  else if (operations === 'all') opsDesc = "dört işlem (+, -, *, /)";
  else if(difficulty === 'Başlangıç') opsDesc = "sadece toplama (+)";
  
  let complexity = "basit denklemler (A + B = C).";
  if (difficulty === 'Zor') complexity = "iki aşamalı denklemler (A + B = C, C - A = B).";
  if (difficulty === 'Uzman') complexity = "karmaşık ve çoklu bilinmeyenli denklemler (A+A=B, B+C=10 gibi).";

  const prompt = `
    "${difficulty}" zorluk seviyesindeki bir öğrenciye uygun, '${topic || 'Rastgele'}' konusuyla ilgili ${itemCount} tane matematik bulmacası oluştur.
    SAYI ARALIĞI: ${rangeDesc}
    İŞLEMLER: ${opsDesc}
    KARMAŞIKLIK: ${complexity}
    
    Her bulmaca için:
    1. 2-3 adet nesne tanımla (örn: 'elma', 'muz').
    2. Her nesne için bir sayısal değer ve onu temsil eden, **İngilizce**, fotoğraf gerçekliğinde (photorealistic), yüksek kaliteli ve detaylı bir 'imagePrompt' üret (photorealistic 3D render or photograph, studio lighting, isolated on white background, 8k resolution).
    3. Bu nesneleri kullanarak metin tabanlı bir problem ('problem') oluştur (örn: 'elma + muz = ?').
    
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
    const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The title of the puzzle set.'},
      puzzles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            problem: { type: Type.STRING, description: 'The math problem with object names, e.g., "elma + muz = 12"' },
            question: { type: Type.STRING, description: 'The question to be solved, e.g., "Muzun değeri kaçtır?"' },
            answer: { type: Type.STRING, description: 'The numerical answer.' },
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
    required: ['title', 'puzzles']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<MathPuzzleData[]>;
};

export const generateShapeCountingFromAI = async (options: GeneratorOptions): Promise<ShapeCountingData[]> => {
    const { difficulty, worksheetCount } = options;
    
    let complexity = "Çok basit, az sayıda şekil, örtüşme yok.";
    if (difficulty === 'Orta') complexity = "Orta karmaşıklık, bazı şekiller iç içe.";
    if (difficulty === 'Zor' || difficulty === 'Uzman') complexity = "Çok karmaşık, bir sürü iç içe geçmiş üçgen, dikkatli saymayı gerektiren.";

    const prompt = `Create a 'count the triangles' puzzle appropriate for difficulty level "${difficulty}". 
    COMPLEXITY: ${complexity}
    Generate 1 complex figure composed of overlapping triangles and other shapes. The figure should be represented as a list of SVG paths, each with a 'd' attribute and a fill color. The user's goal is to count all the triangles in the figure. 
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
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
                        }
                    },
                    required: ["svgPaths"]
                }
            }
        },
        required: ["title", "prompt", "figures"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ShapeCountingData[]>;
};
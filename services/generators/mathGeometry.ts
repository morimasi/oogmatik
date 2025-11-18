import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { OfflineGeneratorOptions } from '../offlineGenerators';
import { MathPuzzleData, ShapeCountingData, MatchstickSymmetryData, GeneratorOptions } from '../../types';

export const generateMathPuzzleFromAI = async (options: GeneratorOptions): Promise<MathPuzzleData[]> => {
  const { topic, itemCount: count, difficulty, worksheetCount, operations, numberRange } = options;
  
  let rangeDesc = "1-10";
  if (numberRange) rangeDesc = numberRange;
  else if (difficulty === 'Orta') rangeDesc = "1-50";
  else if (difficulty === 'Zor') rangeDesc = "1-100";
  else if (difficulty === 'Uzman') rangeDesc = "1-1000";

  let opsDesc = "sadece toplama (+)";
  if (operations === 'addsub') opsDesc = "toplama ve çıkarma";
  else if (operations === 'mult') opsDesc = "toplama, çıkarma ve çarpma";
  else if (operations === 'all') opsDesc = "dört işlem (+, -, *, /)";
  else if (difficulty === 'Orta') opsDesc = "toplama (+) ve çıkarma (-)";
  
  let complexity = "basit";
  if (difficulty === 'Uzman') complexity = "karmaşık denklemler";

  const prompt = `
    "${difficulty}" zorluk seviyesindeki bir öğrenciye uygun, '${topic}' konusuyla ilgili ${count} tane matematik bulmacası oluştur.
    SAYI ARALIĞI: ${rangeDesc}
    İŞLEMLER: ${opsDesc}
    KARMAŞIKLIK: ${complexity}
    Bulmacalar nesneler veya meyveler kullanarak (örn: '2 elma + 3 muz = ?') hazırlanmalı.
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
            problem: { type: Type.STRING, description: 'The math problem with objects, e.g., "🍎 + 🍌 = 12"' },
            question: { type: Type.STRING, description: 'The question to be solved, e.g., "What is the value of 🍌?"' },
            answer: { type: Type.STRING, description: 'The numerical answer.' },
          },
          required: ['problem', 'question', 'answer']
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

export const generateMatchstickSymmetryFromAI = async(options: GeneratorOptions): Promise<MatchstickSymmetryData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a matchstick symmetry puzzle appropriate for difficulty level "${difficulty}". Generate 3 puzzles. Each puzzle is a number (e.g., 3) made of matchsticks (represented by lines with x1,y1,x2,y2 coordinates). The user must draw the symmetrical reflection. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        number: { type: Type.INTEGER },
                        lines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    x1: { type: Type.NUMBER }, y1: { type: Type.NUMBER },
                                    x2: { type: Type.NUMBER }, y2: { type: Type.NUMBER }
                                },
                                required: ["x1", "y1", "x2", "y2"]
                            }
                        }
                    },
                    required: ["number", "lines"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<MatchstickSymmetryData[]>;
}

import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { MathPuzzleData, ShapeCountingData, MatchstickSymmetryData } from '../../types';

export const generateMathPuzzlesFromAI = async (topic: string, count: number, difficultyLevel: string, worksheetCount: number): Promise<MathPuzzleData[]> => {
  const prompt = `
    "${difficultyLevel}" zorluk seviyesindeki bir öğrenciye uygun, '${topic}' konusuyla ilgili ${count} tane basit matematik bulmacası içeren bir çalışma sayfası oluştur.
    Bulmacalar nesneler veya meyveler kullanarak toplama, çıkarma gibi basit denklemler içermelidir.
    Her bulmaca için bir problem metni (örn: '2 elma + 3 muz = ?'), bir soru (örn: 'Sonuç kaçtır?') ve bir cevap ver.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
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

export const generateShapeCountingFromAI = async (difficultyLevel: string, worksheetCount: number): Promise<ShapeCountingData[]> => {
    const prompt = `Create a 'count the triangles' puzzle appropriate for difficulty level "${difficultyLevel}". Generate 1 complex figure composed of overlapping triangles and other shapes. The figure should be represented as a list of SVG paths, each with a 'd' attribute and a fill color. The user's goal is to count all the triangles in the figure. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
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

export const generateMatchstickSymmetryFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<MatchstickSymmetryData[]> => {
    const prompt = `Create a matchstick symmetry puzzle appropriate for difficulty level "${difficultyLevel}". Generate 3 puzzles. Each puzzle is a number (e.g., 3) made of matchsticks (represented by lines with x1,y1,x2,y2 coordinates). The user must draw the symmetrical reflection. 
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
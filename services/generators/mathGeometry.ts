import { Type } from "@google/genai";
// FIX: Replaced non-existent 'generateWithSchema' with 'generateWorksheetData'.
import { generateWorksheetData } from '../geminiClient';
import { MathPuzzleData, ShapeCountingData, MatchstickSymmetryData } from '../../types';

export const generateMathPuzzlesFromAI = async (topic: string, count: number): Promise<MathPuzzleData> => {
  const prompt = `
    Çocuklar için '${topic}' konusuyla ilgili ${count} tane basit matematik bulmacası oluştur. 
    Bulmacalar nesneler veya meyveler kullanarak toplama, çıkarma gibi basit denklemler içermelidir.
    Her bulmaca için bir problem metni (örn: '2 elma + 3 muz = ?'), bir soru (örn: 'Sonuç kaçtır?') ve bir cevap ver.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
    const schema = {
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
  // FIX: Replaced non-existent 'generateWithSchema' with 'generateWorksheetData'.
  return generateWorksheetData(prompt, schema) as Promise<MathPuzzleData>;
};

export const generateShapeCountingFromAI = async (): Promise<ShapeCountingData> => {
    const prompt = `Create a 'count the triangles' puzzle. Generate 1 complex figure composed of overlapping triangles and other shapes. The figure should be represented as a list of SVG paths, each with a 'd' attribute and a fill color. The user's goal is to count all the triangles in the figure. Format as JSON.`;
    const schema = {
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
    // FIX: Replaced non-existent 'generateWithSchema' with 'generateWorksheetData'.
    return generateWorksheetData(prompt, schema) as Promise<ShapeCountingData>;
};

export const generateMatchstickSymmetryFromAI = async(): Promise<MatchstickSymmetryData> => {
    const prompt = `Create a matchstick symmetry puzzle. Generate 3 puzzles. Each puzzle is a number (e.g., 3) made of matchsticks (represented by lines with x1,y1,x2,y2 coordinates). The user must draw the symmetrical reflection. Format as JSON.`;
    const schema = {
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
    // FIX: Replaced non-existent 'generateWithSchema' with 'generateWorksheetData'.
    return generateWorksheetData(prompt, schema) as Promise<MatchstickSymmetryData>;
}
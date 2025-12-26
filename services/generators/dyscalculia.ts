
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, 
    NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData,
    RealLifeProblemData, ActivityType
} from '../../types';

const PEDAGOGICAL_PROMPT = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI]
Diskalkuli destekli materyal üret. Sadece JSON döndür.
`;

export const generateNumberSenseFromAI = async (options: GeneratorOptions): Promise<NumberSenseData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Sayı Hissi etkinliği üret. Seviye: ${difficulty}. ${PEDAGOGICAL_PROMPT}`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                layout: { type: Type.STRING },
                exercises: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            values: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            target: { type: Type.NUMBER },
                            visualType: { type: Type.STRING }
                        },
                        required: ['type', 'values']
                    }
                }
            },
            required: ['title', 'instruction', 'exercises']
        }
    };
    return generateWithSchema(prompt, schema);
};

export const generateRealLifeMathProblemsFromAI = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { topic, difficulty } = options;
    const prompt = `Günlük yaşam matematik problemleri üret. Konu: ${topic}, Zorluk: ${difficulty}. ${PEDAGOGICAL_PROMPT}`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                problems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            solution: { type: Type.STRING }
                        },
                        required: ['text', 'solution']
                    }
                }
            },
            required: ['title', 'problems']
        }
    };
    return generateWithSchema(prompt, schema);
};

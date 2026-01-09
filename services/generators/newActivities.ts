
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { 
    GeneratorOptions, 
    FindLetterPairData,
    ActivityType
} from '../../types';
import { PEDAGOGICAL_BASE, getStudentContextPrompt } from './prompts';

export const generateFindLetterPairFromAI = async (options: GeneratorOptions): Promise<FindLetterPairData[]> => {
    const { difficulty, gridSize = 10, itemCount = 1, targetPair, studentContext } = options;
    
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: "Harf İkilisi Dedektifi" etkinliği oluştur. 
    ZORLUK: ${difficulty}
    IZGARA BOYUTU: ${gridSize}x${gridSize}
    ADET: ${itemCount} adet bağımsız ızgara.
    HEDEF İKİLİ: ${targetPair || 'AI Seçsin (b-d, p-q, m-n gibi disleksi odaklı karıştırılan çiftler tercih et)'}

    TASARIM KURALLARI:
    1. Her ızgara (grid), ${gridSize}x${gridSize} boyutunda bir matris olmalıdır.
    2. Hedef ikili, her ızgarada en az ${Math.floor(gridSize * 0.8)}, en fazla ${gridSize * 1.5} kez geçmelidir (yatay veya dikey).
    3. Çeldiriciler, hedef harflere görsel olarak çok benzeyen karakterlerden seçilmelidir.
    4. SADECE GEÇERLİ JSON DÖNDÜR.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                grids: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                            targetPair: { type: Type.STRING }
                        },
                        required: ['grid', 'targetPair']
                    }
                }
            },
            required: ['title', 'grids', 'instruction']
        }
    };

    const result = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
    return result.map((page: any) => ({
        ...page,
        settings: { gridSize, itemCount, difficulty }
    }));
};

/**
 * Fix: Added generateFromRichPrompt for OCR and custom layout cloning support.
 */
export const generateFromRichPrompt = async (activityType: ActivityType, instructions: string, options: GeneratorOptions): Promise<any> => {
    const { difficulty, itemCount, topic } = options;
    
    const prompt = `
    ${PEDAGOGICAL_BASE}
    
    GÖREV: Aşağıdaki teknik blueprint'i kullanarak içerik üret.
    BLUEPRINT: ${instructions}
    
    ZORLUK: ${difficulty}
    ADET: ${itemCount}
    KONU: ${topic}
    `;

    // Loose schema because blueprint is arbitrary
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            sections: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        type: { type: Type.STRING },
                        content: { type: Type.STRING },
                        items: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

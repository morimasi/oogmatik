
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, ActivityType } from '../../types';
import { PEDAGOGICAL_BASE } from './prompts';

export const generateFromRichPrompt = async (activityType: ActivityType, blueprint: string, options: GeneratorOptions): Promise<any> => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    [ROLE: REMATERIALIZATION ENGINE - GEMINI 3 FLASH THINKING]
    
    GÖREV: Aşağıdaki TEKNİK BLUEPRINT'i (MİMARİ DNA) al ve onu BİREBİR AYNI DÜZENDE ama 100% YENİ VERİLERLE inşa et.
    
    MİMARİ DNA:
    ${blueprint}
    
    KURALLAR:
    1. Görseldeki tablo yapılarını ve blok sıralamasını ASLA DEĞİŞTİRME.
    2. Metinleri 'SOLUTION_LOGIC' kurallarına uyarak yeniden yaz.
    3. Zorluk Seviyesi: ${options.difficulty}
    
    Üretimden önce disleksi dostu hiyerarşiyi derinlemesine düşün.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            layoutArchitecture: {
                type: Type.OBJECT,
                properties: {
                    cols: { type: Type.INTEGER },
                    blocks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                content: { type: Type.OBJECT }
                            },
                            required: ['type', 'content']
                        }
                    }
                },
                required: ['blocks']
            }
        },
        required: ['title', 'instruction', 'layoutArchitecture']
    };

    return await generateWithSchema(prompt, schema);
};

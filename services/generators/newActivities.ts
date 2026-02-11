
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, ActivityType } from '../../types';
import { PEDAGOGICAL_BASE } from './prompts';

export const generateFromRichPrompt = async (activityType: ActivityType, blueprint: string, options: GeneratorOptions): Promise<any> => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    [ROLE: REMATERIALIZATION ENGINE]
    
    GÖREV: Aşağıdaki TEKNİK BLUEPRINT'i (MİMARİ DNA) al ve onu BİREBİR AYNI DÜZENDE ama 100% YENİ VERİLERLE inşa et.
    
    MİMARİ DNA:
    ${blueprint}
    
    KURALLAR:
    1. Görseldeki tablo yapılarını, satır/sütun sayılarını ve blok sıralamasını ASLA DEĞİŞTİRME.
    2. Metinleri ve sayıları blueprint'teki 'SOLUTION_LOGIC' kurallarına uyarak yeniden yaz.
    3. Eğer blueprint 2x2 grid diyorsa, 'layoutArchitecture.cols: 2' ayarını yap.
    4. Tüm mantık sorularını 'logic_card' blokları olarak çıktıla.
    5. Cevapların tutarlı olduğundan ve 'FOOTER_VALIDATION' kuralına uyduğundan emin ol.
    
    Zorluk: ${options.difficulty}
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

    return await generateWithSchema(prompt, schema, 'gemini-3-pro-preview');
};

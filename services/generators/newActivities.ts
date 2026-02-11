
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { 
    GeneratorOptions, 
    ActivityType
} from '../../types';
import { PEDAGOGICAL_BASE, getStudentContextPrompt } from './prompts';

/**
 * generateFromRichPrompt: MİMARİ KLONLAMA MOTORU (GOD MODE)
 * AI'dan gelen yapısal mimariyi (layoutArchitecture) kullanarak BİREBİR klon üretir.
 */
export const generateFromRichPrompt = async (activityType: ActivityType, blueprint: string, options: GeneratorOptions): Promise<any> => {
    const { difficulty, topic, studentContext } = options;
    
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: Aşağıdaki TEKNİK BLUEPRINT'i kullanarak BİREBİR AYNI MİMARİDE yeni bir sayfa üret.
    
    BLUEPRINT (MİMARİ DNA):
    ${blueprint}
    
    TALİMATLAR:
    1. 'layoutArchitecture' objesi içindeki blok sıralamasını ve tiplerini KESİNLİKLE DEĞİŞTİRME.
    2. Sadece 'content' alanlarındaki verileri (metinler, sayılar, hücre içerikleri) klonla veya güncelle.
    3. Konu: ${topic || 'Orijinal içerik ile aynı'}
    4. Zorluk Seviyesi: ${difficulty}
    
    ÖNEMLİ: Tüm metinler 'string' olmalı. Kesinlikle nested object ({text: '...'}) döndürme.
    Çıktı mutlaka 'layoutArchitecture' anahtarını içermelidir.
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
                    blocks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                content: { type: Type.OBJECT, properties: {
                                    text: { type: Type.STRING },
                                    cols: { type: Type.INTEGER },
                                    rows: { type: Type.INTEGER },
                                    cells: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    data: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                    left: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    right: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    prompt: { type: Type.STRING },
                                    viewBox: { type: Type.STRING },
                                    paths: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }},
                                style: { type: Type.OBJECT, properties: { textAlign: { type: Type.STRING }, fontWeight: { type: Type.STRING } } }
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

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

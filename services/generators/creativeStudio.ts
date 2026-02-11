
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

/**
 * refinePromptWithAI: Kullanıcının promptunu profesyonel seviyeye taşır.
 */
export const refinePromptWithAI = async (userPrompt: string, mode: 'expand' | 'narrow' | 'clinical'): Promise<string> => {
    const instruction = mode === 'expand' 
        ? "Bu promptu pedagojik derinlik katarak, disleksi dostu materyal üretim kurallarıyla zenginleştir."
        : mode === 'narrow'
        ? "Bu promptu sadeleştir, sadece en temel klinik hedefe odaklan ve netleştir."
        : "Bu prompta klinik tanı kriterleri ekle (reversal errors, phonological gaps vb.).";

    const prompt = `
    [GÖREV: PROMPT MİMARI]
    HAM PROMPT: "${userPrompt}"
    TALİMAT: ${instruction}
    
    KURAL: Sonuç doğrudan bir yapay zeka modeline talimat olarak gönderilecektir. 
    İçeriğinde "Şunu yap", "Şu formatta olsun" gibi net emirler barındırmalıdır.
    Sadece zenginleştirilmiş metni döndür.
    `;

    const schema = { 
        type: Type.OBJECT, 
        properties: { 
            refined: { type: Type.STRING } 
        }, 
        required: ['refined'] 
    };
    // Model parametresi kaldırıldı, geminiClient varsayılan Thinking-Flash kullanacak
    const result = await generateWithSchema(prompt, schema);
    return result.refined;
};

/**
 * generateCreativeStudioActivity: Zenginleştirilmiş prompt ile tam layout üretir.
 */
export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any) => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: NÖRO-MİMARİ ÜRETİM
    
    TALİMAT:
    ${enrichedPrompt}
    
    PARAMETRELER:
    - Zorluk: ${options.difficulty}
    - Öğe Sayısı: ${options.itemCount}
    
    KRİTİK: Çıktı mutlaka 'layoutArchitecture' formatında ve 'blocks' dizisi içermelidir.
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
                                type: { type: Type.STRING, enum: ['header', 'text', 'grid', 'table', 'svg_shape', 'dual_column', 'image'] },
                                content: { 
                                    type: Type.OBJECT,
                                    properties: {
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
                                    }
                                }
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

    // Artık varsayılan olarak gemini-3-flash-preview (Thinking) kullanılacak
    return await generateWithSchema(prompt, schema);
};

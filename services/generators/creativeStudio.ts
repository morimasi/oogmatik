
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { ReadingStudioConfig } from '../../types';

/**
 * enrichUserPrompt: Kullanıcının kısa fikrini pedagojik bir blueprint'e dönüştürür.
 */
export const enrichUserPrompt = async (userIdea: string): Promise<string> => {
    const prompt = `
    [GÖREV: PROFESYONEL EĞİTİM PROMPT YAZARI]
    Kullanıcının şu ham fikrini al: "${userIdea}"
    
    Bu fikri, Gemini 3.0 modelinin en yüksek performansta (Multimodal Thinking) çalışabilmesi için 
    ultra detaylı, pedagojik kısıtlamaları olan ve disleksi dostu bir MİMARİ TALİMAT'a dönüştür.
    
    TALİMAT ŞUNLARI İÇERMELİ:
    1. Bilişsel Hedefler (Görsel dikkat, fonolojik farkındalık vb.)
    2. Grafik Düzeni (Kaç blok, hangi tablolar, hangi SVG şekilleri kullanılmalı)
    3. Dil Seviyesi (TDK kuralları, heceleme hassasiyeti)
    
    Sadece zenginleştirilmiş prompt metnini döndür.
    `;

    const schema = { type: Type.OBJECT, properties: { enrichedPrompt: { type: Type.STRING } }, required: ['enrichedPrompt'] };
    const result = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
    return result.enrichedPrompt;
};

/**
 * generateCreativeStudioActivity: Zenginleştirilmiş prompt ile tam layout üretir.
 */
export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any) => {
    const prompt = `
    [GÖREV: NÖRO-MİMARİ ÜRETİM MOTORU v5.0]
    
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
                }
            }
        },
        required: ['title', 'instruction', 'layoutArchitecture']
    };

    // Thinking Budget bu aşamada kritik.
    return await generateWithSchema(prompt, schema, 'gemini-3-pro-preview');
};

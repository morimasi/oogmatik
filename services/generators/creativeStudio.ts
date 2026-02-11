
import { Type } from "@google/genai";
import { generateCreativeMultimodal, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

// ... other functions ...

/**
 * generateCreativeStudioActivity: Zenginleştirilmiş prompt ve profesyonel parametrelerle üretim.
 */
export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
    
    // Parametreleri AI için talimata dönüştür
    const clinicalDirectives = `
    [KLİNİK PARAMETRELER - KRİTİK]
    1. ZORLUK SEVİYESİ: ${options.difficulty}. 
       - 'Başlangıç' ise: Somut, tek aşamalı görevler.
       - 'Zor' ise: Soyut, 3+ aşamalı mantık zincirleri.
    
    2. ÇELDİRİCİ YOĞUNLUĞU: ${options.distractionLevel}.
       - 'low' ise: Yanlış şıklar belirgin şekilde farklı olsun.
       - 'high' ise: Yanlış şıklar hedefe fonemik veya görsel olarak (b-d gibi) çok yakın olsun.
    
    3. TİPOGRAFİK ÖLÇEK: ${options.fontSizePreference}.
       - 'large' ise: Metin blokları için "fontSize: 24-28" ve geniş satır aralığı kullan.
       - 'small' ise: "fontSize: 14-16" kullan.
    `;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    ${clinicalDirectives}
    
    GÖREV: PROFESYONEL EĞİTİM MATERYALİ SENTEZİ
    
    TALİMAT:
    ${enrichedPrompt}
    
    PARAMETRELER:
    - Hedef Öğe Sayısı: ${options.itemCount}
    
    TEKNİK ŞARTLAR:
    1. 'layoutArchitecture' formatında 'blocks' dizisi döndür.
    2. 'viewBox' her zaman "0 0 100 100" olmalıdır.
    3. Metinlerin 'style' alanına 'fontSize' değerini parametreye uygun enjekte et.
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
                                },
                                style: {
                                    type: Type.OBJECT,
                                    properties: {
                                        fontSize: { type: Type.INTEGER },
                                        fontWeight: { type: Type.STRING },
                                        textAlign: { type: Type.STRING }
                                    }
                                },
                                weight: { type: Type.INTEGER }
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

    return await generateCreativeMultimodal({ prompt, schema, files });
};

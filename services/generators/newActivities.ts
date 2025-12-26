
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, ActivityType } from '../../types';

const RECONSTRUCTION_PROMPT = `
[ROL: MATEMATİK VE DİL MATERYALİ ÜRETİM MOTORU]
GÖREV: Verilen teknik plana uygun özgün içerik üret.

ÜRETİM PROTOKOLÜ:
1. **Çeşitlilik:** Her bir soru veya içerik öğesi bir öncekinden FARKLI olmalıdır. Aynı veriyi tekrar etme.
2. **Yapısal Sadakat:** Planda 'tablo' deniliyorsa tablo, 'grid' deniliyorsa grid kullan.
3. **Miktar:** 'itemCount' kadar benzersiz öğe üret. Sayfayı doldur.
4. **Hata Önleme:** JSON yapısı içinde asla sonsuz metin blokları oluşturma. Kısa, öz ve yapısal ol.
5. **Klonlama Hassasiyeti:** Eğer bu bir "Dönüştürücü" göreviyse, orijinal materyalin ruhunu (mantığını) koru ama verileri (sayılar, isimler, sorular) tamamen YENİLE.
`;

export const generateAiWorksheetConverterFromAI = async (options: GeneratorOptions) => {
    // This is used for the AI Worksheet Converter feature
    return generateFromRichPrompt('AI_WORKSHEET_CONVERTER' as ActivityType, options.topic || "Görsel Materyal Dönüşümü", options);
};

export const generateOcrContentFromAI = async (options: GeneratorOptions) => {
    // This is used for OCR Content Reconstruction
    return generateFromRichPrompt('OCR_CONTENT' as ActivityType, options.topic || "OCR Analizi", options);
};

export const generateFromRichPrompt = async (activityType: ActivityType, blueprint: string, options: GeneratorOptions, layoutHint?: any) => {
    
    const schema = {
        type: Type.ARRAY,
        items: {
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
                            content: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        type: { type: Type.STRING, enum: ['text', 'image', 'table', 'question', 'key_value'] },
                                        text: { type: Type.STRING },
                                        label: { type: Type.STRING },
                                        value: { type: Type.STRING },
                                        imagePrompt: { type: Type.STRING },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        answer: { type: Type.STRING },
                                        headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                                    },
                                    required: ['type']
                                }
                            }
                        }
                    }
                }
            },
            required: ['title', 'instruction', 'sections']
        }
    };

    const finalPrompt = `
    ${RECONSTRUCTION_PROMPT}

    [TEKNİK PLAN]: ${blueprint}
    [AYARLAR]: Seviye: ${options.difficulty}, Konu: ${options.topic || 'Genel'}, Adet: ${options.itemCount || 10}
    [DÜZEN]: ${layoutHint ? JSON.stringify(layoutHint) : 'Otomatik'}

    DİKKAT: Sadece geçerli JSON döndür. Gemini 3.0 Flash Preview yeteneklerini kullanarak zengin, hatasız ve pedagojik olarak tutarlı bir çalışma sayfası oluştur.
    `;

    return generateWithSchema(finalPrompt, schema, 'gemini-3-flash-preview', options.useSearch);
};

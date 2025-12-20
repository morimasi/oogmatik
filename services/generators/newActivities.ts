
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, ActivityType } from '../../types';

const RECONSTRUCTION_PROMPT = `
[ROL: MATEMATİK VE DİL MATERYALİ ÜRETİM MOTORU]
GÖREV: Sana verilen TEKNİK PLANA (Blueprint) uygun olarak bir çalışma sayfası İÇERİĞİ üret.

STRATEJİ:
1. **Planda ne varsa onu yap:** Eğer plan bir tablo diyorsa 'sections' içine tablo objesi koy.
2. **İçeriği zenginleştir:** Konuyla uyumlu, çocuk dostu ve eğitici veriler yaz.
3. **Sayfayı doldur:** A4 sayfasının boş kalmaması için yeterli sayıda (itemCount kadar) veri üret.

MİMARİ KURALLAR:
- Her 'section' kendi 'layoutConfig' değerine sahip olabilir.
- 'content' dizisindeki her obje mutlaka 'type' içermelidir ('text', 'table', 'question', 'image' vb.).
`;

export const generateFromRichPrompt = async (activityType: ActivityType, blueprint: string, options: GeneratorOptions, layoutHint?: any) => {
    
    // Basitleştirilmiş ve daha hızlı yanıt veren şema
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

    [TEKNİK PLAN (BLUEPRINT)]:
    ${blueprint}
    
    [KONFİGÜRASYON]:
    - SEVİYE: ${options.difficulty}
    - KONU: ${options.topic || 'Genel'}
    - ADET: ${options.itemCount || 10}
    - LAYOUT: ${layoutHint ? JSON.stringify(layoutHint) : 'Otomatik'}

    DİKKAT: Yanıt sadece geçerli JSON olmalı. Sayfanın mimarisi orijinal görseldekiyle aynı kalmalıdır.
    `;

    // Kesinlikle gemini-3-flash-preview kullanıyoruz
    return generateWithSchema(finalPrompt, schema, 'gemini-3-flash-preview', options.useSearch);
};

export const generateFamilyRelationsFromAI = async (options: GeneratorOptions) => [];
export const generateLogicDeductionFromAI = async (options: GeneratorOptions) => [];
export const generateNumberBoxLogicFromAI = async (options: GeneratorOptions) => [];
export const generateMapInstructionFromAI = async (options: GeneratorOptions) => [];
export const generateMindGamesFromAI = async (options: GeneratorOptions) => [];
export const generateMindGames56FromAI = async (options: GeneratorOptions) => [];

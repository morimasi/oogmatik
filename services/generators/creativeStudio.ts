
import { Type } from "@google/genai";
import { generateCreativeMultimodal, generateWithSchema, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
    
    const visualFrameworkDirectives = `
    [MİMARİ DİSİPLİN - KRİTİK]
    1. 'layoutArchitecture.blocks' dizisini zengin bileşenlerle doldur.
    2. 'layoutArchitecture.cols' değerini kullanarak sayfayı 2 sütunlu (2x2 grid gibi) yapabilirsin.
    3. 'logic_card' bloğu kullan: Bu blok 'text' (soru), 'data' (2D tablo), 'options' (şıklar) ve 'logic' (çözüm yolu) içerir.
    4. 'svg_shape' bloğu için: viewBox KESİNLİKLE "0 0 100 100" olmalı.
    5. 'table' bloğu için: 'headers' (string[]) ve 'data' (string[][]) alanlarını doldur.
    6. 'footer_validation' bloğu kullan: Sayfadaki soruların cevaplarının toplamını veya kontrolünü içeren büyük bir kutu.
    7. Sayısal hallüsinasyonlardan kaçın. Hiçbir sayı 1000'den büyük olmamalıdır.
    `;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${visualFrameworkDirectives}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    [GÖREV]
    Kullanıcı İstemi: "${enrichedPrompt}"
    Zorluk: ${options.difficulty}
    Öğe Sayısı: ${options.itemCount}
    
    NOT: Eğer girdi bir mantıksal sayı bulmacası ise; her soruyu bir 'logic_card' olarak tasarla ve sayfayı 'cols: 2' düzenine sok.
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
                    gap: { type: Type.INTEGER },
                    blocks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['header', 'text', 'grid', 'table', 'svg_shape', 'dual_column', 'image', 'logic_card', 'footer_validation'] },
                                content: { 
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING },
                                        cols: { type: Type.INTEGER },
                                        rows: { type: Type.INTEGER },
                                        cells: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        data: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        logic: { type: Type.STRING },
                                        left: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        right: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        prompt: { type: Type.STRING },
                                        viewBox: { type: Type.STRING },
                                        paths: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        targetValue: { type: Type.INTEGER }
                                    }
                                },
                                style: {
                                    type: Type.OBJECT,
                                    properties: {
                                        textAlign: { type: Type.STRING },
                                        fontWeight: { type: Type.STRING },
                                        fontSize: { type: Type.INTEGER },
                                        backgroundColor: { type: Type.STRING }
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

    return await generateCreativeMultimodal({ prompt, schema, files });
};

export const refinePromptWithAI = async (prompt: string, mode: 'expand' | 'clinical'): Promise<string> => {
    const aiPrompt = `Bu istemi teknik detaylar ve klinik yönergelerle zenginleştir: "${prompt}"`;
    const result = await generateWithSchema(aiPrompt, { type: Type.OBJECT, properties: { refined: { type: Type.STRING } }, required: ['refined'] });
    return result.refined;
};

export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
    const prompt = `Görseldeki tasarımı analiz et ve 'BLUEPRINT_V1.0 :: NEURO_ARCH_ENGINE' formatında teknik bir blueprint çıkar.`;
    const result = await generateCreativeMultimodal({ prompt, schema: { type: Type.OBJECT, properties: { analysis: { type: Type.STRING } }, required: ['analysis'] }, files });
    return result.analysis;
};

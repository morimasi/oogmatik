
import { Type } from "@google/genai";
import { generateCreativeMultimodal, generateWithSchema, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
    
    const visualFrameworkDirectives = `
    [MİMARİ DİSİPLİN - KRİTİK]
    1. 'layoutArchitecture.blocks' dizisini zengin bileşenlerle doldur.
    2. 'svg_shape' bloğu için: viewBox KESİNLİKLE "0 0 100 100" olmalı.
    3. 'table' bloğu için: 'headers' (string[]) ve 'data' (string[][]) alanlarını doldur. 'data' her zaman tırnak içinde string içermelidir.
    4. Sayısal hallüsinasyonlardan kaçın. Hiçbir sayı 1000'den büyük olmamalıdır.
    5. Koordinat sistemini (x, y) 0-100 skalasında tut.
    `;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${visualFrameworkDirectives}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    [GÖREV]
    Kullanıcı İstemi: "${enrichedPrompt}"
    Zorluk: ${options.difficulty}
    Öğe Sayısı: ${options.itemCount}
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

    return await generateCreativeMultimodal({ prompt, schema, files });
};

export const refinePromptWithAI = async (prompt: string, mode: 'expand' | 'clinical'): Promise<string> => {
    const aiPrompt = `Bu istemi teknik detaylar ve klinik yönergelerle zenginleştir: "${prompt}"`;
    const result = await generateWithSchema(aiPrompt, { type: Type.OBJECT, properties: { refined: { type: Type.STRING } }, required: ['refined'] });
    return result.refined;
};

export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
    const prompt = `Görseldeki tasarımı analiz et ve 'grid', 'table' veya 'svg_shape' bloklarını kullanarak teknik bir blueprint çıkar.`;
    const result = await generateCreativeMultimodal({ prompt, schema: { type: Type.OBJECT, properties: { analysis: { type: Type.STRING } }, required: ['analysis'] }, files });
    return result.analysis;
};

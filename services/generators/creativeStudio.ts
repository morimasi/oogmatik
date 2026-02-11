
import { Type } from "@google/genai";
import { generateCreativeMultimodal, generateWithSchema, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

/**
 * generateCreativeStudioActivity: 
 * JSON Repair hatasını önlemek için Type.INTEGER kullanımı ve viewBox kısıtlaması.
 */
export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
    
    const clinicalDirectives = `
    [KLİNİK PARAMETRELER - KRİTİK]
    1. ZORLUK SEVİYESİ: ${options.difficulty}. Basitlik ve aşama sayısını buna göre ayarla.
    2. ÇELDİRİCİ YOĞUNLUĞU: ${options.distractionLevel}. 'high' ise benzer harf/şekil (b-d, m-n) kullan.
    3. TİPOGRAFİK ÖLÇEK: ${options.fontSizePreference}. 'large' ise metin boyutlarını artır.
    
    KRİTİK GÖRSEL KURALI: 
    - 'viewBox' her zaman "0 0 100 100" olmalıdır. 
    - ASLA büyük rakamlar (1000000...) kullanma.
    `;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    ${clinicalDirectives}
    GÖREV: PROFESYONEL EĞİTİM MATERYALİ SENTEZİ
    TALİMAT: ${enrichedPrompt}
    
    PARAMETRELER:
    - Hedef Öğe Sayısı: ${options.itemCount}
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
                                // Fix: Added 'question' to allowed block types enum
                                type: { type: Type.STRING, enum: ['header', 'text', 'grid', 'table', 'svg_shape', 'dual_column', 'image', 'question'] },
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

/* Fix: Implemented missing prompt refinement utility with 'narrow' mode support */
export const refinePromptWithAI = async (prompt: string, mode: 'expand' | 'narrow' | 'clinical'): Promise<string> => {
    const instruction = mode === 'expand' 
        ? "Bu promptu pedagojik derinlik katarak, disleksi dostu materyal üretim kurallarıyla zenginleştir."
        : mode === 'narrow'
            ? "Bu promptu daha spesifik, odaklanmış ve kısa bir görev haline getir."
            : "Bu prompta klinik tanı kriterleri ekle (reversal errors, phonological gaps vb.).";

    const aiPrompt = `[GÖREV: PROMPT MİMARI]\nHAM PROMPT: "${prompt}"\nTALİMAT: ${instruction}\nSADECE zenginleştirilmiş metni döndür.`;
    
    const schema = { 
        type: Type.OBJECT, 
        properties: { refined: { type: Type.STRING } }, 
        required: ['refined'] 
    };
    const result = await generateWithSchema(aiPrompt, schema, 'gemini-3-flash-preview');
    return result.refined;
};

/* Fix: Implemented missing file analysis utility */
export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
    const prompt = `
    [GÖREV: PEDAGOJİK MİMARİ ANALİST]
    Ekteki dosyaları teknik olarak analiz et. 
    KULLANICI TERCİHİ: "${currentPrompt}"
    
    GÖREVİN: Bu dosyaları referans alarak, Bursa Disleksi AI motorunun BİREBİR AYNI KALİTEDE VE YAPIDA bir çıktı üretmesi için gereken DETAYLI TEKNİK PROMPTU OLUŞTUR.
    İçerisinde [MİMARİ], [İÇERİK PLANI] başlıkları olmalı.
    `;
    const schema = { 
        type: Type.OBJECT, 
        properties: { analysis: { type: Type.STRING } }, 
        required: ['analysis'] 
    };
    const result = await generateCreativeMultimodal({ prompt, schema, files, useFlash: true });
    return result.analysis;
};

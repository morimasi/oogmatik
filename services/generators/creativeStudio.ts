
import { Type } from "@google/genai";
import { generateCreativeMultimodal, generateWithSchema, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

/**
 * refinePromptWithAI: Kullanıcı istemini klinik ve teknik bir master prompta dönüştürür.
 */
export const refinePromptWithAI = async (currentPrompt: string, mode: 'expand' | 'clinical'): Promise<string> => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    GÖREV: Kullanıcı istemini, Bursa Disleksi AI'nın "Neuro-Arch Engine" motoru için teknik bir blueprint üretim komutuna dönüştür.
    İSTEM: "${currentPrompt}"
    MOD: ${mode}
    ÇIKTI: Sadece 'refined' anahtarlı JSON.
    `;
    const result = await generateWithSchema(prompt, { type: Type.OBJECT, properties: { refined: { type: Type.STRING } }, required: ['refined'] });
    return result.refined;
};

/**
 * analyzeReferenceFiles: GOD MODE - GÖRSELİN DNA'SINI ÇIKARIR
 */
export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
    const prompt = `
    [GÖREV: NEURO-ARCHITECTURAL REVERSE ENGINEERING]
    Bu görseli bir AI Mühendisi ve Özel Eğitim Uzmanı olarak analiz et. 
    Görselin "MİMARİ DNA"sını çıkarman gerekiyor.
    
    ANALİZ PROTOKOLÜ:
    1. ROOT_CONTAINER: Sayfa akış yapısı (Vertical_Stack, Grid_2x2, vb.)
    2. LOGIC_MODULES: Her bir kutunun tipi, içindeki metin, veri tablosu yapısı ve seçenek algoritması.
    3. CLINICAL_PATTERN: Çeldiricilerin mantığı (Ayna harfler mi, sayısal yakınlık mı?)
    4. FOOTER_VALIDATION: Sayfa sonu doğrulama mekanizması var mı?
    
    [ÇIKTI FORMATI: BLUEPRINT_V1.0]
    Aşağıdaki yapıda teknik bir analiz metni yaz (Bunu diğer Gemini modeli okuyacak):
    BLUEPRINT_V1.0 :: NEURO_ARCH_ENGINE
    ROOT_CONTAINER: ...
    PAGE_1_BLUEPRINT:
      LAYOUT: ...
      BLOCK_X: { TYPE, TEXT, DATA_TABLE, OPTIONS, SOLUTION_LOGIC }
    FOOTER_VALIDATION: ...
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            analysis: { type: Type.STRING },
            detectedLogic: { type: Type.STRING }
        },
        required: ['analysis']
    };

    const result = await generateCreativeMultimodal({ prompt, schema, files, useFlash: false });
    return result.analysis;
};

export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    GÖREV: Aşağıdaki BLUEPRINT veya Komutu kullanarak BİREBİR AYNI MİMARİDE yeni bir çalışma sayfası üret.
    
    [BLUEPRINT / KOMUT]:
    ${enrichedPrompt}
    
    KRİTİK TALİMAT:
    1. Eğer girdi bir 'BLUEPRINT_V1.0' ise, 'layoutArchitecture.blocks' yapısını birebir koru.
    2. Tüm içerikleri (sayılar, kelimeler) orijinalden FARKLI ama aynı mantıksal zorlukta üret.
    3. 'logic_card' tipini kompleks mantık blokları için kullan.
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
                                type: { type: Type.STRING, enum: ['header', 'text', 'grid', 'table', 'logic_card', 'footer_validation', 'image'] },
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

    return await generateCreativeMultimodal({ prompt, schema, files });
};


import { Type } from "@google/genai";
import { generateCreativeMultimodal, generateWithSchema, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

/**
 * analyzeReferenceFiles: GÖRSELİN MİMARİ DNA'SINI ÇIKARIR (Thinking Mode)
 */
export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
    const prompt = `
    [GÖREV: NEURO-ARCHITECTURAL REVERSE ENGINEERING]
    Bu görseli bir AI Mühendisi ve Özel Eğitim Uzmanı olarak "Thinking" modunda analiz et. 
    Görselin "MİMARİ DNA"sını çıkarman gerekiyor.
    
    ANALİZ ADIMLARI:
    1. TABLO YAPISI: Görseldeki her bir tabloyu 'grid' veya 'table' bloğu olarak tanımla.
    2. SORU MANTIĞI: Sorular nasıl kurgulanmış? (Örn: 'B' harfini 'D' harfinden ayırt etme).
    3. HATA ANALİZİ: Bu etkinlikteki çeldirici stratejisi nedir? (Ayna etkisi mi, ardışıklık mı?)
    
    [ÇIKTI FORMATI: BLUEPRINT_V1.0]
    Yeni bir Gemini isteği için MASTER PROMPT oluştur. Bu prompt, 'layoutArchitecture' yapısını mükemmel şekilde tarif etmeli.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            analysis: { type: Type.STRING },
            blueprintPrompt: { type: Type.STRING }
        },
        required: ['analysis', 'blueprintPrompt']
    };

    // Fix: Removed 'useFlash' property from the generateCreativeMultimodal call as it is not part of the defined type
    const result = await generateCreativeMultimodal({ prompt, schema, files });
    return `[BLUEPRINT_V1.0]\n${result.blueprintPrompt}\n\n[ANALİZ]: ${result.analysis}`;
};

export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    GÖREV: Aşağıdaki BLUEPRINT'i kullanarak BİREBİR AYNI MİMARİDE YENİ BİR ÇALIŞMA SAYFASI üret.
    
    [GİRDİ BLUEPRINT]:
    ${enrichedPrompt}
    
    PARAMETRELER:
    - Zorluk: ${options.difficulty}
    - Sayfa Başı Öğe: ${options.itemCount}
    
    TEKNİK ZORUNLULUKLAR:
    - Orijinal yapıdaki 'grid' ve 'table' düzenlerini asla bozma.
    - İçindeki verileri (kelime, sayı, görsel) %100 değiştir.
    - 'logic_card' yapısını algoritma gerektiren bölümlerde kullan.
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
                                content: { type: Type.OBJECT },
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

    // Fix: Removed 'useFlash' property from the generateCreativeMultimodal call as it is not part of the defined type
    return await generateCreativeMultimodal({ prompt, schema, files });
};

/**
 * refinePromptWithAI: Prompt mühendisliği asistanı.
 */
export const refinePromptWithAI = async (currentPrompt: string, mode: 'expand' | 'clinical'): Promise<string> => {
    const prompt = `
    GÖREV: Bu kullanıcı komutunu Gemini 3 Pro "Thinking" motoru için teknik bir blueprint üretim talimatına dönüştür.
    İSTEM: "${currentPrompt}"
    MOD: ${mode}
    `;
    const result = await generateWithSchema(prompt, { type: Type.OBJECT, properties: { refined: { type: Type.STRING } }, required: ['refined'] });
    return result.refined;
};

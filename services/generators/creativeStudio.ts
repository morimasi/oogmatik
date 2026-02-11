
import { Type } from "@google/genai";
import { generateCreativeMultimodal, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

/**
 * analyzeReferenceFiles: Yüklenen dosyaları analiz eder ve teknik bir üretim promptu oluşturur.
 */
export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
    const prompt = `
    [GÖREV: PEDAGOJİK MİMARİ ANALİST]
    Ekteki dosyaları (PDF/Görsel) teknik olarak analiz et. 
    Bu dosyaların:
    1. Sayfa düzenini (Layout)
    2. Soru sorma stilini (Matching, Grid, Multiple Choice vb.)
    3. Kullanılan görsel hiyerarşiyi tanımla.
    
    KULLANICI TERCİHİ: "${currentPrompt}"
    
    GÖREVİN: Bu dosyaları referans alarak, Bursa Disleksi AI motorunun BİREBİR AYNI KALİTEDE VE YAPIDA bir çıktı üretmesi için gereken DETAYLI TEKNİK PROMPTU OLUŞTUR.
    
    ÇIKTI KURALI:
    - Sonuç "Bu materyalin yapısını analiz ettim. İşte üretim için teknik plan:" cümlesiyle başlamalı.
    - İçerisinde [MİMARİ], [İÇERİK PLANI], [PEDAGOJİK HEDEF] başlıkları olmalı.
    - SADECE METİN DÖNDÜR.
    `;

    const schema = { 
        type: Type.OBJECT, 
        properties: { 
            analysisPrompt: { type: Type.STRING } 
        }, 
        required: ['analysisPrompt'] 
    };

    const result = await generateCreativeMultimodal({ prompt, schema, files });
    return result.analysisPrompt;
};

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
    const result = await generateCreativeMultimodal({ prompt, schema });
    return result.refined;
};

/**
 * generateCreativeStudioActivity: Zenginleştirilmiş prompt ve dosyalarla tam layout üretir.
 */
export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    GÖREV: NÖRO-MİMARİ ÜRETİM VE KLONLAMA SENTEZİ
    
    TALİMAT:
    ${enrichedPrompt}
    
    ANALİZ VE ÜRETİM KRİTERİ:
    1. Ekte PDF veya Görsel varsa; bu dosyaların eğitimsel yaklaşımını, mizanpajını ve zorluk seviyesini referans al.
    2. Yeni üretilecek içerik bu dosyaların kalitesinde ancak tamamen özgün sorularla inşa edilmelidir.
    3. Eğer dosya yoksa, sadece talimata göre en iyi tasarımı yap.
    
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

    return await generateCreativeMultimodal({ prompt, schema, files });
};

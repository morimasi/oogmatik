
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
    
    [ULTRA-CREATIVE MISSION: NEURO-ARCHITECTURAL GENERATION]
    GÖREV: Aşağıdaki BLUEPRINT'i kullanarak, klinik derinliği maksimize edilmiş, BENTO-GRID düzeninde profesyonel bir çalışma sayfası üret.
    
    [GİRDİ BLUEPRINT]:
    ${enrichedPrompt}
    
    [ÜRETİM STANDARTLARI]:
    1. İÇERİK YOĞUNLUĞU: Sayfayı sığ bırakma. Her blok, öğrencinin bilişsel becerilerini (dikkat, bellek, muhakeme) zorlayacak gerçek içeriklerle dolu olmalıdır.
    2. KLİNİK ÇELDİRİCİLER: Disleksi/Diskalkuli profiline uygun ayna harfler (b-d, p-q), fonolojik karmaşalar ve mantıksal tuzaklar ekle.
    3. BENTO-GRID MİMARİSİ: Sayfayı görsel olarak dengeli ama zengin bloklarla (grid, table, data_card vb.) böl.
    
    [PARAMETRELER]:
    - Zorluk: ${options.difficulty}
    - Sayfa Başı Öğe (Blok İçi): ${options.itemCount}
    
    [TEKNİK BLOK REHBERİ - BU TİPLERİ KULLAN]:
    - 'cloze_test': Metin içinde [hedef_kelime] yapısını kullan.
    - 'categorical_sorting': 'categories' ve 'items' (text, category) nesnelerini içermeli.
    - 'match_columns': 'left' ve 'right' dizilerini içermeli.
    - 'visual_clue_card': 'title' ve 'clue' (klinik ipucu) içermeli.
    - 'neuro_marker': 'neuroType' ('tracking' | 'focus') ve 'position' içermeli.
    - 'logic_card': Algoritma ve mantık yürütme gerektiren durumlar için.
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
                                type: {
                                    type: Type.STRING,
                                    enum: [
                                        'header', 'text', 'grid', 'table', 'logic_card',
                                        'footer_validation', 'image', 'cloze_test',
                                        'categorical_sorting', 'match_columns',
                                        'visual_clue_card', 'neuro_marker'
                                    ]
                                },
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

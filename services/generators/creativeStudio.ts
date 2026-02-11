import { Type } from "@google/genai";
import { generateCreativeMultimodal, generateWithSchema, MultimodalFile } from '../geminiClient';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts';

/**
 * refinePromptWithAI: Prompt mühendisliği asistanı.
 * FIX: Added missing exported member 'refinePromptWithAI'.
 */
export const refinePromptWithAI = async (currentPrompt: string, mode: 'expand' | 'clinical'): Promise<string> => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    
    MEVCUT KOMUT: "${currentPrompt}"
    MOD: ${mode === 'expand' ? 'DETAYLANDIRMA (Metodolojik derinlik ekle)' : 'KLİNİK ANALİZ (Disleksi odaklı kısıtlamalar ekle)'}
    
    GÖREV: Yukarıdaki komutu, Gemini modelinin daha iyi anlayacağı ve daha kaliteli 'layoutArchitecture' üreteceği teknik bir yapıya dönüştür.
    
    KURALLAR:
    1. Orijinal fikri koru ama üzerine pedagojik derinlik ekle.
    2. Sadece yeni, geliştirilmiş prompt metnini dön.
    3. JSON formatında 'refinedPrompt' anahtarı ile yanıt ver.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            refinedPrompt: { type: Type.STRING }
        },
        required: ['refinedPrompt']
    };

    const result = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
    return result.refinedPrompt;
};

/**
 * generateCreativeStudioActivity: 
 * Üretim motoru, analizden gelen blueprint'i kullanarak içerik üretir.
 */
export const generateCreativeStudioActivity = async (enrichedPrompt: string, options: any, files?: MultimodalFile[]) => {
    
    const visualFrameworkDirectives = `
    [MİMARİ YETENEK SETİ - ZORUNLU KURAL]
    Senin çıktın bir "layoutArchitecture" içermelidir. Eğer kullanıcı bir 'BLUEPRINT' veya 'DNA' verisi sağladıysa, o yapıya KESİNLİKLE sadık kal.
    
    BİLEŞENLER (blocks):
    1. 'logic_card': Karmaşık mantık soruları için (ipucu + tablo + seçenekler).
    2. 'grid': Harf/Sayı matrisleri için.
    3. 'table': Veri listeleri için.
    4. 'svg_shape': Geometrik çizimler için.
    5. 'dual_column': Eşleştirme görevleri için.
    6. 'footer_validation': Sayfa sonu kontrol kutusu.
    
    [ÖNEMLİ] Veriler orijinal görselden FARKLI, ama yapı AYNI olmalıdır.
    `;

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${visualFrameworkDirectives}
    ${CLINICAL_DIAGNOSTIC_GUIDE}
    
    [GÖREV]
    Kullanıcı Komutu/Blueprint: "${enrichedPrompt}"
    Zorluk Seviyesi: ${options.difficulty}
    Öğe Sayısı: ${options.itemCount}
    Çeldirici Stratejisi: ${options.distractionLevel}
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
                                type: { type: Type.STRING },
                                content: { type: Type.OBJECT },
                                style: { type: Type.OBJECT },
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
 * analyzeReferenceFiles: GOD MODE DNA ANALİZİ
 * Yüklenen görseli parçalarına ayırır ve klonlama için teknik bir "Üretim Promptu" yazar.
 */
export const analyzeReferenceFiles = async (files: MultimodalFile[], currentPrompt: string): Promise<string> => {
    const prompt = `
    [GÖREV: REVERSE ENGINEERING & ARCHITECTURAL DNA EXTRACTION]
    Bu görseli bir yapay zeka mühendisi ve özel eğitim uzmanı olarak analiz et. 
    
    ANALİZ KRİTERLERİ:
    1. **Layout Yapısı:** Sayfa kaç sütun? Blokların sırası nedir? (Örn: Üstte 2 ipucu kutusu, altta 4x4 tablo).
    2. **Pedagogik Mantık:** Öğrenci ne yapmaya çalışıyor? (Eleyerek doğruyu bulma, ayna harf ayırt etme, örüntü tamamlama).
    3. **Soru Algoritması:** Yeni sorular üretilirken hangi kısıtlamalar uygulanmalı? (Örn: "Sadece 2 basamaklı tek sayılar kullanılmalı", "Çeldiriciler mutlaka b-d harfleri olmalı").
    4. **Görsel Stil:** Fontlar büyük mü? Çizgiler kesikli mi? Arka planda dikkat dağıtıcı öğeler var mı?

    [ÇIKTI TALEBİ]
    Bu analizi kullanarak, Gemini'ye "Bu etkinliğin birebir aynısını ama şu farklı verilerle üret" diyecek olan ÇOK DERİN VE TEKNİK BİR MASTER PROMPT yaz. 
    Bu prompt, 'layoutArchitecture' yapısını mükemmel şekilde tarif etmeli.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            blueprintPrompt: { 
                type: Type.STRING, 
                description: "Orijinal yapıyı klonlamak için AI'nın kullanacağı teknik 'God Mode' promptu." 
            },
            detectedLogic: { type: Type.STRING },
            visualComplexity: { type: Type.STRING }
        },
        required: ['blueprintPrompt', 'detectedLogic']
    };

    const result = await generateCreativeMultimodal({ prompt, schema, files, useFlash: false }); // Pro model ile derin analiz
    
    // AI'ya kendi yazdığı promptu iade ediyoruz
    return `[MİMARİ DNA ANALİZİ TAMAMLANDI]\n\n${result.blueprintPrompt}\n\n[EK KLİNİK NOTLAR]: ${result.detectedLogic}`;
};
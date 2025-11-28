
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, ImageInterpretationTFData, HeartOfSkyData } from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bilişsel beceri açıklaması.
3. "instruction": Net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce).
`;

// ... existing constants and generators ...

// 13. Image Interpretation T/F
export const generateImageInterpretationTFFromAI = async (options: GeneratorOptions): Promise<ImageInterpretationTFData[]> => {
    const { worksheetCount, itemCount } = options;
    const prompt = `
    "Resim Yorumlama ve Doğru-Yanlış (D-Y) Okuma" etkinliği.
    
    1. Çocuklar için renkli, detaylı ve neşeli bir sahne kurgula (Örn: Piknik yapan aile, sınıfta ders işleyen öğrenciler, oyun parkı).
    2. 'sceneDescription': Bu sahneyi detaylıca betimle (Görseli zihinde canlandırmak için).
    3. 'imagePrompt': Bu sahneyi görselleştirecek İngilizce prompt yaz. Stil: "Children book illustration, clear lines, colorful".
    4. Bu sahneyle ilgili ${itemCount || 9} adet cümle yaz.
       - Bazıları sahneye göre DOĞRU, bazıları YANLIŞ olsun.
       - Cümleler görsel detaylara (renk, konum, eylem, sayı) odaklanmalı.
       - Örn: "Kırmızı tişörtlü çocuk ayakta duruyor." (Doğru/Yanlış)
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            sceneDescription: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        isCorrect: { type: Type.BOOLEAN }
                    },
                    required: ['text', 'isCorrect']
                }
            }
        },
        required: ['title', 'instruction', 'items', 'pedagogicalNote', 'imagePrompt', 'sceneDescription']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ImageInterpretationTFData[]>;
};

// 14. Heart of Sky (Gökyüzünün Kalbi)
export const generateHeartOfSkyFromAI = async (options: GeneratorOptions): Promise<HeartOfSkyData[]> => {
    const { worksheetCount, difficulty } = options;
    
    const prompt = `
    "Gökyüzünün Kalbi" (Varki ve Dolunay Masalı) etkinliği. Seviye: ${difficulty}.
    
    Bu etkinlik, minik kurbağa Varki'nin merakını, Nilüfer çiçeği ile diyaloğunu ve dolunay keşfini içeren masalsı bir yolculuktur.
    
    ÖZELLİKLER (PDF'e dayalı):
    - Karakterler: Meraklı minik kurbağa Varki (mavi kurdeleli), Bilge Nilüfer Çiçeği, Zıplayan Balık.
    - Atmosfer: Gölet, sazlıklar, gün batımı, akşamın laciverti, dolunay ışığı.
    - Temalar: Merak, doğa gözlemi, iç huzur, ışık ve sevgi (manevi boyut).
    
    GÖREV:
    1. 6-8 adet "Spread" (Sahne) oluştur.
    2. Her sahne için masalsı, şiirsel bir metin (text) yaz.
    3. Her sahne için o anı canlandıran, detaylı bir "visualDescription" (Türkçe) yaz. (Örn: "Varki nilüfer yaprağında dikilmiş, gökyüzüne bakıyor.")
    4. Her sahne için "imagePrompt" (İngilizce) oluştur. Stil: "Children book illustration style, colorful, whimsical, detailed, soft lighting".
       - Örn: "A cute small green frog with a blue ribbon standing on a giant lily pad in a pond at twilight, looking up at the full moon."
    
    ZORLUK AYARLARI:
    - Başlangıç: Daha kısa cümleler, somut betimlemeler.
    - Orta/Zor: Orijinal PDF'teki gibi şiirsel ve felsefi dil.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Cover image
            theme: { type: Type.STRING },
            scenes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        text: { type: Type.STRING },
                        visualDescription: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        question: { type: Type.STRING } // Optional comprehension question per scene
                    },
                    required: ['title', 'text', 'visualDescription', 'imagePrompt']
                }
            }
        },
        required: ['title', 'instruction', 'scenes', 'pedagogicalNote', 'imagePrompt', 'theme']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<HeartOfSkyData[]>;
};

// Re-export placeholders or other generators if they were lost, 
// to prevent "export not found" errors if they are referenced elsewhere.
export const generateReadingFlowFromAI = async (o: GeneratorOptions): Promise<ReadingFlowData[]> => [];
export const generateLetterDiscriminationFromAI = async (o: GeneratorOptions): Promise<LetterDiscriminationData[]> => [];
export const generateRapidNamingFromAI = async (o: GeneratorOptions): Promise<RapidNamingData[]> => [];
export const generatePhonologicalAwarenessFromAI = async (o: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => [];
export const generateMirrorLettersFromAI = async (o: GeneratorOptions): Promise<MirrorLettersData[]> => [];
export const generateSyllableTrainFromAI = async (o: GeneratorOptions): Promise<SyllableTrainData[]> => [];
export const generateVisualTrackingLinesFromAI = async (o: GeneratorOptions): Promise<VisualTrackingLineData[]> => [];
export const generateBackwardSpellingFromAI = async (o: GeneratorOptions): Promise<BackwardSpellingData[]> => [];
export const generateCodeReadingFromAI = async (o: GeneratorOptions): Promise<CodeReadingData[]> => [];
export const generateAttentionToQuestionFromAI = async (o: GeneratorOptions): Promise<AttentionToQuestionData[]> => [];
export const generateAttentionDevelopmentFromAI = async (o: GeneratorOptions): Promise<AttentionDevelopmentData[]> => [];
export const generateAttentionFocusFromAI = async (o: GeneratorOptions): Promise<AttentionFocusData[]> => [];

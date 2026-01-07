
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, LetterVisualMatchingData, SyllableMasterLabData } from '../../types';
import { getAttentionPrompt, getDyslexiaPrompt } from './prompts';

// Comprehensive Syllable Master Lab - UPDATED FOR COMPACT MODE (NO IMAGES)
export const generateSyllableMasterLabFromAI = async (options: GeneratorOptions): Promise<SyllableMasterLabData[]> => {
    const { worksheetCount, difficulty, itemCount, topic, variant = 'split', case: letterCase, syllableRange = '2-3' } = options;
    
    const specifics = `
    - ÇALIŞMA MODU: ${variant} (split, combine, complete, rainbow, scrambled)
    - KONU: ${topic || 'Karma'}
    - HARF TİPİ: ${letterCase === 'upper' ? 'BÜYÜK' : 'küçük'}
    - ADET: ${itemCount || 32} kelime (A4 sayfasını boş yer kalmayacak şekilde yoğun ve kompakt doldur).
    - HECE SAYISI: ${syllableRange} heceli kelimeler kullan.
    - ZORLUK: ${difficulty}.
    
    ÖNEMLİ KURALLAR:
    1. GÖRSEL KULLANMA: Bu etkinlik sadece metin tabanlıdır, kesinlikle görsel/imagePrompt üretme.
    2. SAYFA DOLULUĞU: Bir sayfaya sığabilecek maksimum sayıda (en az ${itemCount || 32}) öğe üret.
    3. 'split': Kelimeyi ver, hece kutucuklarını boş bırak.
    4. 'combine': Heceleri yan yana ver, birleşimi iste.
    5. 'complete': Bir heceyi eksik bırak (?? ile göster).
    6. 'rainbow': Kelimenin her hecesini disleksi dostu, zıt ve canlı renklerle vurgula.
    7. 'scrambled': Heceleri rastgele sırala, anlamlı kelimeyi buldur.
    `;
    
    const prompt = getDyslexiaPrompt("Hece Ustası Laboratuvarı (Yüksek Yoğunluklu)", difficulty, specifics, options.studentContext);
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            mode: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
                        missingIndex: { type: Type.INTEGER, nullable: true },
                        scrambledIndices: { type: Type.ARRAY, items: { type: Type.INTEGER }, nullable: true },
                        syllableCount: { type: Type.INTEGER }
                    },
                    required: ['word', 'syllables', 'syllableCount']
                }
            }
        },
        required: ['title', 'instruction', 'items', 'pedagogicalNote']
    };
    
    return await generateWithSchema(prompt, { type: Type.ARRAY, items: singleSchema }) as any;
};

// ... remaining generators stay same ...

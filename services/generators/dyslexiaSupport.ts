
<<<<<<< HEAD
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, LetterVisualMatchingData, SyllableMasterLabData, Student } from '../../types.js';
import { getAttentionPrompt, getDyslexiaPrompt } from './prompts.js';

// Comprehensive Syllable Master Lab - UPDATED FOR COMPACT MODE (NO IMAGES)
export const generateSyllableMasterLabFromAI = async (options: GeneratorOptions): Promise<SyllableMasterLabData[]> => {
    const { worksheetCount, difficulty = 'Orta', itemCount, topic, variant = 'split', case: letterCase, syllableRange = '2-3' } = options;
=======
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, LetterVisualMatchingData, SyllableMasterLabData, Student } from '../../types';
import { getAttentionPrompt, getDyslexiaPrompt } from './prompts';

// Comprehensive Syllable Master Lab - UPDATED FOR COMPACT MODE (NO IMAGES)
export const generateSyllableMasterLabFromAI = async (options: GeneratorOptions): Promise<SyllableMasterLabData[]> => {
    const { worksheetCount, difficulty, itemCount, topic, variant = 'split', case: letterCase, syllableRange = '2-3' } = options;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

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
    3. TÜRKÇE HECELEME: Kelimeleri hecelerken kesinlikle Türk Dil Kurumu (TDK) kurallarına uy. 
       ÖRN: "ilköğretim" -> il-köğ-re-tim DEĞİL, il-kö-re-tim (yanlış), doğrusu: il-köğ-re-tim. 
       DİKKAT: İki ünlü arasındaki tek ünsüz sağdaki heceye geçer.
    4. RAINBOW RENKLERİ: Her hece için farklı, yüksek kontrastlı hex kodları üret.
    `;

    const prompt = getDyslexiaPrompt("Hece Ustası Laboratuvarı (Yüksek Yoğunluklu)", difficulty, specifics, options.studentContext as Student | undefined);

    const singleSchema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            mode: { type: 'STRING' },
            items: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        word: { type: 'STRING' },
                        syllables: { type: 'ARRAY', items: { type: 'STRING' } },
                        missingIndex: { type: 'INTEGER', nullable: true },
                        scrambledIndices: { type: 'ARRAY', items: { type: 'INTEGER' }, nullable: true },
                        syllableCount: { type: 'INTEGER' }
=======
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
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                    },
                    required: ['word', 'syllables', 'syllableCount']
                }
            }
        },
        required: ['title', 'instruction', 'items', 'pedagogicalNote']
    };

<<<<<<< HEAD
    return await generateWithSchema(prompt, { type: 'ARRAY', items: singleSchema }) as any;
=======
    return await generateWithSchema(prompt, { type: Type.ARRAY, items: singleSchema }) as any;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
};

// Letter-Visual Matching (AI Generator)
export const generateLetterVisualMatchingFromAI = async (options: GeneratorOptions): Promise<LetterVisualMatchingData[]> => {
<<<<<<< HEAD
    const { difficulty = 'Orta', itemCount, topic, case: letterCase = 'mixed' } = options;
=======
    const { difficulty, itemCount, topic, case: letterCase = 'mixed' } = options;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

    const specifics = `
    - KONU/TEMA: ${topic || 'Karma (Hayvanlar, Eşyalar, Meyveler vb.)'}
    - ADET: ${itemCount || 10} çift (harf-kelime-görsel eşleşmesi).
    - HARF TİPİ: ${letterCase}.
    - ZORLUK: ${difficulty}.
    
    ÜRETİM KURALLARI:
    1. Harfler ve kelimeler disleksi eğitimine uygun, somut nesnelerden seçilmeli (Örn: A -> Arı, B -> Balık).
    2. "imagePrompt" alanı disleksi dostu bir görsel için detaylı bir İNGİLİZCE prompt içermeli.
    3. Eğer kelime çok basit bir geometrik şekil ise (Örn: Kare, Yıldız) veya sembol ise, "imageBase64" alanına doğrudan 100x100 koordinatlı <svg> kodu yazabilirsin.
    `;

    const prompt = getDyslexiaPrompt("Harf-Görsel Eşleme", difficulty, specifics, options.studentContext as Student | undefined);

    const singleSchema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            settings: {
                type: 'OBJECT',
                properties: {
                    showTracing: { type: 'BOOLEAN' },
                    showWord: { type: 'BOOLEAN' }
=======
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            settings: {
                type: Type.OBJECT,
                properties: {
                    showTracing: { type: Type.BOOLEAN },
                    showWord: { type: Type.BOOLEAN }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                },
                required: ['showTracing', 'showWord']
            },
            pairs: {
<<<<<<< HEAD
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        letter: { type: 'STRING' },
                        word: { type: 'STRING' },
                        imagePrompt: { type: 'STRING' },
                        imageBase64: { type: 'STRING', nullable: true }
=======
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        letter: { type: Type.STRING },
                        word: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        imageBase64: { type: Type.STRING, nullable: true }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                    },
                    required: ['letter', 'word', 'imagePrompt']
                }
            }
        },
        required: ['title', 'instruction', 'pedagogicalNote', 'settings', 'pairs']
    };

<<<<<<< HEAD
    return await generateWithSchema(prompt, { type: 'ARRAY', items: singleSchema }) as any;
=======
    return await generateWithSchema(prompt, { type: Type.ARRAY, items: singleSchema }) as any;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
};

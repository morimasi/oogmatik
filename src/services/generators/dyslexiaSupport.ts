
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, LetterVisualMatchingData, SyllableMasterLabData, Student } from '../../types.js';
import { getAttentionPrompt, getDyslexiaPrompt } from './prompts.js';

// Comprehensive Syllable Master Lab - UPDATED FOR COMPACT MODE (NO IMAGES)
export const generateSyllableMasterLabFromAI = async (options: GeneratorOptions): Promise<SyllableMasterLabData[]> => {
    const { _worksheetCount, difficulty = 'Orta', itemCount, topic, variant = 'split', case: letterCase, syllableRange = '2-3' } = options as Record<string, unknown>;

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

    const prompt = getDyslexiaPrompt("Hece Ustası Laboratuvarı (Yüksek Yoğunluklu)", difficulty as string, specifics, options.studentContext as unknown as Student | undefined);

    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
            mode: { type: 'STRING', description: 'Çalışma modu (split/combine/vb.)' },
            items: {
                type: 'ARRAY', description: 'Hece kelime öğeleri',
                items: {
                    type: 'OBJECT',
                    properties: {
                        word: { type: 'STRING', description: 'Tam kelime' },
                        syllables: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Hece listesi' },
                        missingIndex: { type: 'INTEGER', description: 'Eksik hece indeksi', nullable: true },
                        scrambledIndices: { type: 'ARRAY', items: { type: 'INTEGER' }, description: 'Karışık hece sırası', nullable: true },
                        syllableCount: { type: 'INTEGER', description: 'Hece sayısı' }
                    },
                    required: ['word', 'syllables', 'syllableCount']
                }
            }
        },
        required: ['title', 'instruction', 'items']
    };

    return await generateWithSchema(prompt, { type: 'ARRAY', items: singleSchema }) as Record<string, unknown>[];
};

// Letter-Visual Matching (AI Generator)
export const generateLetterVisualMatchingFromAI = async (options: GeneratorOptions): Promise<LetterVisualMatchingData[]> => {
    const { difficulty = 'Orta', itemCount, topic, case: letterCase = 'mixed' } = options;

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

    const prompt = getDyslexiaPrompt("Harf-Görsel Eşleme", difficulty, specifics, options.studentContext as unknown as Student | undefined);

    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenciye yönelik yönerge' },
            settings: {
                type: 'OBJECT', description: 'Etkinlik ayarları',
                properties: {
                    showTracing: { type: 'BOOLEAN', description: 'İzleme yönergesini göster' },
                    showWord: { type: 'BOOLEAN', description: 'Kelimeyi göster' }
                },
                required: ['showTracing', 'showWord']
            },
            pairs: {
                type: 'ARRAY', description: 'Harf-kelime eşleme çiftleri',
                items: {
                    type: 'OBJECT',
                    properties: {
                        letter: { type: 'STRING', description: 'Harf karakteri' },
                        word: { type: 'STRING', description: 'Harfi içeren kelime' },
                        imagePrompt: { type: 'STRING', description: 'Görsel üretim promptu (İngilizce)' },
                        imageBase64: { type: 'STRING', description: 'SVG base64 kodu', nullable: true }
                    },
                    required: ['letter', 'word', 'imagePrompt']
                }
            }
        },
        required: ['title', 'instruction', 'settings', 'pairs']
    };

    return await generateWithSchema(prompt, { type: 'ARRAY', items: singleSchema }) as Record<string, unknown>[];
};

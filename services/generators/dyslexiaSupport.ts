
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData } from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bilişsel beceri açıklaması.
3. "instruction": Net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Konuyla ilgili sevimli, renkli bir illüstrasyon.
5. İçerik dolu ve gerçekçi olmalı.
`;

// AI Generator for Code Reading (Symbol Decoding)
export const generateCodeReadingFromAI = async (options: GeneratorOptions): Promise<CodeReadingData[]> => {
    const { worksheetCount, symbolType, codeLength, itemCount } = options;
    
    const prompt = `
    Kod Okuma (Şifre Çözme) etkinliği.
    Sembol Tipi: ${symbolType || 'arrows'} (Oklar, Şekiller veya Renkler).
    Kod Uzunluğu: ${codeLength || 4} karakter.
    Soru Sayısı: ${itemCount || 5}.
    
    KURALLAR:
    - Bir "Anahtar" (Key Map) oluştur: Sembol -> Değer (Harf veya Sayı).
    - Anahtarı kullanarak anlamlı veya anlamsız kısa kodlar oluştur.
    - Semboller: 'arrow-up', 'arrow-down', 'triangle', 'square', 'red', 'blue' gibi tanımlayıcı stringler kullan.
    
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
            keyMap: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { symbol: { type: Type.STRING }, value: { type: Type.STRING }, color: { type: Type.STRING } },
                    required: ['symbol', 'value']
                }
            },
            codesToSolve: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sequence: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['sequence', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'keyMap', 'codesToSolve', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CodeReadingData[]>;
};

export const generateAttentionToQuestionFromAI = async (options: GeneratorOptions): Promise<AttentionToQuestionData[]> => {
    const { worksheetCount, subType } = options;
    
    const prompt = `
    "Soruya Dikkat" başlığı altında bir dikkat ve görsel algı etkinliği üret.
    Alt Tip: ${subType || 'letter-cancellation'}
    
    Eğer 'letter-cancellation' (Harf Eleme) ise:
    - Bir kelime/şifre seç. 
    - Harflerden oluşan bir ızgara (grid) oluştur.
    - Bazı harfleri "targetChars" (üzeri çizilecekler) olarak belirle.
    - Kalan harfler sırayla okunduğunda şifreyi oluştursun.
    
    Eğer 'path-finding' (Yol Takibi) ise:
    - Bir ızgara dolusu sembol ('star-outline', 'star-filled' gibi).
    - Başlangıçtan bitişe giden doğru bir yolu (correctPath) koordinat olarak ver.
    
    Eğer 'visual-logic' (Görsel Mantık) ise:
    - Beşgen (pentagon) şekilleri düşün. Köşelerinde renkli noktalar ve içlerinde çizgiler var.
    - 4 adet şekil üret. 3 tanesi aynı kurala uysun, 1 tanesi farklı olsun (isOdd).
    
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
            subType: { type: Type.STRING, enum: ['letter-cancellation', 'path-finding', 'visual-logic'] },
            // Letter Cancellation Props
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            targetChars: { type: Type.ARRAY, items: { type: Type.STRING } },
            password: { type: Type.STRING },
            // Path Finding Props
            pathGrid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            correctPath: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {r: {type: Type.NUMBER}, c: {type: Type.NUMBER}} } },
            // Visual Logic Props
            logicItems: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.NUMBER },
                        isOdd: { type: Type.BOOLEAN },
                        correctAnswer: { type: Type.STRING },
                        shapes: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { color: { type: Type.STRING }, type: { type: Type.STRING }, connectedTo: { type: Type.ARRAY, items: { type: Type.NUMBER } } } 
                            } 
                        }
                    }
                }
            }
        },
        required: ['title', 'instruction', 'subType', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AttentionToQuestionData[]>;
};

export const generateAttentionDevelopmentFromAI = async (options: GeneratorOptions): Promise<AttentionDevelopmentData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    
    const prompt = `
    "Dikkat Geliştirme" (Mantık Bilmecesi) etkinliği.
    ${itemCount || 4} adet soru üret.
    
    HER SORU İÇİN:
    1. İki kutu (Sol/Sağ) içinde rastgele sayılar oluştur.
    2. Bir hedef sayıyı tanımlayan KARMAŞIK ve ÇELDİRİCİ bir bilmece (riddle) yaz.
    
    Zorluk Seviyesi: ${difficulty || 'Orta'}
    
    METİN KURALLARI:
    - Metinler uzun olsun (en az 2-3 cümle).
    - Çeldirici ifadeler kullan (Örn: "En büyük sayı değildir ama en küçük de değildir.", "Diğer kutudaki sayılarla karıştırma.", "Tek sayıları hemen ele.").
    - Matematiksel terimler ekle: "Bir deste", "düzine", "rakamları toplamı", "çift sayı", "5'in katı".
    - Örnek: "Aradığımız sayı sol kutuda saklanıyor. Bu sayı bir deste gülden fazladır ama 50'ye ulaşamaz. Çift bir sayıdır ve kutudaki en büyük sayı değildir."
    
    3. Seçenekleri (a, b, c, d, e) belirle.
    
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
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        riddle: { type: Type.STRING },
                        boxes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    numbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                                },
                                required: ['numbers']
                            }
                        },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['riddle', 'boxes', 'options', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
    };
    
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AttentionDevelopmentData[]>;
};

export const generateAttentionFocusFromAI = async (options: GeneratorOptions): Promise<AttentionFocusData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    const count = itemCount || 4;

    const prompt = `
    "Dikkatini Ver" (Mantıksal Bulmaca) etkinliği. 
    Bu etkinlikte öğrenci, verilen ipuçlarını kullanarak doğru nesneyi bulmalıdır.
    
    HER SORU İÇİN:
    1. İki veya üç liste/kutu oluştur (Örn: "Meyveler", "Sebzeler" veya "Yazlık", "Kışlık" kıyafetler).
    2. Her kutuda 4-5 öğe olsun.
    3. Hedef bir öğe seç.
    4. Bu hedefi tarif eden MANTIKLI ve ELEME GEREKTİREN bir bilmece yaz.
       - Konum ipucu: "Aradığımız şey X ile aynı kutudadır."
       - Olumsuzlama ipucu: "Y değildir", "Rengi kırmızı değildir."
       - Özellik ipucu: "Z harfi ile başlar", "Ekşidir".
    
    Zorluk Seviyesi: ${difficulty}.
    - Başlangıç: Kısa, net ipuçları.
    - Orta/Zor: Daha dolaylı ipuçları (Örn: "Çekirdekli bir meyvenin olmadığı kutudadır.").
    
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
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        riddle: { type: Type.STRING },
                        boxes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING }, // e.g. "Kutu 1" or empty
                                    items: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['items']
                            }
                        },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['riddle', 'boxes', 'options', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
    };

    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AttentionFocusData[]>;
};

// Re-export placeholders to prevent errors
export const generateReadingFlowFromAI = async (o: GeneratorOptions): Promise<ReadingFlowData[]> => [];
export const generateLetterDiscriminationFromAI = async (o: GeneratorOptions): Promise<LetterDiscriminationData[]> => [];
export const generateRapidNamingFromAI = async (o: GeneratorOptions): Promise<RapidNamingData[]> => [];
export const generatePhonologicalAwarenessFromAI = async (o: GeneratorOptions): Promise<PhonologicalAwarenessData[]> => [];
export const generateMirrorLettersFromAI = async (o: GeneratorOptions): Promise<MirrorLettersData[]> => [];
export const generateSyllableTrainFromAI = async (o: GeneratorOptions): Promise<SyllableTrainData[]> => [];
export const generateVisualTrackingLinesFromAI = async (o: GeneratorOptions): Promise<VisualTrackingLineData[]> => [];
export const generateBackwardSpellingFromAI = async (o: GeneratorOptions): Promise<BackwardSpellingData[]> => [];

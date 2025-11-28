
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, MindGamesData } from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bilişsel beceri açıklaması.
3. "instruction": Net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce).
`;

export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount, itemCount, topic } = options;
    const prompt = `
    Akrabalık İlişkileri Eşleştirme. Konu: ${topic || 'Akrabalık'}.
    Sol sütunda tanımlar (örn: "Annemin kız kardeşi"), sağ sütunda cevaplar (örn: "Teyze") olsun.
    ${itemCount || 10} çift oluştur.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                leftColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, required: ['text', 'id'] } },
                rightColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, required: ['text', 'id'] } }
            },
            required: ['title', 'instruction', 'leftColumn', 'rightColumn', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<FamilyRelationsData[]>;
};

export const generateLogicDeductionFromAI = async (options: GeneratorOptions): Promise<LogicDeductionData[]> => {
    const { worksheetCount, itemCount, topic } = options;
    const prompt = `
    Mantıksal Çıkarım Bulmacaları. Kategori: ${topic || 'Karışık'}.
    Her soru bir bilmece gibi olsun (Örn: Aradığımız meyve kırmızı değil...).
    ${itemCount || 4} soru. Her soruda 3-5 şık olsun.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                scoringText: { type: Type.STRING },
                questions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            riddle: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answerIndex: { type: Type.NUMBER },
                            correctLetter: { type: Type.STRING }
                        },
                        required: ['riddle', 'options', 'answerIndex', 'correctLetter']
                    }
                }
            },
            required: ['title', 'instruction', 'questions', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<LogicDeductionData[]>;
};

export const generateNumberBoxLogicFromAI = async (options: GeneratorOptions): Promise<NumberBoxLogicData[]> => {
    const { worksheetCount, itemCount, numberRange } = options;
    const prompt = `
    Kutulu Sayı Analizi. Sayı Aralığı: ${numberRange}.
    İki kutu (box1, box2) içinde sayılar ver. Bu sayılarla ilgili mantık soruları sor (örn: En büyüğü, toplamı).
    ${itemCount || 2} bulmaca seti üret.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
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
                            box1: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            box2: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            questions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        text: { type: Type.STRING },
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        correctAnswer: { type: Type.STRING }
                                    },
                                    required: ['text', 'options', 'correctAnswer']
                                }
                            }
                        },
                        required: ['box1', 'box2', 'questions']
                    }
                }
            },
            required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<NumberBoxLogicData[]>;
};

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, itemCount } = options;
    const prompt = `
    Harita ve Yönerge Takibi. Türkiye haritası üzerinde illerle ilgili yönergeler.
    ${itemCount || 8} adet yönerge (örn: "Ankara'nın batısındaki şehri boya").
    'mapSvg' alanını boş bırak (frontend dolduracak).
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                mapSvg: { type: Type.STRING },
                cities: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { name: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
                        required: ['name', 'x', 'y']
                    } 
                },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'instruction', 'instructions', 'cities', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<MapInstructionData[]>;
};

// --- MIND GAMES AI GENERATOR ---
export const generateMindGamesFromAI = async (options: GeneratorOptions): Promise<MindGamesData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    
    const prompt = `
    "Akıl Oyunları" (3. ve 4. Sınıf Seviyesi - Bilsem Tarzı).
    Zorluk: ${difficulty}.
    
    Aşağıdaki bulmaca tiplerinden KARIŞIK olarak ${itemCount || 4} adet içeren bir set üret:
    
    1. 'shape_math': Üçgen veya Kare içindeki/köşesindeki sayılarla işlem. (Örn: Köşeler toplamı = Orta veya Üst*Alt = Orta).
    2. 'matrix_logic': 3x3 Izgarada sayı örüntüsü (Kurallı Dikdörtgenler). Satır veya sütun ilişkisi.
    3. 'hexagon_logic': Altıgen dilimlerinde sayılar. Karşılıklı sayılar toplamı veya dairesel artış.
    4. 'function_machine': Girdi -> Kural -> Çıktı (Örn: Giriş 5 -> Çıkış 15, Kural: x3).
    5. 'number_pyramid': Sayı piramidi (Alttaki iki sayının toplamı üsttekini verir).

    HER BULMACA İÇİN:
    - "type": Bulmaca tipi.
    - "numbers": Dizi (shape_math, number_pyramid, hexagon_logic için). '?' için "string" kullan.
    - "grid": Matris (matrix_logic için). '?' için "string" kullan.
    - "input", "output", "rule": (function_machine için). '?' için "string" kullan.
    - "question": Soru metni (Örn: "Soru işareti yerine kaç gelmelidir?").
    - "answer": Cevap.
    - "hint": İpucu (Kural açıklaması).
    - "imagePrompt": Her bulmaca için görsel betimlemesi (İngilizce). Stil: "Educational vector art".
    
    "pedagogicalNote": Hangi zeka alanını geliştirdiği (Sayısal Mantık, Görsel Algı vb.).
    ${worksheetCount} adet sayfa üret.
    `;
    
    const schema = {
        type: Type.ARRAY,
        items: {
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
                            type: { type: Type.STRING, enum: ['shape_math', 'matrix_logic', 'number_pyramid', 'hexagon_logic', 'function_machine'] },
                            shape: { type: Type.STRING, enum: ['triangle', 'square', 'circle'] },
                            numbers: { type: Type.ARRAY, items: { oneOf: [{ type: Type.NUMBER }, { type: Type.STRING }] } },
                            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { oneOf: [{ type: Type.NUMBER }, { type: Type.STRING }, { type: Type.NULL }] } } },
                            input: { type: Type.NUMBER },
                            output: { type: Type.STRING }, 
                            rule: { type: Type.STRING },
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            hint: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['type', 'answer']
                    }
                }
            },
            required: ['title', 'instruction', 'puzzles', 'pedagogicalNote', 'imagePrompt']
        }
    };
    
    return generateWithSchema(prompt, schema) as Promise<MindGamesData[]>;
};

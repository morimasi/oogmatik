
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

// --- MIND GAMES (Akıl Oyunları) ---

export const generateMindGamesFromAI = async (options: GeneratorOptions): Promise<MindGamesData[]> => {
    const { worksheetCount, itemCount, difficulty } = options;
    
    const prompt = `
    "Akıl Oyunları" etkinliği (Matematiksel ve Görsel Mantık).
    Seviye: ${difficulty}.
    
    Bulmaca Tipleri (Karışık üret):
    1. 'shape_math': Bir şeklin (üçgen, kare) köşelerindeki sayılarla ortasındaki sayı arasında bir ilişki vardır (örn: Köşeleri topla, 2 çıkar). Soru işareti olanı sor.
    2. 'matrix_logic': 3x3 veya 2x2 matriste sayılar/şekiller belirli bir kurala göre dizilmiştir. Eksik olanı sor.
    3. 'number_pyramid': Alt sıradaki sayıların toplamı üst sırayı verir. Tepedeki eksik sayıyı sor.
    
    Format:
    - "type": Bulmaca tipi.
    - "numbers": Sayı dizisi (shape_math ve number_pyramid için).
    - "grid": Matris verisi (matrix_logic için, boşluk için null kullan).
    - "question": Soru metni.
    - "answer": Cevap.
    - "hint": Kural açıklaması.
    
    ${itemCount || 4} adet farklı bulmaca içeren sayfa üret.
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
                            type: { type: Type.STRING, enum: ['shape_math', 'matrix_logic', 'number_pyramid'] },
                            shape: { type: Type.STRING, enum: ['triangle', 'square', 'circle'] },
                            numbers: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }, // using integer for simplicity or string if needed
                            question: { type: Type.STRING },
                            answer: { type: Type.STRING },
                            hint: { type: Type.STRING }
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

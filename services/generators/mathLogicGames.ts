
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions, NumberPathLogicData, NumberLogicRiddleData } from '../../types';
import { getMathPrompt } from './prompts';

/**
 * Sembolik İşlem Zinciri (AI Modu)
 */
export const generateNumberPathLogicFromAI = async (options: GeneratorOptions): Promise<NumberPathLogicData[]> => {
    const { difficulty, codeLength = 3, itemCount = 6, studentContext } = options;
    
    const rule = `
    [GÖREV]: Sembolik İşlem Zinciri Üret.
    [ZORLUK]: ${difficulty}
    [ZİNCİR UZUNLUĞU]: ${codeLength} adım.
    [ADET]: ${itemCount} adet bağımsız işlem zinciri.
    
    KURALLAR:
    1. Bir 'legend' (lejant) oluştur: Her sembol (circle, square, triangle, hexagon) bir işleme (+5, -2, x3) denk gelmeli.
    2. 'chains' dizisinde bir başlangıç sayısı (startNumber) ve bu sayıya uygulanacak sembol dizisini ver.
    3. Her adımda sonucun tam sayı ve pozitif kalmasını sağla.
    4. En az 4 farklı sembol-renk çifti kullan.
    `;

    const prompt = getMathPrompt("Sembolik İşlem Zinciri", difficulty, rule, studentContext);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                legend: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            symbol: { type: Type.STRING, enum: ['circle', 'square', 'triangle', 'hexagon', 'star'] },
                            operation: { type: Type.STRING, enum: ['+', '-', 'x'] },
                            value: { type: Type.INTEGER },
                            color: { type: Type.STRING }
                        },
                        required: ['symbol', 'operation', 'value', 'color']
                    }
                },
                chains: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            startNumber: { type: Type.INTEGER },
                            steps: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        symbol: { type: Type.STRING },
                                        expectedValue: { type: Type.INTEGER, nullable: true }
                                    },
                                    required: ['symbol']
                                }
                            }
                        },
                        required: ['startNumber', 'steps']
                    }
                }
            },
            required: ['title', 'legend', 'chains']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

/**
 * Gizemli Sayılar: Dedektiflik Dosyası (AI Modu)
 */
export const generateNumberLogicRiddlesFromAI = async (options: GeneratorOptions): Promise<NumberLogicRiddleData[]> => {
    const { difficulty, numberRange = '1-50', itemCount = 4, studentContext } = options;
    
    const rule = `
    [GÖREV]: Sayısal Mantık Bilmeceleri.
    [ADET]: ${itemCount} bağımsız bilmece.
    [MENZİL]: ${numberRange}
    
    İPUCU KRİTERLERİ:
    - Sayının tek/çift durumu.
    - Basamak değerleri toplamı.
    - Belirli sayılara olan uzaklığı/komşuluğu.
    - Katları veya asal olma durumu (zorluk yüksekse).
    - Çeldiriciler (options) hedefe yakın olmalı.
    - sumTarget: Sayfadaki tüm doğru cevapların toplamı.
    `;

    const prompt = getMathPrompt("Gizemli Sayılar", difficulty, rule, studentContext);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                sumTarget: { type: Type.INTEGER },
                puzzles: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            riddle: { type: Type.STRING },
                            riddleParts: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: { text: { type: Type.STRING }, icon: { type: Type.STRING } }
                                }
                            },
                            boxes: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING },
                            answerValue: { type: Type.INTEGER }
                        }
                    }
                }
            }
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

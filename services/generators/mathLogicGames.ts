
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { getMathPrompt } from './prompts';

export const generateBasicOperationsFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, itemCount, studentContext, selectedOperations, allowCarry, allowBorrow } = options;
    
    const operationRule = `
    - İşlemler: ${selectedOperations?.join(', ') || 'Karışık'}.
    - Eldeli Toplama: ${allowCarry ? 'Serbest' : 'KESİNLİKLE YASAK (Yeni öğrenenler için)'}.
    - Onluk Bozma: ${allowBorrow ? 'Serbest' : 'KESİNLİKLE YASAK'}.
    - Adet: ${itemCount || 25} işlem.
    - Matematiksel Doğruluk: Her işlem kesinlikle doğru sonuçlanmalı ve kısıtlamalara uymalıdır.
    `;

    const prompt = getMathPrompt("Dört İşlem Alıştırması", difficulty, operationRule, studentContext);

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            operations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        num1: { type: Type.INTEGER },
                        num2: { type: Type.INTEGER },
                        num3: { type: Type.INTEGER, nullable: true },
                        operator: { type: Type.STRING },
                        answer: { type: Type.INTEGER }
                    },
                    required: ['num1', 'num2', 'operator', 'answer']
                }
            }
        },
        required: ['title', 'instruction', 'operations', 'pedagogicalNote', 'imagePrompt']
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateNumberLogicRiddlesFromAI = async (options: GeneratorOptions): Promise<any[]> => {
    const { difficulty, numberRange, codeLength, worksheetCount, itemCount = 4, studentContext } = options;
    
    const rule = `
    [GÖREV]: Üst düzey "Sayısal Mantık Bilmeceleri" üret.
    [ZORLUK]: ${difficulty}
    [SAYI ARALIĞI]: ${numberRange || '1-50'}
    [ADET]: Her sayfada tam ${itemCount} adet bağımsız bilmece bloğu olmalı.
    
    BİLMECE YAPISI:
    - Her bilmece için 3-4 adet mantıksal ipucu yaz.
    - "boxes": Her bilmece için 5 adet sayı grubu. Doğru cevap bu sayılardan biri olmalı.
    - "sumTarget": Sayfadaki tüm bilmecelerin doğru cevaplarının TOPLAMINI hesapla ve 'sumTarget' alanına yaz.
    
    ÖNEMLİ: Sadece JSON döndür.
    `;

    const prompt = getMathPrompt("Gelişmiş Sayısal Mantık Bilmeceleri", difficulty, rule, studentContext);

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                sumTarget: { type: Type.INTEGER },
                sumMessage: { type: Type.STRING },
                puzzles: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            riddle: { type: Type.STRING },
                            boxes: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING },
                            answerValue: { type: Type.INTEGER }
                        },
                        required: ['riddle', 'boxes', 'options', 'answer', 'answerValue']
                    }
                }
            },
            required: ['title', 'puzzles', 'sumTarget']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

// ... existing code ...


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
    const { 
        difficulty, 
        numberRange, 
        worksheetCount, 
        itemCount = 4, 
        studentContext,
        logicModel = 'identity',
        gridSize = 3,
        showSumTarget = true
    } = options;
    
    const modelDesc = {
        'identity': 'Sayı Kimliği (Basamak değeri, tek/çift, aralık)',
        'exclusion': 'Eleme Mantığı (Şu değildir, şundan küçüktür)',
        'sequence': 'Dizi İlişkisi (Örüntü kuralı)',
        'cryptarithmetic': 'Şifreli Mantık (Sembolik karşılık)'
    }[logicModel];

    const rule = `
    [GÖREV]: Üst düzey "Sayısal Muhakeme" bilmeceleri üret.
    [İPUCU DERİNLİĞİ]: Her bilmece için TAM OLARAK ${gridSize} adet bağımsız ipucu üret.
    
    [İPUCU KATEGORİLERİ (Derinliğe göre karma kullan)]:
    1. Basit Özellik: Tek/Çift olma durumu.
    2. Aralık: X ile Y arasında olma.
    3. Rakam Analizi: Rakamları toplamı veya birler basamağı özelliği.
    4. Kat İlişkisi: X'in katı olma veya X'e bölünme.
    5. Karşılaştırma: Onluklarından büyük olma, yarısından küçük olma vb.

    [ZORUNLU]: "clues" bir dizi (array) olmalı. Her ipucu kısa, net ve disleksi dostu olmalı.
    
    [SAYFA HEDEFİ]: ${showSumTarget ? "Tüm doğru cevapların toplamı 'sumTarget' alanına yazılmalıdır." : ""}
    `;

    const prompt = getMathPrompt(`Mantık Bilmeceleri (Model: ${modelDesc})`, difficulty, rule, studentContext);

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
                            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
                            visualHint: { type: Type.STRING },
                            boxes: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING },
                            answerValue: { type: Type.INTEGER }
                        },
                        required: ['clues', 'boxes', 'options', 'answer', 'answerValue']
                    }
                }
            },
            required: ['title', 'puzzles']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

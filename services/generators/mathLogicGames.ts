
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
        'identity': 'Sayı Kimliği: Sayının basamak değerleri, tek/çift durumu ve komşuluk ilişkilerine odaklan.',
        'exclusion': 'Eleme Mantığı: "X değildir", "Şundan küçüktür ama şu değildir" gibi dışlayıcı önermeler kullan.',
        'sequence': 'Dizi/Örüntü: Sayının bir aritmetik dizideki yerini veya katlarını ipucu olarak ver.',
        'cryptarithmetic': 'Şifreleme: Sayıyı oluşturan rakamları sembollerle veya toplamsal bulmacalarla anlat.'
    }[logicModel];

    const rule = `
    [KESİN GÖREV]: Sayısal Muhakeme ve Mantık Bilmeceleri Üret.
    [ZORLUK SEVİYESİ]: ${difficulty}
    [SAYI EVRENİ]: ${numberRange || '1-50'}
    [MANTIK MODELİ]: ${modelDesc}
    [İPUCU SAYISI]: Her bir bilmece için TAM OLARAK ${gridSize} ADET bağımsız ipucu/önerme yaz. Ne eksik ne fazla!
    [SAYFA YAPISI]: Bir sayfada ${itemCount} adet bağımsız bilmece kutusu olsun.
    
    HESAPLAMA KURALLARI:
    1. Zorluk seviyesine göre sayıları seç: Başlangıç (1-10), Orta (1-50), Zor (1-100), Uzman (100-999).
    2. İpuçları birbirini desteklemeli ve tek bir doğru cevaba götürmeli.
    3. ${showSumTarget ? "'sumTarget' alanına, bu sayfadaki tüm doğru cevapların matematiksel toplamını yaz." : ""}
    
    JSON formatında döndür. Her bilmece için 'riddle' alanı ipuçlarının birleşimi olsun. 'options' alanında 4 seçenek ver.
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
                            visualHint: { type: Type.STRING },
                            boxes: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            answer: { type: Type.STRING },
                            answerValue: { type: Type.INTEGER }
                        },
                        required: ['riddle', 'boxes', 'options', 'answer', 'answerValue']
                    }
                }
            },
            required: ['title', 'puzzles']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

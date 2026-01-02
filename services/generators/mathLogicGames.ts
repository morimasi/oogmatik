
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
        'identity': 'Sayı Kimliği: Bir sayının tek/çift, basamak değerleri ve büyüklük-küçüklük özelliklerine dayalı önermeler.',
        'exclusion': 'Eleme Mantığı: Verilen seçenekler arasından yanlış olanları eledikten sonra kalan tek doğruyu buldurma.',
        'sequence': 'Dizi Çıkarımı: Gizli bir kurala göre ilerleyen sayılar arasındaki ilişkiyi bulma.',
        'cryptarithmetic': 'Şifreli İşlem: Sembollerin veya harflerin temsil ettiği rakamları mantıksal olarak çözme.'
    }[logicModel];

    const rule = `
    [GÖREV]: Üst düzey "Sayısal Muhakeme ve Mantık Bilmeceleri" üret.
    [ZORLUK]: ${difficulty}
    [SAYI EVRENİ]: ${numberRange || '1-50'}
    [MANTIK MODELİ]: ${modelDesc}
    [İPUCU DERİNLİĞİ]: Her bilmece için tam ${gridSize} adet kesin önerme/ipucu yaz.
    [SAYFA YAPISI]: Her sayfada ${itemCount} adet bağımsız bento-grid bloğu olmalı.
    
    ÖZEL KURALLAR:
    1. İpuçları "Sadece X değil" veya "X ile Y arasında" gibi disleksi dostu, somut ve mantıksal olmalı.
    2. Seçenekler birbirine yakın ama tek bir cevap doğru olmalı.
    3. ${showSumTarget ? "[YÖNETİCİ İŞLEV]: 'sumTarget' alanına sayfadaki tüm doğru cevapların toplamını yaz. Bu, öğrencinin dikkatini tüm sayfaya yaymasını sağlar." : ""}
    
    ÖNEMLİ: Sadece JSON döndür. Multimodal zekanı kullanarak her bilmece için bir "visualHint" (İngilizce SVG promptu) ekle.
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

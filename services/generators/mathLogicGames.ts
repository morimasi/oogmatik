
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FutoshikiData, NumberPyramidData, ShapeSudokuData,
    BasicOperationsData, RealLifeProblemData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Etkinliğin desteklediği bilişsel beceriyi (örn: mantıksal akıl yürütme, işlem akıcılığı) açıkla.
3. "instruction": Öğrenciye yönelik net, kısa ve cesaretlendirici bir yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Matematiksel, geometrik veya soyut bir illüstrasyon.
5. Veriler tutarlı ve çözülebilir olmalı (rastgele sayı yığını olmamalı).
`;

const baseMathSchema = (itemProp: string, itemType: any) => ({
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        prompt: { type: Type.STRING },
        instruction: { type: Type.STRING },
        pedagogicalNote: { type: Type.STRING },
        imagePrompt: { type: Type.STRING },
        [itemProp]: { type: Type.ARRAY, items: itemType }
    },
    required: ["title", "prompt", "instruction", "pedagogicalNote", "imagePrompt", itemProp]
});

export const generateBasicOperationsFromAI = async (options: GeneratorOptions): Promise<BasicOperationsData[]> => {
    const { selectedOperations, num1Digits, num2Digits, allowCarry, allowBorrow, allowRemainder, useThirdNumber, worksheetCount, itemCount } = options;
    
    const ops = selectedOperations && selectedOperations.length > 0 
        ? selectedOperations.map((op: string) => {
            if(op==='addition') return 'Toplama';
            if(op==='subtraction') return 'Çıkarma';
            if(op==='multiplication') return 'Çarpma';
            if(op==='division') return 'Bölme';
            return op;
        }).join(', ') 
        : 'Karışık (Toplama, Çıkarma, Çarpma, Bölme)';

    const prompt = `
    "Dört İşlem Alıştırması" hazırlıyorsun. Hedef kitle: İlkokul.
    AYARLAR:
    - İŞLEM TÜRLERİ: ${ops}.
    - SAYI 1 BASAMAK: ${num1Digits || 2}.
    - SAYI 2 BASAMAK: ${num2Digits || 1}.
    - İŞLEM SAYISI: ${itemCount || 12} adet.
    ÖZEL KURALLAR:
    - Toplama: ${allowCarry ? 'Eldeli olabilir.' : 'KESİNLİKLE ELDESİZ.'} ${useThirdNumber ? '3 sayı toplanmalı.' : '2 sayı toplanmalı.'}
    - Çıkarma: ${allowBorrow ? 'Onluk bozmalı olabilir.' : 'KESİNLİKLE ONLUK BOZMASIZ.'}
    - Bölme: ${allowRemainder ? 'Kalanlı olabilir.' : 'KESİNLİKLE KALANSIZ.'}
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet çalışma sayfası üret.
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
                isVertical: { type: Type.BOOLEAN },
                operations: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            num1: { type: Type.INTEGER },
                            num2: { type: Type.INTEGER },
                            num3: { type: Type.INTEGER },
                            operator: { type: Type.STRING, enum: ['+', '-', 'x', '÷'] },
                            answer: { type: Type.INTEGER },
                            remainder: { type: Type.INTEGER }
                        },
                        required: ['num1', 'num2', 'operator', 'answer']
                    }
                }
            },
            required: ['title', 'instruction', 'operations', 'pedagogicalNote', 'imagePrompt', 'isVertical']
        }
    };

    return generateWithSchema(prompt, schema) as Promise<BasicOperationsData[]>;
};

export const generateRealLifeMathProblemsFromAI = async (options: GeneratorOptions): Promise<RealLifeProblemData[]> => {
    const { difficulty, topic, operationType, worksheetCount, itemCount } = options;
    
    const prompt = `
    "${difficulty}" seviyesinde "Gerçek Hayat Matematik Problemleri" oluştur.
    Konu: ${topic || 'Günlük Yaşam (Market, Okul, Oyun)'}.
    Odak İşlem: ${operationType === 'mixed' ? 'Dört İşlem Karışık' : operationType}.
    Problem Sayısı: ${itemCount || 4} adet.
    
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet çalışma sayfası üret.
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
                problems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            solution: { type: Type.STRING },
                            operationHint: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING } 
                        },
                        required: ['text', 'solution', 'operationHint', 'imagePrompt']
                    }
                }
            },
            required: ['title', 'instruction', 'problems', 'pedagogicalNote', 'imagePrompt']
        }
    };

    return generateWithSchema(prompt, schema) as Promise<RealLifeProblemData[]>;
};

export const generateShapeSudokuFromAI = async(options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const prompt = `Şekilli Sudoku (4x4). Rakam yerine şekil kullan. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, shapesToUse: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {shape: {type: Type.STRING}, label: {type: Type.STRING}}, required: ["shape", "label"]}}}, required: ["grid", "shapesToUse"]}) };
    return generateWithSchema(prompt, schema) as Promise<ShapeSudokuData[]>;
}

export const generateFutoshikiFromAI = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, contentType } = options;
    const isLength = contentType === 'length';
    const prompt = `"${difficulty}" seviyesinde Futoşiki bulmacası. ${isLength ? 'Hücrelerde uzunluk ölçü birimleri (cm, m) kullan.' : 'Sayıları kullan.'} ${PEDAGOGICAL_PROMPT}`;
    
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {
        type: Type.OBJECT,
        properties: {
            size: { type: Type.INTEGER },
            numbers: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
            units: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            constraints: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { row1: { type: Type.INTEGER }, col1: { type: Type.INTEGER }, row2: { type: Type.INTEGER }, col2: { type: Type.INTEGER }, symbol: { type: Type.STRING } },
                    required: ["row1", "col1", "row2", "col2", "symbol"]
                }
            }
        },
        required: ["size", "constraints"] 
    }) };
    return generateWithSchema(prompt, schema) as Promise<FutoshikiData[]>;
};

export const generateNumberPyramidFromAI = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { difficulty, pyramidType } = options;
    let typeDesc = "Toplama";
    if (pyramidType === 'multiplication') typeDesc = "Çarpma";
    if (pyramidType === 'division') typeDesc = "Bölme";

    const prompt = `"${difficulty}" seviyesinde ${typeDesc} Piramidi. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('pyramids', {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
        },
        required: ["rows"]
    }) };
    return generateWithSchema(prompt, schema) as Promise<NumberPyramidData[]>;
};

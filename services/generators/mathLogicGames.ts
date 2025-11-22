
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FutoshikiData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData,
    RomanNumeralMultiplicationData, Sudoku6x6ShadedData, KendokuData, DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData,
    OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, OperationSquareMultDivData, ShapeSudokuData, FutoshikiLengthData, ShapeType,
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
        imagePrompt: { type: Type.STRING }, // Added
        [itemProp]: { type: Type.ARRAY, items: itemType }
    },
    required: ["title", "prompt", "instruction", "pedagogicalNote", "imagePrompt", itemProp]
});

export const generateBasicOperationsFromAI = async (options: GeneratorOptions): Promise<BasicOperationsData[]> => {
    const { operationType, digitCount, allowCarry, allowBorrow, allowRemainder, useThirdNumber, worksheetCount, itemCount } = options;
    
    const prompt = `
    "Dört İşlem Alıştırması" hazırlıyorsun. Hedef kitle: İlkokul.
    
    AYARLAR:
    - İşlem Türü: ${operationType === 'mixed' ? 'Toplama, Çıkarma, Çarpma, Bölme (Karışık)' : operationType}.
    - Basamak Sayısı: ${digitCount} (Sayılar bu basamakta olmalı).
    - İŞLEM SAYISI: ${itemCount || 12} adet.
    
    ÖZEL KURALLAR (Uygulamak Zorunlu):
    - Toplama ise: ${allowCarry ? 'Eldeli olabilir.' : 'KESİNLİKLE ELDESİZ OLMALI.'} ${useThirdNumber ? '3 adet sayı alt alta toplanmalı.' : '2 sayı toplanmalı.'}
    - Çıkarma ise: ${allowBorrow ? 'Onluk bozmalı olabilir.' : 'KESİNLİKLE ONLUK BOZMA GEREKTİRMEMELİ.'} (Üstteki sayı alttakinden büyük olmalı).
    - Bölme ise: ${allowRemainder ? 'Kalanlı bölme olabilir.' : 'KESİNLİKLE KALANSIZ OLMALI.'}
    
    ÇIKTI FORMATI (JSON):
    - operations dizisi içinde objeler:
      - num1: İlk sayı (Üstteki/Bölünen)
      - num2: İkinci sayı (Alttaki/Bölen/Çarpan)
      - num3: Varsa üçüncü sayı (sadece toplama için)
      - operator: İşlem işareti (+, -, x, ÷)
      - answer: İşlemin doğru sonucu
      - remainder: Bölme ise kalan (yoksa 0)
    
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
    
    İÇERİK:
    - Problemler hikayeleştirilmiş ve çocukların ilgisini çekecek türden olmalı.
    - Her problem için çözüm adımları net olmalı.
    - Her problem için o soruyu betimleyen basit bir görsel prompt (imagePrompt) yaz.
    
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
                imagePrompt: { type: Type.STRING }, // Cover image for the sheet
                problems: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            solution: { type: Type.STRING },
                            operationHint: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING } // Specific image for the problem
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

export const generateDivisionPyramidFromAI = async(options: GeneratorOptions): Promise<DivisionPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Bölme Piramidi. Üstteki sayı, alttaki iki sayının çarpımıdır (veya üstteki alttakine bölünür). ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('pyramids', {type: Type.OBJECT, properties: {rows: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.INTEGER}}}}, required: ["rows"]}) };
    return generateWithSchema(prompt, schema) as Promise<DivisionPyramidData[]>;
}

export const generateMultiplicationPyramidFromAI = async(options: GeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Çarpma Piramidi. Alttaki iki sayının çarpımı üstteki kutuya yazılır. ${PEDAGOGICAL_PROMPT} ${worksheetCount} adet üret.`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('pyramids', {type: Type.OBJECT, properties: {rows: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.INTEGER}}}}, required: ["rows"]}) };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationPyramidData[]>;
}

export const generateOperationSquareSubtractionFromAI = async(options: GeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
     const prompt = `Çıkarma İşlem Karesi (3x3 veya 4x4). Satır ve sütun işlemleri tutarlı olmalı. ${PEDAGOGICAL_PROMPT}`;
     const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}}, required: ["grid"]}) };
     return generateWithSchema(prompt, schema) as Promise<OperationSquareSubtractionData[]>;
}

export const generateOperationSquareFillInFromAI = async(options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
    const prompt = `Sayı Yerleştirmece (İşlem Karesi). Verilen sayıları boşluklara yerleştirerek eşitlikleri sağla. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, numbersToUse: {type: Type.ARRAY, items: {type: Type.INTEGER}}, results: {type: Type.ARRAY, items: {type: Type.INTEGER}}}, required: ["grid"]}) };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareFillInData[]>;
}

export const generateMultiplicationWheelFromAI = async(options: GeneratorOptions): Promise<MultiplicationWheelData[]> => {
    const prompt = `Çarpım Çarkı. Merkezdeki sayı ile çemberdeki sayıları çarp. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {type: Type.OBJECT, properties: {outerNumbers: {type: Type.ARRAY, items: {type: Type.INTEGER}}, innerResult: {type: Type.INTEGER}}, required: ["outerNumbers", "innerResult"]}) };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationWheelData[]>;
}

export const generateTargetNumberFromAI = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
    const prompt = `Hedef Sayı Oyunu. Verilen sayıları ve dört işlemi kullanarak hedef sayıya ulaş. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {type: Type.OBJECT, properties: {target: {type: Type.INTEGER}, givenNumbers: {type: Type.ARRAY, items: {type: Type.INTEGER}}}, required: ["target", "givenNumbers"]}) };
    return generateWithSchema(prompt, schema) as Promise<TargetNumberData[]>;
};

export const generateOperationSquareMultDivFromAI = async(options: GeneratorOptions): Promise<OperationSquareMultDivData[]> => {
    const prompt = `Çarpma/Bölme İşlem Karesi. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}}, required: ["grid"]}) };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareMultDivData[]>;
}

export const generateShapeSudokuFromAI = async(options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const prompt = `Şekilli Sudoku (4x4). Rakam yerine şekil kullan. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, shapesToUse: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {shape: {type: Type.STRING}, label: {type: Type.STRING}}, required: ["shape", "label"]}}}, required: ["grid", "shapesToUse"]}) };
    return generateWithSchema(prompt, schema) as Promise<ShapeSudokuData[]>;
}

export const generateFutoshikiFromAI = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Futoşiki bulmacası. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {
        type: Type.OBJECT,
        properties: {
            size: { type: Type.INTEGER },
            numbers: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
            constraints: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { row1: { type: Type.INTEGER }, col1: { type: Type.INTEGER }, row2: { type: Type.INTEGER }, col2: { type: Type.INTEGER }, symbol: { type: Type.STRING } },
                    required: ["row1", "col1", "row2", "col2", "symbol"]
                }
            }
        },
        required: ["size", "numbers", "constraints"]
    }) };
    return generateWithSchema(prompt, schema) as Promise<FutoshikiData[]>;
};

export const generateNumberPyramidFromAI = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Toplama Piramidi. ${PEDAGOGICAL_PROMPT}`;
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

export const generateNumberCapsuleFromAI = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
    const prompt = `Sayı Kapsülü Bulmacası. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            numbersToUse: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
            capsules: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        cells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } } } },
                        sum: { type: Type.INTEGER }
                    },
                    required: ["cells", "sum"]
                }
            }
        },
        required: ["grid", "capsules"]
    }) };
    return generateWithSchema(prompt, schema) as Promise<NumberCapsuleData[]>;
};

export const generateOddEvenSudokuFromAI = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const prompt = `Tek-Çift Sudoku (6x6). Gölgeli alan kuralı ekle. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            numbersToUse: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
            constrainedCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } } } }
        },
        required: ["grid", "constrainedCells"]
    }) };
    return generateWithSchema(prompt, schema) as Promise<OddEvenSudokuData[]>;
};

export const generateRomanNumeralConnectFromAI = async (options: GeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    const prompt = `Romen Rakamı Bağlama (Flow Free). ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { label: { type: Type.STRING }, x: { type: Type.INTEGER }, y: { type: Type.INTEGER } },
                    required: ["label", "x", "y"]
                }
            }
        },
        required: ["gridDim", "points"]
    }) };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralConnectData[]>;
};

export const generateRomanNumeralStarHuntFromAI = async (options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
    const prompt = `Romen Rakamlı Yıldız Avı. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            starCount: { type: Type.INTEGER }
        },
        required: ["title", "grid", "starCount", "instruction", "imagePrompt"]
    }};
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralStarHuntData[]>;
};

export const generateRoundingConnectFromAI = async (options: GeneratorOptions): Promise<RoundingConnectData[]> => {
    const prompt = `Sayı Yuvarlama Bağlamaca. Sayıları en yakın onluğa yuvarlayıp eşleştir. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, // Added
            example: { type: Type.STRING },
            numbers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.INTEGER }, group: { type: Type.INTEGER }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
                    required: ["value", "group", "x", "y"]
                }
            }
        },
        required: ["title", "numbers", "instruction", "imagePrompt"]
    }};
    return generateWithSchema(prompt, schema) as Promise<RoundingConnectData[]>;
};

export const generateRomanNumeralMultiplicationFromAI = async (options: GeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
    const prompt = `Romen Rakamlı Çarpım Karesi. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {
        type: Type.OBJECT,
        properties: {
            row1: { type: Type.STRING }, row2: { type: Type.STRING }, col1: { type: Type.STRING }, col2: { type: Type.STRING },
            results: { type: Type.OBJECT, properties: { r1c1: { type: Type.STRING }, r1c2: { type: Type.STRING }, r2c1: { type: Type.STRING }, r2c2: { type: Type.STRING } } }
        },
        required: ["row1", "col1", "results"]
    }) };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralMultiplicationData[]>;
};

export const generateKendokuFromAI = async (options: GeneratorOptions): Promise<KendokuData[]> => {
    const { difficulty } = options;
    const prompt = `"${difficulty}" seviyesinde Kendoku (Calcudoku). ${PEDAGOGICAL_PROMPT}`;
    const schema = { 
        type: Type.ARRAY, 
        items: baseMathSchema('puzzles', {
            type: Type.OBJECT,
            properties: {
                size: { type: Type.INTEGER },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                cages: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            cells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } },
                            operation: { type: Type.STRING },
                            target: { type: Type.INTEGER }
                        },
                        required: ["cells", "target"]
                    }
                }
            },
            required: ["size", "cages"]
        }) 
    };
    return generateWithSchema(prompt, schema) as Promise<KendokuData[]>;
};

export const generateFutoshikiLengthFromAI = async(options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
     const res = await generateFutoshikiFromAI(options);
     // @ts-ignore
     return res.map(r => ({
         ...r, 
         title: 'Uzunluk Karşılaştırma (Futoşiki)', 
         instruction: 'Nesnelerin uzunluklarını (cm, m) büyüktür/küçüktür işaretlerine göre sırala.',
         pedagogicalNote: 'Ölçme birimleri ve sıralama mantığı.',
         imagePrompt: "Illustration of various measuring tools like ruler, tape measure."
    }));
}

export const generateSudoku6x6ShadedFromAI = async(options: GeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
     const res = await generateOddEvenSudokuFromAI(options);
     // @ts-ignore
     return res.map(r => ({
         ...r, 
         title: '6x6 Gölgeli Sudoku', 
         instruction: "Gölgeli alanlara sadece ÇİFT sayılar gelebilir.",
         pedagogicalNote: "Görsel kısıtlamalı mantık yürütme.",
         imagePrompt: "Abstract geometric sudoku grid with shaded areas."
    }));
}

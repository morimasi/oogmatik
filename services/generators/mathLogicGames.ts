
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FutoshikiData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData,
    RomanNumeralMultiplicationData, KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, ShapeType,
    BasicOperationsData, RealLifeProblemData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"pedagogicalNote":** Etkinliğin desteklediği bilişsel beceriyi (örn: mantıksal akıl yürütme, işlem akıcılığı, problem çözme stratejileri) açıkla.
4.  **"instruction":** Öğrenciye yönelik net, kısa ve cesaretlendirici bir yönerge.
5.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Geometric Flat Art", "Mathematical Illustration", "Clean & Modern".
    - **Detay:** Soyut kavramları somutlaştıracak renkli ve net şekiller tarif et.
6.  **İçerik:**
    - Veriler tutarlı ve kesinlikle çözülebilir olmalı (rastgele sayı yığını olmamalı).
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
    
    // Prepare operations description
    const ops = selectedOperations && selectedOperations.length > 0 
        ? selectedOperations.map((op: string) => {
            if(op==='add') return 'Toplama';
            if(op==='sub') return 'Çıkarma';
            if(op==='mult') return 'Çarpma';
            if(op==='div') return 'Bölme';
            return op;
        }).join(', ') 
        : 'Karışık (Toplama, Çıkarma, Çarpma, Bölme)';

    const prompt = `
    "Dört İşlem Alıştırması" hazırlıyorsun. Hedef kitle: İlkokul.
    
    AYARLAR:
    - İŞLEM TÜRLERİ: ${ops}. (Seçilen türlerden eşit sayıda soru üret).
    - SAYI 1 (Üstteki/Bölünen) BASAMAK SAYISI: ${num1Digits || 2}.
    - SAYI 2 (Alttaki/Bölen/Çarpan) BASAMAK SAYISI: ${num2Digits || 1}.
    - İŞLEM SAYISI: ${itemCount || 25} adet. (Varsayılan olarak 25 tane üret ki sayfa dolsun).
    
    ÖZEL KURALLAR (Uygulamak Zorunlu):
    - Toplama ise: ${allowCarry ? 'Eldeli olabilir.' : 'KESİNLİKLE ELDESİZ OLMALI.'} ${useThirdNumber ? '3 adet sayı alt alta toplanmalı (3. sayının basamağı 2. sayı ile uyumlu olsun).' : '2 sayı toplanmalı.'}
    - Çıkarma ise: ${allowBorrow ? 'Onluk bozmalı olabilir.' : 'KESİNLİKLE ONLUK BOZMA GEREKTİRMEMELİ.'} (Üstteki sayı alttakinden büyük olmalı).
    - Bölme ise: ${allowRemainder ? 'Kalanlı bölme olabilir.' : 'KESİNLİKLE KALANSIZ OLMALI.'}
    
    ÇIKTI FORMATI (JSON):
    - operations dizisi içinde objeler:
      - num1: İlk sayı
      - num2: İkinci sayı
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

export const generateOperationSquareFillInFromAI = async(options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
    const { operationType, difficulty, worksheetCount } = options;
    let typeDesc = "Dört İşlem";
    if (operationType === 'addsub') typeDesc = "Toplama ve Çıkarma";
    if (operationType === 'multdiv') typeDesc = "Çarpma ve Bölme";

    const prompt = `"${difficulty}" seviyesinde ${typeDesc} içeren Sayı Yerleştirmece (İşlem Karesi). Verilen sayıları boşluklara yerleştirerek eşitlikleri sağla. ${PEDAGOGICAL_PROMPT}`;
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

export const generateShapeSudokuFromAI = async(options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const prompt = `Şekilli Sudoku (4x4). Rakam yerine şekil kullan. ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, shapesToUse: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {shape: {type: Type.STRING}, label: {type: Type.STRING}}, required: ["shape", "label"]}}}, required: ["grid", "shapesToUse"]}) };
    return generateWithSchema(prompt, schema) as Promise<ShapeSudokuData[]>;
}

export const generateFutoshikiFromAI = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount, contentType } = options;
    const isLength = contentType === 'length';
    const prompt = `"${difficulty}" seviyesinde Futoşiki bulmacası. ${isLength ? 'Hücrelerde uzunluk ölçü birimleri (cm, m) kullan ve bunları büyüktür/küçüktür ilişkisine göre sırala.' : 'Sayıları kullan.'} ${PEDAGOGICAL_PROMPT}`;
    
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {
        type: Type.OBJECT,
        properties: {
            size: { type: Type.INTEGER },
            numbers: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
            // Optional units for length variant
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
        required: ["size", "constraints"] // numbers is optional if units is present technically, but schema usually strict
    }) };
    return generateWithSchema(prompt, schema) as Promise<FutoshikiData[]>;
};

export const generateNumberPyramidFromAI = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { difficulty, worksheetCount, pyramidType } = options;
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
    const { variant } = options;
    const prompt = `Sudoku (6x6). ${variant === 'shaded' ? 'Gölgeli alan kuralı ekle.' : 'Tek-Çift kuralı ekle.'} ${PEDAGOGICAL_PROMPT}`;
    const schema = { type: Type.ARRAY, items: baseMathSchema('puzzles', {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            numbersToUse: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
            constrainedCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } } } },
            shadedCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } } } }
        },
        required: ["grid"]
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
            imagePrompt: { type: Type.STRING },
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
            imagePrompt: { type: Type.STRING },
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
                            cells: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        row: { type: Type.INTEGER }, 
                                        col: { type: Type.INTEGER }
                                    }, 
                                    required: ["row", "col"] 
                                } 
                            },
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

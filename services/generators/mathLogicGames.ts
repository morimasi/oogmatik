
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FutoshikiData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData,
    RomanNumeralMultiplicationData, Sudoku6x6ShadedData, KendokuData, DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData,
    OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, OperationSquareMultDivData, ShapeSudokuData, FutoshikiLengthData, ShapeType
} from '../../types';

export const generateDivisionPyramidFromAI = async(options: GeneratorOptions): Promise<DivisionPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    Create a "Division Pyramid" for difficulty level "${difficulty}". 
    Generate ${worksheetCount} pyramids.
    RULE: Top block is the product of two blocks below it. (So going down is division). Ensure all numbers are integers.
    PEDAGOGICAL NOTE: "Çarpma ve bölme arasındaki ters ilişkiyi kavrama."
    INSTRUCTION: "Alttaki iki sayıyı çarparak üstteki kutuyu, veya üstteki sayıyı alttakine bölerek yanındakini bul."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, pyramids: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {rows: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.INTEGER}}}}, required: ["rows"]}} }, required: ["title", "pyramids", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<DivisionPyramidData[]>;
}

export const generateMultiplicationPyramidFromAI = async(options: GeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    Create a "Multiplication Pyramid" for difficulty level "${difficulty}".
    Numbers increase upwards by multiplication (Cell = BelowLeft * BelowRight).
    PEDAGOGICAL NOTE: "Çarpma işlemi pratiği ve büyüme örüntüleri."
    INSTRUCTION: "Alttaki iki sayıyı çarparak üstteki kutuyu bul."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, pyramids: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {rows: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.INTEGER}}}}, required: ["rows"]}} }, required: ["title", "pyramids", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationPyramidData[]>;
}

export const generateOperationSquareSubtractionFromAI = async(options: GeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
     const prompt = `
     Create a 3x3 or 4x4 subtraction logic square.
     Rows and columns must satisfy subtraction equations.
     PEDAGOGICAL NOTE: "Çıkarma işlemi ve mantıksal tamamlama."
     INSTRUCTION: "Satır ve sütunlardaki çıkarma işlemlerini tamamla."
     `;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}}, required: ["grid"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
     return generateWithSchema(prompt, schema) as Promise<OperationSquareSubtractionData[]>;
}

export const generateOperationSquareFillInFromAI = async(options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
    const prompt = `
    Create a fill-in operation square. Given a list of numbers, place them into the grid so all equations (horizontal and vertical) are correct.
    PEDAGOGICAL NOTE: "Denklem kurma, olasılıkları değerlendirme ve sayısal mantık."
    INSTRUCTION: "Verilen sayıları, işlemler doğru olacak şekilde kutulara yerleştir."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, numbersToUse: {type: Type.ARRAY, items: {type: Type.INTEGER}}, results: {type: Type.ARRAY, items: {type: Type.INTEGER}}}, required: ["grid"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareFillInData[]>;
}

export const generateMultiplicationWheelFromAI = async(options: GeneratorOptions): Promise<MultiplicationWheelData[]> => {
    const prompt = `
    Create a multiplication wheel. A center number, a middle ring of multiplicands, and an outer ring for results.
    PEDAGOGICAL NOTE: "Çarpım tablosu ezberi ve dairesel işlem takibi."
    INSTRUCTION: "Merkezdeki sayı ile orta halkadaki sayıları çarpıp en dışa yaz."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {outerNumbers: {type: Type.ARRAY, items: {type: Type.INTEGER}}, innerResult: {type: Type.INTEGER}}, required: ["outerNumbers", "innerResult"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationWheelData[]>;
}

export const generateTargetNumberFromAI = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
    const prompt = `
    Create a 'Target Number' game. Provide 4-5 numbers and a target result. The user must use standard operations (+, -, *, /) to reach the target.
    PEDAGOGICAL NOTE: "İşlem önceliği, deneme-yanılma stratejisi ve problem çözme."
    INSTRUCTION: "Verilen sayıları dört işlemle kullanarak hedef sayıya ulaş."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {target: {type: Type.INTEGER}, givenNumbers: {type: Type.ARRAY, items: {type: Type.INTEGER}}}, required: ["target", "givenNumbers"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<TargetNumberData[]>;
};

export const generateOperationSquareMultDivFromAI = async(options: GeneratorOptions): Promise<OperationSquareMultDivData[]> => {
    const prompt = `
    Create a multiplication/division logic square.
    PEDAGOGICAL NOTE: "Çarpma-bölme ilişkisi ve mantıksal doğrulama."
    INSTRUCTION: "Satır ve sütunlardaki çarpma/bölme işlemlerini tamamla."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}}, required: ["grid"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareMultDivData[]>;
}

export const generateShapeSudokuFromAI = async(options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const prompt = `
    Create a 4x4 Shape Sudoku. Use simple shapes (circle, square, triangle, star) instead of numbers.
    PEDAGOGICAL NOTE: "Görsel mantık, kategorizasyon ve sembolik işlem."
    INSTRUCTION: "Her satır, sütun ve bölgede her şekilden bir tane olacak şekilde çiz."
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, shapesToUse: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {shape: {type: Type.STRING}, label: {type: Type.STRING}}, required: ["shape", "label"]}}}, required: ["grid", "shapesToUse"]}} }, required: ["title", "puzzles", "instruction", "pedagogicalNote"] } };
    return generateWithSchema(prompt, schema) as Promise<ShapeSudokuData[]>;
}

// --- IMPLEMENTATIONS OF PREVIOUSLY BROKEN EXPORTS ---

export const generateFutoshikiFromAI = async (options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create ${worksheetCount} Futoshiki puzzles for difficulty "${difficulty}" (4x4 or 5x5). 
    Provide grid (numbers or null) and constraints (>, <).
    PEDAGOGICAL NOTE: "Mantıksal sıralama ve büyüklük-küçüklük ilişkisi."
    INSTRUCTION: "Sayıları, satır ve sütunlarda tekrar etmeyecek ve işaretlere uyacak şekilde yerleştir."`;
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        size: { type: Type.INTEGER },
                        numbers: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }, // Allow nulls in JSON as null
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
                }
            }
        },
        required: ["title", "puzzles", "instruction"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FutoshikiData[]>;
};

export const generateNumberPyramidFromAI = async (options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create ${worksheetCount} Number Pyramid puzzles (Addition) for difficulty "${difficulty}". 
    PEDAGOGICAL NOTE: "Toplama işlemi ve parça-bütün ilişkisi."
    INSTRUCTION: "Alt kutudaki sayıları toplayarak üst kutuya yaz."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            pyramids: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
                    },
                    required: ["rows"]
                }
            }
        },
        required: ["title", "pyramids"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberPyramidData[]>;
};

export const generateNumberCapsuleFromAI = async (options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
    const { worksheetCount } = options;
    const prompt = `Create Number Capsule puzzles. Groups of cells (capsules) must sum to a target.
    PEDAGOGICAL NOTE: "Toplama ve mantıksal deneme-yanılma."
    INSTRUCTION: "Kapsüllerin içindeki sayıların toplamı, hedef sayıya eşit olmalı."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
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
                }
            }
        },
        required: ["title", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberCapsuleData[]>;
};

export const generateOddEvenSudokuFromAI = async (options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create Odd-Even Sudoku (6x6). Shaded cells must be EVEN (or ODD).
    PEDAGOGICAL NOTE: "Tek-Çift sayı ayrımı ve Sudoku mantığı."
    INSTRUCTION: "Sudoku kurallarına uy. Gri kutulara sadece ÇİFT sayılar gelebilir."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        numbersToUse: { type: Type.STRING },
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        constrainedCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } } } }
                    },
                    required: ["grid", "constrainedCells"]
                }
            }
        },
        required: ["title", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<OddEvenSudokuData[]>;
};

export const generateRomanNumeralConnectFromAI = async (options: GeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    const { worksheetCount } = options;
    const prompt = `Create Roman Numeral Connect puzzle (like Flow Free). Connect matching Roman numerals IV, V, X, etc.
    PEDAGOGICAL NOTE: "Romen rakamlarını tanıma ve yol planlama."
    INSTRUCTION: "Aynı Romen rakamlarını çizgiler birbirini kesmeyecek şekilde birleştir."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
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
                }
            }
        },
        required: ["title", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralConnectData[]>;
};

export const generateRomanNumeralStarHuntFromAI = async (options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
    const { worksheetCount } = options;
    const prompt = `Create Roman Numeral Star Hunt. Grid with Roman numeral clues indicating stars in row/col.
    PEDAGOGICAL NOTE: "Romen rakamlarını kullanma ve mantıksal çıkarım."
    INSTRUCTION: "Romen rakamları o satır/sütundaki yıldız sayısını gösterir. Yıldızları bul."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            starCount: { type: Type.INTEGER }
        },
        required: ["title", "grid", "starCount"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralStarHuntData[]>;
};

export const generateRoundingConnectFromAI = async (options: GeneratorOptions): Promise<RoundingConnectData[]> => {
    const { worksheetCount } = options;
    const prompt = `Create Rounding Connect puzzle. Match numbers to their rounded tens (e.g. 23 -> 20).
    PEDAGOGICAL NOTE: "Sayı yuvarlama ve eşleştirme."
    INSTRUCTION: "Sayıları en yakın onluğa yuvarlayarak eşleştir."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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
        required: ["title", "numbers"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RoundingConnectData[]>;
};

export const generateRomanNumeralMultiplicationFromAI = async (options: GeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
    const { worksheetCount } = options;
    const prompt = `Create Roman Numeral Multiplication square.
    PEDAGOGICAL NOTE: "Romen rakamlarıyla işlem yapma."
    INSTRUCTION: "Romen rakamlarını çarp ve sonucu yaz."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        row1: { type: Type.STRING }, row2: { type: Type.STRING }, col1: { type: Type.STRING }, col2: { type: Type.STRING },
                        results: { type: Type.OBJECT, properties: { r1c1: { type: Type.STRING }, r1c2: { type: Type.STRING }, r2c1: { type: Type.STRING }, r2c2: { type: Type.STRING } } }
                    },
                    required: ["row1", "col1", "results"]
                }
            }
        },
        required: ["title", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralMultiplicationData[]>;
};

export const generateKendokuFromAI = async (options: GeneratorOptions): Promise<KendokuData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create ${worksheetCount} Kendoku (Calcudoku) puzzles for difficulty "${difficulty}".
    PEDAGOGICAL NOTE: "Aritmetik işlem ve mantıksal akıl yürütme."
    INSTRUCTION: "Kafeslerdeki işlem ve hedef sayıya uyarak ızgarayı doldur."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        size: { type: Type.INTEGER },
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        cages: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    cells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } } } },
                                    operation: { type: Type.STRING },
                                    target: { type: Type.INTEGER }
                                },
                                required: ["cells", "target"]
                            }
                        }
                    },
                    required: ["size", "cages"]
                }
            }
        },
        required: ["title", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<KendokuData[]>;
};

export const generateFutoshikiLengthFromAI = async(options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
     const res = await generateFutoshikiFromAI(options);
     // @ts-ignore
     return res.map(r => ({
         ...r, 
         title: 'Uzunluk Karşılaştırma (Futoşiki)', 
         instruction: 'Nesnelerin uzunluklarını büyüktür/küçüktür işaretlerine göre sırala.',
         pedagogicalNote: 'Ölçme kavramları ve mantıksal sıralama.'
    }));
}

export const generateSudoku6x6ShadedFromAI = async(options: GeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
     const res = await generateOddEvenSudokuFromAI(options);
     // @ts-ignore
     return res.map(r => ({
         ...r, 
         title: '6x6 Gölgeli Sudoku', 
         instruction: "Gölgeli alanlara sadece ÇİFT sayılar gelebilir. Sudoku kurallarını unutma.",
         pedagogicalNote: "Görsel kısıtlamalarla mantık yürütme."
    }));
}

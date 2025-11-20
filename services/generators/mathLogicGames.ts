
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FutoshikiData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData,
    RomanNumeralMultiplicationData, Sudoku6x6ShadedData, KendokuData, DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData,
    OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, OperationSquareMultDivData, ShapeSudokuData, FutoshikiLengthData, ShapeType
} from '../../types';

const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];

// Common Pedagogical Descriptions
const PEDAGOGICAL_NOTES = {
    logic: "Mantıksal çıkarım, olasılıkları eleme ve problem çözme stratejilerini geliştirir.",
    arithmetic: "İşlem akıcılığı, sayısal ilişkileri kavrama ve zihinden işlem yapma becerisini destekler.",
    spatial: "Uzamsal farkındalık ve görsel-mekansal ilişkilendirme yeteneğini güçlendirir.",
    pattern: "Örüntü tanıma, kural bulma ve cebirsel düşünmenin temellerini atar."
};

export const generateFutoshikiFromAI = async(options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    
    let size = 4;
    if (difficulty === 'Orta') size = 5;
    if (difficulty === 'Zor' || difficulty === 'Uzman') size = 6;

    const prompt = `Create a Futoshiki puzzle appropriate for difficulty level "${difficulty}". 
    Generate a worksheet with ${itemCount} puzzles of size ${size}x${size}. 
    Provide the grid with some pre-filled numbers (null for empty cells) and a set of inequality constraints between adjacent cells.
    INSTRUCTION: "Her satır ve sütunda rakamlar sadece bir kez kullanılabilir. '>' ve '<' işaretlerinin gösterdiği büyüklük-küçüklük ilişkisine dikkat ederek boşlukları doldur."
    PEDAGOGICAL NOTE: ${PEDAGOGICAL_NOTES.logic}
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    
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
                        numbers: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        constraints: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    row1: { type: Type.INTEGER }, col1: { type: Type.INTEGER },
                                    row2: { type: Type.INTEGER }, col2: { type: Type.INTEGER },
                                    symbol: { type: Type.STRING, enum: ['<', '>'] }
                                },
                                required: ["row1", "col1", "row2", "col2", "symbol"]
                            }
                        }
                    },
                    required: ["size", "numbers", "constraints"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FutoshikiData[]>;
}

export const generateNumberPyramidFromAI = async(options: GeneratorOptions): Promise<NumberPyramidData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    
    let rows = 4;
    let complexity = "Basit toplama işlemleri.";
    if (difficulty === 'Başlangıç') rows = 3;
    if (difficulty === 'Zor' || difficulty === 'Uzman') { rows = 5; complexity = "Elde varlı toplama ve daha büyük sayılar."; }

    const prompt = `Create a number pyramid (addition) puzzle appropriate for difficulty level "${difficulty}". 
    Generate a worksheet with ${itemCount} pyramids. Each pyramid has ${rows} rows. 
    A number in a cell is the sum of the two cells directly below it. Some cells should be empty (null).
    COMPLEXITY: ${complexity}
    INSTRUCTION: "Her kutucuk, altındaki iki kutucuğun toplamına eşittir. Eksik sayıları bul."
    PEDAGOGICAL NOTE: ${PEDAGOGICAL_NOTES.arithmetic}
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    
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
                    required: ["title", "rows"]
                }
            }
        },
        required: ["title", "prompt", "pyramids"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberPyramidData[]>;
}

export const generateNumberCapsuleFromAI = async(options: GeneratorOptions): Promise<NumberCapsuleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a number capsule (Kakuro-style) puzzle appropriate for difficulty level "${difficulty}". 
    Generate a worksheet with 1 puzzle on a 4x4 grid. Some cells are empty (null). 
    Define several 'capsules' (groups of cells) and their target sums. The user must fill the grid with numbers from a given set (e.g., 1-9) without repetition in a capsule. 
    INSTRUCTION: "Her kapsülün (bağlı kutuların) içindeki sayıların toplamı, o kapsülün hedef sayısına eşit olmalıdır."
    PEDAGOGICAL NOTE: ${PEDAGOGICAL_NOTES.arithmetic}
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
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
                                    cells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } },
                                    sum: { type: Type.INTEGER }
                                },
                                required: ["cells", "sum"]
                            }
                        }
                    },
                    required: ["title", "numbersToUse", "grid", "capsules"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberCapsuleData[]>;
}

export const generateOddEvenSudokuFromAI = async(options: GeneratorOptions): Promise<OddEvenSudokuData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a 6x6 Odd-Even Sudoku appropriate for difficulty level "${difficulty}". 
    Generate a worksheet with ${itemCount} puzzles. The grid has some pre-filled numbers. 
    Some empty cells are marked (shaded/constrained) and must contain an EVEN number, while unmarked empty cells can be anything (or odd, depending on specific rule). 
    Specify which cells are constrained to be EVEN.
    INSTRUCTION: "Normal Sudoku kuralları geçerlidir. Ayrıca, gri renkli kutulara sadece ÇİFT sayılar (2, 4, 6) gelebilir."
    PEDAGOGICAL NOTE: "Sayıların özellikleri (tek/çift) ile mantıksal yerleştirme kurallarını birleştirir."
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
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
                        constrainedCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } }
                    },
                    required: ["title", "numbersToUse", "grid", "constrainedCells"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<OddEvenSudokuData[]>;
}

export const generateRomanNumeralConnectFromAI = async(options: GeneratorOptions): Promise<RomanNumeralConnectData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `Create a "Roman Numeral Connect" puzzle for difficulty "${difficulty}". Connect identical Roman numerals (I, V, X, L) on a ${gridSize}x${gridSize} grid without crossing lines.
    INSTRUCTION: "Aynı Romen rakamlarını çizgiler birbirini kesmeyecek şekilde birleştir."
    PEDAGOGICAL NOTE: ${PEDAGOGICAL_NOTES.spatial}`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
            puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, gridDim: { type: Type.INTEGER }, points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["label", "x", "y"] } } }, required: ["title", "gridDim", "points"] } }
        }, required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralConnectData[]>;
}

export const generateRomanNumeralStarHuntFromAI = async(options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
    const prompt = `Create a "Roman Numeral Star Hunt" puzzle. Grid border has Roman numerals indicating how many stars are in that row/col.
    INSTRUCTION: "Satır ve sütun başlarındaki Romen rakamlarına göre yıldızları yerleştir."
    PEDAGOGICAL NOTE: ${PEDAGOGICAL_NOTES.logic}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, starCount: {type: Type.INTEGER} }, required: ["title", "grid", "starCount"] } };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralStarHuntData[]>;
}
export const generateRoundingConnectFromAI = async(options: GeneratorOptions): Promise<RoundingConnectData[]> => {
    const prompt = `Create a "Rounding Connect" puzzle. Connect numbers to their rounded nearest 10 value.
    INSTRUCTION: "Sayıları en yakın onluğa yuvarlayarak eşleştir."
    PEDAGOGICAL NOTE: ${PEDAGOGICAL_NOTES.arithmetic}`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, example: {type: Type.STRING}, numbers: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {value: {type: Type.INTEGER}, group: {type: Type.INTEGER}, x: {type: Type.NUMBER}, y: {type: Type.NUMBER}}, required: ["value", "group", "x", "y"]}} }, required: ["title", "prompt", "numbers"] } };
    return generateWithSchema(prompt, schema) as Promise<RoundingConnectData[]>;
}
export const generateRomanNumeralMultiplicationFromAI = async(options: GeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
    const prompt = `Create a multiplication table puzzle using Roman Numerals.
    INSTRUCTION: "Romen rakamlarıyla verilen sayıları çarpıp sonucu yaz."
    PEDAGOGICAL NOTE: "Romen rakamları ve çarpma pratiği."`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {row1: {type: Type.STRING}, row2: {type: Type.STRING}, col1: {type: Type.STRING}, col2: {type: Type.STRING}, results: {type: Type.OBJECT, properties: {r1c1: {type: Type.STRING}, r1c2: {type: Type.STRING}, r2c1: {type: Type.STRING}, r2c2: {type: Type.STRING}}, required: ["r1c1"]}}, required: ["row1"]}} }, required: ["title", "puzzles"] } };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralMultiplicationData[]>;
}
export const generateSudoku6x6ShadedFromAI = async(options: GeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
     const res = await generateOddEvenSudokuFromAI(options);
     // @ts-ignore
     return res.map(r => ({...r, title: '6x6 Gölgeli Sudoku', instruction: "Gölgeli alanlara dikkat ederek Sudoku'yu çöz."}));
}

export const generateKendokuFromAI = async(options: GeneratorOptions): Promise<KendokuData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const size = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 5);
    const prompt = `Create a ${size}x${size} Kendoku (Calcudoku) puzzle appropriate for difficulty level "${difficulty}". 
    Generate a worksheet with ${itemCount} puzzles. Provide the size, an empty grid, and a list of 'cages'. 
    Each cage specifies the cells it contains, the arithmetic operation (+, −, ×, ÷), and the target number.
    INSTRUCTION: "Her satır ve sütunda rakamlar bir kez kullanılmalı. Kalın çizgili alanlardaki (kafes) sayılarla işlem yapıldığında hedef sayıya ulaşılmalı."
    PEDAGOGICAL NOTE: ${PEDAGOGICAL_NOTES.arithmetic} + " " + ${PEDAGOGICAL_NOTES.logic}
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: {
                        size: { type: Type.INTEGER },
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        cages: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { cells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } }, operation: { type: Type.STRING, enum: ['+', '−', '×', '÷'] }, target: { type: Type.INTEGER } }, required: ["cells", "operation", "target"] } }
                    }, required: ["size", "grid", "cages"]
                }
            }
        }, required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<KendokuData[]>;
}

export const generateDivisionPyramidFromAI = async(options: GeneratorOptions): Promise<DivisionPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Division Pyramid" for difficulty level "${difficulty}". Numbers decrease upwards by integer division. Provide ${worksheetCount} unique worksheets.
    INSTRUCTION: "Alttaki iki sayıyı bölerek üstteki kutuyu bul."
    PEDAGOGICAL NOTE: "Bölme işlemi pratiği."`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, pyramids: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {rows: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.INTEGER}}}}, required: ["rows"]}} }, required: ["title", "pyramids"] } };
    return generateWithSchema(prompt, schema) as Promise<DivisionPyramidData[]>;
}
export const generateMultiplicationPyramidFromAI = async(options: GeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Multiplication Pyramid" for difficulty level "${difficulty}". Numbers increase upwards by multiplication.
    INSTRUCTION: "Alttaki iki sayıyı çarparak üstteki kutuyu bul."
    PEDAGOGICAL NOTE: "Çarpma işlemi pratiği."`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, pyramids: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {rows: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.INTEGER}}}}, required: ["rows"]}} }, required: ["title", "pyramids"] } };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationPyramidData[]>;
}
export const generateOperationSquareSubtractionFromAI = async(options: GeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
     const prompt = `Create a subtraction logic square.
     INSTRUCTION: "Satır ve sütunlardaki çıkarma işlemlerini tamamla."
     PEDAGOGICAL NOTE: "Çıkarma işlemi ve mantıksal tamamlama."`;
     const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}}, required: ["grid"]}} }, required: ["title", "puzzles"] } };
     return generateWithSchema(prompt, schema) as Promise<OperationSquareSubtractionData[]>;
}
export const generateOperationSquareFillInFromAI = async(options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
    const prompt = `Create a fill-in operation square. Given numbers must be placed to satisfy equations.
    INSTRUCTION: "Verilen sayıları, işlemler doğru olacak şekilde kutulara yerleştir."
    PEDAGOGICAL NOTE: "Denklem kurma ve sayısal mantık."`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, numbersToUse: {type: Type.ARRAY, items: {type: Type.INTEGER}}, results: {type: Type.ARRAY, items: {type: Type.INTEGER}}}, required: ["grid"]}} }, required: ["title", "puzzles"] } };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareFillInData[]>;
}
export const generateMultiplicationWheelFromAI = async(options: GeneratorOptions): Promise<MultiplicationWheelData[]> => {
    const prompt = `Create a multiplication wheel. Center number multiplies outer ring.
    INSTRUCTION: "Merkezdeki sayı ile dış halkayı çarpıp en dışa yaz."
    PEDAGOGICAL NOTE: "Çarpım tablosu ezberi."`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {outerNumbers: {type: Type.ARRAY, items: {type: Type.INTEGER}}, innerResult: {type: Type.INTEGER}}, required: ["outerNumbers", "innerResult"]}} }, required: ["title", "puzzles"] } };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationWheelData[]>;
}
export const generateTargetNumberFromAI = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
    const prompt = `Create a 'Target Number' game. Given 4 numbers, reach target using math.
    INSTRUCTION: "Verilen sayıları dört işlemle kullanarak hedef sayıya ulaş."
    PEDAGOGICAL NOTE: "İşlem önceliği ve problem çözme."`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {target: {type: Type.INTEGER}, givenNumbers: {type: Type.ARRAY, items: {type: Type.INTEGER}}}, required: ["target", "givenNumbers"]}} }, required: ["title", "puzzles"] } };
    return generateWithSchema(prompt, schema) as Promise<TargetNumberData[]>;
};
export const generateOperationSquareMultDivFromAI = async(options: GeneratorOptions): Promise<OperationSquareMultDivData[]> => {
    const prompt = `Create a multiplication/division logic square.
    INSTRUCTION: "Satır ve sütunlardaki çarpma/bölme işlemlerini tamamla."
    PEDAGOGICAL NOTE: "Çarpma-bölme ilişkisi."`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}}, required: ["grid"]}} }, required: ["title", "puzzles"] } };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareMultDivData[]>;
}
export const generateShapeSudokuFromAI = async(options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const prompt = `Create a Shape Sudoku (4x4). Use shapes instead of numbers.
    INSTRUCTION: "Her satır, sütun ve bölgede her şekilden bir tane olsun."
    PEDAGOGICAL NOTE: "Görsel mantık ve kategorizasyon."`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING}, puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, shapesToUse: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {shape: {type: Type.STRING}, label: {type: Type.STRING}}, required: ["shape", "label"]}}}, required: ["grid", "shapesToUse"]}} }, required: ["title", "puzzles"] } };
    return generateWithSchema(prompt, schema) as Promise<ShapeSudokuData[]>;
}
export const generateFutoshikiLengthFromAI = async(options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
     const res = await generateFutoshikiFromAI(options);
     // @ts-ignore
     return res.map(r => ({...r, title: 'Uzunluk Karşılaştırma (Futoşiki)', instruction: 'Uzunluk birimlerini büyüklüklerine göre sırala.'}));
}

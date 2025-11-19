

import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    FutoshikiData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData,
    RomanNumeralMultiplicationData, Sudoku6x6ShadedData, KendokuData, DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData,
    OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, OperationSquareMultDivData, ShapeSudokuData, FutoshikiLengthData, ShapeType
} from '../../types';

const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];

export const generateFutoshikiFromAI = async(options: GeneratorOptions): Promise<FutoshikiData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    
    let size = 4;
    if (difficulty === 'Orta') size = 5;
    if (difficulty === 'Zor' || difficulty === 'Uzman') size = 6;

    const prompt = `Create a Futoshiki puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with ${itemCount} puzzles of size ${size}x${size}. Provide the grid with some pre-filled numbers (null for empty cells) and a set of inequality constraints between adjacent cells. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
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
    if (difficulty === 'Başlangıç') rows = 3;
    if (difficulty === 'Zor' || difficulty === 'Uzman') rows = 5;

    const prompt = `Create a number pyramid (addition) puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with ${itemCount} pyramids. Each pyramid has ${rows} rows. A number in a cell is the sum of the two cells directly below it. Some cells should be empty (null). 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
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
    const prompt = `Create a number capsule (Kakuro-style) puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with 1 puzzle on a 4x4 grid. Some cells are empty (null). Define several 'capsules' (groups of cells) and their target sums. The user must fill the grid with numbers from a given set (e.g., 1-9) without repetition in a capsule. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
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
    const prompt = `Create a 6x6 Odd-Even Sudoku appropriate for difficulty level "${difficulty}". Generate a worksheet with ${itemCount} puzzles. The grid has some pre-filled numbers. Some empty cells are marked (shaded) and must contain an even number, while unmarked empty cells must contain an odd number. Provide the grid and the coordinates of the shaded (even) cells. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
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
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Roman Numeral Connect puzzle, similar to ABC Connect, appropriate for difficulty level "${difficulty}". Generate a worksheet with 1 puzzle on a 6x6 grid. Provide a list of points. Each point has a Roman numeral label ('I', 'II', 'III', etc.) and x, y coordinates. There should be two points for each numeral. The user connects the matching numerals. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
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
                                properties: {
                                    label: { type: Type.STRING },
                                    x: { type: Type.NUMBER },
                                    y: { type: Type.NUMBER }
                                },
                                required: ["label", "x", "y"]
                            }
                        }
                    },
                    required: ["title", "gridDim", "points"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralConnectData[]>;
}

export const generateRomanNumeralStarHuntFromAI = async(options: GeneratorOptions): Promise<RomanNumeralStarHuntData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Roman Numeral Star Hunt puzzle appropriate for difficulty level "${difficulty}". Generate a 6x6 grid. Some cells contain Roman numerals, which act as clues. The rule is that each cell with a Roman numeral must be adjacent (horizontally, vertically, or diagonally) to exactly that many stars. Generate the grid with the clues and specify the total number of stars to be found. Use 'null' for empty cells. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            starCount: { type: Type.INTEGER }
        },
        required: ["title", "prompt", "grid", "starCount"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralStarHuntData[]>;
}

export const generateRoundingConnectFromAI = async(options: GeneratorOptions): Promise<RoundingConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Rounding Connect puzzle appropriate for difficulty level "${difficulty}". Generate a set of 12 numbers to be placed randomly in a box. The numbers belong to 4 groups, where each group rounds to the same value (e.g., numbers that round to 50). Provide each number's value, its group ID, and its x, y coordinates (percentages). The user connects numbers in the same group. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            example: { type: Type.STRING },
            numbers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.INTEGER },
                        group: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["value", "group", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "example", "numbers"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RoundingConnectData[]>;
}

export const generateRomanNumeralMultiplicationFromAI = async(options: GeneratorOptions): Promise<RomanNumeralMultiplicationData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Roman Numeral Multiplication Square puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with 2 puzzles. Each is a 2x2 grid where the user multiplies the numbers/numerals in the first row and column to fill the inner cells. Some cells should be pre-filled (with Roman numerals or Arabic numbers), others should be empty (null). 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        row1: { type: Type.STRING },
                        row2: { type: Type.STRING },
                        col1: { type: Type.STRING },
                        col2: { type: Type.STRING },
                        results: {
                            type: Type.OBJECT,
                            properties: {
                                r1c1: { type: Type.STRING },
                                r1c2: { type: Type.STRING },
                                r2c1: { type: Type.STRING },
                                r2c2: { type: Type.STRING }
                            },
                            required: ["r1c1", "r1c2", "r2c1", "r2c2"]
                        }
                    },
                    required: ["row1", "row2", "col1", "col2", "results"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralMultiplicationData[]>;
}

export const generateSudoku6x6ShadedFromAI = async(options: GeneratorOptions): Promise<Sudoku6x6ShadedData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a 6x6 Sudoku with a twist, appropriate for difficulty level "${difficulty}". This is the same as OddEvenSudokuData, but specifically for a 6x6 grid. Generate a worksheet with ${itemCount} puzzles. Some empty cells are shaded and must contain even numbers. Provide the partially filled grid and the coordinates of the shaded cells. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        shadedCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } }
                    },
                    required: ["grid", "shadedCells"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<Sudoku6x6ShadedData[]>;
}

export const generateKendokuFromAI = async(options: GeneratorOptions): Promise<KendokuData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const size = difficulty === 'Başlangıç' ? 3 : (difficulty === 'Orta' ? 4 : 5);
    const prompt = `Create a ${size}x${size} Kendoku (Calcudoku) puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with ${itemCount} puzzles. Provide the size, an empty grid, and a list of 'cages'. Each cage specifies the cells it contains, the arithmetic operation (+, −, ×, ÷), and the target number. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
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
                                    cells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } },
                                    operation: { type: Type.STRING, enum: ['+', '−', '×', '÷'] },
                                    target: { type: Type.INTEGER }
                                },
                                required: ["cells", "operation", "target"]
                            }
                        }
                    },
                    required: ["size", "grid", "cages"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<KendokuData[]>;
}

export const generateDivisionPyramidFromAI = async(options: GeneratorOptions): Promise<DivisionPyramidData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a division number pyramid puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with ${itemCount} pyramids. Each has 4-5 rows. A number in a cell is the result of dividing the number above it by the one to its left or right. Some cells should be empty (null). 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pyramids: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
                    },
                    required: ["rows"]
                }
            }
        },
        required: ["title", "prompt", "pyramids"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<DivisionPyramidData[]>;
}

export const generateMultiplicationPyramidFromAI = async(options: GeneratorOptions): Promise<MultiplicationPyramidData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a multiplication number pyramid puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with ${itemCount} pyramids. Each has 4 rows. A number in a cell (above the base) is the product of the two cells directly below it. Some cells should be empty (null). 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pyramids: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
                    },
                    required: ["rows"]
                }
            }
        },
        required: ["title", "prompt", "pyramids"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationPyramidData[]>;
}

export const generateOperationSquareSubtractionFromAI = async(options: GeneratorOptions): Promise<OperationSquareSubtractionData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a 3x3 operation square puzzle using subtraction, appropriate for difficulty level "${difficulty}". Fill a grid with numbers and operation signs ('-', '=') such that the rows and columns form correct equations. Some numbers should be missing (represented by null). Generate a worksheet with ${itemCount} such puzzles. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                    },
                    required: ["grid"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareSubtractionData[]>;
}

export const generateOperationSquareFillInFromAI = async(options: GeneratorOptions): Promise<OperationSquareFillInData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a 3x3 operation square fill-in puzzle appropriate for difficulty level "${difficulty}". Provide an empty grid with operations, a list of numbers to use, and the results for rows/columns. The user must place the numbers correctly. Generate a worksheet with ${itemCount} puzzles. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                        numbersToUse: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        results: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                    },
                    required: ["grid", "numbersToUse", "results"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareFillInData[]>;
}

export const generateMultiplicationWheelFromAI = async(options: GeneratorOptions): Promise<MultiplicationWheelData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a multiplication wheel puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with ${itemCount} puzzles. Each wheel has a center number (the multiplier). There are 8 outer numbers to be multiplied by the center number to get the inner results. Some outer numbers or inner results should be missing (null). 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        outerNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        innerResult: { type: Type.INTEGER }
                    },
                    required: ["outerNumbers", "innerResult"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationWheelData[]>;
}

export const generateTargetNumberFromAI = async (options: GeneratorOptions): Promise<TargetNumberData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a 'Target Number' puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with ${itemCount} puzzles. For each puzzle, provide a target number and 4-5 given numbers. The user should use the given numbers and basic arithmetic operations (+, -, *, /) to reach the target. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        target: { type: Type.INTEGER },
                        givenNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                    },
                    required: ["target", "givenNumbers"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<TargetNumberData[]>;
};

export const generateOperationSquareMultDivFromAI = async(options: GeneratorOptions): Promise<OperationSquareMultDivData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a 3x3 operation square puzzle using multiplication and division, appropriate for difficulty level "${difficulty}". Fill a grid with numbers and signs ('×', '÷', '=') to form correct equations. Some numbers should be missing (null). Generate a worksheet with ${itemCount} puzzles. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                    },
                    required: ["grid"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareMultDivData[]>;
}

export const generateShapeSudokuFromAI = async(options: GeneratorOptions): Promise<ShapeSudokuData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a 6x6 Shape Sudoku puzzle appropriate for difficulty level "${difficulty}". Provide a grid with some pre-filled shapes (null for empty). Also, provide the list of 6 shapes to be used. The user must fill the grid following Sudoku rules. Generate ${itemCount} puzzles.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING, enum: SHAPE_TYPES } } },
                        shapesToUse: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    shape: { type: Type.STRING, enum: SHAPE_TYPES },
                                    label: { type: Type.STRING }
                                },
                                required: ["shape", "label"]
                            }
                        }
                    },
                    required: ["grid", "shapesToUse"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ShapeSudokuData[]>;
}

export const generateFutoshikiLengthFromAI = async(options: GeneratorOptions): Promise<FutoshikiLengthData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Futoshiki puzzle with length units (e.g., '1m', '50cm'), appropriate for difficulty level "${difficulty}". Generate a worksheet with 1 puzzle of size 4x4. Provide the grid with some pre-filled units and inequality constraints. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        size: { type: Type.INTEGER },
                        units: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
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
                    required: ["size", "units", "constraints"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FutoshikiLengthData[]>;
}
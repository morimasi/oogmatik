import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import {
    FutoshikiData, NumberPyramidData, NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData,
    RomanNumeralMultiplicationData, Sudoku6x6ShadedData, KendokuData, DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData,
    OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, OperationSquareMultDivData, ShapeSudokuData, FutoshikiLengthData, ShapeType
} from '../../types';

const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];

export const generateFutoshikiFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<FutoshikiData[]> => {
    const prompt = `Create a Futoshiki puzzle appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 2 puzzles of size 4x4. Provide the grid with some pre-filled numbers (null for empty cells) and a set of inequality constraints between adjacent cells. 
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

export const generateNumberPyramidFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<NumberPyramidData[]> => {
    const prompt = `Create a number pyramid (addition) puzzle appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 2 pyramids. Each pyramid has 4-5 rows. A number in a cell is the sum of the two cells directly below it. Some cells should be empty (null). 
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

export const generateNumberCapsuleFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<NumberCapsuleData[]> => {
    const prompt = `Create a number capsule (Kakuro-style) puzzle appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 1 puzzle on a 4x4 grid. Some cells are empty (null). Define several 'capsules' (groups of cells) and their target sums. The user must fill the grid with numbers from a given set (e.g., 1-9) without repetition in a capsule. 
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

export const generateOddEvenSudokuFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<OddEvenSudokuData[]> => {
    const prompt = `Create a 6x6 Odd-Even Sudoku appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 1 puzzle. The grid has some pre-filled numbers. Some empty cells are marked (shaded) and must contain an even number, while unmarked empty cells must contain an odd number. Provide the grid and the coordinates of the shaded (even) cells. 
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

export const generateRomanNumeralConnectFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<RomanNumeralConnectData[]> => {
    const prompt = `Create a Roman Numeral Connect puzzle, similar to ABC Connect, appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 1 puzzle on a 6x6 grid. Provide a list of points. Each point has a Roman numeral label ('I', 'II', 'III', etc.) and x, y coordinates. There should be two points for each numeral. The user connects the matching numerals. 
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

export const generateRomanNumeralStarHuntFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<RomanNumeralStarHuntData[]> => {
    const prompt = `Create a Roman Numeral Star Hunt puzzle appropriate for difficulty level "${difficultyLevel}". Generate a 6x6 grid. Some cells contain Roman numerals, which act as clues. The rule is that each cell with a Roman numeral must be adjacent (horizontally, vertically, or diagonally) to exactly that many stars. Generate the grid with the clues and specify the total number of stars to be found. Use 'null' for empty cells. 
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

export const generateRoundingConnectFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<RoundingConnectData[]> => {
    const prompt = `Create a Rounding Connect puzzle appropriate for difficulty level "${difficultyLevel}". Generate a set of 12 numbers to be placed randomly in a box. The numbers belong to 4 groups, where each group rounds to the same value (e.g., numbers that round to 50). Provide each number's value, its group ID, and its x, y coordinates (percentages). The user connects numbers in the same group. 
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

export const generateRomanNumeralMultiplicationFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<RomanNumeralMultiplicationData[]> => {
    const prompt = `Create a Roman Numeral Multiplication Square puzzle appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 2 puzzles. Each is a 2x2 grid where the user multiplies the numbers/numerals in the first row and column to fill the inner cells. Some cells should be pre-filled (with Roman numerals or Arabic numbers), others should be empty (null). 
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

export const generateSudoku6x6ShadedFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<Sudoku6x6ShadedData[]> => {
    const prompt = `Create a 6x6 Sudoku with a twist, appropriate for difficulty level "${difficultyLevel}". This is the same as OddEvenSudokuData, but specifically for a 6x6 grid. Generate a worksheet with 1 puzzle. Some empty cells are shaded and must contain even numbers. Provide the partially filled grid and the coordinates of the shaded cells. 
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

export const generateKendokuFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<KendokuData[]> => {
    const prompt = `Create a 4x4 Kendoku (Calcudoku) puzzle appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 1 puzzle. Provide the size, an empty grid, and a list of 'cages'. Each cage specifies the cells it contains, the arithmetic operation (+, −, ×, ÷), and the target number. 
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

export const generateDivisionPyramidFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<DivisionPyramidData[]> => {
    const prompt = `Create a division number pyramid puzzle appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 2 pyramids. Each has 4-5 rows. A number in a cell is the result of dividing the number above it by the one to its left or right. Some cells should be empty (null). 
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

export const generateMultiplicationPyramidFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<MultiplicationPyramidData[]> => {
    const prompt = `Create a multiplication number pyramid puzzle appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 2 pyramids. Each has 4 rows. A number in a cell (above the base) is the product of the two cells directly below it. Some cells should be empty (null). 
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

export const generateOperationSquareSubtractionFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<OperationSquareSubtractionData[]> => {
    const prompt = `Create a 3x3 operation square puzzle using subtraction, appropriate for difficulty level "${difficultyLevel}". Fill a grid with numbers and operation signs ('-', '=') such that the rows and columns form correct equations. Some numbers should be missing (represented by null). Generate a worksheet with 2 such puzzles. 
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

export const generateOperationSquareFillInDataFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<OperationSquareFillInData[]> => {
    const prompt = `Create a 3x3 operation square fill-in puzzle appropriate for difficulty level "${difficultyLevel}". Provide an empty grid with operations, a list of numbers to use, and the results for rows/columns. The user must place the numbers correctly. Generate a worksheet with 2 puzzles. 
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

export const generateMultiplicationWheelFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<MultiplicationWheelData[]> => {
    const prompt = `Create a multiplication wheel puzzle appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 2 puzzles. Each wheel has a center number (the multiplier). There are 8 outer numbers to be multiplied by the center number to get the inner results. Some outer numbers or inner results should be missing (null). 
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

export const generateTargetNumberFromAI = async (mode: 'numbers' | 'currency', difficultyLevel: string, worksheetCount: number): Promise<TargetNumberData[]> => {
    const prompt = `Create a 'Target Number' puzzle appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 3 puzzles. For each puzzle, provide a target number and 4-5 given numbers. If mode is 'currency', use currency values. The user should use the given numbers and basic arithmetic operations (+, -, *, /) to reach the target. 
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

export const generateOperationSquareMultDivFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<OperationSquareMultDivData[]> => {
    const prompt = `Create a 3x3 operation square puzzle using multiplication and division, appropriate for difficulty level "${difficultyLevel}". Fill a grid with numbers and signs ('×', '÷', '=') to form correct equations. Some numbers should be missing (null). Generate a worksheet with 2 puzzles. 
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

export const generateShapeSudokuFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<ShapeSudokuData[]> => {
    const prompt = `Create a 6x6 Shape Sudoku puzzle appropriate for difficulty level "${difficultyLevel}". Provide a grid with some pre-filled shapes (null for empty). Also, provide the list of 6 shapes to be used. The user must fill the grid following Sudoku rules. 
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

export const generateFutoshikiLengthFromAI = async(difficultyLevel: string, worksheetCount: number): Promise<FutoshikiLengthData[]> => {
    const prompt = `Create a Futoshiki puzzle with length units (e.g., '1m', '50cm'), appropriate for difficulty level "${difficultyLevel}". Generate a worksheet with 1 puzzle of size 4x4. Provide the grid with some pre-filled units and inequality constraints. 
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
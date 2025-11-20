import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    NumberPatternData, ShapeNumberPatternData,
    ThematicOddOneOutData, PunctuationMazeData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationPhoneNumberData,
    ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, ResfebeData, LengthConnectData, VisualNumberPatternData,
    LogicGridPuzzleData, ShapeType,
} from '../../types';

const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];

export const generateNumberPatternFromAI = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, difficulty, worksheetCount, patternType } = options;
    
    let patternRules = "Basit aritmetik artışlar veya azalışlar (örn: +2, -5).";
    if (patternType === 'geometric' || difficulty === 'Orta') patternRules = "Artış ve azalış karışık, veya basit çarpma/bölme (örn: x2, /3).";
    if (patternType === 'complex' || difficulty === 'Zor') patternRules = "İki aşamalı kurallar (örn: x2 +1) veya Fibonacci benzeri diziler.";
    if (difficulty === 'Uzman') patternRules = "Karmaşık matematiksel diziler, üslü sayılar, kesirler veya asal sayılar içeren örüntüler.";

    const prompt = `
    "${difficulty}" zorluk seviyesindeki bir öğrenciye uygun, ${itemCount} tane sayı örüntüsü bulmacası oluştur.
    Örüntü Tipi: ${patternRules}
    Her örüntü bir dizi sayı içermeli ve sonunda bir soru işareti olmalıdır. (örn: "2, 4, 6, 8, ?").
    Her örüntü için doğru cevabı da belirt.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the number pattern puzzles.' },
            patterns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sequence: { type: Type.STRING, description: 'The number sequence with a question mark.' },
                        answer: { type: Type.STRING, description: 'The correct next number in the sequence.' },
                    },
                     required: ['sequence', 'answer']
                },
            },
        },
        required: ['title', 'patterns']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberPatternData[]>;
};

export const generateShapeNumberPatternFromAI = async (options: GeneratorOptions): Promise<ShapeNumberPatternData[]> => {
    const { itemCount: count, difficulty, worksheetCount } = options;
    const prompt = `Generate ${worksheetCount} unique worksheets for a shape-based number pattern puzzle for kids, appropriate for difficulty level "${difficulty}". Each worksheet should contain ${count} puzzles. Each puzzle should consist of a few shapes (only triangles for now) containing numbers. There must be a logical rule connecting the numbers in each shape. One number should be a question mark.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Return the data in a JSON array.`;

    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            patterns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        shapes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['triangle'] },
                                    numbers: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["type", "numbers"]
                            }
                        }
                    },
                    required: ["shapes"]
                }
            }
        },
        required: ["title", "patterns"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ShapeNumberPatternData[]>;
};

export const generateThematicOddOneOutFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { topic, difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a "Thematic Odd One Out" puzzle with the theme '${topic}', appropriate for difficulty level "${difficulty}". Generate ${itemCount} rows. In each row, provide 4 words as objects with text and an **English, photorealistic, highly detailed** 'imagePrompt'. One word does not fit the theme. Also provide a sentence prompt using the odd words. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    imagePrompt: { type: Type.STRING }
                                },
                                required: ["text", "imagePrompt"]
                            } 
                        },
                        oddWord: { type: Type.STRING }
                    },
                    required: ["words", "oddWord"]
                }
            },
            sentencePrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "theme", "rows", "sentencePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutData[]>;
};

export const generatePunctuationMazeFromAI = async (options: GeneratorOptions): Promise<PunctuationMazeData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Punctuation Maze" puzzle for difficulty level "${difficulty}". Specify a punctuation mark (e.g., '.'). Provide a list of 8 rules about its usage, some correct and some incorrect. The user follows the path of correct rules in a conceptual maze. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            punctuationMark: { type: Type.STRING },
            rules: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        text: { type: Type.STRING },
                        isCorrect: { type: Type.BOOLEAN }
                    },
                    required: ["id", "text", "isCorrect"]
                }
            }
        },
        required: ["title", "prompt", "punctuationMark", "rules"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationMazeData[]>;
};

export const generateThematicOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `Create a "Thematic Odd One Out Sentence" puzzle with theme '${topic}' for difficulty level "${difficulty}". Provide 5 rows of words, where one is the odd one out. The user must then write a sentence with the odd words. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                        oddWord: { type: Type.STRING }
                    },
                    required: ["words", "oddWord"]
                }
            },
            sentencePrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "rows", "sentencePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutSentenceData[]>;
};

export const generateColumnOddOneOutSentenceFromAI = async (options: GeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Column Odd One Out Sentence" puzzle for difficulty level "${difficulty}". Provide 4 columns of words, where one in each column is the odd one out. The user must write a sentence with the odd words. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            columns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                        oddWord: { type: Type.STRING }
                    },
                    required: ["words", "oddWord"]
                }
            },
            sentencePrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "columns", "sentencePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ColumnOddOneOutSentenceData[]>;
};

export const generatePunctuationPhoneNumberFromAI = async (options: GeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Punctuation Phone Number" puzzle for difficulty level "${difficulty}". Provide 7 clues related to punctuation that resolve to numbers, forming a phone number. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            clues: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        text: { type: Type.STRING }
                    },
                    required: ["id", "text"]
                }
            },
            solution: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        punctuationMark: { type: Type.STRING },
                        number: { type: Type.INTEGER }
                    },
                    required: ["punctuationMark", "number"]
                }
            }
        },
        required: ["title", "prompt", "instruction", "clues", "solution"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationPhoneNumberData[]>;
};

export const generateArithmeticConnectFromAI = async (options: GeneratorOptions): Promise<ArithmeticConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create an "Arithmetic Connect" puzzle for difficulty level "${difficulty}". Provide a set of 12 arithmetic expressions placed randomly. The expressions belong to groups with the same result. Provide each expression's text, value, group ID, and coordinates. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            example: { type: Type.STRING },
            expressions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        value: { type: Type.INTEGER },
                        group: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["text", "value", "group", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "example", "expressions"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ArithmeticConnectData[]>;
};

export const generateRomanArabicMatchConnectFromAI = async (options: GeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `Create a "Roman-Arabic Match Connect" puzzle for difficulty level "${difficulty}". Provide a list of points on a ${gridSize}x${gridSize} grid. Each point has a label (Roman or Arabic number), a pairId, and coordinates. The user connects points with the same pairId. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["label", "pairId", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<RomanArabicMatchConnectData[]>;
};

export const generateWeightConnectFromAI = async (options: GeneratorOptions): Promise<WeightConnectData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `Create a "Weight Connect" puzzle for difficulty level "${difficulty}". Provide points on a ${gridSize}x${gridSize} grid. For each point, provide a text label (e.g., '1kg', '1000g'), an **English, photorealistic** imagePrompt for a visual representation (e.g., 'a 1kg bag of flour'), a pairId for matching, and coordinates. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["label", "pairId", "x", "y", "imagePrompt"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WeightConnectData[]>;
};

export const generateResfebeFromAI = async (options: GeneratorOptions): Promise<ResfebeData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Resfebe" puzzle for difficulty level "${difficulty}". Generate 4 puzzles. For each, provide clues (text or image prompts) and the answer. For image prompts, create a **photorealistic, high quality** prompt for an image generator. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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
                        clues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['text', 'image'] },
                                    value: { type: Type.STRING },
                                    imagePrompt: { type: Type.STRING }
                                },
                                required: ["type", "value"]
                            }
                        },
                        answer: { type: Type.STRING }
                    },
                    required: ["clues", "answer"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ResfebeData[]>;
};

export const generateLengthConnectFromAI = async (options: GeneratorOptions): Promise<LengthConnectData[]> => {
    const { difficulty, worksheetCount, gridSize } = options;
    const prompt = `Create a "Length Connect" puzzle for difficulty level "${difficulty}". Provide points on a ${gridSize}x${gridSize} grid. For each point, provide a text label (e.g., '1m', '100cm'), an **English, photorealistic** imagePrompt for a visual representation (e.g., 'a 1 meter tall door', 'a 100cm ruler'), a pairId for matching, and coordinates. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["label", "pairId", "x", "y", "imagePrompt"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LengthConnectData[]>;
};

export const generateVisualNumberPatternFromAI = async (options: GeneratorOptions): Promise<VisualNumberPatternData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Visual Number Pattern" puzzle for difficulty level "${difficulty}". Generate 3 puzzles. Each puzzle is a sequence of items with a number, color, and size, following a specific rule. Provide the rule and the answer. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    number: { type: Type.INTEGER },
                                    color: { type: Type.STRING },
                                    size: { type: Type.NUMBER }
                                },
                                required: ["number", "color", "size"]
                            }
                        },
                        rule: { type: Type.STRING },
                        answer: { type: Type.INTEGER }
                    },
                    required: ["items", "rule", "answer"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualNumberPatternData[]>;
};

export const generateLogicGridPuzzleFromAI = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a "Logic Grid Puzzle" for difficulty level "${difficulty}". Provide ${itemCount} clues, a list of people, and categories with items (including **photorealistic** image prompts). The user solves the puzzle using the grid. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
            people: { type: Type.ARRAY, items: { type: Type.STRING } },
            categories: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    imageDescription: { type: Type.STRING },
                                    imagePrompt: { type: Type.STRING }
                                },
                                required: ["name", "imageDescription", "imagePrompt"]
                            }
                        }
                    },
                    required: ["title", "items"]
                }
            }
        },
        required: ["title", "prompt", "clues", "people", "categories"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LogicGridPuzzleData[]>;
};
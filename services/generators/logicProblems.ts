import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { OfflineGeneratorOptions } from '../offlineGenerators';
import {
    NumberPatternData, ShapeMatchingData, ShapeType, SymbolCipherData, CoordinateCipherData, ShapeNumberPatternData, AbcConnectData, WordConnectData,
    ThematicOddOneOutData, PunctuationMazeData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationPhoneNumberData,
    ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, ResfebeData, LengthConnectData, VisualNumberPatternData,
    ProfessionConnectData, VisualOddOneOutThemedData, LogicGridPuzzleData,
} from '../../types';

const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];

export const generateNumberPatternsFromAI = async (options: OfflineGeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount: count, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" zorluk seviyesindeki bir öğrenciye uygun, ${count} tane sayı örüntüsü bulmacası oluştur.
    Her örüntü bir dizi sayı içermeli ve sonunda bir soru işareti olmalıdır. (örn: "2, 4, 6, 8, ?").
    Her örüntü için doğru cevabı da belirt.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
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

export const generateShapeMatchingFromAI = async (options: OfflineGeneratorOptions): Promise<ShapeMatchingData[]> => {
  const { itemCount: rowCount, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesindeki bir öğrenciye uygun bir şekil eşleştirme etkinliği oluştur.
    Solda ve sağda ${rowCount} tane satır olsun. Her satırda 3 tane şekil olsun.
    Soldaki satırların birebir aynısı sağda da olsun ama sıraları karışık olsun.
    Şekiller: ${SHAPE_TYPES.join(', ')}.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      leftColumn: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            shapes: { type: Type.ARRAY, items: { type: Type.STRING, enum: SHAPE_TYPES } }
          },
          required: ['id', 'shapes']
        }
      },
      rightColumn: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            shapes: { type: Type.ARRAY, items: { type: Type.STRING, enum: SHAPE_TYPES } }
          },
          required: ['id', 'shapes']
        }
      }
    },
    required: ['title', 'leftColumn', 'rightColumn']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<ShapeMatchingData[]>;
};

export const generateSymbolCipherFromAI = async (options: OfflineGeneratorOptions): Promise<SymbolCipherData[]> => {
  const { itemCount: wordCount, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesindeki bir öğrenciye uygun bir şifre çözme etkinliği oluştur.
    8 tane şekil-harf çiftinden oluşan bir şifre anahtarı oluştur. Şekiller: ${SHAPE_TYPES.join(', ')}.
    Bu anahtarı kullanarak ${wordCount} tane şifreli kelime oluştur. Her kelime 4-6 harf uzunluğunda olsun.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      cipherKey: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            shape: { type: Type.STRING, enum: SHAPE_TYPES },
            letter: { type: Type.STRING }
          },
          required: ['shape', 'letter']
        }
      },
      wordsToSolve: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            shapeSequence: { type: Type.ARRAY, items: { type: Type.STRING, enum: SHAPE_TYPES } },
            wordLength: { type: Type.INTEGER }
          },
          required: ['shapeSequence', 'wordLength']
        }
      }
    },
    required: ['title', 'cipherKey', 'wordsToSolve']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<SymbolCipherData[]>;
};

export const generateCoordinateCipherFromAI = async (options: OfflineGeneratorOptions): Promise<CoordinateCipherData[]> => {
  const { topic, gridSize, itemCount: wordCount, difficulty, worksheetCount } = options;
  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesindeki bir öğrenciye uygun bir koordinat şifreleme bulmacası oluştur.
    ${gridSize}x${gridSize} boyutunda bir harf tablosu oluştur.
    Tabloda gizli ${wordCount} tane kelime olsun.
    Bu kelimeler bulunduktan sonra, koordinatları (örn: "A5", "C2") verilecek olan harfleri birleştirerek çözülecek 5-6 harfli bir şifre kelimesi oluştur.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      wordsToFind: { type: Type.ARRAY, items: { type: Type.STRING } },
      cipherCoordinates: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'grid', 'wordsToFind', 'cipherCoordinates']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<CoordinateCipherData[]>;
};

export const generateShapeNumberPatternFromAI = async (options: OfflineGeneratorOptions): Promise<ShapeNumberPatternData[]> => {
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

export const generateAbcConnectFromAI = async (options: OfflineGeneratorOptions): Promise<AbcConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create an "ABC Connect" puzzle, appropriate for difficulty level "${difficulty}". Generate a worksheet containing 2 puzzles on a 6x6 grid. For each puzzle, provide a list of points. Each point has a letter (e.g., 'A', 'B') and x, y coordinates. There should be two points for each letter. The user connects the matching letters. 
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
                        id: { type: Type.INTEGER },
                        gridDim: { type: Type.INTEGER },
                        points: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    letter: { type: Type.STRING },
                                    x: { type: Type.NUMBER },
                                    y: { type: Type.NUMBER }
                                },
                                required: ["letter", "x", "y"]
                            }
                        }
                    },
                    required: ["id", "gridDim", "points"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AbcConnectData[]>;
};

export const generateWordConnectFromAI = async (options: OfflineGeneratorOptions): Promise<WordConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Word Connect" puzzle, appropriate for difficulty level "${difficulty}". Generate a worksheet with a 10x10 grid. Provide a list of points with semantically related words. Each point has a word, a pairId, and x, y coordinates. The user connects the words with the same pairId. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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
                        word: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["word", "pairId", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordConnectData[]>;
};

export const generateThematicOddOneOutFromAI = async (options: OfflineGeneratorOptions): Promise<ThematicOddOneOutData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `Create a "Thematic Odd One Out" puzzle with the theme '${topic}', appropriate for difficulty level "${difficulty}". Generate 5 rows of words. In each row, one word does not fit the theme. Also provide a sentence prompt using the odd words. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
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

export const generatePunctuationMazeFromAI = async (options: OfflineGeneratorOptions): Promise<PunctuationMazeData[]> => {
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

export const generateThematicOddOneOutSentenceFromAI = async (options: OfflineGeneratorOptions): Promise<ThematicOddOneOutSentenceData[]> => {
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

export const generateColumnOddOneOutSentenceFromAI = async (options: OfflineGeneratorOptions): Promise<ColumnOddOneOutSentenceData[]> => {
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

export const generatePunctuationPhoneNumberFromAI = async (options: OfflineGeneratorOptions): Promise<PunctuationPhoneNumberData[]> => {
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

export const generateArithmeticConnectFromAI = async (options: OfflineGeneratorOptions): Promise<ArithmeticConnectData[]> => {
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

export const generateRomanArabicMatchConnectFromAI = async (options: OfflineGeneratorOptions): Promise<RomanArabicMatchConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Roman-Arabic Match Connect" puzzle for difficulty level "${difficulty}". Provide a list of points on a 10x10 grid. Each point has a label (Roman or Arabic number), a pairId, and coordinates. The user connects points with the same pairId. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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

export const generateWeightConnectFromAI = async (options: OfflineGeneratorOptions): Promise<WeightConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Weight Connect" puzzle for difficulty level "${difficulty}". Provide points on a 10x10 grid with labels like '1kg' and '1000g'. The user connects equivalent weights. Provide pairIds for matching. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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
    return generateWithSchema(prompt, schema) as Promise<WeightConnectData[]>;
};

export const generateResfebeFromAI = async (options: OfflineGeneratorOptions): Promise<ResfebeData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Resfebe" puzzle for difficulty level "${difficulty}". Generate 4 puzzles. For each, provide clues (text or image prompts) and the answer. For image prompts, create a detailed prompt for an image generator. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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

export const generateLengthConnectFromAI = async (options: OfflineGeneratorOptions): Promise<LengthConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Length Connect" puzzle for difficulty level "${difficulty}". Provide points on a 10x10 grid with labels like '1m' and '100cm'. The user connects equivalent lengths. Provide pairIds for matching. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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
    return generateWithSchema(prompt, schema) as Promise<LengthConnectData[]>;
};

export const generateVisualNumberPatternFromAI = async (options: OfflineGeneratorOptions): Promise<VisualNumberPatternData[]> => {
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

export const generateProfessionConnectFromAI = async (options: OfflineGeneratorOptions): Promise<ProfessionConnectData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Profession Connect" puzzle for difficulty level "${difficulty}". Provide points on a 10x10 grid. Each point has a profession label, an image description, an image prompt, and coordinates. The user connects related items. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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
                        imageDescription: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["label", "imageDescription", "imagePrompt", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ProfessionConnectData[]>;
};

export const generateVisualOddOneOutThemedFromAI = async (options: OfflineGeneratorOptions): Promise<VisualOddOneOutThemedData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `Create a "Themed Visual Odd One Out" puzzle with theme '${topic}' for difficulty level "${difficulty}". Generate 3 rows, each with its own theme. Each row has 4 items (with descriptions and image prompts), where one doesn't fit the theme. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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
                        theme: { type: Type.STRING },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING },
                                    imagePrompt: { type: Type.STRING }
                                },
                                required: ["description", "imagePrompt"]
                            }
                        },
                        oddOneOutIndex: { type: Type.INTEGER }
                    },
                    required: ["theme", "items", "oddOneOutIndex"]
                }
            }
        },
        required: ["title", "prompt", "rows"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutThemedData[]>;
};

export const generateLogicGridPuzzleFromAI = async (options: OfflineGeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Logic Grid Puzzle" for difficulty level "${difficulty}". Provide a list of clues, a list of people, and categories with items (including image prompts). The user solves the puzzle using the grid. Create ${worksheetCount} unique worksheets and return as a JSON array.`;
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
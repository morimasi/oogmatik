

import { Type } from "@google/genai";
// FIX: Corrected import path from non-existent 'apiClient' to 'geminiClient'.
import { generateWorksheetData } from '../geminiClient';
import {
    NumberPatternData, ShapeMatchingData, ShapeType, SymbolCipherData, CoordinateCipherData, ShapeNumberPatternData, AbcConnectData, WordConnectData,
    ThematicOddOneOutData, PunctuationMazeData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationPhoneNumberData,
    ArithmeticConnectData, RomanArabicMatchConnectData, WeightConnectData, ResfebeData, LengthConnectData, VisualNumberPatternData,
    ProfessionConnectData, VisualOddOneOutThemedData, LogicGridPuzzleData
} from '../../types';

const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];

export const generateNumberPatternsFromAI = async (count: number, difficulty: string): Promise<NumberPatternData> => {
    const prompt = `
    Çocuklar için ${difficulty} zorluk seviyesinde ${count} tane sayı örüntüsü bulmacası oluştur.
    Her örüntü bir dizi sayı içermeli ve sonunda bir soru işareti olmalıdır. (örn: "2, 4, 6, 8, ?").
    Her örüntü için doğru cevabı da belirt.
    Örnek Zorluklar:
    - Kolay: Basit toplama/çıkarma (örn: +2, -1)
    - Orta: İki adımlı işlemler veya basit çarpma (örn: *2, +1)
    - Zor: Daha karmaşık kurallar.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<NumberPatternData>;
};

export const generateShapeMatchingFromAI = async (rowCount: number): Promise<ShapeMatchingData> => {
  const prompt = `
    Bir şekil eşleştirme etkinliği oluştur.
    Solda ve sağda ${rowCount} tane satır olsun. Her satırda 3 tane şekil olsun.
    Soldaki satırların birebir aynısı sağda da olsun ama sıraları karışık olsun.
    Şekiller: ${SHAPE_TYPES.join(', ')}.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
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
  return generateWorksheetData(prompt, schema) as Promise<ShapeMatchingData>;
};

export const generateSymbolCipherFromAI = async (wordCount: number): Promise<SymbolCipherData> => {
  const prompt = `
    Bir şifre çözme etkinliği oluştur.
    8 tane şekil-harf çiftinden oluşan bir şifre anahtarı oluştur. Şekiller: ${SHAPE_TYPES.join(', ')}.
    Bu anahtarı kullanarak ${wordCount} tane şifreli kelime oluştur. Her kelime 4-6 harf uzunluğunda olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
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
  return generateWorksheetData(prompt, schema) as Promise<SymbolCipherData>;
};

export const generateCoordinateCipherFromAI = async (topic: string, gridSize: number, wordCount: number): Promise<CoordinateCipherData> => {
  const prompt = `
    '${topic}' konusuyla ilgili bir koordinat şifreleme bulmacası oluştur.
    ${gridSize}x${gridSize} boyutunda bir harf tablosu oluştur.
    Tabloda gizli ${wordCount} tane kelime olsun.
    Bu kelimeler bulunduktan sonra, koordinatları (örn: "A5", "C2") verilecek olan harfleri birleştirerek çözülecek 5-6 harfli bir şifre kelimesi oluştur.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      wordsToFind: { type: Type.ARRAY, items: { type: Type.STRING } },
      cipherCoordinates: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'grid', 'wordsToFind', 'cipherCoordinates']
  };
  return generateWorksheetData(prompt, schema) as Promise<CoordinateCipherData>;
};

export const generateShapeNumberPatternFromAI = async (count: number): Promise<ShapeNumberPatternData> => {
    const prompt = `Generate ${count} shape-based number pattern puzzles for kids. Each puzzle should consist of a few shapes (only triangles for now) containing numbers. There must be a logical rule connecting the numbers in each shape. One number should be a question mark. Provide the rule and the answer.
    Format the output as JSON.`;

    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<ShapeNumberPatternData>;
};

export const generateAbcConnectFromAI = async (): Promise<AbcConnectData> => {
    const prompt = `Create an "ABC Connect" puzzle. Generate 2 puzzles on a 6x6 grid. For each puzzle, provide a list of points. Each point has a letter (e.g., 'A', 'B') and x, y coordinates. There should be two points for each letter. The user connects the matching letters. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<AbcConnectData>;
};

export const generateWordConnectFromAI = async (): Promise<WordConnectData> => {
    const prompt = `Create a "Word Connect" activity. On a 10x10 grid, place 5 pairs of related Turkish words (e.g., 'doktor' and 'hastane'). Provide the word, a pairId, and x, y coordinates for each point. The user connects the related words. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<WordConnectData>;
};

export const generateThematicOddOneOutFromAI = async (topic: string): Promise<ThematicOddOneOutData> => {
    const prompt = `Create a thematic odd one out activity with the theme '${topic}'. Generate 4 rows of words. Each row has 4 words; 3 are related to the theme, one is not. Identify the odd word. Provide a prompt for the user to write a sentence with the odd words. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<ThematicOddOneOutData>;
};

export const generatePunctuationMazeFromAI = async(): Promise<PunctuationMazeData> => {
    const prompt = `Create a punctuation maze for the comma (virgül). Provide a title, prompt, and a list of 8 rules about comma usage in Turkish. Some rules should be correct, others incorrect. Mark which ones are correct. The user follows the path of correct rules. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<PunctuationMazeData>;
}

export const generateThematicOddOneOutSentenceFromAI = async(topic: string): Promise<ThematicOddOneOutSentenceData> => {
    const prompt = `Create a thematic odd one out activity similar to ThematicOddOneOutData. The theme is '${topic}'. Generate 4 rows of 4 words each. Three are related, one is not. The user finds the odd words and then writes a sentence with them. The password letters from the odd words form a secret word. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<ThematicOddOneOutSentenceData>;
}

export const generateColumnOddOneOutSentenceFromAI = async(): Promise<ColumnOddOneOutSentenceData> => {
    const prompt = `Create a "Column Odd One Out" activity. Provide 4 columns of words. Each column has 4 words. In each column, 3 words are related, and one is not. Identify the odd word for each column. Provide a prompt for the user to write a sentence with the odd words. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<ColumnOddOneOutSentenceData>;
}

export const generatePunctuationPhoneNumberFromAI = async(): Promise<PunctuationPhoneNumberData> => {
    const prompt = `Create a "Punctuation Phone Number" puzzle. Provide 7 clues related to Turkish punctuation rules. Each clue corresponds to a number. For example, "The mark at the end of a question sentence". The user must identify the punctuation mark from the clue. Create a solution map that links each punctuation mark to a digit (0-9). The user uses this map to find the secret phone number. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<PunctuationPhoneNumberData>;
}

export const generateArithmeticConnectFromAI = async(): Promise<ArithmeticConnectData> => {
    const prompt = `Create an Arithmetic Connect puzzle. Generate a set of 12 arithmetic expressions (e.g., "50+27") to be placed randomly in a box. The expressions belong to 4 groups with the same result. Provide each expression's text, its result value, its group ID, and its x, y coordinates. The user connects expressions in the same group. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<ArithmeticConnectData>;
}

export const generateRomanArabicMatchConnectFromAI = async(): Promise<RomanArabicMatchConnectData> => {
    const prompt = `Create a Roman-Arabic numeral matching connect puzzle. On a 10x10 grid, place 5 pairs of matching numerals (e.g., 'IX' and '9'). Provide the label, a pairId, and x, y coordinates for each point. The user connects the matching pairs. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<RomanArabicMatchConnectData>;
}

export const generateWeightConnectFromAI = async(): Promise<WeightConnectData> => {
    const prompt = `Create a weight connection puzzle. On a 10x10 grid, place 5 pairs of equivalent weights (e.g., '1 kg' and '1000 g'). Provide the label, pairId, and x, y coordinates for each point. The user connects the matching pairs. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<WeightConnectData>;
}

export const generateResfebeFromAI = async(): Promise<ResfebeData> => {
    const prompt = `Create a Resfebe puzzle. Generate 4 puzzles. Each puzzle consists of clues (text or image placeholders) that cryptically represent a word. Provide the clues and the final answer. For image clues, provide a detailed English image generation prompt for the 'imagePrompt' field. Format as JSON.`;
    const schema = {
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
                                required: ["type", "value", "imagePrompt"]
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
    return generateWorksheetData(prompt, schema) as Promise<ResfebeData>;
}

export const generateLengthConnectFromAI = async(): Promise<LengthConnectData> => {
    const prompt = `Create a length connection puzzle. On a 10x10 grid, place 5 pairs of equivalent length units (e.g., '1 m' and '100 cm'). Provide the label, pairId, and x, y coordinates for each point. The user connects matching pairs. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<LengthConnectData>;
}

export const generateVisualNumberPatternFromAI = async(): Promise<VisualNumberPatternData> => {
    const prompt = `Create a visual number pattern puzzle. Generate 2 puzzles. Each puzzle is a sequence of 4-5 items, where each item has a number, color, and size. There is a logical rule in the sequence. Provide the rule and the answer for the missing item. Format as JSON.`;
    const schema = {
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
                                    number: { type: Type.NUMBER },
                                    color: { type: Type.STRING },
                                    size: { type: Type.NUMBER }
                                },
                                required: ["number", "color", "size"]
                            }
                        },
                        rule: { type: Type.STRING },
                        answer: { type: Type.NUMBER }
                    },
                    required: ["items", "rule", "answer"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWorksheetData(prompt, schema) as Promise<VisualNumberPatternData>;
}

export const generateProfessionConnectFromAI = async(): Promise<ProfessionConnectData> => {
    const prompt = `Create a profession connection puzzle. On a 10x10 grid, place 5 professions and 5 related images/tools. Provide a label (profession or tool), an image description, x, y coordinates for each point. For images, provide a detailed English image generation prompt for the 'imagePrompt' field. The user connects the pairs. Format as JSON.`;
    const schema = {
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
                    required: ["label", "imageDescription", "x", "y", "imagePrompt"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    return generateWorksheetData(prompt, schema) as Promise<ProfessionConnectData>;
}

export const generateVisualOddOneOutThemedFromAI = async(topic: string): Promise<VisualOddOneOutThemedData> => {
    const prompt = `Create a themed visual odd-one-out puzzle on '${topic}'. Generate 1 row. Each row has a theme (e.g., 'Doctor') and 3 items. Two items relate to the theme, one does not. For each item, provide a short description and a detailed English image generation prompt. Identify the index of the odd one out. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<VisualOddOneOutThemedData>;
}

export const generateLogicGridPuzzleFromAI = async(): Promise<LogicGridPuzzleData> => {
    const prompt = `Create a logic grid puzzle. Define 3 people and 2 categories (e.g., 'Profession', 'City'). Provide a list of clues to solve the puzzle. For category items that are visual, provide an image description and a detailed English image generation prompt. Format as JSON.`;
    const schema = {
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
    return generateWorksheetData(prompt, schema) as Promise<LogicGridPuzzleData>;
}
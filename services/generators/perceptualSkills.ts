import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import {
    FindTheDifferenceData, StroopTestData, OddOneOutData, FindIdenticalWordData, GridDrawingData, ChaoticNumberSearchData,
    BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData
} from '../../types';

export const generateFindTheDifferenceFromAI = async (topic: string, rowCount: number): Promise<FindTheDifferenceData> => {
    const prompt = `
    '${topic}' konusuyla ilgili 'Farklı Olanı Bul' etkinliği için ${rowCount} satır oluştur.
    Her satırda 4 kelime olsun. Bu kelimelerden 3'ü birbiriyle çok benzesin (görsel olarak), biri ise onlardan biraz farklı olsun.
    Doğru olanın (farklı olanın) indeksini belirt.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.INTEGER }
                    },
                    required: ['items', 'correctIndex']
                }
            }
        },
        required: ['title', 'rows']
    };
    return generateWithSchema(prompt, schema) as Promise<FindTheDifferenceData>;
};

export const generateStroopTestFromAI = async (count: number): Promise<StroopTestData> => {
    const prompt = `
    Bir Stroop testi için ${count} tane öğe oluştur. Her öğe bir renk adı (text) ve bir CSS renk adı (color) içermelidir. 
    Metin ve renk genellikle birbiriyle eşleşmemelidir. Örneğin, metin "MAVİ" olabilirken renk "red" olabilir.
    Kullanılacak renkler: red, blue, green, yellow, orange, purple, pink, black.
    Kullanılacak metinler: KIRMIZI, MAVİ, YEŞİL, SARI, TURUNCU, MOR, PEMBE, SİYAH.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the Stroop test.' },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING, description: 'The color name in Turkish.' },
                        color: { type: Type.STRING, description: 'A CSS-compatible color name (e.g., "red").' },
                    },
                    required: ['text', 'color']
                },
            },
        },
        required: ['title', 'items']
    };
    return generateWithSchema(prompt, schema) as Promise<StroopTestData>;
};

export const generateOddOneOutFromAI = async (topic: string, groupCount: number): Promise<OddOneOutData> => {
  const prompt = `
    '${topic}' konusuyla ilgili 'Farklı Olanı Bul' etkinliği için ${groupCount} grup oluştur.
    Her grupta 4 kelime olsun. Bu kelimelerden 3'ü anlamsal olarak ilişkili, biri ise alakasız olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      groups: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['words']
        }
      }
    },
    required: ['title', 'groups']
  };
  return generateWithSchema(prompt, schema) as Promise<OddOneOutData>;
};

export const generateFindIdenticalWordFromAI = async (count: number): Promise<FindIdenticalWordData> => {
    const prompt = `
    'Aynısını Bul' etkinliği için ${count} tane grup oluştur.
    Her grupta, birbirine çok benzeyen ama sadece bir harfi farklı olan iki kelime olsun. Bunlardan birini baz alarak birebir aynısını da ekle. Yani grupta [benzer1, benzer2] şeklinde iki kelimeden oluşan çiftler olacak.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            groups: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['words']
                }
            }
        },
        required: ['title', 'groups']
    };
    return generateWithSchema(prompt, schema) as Promise<FindIdenticalWordData>;
};

export const generateGridDrawingFromAI = async (gridDim: number, count: number): Promise<GridDrawingData> => {
    const prompt = `Create a mirror drawing activity. Generate ${count} simple line patterns on a ${gridDim}x${gridDim} grid. Provide the line coordinates for each pattern as an array of lines, where each line is an array of two points [start, end], and each point is an array of two numbers [x, y]. The user will copy the drawing to an empty grid. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            drawings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        lines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.ARRAY,
                                    items: { type: Type.INTEGER },
                                },
                            }
                        }
                    },
                    required: ["lines"]
                }
            }
        },
        required: ["title", "gridDim", "drawings"]
    };
    return generateWithSchema(prompt, schema) as Promise<GridDrawingData>;
};

export const generateChaoticNumberSearchFromAI = async (start: number, end: number): Promise<ChaoticNumberSearchData> => {
    const prompt = `Create a chaotic number search puzzle. The user needs to find numbers from ${start} to ${end}. Generate about 100 numbers in total, including the target range and distractors. For each number, provide its value, position (x, y as percentages), size (in rem), rotation (in degrees), and a random hex color. Make the layout chaotic. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            numbers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        size: { type: Type.NUMBER },
                        rotation: { type: Type.NUMBER },
                        color: { type: Type.STRING }
                    },
                    required: ["value", "x", "y", "size", "rotation", "color"]
                }
            },
            range: {
                type: Type.OBJECT, properties: {
                    start: { type: Type.INTEGER }, end: { type: Type.INTEGER }
                },
                 required: ["start", "end"]
            }
        },
        required: ["title", "prompt", "numbers", "range"]
    };
    return generateWithSchema(prompt, schema) as Promise<ChaoticNumberSearchData>;
};

export const generateBlockPaintingFromAI = async (): Promise<BlockPaintingData> => {
    const prompt = `Create a block painting activity. Define a 10x10 grid. Create 3-4 colored shapes (like Tetris blocks). For each shape, provide a color and a 2D array representing its pattern. The user's goal is to color the grid according to the given shapes. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: { type: Type.OBJECT, properties: { rows: { type: Type.INTEGER }, cols: { type: Type.INTEGER } }, required: ["rows", "cols"]},
            shapes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        color: { type: Type.STRING },
                        pattern: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
                    },
                    required: ["color", "pattern"]
                }
            }
        },
        required: ["title", "prompt", "grid", "shapes"]
    };
    return generateWithSchema(prompt, schema) as Promise<BlockPaintingData>;
};

export const generateVisualOddOneOutFromAI = async (): Promise<VisualOddOneOutData> => {
    const prompt = `Create a visual odd one out puzzle. Generate 4 rows. Each row has 4 items. Each item is a simple shape made of 9 segments (like a digital clock digit). In each row, one item's segment pattern is slightly different. Describe each item by a boolean array of its 9 segments. Format as JSON.`;
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
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    segments: { type: Type.ARRAY, items: { type: Type.BOOLEAN } }
                                },
                                required: ["segments"]
                            }
                        }
                    },
                    required: ["items"]
                }
            }
        },
        required: ["title", "prompt", "rows"]
    };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData>;
};

export const generateSymmetryDrawingFromAI = async (): Promise<SymmetryDrawingData> => {
    const prompt = `Create a symmetry drawing activity. Define an 8x8 grid. Provide a set of dots (x, y coordinates) on one half of the grid (e.g., left half for a vertical axis). The user's goal is to draw the symmetrical reflection. Specify the axis of symmetry ('vertical' or 'horizontal'). Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            dots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.INTEGER },
                        y: { type: Type.INTEGER }
                    },
                    required: ["x", "y"]
                }
            },
            axis: { 
                type: Type.STRING
            }
        },
        required: ["title", "prompt", "gridDim", "dots", "axis"]
    };
    return generateWithSchema(prompt, schema) as Promise<SymmetryDrawingData>;
};

export const generateFindDifferentStringFromAI = async (): Promise<FindDifferentStringData> => {
    const prompt = `Create a "Find the Different String" activity. Generate 10 rows. Each row contains 5 strings. Four of the strings are identical (e.g., "VWN"), and one is slightly different (e.g., "VNW"). The position of the different string should be random in each row. Format as JSON.`;
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
                        items: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["items"]
                }
            }
        },
        required: ["title", "prompt", "rows"]
    };
    return generateWithSchema(prompt, schema) as Promise<FindDifferentStringData>;
};

export const generateDotPaintingFromAI = async (): Promise<DotPaintingData> => {
    const prompt = `Create a dot painting activity. Design a simple hidden picture (e.g., a house) on a 15x15 grid. Provide the SVG path data for the grid lines and the viewBox. Provide a list of dots to be colored, with their cx, cy coordinates and a specific color. The user's goal is to color the dots to reveal the picture. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt1: { type: Type.STRING },
            prompt2: { type: Type.STRING },
            svgViewBox: { type: Type.STRING },
            gridPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
            dots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        cx: { type: Type.NUMBER },
                        cy: { type: Type.NUMBER },
                        color: { type: Type.STRING }
                    },
                    required: ["cx", "cy", "color"]
                }
            }
        },
        required: ["title", "prompt1", "prompt2", "svgViewBox", "gridPaths", "dots"]
    };
    return generateWithSchema(prompt, schema) as Promise<DotPaintingData>;
};

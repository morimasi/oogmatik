import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { OfflineGeneratorOptions } from '../offlineGenerators';
import {
    FindTheDifferenceData, StroopTestData, OddOneOutData, FindIdenticalWordData, GridDrawingData, ChaoticNumberSearchData,
    BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData
} from '../../types';

export const generateFindTheDifferenceFromAI = async (options: OfflineGeneratorOptions): Promise<FindTheDifferenceData[]> => {
    const { topic, itemCount: rowCount, difficulty, worksheetCount } = options;
    
    let similarity = "Fark çok belirgin olsun (örn: 3 elma, 1 armut).";
    if (difficulty === 'Zor' || difficulty === 'Uzman') similarity = "Fark çok küçük olsun (örn: kelimede 1 harf değişik, görselde küçük bir detay farklı).";

    const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun 'Farklı Olanı Bul' etkinliği için ${rowCount} satır oluştur.
    BENZERLİK: ${similarity}
    Her satırda 4 kelime olsun. Bu kelimelerden 3'ü birbiriyle çok benzesin (görsel olarak), biri ise onlardan biraz farklı olsun.
    Doğru olanın (farklı olanın) indeksini belirt.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
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
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindTheDifferenceData[]>;
};

export const generateStroopTestFromAI = async (options: OfflineGeneratorOptions): Promise<StroopTestData[]> => {
    const { itemCount: count, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" zorluk seviyesine uygun bir Stroop testi için ${count} tane öğe oluştur. Her öğe bir renk adı (text) ve bir CSS renk adı (color) içermelidir. 
    Metin ve renk genellikle birbiriyle eşleşmemelidir. Örneğin, metin "MAVİ" olabilirken renk "red" olabilir.
    Kullanılacak renkler: red, blue, green, yellow, orange, purple, pink, black.
    Kullanılacak metinler: KIRMIZI, MAVİ, YEŞİL, SARI, TURUNCU, MOR, PEMBE, SİYAH.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
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
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StroopTestData[]>;
};

export const generateOddOneOutFromAI = async (options: OfflineGeneratorOptions): Promise<OddOneOutData[]> => {
  const { topic, itemCount: groupCount, difficulty, worksheetCount } = options;
  
  let relation = "Alakasız kelime çok bariz olsun (kedi, köpek, kuş, masa).";
  if (difficulty === 'Zor' || difficulty === 'Uzman') relation = "Alakasız kelime, diğerleriyle ilişkili gibi görünsün ama ince bir fark olsun (elma, armut, muz, domates - hepsi meyve gibi ama domates sebze sayılır).";

  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun 'Farklı Olanı Bul' etkinliği için ${groupCount} grup oluştur.
    İLİŞKİ TÜRÜ: ${relation}
    Her grupta 4 kelime olsun. Bu kelimelerden 3'ü anlamsal olarak ilişkili, biri ise alakasız olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
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
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<OddOneOutData[]>;
};

export const generateFindIdenticalWordFromAI = async (options: OfflineGeneratorOptions): Promise<FindIdenticalWordData[]> => {
    const { itemCount: count, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'Aynısını Bul' etkinliği için ${count} tane grup oluştur.
    Her grupta, birbirine çok benzeyen ama sadece bir harfi farklı olan iki kelime olsun. Bunlardan birini baz alarak birebir aynısını da ekle. Yani grupta [benzer1, benzer2] şeklinde iki kelimeden oluşan çiftler olacak.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
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
                            items: { type: Type.STRING },
                            minItems: 2,
                            maxItems: 2
                        }
                    },
                    required: ['words']
                }
            }
        },
        required: ['title', 'groups']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindIdenticalWordData[]>;
};

export const generateGridDrawingFromAI = async (options: OfflineGeneratorOptions): Promise<GridDrawingData[]> => {
    const { gridSize: gridDim, itemCount: count, difficulty, worksheetCount } = options;
    const prompt = `Create a mirror drawing activity appropriate for difficulty level "${difficulty}". Generate a worksheet with ${count} simple line patterns on a ${gridDim}x${gridDim} grid. Provide the line coordinates for each pattern as an array of lines, where each line is an array of two points [start, end], and each point is an array of two numbers [x, y]. The user will copy the drawing to an empty grid. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
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
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<GridDrawingData[]>;
};

export const generateChaoticNumberSearchFromAI = async (options: OfflineGeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    const { difficulty, worksheetCount } = options;
    const [start, end] = [1, 50];
    const prompt = `Create a chaotic number search puzzle appropriate for difficulty level "${difficulty}". The user needs to find numbers from ${start} to ${end}. Generate about 100 numbers in total, including the target range and distractors. For each number, provide its value, position (x, y as percentages), size (in rem), rotation (in degrees), and a random hex color. Make the layout chaotic. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
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
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ChaoticNumberSearchData[]>;
};

export const generateBlockPaintingFromAI = async (options: OfflineGeneratorOptions): Promise<BlockPaintingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a block painting activity appropriate for difficulty level "${difficulty}". Define a 10x10 grid. Create 3-4 colored shapes (like Tetris blocks). For each shape, provide a color and a 2D array representing its pattern. The user's goal is to color the grid according to the given shapes. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
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
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<BlockPaintingData[]>;
};

export const generateVisualOddOneOutFromAI = async (options: OfflineGeneratorOptions): Promise<VisualOddOneOutData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a visual odd one out puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with 4 rows. Each row has 4 items. Each item is a simple shape made of 9 segments (like a digital clock digit). In each row, one item's segment pattern is slightly different. Describe each item by a boolean array of its 9 segments. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
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
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData[]>;
};

export const generateSymmetryDrawingFromAI = async (options: OfflineGeneratorOptions): Promise<SymmetryDrawingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a symmetry drawing activity appropriate for difficulty level "${difficulty}". Define an 8x8 grid. Provide a set of dots (x, y coordinates) on one half of the grid (e.g., left half for a vertical axis). The user's goal is to draw the symmetrical reflection. Specify the axis of symmetry ('vertical' or 'horizontal'). 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
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
                type: Type.STRING,
                enum: ['vertical', 'horizontal']
            }
        },
        required: ["title", "prompt", "gridDim", "dots", "axis"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SymmetryDrawingData[]>;
};

export const generateFindDifferentStringFromAI = async (options: OfflineGeneratorOptions): Promise<FindDifferentStringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Find the Different String" activity appropriate for difficulty level "${difficulty}". Generate a worksheet with 10 rows. Each row contains 5 strings. Four of the strings are identical (e.g., "VWN"), and one is slightly different (e.g., "VNW"). The position of the different string should be random in each row. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
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
                        items: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["items"]
                }
            }
        },
        required: ["title", "prompt", "rows"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindDifferentStringData[]>;
};

export const generateDotPaintingFromAI = async (options: OfflineGeneratorOptions): Promise<DotPaintingData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a dot painting activity appropriate for difficulty level "${difficulty}". Design a simple hidden picture (e.g., a house) on a 15x15 grid. Provide the SVG path data for the grid lines and the viewBox. Provide a list of dots to be colored, with their cx, cy coordinates and a specific color. The user's goal is to color the dots to reveal the picture. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
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
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<DotPaintingData[]>;
};
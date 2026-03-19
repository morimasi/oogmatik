
<<<<<<< HEAD
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';
=======
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
import {
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"pedagogicalNote":** Bu alan veli/öğretmen içindir. Etkinliğin hangi spesifik bilişsel beceriyi (örn: görsel hafıza, seçici dikkat, işleyen bellek) nasıl desteklediğini akademik ama anlaşılır bir dille açıkla.
4.  **"instruction":** Öğrenciye hitap et. Net, motive edici ve anlaşılır ol.
5.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Flat Vector Art Style", "Educational Illustration", "Clean Lines", "Vibrant Colors".
    - **Detay:** Asla "bir nesne" deme. "Renkli, eğlenceli ve akılda kalıcı bir oyuncak ayı vektörü" de.
    - **Amaç:** Görsel, hafızada kalıcı olmalı.
6.  **İçerik:**
    - İçerik dolu ve gerçekçi olmalı.
`;

export const generateWordMemoryFromAI = async (options: GeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, memorizeRatio } = options;
    const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı Kelime Hafıza Testi.
    ${itemCount} kelime seç. Her biri için **İngilizce** 'imagePrompt' oluştur.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const itemSchema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            text: { type: 'STRING' },
            imagePrompt: { type: 'STRING' }
=======
        type: Type.OBJECT,
        properties: {
            text: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
        },
        required: ['text', 'imagePrompt']
    };
    const singleSchema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            memorizeTitle: { type: 'STRING' },
            testTitle: { type: 'STRING' },
            wordsToMemorize: { type: 'ARRAY', items: itemSchema },
            testWords: { type: 'ARRAY', items: itemSchema }
        },
        required: ['title', 'memorizeTitle', 'testTitle', 'wordsToMemorize', 'testWords', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
=======
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            wordsToMemorize: { type: Type.ARRAY, items: itemSchema },
            testWords: { type: Type.ARRAY, items: itemSchema }
        },
        required: ['title', 'memorizeTitle', 'testTitle', 'wordsToMemorize', 'testWords', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    return generateWithSchema(prompt, schema) as Promise<WordMemoryData[]>;
};

export const generateVisualMemoryFromAI = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
<<<<<<< HEAD
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const prompt = `
=======
  const { topic, itemCount, difficulty, worksheetCount } = options;
  const prompt = `
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    "${difficulty}" seviyesinde, '${topic}' temalı Görsel Hafıza Testi.
    Nesneler için **İngilizce** 'imagePrompt' ve Türkçe 'description' üret.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
  `;
<<<<<<< HEAD
    const itemSchema = {
        type: 'OBJECT',
        properties: {
            description: { type: 'STRING' },
            imagePrompt: { type: 'STRING' }
        },
        required: ['description', 'imagePrompt']
    };
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            memorizeTitle: { type: 'STRING' },
            testTitle: { type: 'STRING' },
            itemsToMemorize: { type: 'ARRAY', items: itemSchema },
            testItems: { type: 'ARRAY', items: itemSchema }
        },
        required: ['title', 'memorizeTitle', 'testTitle', 'itemsToMemorize', 'testItems', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualMemoryData[]>;
=======
  const itemSchema = {
      type: Type.OBJECT,
      properties: {
          description: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
      },
      required: ['description', 'imagePrompt']
  };
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      memorizeTitle: { type: Type.STRING },
      testTitle: { type: Type.STRING },
      itemsToMemorize: { type: Type.ARRAY, items: itemSchema },
      testItems: { type: Type.ARRAY, items: itemSchema }
    },
    required: ['title', 'memorizeTitle', 'testTitle', 'itemsToMemorize', 'testItems', 'instruction', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<VisualMemoryData[]>;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
};

export const generateNumberSearchFromAI = async (options: GeneratorOptions): Promise<NumberSearchData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Sayı Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            numbers: { type: 'ARRAY', items: { type: 'STRING' } },
            range: {
                type: 'OBJECT',
                properties: { start: { type: 'INTEGER' }, end: { type: 'INTEGER' } },
=======
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
            range: {
                type: Type.OBJECT,
                properties: { start: { type: Type.INTEGER }, end: { type: Type.INTEGER } },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                required: ['start', 'end']
            }
        },
        required: ['title', 'numbers', 'range', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
<<<<<<< HEAD
    const schema = { type: 'ARRAY', items: singleSchema };
=======
    const schema = { type: Type.ARRAY, items: singleSchema };
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    return generateWithSchema(prompt, schema) as Promise<NumberSearchData[]>;
};

export const generateFindTheDuplicateInRowFromAI = async (options: GeneratorOptions): Promise<FindDuplicateData[]> => {
<<<<<<< HEAD
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde 'İkiliyi Bul'. Her satırda bir karakteri tekrar et. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            rows: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } }
        },
        required: ['title', 'rows', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindDuplicateData[]>;
=======
  const { difficulty, worksheetCount } = options;
  const prompt = `"${difficulty}" seviyesinde 'İkiliyi Bul'. Her satırda bir karakteri tekrar et. ${PEDAGOGICAL_PROMPT}`;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
    },
    required: ['title', 'rows', 'instruction', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<FindDuplicateData[]>;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
};

export const generateLetterGridTestFromAI = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, difficulty, worksheetCount, targetLetters } = options;
    const prompt = `
    "${difficulty}" seviyesinde Harf Izgarası. 
    Hedefler: ${targetLetters || 'b, d'}.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
            targetLetters: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['title', 'grid', 'targetLetters', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
=======
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            targetLetters: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'grid', 'targetLetters', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData[]>;
};

// Fix: Removed duplicate generateFindLetterPairFromAI as it is now centrally managed in newActivities.ts

export const generateTargetSearchFromAI = async (options: GeneratorOptions): Promise<TargetSearchData[]> => {
<<<<<<< HEAD
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Hedef Karakter Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
            target: { type: 'STRING' },
            distractor: { type: 'STRING' }
        },
        required: ['title', 'grid', 'target', 'distractor', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<TargetSearchData[]>;
=======
  const { difficulty, worksheetCount } = options;
  const prompt = `"${difficulty}" seviyesinde Hedef Karakter Avı. ${PEDAGOGICAL_PROMPT}`;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      target: { type: Type.STRING },
      distractor: { type: Type.STRING }
    },
    required: ['title', 'grid', 'target', 'distractor', 'instruction', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<TargetSearchData[]>;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
};

export const generateColorWheelMemoryFromAI = async (options: GeneratorOptions): Promise<ColorWheelMemoryData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Renk Çemberi Hafıza Oyunu.
    Her öğe için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            memorizeTitle: { type: 'STRING' },
            testTitle: { type: 'STRING' },
            items: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        name: { type: 'STRING' },
                        color: { type: 'STRING' },
                        imagePrompt: { type: 'STRING' }
=======
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        color: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                    },
                    required: ["name", "color", "imagePrompt"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "items", 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
<<<<<<< HEAD
    const schema = { type: 'ARRAY', items: singleSchema };
=======
    const schema = { type: Type.ARRAY, items: singleSchema };
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    return generateWithSchema(prompt, schema) as Promise<ColorWheelMemoryData[]>;
};

export const generateImageComprehensionFromAI = async (options: GeneratorOptions): Promise<ImageComprehensionData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Resim Anlama.
    Detaylı bir sahne betimle (sceneDescription) ve buna uygun **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            memorizeTitle: { type: 'STRING' },
            testTitle: { type: 'STRING' },
            sceneDescription: { type: 'STRING' },
            questions: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ["title", "memorizeTitle", "testTitle", "sceneDescription", "imagePrompt", "questions", 'instruction', 'pedagogicalNote']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
=======
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            sceneDescription: { type: Type.STRING },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "memorizeTitle", "testTitle", "sceneDescription", "imagePrompt", "questions", 'instruction', 'pedagogicalNote']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    return generateWithSchema(prompt, schema) as Promise<ImageComprehensionData[]>;
};

export const generateCharacterMemoryFromAI = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Karakter Hafıza.
    Karakterler için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
<<<<<<< HEAD
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            memorizeTitle: { type: 'STRING' },
            testTitle: { type: 'STRING' },
            charactersToMemorize: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        description: { type: 'STRING' },
                        imagePrompt: { type: 'STRING' }
=======
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            charactersToMemorize: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                    },
                    required: ["description", "imagePrompt"]
                }
            },
            testCharacters: {
<<<<<<< HEAD
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        description: { type: 'STRING' },
                        imagePrompt: { type: 'STRING' }
=======
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                    },
                    required: ["description", "imagePrompt"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "charactersToMemorize", "testCharacters", 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
<<<<<<< HEAD
    const schema = { type: 'ARRAY', items: singleSchema };
=======
    const schema = { type: Type.ARRAY, items: singleSchema };
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    return generateWithSchema(prompt, schema) as Promise<CharacterMemoryData[]>;
};

export const generateBurdonTestFromAI = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    return generateLetterGridTestFromAI({ ...options, gridSize: options.gridSize || 20, targetLetters: options.targetLetters || 'a,b,d,g' });
};

export const generateStroopTestFromAI = async (options: GeneratorOptions): Promise<StroopTestData[]> => {
<<<<<<< HEAD
    const { worksheetCount } = options;
    const prompt = `Stroop Testi oluştur. Renk isimleri ile renkler uyumsuz olsun. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            items: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: { text: { type: 'STRING' }, color: { type: 'STRING' } },
                    required: ["text", "color"]
                }
            }
        },
        required: ["title", "items", 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StroopTestData[]>;
}

export const generateChaoticNumberSearchFromAI = async (options: GeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    const prompt = `Kaotik Sayı Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            numbers: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        value: { type: 'INTEGER' },
                        x: { type: 'NUMBER' },
                        y: { type: 'NUMBER' },
                        size: { type: 'NUMBER' },
                        rotation: { type: 'NUMBER' },
                        color: { type: 'STRING' }
                    },
                    required: ["value", "x", "y", "size", "color"]
                }
            },
            range: { type: 'OBJECT', properties: { start: { type: 'INTEGER' }, end: { type: 'INTEGER' } }, required: ["start", "end"] }
        },
        required: ["title", "numbers", "range", 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ChaoticNumberSearchData[]>;
=======
     const { worksheetCount } = options;
     const prompt = `Stroop Testi oluştur. Renk isimleri ile renkler uyumsuz olsun. ${PEDAGOGICAL_PROMPT}`;
     const singleSchema = {
         type: Type.OBJECT,
         properties: {
             title: { type: Type.STRING },
             instruction: { type: Type.STRING },
             pedagogicalNote: { type: Type.STRING },
             imagePrompt: { type: Type.STRING },
             items: {
                 type: Type.ARRAY,
                 items: {
                     type: Type.OBJECT,
                     properties: { text: { type: Type.STRING }, color: { type: Type.STRING } },
                     required: ["text", "color"]
                 }
             }
         },
         required: ["title", "items", 'instruction', 'pedagogicalNote', 'imagePrompt']
     };
     const schema = { type: Type.ARRAY, items: singleSchema };
     return generateWithSchema(prompt, schema) as Promise<StroopTestData[]>;
}

export const generateChaoticNumberSearchFromAI = async (options: GeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
     const prompt = `Kaotik Sayı Avı. ${PEDAGOGICAL_PROMPT}`;
     const singleSchema = {
         type: Type.OBJECT,
         properties: {
             title: { type: Type.STRING },
             instruction: { type: Type.STRING },
             pedagogicalNote: { type: Type.STRING },
             imagePrompt: { type: Type.STRING },
             numbers: {
                 type: Type.ARRAY,
                 items: {
                     type: Type.OBJECT,
                     properties: { 
                         value: {type: Type.INTEGER}, 
                         x: {type: Type.NUMBER}, 
                         y: {type: Type.NUMBER}, 
                         size: {type: Type.NUMBER}, 
                         rotation: {type: Type.NUMBER}, 
                         color: {type: Type.STRING} 
                     },
                     required: ["value", "x", "y", "size", "color"]
                 }
             },
             range: { type: Type.OBJECT, properties: {start: {type: Type.INTEGER}, end: {type: Type.INTEGER}}, required: ["start", "end"]}
         },
         required: ["title", "numbers", "range", 'instruction', 'pedagogicalNote', 'imagePrompt']
     };
     const schema = { type: Type.ARRAY, items: singleSchema };
     return generateWithSchema(prompt, schema) as Promise<ChaoticNumberSearchData[]>;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
}


import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';
import {
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
ÜST DÜZEY EĞİTİM İÇERİĞİ OLUŞTURMA YÖNERGESİ (PREMIUM KALİTE):
1.  **Rol:** Sen, "Özel Eğitim ve Üstün Yetenekliler" için materyal hazırlayan uzman bir pedagogsun.
2.  **Çıktı:** Sadece geçerli JSON.
3.  **"instruction":** Öğrenciye hitap et. Net, motive edici ve anlaşılır ol.
4.  **"imagePrompt":** (Çok Önemli) Sen aynı zamanda bir Sanat Yönetmenisin. SVG üretecek bir yapay zeka için detaylı görsel tasviri yaz.
    - **Stil:** "Flat Vector Art Style", "Educational Illustration", "Clean Lines", "Vibrant Colors".
    - **Detay:** Asla "bir nesne" deme. "Renkli, eğlenceli ve akılda kalıcı bir oyuncak ayı vektörü" de.
    - **Amaç:** Görsel, hafızada kalıcı olmalı.
5.  **İçerik:**
    - İçerik dolu ve gerçekçi olmalı.
`;

export const generateWordMemoryFromAI = async (options: GeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, _memorizeRatio } = options;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı Kelime Hafıza Testi.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ İÇERİK!
    - Rastgelelik tohumu: ${generationSeed}
    - Asla aynı kelimeleri tekrar etme
    - Öğrenci yaşı ve seviyesine uygun farklı kelimeler seç
    
    ${itemCount} kelime seç. Her biri için **İngilizce** 'imagePrompt' oluştur.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const itemSchema = {
        type: 'OBJECT',
        properties: {
            text: { type: 'STRING' },
            imagePrompt: { type: 'STRING' }
        },
        required: ['text', 'imagePrompt']
    };
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            memorizeTitle: { type: 'STRING' },
            testTitle: { type: 'STRING' },
            wordsToMemorize: { type: 'ARRAY', items: itemSchema },
            testWords: { type: 'ARRAY', items: itemSchema }
        },
        required: ['title', 'memorizeTitle', 'testTitle', 'wordsToMemorize', 'testWords', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordMemoryData[]>;
};

export const generateVisualMemoryFromAI = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
    const { topic, _itemCount, difficulty, worksheetCount } = options;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı Görsel Hafıza Testi.
    
    ⚠️ KRİTİK: HER ÜRETİMDE BENZERSİZ GÖRSELLER!
    - Rastgelelik tohumu: ${generationSeed}
    - Farklı nesneler, farklı renkler, farklı kompozisyonlar
    
    Nesneler için **İngilizce** 'imagePrompt' ve Türkçe 'description' üret.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
  `;
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
            imagePrompt: { type: 'STRING' },
            memorizeTitle: { type: 'STRING' },
            testTitle: { type: 'STRING' },
            itemsToMemorize: { type: 'ARRAY', items: itemSchema },
            testItems: { type: 'ARRAY', items: itemSchema }
        },
        required: ['title', 'memorizeTitle', 'testTitle', 'itemsToMemorize', 'testItems', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<VisualMemoryData[]>;
};

export const generateNumberSearchFromAI = async (options: GeneratorOptions): Promise<NumberSearchData[]> => {
    const { difficulty, _worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Sayı Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            numbers: { type: 'ARRAY', items: { type: 'STRING' } },
            range: {
                type: 'OBJECT',
                properties: { start: { type: 'INTEGER' }, end: { type: 'INTEGER' } },
                required: ['start', 'end']
            }
        },
        required: ['title', 'numbers', 'range', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberSearchData[]>;
};

export const generateFindTheDuplicateInRowFromAI = async (options: GeneratorOptions): Promise<FindDuplicateData[]> => {
    const { difficulty, _worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde 'İkiliyi Bul'. Her satırda bir karakteri tekrar et. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            rows: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } }
        },
        required: ['title', 'rows', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindDuplicateData[]>;
};

export const generateLetterGridTestFromAI = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    const { _gridSize, difficulty, worksheetCount, targetLetters } = options;
    const prompt = `
    "${difficulty}" seviyesinde Harf Izgarası. 
    Hedefler: ${targetLetters || 'b, d'}.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
            targetLetters: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ['title', 'grid', 'targetLetters', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData[]>;
};

// Fix: Removed duplicate generateFindLetterPairFromAI as it is now centrally managed in newActivities.ts

export const generateTargetSearchFromAI = async (options: GeneratorOptions): Promise<TargetSearchData[]> => {
    const { difficulty, _worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Hedef Karakter Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
            target: { type: 'STRING' },
            distractor: { type: 'STRING' }
        },
        required: ['title', 'grid', 'target', 'distractor', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<TargetSearchData[]>;
};

export const generateColorWheelMemoryFromAI = async (options: GeneratorOptions): Promise<ColorWheelMemoryData[]> => {
    const { _itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Renk Çemberi Hafıza Oyunu.
    Her öğe için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
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
                    },
                    required: ["name", "color", "imagePrompt"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "items", 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ColorWheelMemoryData[]>;
};

export const generateImageComprehensionFromAI = async (options: GeneratorOptions): Promise<ImageComprehensionData[]> => {
    const { _topic, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Resim Anlama.
    Detaylı bir sahne betimle (sceneDescription) ve buna uygun **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
            imagePrompt: { type: 'STRING' },
            memorizeTitle: { type: 'STRING' },
            testTitle: { type: 'STRING' },
            sceneDescription: { type: 'STRING' },
            questions: { type: 'ARRAY', items: { type: 'STRING' } }
        },
        required: ["title", "memorizeTitle", "testTitle", "sceneDescription", "imagePrompt", "questions", 'instruction']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ImageComprehensionData[]>;
};

export const generateCharacterMemoryFromAI = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const { _topic, difficulty, worksheetCount } = options;
    
    // UNIQUE CONTENT GENERATION
    const generationSeed = Date.now() + Math.random();
    
    const prompt = `
    "${difficulty}" seviyesinde Karakter Hafıza.
    
    ⚠️ KRİTİK: HER ÜRETİMDE FARKLI KARAKTERLER!
    - Rastgelelik tohumu: ${generationSeed}
    - Farklı karakter özellikleri, farklı hikayeler
    
    Karakterler için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
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
                    },
                    required: ["description", "imagePrompt"]
                }
            },
            testCharacters: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        description: { type: 'STRING' },
                        imagePrompt: { type: 'STRING' }
                    },
                    required: ["description", "imagePrompt"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "charactersToMemorize", "testCharacters", 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CharacterMemoryData[]>;
};

export const generateBurdonTestFromAI = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    return generateLetterGridTestFromAI({ ...options, gridSize: options.gridSize || 20, targetLetters: options.targetLetters || 'a,b,d,g' });
};

export const generateStroopTestFromAI = async (options: GeneratorOptions): Promise<StroopTestData[]> => {
    const { _worksheetCount } = options;
    const prompt = `Stroop Testi oluştur. Renk isimleri ile renkler uyumsuz olsun. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
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
        required: ["title", "items", 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StroopTestData[]>;
}

export const generateChaoticNumberSearchFromAI = async (_options: GeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    const prompt = `Kaotik Sayı Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            instruction: { type: 'STRING' },
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
        required: ["title", "numbers", "range", 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ChaoticNumberSearchData[]>;
}

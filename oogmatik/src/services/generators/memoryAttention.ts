
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
    return generateWithSchema(prompt, schema) as Promise<WordMemoryData[]>;
};

export const generateVisualMemoryFromAI = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı Görsel Hafıza Testi.
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
};

export const generateNumberSearchFromAI = async (options: GeneratorOptions): Promise<NumberSearchData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Sayı Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
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
                required: ['start', 'end']
            }
        },
        required: ['title', 'numbers', 'range', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberSearchData[]>;
};

export const generateFindTheDuplicateInRowFromAI = async (options: GeneratorOptions): Promise<FindDuplicateData[]> => {
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
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData[]>;
};

// Fix: Removed duplicate generateFindLetterPairFromAI as it is now centrally managed in newActivities.ts

export const generateTargetSearchFromAI = async (options: GeneratorOptions): Promise<TargetSearchData[]> => {
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
                    },
                    required: ["name", "color", "imagePrompt"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "items", 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
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
        required: ["title", "memorizeTitle", "testTitle", "charactersToMemorize", "testCharacters", 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CharacterMemoryData[]>;
};

export const generateBurdonTestFromAI = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    return generateLetterGridTestFromAI({ ...options, gridSize: options.gridSize || 20, targetLetters: options.targetLetters || 'a,b,d,g' });
};

export const generateStroopTestFromAI = async (options: GeneratorOptions): Promise<StroopTestData[]> => {
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
}

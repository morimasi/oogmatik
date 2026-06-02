
import { generateWithSchema } from '../geminiClient.js';
import { GeneratorOptions } from '../../types.js';
import {
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData
} from '../../types';
import { PEDAGOGICAL_BASE, CLINICAL_DIAGNOSTIC_GUIDE } from './prompts.js';

const PEDAGOGICAL_PROMPT = `${PEDAGOGICAL_BASE}\n${CLINICAL_DIAGNOSTIC_GUIDE}`;


export const generateWordMemoryFromAI = async (options: GeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    
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
            text: { type: 'STRING', description: 'Kelime metni' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' }
        },
        required: ['text', 'imagePrompt']
    };
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            memorizeTitle: { type: 'STRING', description: 'Ezberleme aşaması başlığı' },
            testTitle: { type: 'STRING', description: 'Test aşaması başlığı' },
            wordsToMemorize: { type: 'ARRAY', items: itemSchema, description: 'Ezberlenecek kelimeler' },
            testWords: { type: 'ARRAY', items: itemSchema, description: 'Test kelimeleri' }
        },
        required: ['title', 'memorizeTitle', 'testTitle', 'wordsToMemorize', 'testWords', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'Kelime hafıza test sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<WordMemoryData[]>;
};

export const generateVisualMemoryFromAI = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    
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
            description: { type: 'STRING', description: 'Nesne tanımı (Türkçe)' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' }
        },
        required: ['description', 'imagePrompt']
    };
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            memorizeTitle: { type: 'STRING', description: 'Ezberleme aşaması başlığı' },
            testTitle: { type: 'STRING', description: 'Test aşaması başlığı' },
            itemsToMemorize: { type: 'ARRAY', items: itemSchema, description: 'Ezberlenecek nesneler' },
            testItems: { type: 'ARRAY', items: itemSchema, description: 'Test nesneleri' }
        },
        required: ['title', 'memorizeTitle', 'testTitle', 'itemsToMemorize', 'testItems', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'Görsel hafıza test sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<VisualMemoryData[]>;
};

export const generateNumberSearchFromAI = async (options: GeneratorOptions): Promise<NumberSearchData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Sayı Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            numbers: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Bulunacak sayılar listesi' },
            range: {
                type: 'OBJECT',
                description: 'Sayı aralığı',
                properties: { start: { type: 'INTEGER', description: 'Başlangıç' }, end: { type: 'INTEGER', description: 'Bitiş' } },
                required: ['start', 'end']
            }
        },
        required: ['title', 'numbers', 'range', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'Sayı avı sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<NumberSearchData[]>;
};

export const generateFindTheDuplicateInRowFromAI = async (options: GeneratorOptions): Promise<FindDuplicateData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde 'İkiliyi Bul'. Her satırda bir karakteri tekrar et. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            rows: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } }, description: 'Karakter satırları (her satırda tekrar var)' }
        },
        required: ['title', 'rows', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'İkili bul sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<FindDuplicateData[]>;
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
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } }, description: 'Harf ızgarası' },
            targetLetters: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Bulunacak harfler' }
        },
        required: ['title', 'grid', 'targetLetters', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'Harf ızgarası sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<LetterGridTestData[]>;
};

// Fix: Removed duplicate generateFindLetterPairFromAI as it is now centrally managed in newActivities.ts

export const generateTargetSearchFromAI = async (options: GeneratorOptions): Promise<TargetSearchData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `"${difficulty}" seviyesinde Hedef Karakter Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } }, description: 'Karakter ızgarası' },
            target: { type: 'STRING', description: 'Hedef karakter' },
            distractor: { type: 'STRING', description: 'Çeldirici karakter' }
        },
        required: ['title', 'grid', 'target', 'distractor', 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'Hedef karakter avı sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<TargetSearchData[]>;
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
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            memorizeTitle: { type: 'STRING', description: 'Ezberleme aşaması başlığı' },
            testTitle: { type: 'STRING', description: 'Test aşaması başlığı' },
            items: {
                type: 'ARRAY',
                description: 'Renk çemberi öğeleri',
                items: {
                    type: 'OBJECT',
                    properties: {
                        name: { type: 'STRING', description: 'Nesne adı' },
                        color: { type: 'STRING', description: 'Renk değeri (hex/css)' },
                        imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' }
                    },
                    required: ["name", "color", "imagePrompt"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "items", 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'Renk hafıza sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<ColorWheelMemoryData[]>;
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
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            memorizeTitle: { type: 'STRING', description: 'İnceleme aşaması başlığı' },
            testTitle: { type: 'STRING', description: 'Soru aşaması başlığı' },
            sceneDescription: { type: 'STRING', description: 'Sahne betimlemesi (Türkçe)' },
            questions: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Resimle ilgili sorular' }
        },
        required: ["title", "memorizeTitle", "testTitle", "sceneDescription", "imagePrompt", "questions", 'instruction']
    };
    const schema = { type: 'ARRAY', description: 'Resim anlama sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<ImageComprehensionData[]>;
};

export const generateCharacterMemoryFromAI = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
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
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            memorizeTitle: { type: 'STRING', description: 'Ezberleme aşaması başlığı' },
            testTitle: { type: 'STRING', description: 'Test aşaması başlığı' },
            charactersToMemorize: {
                type: 'ARRAY',
                description: 'Ezberlenecek karakterler',
                items: {
                    type: 'OBJECT',
                    properties: {
                        description: { type: 'STRING', description: 'Karakter tanımı' },
                        imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' }
                    },
                    required: ["description", "imagePrompt"]
                }
            },
            testCharacters: {
                type: 'ARRAY',
                description: 'Test karakterleri',
                items: {
                    type: 'OBJECT',
                    properties: {
                        description: { type: 'STRING', description: 'Karakter tanımı' },
                        imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' }
                    },
                    required: ["description", "imagePrompt"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "charactersToMemorize", "testCharacters", 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'Karakter hafıza sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<CharacterMemoryData[]>;
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
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            items: {
                type: 'ARRAY',
                description: 'Stroop maddeleri',
                items: {
                    type: 'OBJECT',
                    properties: { text: { type: 'STRING', description: 'Renk adı metni' }, color: { type: 'STRING', description: 'Yazı rengi (çelişen)' } },
                    required: ["text", "color"]
                }
            }
        },
        required: ["title", "items", 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'Stroop test sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<StroopTestData[]>;
}

export const generateChaoticNumberSearchFromAI = async (_options: GeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
    const prompt = `Kaotik Sayı Avı. ${PEDAGOGICAL_PROMPT}`;
    const singleSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING', description: 'Etkinlik başlığı' },
            instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
            imagePrompt: { type: 'STRING', description: 'Görsel prompt (İngilizce)' },
            numbers: {
                type: 'ARRAY',
                description: 'Kaotik yerleşimli sayılar',
                items: {
                    type: 'OBJECT',
                    properties: {
                        value: { type: 'INTEGER', description: 'Sayı değeri' },
                        x: { type: 'NUMBER', description: 'X koordinatı' },
                        y: { type: 'NUMBER', description: 'Y koordinatı' },
                        size: { type: 'NUMBER', description: 'Yazı boyutu' },
                        rotation: { type: 'NUMBER', description: 'Dönüş açısı (derece)' },
                        color: { type: 'STRING', description: 'Renk (hex/css)' }
                    },
                    required: ["value", "x", "y", "size", "color"]
                }
            },
            range: { type: 'OBJECT', description: 'Sayı aralığı', properties: { start: { type: 'INTEGER', description: 'Başlangıç' }, end: { type: 'INTEGER', description: 'Bitiş' } }, required: ["start", "end"] }
        },
        required: ["title", "numbers", "range", 'instruction', 'imagePrompt']
    };
    const schema = { type: 'ARRAY', description: 'Kaotik sayı avı sayfaları', items: singleSchema };
    return generateWithSchema(prompt, schema) as unknown as Promise<ChaoticNumberSearchData[]>;
}

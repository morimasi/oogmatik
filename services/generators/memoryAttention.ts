import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { OfflineGeneratorOptions } from '../offlineGenerators';
import {
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, SynonymSearchAndStoryData, StarHuntData, ShapeType
} from '../../types';

export const generateWordMemoryFromAI = async (options: OfflineGeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const memorizeCount = Math.floor(itemCount * 0.7);
    const testCount = itemCount;

    const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun bir kelime hafıza testi oluştur.
    Ezberlenecek ${memorizeCount} kelime seç.
    Test için ${testCount} kelimelik bir liste oluştur. Bu listenin içinde ezberlenecek kelimeler de bulunsun.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            wordsToMemorize: { type: Type.ARRAY, items: { type: Type.STRING } },
            testWords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'memorizeTitle', 'testTitle', 'wordsToMemorize', 'testWords']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordMemoryData[]>;
};

export const generateVisualMemoryFromAI = async (options: OfflineGeneratorOptions): Promise<VisualMemoryData[]> => {
  const { topic, itemCount, difficulty, worksheetCount } = options;
  const memorizeCount = Math.floor(itemCount * 0.7);
  const testCount = itemCount;
  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun bir görsel hafıza testi oluştur.
    Ezberlenecek ${memorizeCount} tane basit nesne belirle (örn: "Kırmızı Araba 🚗"). İsmini ve emojisini ver.
    Test için ${testCount} tane nesneden oluşan bir liste oluştur. Bu listenin içinde ezberlenecek nesneler de bulunsun.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      memorizeTitle: { type: Type.STRING },
      testTitle: { type: Type.STRING },
      itemsToMemorize: { type: Type.ARRAY, items: { type: Type.STRING } },
      testItems: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'memorizeTitle', 'testTitle', 'itemsToMemorize', 'testItems']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<VisualMemoryData[]>;
};

export const generateNumberSearchFromAI = async (options: OfflineGeneratorOptions): Promise<NumberSearchData[]> => {
    const { difficulty, worksheetCount } = options;
    const [start, end] = [1, 50]; // Sabit aralık
    const prompt = `
    "${difficulty}" zorluk seviyesine uygun bir sayı avı etkinliği oluştur. 
    ${start} ile ${end} arasındaki sayıları içersin.
    Bu sayıları ve dikkat dağıtıcı başka sayıları/karakterleri rastgele bir sırada içeren bir liste oluştur. Toplam 100 öğe olsun.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
            range: {
                type: Type.OBJECT,
                properties: {
                    start: { type: Type.INTEGER },
                    end: { type: Type.INTEGER }
                },
                required: ['start', 'end']
            }
        },
        required: ['title', 'numbers', 'range']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberSearchData[]>;
};

export const generateFindDuplicateFromAI = async (options: OfflineGeneratorOptions): Promise<FindDuplicateData[]> => {
  const { itemCount: rows, difficulty, worksheetCount } = options;
  const cols = 15;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'İkiliyi Bul' etkinliği için ${rows} satır ve ${cols} sütundan oluşan bir tablo oluştur.
    Her satıra rastgele harfler ve rakamlar yerleştir.
    Her satırda, karakterlerden sadece bir tanesi iki defa tekrar etsin.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
    },
    required: ['title', 'rows']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<FindDuplicateData[]>;
};

export const generateLetterGridFromAI = async (options: OfflineGeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, difficulty, worksheetCount, targetLetters } = options;
    const letters = targetLetters || 'b,d,p,q';
    const targetLettersArray = letters.split(',').map(l => l.trim().toLowerCase());
    const prompt = `
    ${gridSize}x${gridSize} boyutunda ve "${difficulty}" zorluk seviyesine uygun bir harf ızgarası oluştur.
    Izgarayı rastgele Türkçe küçük harflerle doldur.
    Aranacak hedef harfler şunlar: ${targetLettersArray.join(', ')}. Bu harfleri ızgaraya serpiştir.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the letter grid test.' },
            grid: {
                type: Type.ARRAY,
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                description: `A ${gridSize}x${gridSize} grid of random lowercase Turkish letters.`
            },
            targetLetters: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'The list of letters to be found in the grid.'
            }
        },
        required: ['title', 'grid', 'targetLetters']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData[]>;
};

export const generateFindLetterPairFromAI = async (options: OfflineGeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, difficulty, worksheetCount, targetPair } = options;
    const pair = targetPair || 'bd';
    const prompt = `
    'Harf İkilisini Bul' etkinliği için ${gridSize}x${gridSize} boyutunda ve "${difficulty}" zorluk seviyesine uygun bir harf ızgarası oluştur.
    Izgarayı rastgele Türkçe harflerle doldur.
    Hedef harf ikilisi olan '${pair}' harflerini ızgarada yanyana olacak şekilde birkaç yere yerleştir.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            grid: {
                type: Type.ARRAY,
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            targetPair: { type: Type.STRING }
        },
        required: ['title', 'grid', 'targetPair']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<FindLetterPairData[]>;
};

export const generateTargetSearchFromAI = async (options: OfflineGeneratorOptions): Promise<TargetSearchData[]> => {
  const { gridSize, difficulty, worksheetCount, targetChar, distractorChar } = options;
  const target = targetChar || 'd';
  const distractor = distractorChar || 'b';
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'Dikkatli Göz' etkinliği oluştur.
    ${gridSize}x${gridSize} boyutunda bir tabloyu '${distractor}' karakteriyle doldur.
    İçine rastgele yerlere 15-20 tane '${target}' karakteri serpiştir.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      target: { type: Type.STRING },
      distractor: { type: Type.STRING }
    },
    required: ['title', 'grid', 'target', 'distractor']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<TargetSearchData[]>;
};

export const generateColorWheelMemoryFromAI = async (options: OfflineGeneratorOptions): Promise<ColorWheelMemoryData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `Create a color wheel memory game with ${itemCount} items, appropriate for difficulty level "${difficulty}". Each item must have a name (e.g., "Kitap 📕") and a unique hex color code. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        color: { type: Type.STRING }
                    },
                    required: ["name", "color"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "items"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ColorWheelMemoryData[]>;
};

export const generateImageComprehensionFromAI = async (options: OfflineGeneratorOptions): Promise<ImageComprehensionData[]> => {
    const { topic, itemCount: questionCount, difficulty, worksheetCount } = options;
    const prompt = `
    Generate a simple, detailed scene description about '${topic}' for an image comprehension test, appropriate for difficulty level "${difficulty}". The description should be around 50-70 words.
    Also, create a detailed, high-quality image generation prompt (in English) based on this description to generate a simple, cartoonish, and clear image.
    Then, create ${questionCount} open-ended questions about the details in the scene.
    For the 'imagePrompt' field, return the generated image prompt.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            sceneDescription: { type: Type.STRING },
            imagePrompt: { type: Type.STRING, description: "A detailed English prompt for an image generation model." },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "memorizeTitle", "testTitle", "sceneDescription", "imagePrompt", "questions"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ImageComprehensionData[]>;
};

export const generateCharacterMemoryFromAI = async (options: OfflineGeneratorOptions): Promise<CharacterMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const memorizeCount = Math.floor(itemCount * 0.7);
    const testCount = itemCount;
    const prompt = `
    Generate a character memory test about '${topic}', appropriate for difficulty level "${difficulty}".
    Create ${memorizeCount} unique, simple characters. For each, provide a short description (e.g., "Kırmızı şapkalı bir ayıcık") and a detailed English image generation prompt for it.
    Then, create a test list of ${testCount} characters, including the ones to be memorized, each with a description and an image prompt.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            charactersToMemorize: {
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
            testCharacters: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["description", "imagePrompt"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "charactersToMemorize", "testCharacters"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CharacterMemoryData[]>;
};

export const generateBurdonTestFromAI = async (options: OfflineGeneratorOptions): Promise<LetterGridTestData[]> => {
    return generateLetterGridFromAI({ ...options, gridSize: 20, targetLetters: 'a,b,d,g' });
};

export const generateSynonymSearchAndStoryFromAI = async(options: OfflineGeneratorOptions): Promise<SynonymSearchAndStoryData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Synonym Search and Story" activity appropriate for difficulty level "${difficulty}". Provide a table of 6 Turkish words and their synonyms. Create a 12x12 grid and hide the synonyms. Finally, provide a prompt for the user to write a story using the original words. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            wordTable: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        synonym: { type: Type.STRING }
                    },
                    required: ["word", "synonym"]
                }
            },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            storyPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "wordTable", "grid", "storyPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SynonymSearchAndStoryData[]>;
}

export const generateStarHuntFromAI = async(options: OfflineGeneratorOptions): Promise<StarHuntData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Star Hunt puzzle with geometric shapes, appropriate for difficulty level "${difficulty}". Generate a 6x6 grid. Each cell can contain a shape, a star, a question mark, or be empty (null). The numbers next to rows/columns indicate how many stars are in that row/column. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
        },
        required: ["title", "prompt", "grid"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StarHuntData[]>;
}
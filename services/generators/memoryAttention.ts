
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData
} from '../../types';

// Common Pedagogical Notes
const NOTES = {
    memory: "Kısa süreli bellek kapasitesini ve bilgiyi geri çağırma (retrieval) hızını artırır.",
    attention: "Seçici dikkat (selective attention) ve sürdürülebilir dikkat becerilerini güçlendirir.",
    visual: "Görsel ayrımlaştırma ve şekil-zemin algısı (figure-ground perception) çalışmasıdır.",
    inhibition: "Otomatik tepkileri bastırma ve bilişsel esneklik (cognitive flexibility) sağlar."
};

export const generateWordMemoryFromAI = async (options: GeneratorOptions): Promise<WordMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, memorizeRatio } = options;
    const memorizeCount = Math.floor(itemCount * (memorizeRatio / 100));
    const testCount = itemCount;

    const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun bir kelime hafıza testi oluştur.
    Ezberlenecek ${memorizeCount} kelime seç.
    ${difficulty === 'Başlangıç' ? 'Kelimeler kısa (3-4 harf) ve somut olsun.' : difficulty === 'Uzman' ? 'Kelimeler aynı kategoriden ve birbirine yakın olsun (örn: Pırasa, Ispanak, Pazı) - bu ayırt etmeyi zorlaştırır.' : 'Kelimeler orta zorlukta olsun.'}
    Test için ${testCount} kelimelik bir liste oluştur. Bu listenin içinde ezberlenecek kelimeler de bulunsun.
    
    INSTRUCTION: "İlk sayfadaki kelimeleri dikkatlice oku ve ezberle. Sayfayı çevir ve aklında kalanları işaretle."
    PEDAGOGICAL NOTE: ${NOTES.memory}
    
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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

export const generateVisualMemoryFromAI = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
  const { topic, itemCount, difficulty, worksheetCount, memorizeRatio } = options;
  const memorizeCount = Math.floor(itemCount * (memorizeRatio / 100));
  const testCount = itemCount;
  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun bir görsel hafıza testi oluştur.
    Ezberlenecek ${memorizeCount} tane nesne belirle (örn: "Kırmızı Araba 🚗"). İsmini ve emojisini ver.
    Test için ${testCount} tane nesneden oluşan bir liste oluştur. Bu listenin içinde ezberlenecek nesneler de bulunsun.
    ${difficulty === 'Zor' || difficulty === 'Uzman' ? 'Nesneler birbirine çok benzesin (örn: Kırmızı Elma, Yeşil Elma, Yarım Elma).' : 'Nesneler birbirinden tamamen farklı olsun.'}
    
    INSTRUCTION: "Görsellere dikkatlice bak. Arka sayfada sadece gördüklerini bul."
    PEDAGOGICAL NOTE: "Görsel hafıza ve detay algısını güçlendirir."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
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

export const generateNumberSearchFromAI = async (options: GeneratorOptions): Promise<NumberSearchData[]> => {
    const { difficulty, worksheetCount } = options;
    let range = { start: 1, end: 20 };
    if (difficulty === 'Orta') range = { start: 1, end: 50 };
    if (difficulty === 'Zor') range = { start: 100, end: 150 };
    if (difficulty === 'Uzman') range = { start: 1000, end: 1100 };

    const prompt = `
    "${difficulty}" zorluk seviyesine uygun bir sayı avı etkinliği oluştur. 
    ${range.start} ile ${range.end} arasındaki sayıları içersin.
    Bu sayıları ve dikkat dağıtıcı başka sayıları/karakterleri rastgele bir sırada içeren bir liste oluştur. Toplam 100 öğe olsun.
    
    INSTRUCTION: "Sayıları sırasıyla (1, 2, 3...) bularak takip et ve işaretle."
    PEDAGOGICAL NOTE: "Sıralı işlem yapma ve sürdürülebilir dikkat."
    
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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

export const generateFindTheDuplicateInRowFromAI = async (options: GeneratorOptions): Promise<FindDuplicateData[]> => {
  const { itemCount: rows, difficulty, worksheetCount, cols } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'İkiliyi Bul' etkinliği için ${rows} satır ve ${cols} sütundan oluşan bir tablo oluştur.
    Her satıra rastgele harfler ve rakamlar yerleştir.
    ${difficulty === 'Zor' || difficulty === 'Uzman' ? 'Karakterler birbirine çok benzer olsun (b, d, p, q gibi).' : 'Karakterler birbirinden farklı olsun.'}
    Her satırda, karakterlerden sadece bir tanesi iki defa tekrar etsin.
    
    INSTRUCTION: "Her satırda iki kez yazılmış olan harfi veya sayıyı bul."
    PEDAGOGICAL NOTE: ${NOTES.visual}

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
    },
    required: ['title', 'rows']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<FindDuplicateData[]>;
};

export const generateLetterGridTestFromAI = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, difficulty, worksheetCount, targetLetters } = options;
    const letters = targetLetters || 'b,d,p,q';
    const targetLettersArray = letters.split(',').map(l => l.trim().toLowerCase());
    const prompt = `
    ${gridSize}x${gridSize} boyutunda ve "${difficulty}" zorluk seviyesine uygun bir harf ızgarası oluştur.
    Izgarayı rastgele Türkçe küçük harflerle doldur.
    Aranacak hedef harfler şunlar: ${targetLettersArray.join(', ')}. Bu harfleri ızgaraya serpiştir. "${difficulty}" seviyesine göre çeldirici harflerin (b,d,p,q,m,n gibi) yoğunluğunu ayarla.
    
    INSTRUCTION: "Aşağıdaki kutuda ${targetLettersArray.join(', ')} harflerini bul ve daire içine al."
    PEDAGOGICAL NOTE: "Benzer uyaranlar arasında hedefi bulma (diskriminasyon)."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            grid: {
                type: Type.ARRAY,
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            targetLetters: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
            }
        },
        required: ['title', 'grid', 'targetLetters']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData[]>;
};

export const generateFindLetterPairFromAI = async (options: GeneratorOptions): Promise<FindLetterPairData[]> => {
    const { gridSize, difficulty, worksheetCount, targetPair } = options;
    const pair = targetPair || 'bd';
    const prompt = `
    'Harf İkilisini Bul' etkinliği için ${gridSize}x${gridSize} boyutunda ve "${difficulty}" zorluk seviyesine uygun bir harf ızgarası oluştur.
    Izgarayı rastgele Türkçe harflerle doldur.
    Hedef harf ikilisi olan '${pair}' harflerini ızgarada yanyana olacak şekilde birkaç yere yerleştir.
    
    INSTRUCTION: "Yan yana gelen ${pair} harflerini bul."
    PEDAGOGICAL NOTE: "Görsel tarama ve bütünleştirme."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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

export const generateTargetSearchFromAI = async (options: GeneratorOptions): Promise<TargetSearchData[]> => {
  const { gridSize, difficulty, worksheetCount, targetChar, distractorChar } = options;
  const target = targetChar || 'd';
  const distractor = distractorChar || 'b';
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'Dikkatli Göz' etkinliği oluştur.
    ${gridSize}x${gridSize} boyutunda bir tabloyu '${distractor}' karakteriyle doldur.
    İçine rastgele yerlere 15-20 tane '${target}' karakteri serpiştir. "${difficulty}" seviyesi arttıkça, çeldirici karakterlerin arasına 'p', 'q' gibi benzer karakterler de ekle.
    
    INSTRUCTION: "Sadece '${target}' harflerini bul ve say."
    PEDAGOGICAL NOTE: "Zemin-şekil algısı ve seçici dikkat."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      target: { type: Type.STRING },
      distractor: { type: Type.STRING }
    },
    required: ['title', 'grid', 'target', 'distractor']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<TargetSearchData[]>;
};

export const generateColorWheelMemoryFromAI = async (options: GeneratorOptions): Promise<ColorWheelMemoryData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `Create a color wheel memory game with ${itemCount} items, appropriate for difficulty level "${difficulty}". Each item must have a name (e.g., "Kitap 📕") and a unique hex color code. 
    INSTRUCTION: "Renk çarkındaki nesnelerin yerlerini ezberle."
    PEDAGOGICAL NOTE: "Görsel-mekansal hafıza."
    
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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

export const generateImageComprehensionFromAI = async (options: GeneratorOptions): Promise<ImageComprehensionData[]> => {
    const { topic, itemCount: questionCount, difficulty, worksheetCount } = options;
    const prompt = `
    Generate a simple, detailed scene description about '${topic}' for an image comprehension test, appropriate for difficulty level "${difficulty}".
    Also, create a detailed, high-quality image generation prompt (in English).
    Then, create ${questionCount} questions about the details in the scene. Questions should test working memory (e.g., "How many...", "What color...", "Where was...").
    
    INSTRUCTION: "Resmi dikkatlice incele ve detayları aklında tut."
    PEDAGOGICAL NOTE: "Görsel detayları işleme ve kısa süreli bellekte tutma."

    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            sceneDescription: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "memorizeTitle", "testTitle", "sceneDescription", "imagePrompt", "questions"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ImageComprehensionData[]>;
};

export const generateCharacterMemoryFromAI = async (options: GeneratorOptions): Promise<CharacterMemoryData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, memorizeRatio } = options;
    const memorizeCount = Math.floor(itemCount * (memorizeRatio/100));
    const testCount = itemCount;
    const prompt = `
    Generate a character memory test about '${topic}', appropriate for difficulty level "${difficulty}".
    Create ${memorizeCount} unique, simple characters. For each, provide a short description and an image prompt.
    Then, create a test list of ${testCount} characters.
    
    INSTRUCTION: "Karakterleri ve özelliklerini ezberle."
    PEDAGOGICAL NOTE: "Yüz tanıma ve isim-eşya ilişkilendirme belleği."

    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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

export const generateBurdonTestFromAI = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    return generateLetterGridTestFromAI({ ...options, gridSize: options.gridSize || 20, targetLetters: options.targetLetters || 'a,b,d,g' });
};

export const generateStroopTestFromAI = async (options: GeneratorOptions): Promise<StroopTestData[]> => {
     const { itemCount, worksheetCount } = options;
     const prompt = `Generate a Stroop Test data set. Create ${itemCount} items. Each item should have a 'text' (a color name in Turkish, e.g., 'KIRMIZI', 'MAVİ') and a 'color' (a CSS color value like 'blue', 'green').
     CRITICAL: The 'color' MUST NOT match the 'text'. If text is 'KIRMIZI', color cannot be 'red'.
     
     INSTRUCTION: "Kelimeyi okuma, rengini söyle!"
     PEDAGOGICAL NOTE: ${NOTES.inhibition}
     
     Create ${worksheetCount} worksheets.`;
     
     const singleSchema = {
         type: Type.OBJECT,
         properties: {
             title: { type: Type.STRING },
             instruction: { type: Type.STRING },
             pedagogicalNote: { type: Type.STRING },
             items: {
                 type: Type.ARRAY,
                 items: {
                     type: Type.OBJECT,
                     properties: { text: { type: Type.STRING }, color: { type: Type.STRING } },
                     required: ["text", "color"]
                 }
             }
         },
         required: ["title", "items"]
     };
     const schema = { type: Type.ARRAY, items: singleSchema };
     return generateWithSchema(prompt, schema) as Promise<StroopTestData[]>;
}

export const generateChaoticNumberSearchFromAI = async (options: GeneratorOptions): Promise<ChaoticNumberSearchData[]> => {
     const { itemCount, worksheetCount } = options;
     const prompt = `Generate a 'Chaotic Number Search' dataset. 
     Create ${itemCount} numbers. Each number object needs: value (integer), x (0-100), y (0-100), size (1-4), rotation (-45 to 45), color (hex).
     
     INSTRUCTION: "Sayıları sırasıyla bul."
     PEDAGOGICAL NOTE: ${NOTES.visual}

     Create ${worksheetCount} worksheets.`;

     const singleSchema = {
         type: Type.OBJECT,
         properties: {
             title: { type: Type.STRING },
             prompt: { type: Type.STRING }, // prompt field used as sub-instruction
             instruction: { type: Type.STRING },
             pedagogicalNote: { type: Type.STRING },
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
         required: ["title", "numbers", "range"]
     };
     const schema = { type: Type.ARRAY, items: singleSchema };
     return generateWithSchema(prompt, schema) as Promise<ChaoticNumberSearchData[]>;
}

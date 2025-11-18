
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { OfflineGeneratorOptions } from '../offlineGenerators';
import {
    WordSearchData, WordSearchWithPasswordData, ProverbSearchData, LetterGridWordFindData, ThematicWordSearchColorData,
    SynonymWordSearchData, SynonymSearchAndStoryData, AnagramData, SpellingCheckData, LetterBridgeData, WordLadderData,
    WordFormationData, ReverseWordData, WordGroupingData, MiniWordGridData, PasswordFinderData, SyllableCompletionData,
    SpiralPuzzleData, PunctuationSpiralPuzzleData, CrosswordData, CrosswordClue, JumbledWordStoryData, ThematicJumbledWordStoryData, HomonymSentenceData,
    WordGridPuzzleData, HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, PunctuationColoringData, AntonymResfebeData,
    ProverbSentenceFinderData, SynonymAntonymColoringData,
    SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordWebWithPasswordData,
    WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, ProverbFillData, WordComparisonData
} from '../../types';


export const generateWordSearchFromAI = async (options: OfflineGeneratorOptions): Promise<WordSearchData[]> => {
  const { topic, gridSize, itemCount: wordCount, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun, ${topic} konusuyla ilgili ${wordCount} tane Türkçe kelime oluştur. 
    Bu kelimeleri ${gridSize}x${gridSize} boyutunda bir harf bulmacasına yerleştir. 
    Kelimeler yatay, dikey ve çapraz olarak yerleştirilebilir. 
    Boş kalan yerleri rastgele Türkçe harflerle doldur.
    Bulmaca için '${topic}' konusuyla ilgili bir başlık (title) oluştur.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title for the word search puzzle.' },
      grid: {
        type: Type.ARRAY, description: 'The word search grid.',
        items: { type: Type.ARRAY, items: { type: Type.STRING }, },
      },
      words: {
        type: Type.ARRAY, description: 'List of words hidden in the grid.',
        items: { type: Type.STRING },
      },
    },
    required: ['title', 'grid', 'words']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordSearchData[]>;
};

export const generateProverbSearchFromAI = async (options: OfflineGeneratorOptions): Promise<ProverbSearchData[]> => {
  const { gridSize, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun bir 'Atasözü Avı' etkinliği oluştur.
    ${gridSize}x${gridSize} boyutunda bir harf tablosu oluştur.
    İçine iyi bilinen bir Türkçe atasözü gizle. Harfler soldan sağa, yukarıdan aşağıya veya çapraz olabilir.
    Boş kalan yerleri rastgele harflerle doldur.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      proverb: { type: Type.STRING }
    },
    required: ['title', 'grid', 'proverb']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<ProverbSearchData[]>;
};

export const generateAnagramFromAI = async (options: OfflineGeneratorOptions): Promise<(AnagramData[])[]> => {
  const { topic, itemCount: wordCount, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun, ${topic} konusuyla ilgili, her biri ${wordCount} tane Türkçe kelime ve bu kelimelerin karıştırılmış (anagram) hallerini içeren ${worksheetCount} tane çalışma sayfası oluştur.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu, her biri bir çalışma sayfasını temsil eden anagram nesneleri dizilerinden oluşan bir JSON dizisi olarak döndür.
  `;
  const anagramSchema = {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING, description: 'The original word.', },
        scrambled: { type: Type.STRING, description: 'The scrambled (anagram) version of the word.', },
      },
      required: ['word', 'scrambled']
  };

  const worksheetSchema = {
      type: Type.ARRAY,
      items: anagramSchema
  }

  const schema = {
    type: Type.ARRAY,
    items: worksheetSchema
  };

   return generateWithSchema(prompt, schema) as Promise<(AnagramData[])[]>;
};

export const generateSpellingCheckFromAI = async (options: OfflineGeneratorOptions): Promise<SpellingCheckData[]> => {
    const { topic, itemCount: count, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun, Türkçede sıkça yanlış yazılan ${count} kelime bul.
    Her kelime için, doğru yazılışını ve 2 tane yanlış yazılmış varyasyonunu içeren 3 seçenekli bir liste oluştur. Seçeneklerin sırasını karıştır.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the spelling check activity.' },
            checks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        correct: { type: Type.STRING, description: 'The correctly spelled word.' },
                        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Array of 3 options, including the correct one.' },
                    },
                    required: ['correct', 'options']
                },
            },
        },
        required: ['title', 'checks']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SpellingCheckData[]>;
};

export const generateWordComparisonFromAI = async (options: OfflineGeneratorOptions): Promise<WordComparisonData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun, iki farklı kutu için 10'ar kelimelik iki liste oluştur. 
    Listelerdeki kelimelerin çoğu aynı olsun ama her listede 3-4 tane farklı kelime bulunsun.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      box1Title: { type: Type.STRING },
      box2Title: { type: Type.STRING },
      wordList1: { type: Type.ARRAY, items: { type: Type.STRING } },
      wordList2: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['title', 'box1Title', 'box2Title', 'wordList1', 'wordList2']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordComparisonData[]>;
};

export const generateProverbFillInTheBlankFromAI = async (options: OfflineGeneratorOptions): Promise<ProverbFillData[]> => {
  const { itemCount: count, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun ${count} tane Türkçe atasözü seç. Her atasözünde bir kelimeyi eksik bırak.
    Atasözünün eksik kelimeden önceki ve sonraki kısımlarını ayrı ayrı ver.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      proverbs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            start: { type: Type.STRING },
            end: { type: Type.STRING }
          },
          required: ['start', 'end']
        }
      }
    },
    required: ['title', 'proverbs']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<ProverbFillData[]>;
};

export const generateLetterBridgeFromAI = async (options: OfflineGeneratorOptions): Promise<LetterBridgeData[]> => {
  const { itemCount: count, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'Harf Köprüsü' etkinliği için ${count} tane kelime çifti oluştur.
    Her çiftte, birinci kelimenin sonuna ve ikinci kelimenin başına aynı harf eklendiğinde anlamlı iki yeni kelime oluşmalıdır. 
    Örnek: (TARAF, İLMİK) -> A harfi -> (TARAFA, AİLMİK). Sen sadece 'TARAF' ve 'İLMİK' kısımlarını ver.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      pairs: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word1: { type: Type.STRING },
            word2: { type: Type.STRING }
          },
          required: ['word1', 'word2']
        }
      }
    },
    required: ['title', 'pairs']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<LetterBridgeData[]>;
};

export const generateWordLadderFromAI = async (options: OfflineGeneratorOptions): Promise<WordLadderData[]> => {
  const { itemCount: count, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'Kelime Merdiveni' etkinliği için ${count} tane bulmaca oluştur.
    Her bulmaca için 4 harfli bir başlangıç ve bitiş kelimesi seç. 
    İki kelime arasında en az 3 adım (değiştirilecek harf sayısı) olsun.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      ladders: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            startWord: { type: Type.STRING },
            endWord: { type: Type.STRING },
            steps: { type: Type.INTEGER }
          },
          required: ['startWord', 'endWord', 'steps']
        }
      }
    },
    required: ['title', 'ladders']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordLadderData[]>;
};

export const generateWordFormationFromAI = async (options: OfflineGeneratorOptions): Promise<WordFormationData[]> => {
    const { itemCount: count, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'Harflerden Kelime Türetme' etkinliği için ${count} tane set oluştur.
    Her set için 7-8 tane rastgele harf ve 1-2 tane joker hakkı belirle.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            sets: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        letters: { type: Type.ARRAY, items: { type: Type.STRING } },
                        jokerCount: { type: Type.INTEGER }
                    },
                    required: ['letters', 'jokerCount']
                }
            }
        },
        required: ['title', 'sets']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordFormationData[]>;
};

export const generateReverseWordFromAI = async (options: OfflineGeneratorOptions): Promise<ReverseWordData[]> => {
    const { topic, itemCount: count, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun ${count} tane Türkçe kelime seç.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            words: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'words']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ReverseWordData[]>;
};

export const generateWordGroupingFromAI = async (options: OfflineGeneratorOptions): Promise<WordGroupingData[]> => {
  const { topic, itemCount: wordCount, difficulty, worksheetCount } = options;
  const categoryCount = 3;
  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun bir kelime gruplama etkinliği oluştur.
    ${categoryCount} tane kategori ismi belirle.
    Bu kategorilere ait toplam ${wordCount} tane kelimeyi karışık bir sırada listele.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      words: { type: Type.ARRAY, items: { type: Type.STRING } },
      categoryNames: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'words', 'categoryNames']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordGroupingData[]>;
};

export const generateMiniWordGridFromAI = async (options: OfflineGeneratorOptions): Promise<MiniWordGridData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a mini word grid puzzle appropriate for difficulty level "${difficulty}". Generate a worksheet with 4 puzzles. Each puzzle is a 4x4 grid with a single 4-letter Turkish word hidden within. Specify the starting cell (row, col) of the word. The rest of the cells are filled with random letters.
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
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                        start: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] }
                    },
                    required: ["grid", "start"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<MiniWordGridData[]>;
};

export const generatePasswordFinderFromAI = async (options: OfflineGeneratorOptions): Promise<PasswordFinderData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Password Finder" activity appropriate for difficulty level "${difficulty}". Provide a list of 12 Turkish words. Some of them must be proper nouns that should be capitalized. The user must identify these. The first letter of each proper noun forms a secret password.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            words: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        passwordLetter: { type: Type.STRING },
                        isProperNoun: { type: Type.BOOLEAN }
                    },
                    required: ["word", "passwordLetter", "isProperNoun"]
                }
            },
            passwordLength: { type: Type.INTEGER }
        },
        required: ["title", "prompt", "words", "passwordLength"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PasswordFinderData[]>;
};

export const generateSyllableCompletionFromAI = async (options: OfflineGeneratorOptions): Promise<SyllableCompletionData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `Create a syllable completion activity with the theme '${topic}', appropriate for difficulty level "${difficulty}". Provide a list of first and second parts of 8 Turkish words. Also provide a list of the missing syllables for the user to choose from. Finally, provide a prompt for the user to write a story using the completed words. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            wordParts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        first: { type: Type.STRING },
                        second: { type: Type.STRING }
                    },
                    required: ["first", "second"]
                }
            },
            syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
            storyPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "theme", "wordParts", "syllables", "storyPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SyllableCompletionData[]>;
};

export const generateSynonymWordSearchFromAI = async (options: OfflineGeneratorOptions): Promise<SynonymWordSearchData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Synonym Word Search" activity appropriate for difficulty level "${difficulty}". Provide a list of 6 Turkish words to match. Create a 12x12 grid and hide the synonyms of these words in it. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            wordsToMatch: {
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
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
        },
        required: ["title", "prompt", "wordsToMatch", "grid"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SynonymWordSearchData[]>;
};

export const generateSpiralPuzzleFromAI = async (options: OfflineGeneratorOptions): Promise<SpiralPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Spiral Puzzle appropriate for difficulty level "${difficulty}". Generate a 10x10 grid with a spiral path for words. Provide 6-8 clues for Turkish words that fit into the spiral. Also provide the starting coordinates for each word. The grid should contain the solution letters. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordStarts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        row: { type: Type.INTEGER },
                        col: { type: Type.INTEGER }
                    },
                    required: ["id", "row", "col"]
                }
            }
        },
        required: ["title", "prompt", "clues", "grid", "wordStarts"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SpiralPuzzleData[]>;
};

export const generateCrosswordFromAI = async (options: OfflineGeneratorOptions): Promise<CrosswordData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a 10x10 crossword puzzle appropriate for difficulty level "${difficulty}". Generate about 5 across and 5 down clues for Turkish words. Provide the grid with solution letters and null for black cells. Also define a 5-6 letter password hidden in specific cells. Provide the password cell coordinates and the password length. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            clues: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        direction: { type: Type.STRING, enum: ['across', 'down'] },
                        text: { type: Type.STRING },
                        start: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] },
                        word: { type: Type.STRING }
                    },
                    required: ["id", "direction", "text", "start", "word"]
                }
            },
            passwordCells: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] }
            },
            passwordLength: { type: Type.INTEGER }
        },
        required: ["title", "prompt", "grid", "clues", "passwordCells", "passwordLength"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<CrosswordData[]>;
};

export const generateJumbledWordStoryFromAI = async (options: OfflineGeneratorOptions): Promise<JumbledWordStoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `Create a jumbled word and story writing activity with the theme '${topic}', appropriate for difficulty level "${difficulty}". Generate 6 puzzles, each with a jumbled Turkish word and its correct form. Then, provide a prompt for the user to write a story using these words. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        jumbled: { type: Type.ARRAY, items: { type: Type.STRING } },
                        word: { type: Type.STRING }
                    },
                    required: ["jumbled", "word"]
                }
            },
            storyPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "theme", "puzzles", "storyPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<JumbledWordStoryData[]>;
};

export const generateHomonymSentenceWritingFromAI = async (options: OfflineGeneratorOptions): Promise<HomonymSentenceData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a homonym (eş sesli) sentence writing activity, appropriate for difficulty level "${difficulty}". Provide 4 Turkish homonym words. For each word, provide a detailed English image generation prompt to visually represent one of its meanings. The user's task is to write two different sentences for each word. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["word", "imagePrompt"]
                }
            }
        },
        required: ["title", "prompt", "items"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<HomonymSentenceData[]>;
};

export const generateWordGridPuzzleFromAI = async (options: OfflineGeneratorOptions): Promise<WordGridPuzzleData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `Create a word grid puzzle (like Word-Fill-In) with the theme '${topic}', appropriate for difficulty level "${difficulty}". Create a 10x10 grid with some black cells (null). Provide a list of 8-10 Turkish words related to the theme to be placed in the grid. Provide a prompt about what to do with the one unused word. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            wordList: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            unusedWordPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "theme", "wordList", "grid", "unusedWordPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordGridPuzzleData[]>;
};

export const generateHomonymImageMatchFromAI = async (options: OfflineGeneratorOptions): Promise<HomonymImageMatchData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a homonym image matching puzzle, appropriate for difficulty level "${difficulty}". Provide two homonym words (e.g., 'yüz'). For each meaning, provide an image (via a detailed English image generation prompt). Create two columns of images, left and right. The user must match the images with the same word but different meanings. Also include a simple word scramble at the bottom with one of the homonym words as the answer. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            leftImages: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        word: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["id", "word", "imagePrompt"]
                }
            },
            rightImages: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        word: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["id", "word", "imagePrompt"]
                }
            },
            wordScramble: {
                type: Type.OBJECT,
                properties: {
                    letters: { type: Type.ARRAY, items: { type: Type.STRING } },
                    word: { type: Type.STRING }
                },
                required: ["letters", "word"]
            }
        },
        required: ["title", "prompt", "leftImages", "rightImages", "wordScramble"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<HomonymImageMatchData[]>;
};

export const generateAntonymFlowerPuzzleFromAI = async (options: OfflineGeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create an antonym flower puzzle, appropriate for difficulty level "${difficulty}". Generate a worksheet with 4 puzzles. Each puzzle is a flower shape. The center of the flower has a Turkish word. The user must find the antonym. The petals contain letters, some of which are part of a hidden password. The letters in the petals should not spell out the antonym. Provide the password length.
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
                        centerWord: { type: Type.STRING },
                        antonym: { type: Type.STRING },
                        petalLetters: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["centerWord", "antonym", "petalLetters"]
                }
            },
            passwordLength: { type: Type.INTEGER }
        },
        required: ["title", "prompt", "puzzles", "passwordLength"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AntonymFlowerPuzzleData[]>;
};

export const generateSynonymAntonymGridFromAI = async (options: OfflineGeneratorOptions): Promise<SynonymAntonymGridData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a synonym/antonym grid puzzle, appropriate for difficulty level "${difficulty}". Provide 5 words. The user must find both the synonym and antonym for each. The answers are then placed into a 12x12 grid. Provide the list of words, their synonyms and antonyms, and the solution grid.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            antonyms: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { word: { type: Type.STRING } }, required: ["word"] }
            },
            synonyms: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { word: { type: Type.STRING } }, required: ["word"] }
            },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
        },
        required: ["title", "prompt", "antonyms", "synonyms", "grid"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SynonymAntonymGridData[]>;
};

export const generatePunctuationColoringFromAI = async (options: OfflineGeneratorOptions): Promise<PunctuationColoringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a punctuation coloring activity, appropriate for difficulty level "${difficulty}". Provide 5 sentences, each missing a punctuation mark. For each sentence, provide a color and the correct punctuation mark. The user identifies the correct mark and colors a corresponding part of a picture. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            sentences: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        color: { type: Type.STRING },
                        correctMark: { type: Type.STRING }
                    },
                    required: ["text", "color", "correctMark"]
                }
            }
        },
        required: ["title", "prompt", "sentences"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationColoringData[]>;
};

export const generateAntonymResfebeFromAI = async (options: OfflineGeneratorOptions): Promise<AntonymResfebeData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create an Antonym Resfebe puzzle, appropriate for difficulty level "${difficulty}". Generate 3 puzzles. For each, create a Resfebe that solves to a Turkish word. Then, the user must write the antonym of that word. For image clues in the resfebe, provide a detailed English image generation prompt.
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
                        word: { type: Type.STRING },
                        antonym: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        clues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['text', 'image'] },
                                    value: { type: Type.STRING }
                                },
                                required: ["type", "value"]
                            }
                        }
                    },
                    required: ["word", "antonym", "clues"]
                }
            },
            antonymsPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "puzzles", "antonymsPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AntonymResfebeData[]>;
};


export const generateThematicWordSearchColorFromAI = async (options: OfflineGeneratorOptions): Promise<ThematicWordSearchColorData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `Create a thematic word search and color activity, appropriate for difficulty level "${difficulty}". The theme is '${topic}'. Provide a list of 8-10 related Turkish words to find in a 12x12 grid. The user finds and colors the words.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
        },
        required: ["title", "prompt", "theme", "words", "grid"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ThematicWordSearchColorData[]>;
};

export const generateProverbSentenceFinderFromAI = async (options: OfflineGeneratorOptions): Promise<ProverbSentenceFinderData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a proverb sentence finder activity, similar to ProverbWordChainData, appropriate for difficulty level "${difficulty}". Provide a word cloud of about 20 Turkish words that can form 3-4 proverbs or sayings. Also provide the full solutions. Assign a random hex color to each word.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            wordCloud: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        color: { type: Type.STRING }
                    },
                    required: ["word", "color"]
                }
            },
            solutions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "prompt", "wordCloud", "solutions"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ProverbSentenceFinderData[]>;
};

export const generateSynonymAntonymColoringFromAI = async (options: OfflineGeneratorOptions): Promise<SynonymAntonymColoringData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a synonym/antonym coloring activity, appropriate for difficulty level "${difficulty}". Provide a color key with 4-5 items, where each item links a description (e.g., "Antonym of 'Cömert'") to a color. Then provide a list of words placed on a conceptual image, with their x/y coordinates. The user colors the words according to the key.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            colorKey: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        color: { type: Type.STRING }
                    },
                    required: ["text", "color"]
                }
            },
            wordsOnImage: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["word", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "colorKey", "wordsOnImage"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SynonymAntonymColoringData[]>;
};

export const generatePunctuationSpiralPuzzleFromAI = async (options: OfflineGeneratorOptions): Promise<PunctuationSpiralPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Spiral Puzzle about punctuation and grammar, appropriate for difficulty level "${difficulty}". Generate a 10x10 grid with a spiral path. Provide 6-8 clues related to Turkish grammar and punctuation rules. The answers are words that fit into the spiral. Also provide the starting coordinates for each word.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordStarts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        row: { type: Type.INTEGER },
                        col: { type: Type.INTEGER }
                    },
                    required: ["id", "row", "col"]
                }
            }
        },
        required: ["title", "prompt", "clues", "grid", "wordStarts"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PunctuationSpiralPuzzleData[]>;
};

export const generateThematicJumbledWordStoryFromAI = async (options: OfflineGeneratorOptions): Promise<ThematicJumbledWordStoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `Create a thematic jumbled word and story writing activity, appropriate for difficulty level "${difficulty}". The theme is '${topic}'. Generate 6 jumbled words related to the theme and their correct forms. Then provide a prompt for the user to write a story using these words.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        jumbled: { type: Type.ARRAY, items: { type: Type.STRING } },
                        word: { type: Type.STRING }
                    },
                    required: ["jumbled", "word"]
                }
            },
            storyPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "theme", "puzzles", "storyPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ThematicJumbledWordStoryData[]>;
};

export const generateSynonymMatchingPatternFromAI = async (options: OfflineGeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `Create a synonym matching pattern activity with the theme '${topic}', appropriate for difficulty level "${difficulty}". Provide 6 pairs of Turkish words and their synonyms. The user must match them.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            pairs: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        synonym: { type: Type.STRING }
                    },
                    required: ["word", "synonym"]
                }
            }
        },
        required: ["title", "prompt", "theme", "pairs"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SynonymMatchingPatternData[]>;
};

export const generateMissingPartsFromAI = async (options: OfflineGeneratorOptions): Promise<MissingPartsData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Missing Parts" word puzzle, appropriate for difficulty level "${difficulty}". Provide two columns of 8 word parts each (e.g., 'bilgi' and 'sayar'). The user must match them to form complete words. Also, provide 3 examples of complete words with their parts shown.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            leftParts: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, text: { type: Type.STRING } }, required: ["id", "text"] }
            },
            rightParts: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, text: { type: Type.STRING } }, required: ["id", "text"] }
            },
            givenParts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        parts: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["word", "parts"]
                }
            }
        },
        required: ["title", "prompt", "leftParts", "rightParts", "givenParts"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<MissingPartsData[]>;
};

export const generateWordWebFromAI = async (options: OfflineGeneratorOptions): Promise<WordWebData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Word Web puzzle (similar to Word Grid Puzzle), appropriate for difficulty level "${difficulty}". Provide a 10x10 grid with black cells (null). Provide a list of 8-10 Turkish words to be placed in the grid. Also provide a prompt for a keyword that is revealed after filling the grid.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            wordsToFind: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            keyWordPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "wordsToFind", "grid", "keyWordPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordWebData[]>;
};

export const generateImageAnagramSortFromAI = async (options: OfflineGeneratorOptions): Promise<ImageAnagramSortData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create an "Image Anagram Sort" activity, appropriate for difficulty level "${difficulty}". Generate 6 cards. Each card has a scrambled word, its correct word, a description, and a detailed English image generation prompt. The user sorts the cards alphabetically by the correct word.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            cards: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        imageDescription: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        scrambledWord: { type: Type.STRING },
                        correctWord: { type: Type.STRING }
                    },
                    required: ["imageDescription", "imagePrompt", "scrambledWord", "correctWord"]
                }
            }
        },
        required: ["title", "prompt", "cards"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ImageAnagramSortData[]>;
};

export const generateAnagramImageMatchFromAI = async (options: OfflineGeneratorOptions): Promise<AnagramImageMatchData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create an "Anagram Image Match" puzzle, appropriate for difficulty level "${difficulty}". Provide a word bank of 8 Turkish words. Then, create 4 puzzles. Each puzzle has an image (with description and prompt), a partial answer with some letters filled in, and the correct word which is an anagram of one of the words in the word bank.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            wordBank: { type: Type.ARRAY, items: { type: Type.STRING } },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        imageDescription: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        partialAnswer: { type: Type.STRING },
                        correctWord: { type: Type.STRING }
                    },
                    required: ["imageDescription", "imagePrompt", "partialAnswer", "correctWord"]
                }
            }
        },
        required: ["title", "prompt", "wordBank", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AnagramImageMatchData[]>;
};

export const generateSyllableWordSearchFromAI = async (options: OfflineGeneratorOptions): Promise<SyllableWordSearchData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Syllable Word Search" activity, appropriate for difficulty level "${difficulty}". Provide a list of 10 syllables. Then, provide 5 word creation puzzles where the user combines two given syllables to form a word. The 5 created words should then be found in a 12x12 word search grid. Finally, provide a prompt for a hidden password in the grid.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            syllablesToCombine: { type: Type.ARRAY, items: { type: Type.STRING } },
            wordsToCreate: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        syllable1: { type: Type.STRING },
                        syllable2: { type: Type.STRING },
                        answer: { type: Type.STRING }
                    },
                    required: ["syllable1", "syllable2", "answer"]
                }
            },
            wordsToFindInSearch: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            passwordPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "syllablesToCombine", "wordsToCreate", "wordsToFindInSearch", "grid", "passwordPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SyllableWordSearchData[]>;
};

export const generateWordSearchWithPasswordFromAI = async (options: OfflineGeneratorOptions): Promise<WordSearchWithPasswordData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a 12x12 Word Search with a hidden password, appropriate for difficulty level "${difficulty}". Provide 8 Turkish words to find. Provide the coordinates of the cells that contain the letters of a 5-6 letter password.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
            passwordCells: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] }
            }
        },
        required: ["title", "prompt", "grid", "words", "passwordCells"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordSearchWithPasswordData[]>;
};

export const generateWordWebWithPasswordFromAI = async (options: OfflineGeneratorOptions): Promise<WordWebWithPasswordData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Word Web puzzle with a password, appropriate for difficulty level "${difficulty}". This is similar to a Word-Fill-In puzzle. Provide a 10x10 grid with black cells. Provide a list of 8-10 Turkish words to be placed in the grid. Specify a column index where the letters will form a password.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            passwordColumnIndex: { type: Type.INTEGER }
        },
        required: ["title", "prompt", "words", "grid", "passwordColumnIndex"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordWebWithPasswordData[]>;
};

export const generateLetterGridWordFindFromAI = async (options: OfflineGeneratorOptions): Promise<LetterGridWordFindData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Letter Grid Word Find" activity, appropriate for difficulty level "${difficulty}". Generate a 12x12 grid with hidden Turkish words. Provide a list of 8 words to find. Also provide a prompt for the user to write something using the found words.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            writingPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "words", "grid", "writingPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LetterGridWordFindData[]>;
};

export const generateWordPlacementPuzzleFromAI = async (options: OfflineGeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a Word Placement Puzzle (Kriss Kross), appropriate for difficulty level "${difficulty}". Provide a 10x10 grid with black cells. Provide groups of words sorted by their length (e.g., 3-letter words, 4-letter words). The user places these words into the grid. Also provide a prompt for what to do with the one word that doesn't fit.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordGroups: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        length: { type: Type.INTEGER },
                        words: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["length", "words"]
                }
            },
            unusedWordPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "grid", "wordGroups", "unusedWordPrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<WordPlacementPuzzleData[]>;
};

export const generatePositionalAnagramFromAI = async (options: OfflineGeneratorOptions): Promise<PositionalAnagramData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Positional Anagram" puzzle, appropriate for difficulty level "${difficulty}". Generate 6 puzzles. Each puzzle has a scrambled word where some letters are in numbered positions. The user must use the letters from the numbered positions to form a new word (the answer).
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
                        scrambled: { type: Type.STRING },
                        answer: { type: Type.STRING }
                    },
                    required: ["id", "scrambled", "answer"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<PositionalAnagramData[]>;
};

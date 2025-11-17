


import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import {
    WordSearchData, AnagramData, SpellingCheckData, WordComparisonData, ProverbFillData, LetterBridgeData, WordLadderData,
    WordFormationData, ReverseWordData, WordGroupingData, MiniWordGridData, PasswordFinderData, SyllableCompletionData,
    SynonymWordSearchData, SpiralPuzzleData, CrosswordData, JumbledWordStoryData, HomonymSentenceData, WordGridPuzzleData,
    HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, PunctuationColoringData, AntonymResfebeData,
    ThematicWordSearchColorData, ProverbSentenceFinderData, PunctuationSpiralPuzzleData, SynonymAntonymColoringData,
    ThematicJumbledWordStoryData, SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData,
    WordSearchWithPasswordData, WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData,
    PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, ProverbSearchData
} from '../../types';


export const generateWordSearchFromAI = async (topic: string, gridSize: number, wordCount: number): Promise<WordSearchData> => {
  const prompt = `
    ${topic} konusuyla ilgili ${wordCount} tane Türkçe kelime oluştur. 
    Bu kelimeleri ${gridSize}x${gridSize} boyutunda bir harf bulmacasına yerleştir. 
    Kelimeler yatay, dikey ve çapraz olarak yerleştirilebilir. 
    Boş kalan yerleri rastgele Türkçe harflerle doldur.
    Bulmaca için '${topic}' konusuyla ilgili bir başlık (title) oluştur.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
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
  return generateWithSchema(prompt, schema) as Promise<WordSearchData>;
};

export const generateProverbSearchFromAI = async (gridSize: number): Promise<ProverbSearchData> => {
  const prompt = `
    Bir 'Atasözü Avı' etkinliği oluştur.
    ${gridSize}x${gridSize} boyutunda bir harf tablosu oluştur.
    İçine iyi bilinen bir Türkçe atasözü gizle. Harfler soldan sağa, yukarıdan aşağıya veya çapraz olabilir.
    Boş kalan yerleri rastgele harflerle doldur.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      proverb: { type: Type.STRING }
    },
    required: ['title', 'grid', 'proverb']
  };
  return generateWithSchema(prompt, schema) as Promise<ProverbSearchData>;
};

export const generateAnagramsFromAI = async (topic: string, wordCount: number): Promise<AnagramData[]> => {
  const prompt = `
    ${topic} konusuyla ilgili ${wordCount} tane Türkçe kelime ve bu kelimelerin karıştırılmış (anagram) hallerini oluştur.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında bir dizi olarak döndür.
  `;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING, description: 'The original word.', },
        scrambled: { type: Type.STRING, description: 'The scrambled (anagram) version of the word.', },
      },
      required: ['word', 'scrambled']
    },
  };
   return generateWithSchema(prompt, schema) as Promise<AnagramData[]>;
};

export const generateSpellingChecksFromAI = async (topic: string, count: number): Promise<SpellingCheckData> => {
    const prompt = `
    '${topic}' konusuyla ilgili, Türkçede sıkça yanlış yazılan ${count} kelime bul.
    Her kelime için, doğru yazılışını ve 2 tane yanlış yazılmış varyasyonunu içeren 3 seçenekli bir liste oluştur. Seçeneklerin sırasını karıştır.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<SpellingCheckData>;
};

export const generateWordComparisonFromAI = async (topic: string): Promise<WordComparisonData> => {
  const prompt = `
    '${topic}' konusuyla ilgili, iki farklı kutu için 10'ar kelimelik iki liste oluştur. 
    Listelerdeki kelimelerin çoğu aynı olsun ama her listede 3-4 tane farklı kelime bulunsun.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
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
  return generateWithSchema(prompt, schema) as Promise<WordComparisonData>;
};

export const generateProverbFillFromAI = async (count: number): Promise<ProverbFillData> => {
  const prompt = `
    ${count} tane Türkçe atasözü seç. Her atasözünde bir kelimeyi eksik bırak.
    Atasözünün eksik kelimeden önceki ve sonraki kısımlarını ayrı ayrı ver.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
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
  return generateWithSchema(prompt, schema) as Promise<ProverbFillData>;
};

export const generateLetterBridgeFromAI = async (count: number): Promise<LetterBridgeData> => {
  const prompt = `
    'Harf Köprüsü' etkinliği için ${count} tane kelime çifti oluştur.
    Her çiftte, birinci kelimenin sonuna ve ikinci kelimenin başına aynı harf eklendiğinde anlamlı iki yeni kelime oluşmalıdır. 
    Örnek: (TARAF, İLMİK) -> A harfi -> (TARAFA, AİLMİK). Sen sadece 'TARAF' ve 'İLMİK' kısımlarını ver.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
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
  return generateWithSchema(prompt, schema) as Promise<LetterBridgeData>;
};

export const generateWordLadderFromAI = async (count: number): Promise<WordLadderData> => {
  const prompt = `
    'Kelime Merdiveni' etkinliği için ${count} tane bulmaca oluştur.
    Her bulmaca için 4 harfli bir başlangıç ve bitiş kelimesi seç. 
    İki kelime arasında en az 3 adım (değiştirilecek harf sayısı) olsun.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
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
  return generateWithSchema(prompt, schema) as Promise<WordLadderData>;
};

export const generateWordFormationFromAI = async (count: number): Promise<WordFormationData> => {
    const prompt = `
    'Harflerden Kelime Türetme' etkinliği için ${count} tane set oluştur.
    Her set için 7-8 tane rastgele harf ve 1-2 tane joker hakkı belirle.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<WordFormationData>;
};

export const generateReverseWordFromAI = async (topic: string, count: number): Promise<ReverseWordData> => {
    const prompt = `
    '${topic}' konusuyla ilgili ${count} tane Türkçe kelime seç.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            words: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'words']
    };
    return generateWithSchema(prompt, schema) as Promise<ReverseWordData>;
};

export const generateWordGroupingFromAI = async (topic: string, wordCount: number, categoryCount: number): Promise<WordGroupingData> => {
  const prompt = `
    '${topic}' konusuyla ilgili bir kelime gruplama etkinliği oluştur.
    ${categoryCount} tane kategori ismi belirle.
    Bu kategorilere ait toplam ${wordCount} tane kelimeyi karışık bir sırada listele.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      words: { type: Type.ARRAY, items: { type: Type.STRING } },
      categoryNames: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'words', 'categoryNames']
  };
  return generateWithSchema(prompt, schema) as Promise<WordGroupingData>;
};

export const generateMiniWordGridFromAI = async (): Promise<MiniWordGridData> => {
    const prompt = `Create a mini word grid puzzle. Generate 4 puzzles. Each puzzle is a 4x4 grid with a single 4-letter Turkish word hidden within. Specify the starting cell (row, col) of the word. The rest of the cells are filled with random letters.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
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
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                        start: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] }
                    },
                    required: ["grid", "start"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<MiniWordGridData>;
};

export const generatePasswordFinderFromAI = async (): Promise<PasswordFinderData> => {
    const prompt = `Create a "Password Finder" activity. Provide a list of 12 Turkish words. Some of them must be proper nouns that should be capitalized. The user must identify these. The first letter of each proper noun forms a secret password.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    // FIX: Added missing return statement.
    return generateWithSchema(prompt, schema) as Promise<PasswordFinderData>;
};

// FIX: Added missing generator functions.
export const generateSyllableCompletionFromAI = async (topic: string): Promise<SyllableCompletionData> => {
    const prompt = `Create a syllable completion activity with the theme '${topic}'. Provide a list of first and second parts of 8 Turkish words. Also provide a list of the missing syllables for the user to choose from. Finally, provide a prompt for the user to write a story using the completed words. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<SyllableCompletionData>;
};

export const generateSynonymWordSearchFromAI = async (): Promise<SynonymWordSearchData> => {
    const prompt = `Create a "Synonym Word Search" activity. Provide a list of 6 Turkish words to match. Create a 12x12 grid and hide the synonyms of these words in it. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<SynonymWordSearchData>;
};

export const generateSpiralPuzzleFromAI = async (): Promise<SpiralPuzzleData> => {
    const prompt = `Create a Spiral Puzzle. Generate a 10x10 grid with a spiral path for words. Provide 6-8 clues for Turkish words that fit into the spiral. Also provide the starting coordinates for each word. The grid should contain the solution letters. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<SpiralPuzzleData>;
};

export const generateCrosswordFromAI = async (): Promise<CrosswordData> => {
    const prompt = `Create a 10x10 crossword puzzle. Generate about 5 across and 5 down clues for Turkish words. Provide the grid with solution letters and null for black cells. Also define a 5-6 letter password hidden in specific cells. Provide the password cell coordinates and the password length. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
                        direction: { type: Type.STRING },
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
    return generateWithSchema(prompt, schema) as Promise<CrosswordData>;
};

export const generateJumbledWordStoryFromAI = async (topic: string): Promise<JumbledWordStoryData> => {
    const prompt = `Create a jumbled word and story writing activity with the theme '${topic}'. Generate 6 puzzles, each with a jumbled Turkish word and its correct form. Then, provide a prompt for the user to write a story using these words. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<JumbledWordStoryData>;
};

export const generateHomonymSentenceFromAI = async (): Promise<HomonymSentenceData> => {
    const prompt = `Create a homonym (eş sesli) sentence writing activity. Provide 4 Turkish homonym words. For each word, provide a detailed English image generation prompt to visually represent one of its meanings. The user's task is to write two different sentences for each word. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<HomonymSentenceData>;
};

export const generateWordGridPuzzleFromAI = async (topic: string): Promise<WordGridPuzzleData> => {
    const prompt = `Create a word grid puzzle (like Word-Fill-In) with the theme '${topic}'. Create a 10x10 grid with some black cells (null). Provide a list of 8-10 Turkish words related to the theme to be placed in the grid. Provide a prompt about what to do with the one unused word. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<WordGridPuzzleData>;
};

export const generateHomonymImageMatchFromAI = async (): Promise<HomonymImageMatchData> => {
    const prompt = `Create a homonym image matching puzzle. Provide two homonym words (e.g., 'yüz'). For each meaning, provide an image (via a detailed English image generation prompt). Create two columns of images, left and right. The user must match the images with the same word but different meanings. Also include a simple word scramble at the bottom with one of the homonym words as the answer. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<HomonymImageMatchData>;
};

export const generateAntonymFlowerPuzzleFromAI = async (): Promise<AntonymFlowerPuzzleData> => {
    const prompt = `Create an antonym flower puzzle. Generate 4 puzzles. Each puzzle is a flower shape. The center of the flower has a Turkish word. The user must find the antonym. The petals contain letters, some of which are part of a hidden password. The letters in the petals should not spell out the antonym. Provide the password length.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
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
    return generateWithSchema(prompt, schema) as Promise<AntonymFlowerPuzzleData>;
};

export const generateSynonymAntonymGridFromAI = async (): Promise<SynonymAntonymGridData> => {
    const prompt = `Create a synonym/antonym grid puzzle. Provide 5 words. The user must find both the synonym and antonym for each. The answers are then placed into a 12x12 grid. Provide the list of words, their synonyms and antonyms, and the solution grid.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<SynonymAntonymGridData>;
};

export const generatePunctuationColoringFromAI = async (): Promise<PunctuationColoringData> => {
    const prompt = `Create a punctuation coloring activity. Provide 5 sentences, each missing a punctuation mark. For each sentence, provide a color and the correct punctuation mark. The user identifies the correct mark and colors a corresponding part of a picture. 
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<PunctuationColoringData>;
};

export const generateAntonymResfebeFromAI = async (): Promise<AntonymResfebeData> => {
    const prompt = `Create an Antonym Resfebe puzzle. Generate 3 puzzles. For each, create a Resfebe that solves to a Turkish word. Then, the user must write the antonym of that word. For image clues in the resfebe, provide a detailed English image generation prompt.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
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
                        word: { type: Type.STRING },
                        antonym: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        clues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
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
    return generateWithSchema(prompt, schema) as Promise<AntonymResfebeData>;
};


export const generateThematicWordSearchColorFromAI = async (topic: string): Promise<ThematicWordSearchColorData> => {
    const prompt = `Create a thematic word search and color activity. The theme is '${topic}'. Provide a list of 8-10 related Turkish words to find in a 12x12 grid. The user finds and colors the words.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<ThematicWordSearchColorData>;
};

export const generateProverbSentenceFinderFromAI = async (): Promise<ProverbSentenceFinderData> => {
    const prompt = `Create a proverb sentence finder activity, similar to ProverbWordChainData. Provide a word cloud of about 20 Turkish words that can form 3-4 proverbs or sayings. Also provide the full solutions. Assign a random hex color to each word.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<ProverbSentenceFinderData>;
};

export const generateSynonymAntonymColoringFromAI = async (): Promise<SynonymAntonymColoringData> => {
    const prompt = `Create a synonym/antonym coloring activity. Provide a color key with 4-5 items, where each item links a description (e.g., "Antonym of 'Cömert'") to a color. Then provide a list of words placed on a conceptual image, with their x/y coordinates. The user colors the words according to the key.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<SynonymAntonymColoringData>;
};

export const generatePunctuationSpiralPuzzleFromAI = async (): Promise<PunctuationSpiralPuzzleData> => {
    const prompt = `Create a Spiral Puzzle about punctuation and grammar. Generate a 10x10 grid with a spiral path. Provide 6-8 clues related to Turkish grammar and punctuation rules. The answers are words that fit into the spiral. Also provide the starting coordinates for each word.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<PunctuationSpiralPuzzleData>;
};

export const generateThematicJumbledWordStoryFromAI = async (topic: string): Promise<ThematicJumbledWordStoryData> => {
    const prompt = `Create a thematic jumbled word and story writing activity. The theme is '${topic}'. Generate 6 jumbled words related to the theme and their correct forms. Then provide a prompt for the user to write a story using these words.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<ThematicJumbledWordStoryData>;
};

export const generateSynonymMatchingPatternFromAI = async (topic: string): Promise<SynonymMatchingPatternData> => {
    const prompt = `Create a synonym matching pattern activity with the theme '${topic}'. Provide 6 pairs of Turkish words and their synonyms. The user must match them.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<SynonymMatchingPatternData>;
};

export const generateMissingPartsFromAI = async (): Promise<MissingPartsData> => {
    const prompt = `Create a "Missing Parts" word puzzle. Provide two columns of 8 word parts each (e.g., 'bilgi' and 'sayar'). The user must match them to form complete words. Also, provide 3 examples of complete words with their parts shown.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<MissingPartsData>;
};

export const generateWordWebFromAI = async (): Promise<WordWebData> => {
    const prompt = `Create a Word Web puzzle (similar to Word Grid Puzzle). Provide a 10x10 grid with black cells (null). Provide a list of 8-10 Turkish words to be placed in the grid. Also provide a prompt for a keyword that is revealed after filling the grid.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<WordWebData>;
};

export const generateImageAnagramSortFromAI = async (): Promise<ImageAnagramSortData> => {
    const prompt = `Create an "Image Anagram Sort" activity. Generate 6 cards. Each card has a scrambled word, its correct word, a description, and a detailed English image generation prompt. The user sorts the cards alphabetically by the correct word.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<ImageAnagramSortData>;
};

export const generateAnagramImageMatchFromAI = async (): Promise<AnagramImageMatchData> => {
    const prompt = `Create an "Anagram Image Match" puzzle. Provide a word bank of 8 Turkish words. Then, create 4 puzzles. Each puzzle has an image (with description and prompt), a partial answer with some letters filled in, and the correct word which is an anagram of one of the words in the word bank.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<AnagramImageMatchData>;
};

export const generateSyllableWordSearchFromAI = async (): Promise<SyllableWordSearchData> => {
    const prompt = `Create a "Syllable Word Search" activity. Provide a list of 10 syllables. Then, provide 5 word creation puzzles where the user combines two given syllables to form a word. The 5 created words should then be found in a 12x12 word search grid. Finally, provide a prompt for a hidden password in the grid.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<SyllableWordSearchData>;
};

export const generateWordSearchWithPasswordFromAI = async (): Promise<WordSearchWithPasswordData> => {
    const prompt = `Create a 12x12 Word Search with a hidden password. Provide 8 Turkish words to find. Provide the coordinates of the cells that contain the letters of a 5-6 letter password.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<WordSearchWithPasswordData>;
};

export const generateWordWebWithPasswordFromAI = async (): Promise<WordWebWithPasswordData> => {
    const prompt = `Create a Word Web puzzle with a password. This is similar to a Word-Fill-In puzzle. Provide a 10x10 grid with black cells. Provide a list of 8-10 Turkish words to be placed in the grid. Specify a column index where the letters will form a password.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<WordWebWithPasswordData>;
};

export const generateLetterGridWordFindFromAI = async (): Promise<LetterGridWordFindData> => {
    const prompt = `Create a "Letter Grid Word Find" activity. Generate a 12x12 grid with hidden Turkish words. Provide a list of 8 words to find. Also provide a prompt for the user to write something using the found words.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<LetterGridWordFindData>;
};

export const generateWordPlacementPuzzleFromAI = async (): Promise<WordPlacementPuzzleData> => {
    const prompt = `Create a Word Placement Puzzle (Kriss Kross). Provide a 10x10 grid with black cells. Provide groups of words sorted by their length (e.g., 3-letter words, 4-letter words). The user places these words into the grid. Also provide a prompt for what to do with the one word that doesn't fit.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<WordPlacementPuzzleData>;
};

export const generatePositionalAnagramFromAI = async (): Promise<PositionalAnagramData> => {
    const prompt = `Create a "Positional Anagram" puzzle. Generate 6 puzzles. Each puzzle has a scrambled word where some letters are in numbered positions. The user must use the letters from the numbered positions to form a new word (the answer).
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Format as JSON.`;
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
                        scrambled: { type: Type.STRING },
                        answer: { type: Type.STRING }
                    },
                    required: ["id", "scrambled", "answer"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<PositionalAnagramData>;
};


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


// FIX: Update the generator to include a title, matching the updated WordSearchData interface.
export const generateWordSearchFromAI = async (topic: string, gridSize: number, wordCount: number): Promise<WordSearchData> => {
  const prompt = `
    ${topic} konusuyla ilgili ${wordCount} tane Türkçe kelime oluştur. 
    Bu kelimeleri ${gridSize}x${gridSize} boyutunda bir harf bulmacasına yerleştir. 
    Kelimeler yatay, dikey ve çapraz olarak yerleştirilebilir. 
    Boş kalan yerleri rastgele Türkçe harflerle doldur.
    Bulmaca için '${topic}' konusuyla ilgili bir başlık (title) oluştur.
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
    const prompt = `Create a mini word grid puzzle. Generate 4 puzzles. Each puzzle is a 4x4 grid with a single 4-letter Turkish word hidden within. Specify the starting cell (row, col) of the word. The rest of the cells are filled with random letters. Format as JSON.`;
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
    const prompt = `Create a "Password Finder" activity. Provide a list of 10 Turkish words. Some should be proper nouns that require a capital letter, others not. Identify which letter from the proper nouns will form a password. Specify the password length. Format as JSON.`;
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
    return generateWithSchema(prompt, schema) as Promise<PasswordFinderData>;
};

export const generateSyllableCompletionFromAI = async (topic: string): Promise<SyllableCompletionData> => {
    const prompt = `Create a syllable completion activity with the theme '${topic}'. Provide 5 Turkish words, split into two parts. Provide a list of 10 syllables, including the 5 correct missing ones and 5 distractors. Also provide a prompt for the user to write a story using the completed words. Format as JSON.`;
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
    const prompt = `Create a synonym word search puzzle. Provide a list of 8 Turkish words and their synonyms. Create a 12x12 grid and hide the synonyms within it. The user must find the synonyms. Format as JSON.`;
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
    const prompt = `Create a spiral puzzle. Generate a 10x10 grid with letters forming a spiral of words. Provide 6-8 clues for the words hidden in the spiral. Also provide the starting coordinates (row, col) and ID for each word. Format as JSON.`;
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
    const prompt = `
    "Hayvanlar" temalı, çocuklar için basit bir 10x10'luk Türkçe çapraz bulmaca oluştur.
    1. Hayvan isimlerinden oluşan, birbiriyle kesişen kelimelerle 10x10'luk bir ızgara oluştur. Boş (siyah) kareler için null, harf olan kareler için büyük harf kullan.
    2. Izgaradaki tüm "soldan sağa" (across) ve "yukarıdan aşağıya" (down) kelimelerini belirle.
    3. Bu kelimeler için basit ve anlaşılır ipuçları oluştur.
    4. Her ipucu için şunları sağla:
        - Benzersiz bir numara (id).
        - Yön ('across' veya 'down').
        - İpucu metni (text).
        - Kelimenin başlangıç koordinatları (start: {row, col}), 0-indeksli.
        - Cevap kelimesi (word).
    5. Kelimelerin içindeki bazı harf hücrelerini "şifre hücresi" olarak belirle ve koordinatlarını ver.
    6. Toplam şifre uzunluğunu belirt.
    7. Etkinlik için bir başlık (title) ve bir talimat metni (prompt) oluştur.
    Tüm çıktıyı, sağlanan şemaya göre JSON formatında döndür.`;
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
                        start: {
                            type: Type.OBJECT,
                            properties: {
                                row: { type: Type.INTEGER },
                                col: { type: Type.INTEGER }
                            },
                            required: ["row", "col"]
                        },
                        word: { type: Type.STRING }
                    },
                    required: ["id", "direction", "text", "start", "word"]
                }
            },
            passwordCells: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        row: { type: Type.INTEGER },
                        col: { type: Type.INTEGER }
                    },
                    required: ["row", "col"]
                }
            },
            passwordLength: { type: Type.INTEGER }
        },
        required: ["title", "prompt", "grid", "clues", "passwordCells", "passwordLength"]
    };
    return generateWithSchema(prompt, schema) as Promise<CrosswordData>;
};

export const generateJumbledWordStoryFromAI = async (topic: string): Promise<JumbledWordStoryData> => {
    const prompt = `Create a "Jumbled Word Story" activity with the theme '${topic}'. Provide 5 jumbled Turkish words related to the theme. Also provide the correct word for each. Finally, provide a prompt for the user to write a story using these words. Format as JSON.`;
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
    const prompt = `Create a homonym (eş sesli) sentence writing activity. Provide 4 Turkish homonym words. For each word, generate a detailed English image generation prompt for a simple image representing one of its meanings. The user will write two sentences for each word. Format as JSON.`;
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
                        imagePrompt: { type: Type.STRING, description: "A detailed English prompt for an image generation model." }
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
    const prompt = `Create a word grid puzzle with the theme '${topic}'. Provide a list of 8 Turkish words. Create a 10x10 grid and place 7 of these words in it (horizontally or vertically). The remaining word is the one the user needs to find. Use 'null' for empty, unusable cells. Format as JSON.`;
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
    const prompt = `Create a homonym image matching puzzle. Provide 3 Turkish homonym words. For each word, provide two different detailed English image generation prompts, one for each meaning. These will be separated into left and right columns. Also, provide a scrambled word puzzle using one of the homonyms. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            leftImages: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, word: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["id", "word", "imagePrompt"]
                }
            },
            rightImages: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, word: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["id", "word", "imagePrompt"]
                }
            },
            wordScramble: {
                type: Type.OBJECT, properties: { letters: { type: Type.ARRAY, items: { type: Type.STRING } }, word: { type: Type.STRING } }, required: ["letters", "word"]
            }
        },
        required: ["title", "prompt", "leftImages", "rightImages", "wordScramble"]
    };
    return generateWithSchema(prompt, schema) as Promise<HomonymImageMatchData>;
};

export const generateAntonymFlowerPuzzleFromAI = async (): Promise<AntonymFlowerPuzzleData> => {
    const prompt = `Create an antonym flower puzzle. Generate 4 puzzles. Each puzzle has a center word. The user needs to find its antonym. Provide the antonym's letters mixed with distractor letters for the flower petals. The first letters of the antonyms will form a password. Specify the password length. Format as JSON.`;
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
    const prompt = `Create a synonym/antonym grid puzzle. Provide a list of 4 Turkish words for which to find antonyms, and another 4 for which to find synonyms. Create a 10x10 grid and hide all 8 antonyms and synonyms in it. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            antonyms: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING } }, required: ["word"] } },
            synonyms: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING } }, required: ["word"] } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
        },
        required: ["title", "prompt", "antonyms", "synonyms", "grid"]
    };
    return generateWithSchema(prompt, schema) as Promise<SynonymAntonymGridData>;
};

export const generatePunctuationColoringFromAI = async (): Promise<PunctuationColoringData> => {
    const prompt = `Create a punctuation coloring activity. Provide 5 Turkish sentences, each missing a punctuation mark at the end (., ?, !). For each sentence, provide a color and the correct punctuation mark. The user will color a picture based on the correct mark. Format as JSON.`;
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

export const generateAntonymResfebeFromAI = async(): Promise<AntonymResfebeData> => {
    const prompt = `Create an antonym Resfebe puzzle. Generate 3 puzzles.
For each puzzle, provide:
1. A Turkish word and its antonym.
2. A list of clues to form the Resfebe for the *original* word. One of the clues must be an image.
   - For text clues, provide an object with \`type: 'text'\` and \`value: 'clue text'\`.
   - For the image clue, provide an object with \`type: 'image'\` and \`value: ''\` (an empty string as a placeholder).
3. A separate, simple, detailed English image generation prompt in a top-level \`imagePrompt\` field for that puzzle. This prompt corresponds to the image clue.
The user solves the Resfebe, finds the word, and then writes its antonym.
Format the output as a single JSON object.`;
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
                    required: ["word", "antonym", "imagePrompt", "clues"]
                }
            },
            antonymsPrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "puzzles", "antonymsPrompt"]
    };
    return generateWithSchema(prompt, schema) as Promise<AntonymResfebeData>;
}

export const generateThematicWordSearchColorFromAI = async(topic: string): Promise<ThematicWordSearchColorData> => {
    const prompt = `Create a thematic word search with the theme '${topic}'. Generate a list of 10 Turkish words related to the theme. Create a 12x12 grid and hide these words. The user should find and color the words. Format as JSON.`;
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
}

export const generateProverbSentenceFinderFromAI = async(): Promise<ProverbSentenceFinderData> => {
    const prompt = `Create a proverb sentence finder activity, similar to ProverbWordChainData. Provide a word cloud of about 20 Turkish words that can form 3-4 proverbs. Provide the solutions. Assign a random hex color to each word. The user should color the words of each proverb with the same color. Format as JSON.`;
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
}

export const generatePunctuationSpiralPuzzleFromAI = async(): Promise<PunctuationSpiralPuzzleData> => {
    const prompt = `Create a spiral puzzle about punctuation, similar to the regular SpiralPuzzleData. Generate a 10x10 grid with a spiral of words. Provide 6-8 clues for these words, where the clues are about Turkish grammar and punctuation rules. Also provide the starting coordinates (row, col) and ID for each word. Format as JSON.`;
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
}

export const generateSynonymAntonymColoringFromAI = async(): Promise<SynonymAntonymColoringData> => {
    const prompt = `Create a synonym/antonym coloring activity. Provide a color key with 4 instructions, like "Find the antonym of 'Cömert' and color it red". Then, provide a list of words scattered on an image area, each with its x,y coordinates (percentages). The list should contain the target words (e.g., 'Cimri'). The user colors the words according to the key. Format as JSON.`;
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
}

export const generateThematicJumbledWordStoryFromAI = async(topic: string): Promise<ThematicJumbledWordStoryData> => {
    const prompt = `Create a "Thematic Jumbled Word Story" activity with the theme '${topic}'. Provide 5 jumbled Turkish words related to the theme, along with their correct forms. Then, provide a prompt for the user to write a short text using these words. Format as JSON.`;
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
}

export const generateSynonymMatchingPatternFromAI = async(topic: string): Promise<SynonymMatchingPatternData> => {
    const prompt = `Create a "Synonym Matching Pattern" activity with the theme '${topic}'. Provide 6 pairs of Turkish synonyms. The user's goal is to match them. This is a visual matching/connection activity. Format as JSON.`;
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
}

export const generateMissingPartsFromAI = async(): Promise<MissingPartsData> => {
    const prompt = `Create a "Missing Parts" word puzzle. Provide two columns (left and right) of word parts. Also provide a list of complete words, showing which parts they are made of. The user matches the parts from the columns to form words. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            leftParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, text: { type: Type.STRING } }, required: ["id", "text"] } },
            rightParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, text: { type: Type.STRING } }, required: ["id", "text"] } },
            givenParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, parts: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["word", "parts"] } }
        },
        required: ["title", "prompt", "leftParts", "rightParts", "givenParts"]
    };
    return generateWithSchema(prompt, schema) as Promise<MissingPartsData>;
}

export const generateWordWebFromAI = async(): Promise<WordWebData> => {
    const prompt = `Create a Word Web puzzle. Provide a list of 8 related Turkish words to find. Provide a 12x12 grid with letters, where the words are interconnected like a crossword. One central word is the key. Use null for black cells. Provide a prompt for the key word. Format as JSON.`;
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
}

export const generateSyllableWordSearchFromAI = async(): Promise<SyllableWordSearchData> => {
    const prompt = `Create a syllable word search. Provide a list of syllables. The user combines them to form words, then finds those words in a word search grid. Provide the syllables, the word combinations, the final words to find, and the grid. Also include a prompt for a hidden password in the grid. Format as JSON.`;
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
}

export const generateWordSearchWithPasswordFromAI = async(): Promise<WordSearchWithPasswordData> => {
    const prompt = `Create a word search with a hidden password. Provide a 12x12 grid, a list of 10 words to find, and the coordinates of the cells that form the password when read in order. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
            passwordCells: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        row: { type: Type.INTEGER },
                        col: { type: Type.INTEGER }
                    },
                    required: ["row", "col"]
                }
            }
        },
        required: ["title", "prompt", "grid", "words", "passwordCells"]
    };
    return generateWithSchema(prompt, schema) as Promise<WordSearchWithPasswordData>;
}

export const generateWordWebWithPasswordFromAI = async(): Promise<WordWebWithPasswordData> => {
    const prompt = `Create a Word Web puzzle with a password. This is similar to a crossword. Provide a list of 10 words and a 12x12 grid where they are placed. One column should be specially marked to reveal a password. Provide the password column index. Use null for black cells. Format as JSON.`;
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
}

export const generateLetterGridWordFindFromAI = async(): Promise<LetterGridWordFindData> => {
    const prompt = `Create a letter grid word find activity. Provide a list of 8 hidden words and a 12x12 grid containing them. Also, provide a writing prompt for the user to use the words they found. Format as JSON.`;
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
}

export const generateWordPlacementPuzzleFromAI = async(): Promise<WordPlacementPuzzleData> => {
    const prompt = `Create a word placement puzzle. Provide an empty 10x10 crossword-style grid (null for black cells). Provide groups of words sorted by length (e.g., 3-letter words, 4-letter words). One word will be left over. Provide a prompt for what to do with the unused word. Format as JSON.`;
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
}

export const generatePositionalAnagramFromAI = async(): Promise<PositionalAnagramData> => {
    const prompt = `Create a positional anagram puzzle. Generate 8 puzzles. Each puzzle has a scrambled word where letters in numbered positions need to be moved to solve it. Provide the scrambled word and the correct answer for each. Format as JSON.`;
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
}

export const generateImageAnagramSortFromAI = async(): Promise<ImageAnagramSortData> => {
    const prompt = `Create an image anagram sorting puzzle. Generate 6 cards. Each card has an image description, a detailed English image generation prompt, a scrambled word, and the correct word. The user has to unscramble the words and sort the cards alphabetically. Format as JSON.`;
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
}

export const generateAnagramImageMatchFromAI = async(): Promise<AnagramImageMatchData> => {
    const prompt = `Create an anagram-image matching puzzle. Provide a word bank of 6 correct words. Generate 6 puzzles. Each puzzle has an image description, a detailed English image generation prompt, a partially filled answer (like hangman), and the correct word (which is in the word bank). Format as JSON.`;
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
}

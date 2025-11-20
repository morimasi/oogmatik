
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    WordSearchData, WordSearchWithPasswordData, ProverbSearchData, LetterGridWordFindData, ThematicWordSearchColorData,
    SynonymWordSearchData, SynonymSearchAndStoryData, AnagramsData, SpellingCheckData, LetterBridgeData, WordLadderData,
    WordFormationData, ReverseWordData, WordGroupingData, MiniWordGridData, PasswordFinderData, SyllableCompletionData,
    SpiralPuzzleData, PunctuationSpiralPuzzleData, CrosswordData, CrosswordClue, JumbledWordStoryData, ThematicJumbledWordStoryData, HomonymSentenceData,
    WordGridPuzzleData, HomonymImageMatchData, AntonymFlowerPuzzleData, SynonymAntonymGridData, AntonymResfebeData,
    SynonymMatchingPatternData, MissingPartsData, WordWebData, SyllableWordSearchData, WordWebWithPasswordData,
    WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, ResfebeData, ResfebeClue
} from '../../types';
import { GridComponent, ImageDisplay, PedagogicalHeader } from './common';

// ... Existing exports for WordSearch, Anagram, SpellingCheck, WordComparison, LetterBridge, WordLadder, WordFormation, ReverseWord, WordGrouping, MiniWordGrid, PasswordFinder, SyllableCompletion, SynonymWordSearch, SpiralPuzzle, Crossword ...
// (Retaining the robust implementations from previous steps and replacing the stubs below)

export const generateWordSearchFromAI = async (options: GeneratorOptions): Promise<WordSearchData[]> => {
  const { topic, itemCount, difficulty, worksheetCount, gridSize, directions, case: letterCase } = options;
  
  let rules = "Kelimeler sadece soldan sağa ve yukarıdan aşağıya.";
  if (directions === 'diagonal') rules = "Kelimeler yatay, dikey ve çapraz olabilir.";
  if (directions === 'all') rules = "Kelimeler her yöne (ters dahil) yerleştirilebilir.";

  const finalGridSize = gridSize || (difficulty === 'Orta' ? 12 : 10);
  const caseInstruction = letterCase === 'lower' ? "Tüm harfler küçük harf olmalı." : "Tüm harfler BÜYÜK HARF olmalı.";

  const prompt = `
    "${difficulty}" zorluk seviyesine uygun, ${topic} konusuyla ilgili ${itemCount} tane Türkçe kelime seç.
    Bu kelimeleri ${finalGridSize}x${finalGridSize} boyutunda bir harf bulmacasına yerleştir. 
    YERLEŞTİRME KURALLARI: ${rules}
    ${caseInstruction}
    Boş kalan yerleri rastgele Türkçe harflerle doldur. Ancak bu rastgele harflerin arasına, yukarıdan aşağıya okunduğunda konuyla ilgili kısa bir GİZLİ MESAJ veya bilmece yerleştir.
    Bulmaca için '${topic}' konusuyla ilgili yaratıcı bir başlık (title) oluştur.
    Etkinlik sonunda çözümü pekiştirmek için konuyla ilgili bir ek soru (followUpQuestion) oluştur.
    
    PEDAGOGICAL NOTE: "Görsel tarama, şekil-zemin algısı ve seçici dikkat becerilerini destekler."
    INSTRUCTION: "Listelenen kelimeleri tablonun içinde bul ve renkli kalemle işaretle."

    ÖNEMLİ: Her çalıştırmada tamamen FARKLI kelimeler kullan.
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
      words: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      hiddenMessage: { type: Type.STRING },
      followUpQuestion: { type: Type.STRING },
    },
    required: ['title', 'instruction', 'grid', 'words', 'hiddenMessage', 'followUpQuestion', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordSearchData[]>;
};

export const generateAnagramFromAI = async (options: GeneratorOptions): Promise<AnagramsData[]> => {
  const { topic, itemCount, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun, '${topic}' konusuyla ilgili ${itemCount} tane Türkçe kelime seç.
    Her kelimenin harflerini karıştırarak anagramını oluştur.
    Her kelime için, kelimenin ne olduğunu ima eden, **İngilizce**, fotoğraf gerçekliğinde (photorealistic), yüksek kaliteli ve detaylı bir 'imagePrompt' üret (high resolution, sharp focus, 8k, cinematic lighting).
    Tüm anagramlar çözüldükten sonra, çocukların bu kelimelerden en az üçünü kullanarak yaratıcı bir cümle yazmaları için bir yönlendirme metni ('sentencePrompt') oluştur.
    PEDAGOGICAL NOTE: "Fonolojik farkındalık, harf dizilimi belleği ve kelime türetme becerisi."
    INSTRUCTION: "Karışık harfleri doğru sıraya dizerek gizli kelimeyi bul."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
  `;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        prompt: { type: Type.STRING },
        instruction: { type: Type.STRING },
        pedagogicalNote: { type: Type.STRING },
        anagrams: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              scrambled: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
            },
            required: ['word', 'scrambled', 'imagePrompt']
          }
        },
        sentencePrompt: { type: Type.STRING },
      },
      required: ['title', 'prompt', 'anagrams', 'sentencePrompt', 'instruction', 'pedagogicalNote']
    }
  };
   return generateWithSchema(prompt, schema) as Promise<AnagramsData[]>;
};

export const generateSpellingCheckFromAI = async (options: GeneratorOptions): Promise<SpellingCheckData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun, Türkçede sıkça yanlış yazılan ${itemCount} kelime bul.
    Her kelime için:
    1. Doğru yazılışını ve 2 tane yaygın yapılan yanlış varyasyonunu içeren 3 seçenekli bir liste oluştur.
    2. Doğru kelimeyi görselleştiren, **İngilizce**, fotoğraf gerçekliğinde (photorealistic), yüksek kaliteli ve gerçekçi bir 'imagePrompt' oluştur (realistic object, detailed, 8k resolution).
    PEDAGOGICAL NOTE: "Görsel sözcük belleği (ortografik farkındalık) ve dikkat."
    INSTRUCTION: "Seçeneklerden yazımı doğru olan kelimeyi bul ve işaretle."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            checks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        correct: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ['correct', 'options', 'imagePrompt']
                },
            },
        },
        required: ['title', 'checks', 'instruction', 'pedagogicalNote']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SpellingCheckData[]>;
};

export const generateLetterBridgeFromAI = async (options: GeneratorOptions): Promise<LetterBridgeData[]> => {
  const { itemCount, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'Harf Köprüsü' etkinliği için ${itemCount} tane kelime çifti oluştur.
    Kelimeler öyle seçilmeli ki, birinci kelimenin sonuna ve ikinci kelimenin başına aynı harf eklendiğinde iki yeni anlamlı kelime oluşsun (örn: BA_A -> BALA, T_A -> TARA).
    PEDAGOGICAL NOTE: "Kelime sonu ve başı ses farkındalığı, türetimsel düşünme."
    INSTRUCTION: "Ortadaki boşluğa bir harf yazarak her iki kelimeyi de tamamla."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
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
      },
      followUpPrompt: { type: Type.STRING }
    },
    required: ['title', 'pairs', 'followUpPrompt', 'instruction', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<LetterBridgeData[]>;
};

export const generateWordLadderFromAI = async (options: GeneratorOptions): Promise<WordLadderData[]> => {
    const { difficulty, worksheetCount, steps, itemCount, topic } = options;
    const prompt = `
    '${topic}' konusunda ve "${difficulty}" zorluk seviyesine uygun bir Kelime Merdiveni bulmacası oluştur.
    ${itemCount} tane bulmaca hazırla. Her bulmaca için, aynı harf sayısına sahip, tematik olarak ilişkili bir başlangıç ve bitiş kelimesi bul (örn: KIŞ -> YAZ).
    Dönüşüm ideal olarak ${steps || 3} adımda gerçekleşmelidir.
    PEDAGOGICAL NOTE: "Ses-harf ilişkisi (fonem manipülasyonu) ve kelime analizi."
    INSTRUCTION: "Her basamakta sadece bir harfi değiştirerek hedefe ulaş."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: {type: Type.STRING},
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                theme: {type: Type.STRING},
                ladders: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            startWord: {type: Type.STRING},
                            endWord: {type: Type.STRING},
                            steps: {type: Type.INTEGER}
                        },
                        required: ['startWord', 'endWord', 'steps']
                    }
                }
            },
            required: ['title', 'theme', 'ladders', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<WordLadderData[]>;
};

export const generateWordFormationFromAI = async (options: GeneratorOptions): Promise<WordFormationData[]> => {
    const {itemCount, difficulty, worksheetCount} = options;
    const prompt = `
    "${difficulty}" seviyesine uygun 'Harflerden Kelime Türetme' etkinliği oluştur. ${itemCount} set hazırla.
    Her set için, harfleri karıştırılmış bir ana kelime seç.
    PEDAGOGICAL NOTE: "Anagram çözme, kelime dağarcığı aktivasyonu ve kombinasyonel düşünme."
    INSTRUCTION: "Verilen harfleri kullanarak anlamlı kelimeler türet."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                sets: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            letters: { type: Type.ARRAY, items: { type: Type.STRING } },
                            jokerCount: { type: Type.INTEGER }
                        }, required: ['letters', 'jokerCount']
                    }
                },
                mysteryWordChallenge: {
                    type: Type.OBJECT, properties: {
                        prompt: { type: Type.STRING },
                        solution: { type: Type.STRING }
                    }, required: ['prompt', 'solution']
                }
            }, required: ['title', 'sets', 'mysteryWordChallenge', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<WordFormationData[]>;
};

export const generateReverseWordFromAI = async (options: GeneratorOptions): Promise<ReverseWordData[]> => {
    const {itemCount, difficulty, worksheetCount} = options;
    const prompt = `
    "${difficulty}" seviyesine uygun 'Ters Oku' etkinliği oluştur. ${itemCount} tane kelime seç.
    PEDAGOGICAL NOTE: "Görsel işlemleme hızı, harf sırası farkındalığı ve ortografik kod çözme."
    INSTRUCTION: "Kelimeleri tersten oku ve yanındaki boşluğa doğrusunu yaz."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                words: { type: Type.ARRAY, items: { type: Type.STRING } },
                funFact: { type: Type.STRING }
            }, required: ['title', 'words', 'funFact', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<ReverseWordData[]>;
};

export const generateWordGroupingFromAI = async (options: GeneratorOptions): Promise<WordGroupingData[]> => {
    const {itemCount, difficulty, worksheetCount, categoryCount, topic} = options;
    const prompt = `
    '${topic}' temalı ve "${difficulty}" seviyesinde bir "Kelime Gruplama" etkinliği oluştur.
    ${categoryCount} tane anlamlı kategori oluştur.
    Her kelime için bir 'text' (kelimenin kendisi) ve onu görselleştiren **İngilizce**, fotoğraf gerçekliğinde (photorealistic), yüksek kaliteli ve gerçekçi bir 'imagePrompt' üret.
    PEDAGOGICAL NOTE: "Semantik kategorizasyon, kavramsal düşünme ve görsel ilişkilendirme."
    INSTRUCTION: "Her bir kelimeyi/resmi anlamına uygun olan kategori kutusuna yerleştir."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                words: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['text', 'imagePrompt']
                    }
                },
                categoryNames: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'words', 'categoryNames', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<WordGroupingData[]>;
};

export const generateMiniWordGridFromAI = async (options: GeneratorOptions): Promise<MiniWordGridData[]> => {
    const { difficulty, worksheetCount, topic } = options;
    const prompt = `
    Create ${worksheetCount} unique 'Mini Word Grid' puzzles about '${topic}' at "${difficulty}" level. 
    Each puzzle should be a small grid (e.g., 3x3 or 4x4) containing a hidden word starting at a specific cell ('start'). 
    The user traces the word (snake-like movement).
    PEDAGOGICAL NOTE: "Görsel takip, harf sıralaması ve parça-bütün ilişkisi."
    INSTRUCTION: "Başlangıç karesinden başlayarak bitişik harfleri takip et ve gizli kelimeyi bul."
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                prompt: { type: Type.STRING },
                puzzles: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                            start: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ['row', 'col'] }
                        }, required: ['grid', 'start']
                    }
                }
            }, required: ['title', 'instruction', 'pedagogicalNote', 'prompt', 'puzzles']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<MiniWordGridData[]>;
};

export const generatePasswordFinderFromAI = async (options: GeneratorOptions): Promise<PasswordFinderData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    Create ${worksheetCount} 'Password Finder' worksheets about '${topic}' at "${difficulty}" level.
    List ${itemCount} words. For each word, specify one letter (e.g., the first letter, or a letter at index 2) that is part of a secret password.
    PEDAGOGICAL NOTE: "Sıralı işlem, harf konumu farkındalığı ve şifre çözme."
    INSTRUCTION: "Her kelimenin belirtilen harfini alarak aşağıdaki şifre kutularını doldur."
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                prompt: { type: Type.STRING },
                words: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            word: { type: Type.STRING },
                            passwordLetter: { type: Type.STRING },
                            isProperNoun: { type: Type.BOOLEAN }
                        }, required: ['word', 'passwordLetter', 'isProperNoun']
                    }
                },
                passwordLength: { type: Type.INTEGER }
            }, required: ['title', 'instruction', 'pedagogicalNote', 'prompt', 'words', 'passwordLength']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<PasswordFinderData[]>;
};

export const generateSyllableCompletionFromAI = async (options: GeneratorOptions): Promise<SyllableCompletionData[]> => {
    const {itemCount, difficulty, worksheetCount, theme} = options;
    const prompt = `
    '${theme}' temalı ve "${difficulty}" seviyesine uygun 'Hece Tamamlama' etkinliği oluştur.
    ${itemCount} tane kelimeyi hecelerine ayır (ilk hece ve geri kalanı).
    Bu kelimelerin sığacağı, içinde boşluklar bulunan kısa ve anlamlı bir hikaye şablonu ('storyTemplate') oluştur. Boşlukları __WORD__ şeklinde belirt.
    PEDAGOGICAL NOTE: "Hece farkındalığı ve parça-bütün ilişkisi."
    INSTRUCTION: "İlk hecesi verilen kelimeleri kutudaki hecelerle tamamla."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING }, prompt: { type: Type.STRING }, theme: { type: Type.STRING },
                instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING },
                wordParts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { first: { type: Type.STRING }, second: { type: Type.STRING } }, required: ['first', 'second'] } },
                syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
                storyTemplate: { type: Type.STRING },
                storyPrompt: { type: Type.STRING, description: "Alternative prompt if template is not used." }
            }, required: ['title', 'prompt', 'theme', 'wordParts', 'syllables', 'storyTemplate', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<SyllableCompletionData[]>;
};

export const generateSynonymWordSearchFromAI = async (options: GeneratorOptions): Promise<SynonymWordSearchData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    Create a 'Synonym Word Search' puzzle about '${topic}' at "${difficulty}" level.
    List words and ask the user to find their synonyms in the grid.
    PEDAGOGICAL NOTE: "Eş anlamlı kelime bilgisi ve görsel tarama."
    INSTRUCTION: "Listedeki kelimelerin eş anlamlılarını bulmacada bul."
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING }, prompt: { type: Type.STRING },
                instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING },
                wordsToMatch: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, synonym: { type: Type.STRING } }, required: ['word', 'synonym'] } },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
            }, required: ['title', 'prompt', 'instruction', 'pedagogicalNote', 'wordsToMatch', 'grid']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<SynonymWordSearchData[]>;
};

export const generateSpiralPuzzleFromAI = async (options: GeneratorOptions): Promise<SpiralPuzzleData[]> => {
    const {itemCount, difficulty, worksheetCount, topic, gridSize} = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesine uygun ${gridSize}x${gridSize} boyutunda bir 'Sarmal Bulmaca' oluştur.
    ${itemCount} tane kelime ve bu kelimeler için ipuçları hazırla. Kelimeleri sarmal şekilde ızgaraya yerleştir.
    PEDAGOGICAL NOTE: "Görsel takip, yön algısı ve kelime bilgisi."
    INSTRUCTION: "İpuçlarını çöz ve kelimeleri dışarıdan içeriye doğru sarmal olarak yaz."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING }, prompt: { type: Type.STRING }, theme: { type: Type.STRING },
                instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING },
                clues: { type: Type.ARRAY, items: { type: Type.STRING } },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                wordStarts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ['id', 'row', 'col'] } },
                passwordPrompt: { type: Type.STRING }
            }, required: ['title', 'prompt', 'theme', 'clues', 'grid', 'wordStarts', 'passwordPrompt', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<SpiralPuzzleData[]>;
};

export const generateCrosswordFromAI = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
    const {itemCount, difficulty, worksheetCount, topic, gridSize, passwordLength, clueType} = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesine uygun ${gridSize}x${gridSize} boyutunda bir 'Çapraz Bulmaca' oluştur.
    ${itemCount} tane kelime seç. Bu kelimeler için '${clueType}' türünde ipuçları hazırla. Bazı ipuçları için metin yerine görsel oluşturmak üzere **İngilizce**, fotoğraf gerçekliğinde (photorealistic), yüksek kaliteli bir 'imagePrompt' kullan (realistic object, detailed, 8k resolution).
    ${passwordLength} harfli bir şifre kelimesi belirle ve bu şifreyi oluşturan harflerin hücrelerini işaretle.
    PEDAGOGICAL NOTE: "Uzamsal organizasyon, kelime çağrışımı ve problem çözme."
    INSTRUCTION: "Soldan sağa ve yukarıdan aşağıya ipuçlarını takip ederek bulmacayı çöz."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING }, prompt: { type: Type.STRING }, theme: { type: Type.STRING },
                instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                clues: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            id: { type: Type.INTEGER }, direction: { type: Type.STRING, enum: ['across', 'down'] }, text: { type: Type.STRING },
                            start: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ['row', 'col'] },
                            word: { type: Type.STRING }, imagePrompt: { type: Type.STRING }
                        }, required: ['id', 'direction', 'text', 'start', 'word']
                    }
                },
                passwordCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ['row', 'col'] } },
                passwordLength: { type: Type.INTEGER },
                passwordPrompt: { type: Type.STRING }
            }, required: ['title', 'prompt', 'theme', 'grid', 'clues', 'passwordCells', 'passwordLength', 'passwordPrompt', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<CrosswordData[]>;
};

export const generateJumbledWordStoryFromAI = async (options: GeneratorOptions): Promise<JumbledWordStoryData[]> => {
    const { itemCount, difficulty, worksheetCount, theme } = options;
    const prompt = `Create a 'Jumbled Word Story' activity with theme '${theme}'. Pick ${itemCount} words, scramble them, and provide a creative writing prompt.
    PEDAGOGICAL NOTE: "Harf dizilimi farkındalığı ve yaratıcı yazma."
    INSTRUCTION: "Harfleri düzeltip kelimeleri bul, sonra bu kelimelerle bir hikaye yaz."`;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {jumbled: {type: Type.ARRAY, items: {type: Type.STRING}}, word: {type: Type.STRING}}, required: ['jumbled', 'word']}},
                storyPrompt: {type: Type.STRING}
            }, required: ['title', 'puzzles', 'storyPrompt', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<JumbledWordStoryData[]>;
};

export const generateWordGridPuzzleFromAI = async (options: GeneratorOptions): Promise<WordGridPuzzleData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `Create a 'Word Grid Puzzle' (like a crossword fill-in). List ${itemCount} words. Provide a grid where they fit together. 
    PEDAGOGICAL NOTE: "Uzamsal planlama ve kelime yerleştirme."
    INSTRUCTION: "Verilen kelimeleri uygun boşluklara yerleştir."`;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                wordList: {type: Type.ARRAY, items: {type: Type.STRING}},
                grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}},
                unusedWordPrompt: {type: Type.STRING}
            }, required: ['title', 'wordList', 'grid', 'unusedWordPrompt', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<WordGridPuzzleData[]>;
};

export const generateAntonymFlowerPuzzleFromAI = async (options: GeneratorOptions): Promise<AntonymFlowerPuzzleData[]> => {
    const { itemCount, difficulty, worksheetCount, passwordLength } = options;
    const prompt = `Create an 'Antonym Flower Puzzle'. Center word is given. Petals contain scrambled letters of its antonym.
    PEDAGOGICAL NOTE: "Zıt anlamlılar ve anagram çözme."
    INSTRUCTION: "Çiçeğin ortasındaki kelimenin zıt anlamlısını yapraklardaki harflerden bul."`;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {centerWord: {type: Type.STRING}, antonym: {type: Type.STRING}, petalLetters: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['centerWord', 'antonym', 'petalLetters']}},
                passwordLength: {type: Type.INTEGER}
            }, required: ['title', 'puzzles', 'passwordLength', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<AntonymFlowerPuzzleData[]>;
};

export const generateSynonymAntonymGridFromAI = async (options: GeneratorOptions): Promise<SynonymAntonymGridData[]> => {
    const {itemCount, difficulty, worksheetCount, gridSize} = options;
    const prompt = `
    "${difficulty}" seviyesine uygun bir 'Eş ve Zıt Anlamlı Kelime Izgarası' oluştur.
    ${Math.ceil(itemCount/2)} tane kelime ve eş anlamlısını, ${Math.floor(itemCount/2)} tane kelime ve zıt anlamlısını bul.
    Bu eş/zıt anlamlı kelimeleri ${gridSize}x${gridSize} boyutunda bir kelime avı bulmacasına gizle.
    Son olarak, bir kelime ve onun eş anlamlısı arasındaki ince anlam farkını sorgulayan bir 'nuanceQuestion' oluştur.
    PEDAGOGICAL NOTE: "Kelime anlam ilişkileri (semantik ağlar) ve kelime hazinesi."
    INSTRUCTION: "Listelenen kelimelerin eş veya zıt anlamlılarını bulmacada bul."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING }, prompt: { type: Type.STRING },
                instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING },
                antonyms: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING } }, required: ['word'] } },
                synonyms: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING } }, required: ['word'] } },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                nuanceQuestion: { type: Type.OBJECT, properties: { sentence: { type: Type.STRING }, word: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['sentence', 'word', 'options'] }
            }, required: ['title', 'prompt', 'antonyms', 'synonyms', 'grid', 'nuanceQuestion', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<SynonymAntonymGridData[]>;
};

export const generateAntonymResfebeFromAI = async (options: GeneratorOptions): Promise<AntonymResfebeData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `Create an antonym resfebe puzzle for difficulty level "${difficulty}". Generate ${itemCount} puzzles. For each puzzle, generate a Turkish word. Then, create creative visual/textual clues (resfebe) to represent that word. For image clues, provide a clear, **photorealistic, high quality, 8k resolution** English image generation prompt (realistic object, cinematic lighting). Then provide the antonym of the word.
    PEDAGOGICAL NOTE: "Görsel çağrışım ve zıt kavramları eşleştirme."
    INSTRUCTION: "Resfebe ipuçlarıyla kelimeyi bul, sonra zıt anlamlısını yaz."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        antonym: { type: Type.STRING },
                        clues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['text', 'image'] },
                                    value: { type: Type.STRING },
                                    imagePrompt: { type: Type.STRING }
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
        required: ["title", "prompt", "puzzles", "antonymsPrompt", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AntonymResfebeData[]>;
};

export const generateThematicWordSearchColorFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as Promise<ThematicWordSearchColorData[]>;
export const generatePunctuationSpiralPuzzleFromAI = async (options: GeneratorOptions) => generateSpiralPuzzleFromAI(options) as Promise<PunctuationSpiralPuzzleData[]>;
export const generateThematicJumbledWordStoryFromAI = async (options: GeneratorOptions) => generateJumbledWordStoryFromAI(options) as Promise<ThematicJumbledWordStoryData[]>;

export const generateSynonymMatchingPatternFromAI = async (options: GeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    const { itemCount, worksheetCount, theme } = options;
    const prompt = `Create a synonym matching pattern activity. List ${itemCount} pairs of synonyms related to ${theme}.
    PEDAGOGICAL NOTE: "Eş anlamlı kelime eşleştirme ve örüntü tanıma."
    INSTRUCTION: "Eş anlamlı kelimeleri aynı renk veya çizgiyle eşleştir."`;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                pairs: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {word: {type: Type.STRING}, synonym: {type: Type.STRING}}, required: ['word', 'synonym']}}
            }, required: ['title', 'pairs', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<SynonymMatchingPatternData[]>;
};

export const generateMissingPartsFromAI = async (options: GeneratorOptions): Promise<MissingPartsData[]> => {
     const {itemCount, worksheetCount} = options;
     const prompt = `Create a 'Missing Parts' word puzzle. Split ${itemCount} words into two parts.
     PEDAGOGICAL NOTE: "Görsel tamamlama (closure) ve kelime tanıma."
     INSTRUCTION: "Kelime parçalarını birleştir."`;
     const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                leftParts: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, text: {type: Type.STRING}}, required: ['id', 'text']}},
                rightParts: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, text: {type: Type.STRING}}, required: ['id', 'text']}},
                givenParts: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {word: {type: Type.STRING}, parts: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['word', 'parts']}}
            }, required: ['title', 'leftParts', 'rightParts', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<MissingPartsData[]>;
};

export const generateWordWebFromAI = async (options: GeneratorOptions): Promise<WordWebData[]> => {
    const { itemCount, worksheetCount } = options;
    const prompt = `Create a 'Word Web' puzzle. Words intersect in a grid.
    PEDAGOGICAL NOTE: "Kelime ilişkileri ve ağ yapısı."
    INSTRUCTION: "Kelimeleri ağa yerleştir."`;
     const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                wordsToFind: {type: Type.ARRAY, items: {type: Type.STRING}},
                grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}},
                keyWordPrompt: {type: Type.STRING}
            }, required: ['title', 'wordsToFind', 'grid', 'keyWordPrompt', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<WordWebData[]>;
};

export const generateHomonymSentenceWritingFromAI = async (options: GeneratorOptions): Promise<HomonymSentenceData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesine uygun bir 'Eş Sesli Kelime Cümle Yazma' etkinliği oluştur.
    ${itemCount} tane yaygın Türkçe eş sesli kelime seç.
    Her kelime için:
    1. İki farklı anlamını ('meaning1', 'meaning2') kısaca açıkla.
    2. Her bir anlam için, o anlamı temsil eden, **İngilizce**, fotoğraf gerçekliğinde (photorealistic), yüksek kaliteli, sinematik ve gerçekçi bir 'imagePrompt' (imagePrompt_1 ve imagePrompt_2) üret.
    PEDAGOGICAL NOTE: "Eş sesli kelimelerin (sesteş) farklı bağlamlarda kullanımını kavrama."
    INSTRUCTION: "Aynı kelimenin iki farklı anlamı için birer cümle yaz."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING }, prompt: { type: Type.STRING },
                instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING },
                items: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            word: { type: Type.STRING },
                            meaning1: { type: Type.STRING }, imagePrompt_1: { type: Type.STRING },
                            meaning2: { type: Type.STRING }, imagePrompt_2: { type: Type.STRING }
                        }, required: ["word", "meaning1", "imagePrompt_1", "meaning2", "imagePrompt_2"]
                    }
                }
            }, required: ["title", "prompt", "items", "instruction", "pedagogicalNote"]
        }
    };
    return generateWithSchema(prompt, schema) as Promise<HomonymSentenceData[]>;
};

export const generateHomonymImageMatchFromAI = async (options: GeneratorOptions): Promise<HomonymImageMatchData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `Create a homonym image matching puzzle for difficulty "${difficulty}". For each worksheet, pick a common Turkish homonym. Create two image prompts (in English, **photorealistic, highly detailed, 8k, cinematic lighting**) for its two different meanings. Also create a simple word scramble for the homonym itself.
    PEDAGOGICAL NOTE: "Görsel ve anlamsal ilişkilendirme."
    INSTRUCTION: "Resimleri incele, ortak olan eş sesli kelimeyi bul."
    Create ${worksheetCount} worksheets.`;
    const imageSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.INTEGER },
            word: { type: Type.STRING, description: "Description of the meaning" },
            imagePrompt: { type: Type.STRING, description: "English prompt for image generation." }
        },
        required: ["id", "word", "imagePrompt"]
    };
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            leftImages: { type: Type.ARRAY, items: imageSchema },
            rightImages: { type: Type.ARRAY, items: imageSchema },
            wordScramble: {
                type: Type.OBJECT,
                properties: {
                    letters: { type: Type.ARRAY, items: { type: Type.STRING } },
                    word: { type: Type.STRING }
                },
                required: ["letters", "word"]
            }
        },
        required: ["title", "prompt", "leftImages", "rightImages", "wordScramble", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<HomonymImageMatchData[]>;
};

export const generateImageAnagramSortFromAI = async (options: GeneratorOptions): Promise<ImageAnagramSortData[]> => {
    const { itemCount, topic, difficulty, worksheetCount } = options;
    const prompt = `Create an image anagram sorting activity with theme '${topic}' for difficulty level "${difficulty}". Generate ${itemCount} cards. Each card must have a scrambled word, its correct form, a description, and a **photorealistic, highly detailed** English image generation prompt (cinematic lighting, 8k). 
    PEDAGOGICAL NOTE: "Kelime sıralama ve görsel destekli kod çözme."
    INSTRUCTION: "Harfleri düzelt, kelimeyi bul ve görselleri isme göre sırala."
    Create ${worksheetCount} unique worksheets.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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
        required: ["title", "prompt", "cards", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ImageAnagramSortData[]>;
};

export const generateAnagramImageMatchFromAI = async (options: GeneratorOptions): Promise<AnagramImageMatchData[]> => {
    const { itemCount, topic, difficulty, worksheetCount } = options;
    const prompt = `Create an anagram-image matching activity with theme '${topic}' for difficulty level "${difficulty}". Generate a word bank of ${itemCount} words. Then, create ${itemCount} puzzles. Each puzzle should have an image (provide **photorealistic, highly detailed** English image prompt, 8k, studio lighting), the correct word, and a version of the answer with some letters filled in as a clue. 
    PEDAGOGICAL NOTE: "Kelime tanıma ve görsel eşleştirme."
    INSTRUCTION: "Resme bak, eksik harfleri tamamla ve doğru kelimeyi bul."
    Create ${worksheetCount} unique worksheets.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            wordBank: { type: Type.ARRAY, items: { type: Type.STRING } },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        imageDescription: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING },
                        partialAnswer: { type: Type.STRING, description: "e.g., A _ M _" },
                        correctWord: { type: Type.STRING }
                    },
                    required: ["imageDescription", "imagePrompt", "partialAnswer", "correctWord"]
                }
            }
        },
        required: ["title", "prompt", "wordBank", "puzzles", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<AnagramImageMatchData[]>;
};

export const generateSyllableWordSearchFromAI = async (options: GeneratorOptions): Promise<SyllableWordSearchData[]> => {
     const prompt = `Create a Syllable Word Search. Combine syllables to form words, then find in grid.
     PEDAGOGICAL NOTE: "Hece birleştirme ve kelime avı."
     INSTRUCTION: "Heceleri birleştir, kelimeleri bul."`;
     const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                syllablesToCombine: {type: Type.ARRAY, items: {type: Type.STRING}},
                wordsToCreate: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {syllable1: {type: Type.STRING}, syllable2: {type: Type.STRING}, answer: {type: Type.STRING}}, required: ['syllable1','syllable2','answer']}},
                wordsToFindInSearch: {type: Type.ARRAY, items: {type: Type.STRING}},
                grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}},
                passwordPrompt: {type: Type.STRING}
            }, required: ['title', 'syllablesToCombine', 'wordsToCreate', 'grid', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<SyllableWordSearchData[]>;
}
export const generateWordSearchWithPasswordFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as Promise<WordSearchWithPasswordData[]>;

export const generateWordWebWithPasswordFromAI = async (options: GeneratorOptions): Promise<WordWebWithPasswordData[]> => {
    const { itemCount, difficulty, worksheetCount, topic } = options;
    const prompt = `
    '${topic}' temalı ve "${difficulty}" zorluk seviyesine uygun, şifreli bir 'Kelime Ağı' (Word Web) oluştur.
    1. ${itemCount} kelime seç.
    2. Bu kelimeleri bir ızgaraya yerleştir.
    3. Izgaranın belirli bir sütununda (passwordColumnIndex), kelimelerin kesişiminden veya özel hizalamasından oluşan bir "Şifre" (Password) oluşsun.
    PEDAGOGICAL NOTE: "Mantıksal yerleştirme, harf takibi ve şifre çözme."
    INSTRUCTION: "Kelimeleri ağa yerleştir ve renkli sütundaki şifreyi bul."
    Bu kurallara göre, ${worksheetCount} adet çalışma sayfası oluştur.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                prompt: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                words: { type: Type.ARRAY, items: { type: Type.STRING } },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                passwordColumnIndex: { type: Type.INTEGER }
            },
            required: ['title', 'prompt', 'words', 'grid', 'passwordColumnIndex', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<WordWebWithPasswordData[]>;
};

export const generateLetterGridWordFindFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as Promise<LetterGridWordFindData[]>;

export const generateWordPlacementPuzzleFromAI = async (options: GeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
     const prompt = `Create a Word Placement Puzzle (like Kriss Kross). 
     PEDAGOGICAL NOTE: "Uzamsal zeka ve kelime uzunluğu farkındalığı."
     INSTRUCTION: "Kelimeleri harf sayısına göre kutulara yerleştir."`;
     const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}},
                wordGroups: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {length: {type: Type.INTEGER}, words: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['length','words']}},
                unusedWordPrompt: {type: Type.STRING}
            }, required: ['title', 'grid', 'wordGroups', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<WordPlacementPuzzleData[]>;
}

export const generatePositionalAnagramFromAI = async (options: GeneratorOptions): Promise<PositionalAnagramData[]> => {
     const prompt = `Create a Positional Anagram puzzle. Numbered boxes correspond to letters.
     PEDAGOGICAL NOTE: "Harf kodlama ve anagram."
     INSTRUCTION: "Numaralı kutulardaki harfleri değiştir, kelimeyi bul."`;
     const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {id: {type: Type.INTEGER}, scrambled: {type: Type.STRING}, answer: {type: Type.STRING}}, required: ['id','scrambled','answer']}}
            }, required: ['title', 'puzzles', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<PositionalAnagramData[]>;
}

export const generateResfebeFromAI = async (options: GeneratorOptions): Promise<ResfebeData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `Create a "Resfebe" puzzle for difficulty level "${difficulty}". Generate 4 puzzles. For each, provide clues (text or image prompts) and the answer. For image clues, create a **photorealistic, high quality, 8k, cinematic lighting** prompt.
    PEDAGOGICAL NOTE: "Yaratıcı düşünme ve sembolik akıl yürütme."
    INSTRUCTION: "Harf ve görsellerden kelimeyi bul."`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        clues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['text', 'image'] },
                                    value: { type: Type.STRING },
                                    imagePrompt: { type: Type.STRING }
                                },
                                required: ["type", "value"]
                            }
                        },
                        answer: { type: Type.STRING }
                    },
                    required: ["clues", "answer"]
                }
            }
        },
        required: ["title", "prompt", "puzzles", "instruction", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ResfebeData[]>;
};

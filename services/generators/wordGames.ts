
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

// OPTIMIZED PROMPT: Forces photorealism and high detail, discouraging simple/cartoon styles.
const VISUAL_STYLE = "Create a **photorealistic, 8k resolution, cinematic lighting, highly detailed, studio photography style** image prompt in English. Do NOT use terms like 'drawing', 'cartoon', 'illustration', 'vector', 'sketch'. The image should look like a real high-end photo.";

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
    
    PEDAGOGICAL NOTE: "Görsel tarama, şekil-zemin algısı ve seçici dikkat becerilerini destekler."
    INSTRUCTION: "Listelenen kelimeleri tablonun içinde bul ve renkli kalemle işaretle."

    Her çalıştırmada tamamen FARKLI kelimeler kullan.
    ${worksheetCount} adet üret.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      words: { type: Type.ARRAY, items: { type: Type.STRING } },
      hiddenMessage: { type: Type.STRING },
      followUpQuestion: { type: Type.STRING },
      writingPrompt: { type: Type.STRING }
    },
    required: ['title', 'instruction', 'grid', 'words', 'hiddenMessage', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordSearchData[]>;
};

export const generateSpiralPuzzleFromAI = async (options: GeneratorOptions): Promise<SpiralPuzzleData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, gridSize } = options;
    const size = gridSize || 10;
    const prompt = `
    '${topic}' temalı, "${difficulty}" zorluk seviyesine uygun bir "Sarmal Bulmaca" (Spiral Puzzle) oluştur.
    ${itemCount} adet cevap kelimesi seç.
    Bu kelimeler dışarıdan içeriye doğru (veya merkezden dışarıya) sarmal bir şekilde birbirini takip etmelidir.
    Her kelime için bir ipucu (clue) yaz.
    Harfleri ${size}x${size} boyutunda bir ızgaraya yerleştir.
    Kelimelerin başlangıç noktalarını (wordStarts) belirt.
    Ayrıca bu bulmacadan çıkan bir şifre sorusu (passwordPrompt) ekle.
    
    PEDAGOGICAL NOTE: "Görsel takip ve kelime dağarcığı."
    INSTRUCTION: "İpuçlarını okuyarak kelimeleri sarmal şekilde bulmacaya yaz."

    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordStarts: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT, 
                    properties: { id: { type: Type.INTEGER }, row: { type: Type.INTEGER }, col: { type: Type.INTEGER } },
                    required: ['id', 'row', 'col']
                } 
            },
            passwordPrompt: { type: Type.STRING }
        },
        required: ['title', 'instruction', 'grid', 'clues', 'wordStarts', 'passwordPrompt', 'pedagogicalNote']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<SpiralPuzzleData[]>;
};

export const generateJumbledWordStoryFromAI = async (options: GeneratorOptions): Promise<JumbledWordStoryData[]> => {
    const { itemCount, difficulty, worksheetCount, theme } = options;
    const prompt = `
    '${theme}' temalı, "${difficulty}" zorluk seviyesinde bir "Karışık Kelime Hikayesi" oluştur.
    1. ${itemCount} adet kelime seç. Bu kelimelerin harflerini karıştır (jumbled).
    2. Ayrıca, bu kelimelerin kullanılabileceği yaratıcı bir hikaye yazma yönergesi (storyPrompt) ver.
    3. Temayı yansıtan, ${VISUAL_STYLE} bir 'imagePrompt' oluştur. (Örn: 'A messy room with colorful letter blocks scattered on the floor, cinematic lighting, photorealistic').
    
    PEDAGOGICAL NOTE: "Ortografik farkındalık ve yaratıcı yazma becerisi."
    INSTRUCTION: "Harfleri düzelterek kelimeleri bul, sonra bu kelimeleri kullanarak bir hikaye yaz."
    ${worksheetCount} adet üret.
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, theme: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                puzzles: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {jumbled: {type: Type.ARRAY, items: {type: Type.STRING}}, word: {type: Type.STRING}}, required: ['jumbled', 'word']}},
                storyPrompt: {type: Type.STRING},
                imagePrompt: {type: Type.STRING}
            }, required: ['title', 'puzzles', 'storyPrompt', 'instruction', 'pedagogicalNote', 'imagePrompt']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<JumbledWordStoryData[]>;
};

export const generateWordGridPuzzleFromAI = async (options: GeneratorOptions): Promise<WordGridPuzzleData[]> => {
    const { itemCount, difficulty, worksheetCount, topic } = options;
    const prompt = `
    '${topic}' konusunda "${difficulty}" seviyesinde bir "Kelime Ağı" (Kriss Kross) bulmacası oluştur.
    ${itemCount} adet kelime seç. Bu kelimelerin birbirine bağlandığı 10x10 veya 12x12'lik bir ızgara (grid) düzeni oluştur.
    Kelimeleri listele. Gridde boş yerler null, kelime harfleri ise harf olmalı.
    Kullanılmayan ekstra bir kelime ver ve bununla ilgili soru sor.
    
    PEDAGOGICAL NOTE: "Uzamsal planlama ve kelime tanıma."
    INSTRUCTION: "Verilen kelimeleri harf sayılarına göre bulmacadaki uygun yerlere yerleştir."
    ${worksheetCount} adet üret.
    `;
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
    const prompt = `
    "${difficulty}" seviyesinde "Zıt Anlam Çiçeği" etkinliği.
    ${itemCount} adet kelime çifti (kelime - zıt anlamlısı) seç.
    Papatyanın ortasına kelimeyi yaz. Yapraklara ise zıt anlamlısının harflerini KARIŞIK olarak yerleştir.
    Kullanıcı harfleri düzenleyip zıt anlamlıyı bulacak.
    PEDAGOGICAL NOTE: "Zıt anlam ilişkisi ve anagram çözme."
    INSTRUCTION: "Çiçeğin ortasındaki kelimenin zıt anlamlısını, yapraklardaki harfleri kullanarak bul."
    ${worksheetCount} adet üret.
    `;
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

export const generateSynonymMatchingPatternFromAI = async (options: GeneratorOptions): Promise<SynonymMatchingPatternData[]> => {
    const { itemCount, worksheetCount, theme } = options;
    const prompt = `
    '${theme}' temalı bir "Eş Anlamlı Eşleştirme Deseni" oluştur.
    ${itemCount} çift eş anlamlı kelime seç (Örn: Al-Kırmızı).
    PEDAGOGICAL NOTE: "Semantik bellek ve kelime eşleştirme."
    INSTRUCTION: "Anlamdaş olan kelimeleri aynı renge boyayarak veya çizgiyle birleştirerek eşle."
    ${worksheetCount} adet üret.
    `;
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
     const {itemCount, worksheetCount, difficulty} = options;
     const prompt = `
     "${difficulty}" seviyesinde "Eksik Parçalar" kelime oyunu.
     ${itemCount} adet bileşik veya çok heceli kelime seç.
     Bu kelimeleri iki parçaya böl. Sol sütuna ilk parçaları, sağ sütuna ikinci parçaları (karışık sırada) koy.
     PEDAGOGICAL NOTE: "Görsel tamamlama (closure) ve kelime bütünü algısı."
     INSTRUCTION: "Sol ve sağ sütundaki parçaları birleştirerek anlamlı kelimeler oluştur."
     ${worksheetCount} adet üret.
     `;
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
    const { itemCount, worksheetCount, topic } = options;
    const prompt = `
    '${topic}' konusunda bir "Kelime Ağı" bulmacası.
    ${itemCount} kelime seç ve bunları 12x12 ızgarada kesiştir.
    Anahtar bir kelimeyi vurgula.
    PEDAGOGICAL NOTE: "Uzamsal ilişkiler ve kelime dağarcığı."
    INSTRUCTION: "Kelimeleri ağa yerleştir ve anahtar kelimeyi bul."
    ${worksheetCount} adet üret.
    `;
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

export const generateWordWebWithPasswordFromAI = async (options: GeneratorOptions): Promise<WordWebWithPasswordData[]> => {
    const { itemCount, difficulty, worksheetCount, topic } = options;
    const prompt = `
    '${topic}' temalı ve "${difficulty}" zorluk seviyesine uygun, şifreli bir 'Kelime Ağı' oluştur.
    1. ${itemCount} kelimeyi ızgaraya yerleştir.
    2. Belirli bir sütunda (passwordColumnIndex) anlamlı bir ŞİFRE kelime oluşsun.
    PEDAGOGICAL NOTE: "Mantıksal yerleştirme, harf takibi ve şifre çözme."
    INSTRUCTION: "Kelimeleri ağa yerleştir ve renkli sütundaki şifreyi bul."
    ${worksheetCount} adet üret.
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

export const generateHomonymSentenceWritingFromAI = async (options: GeneratorOptions): Promise<HomonymSentenceData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde 'Eş Sesli Kelime Cümle Yazma' etkinliği.
    ${itemCount} tane Türkçe eş sesli kelime seç (Örn: Yaz, Gül).
    Her kelime için:
    1. İki farklı anlamını ('meaning1', 'meaning2') kısaca açıkla.
    2. Her bir anlamı için ${VISUAL_STYLE} bir 'imagePrompt' (imagePrompt_1 ve imagePrompt_2) üret.
    PEDAGOGICAL NOTE: "Eş sesli kelimelerin farklı bağlamlarda kullanımını kavrama."
    INSTRUCTION: "Aynı kelimenin iki farklı anlamı için birer cümle yaz."
    ${worksheetCount} adet üret.
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
    const prompt = `Create a homonym image matching puzzle for difficulty "${difficulty}". Pick a common Turkish homonym. Create two image prompts (in English, using ${VISUAL_STYLE}) for its two different meanings. Also create a simple word scramble for the homonym itself.
    PEDAGOGICAL NOTE: "Görsel ve anlamsal ilişkilendirme."
    INSTRUCTION: "Resimleri incele, ortak olan eş sesli kelimeyi bul."
    ${worksheetCount} worksheets.`;
    const imageSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.INTEGER },
            word: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
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
    const prompt = `Create an image anagram sorting activity with theme '${topic}' for difficulty level "${difficulty}". Generate ${itemCount} cards. Each card must have a scrambled word, its correct form, a description, and a ${VISUAL_STYLE} 'imagePrompt'. 
    PEDAGOGICAL NOTE: "Kelime sıralama ve görsel destekli kod çözme."
    INSTRUCTION: "Harfleri düzelt, kelimeyi bul ve görselleri isme göre sırala."
    ${worksheetCount} unique worksheets.`;
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
    const prompt = `Create an anagram-image matching activity with theme '${topic}'. Generate ${itemCount} puzzles. Each puzzle should have an image (provide ${VISUAL_STYLE} 'imagePrompt'), the correct word, and a partial answer clue. 
    PEDAGOGICAL NOTE: "Kelime tanıma ve görsel eşleştirme."
    INSTRUCTION: "Resme bak, eksik harfleri tamamla ve doğru kelimeyi bul."
    ${worksheetCount} unique worksheets.`;
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
                        partialAnswer: { type: Type.STRING },
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
     const { itemCount, difficulty, worksheetCount } = options;
     const prompt = `Create a Syllable Word Search for "${difficulty}". Split ${itemCount} words into syllables. List the syllables to combine. Place the full words into a grid.
     PEDAGOGICAL NOTE: "Hece birleştirme ve kelime avı."
     INSTRUCTION: "Heceleri birleştirip kelimeleri oluştur, sonra bu kelimeleri bulmacada bul."
     ${worksheetCount} worksheets.`;
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

export const generateWordSearchWithPasswordFromAI = async (options: GeneratorOptions): Promise<WordSearchWithPasswordData[]> => {
    const { topic, itemCount, difficulty, worksheetCount, gridSize } = options;
    const prompt = `
    '${topic}' konusunda, "${difficulty}" seviyesinde, ŞİFRELİ bir kelime bulmaca oluştur.
    1. Kelimeleri ızgaraya yerleştir.
    2. Izgaradaki belirli hücreleri (passwordCells) işaretle. Bu hücrelerdeki harfler birleşince bir ŞİFRE kelimesi oluşsun.
    PEDAGOGICAL NOTE: "Dikkat, görsel tarama ve şifre çözme."
    INSTRUCTION: "Kelimeleri bul. Renkli kutulardaki harfleri sırayla yazarak şifreyi çöz."
    ${worksheetCount} adet üret.
    `;
    const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                words: { type: Type.ARRAY, items: { type: Type.STRING } },
                passwordCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ['row', 'col'] } }
            }, required: ['title', 'prompt', 'grid', 'words', 'passwordCells', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<WordSearchWithPasswordData[]>;
};

export const generateLetterGridWordFindFromAI = async (options: GeneratorOptions): Promise<LetterGridWordFindData[]> => {
    const { topic, itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' konusunda bir Harf Izgarası Kelime Bulma etkinliği.
    Tabloda kelimeler gizli. Ayrıca, bulunan kelimelerle ilgili bir yazı yazma promptu ver.
    PEDAGOGICAL NOTE: "Görsel tarama ve yaratıcı yazma."
    INSTRUCTION: "Tabloda gizlenmiş kelimeleri bul ve bu kelimelerle bir hikaye yaz."
    ${worksheetCount} adet üret.
    `;
    const schema = {
        type: Type.ARRAY, items: {
             type: Type.OBJECT, properties: {
                title: { type: Type.STRING }, prompt: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                words: { type: Type.ARRAY, items: { type: Type.STRING } },
                writingPrompt: { type: Type.STRING }
            }, required: ['title', 'prompt', 'grid', 'words', 'writingPrompt', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<LetterGridWordFindData[]>;
};

export const generateWordPlacementPuzzleFromAI = async (options: GeneratorOptions): Promise<WordPlacementPuzzleData[]> => {
     const { itemCount, difficulty, worksheetCount } = options;
     const prompt = `Create a Word Placement Puzzle (like Kriss Kross) for "${difficulty}". 
     Provide a list of words grouped by length. Provide a grid where they fit.
     PEDAGOGICAL NOTE: "Uzamsal zeka ve kelime uzunluğu farkındalığı."
     INSTRUCTION: "Kelimeleri harf sayısına göre kutulara yerleştir."
     ${worksheetCount} worksheets.`;
     const schema = {
        type: Type.ARRAY, items: {
            type: Type.OBJECT, properties: {
                title: {type: Type.STRING}, prompt: {type: Type.STRING}, instruction: {type: Type.STRING}, pedagogicalNote: {type: Type.STRING},
                grid: {type: Type.ARRAY, items: {type: Type.ARRAY, items: {type: Type.STRING}}}, // string or null
                wordGroups: {type: Type.ARRAY, items: {type: Type.OBJECT, properties: {length: {type: Type.INTEGER}, words: {type: Type.ARRAY, items: {type: Type.STRING}}}, required: ['length','words']}},
                unusedWordPrompt: {type: Type.STRING}
            }, required: ['title', 'grid', 'wordGroups', 'instruction', 'pedagogicalNote']
        }
    };
    return generateWithSchema(prompt, schema) as Promise<WordPlacementPuzzleData[]>;
}

export const generatePositionalAnagramFromAI = async (options: GeneratorOptions): Promise<PositionalAnagramData[]> => {
     const { itemCount, difficulty, worksheetCount } = options;
     const prompt = `Create a Positional Anagram puzzle. Show words with numbered letters. User must rearrange based on numbers to find the word.
     PEDAGOGICAL NOTE: "Harf kodlama ve anagram."
     INSTRUCTION: "Numaralı kutulardaki harfleri değiştir, kelimeyi bul."
     ${worksheetCount} worksheets.`;
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
    const prompt = `
    "${difficulty}" seviyesinde ${itemCount} adet "Resfebe" (Rebus) bulmacası oluştur.
    Her bulmaca için:
    1. Bir kelime belirle (answer).
    2. Bu kelimeyi anlatacak yaratıcı ipuçları (clues) tasarla.
    3. Görsel ipuçları için ${VISUAL_STYLE} 'imagePrompt' oluştur.
    4. Metin ipuçları için harfleri veya ekleri kullan.
    PEDAGOGICAL NOTE: "Yaratıcı düşünme ve sembolik akıl yürütme."
    INSTRUCTION: "Harf ve görsellerden oluşan ipuçlarını birleştirerek kelimeyi bul."
    ${worksheetCount} adet üret.
    `;
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

// Aliases with safe casting
export const generateThematicWordSearchColorFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as any as Promise<ThematicWordSearchColorData[]>;
export const generatePunctuationSpiralPuzzleFromAI = async (options: GeneratorOptions) => generateSpiralPuzzleFromAI(options) as any as Promise<PunctuationSpiralPuzzleData[]>;
export const generateThematicJumbledWordStoryFromAI = async (options: GeneratorOptions) => generateJumbledWordStoryFromAI(options) as any as Promise<ThematicJumbledWordStoryData[]>;
export const generateAntonymResfebeFromAI = async (options: GeneratorOptions) => generateResfebeFromAI(options) as any as Promise<AntonymResfebeData[]>;
export const generateSynonymSearchAndStoryFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as any as Promise<SynonymSearchAndStoryData[]>;
export const generateSynonymWordSearchFromAI = async (options: GeneratorOptions) => generateWordSearchFromAI(options) as any as Promise<SynonymWordSearchData[]>;

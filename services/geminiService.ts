import { GoogleGenAI, Type } from "@google/genai";
import { 
    WordSearchData, AnagramData, MathPuzzleData, StoryData, StroopTestData, NumberPatternData, SpellingCheckData, 
    LetterGridTestData, NumberSearchData, WordMemoryData, StoryCreationPromptData, FindTheDifferenceData, 
    WordComparisonData, WordsInStoryData, OddOneOutData, ShapeMatchingData, SymbolCipherData, ProverbFillData,
    LetterBridgeData, FindDuplicateData, ShapeType, WordLadderData, FindIdenticalWordData, WordFormationData,
    ReverseWordData, FindLetterPairData, WordGroupingData, VisualMemoryData, StoryAnalysisData, CoordinateCipherData,
    ProverbSearchData, TargetSearchData, ShapeNumberPatternData, GridDrawingData, ColorWheelMemoryData, ImageComprehensionData,
    CharacterMemoryData, StorySequencingData, ChaoticNumberSearchData, BlockPaintingData, MiniWordGridData, VisualOddOneOutData,
    ShapeCountingData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, PasswordFinderData,
    SyllableCompletionData, SynonymWordSearchData, WordConnectData, SpiralPuzzleData, CrosswordData,
    JumbledWordStoryData, HomonymSentenceData, WordGridPuzzleData, ProverbSayingSortData, HomonymImageMatchData,
    AntonymFlowerPuzzleData, ProverbWordChainData, ThematicOddOneOutData, SynonymAntonymGridData, PunctuationColoringData,
    PunctuationMazeData, AntonymResfebeData, ThematicWordSearchColorData, ThematicOddOneOutSentenceData, ProverbSentenceFinderData,
    SynonymSearchAndStoryData, ColumnOddOneOutSentenceData, SynonymAntonymColoringData, PunctuationPhoneNumberData,
    PunctuationSpiralPuzzleData, ThematicJumbledWordStoryData, SynonymMatchingPatternData, FutoshikiData, NumberPyramidData,
    NumberCapsuleData, OddEvenSudokuData, RomanNumeralConnectData, RomanNumeralStarHuntData, RoundingConnectData,
    RomanNumeralMultiplicationData, ArithmeticConnectData, RomanArabicMatchConnectData, Sudoku6x6ShadedData, KendokuData,
    DivisionPyramidData, MultiplicationPyramidData, OperationSquareSubtractionData, OperationSquareFillInData,
    MultiplicationWheelData, TargetNumberData, OperationSquareMultDivData, ShapeSudokuData, WeightConnectData,
    ResfebeData, ResfebeClue, FutoshikiLengthData, MatchstickSymmetryData, WordWebData, StarHuntData,
    LengthConnectData, VisualNumberPatternData, MissingPartsData, ProfessionConnectData, VisualOddOneOutThemedData,
    LogicGridPuzzleData, ImageAnagramSortData, AnagramImageMatchData, SyllableWordSearchData, WordSearchWithPasswordData,
    WordWebWithPasswordData, LetterGridWordFindData, WordPlacementPuzzleData, PositionalAnagramData
} from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateWithSchema = async (prompt: string, schema: any) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonText = response.text;
        if (!jsonText) {
          throw new Error("AI returned an empty response.");
        }
        const parsed = JSON.parse(jsonText);
        return parsed;
    } catch (error) {
        console.error("Error generating content from AI:", error);
        throw new Error("Yapay zeka ile içerik oluşturulurken bir hata oluştu.");
    }
};


export const generateWordSearchFromAI = async (topic: string, gridSize: number, wordCount: number): Promise<WordSearchData> => {
  const prompt = `
    ${topic} konusuyla ilgili ${wordCount} tane Türkçe kelime oluştur. 
    Bu kelimeleri ${gridSize}x${gridSize} boyutunda bir harf bulmacasına yerleştir. 
    Kelimeler yatay, dikey ve çapraz olarak yerleştirilebilir. 
    Boş kalan yerleri rastgele Türkçe harflerle doldur.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      grid: {
        type: Type.ARRAY, description: 'The word search grid.',
        items: { type: Type.ARRAY, items: { type: Type.STRING }, },
      },
      words: {
        type: Type.ARRAY, description: 'List of words hidden in the grid.',
        items: { type: Type.STRING },
      },
    },
    required: ['grid', 'words']
  };
  return generateWithSchema(prompt, schema) as Promise<WordSearchData>;
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

export const generateMathPuzzlesFromAI = async (topic: string, count: number): Promise<MathPuzzleData> => {
  const prompt = `
    Çocuklar için '${topic}' konusuyla ilgili ${count} tane basit matematik bulmacası oluştur. 
    Bulmacalar nesneler veya meyveler kullanarak toplama, çıkarma gibi basit denklemler içermelidir.
    Her bulmaca için bir problem metni (örn: '2 elma + 3 muz = ?'), bir soru (örn: 'Sonuç kaçtır?') ve bir cevap ver.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
    const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The title of the puzzle set.'},
      puzzles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            problem: { type: Type.STRING, description: 'The math problem with objects, e.g., "🍎 + 🍌 = 12"' },
            question: { type: Type.STRING, description: 'The question to be solved, e.g., "What is the value of 🍌?"' },
            answer: { type: Type.STRING, description: 'The numerical answer.' },
          },
          required: ['problem', 'question', 'answer']
        },
      },
    },
    required: ['title', 'puzzles']
  };
  return generateWithSchema(prompt, schema) as Promise<MathPuzzleData>;
};

export const generateStoryFromAI = async (topic: string): Promise<StoryData> => {
    const prompt = `
    7 yaşındaki bir çocuk için '${topic}' konusunda 100-150 kelimelik kısa ve basit bir Türkçe hikaye yaz. 
    Hikayenin bir başlığı olsun.
    Hikayeden sonra, hikayeyle ilgili 3 tane çoktan seçmeli anlama sorusu oluştur. 
    Her soru için 3 seçenek sun ve doğru seçeneğin indeksini (0, 1 veya 2) belirt.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
    const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'The title of the story.' },
      story: { type: Type.STRING, description: 'The full text of the story.' },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: 'The comprehension question.' },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'An array of 3 possible answers.' },
            answerIndex: { type: Type.INTEGER, description: 'The 0-based index of the correct answer in the options array.' },
          },
          required: ['question', 'options', 'answerIndex']
        },
      },
    },
    required: ['title', 'story', 'questions']
  };
  return generateWithSchema(prompt, schema) as Promise<StoryData>;
};

export const generateStroopTestFromAI = async (count: number): Promise<StroopTestData> => {
    const prompt = `
    Bir Stroop testi için ${count} tane öğe oluştur. Her öğe bir renk adı (text) ve bir CSS renk adı (color) içermelidir. 
    Metin ve renk genellikle birbiriyle eşleşmemelidir. Örneğin, metin "MAVİ" olabilirken renk "red" olabilir.
    Kullanılacak renkler: red, blue, green, yellow, orange, purple, pink, black.
    Kullanılacak metinler: KIRMIZI, MAVİ, YEŞİL, SARI, TURUNCU, MOR, PEMBE, SİYAH.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the Stroop test.' },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING, description: 'The color name in Turkish.' },
                        color: { type: Type.STRING, description: 'A CSS-compatible color name (e.g., "red").' },
                    },
                    required: ['text', 'color']
                },
            },
        },
        required: ['title', 'items']
    };
    return generateWithSchema(prompt, schema) as Promise<StroopTestData>;
};

export const generateNumberPatternsFromAI = async (count: number, difficulty: string): Promise<NumberPatternData> => {
    const prompt = `
    Çocuklar için ${difficulty} zorluk seviyesinde ${count} tane sayı örüntüsü bulmacası oluştur.
    Her örüntü bir dizi sayı içermeli ve sonunda bir soru işareti olmalıdır. (örn: "2, 4, 6, 8, ?").
    Her örüntü için doğru cevabı da belirt.
    Örnek Zorluklar:
    - Kolay: Basit toplama/çıkarma (örn: +2, -1)
    - Orta: İki adımlı işlemler veya basit çarpma (örn: *2, +1)
    - Zor: Daha karmaşık kurallar.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the number pattern puzzles.' },
            patterns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sequence: { type: Type.STRING, description: 'The number sequence with a question mark.' },
                        answer: { type: Type.STRING, description: 'The correct next number in the sequence.' },
                    },
                     required: ['sequence', 'answer']
                },
            },
        },
        required: ['title', 'patterns']
    };
    return generateWithSchema(prompt, schema) as Promise<NumberPatternData>;
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

export const generateLetterGridFromAI = async (gridSize: number, letters: string): Promise<LetterGridTestData> => {
    const targetLetters = letters.split(',').map(l => l.trim().toLowerCase());
    const prompt = `
    ${gridSize}x${gridSize} boyutunda bir harf ızgarası oluştur.
    Izgarayı rastgele Türkçe küçük harflerle doldur.
    Aranacak hedef harfler şunlar: ${targetLetters.join(', ')}. Bu harfleri ızgaraya serpiştir.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData>;
};

export const generateNumberSearchFromAI = async (start: number, end: number): Promise<NumberSearchData> => {
    const prompt = `
    Bir sayı avı etkinliği oluştur. 
    ${start} ile ${end} arasındaki sayıları içersin.
    Bu sayıları ve dikkat dağıtıcı başka sayıları/karakterleri rastgele bir sırada içeren bir liste oluştur. Toplam 100 öğe olsun.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<NumberSearchData>;
};

export const generateWordMemoryFromAI = async (topic: string, memorizeCount: number, testCount: number): Promise<WordMemoryData> => {
    const prompt = `
    '${topic}' konusuyla ilgili bir kelime hafıza testi oluştur.
    Ezberlenecek ${memorizeCount} kelime seç.
    Test için ${testCount} kelimelik bir liste oluştur. Bu listenin içinde ezberlenecek kelimeler de bulunsun.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<WordMemoryData>;
};

export const generateStoryCreationPromptFromAI = async (topic: string, keywordCount: number): Promise<StoryCreationPromptData> => {
    const prompt = `
    '${topic}' konusuyla ilgili bir hikaye yazma etkinliği oluştur.
    Bir hikaye istemi (prompt) ve hikayede kullanılması gereken ${keywordCount} anahtar kelime oluştur.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'prompt', 'keywords']
    };
    return generateWithSchema(prompt, schema) as Promise<StoryCreationPromptData>;
};

export const generateFindTheDifferenceFromAI = async (topic: string, rowCount: number): Promise<FindTheDifferenceData> => {
    const prompt = `
    '${topic}' konusuyla ilgili 'Farklı Olanı Bul' etkinliği için ${rowCount} satır oluştur.
    Her satırda 4 kelime olsun. Bu kelimelerden 3'ü birbiriyle çok benzesin (görsel olarak), biri ise onlardan biraz farklı olsun.
    Doğru olanın (farklı olanın) indeksini belirt.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.INTEGER }
                    },
                    required: ['items', 'correctIndex']
                }
            }
        },
        required: ['title', 'rows']
    };
    return generateWithSchema(prompt, schema) as Promise<FindTheDifferenceData>;
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

export const generateWordsInStoryFromAI = async (topic: string): Promise<WordsInStoryData> => {
  const prompt = `
    '${topic}' konusunda 80-100 kelimelik kısa bir Türkçe hikaye yaz.
    Daha sonra, 12 kelimelik bir liste oluştur. Bu kelimelerin yarısı hikayede geçsin, yarısı geçmesin.
    Her kelime için hikayede olup olmadığını (isInStory: true/false) belirt.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      story: { type: Type.STRING },
      wordList: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            isInStory: { type: Type.BOOLEAN },
          },
          required: ['word', 'isInStory']
        }
      }
    },
    required: ['title', 'story', 'wordList']
  };
  return generateWithSchema(prompt, schema) as Promise<WordsInStoryData>;
};

export const generateOddOneOutFromAI = async (topic: string, groupCount: number): Promise<OddOneOutData> => {
  const prompt = `
    '${topic}' konusuyla ilgili 'Farklı Olanı Bul' etkinliği için ${groupCount} grup oluştur.
    Her grupta 4 kelime olsun. Bu kelimelerden 3'ü anlamsal olarak ilişkili, biri ise alakasız olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      groups: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['words']
        }
      }
    },
    required: ['title', 'groups']
  };
  return generateWithSchema(prompt, schema) as Promise<OddOneOutData>;
};

const SHAPE_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];

export const generateShapeMatchingFromAI = async (rowCount: number): Promise<ShapeMatchingData> => {
  const prompt = `
    Bir şekil eşleştirme etkinliği oluştur.
    Solda ve sağda ${rowCount} tane satır olsun. Her satırda 3 tane şekil olsun.
    Soldaki satırların birebir aynısı sağda da olsun ama sıraları karışık olsun.
    Şekiller: ${SHAPE_TYPES.join(', ')}.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      leftColumn: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            shapes: { type: Type.ARRAY, items: { type: Type.STRING, enum: SHAPE_TYPES } }
          },
          required: ['id', 'shapes']
        }
      },
      rightColumn: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            shapes: { type: Type.ARRAY, items: { type: Type.STRING, enum: SHAPE_TYPES } }
          },
          required: ['id', 'shapes']
        }
      }
    },
    required: ['title', 'leftColumn', 'rightColumn']
  };
  return generateWithSchema(prompt, schema) as Promise<ShapeMatchingData>;
};

export const generateSymbolCipherFromAI = async (wordCount: number): Promise<SymbolCipherData> => {
  const prompt = `
    Bir şifre çözme etkinliği oluştur.
    8 tane şekil-harf çiftinden oluşan bir şifre anahtarı oluştur. Şekiller: ${SHAPE_TYPES.join(', ')}.
    Bu anahtarı kullanarak ${wordCount} tane şifreli kelime oluştur. Her kelime 4-6 harf uzunluğunda olsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      cipherKey: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            shape: { type: Type.STRING, enum: SHAPE_TYPES },
            letter: { type: Type.STRING }
          },
          required: ['shape', 'letter']
        }
      },
      wordsToSolve: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            shapeSequence: { type: Type.ARRAY, items: { type: Type.STRING, enum: SHAPE_TYPES } },
            wordLength: { type: Type.INTEGER }
          },
          required: ['shapeSequence', 'wordLength']
        }
      }
    },
    required: ['title', 'cipherKey', 'wordsToSolve']
  };
  return generateWithSchema(prompt, schema) as Promise<SymbolCipherData>;
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

export const generateFindDuplicateFromAI = async (rows: number, cols: number): Promise<FindDuplicateData> => {
  const prompt = `
    'İkiliyi Bul' etkinliği için ${rows} satır ve ${cols} sütundan oluşan bir tablo oluştur.
    Her satıra rastgele harfler ve rakamlar yerleştir.
    Her satırda, karakterlerden sadece bir tanesi iki defa tekrar etsin.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
    },
    required: ['title', 'rows']
  };
  return generateWithSchema(prompt, schema) as Promise<FindDuplicateData>;
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

export const generateFindIdenticalWordFromAI = async (count: number): Promise<FindIdenticalWordData> => {
    const prompt = `
    'Aynısını Bul' etkinliği için ${count} tane grup oluştur.
    Her grupta, birbirine çok benzeyen ama sadece bir harfi farklı olan iki kelime olsun. Bunlardan birini baz alarak birebir aynısını da ekle. Yani grupta [benzer1, benzer2] şeklinde iki kelimeden oluşan çiftler olacak.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            groups: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            minItems: 2,
                            maxItems: 2
                        }
                    },
                    required: ['words']
                }
            }
        },
        required: ['title', 'groups']
    };
    return generateWithSchema(prompt, schema) as Promise<FindIdenticalWordData>;
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


export const generateFindLetterPairFromAI = async (gridSize: number, targetPair: string): Promise<FindLetterPairData> => {
    const prompt = `
    'Harf İkilisini Bul' etkinliği için ${gridSize}x${gridSize} boyutunda bir harf ızgarası oluştur.
    Izgarayı rastgele Türkçe harflerle doldur.
    Hedef harf ikilisi olan '${targetPair}' harflerini ızgarada yanyana olacak şekilde birkaç yere yerleştir.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<FindLetterPairData>;
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

export const generateVisualMemoryFromAI = async (topic: string, memorizeCount: number, testCount: number): Promise<VisualMemoryData> => {
  const prompt = `
    '${topic}' konusuyla ilgili bir görsel hafıza testi oluştur.
    Ezberlenecek ${memorizeCount} tane basit nesne belirle (örn: "Kırmızı Araba 🚗"). İsmini ve emojisini ver.
    Test için ${testCount} tane nesneden oluşan bir liste oluştur. Bu listenin içinde ezberlenecek nesneler de bulunsun.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
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
  return generateWithSchema(prompt, schema) as Promise<VisualMemoryData>;
};

export const generateStoryAnalysisFromAI = async (topic: string): Promise<StoryAnalysisData> => {
  const prompt = `
    '${topic}' konusunda 150-200 kelimelik, içinde eş ve zıt anlamlı kelimeler barındıran bir hikaye yaz.
    Hikaye sonrası için 3 tane analiz sorusu oluştur. Sorular "Hikayedeki 'mutlu' kelimesinin zıt anlamlısı nedir?" gibi olmalı.
    Her soru için, cevabın bulunabileceği ipucu (context) metnini de belirt.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      story: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            context: { type: Type.STRING }
          },
          required: ['question', 'context']
        }
      }
    },
    required: ['title', 'story', 'questions']
  };
  return generateWithSchema(prompt, schema) as Promise<StoryAnalysisData>;
};

export const generateCoordinateCipherFromAI = async (topic: string, gridSize: number, wordCount: number): Promise<CoordinateCipherData> => {
  const prompt = `
    '${topic}' konusuyla ilgili bir koordinat şifreleme bulmacası oluştur.
    ${gridSize}x${gridSize} boyutunda bir harf tablosu oluştur.
    Tabloda gizli ${wordCount} tane kelime olsun.
    Bu kelimeler bulunduktan sonra, koordinatları (örn: "A5", "C2") verilecek olan harfleri birleştirerek çözülecek 5-6 harfli bir şifre kelimesi oluştur.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      wordsToFind: { type: Type.ARRAY, items: { type: Type.STRING } },
      cipherCoordinates: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'grid', 'wordsToFind', 'cipherCoordinates']
  };
  return generateWithSchema(prompt, schema) as Promise<CoordinateCipherData>;
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

export const generateTargetSearchFromAI = async (gridSize: number, target: string, distractor: string): Promise<TargetSearchData> => {
  const prompt = `
    'Dikkatli Göz' etkinliği oluştur.
    ${gridSize}x${gridSize} boyutunda bir tabloyu '${distractor}' karakteriyle doldur.
    İçine rastgele yerlere 15-20 tane '${target}' karakteri serpiştir.
    Sonucu aşağıdaki JSON formatında döndür.
  `;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      target: { type: Type.STRING },
      distractor: { type: Type.STRING }
    },
    required: ['title', 'grid', 'target', 'distractor']
  };
  return generateWithSchema(prompt, schema) as Promise<TargetSearchData>;
};

export const generateShapeNumberPatternFromAI = async (count: number): Promise<ShapeNumberPatternData> => {
    const prompt = `Generate ${count} shape-based number pattern puzzles for kids. Each puzzle should consist of a few shapes (only triangles for now) containing numbers. There must be a logical rule connecting the numbers in each shape. One number should be a question mark. Provide the rule and the answer.
    Example: Corners sum up to the center.
    Format the output as JSON.`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            patterns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        shapes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['triangle'] },
                                    numbers: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["type", "numbers"]
                            }
                        }
                    },
                    required: ["shapes"]
                }
            }
        },
        required: ["title", "patterns"]
    };
    return generateWithSchema(prompt, schema) as Promise<ShapeNumberPatternData>;
};

export const generateGridDrawingFromAI = async (gridDim: number, count: number): Promise<GridDrawingData> => {
    const prompt = `Create a mirror drawing activity. Generate ${count} simple line patterns on a ${gridDim}x${gridDim} grid. Provide the line coordinates for each pattern. The user will copy the drawing to an empty grid. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            drawings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        lines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.ARRAY,
                                    items: { type: Type.INTEGER },
                                    minItems: 2,
                                    maxItems: 2
                                },
                                minItems: 2,
                                maxItems: 2
                            }
                        }
                    },
                    required: ["lines"]
                }
            }
        },
        required: ["title", "gridDim", "drawings"]
    };
    return generateWithSchema(prompt, schema) as Promise<GridDrawingData>;
};

export const generateColorWheelMemoryFromAI = async (itemCount: number): Promise<ColorWheelMemoryData> => {
    const prompt = `Create a color wheel memory game with ${itemCount} items. Each item must have a name (e.g., "Kitap 📕") and a unique hex color code. Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<ColorWheelMemoryData>;
};


export const generateImageComprehensionFromAI = async (topic: string, questionCount: number): Promise<ImageComprehensionData> => {
    const prompt = `
    Generate a simple, detailed scene description about '${topic}' for an image comprehension test for a 7-year-old. The description should be around 50-70 words.
    Also, create a DALL-E 3 style prompt based on this description to generate a simple, cartoonish, and clear image.
    Then, create ${questionCount} open-ended questions about the details in the scene.
    You MUST NOT generate the image itself, just provide the scene description and the prompt for image generation. For the 'imageBase64' field, return an empty string.
    Format the output as JSON.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            sceneDescription: { type: Type.STRING },
            imageBase64: { type: Type.STRING, description: "This should be an empty string, as you cannot generate images." },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "memorizeTitle", "testTitle", "sceneDescription", "imageBase64", "questions"]
    };
    return generateWithSchema(prompt, schema) as Promise<ImageComprehensionData>;
};

export const generateCharacterMemoryFromAI = async (topic: string, memorizeCount: number, testCount: number): Promise<CharacterMemoryData> => {
    const prompt = `
    Generate a character memory test about '${topic}'.
    Create ${memorizeCount} unique, simple characters. For each, provide a short description (e.g., "Kırmızı şapkalı bir ayıcık").
    Then, create a test list of ${testCount} characters, including the ones to be memorized.
    You MUST NOT generate images. For 'imageBase64' fields, return an empty string.
    Format the output as JSON.
    `;
    const schema = {
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
                        imageBase64: { type: Type.STRING }
                    },
                    required: ["description", "imageBase64"]
                }
            },
            testCharacters: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        imageBase64: { type: Type.STRING }
                    },
                    required: ["description", "imageBase64"]
                }
            }
        },
        required: ["title", "memorizeTitle", "testTitle", "charactersToMemorize", "testCharacters"]
    };
    return generateWithSchema(prompt, schema) as Promise<CharacterMemoryData>;
};

export const generateStorySequencingFromAI = async (topic: string): Promise<StorySequencingData> => {
    const prompt = `Create a story sequencing activity on the topic of '${topic}'. The story should have 4 simple, distinct steps. Provide a short description for each step (panel). The panels should be in a jumbled order. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            panels: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["id", "description"]
                }
            }
        },
        required: ["title", "prompt", "panels"]
    };
    return generateWithSchema(prompt, schema) as Promise<StorySequencingData>;
};

export const generateChaoticNumberSearchFromAI = async (start: number, end: number): Promise<ChaoticNumberSearchData> => {
    const prompt = `Create a chaotic number search puzzle. The user needs to find numbers from ${start} to ${end}. Generate about 100 numbers in total, including the target range and distractors. For each number, provide its value, position (x, y as percentages), size (in rem), rotation (in degrees), and a random hex color. Make the layout chaotic. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            numbers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER },
                        size: { type: Type.NUMBER },
                        rotation: { type: Type.NUMBER },
                        color: { type: Type.STRING }
                    },
                    required: ["value", "x", "y", "size", "rotation", "color"]
                }
            },
            range: {
                type: Type.OBJECT, properties: {
                    start: { type: Type.INTEGER }, end: { type: Type.INTEGER }
                },
                 required: ["start", "end"]
            }
        },
        required: ["title", "prompt", "numbers", "range"]
    };
    return generateWithSchema(prompt, schema) as Promise<ChaoticNumberSearchData>;
};

export const generateBlockPaintingFromAI = async (): Promise<BlockPaintingData> => {
    const prompt = `Create a block painting activity. Define a 10x10 grid. Create 3-4 colored shapes (like Tetris blocks). For each shape, provide a color and a 2D array representing its pattern. The user's goal is to color the grid according to the given shapes. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: { type: Type.OBJECT, properties: { rows: { type: Type.INTEGER }, cols: { type: Type.INTEGER } }, required: ["rows", "cols"]},
            shapes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        color: { type: Type.STRING },
                        pattern: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
                    },
                    required: ["color", "pattern"]
                }
            }
        },
        required: ["title", "prompt", "grid", "shapes"]
    };
    return generateWithSchema(prompt, schema) as Promise<BlockPaintingData>;
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

export const generateVisualOddOneOutFromAI = async (): Promise<VisualOddOneOutData> => {
    const prompt = `Create a visual odd one out puzzle. Generate 4 rows. Each row has 4 items. Each item is a simple shape made of 9 segments (like a digital clock digit). In each row, one item's segment pattern is slightly different. Describe each item by a boolean array of its 9 segments. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    segments: { type: Type.ARRAY, items: { type: Type.BOOLEAN } }
                                },
                                required: ["segments"]
                            }
                        }
                    },
                    required: ["items"]
                }
            }
        },
        required: ["title", "prompt", "rows"]
    };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData>;
};

export const generateShapeCountingFromAI = async (): Promise<ShapeCountingData> => {
    const prompt = `Create a 'count the triangles' puzzle. Generate 1 complex figure composed of overlapping triangles and other shapes. The figure should be represented as a list of SVG paths, each with a 'd' attribute and a fill color. The user's goal is to count all the triangles in the figure. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            figures: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        svgPaths: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    d: { type: Type.STRING },
                                    fill: { type: Type.STRING }
                                },
                                required: ["d", "fill"]
                            }
                        }
                    },
                    required: ["svgPaths"]
                }
            }
        },
        required: ["title", "prompt", "figures"]
    };
    return generateWithSchema(prompt, schema) as Promise<ShapeCountingData>;
};

export const generateSymmetryDrawingFromAI = async (): Promise<SymmetryDrawingData> => {
    const prompt = `Create a symmetry drawing activity. Define an 8x8 grid. Provide a set of dots (x, y coordinates) on one half of the grid (e.g., left half for a vertical axis). The user's goal is to draw the symmetrical reflection. Specify the axis of symmetry ('vertical' or 'horizontal'). Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            dots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.INTEGER },
                        y: { type: Type.INTEGER }
                    },
                    required: ["x", "y"]
                }
            },
            axis: { type: Type.STRING, enum: ['vertical', 'horizontal'] }
        },
        required: ["title", "prompt", "gridDim", "dots", "axis"]
    };
    return generateWithSchema(prompt, schema) as Promise<SymmetryDrawingData>;
};

export const generateBurdonTestFromAI = async (): Promise<LetterGridTestData> => {
    const prompt = `Create a Burdon Attention Test. Generate a 20x20 grid of random lowercase Turkish letters. The target letters to find are "a", "b", "d", "g". Ensure these letters are distributed throughout the grid. Format as JSON, using the LetterGridTestData schema.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            targetLetters: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'grid', 'targetLetters']
    };
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData>;
};

export const generateFindDifferentStringFromAI = async (): Promise<FindDifferentStringData> => {
    const prompt = `Create a "Find the Different String" activity. Generate 10 rows. Each row contains 5 strings. Four of the strings are identical (e.g., "VWN"), and one is slightly different (e.g., "VNW"). The position of the different string should be random in each row. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["items"]
                }
            }
        },
        required: ["title", "prompt", "rows"]
    };
    return generateWithSchema(prompt, schema) as Promise<FindDifferentStringData>;
};

export const generateDotPaintingFromAI = async (): Promise<DotPaintingData> => {
    const prompt = `Create a dot painting activity. Design a simple hidden picture (e.g., a house) on a 15x15 grid. Provide the SVG path data for the grid lines and the viewBox. Provide a list of dots to be colored, with their cx, cy coordinates and a specific color. The user's goal is to color the dots to reveal the picture. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt1: { type: Type.STRING },
            prompt2: { type: Type.STRING },
            svgViewBox: { type: Type.STRING },
            gridPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
            dots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        cx: { type: Type.NUMBER },
                        cy: { type: Type.NUMBER },
                        color: { type: Type.STRING }
                    },
                    required: ["cx", "cy", "color"]
                }
            }
        },
        required: ["title", "prompt1", "prompt2", "svgViewBox", "gridPaths", "dots"]
    };
    return generateWithSchema(prompt, schema) as Promise<DotPaintingData>;
};

export const generateAbcConnectFromAI = async (): Promise<AbcConnectData> => {
    const prompt = `Create an "ABC Connect" puzzle. Generate 2 puzzles on a 6x6 grid. For each puzzle, provide a list of points. Each point has a letter (e.g., 'A', 'B') and x, y coordinates. There should be two points for each letter. The user connects the matching letters. Format as JSON.`;
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
                        gridDim: { type: Type.INTEGER },
                        points: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    letter: { type: Type.STRING },
                                    x: { type: Type.NUMBER },
                                    y: { type: Type.NUMBER }
                                },
                                required: ["letter", "x", "y"]
                            }
                        }
                    },
                    required: ["id", "gridDim", "points"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<AbcConnectData>;
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

export const generateWordConnectFromAI = async (): Promise<WordConnectData> => {
    const prompt = `Create a "Word Connect" activity. On a 10x10 grid, place 5 pairs of related Turkish words (e.g., 'doktor' and 'hastane'). Provide the word, a pairId, and x, y coordinates for each point. The user connects the related words. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["word", "pairId", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    return generateWithSchema(prompt, schema) as Promise<WordConnectData>;
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
    const prompt = `Create a simple 8x8 crossword puzzle for kids in Turkish. Provide 5-6 clues. Some cells should be part of a hidden password. Indicate the password cells and password length. The grid should use 'null' for black cells. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            clues: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        text: { type: Type.STRING }
                    },
                    required: ["id", "text"]
                }
            },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
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
        required: ["title", "prompt", "clues", "grid", "passwordCells", "passwordLength"]
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
    const prompt = `Create a homonym (eş sesli) sentence writing activity. Provide 4 Turkish homonym words. For each word, generate a DALL-E 3 style prompt for a simple image representing one of its meanings. You must not generate the image itself; return an empty string for 'imageBase64'. The user will write two sentences for each word. Format as JSON.`;
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
                        imageBase64: { type: Type.STRING, description: "This should be an empty string." }
                    },
                    required: ["word", "imageBase64"]
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

export const generateProverbSayingSortFromAI = async (): Promise<ProverbSayingSortData> => {
    const prompt = `Create a proverb (atasözü) vs. saying (özdeyiş) sorting activity. Provide a list of 8 items, a mix of Turkish proverbs and sayings. For each item, specify its type. Format as JSON.`;
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
                        text: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['atasözü', 'özdeyiş'] }
                    },
                    required: ["text", "type"]
                }
            }
        },
        required: ["title", "prompt", "items"]
    };
    return generateWithSchema(prompt, schema) as Promise<ProverbSayingSortData>;
};

export const generateHomonymImageMatchFromAI = async (): Promise<HomonymImageMatchData> => {
    const prompt = `Create a homonym image matching puzzle. Provide 3 Turkish homonym words. For each word, provide two different DALL-E 3 style image prompts, one for each meaning. These will be separated into left and right columns. You must not generate images; return an empty string for 'imageBase64'. Also, provide a scrambled word puzzle using one of the homonyms. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            leftImages: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, word: { type: Type.STRING }, imageBase64: { type: Type.STRING } }, required: ["id", "word", "imageBase64"]
                }
            },
            rightImages: {
                type: Type.ARRAY, items: {
                    type: Type.OBJECT, properties: { id: { type: Type.INTEGER }, word: { type: Type.STRING }, imageBase64: { type: Type.STRING } }, required: ["id", "word", "imageBase64"]
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

export const generateProverbWordChainFromAI = async (): Promise<ProverbWordChainData> => {
    const prompt = `Create a proverb word chain activity. Provide a word cloud of about 20 Turkish words. These words can be combined to form 3-4 proverbs or sayings. Provide the correct solutions. For the word cloud, assign a random hex color to each word. Format as JSON.`;
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
    return generateWithSchema(prompt, schema) as Promise<ProverbWordChainData>;
};

export const generateThematicOddOneOutFromAI = async (topic: string): Promise<ThematicOddOneOutData> => {
    const prompt = `Create a thematic odd one out activity with the theme '${topic}'. Generate 4 rows of words. Each row has 4 words; 3 are related to the theme, one is not. Identify the odd word. Provide a prompt for the user to write a sentence with the odd words. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                        oddWord: { type: Type.STRING }
                    },
                    required: ["words", "oddWord"]
                }
            },
            sentencePrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "theme", "rows", "sentencePrompt"]
    };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutData>;
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

export const generatePunctuationMazeFromAI = async(): Promise<PunctuationMazeData> => {
    const prompt = `Create a punctuation maze for the comma (virgül). Provide a title, prompt, and a list of 8 rules about comma usage in Turkish. Some rules should be correct, others incorrect. Mark which ones are correct. The user follows the path of correct rules. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            punctuationMark: { type: Type.STRING },
            rules: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        text: { type: Type.STRING },
                        isCorrect: { type: Type.BOOLEAN }
                    },
                    required: ["id", "text", "isCorrect"]
                }
            }
        },
        required: ["title", "prompt", "punctuationMark", "rules"]
    };
    return generateWithSchema(prompt, schema) as Promise<PunctuationMazeData>;
}

export const generateAntonymResfebeFromAI = async(): Promise<AntonymResfebeData> => {
    const prompt = `Create an antonym Resfebe puzzle. Generate 3 puzzles. For each, provide a word and its antonym. Also, provide a list of clues to form the Resfebe for the *original* word. One of the clues must be an image placeholder. For the image, provide a simple DALL-E style prompt. Return an empty string for 'imageBase64'. The user solves the Resfebe, finds the word, and then writes its antonym. Format as JSON.`;
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
                        imageBase64: { type: Type.STRING },
                        clues: { type: Type.ARRAY, items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING, enum: ['text', 'image'] },
                            },
                             required: ["type"]
                        } }
                    },
                    required: ["word", "antonym", "imageBase64", "clues"]
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

export const generateThematicOddOneOutSentenceFromAI = async(topic: string): Promise<ThematicOddOneOutSentenceData> => {
    const prompt = `Create a thematic odd one out activity similar to ThematicOddOneOutData. The theme is '${topic}'. Generate 4 rows of 4 words each. Three are related, one is not. The user finds the odd words and then writes a sentence with them. The password letters from the odd words form a secret word. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                        oddWord: { type: Type.STRING }
                    },
                    required: ["words", "oddWord"]
                }
            },
            sentencePrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "rows", "sentencePrompt"]
    };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutSentenceData>;
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

export const generateSynonymSearchAndStoryFromAI = async(): Promise<SynonymSearchAndStoryData> => {
    const prompt = `Create a "Synonym Search and Story" activity. Provide a table of 6 Turkish words and their synonyms. Create a 12x12 grid and hide the synonyms. Finally, provide a prompt for the user to write a story using the original words. Format as JSON.`;
    const schema = {
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
    return generateWithSchema(prompt, schema) as Promise<SynonymSearchAndStoryData>;
}

export const generateColumnOddOneOutSentenceFromAI = async(): Promise<ColumnOddOneOutSentenceData> => {
    const prompt = `Create a "Column Odd One Out" activity. Provide 4 columns of words. Each column has 4 words. In each column, 3 words are related, and one is not. Identify the odd word for each column. Provide a prompt for the user to write a sentence with the odd words. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            columns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                        oddWord: { type: Type.STRING }
                    },
                    required: ["words", "oddWord"]
                }
            },
            sentencePrompt: { type: Type.STRING }
        },
        required: ["title", "prompt", "columns", "sentencePrompt"]
    };
    return generateWithSchema(prompt, schema) as Promise<ColumnOddOneOutSentenceData>;
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

export const generatePunctuationPhoneNumberFromAI = async(): Promise<PunctuationPhoneNumberData> => {
    const prompt = `Create a "Punctuation Phone Number" puzzle. Provide 7 clues related to Turkish punctuation rules. Each clue corresponds to a number. For example, "The mark at the end of a question sentence". The user must identify the punctuation mark from the clue. Create a solution map that links each punctuation mark to a digit (0-9). The user uses this map to find the secret phone number. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            clues: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        text: { type: Type.STRING }
                    },
                    required: ["id", "text"]
                }
            },
            solution: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        punctuationMark: { type: Type.STRING },
                        number: { type: Type.INTEGER }
                    },
                    required: ["punctuationMark", "number"]
                }
            }
        },
        required: ["title", "prompt", "instruction", "clues", "solution"]
    };
    return generateWithSchema(prompt, schema) as Promise<PunctuationPhoneNumberData>;
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

export const generateNumberPyramidFromAI = async(): Promise<NumberPyramidData> => {
    const prompt = `Create a number pyramid (addition) puzzle. Generate 2 pyramids. Each pyramid has 4-5 rows. A number in a cell is the sum of the two cells directly below it. Some cells should be empty (null). Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pyramids: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
                    },
                    required: ["title", "rows"]
                }
            }
        },
        required: ["title", "prompt", "pyramids"]
    };
    return generateWithSchema(prompt, schema) as Promise<NumberPyramidData>;
}

export const generateNumberCapsuleFromAI = async(): Promise<NumberCapsuleData> => {
    const prompt = `Create a number capsule (Kakuro-style) puzzle. Generate 1 puzzle on a 4x4 grid. Some cells are empty (null). Define several 'capsules' (groups of cells) and their target sums. The user must fill the grid with numbers from a given set (e.g., 1-9) without repetition in a capsule. Format as JSON.`;
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
                        title: { type: Type.STRING },
                        numbersToUse: { type: Type.STRING },
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        capsules: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    cells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } },
                                    sum: { type: Type.INTEGER }
                                },
                                required: ["cells", "sum"]
                            }
                        }
                    },
                    required: ["title", "numbersToUse", "grid", "capsules"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<NumberCapsuleData>;
}

export const generateOddEvenSudokuFromAI = async(): Promise<OddEvenSudokuData> => {
    const prompt = `Create a 6x6 Odd-Even Sudoku. Generate 1 puzzle. The grid has some pre-filled numbers. Some empty cells are marked (shaded) and must contain an even number, while unmarked empty cells must contain an odd number. Provide the grid and the coordinates of the shaded (even) cells. Format as JSON.`;
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
                        title: { type: Type.STRING },
                        numbersToUse: { type: Type.STRING },
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        constrainedCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } }
                    },
                    required: ["title", "numbersToUse", "grid", "constrainedCells"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<OddEvenSudokuData>;
}

export const generateRomanNumeralConnectFromAI = async(): Promise<RomanNumeralConnectData> => {
    const prompt = `Create a Roman Numeral Connect puzzle, similar to ABC Connect. Generate 1 puzzle on a 6x6 grid. Provide a list of points. Each point has a Roman numeral label ('I', 'II', 'III', etc.) and x, y coordinates. There should be two points for each numeral. The user connects the matching numerals. Format as JSON.`;
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
                        title: { type: Type.STRING },
                        gridDim: { type: Type.INTEGER },
                        points: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    x: { type: Type.NUMBER },
                                    y: { type: Type.NUMBER }
                                },
                                required: ["label", "x", "y"]
                            }
                        }
                    },
                    required: ["title", "gridDim", "points"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralConnectData>;
}

export const generateRomanNumeralStarHuntFromAI = async(): Promise<RomanNumeralStarHuntData> => {
    const prompt = `Create a Roman Numeral Star Hunt puzzle. Generate a 6x6 grid. Some cells contain Roman numerals, which act as clues. The rule is that each cell with a Roman numeral must be adjacent (horizontally, vertically, or diagonally) to exactly that many stars. Generate the grid with the clues and specify the total number of stars to be found. Use 'null' for empty cells. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            starCount: { type: Type.INTEGER }
        },
        required: ["title", "prompt", "grid", "starCount"]
    };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralStarHuntData>;
}

export const generateRoundingConnectFromAI = async(): Promise<RoundingConnectData> => {
    const prompt = `Create a Rounding Connect puzzle. Generate a set of 12 numbers to be placed randomly in a box. The numbers belong to 4 groups, where each group rounds to the same value (e.g., numbers that round to 50). Provide each number's value, its group ID, and its x, y coordinates (percentages). The user connects numbers in the same group. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            example: { type: Type.STRING },
            numbers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.INTEGER },
                        group: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["value", "group", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "example", "numbers"]
    };
    return generateWithSchema(prompt, schema) as Promise<RoundingConnectData>;
}

export const generateRomanNumeralMultiplicationFromAI = async(): Promise<RomanNumeralMultiplicationData> => {
    const prompt = `Create a Roman Numeral Multiplication Square puzzle. Generate 2 puzzles. Each is a 2x2 grid where the user multiplies the numbers/numerals in the first row and column to fill the inner cells. Some cells should be pre-filled (with Roman numerals or Arabic numbers), others should be empty (null). Format as JSON.`;
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
                        row1: { type: Type.STRING },
                        row2: { type: Type.STRING },
                        col1: { type: Type.STRING },
                        col2: { type: Type.STRING },
                        results: {
                            type: Type.OBJECT,
                            properties: {
                                r1c1: { type: Type.STRING },
                                r1c2: { type: Type.STRING },
                                r2c1: { type: Type.STRING },
                                r2c2: { type: Type.STRING }
                            },
                            required: ["r1c1", "r1c2", "r2c1", "r2c2"]
                        }
                    },
                    required: ["row1", "row2", "col1", "col2", "results"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<RomanNumeralMultiplicationData>;
}

export const generateArithmeticConnectFromAI = async(): Promise<ArithmeticConnectData> => {
    const prompt = `Create an Arithmetic Connect puzzle. Generate a set of 12 arithmetic expressions (e.g., "50+27") to be placed randomly in a box. The expressions belong to 4 groups with the same result. Provide each expression's text, its result value, its group ID, and its x, y coordinates. The user connects expressions in the same group. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            example: { type: Type.STRING },
            expressions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        value: { type: Type.INTEGER },
                        group: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["text", "value", "group", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "example", "expressions"]
    };
    return generateWithSchema(prompt, schema) as Promise<ArithmeticConnectData>;
}

export const generateRomanArabicMatchConnectFromAI = async(): Promise<RomanArabicMatchConnectData> => {
    const prompt = `Create a Roman-Arabic numeral matching connect puzzle. On a 10x10 grid, place 5 pairs of matching numerals (e.g., 'IX' and '9'). Provide the label, a pairId, and x, y coordinates for each point. The user connects the matching pairs. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["label", "pairId", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    return generateWithSchema(prompt, schema) as Promise<RomanArabicMatchConnectData>;
}

export const generateSudoku6x6ShadedFromAI = async(): Promise<Sudoku6x6ShadedData> => {
    const prompt = `Create a 6x6 Sudoku with a twist. This is the same as OddEvenSudokuData, but specifically for a 6x6 grid. Generate 1 puzzle. Some empty cells are shaded and must contain even numbers. Provide the partially filled grid and the coordinates of the shaded cells. Format as JSON.`;
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
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        shadedCells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } }
                    },
                    required: ["grid", "shadedCells"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<Sudoku6x6ShadedData>;
}

export const generateKendokuFromAI = async(): Promise<KendokuData> => {
    const prompt = `Create a 4x4 Kendoku (Calcudoku) puzzle. Generate 1 puzzle. Provide the size, an empty grid, and a list of 'cages'. Each cage specifies the cells it contains, the arithmetic operation (+, −, ×, ÷), and the target number. Format as JSON.`;
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
                        size: { type: Type.INTEGER },
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        cages: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    cells: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } }, required: ["row", "col"] } },
                                    operation: { type: Type.STRING, enum: ['+', '−', '×', '÷'] },
                                    target: { type: Type.INTEGER }
                                },
                                required: ["cells", "operation", "target"]
                            }
                        }
                    },
                    required: ["size", "grid", "cages"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<KendokuData>;
}

export const generateDivisionPyramidFromAI = async(): Promise<DivisionPyramidData> => {
    const prompt = `Create a division number pyramid puzzle. Generate 2 pyramids. Each has 4-5 rows. A number in a cell is the result of dividing the number above it by the one to its left or right. Some cells should be empty (null). Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pyramids: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
                    },
                    required: ["rows"]
                }
            }
        },
        required: ["title", "prompt", "pyramids"]
    };
    return generateWithSchema(prompt, schema) as Promise<DivisionPyramidData>;
}

export const generateMultiplicationPyramidFromAI = async(): Promise<MultiplicationPyramidData> => {
    const prompt = `Create a multiplication number pyramid puzzle. Generate 2 pyramids. Each has 4 rows. A number in a cell (above the base) is the product of the two cells directly below it. Some cells should be empty (null). Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pyramids: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } }
                    },
                    required: ["rows"]
                }
            }
        },
        required: ["title", "prompt", "pyramids"]
    };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationPyramidData>;
}

export const generateOperationSquareSubtractionFromAI = async(): Promise<OperationSquareSubtractionData> => {
    const prompt = `Create a 3x3 operation square puzzle using subtraction. Fill a grid with numbers and operation signs ('-', '=') such that the rows and columns form correct equations. Some numbers should be missing (represented by null). Generate 2 such puzzles. Format as JSON.`;
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
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                    },
                    required: ["grid"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareSubtractionData>;
}

export const generateOperationSquareFillInDataFromAI = async(): Promise<OperationSquareFillInData> => {
    const prompt = `Create a 3x3 operation square fill-in puzzle. Provide an empty grid with operations, a list of numbers to use, and the results for rows/columns. The user must place the numbers correctly. Generate 2 puzzles. Format as JSON.`;
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
                        numbersToUse: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        results: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                    },
                    required: ["grid", "numbersToUse", "results"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareFillInData>;
}

export const generateMultiplicationWheelFromAI = async(): Promise<MultiplicationWheelData> => {
    const prompt = `Create a multiplication wheel puzzle. Generate 2 puzzles. Each wheel has a center number (the multiplier). There are 8 outer numbers to be multiplied by the center number to get the inner results. Some outer numbers or inner results should be missing (null). Format as JSON.`;
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
                        outerNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        innerResult: { type: Type.INTEGER }
                    },
                    required: ["outerNumbers", "innerResult"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<MultiplicationWheelData>;
}

export const generateTargetNumberFromAI = async (mode: 'numbers' | 'currency'): Promise<TargetNumberData> => {
    const prompt = `Create a 'Target Number' puzzle. Generate 3 puzzles. For each puzzle, provide a target number and 4-5 given numbers. The user must use arithmetic operations to reach the target. If mode is 'currency', use numbers that represent common Turkish Lira coin/bill values. Format as JSON.`;
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
                        target: { type: Type.INTEGER },
                        givenNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                    },
                    required: ["target", "givenNumbers"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<TargetNumberData>;
};

export const generateOperationSquareMultDivFromAI = async (): Promise<OperationSquareMultDivData> => {
    const prompt = `Create a 3x3 operation square puzzle using multiplication and division. Fill a grid with numbers and operation signs ('x', '÷', '=') such that the rows and columns form correct equations. Some numbers should be missing (represented by null). Generate 2 such puzzles. Format as JSON.`;
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
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                    },
                    required: ["grid"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<OperationSquareMultDivData>;
};

export const generateFutoshikiFromAI = async (): Promise<FutoshikiData> => {
    const prompt = `Create a 4x4 Futoshiki puzzle. Pre-fill some cells with numbers. Provide 3-4 inequality constraints ('>' or '<') between adjacent cells. The user must fill the grid from 1-4. Generate 2 such puzzles. Format as JSON.`;
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
                        size: { type: Type.INTEGER },
                        numbers: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                        constraints: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    row1: { type: Type.INTEGER }, col1: { type: Type.INTEGER },
                                    row2: { type: Type.INTEGER }, col2: { type: Type.INTEGER },
                                    symbol: { type: Type.STRING, enum: ['>', '<'] }
                                },
                                required: ["row1", "col1", "row2", "col2", "symbol"]
                            }
                        }
                    },
                    required: ["size", "numbers", "constraints"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<FutoshikiData>;
};

export const generateShapeSudokuFromAI = async (): Promise<ShapeSudokuData> => {
    const prompt = `Create a 4x4 Shape Sudoku puzzle. Use 4 different shapes from this list: ${SHAPE_TYPES.join(', ')}. Pre-fill some cells in the grid with shapes. Provide the list of shapes to use. The user must complete the Sudoku. Generate 2 such puzzles. Format as JSON.`;
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
                        shapesToUse: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    shape: { type: Type.STRING, enum: SHAPE_TYPES },
                                    label: { type: Type.STRING }
                                },
                                required: ["shape", "label"]
                            }
                        }
                    },
                    required: ["grid", "shapesToUse"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<ShapeSudokuData>;
};

export const generateWeightConnectFromAI = async (): Promise<WeightConnectData> => {
    const prompt = `Create a 'Weight Connect' activity. On an 8x8 grid, place 5 pairs of equal weights (e.g., '1000 g' and '1 kg'). Provide the label, a pairId, and x, y coordinates for each point. The user connects the equal weights. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["label", "pairId", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    return generateWithSchema(prompt, schema) as Promise<WeightConnectData>;
};

export const generateResfebeFromAI = async (): Promise<ResfebeData> => {
    const prompt = `Create a Resfebe puzzle. Generate 4 puzzles. A Resfebe is a word puzzle that uses pictures and letters. For each puzzle, provide a list of clues (which can be text or an image placeholder) and the answer word. For image clues, provide a DALL-E 3 style prompt for a simple icon. You must not generate images; return an empty string for 'imageBase64'. Format as JSON.`;
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
                        clues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['text', 'image'] },
                                    value: { type: Type.STRING },
                                    imageBase64: { type: Type.STRING }
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
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<ResfebeData>;
};

export const generateFutoshikiLengthFromAI = async (): Promise<FutoshikiLengthData> => {
    const prompt = `Create a 4x4 Futoshiki puzzle using length units. The units to place are 'mm', 'cm', 'm', 'km'. Pre-fill some cells. Provide 3-4 inequality constraints ('>' or '<') between adjacent cells. The user must fill the grid. Generate 1 puzzle. Format as JSON.`;
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
                        size: { type: Type.INTEGER },
                        units: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                        constraints: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    row1: { type: Type.INTEGER }, col1: { type: Type.INTEGER },
                                    row2: { type: Type.INTEGER }, col2: { type: Type.INTEGER },
                                    symbol: { type: Type.STRING, enum: ['>', '<'] }
                                },
                                required: ["row1", "col1", "row2", "col2", "symbol"]
                            }
                        }
                    },
                    required: ["size", "units", "constraints"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<FutoshikiLengthData>;
};

export const generateMatchstickSymmetryFromAI = async (): Promise<MatchstickSymmetryData> => {
    const prompt = `Create a matchstick symmetry puzzle. Generate 2 puzzles. For each, create a simple shape using 5-7 matchsticks on one side of a symmetry line. Provide the coordinates (x1, y1, x2, y2) for each line segment representing a matchstick. The user will draw the reflection. Format as JSON.`;
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
                        number: { type: Type.INTEGER },
                        lines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    x1: { type: Type.NUMBER }, y1: { type: Type.NUMBER },
                                    x2: { type: Type.NUMBER }, y2: { type: Type.NUMBER }
                                },
                                required: ["x1", "y1", "x2", "y2"]
                            }
                        }
                    },
                    required: ["number", "lines"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<MatchstickSymmetryData>;
};

export const generateWordWebFromAI = async (): Promise<WordWebData> => {
    const prompt = `Create a 'Word Web' puzzle. Provide a list of 8 related Turkish words. Create a crossword-style grid (10x10) and place 7 of them. The letters in the intersecting cells should form a final key word. Use 'null' for black cells. Provide a prompt for the key word. Format as JSON.`;
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

export const generateStarHuntFromAI = async (): Promise<StarHuntData> => {
    const prompt = `Create a 'Star Hunt' puzzle based on geometric solids for kids. Generate a 5x5 grid. Place different solids ('cube', 'sphere', 'pyramid', 'cone') and 'star' symbols in some cells. The rule is: the number shown on a solid in a cell indicates how many stars are in that solid's row and column combined. One cell must contain a 'question' mark instead of a solid. The user must deduce which solid belongs in the question mark cell based on the star counts. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            grid: {
                type: Type.ARRAY,
                items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        },
        required: ["title", "prompt", "grid"]
    };
    return generateWithSchema(prompt, schema) as Promise<StarHuntData>;
};

export const generateLengthConnectFromAI = async (): Promise<LengthConnectData> => {
    const prompt = `Create an 'ABC Connect (Length)' activity. On a 10x10 grid area (1000x1000 logical units), place 5 pairs of equal length units (e.g., '500 cm' and '5 m'). For each unit, provide a label, a unique pairId for matching, and random x, y coordinates between 50 and 950. The user connects the equal lengths. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        pairId: { type: Type.INTEGER },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["label", "pairId", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    return generateWithSchema(prompt, schema) as Promise<LengthConnectData>;
};

export const generateVisualNumberPatternFromAI = async (): Promise<VisualNumberPatternData> => {
    const prompt = `Create a 'Visual Number Pattern' puzzle. Generate 2 puzzles. Each puzzle should have a sequence of 5 items. Each item has a number, a color, and a size multiplier. The numbers should follow a simple arithmetic rule. One number in the sequence should be 0 or -1, to be replaced with a '?'. The size and color should vary to create a visual pattern, but the core logic is in the numbers. Provide the rule and the correct answer for the '?'. Format as JSON.`;
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
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    number: { type: Type.INTEGER },
                                    color: { type: Type.STRING },
                                    size: { type: Type.NUMBER }
                                },
                                required: ["number", "color", "size"]
                            }
                        },
                        rule: { type: Type.STRING },
                        answer: { type: Type.INTEGER }
                    },
                    required: ["items", "rule", "answer"]
                }
            }
        },
        required: ["title", "prompt", "puzzles"]
    };
    return generateWithSchema(prompt, schema) as Promise<VisualNumberPatternData>;
};

export const generateMissingPartsFromAI = async (): Promise<MissingPartsData> => {
    const prompt = `Create a 'Missing Parts' word puzzle. Generate a list of 12 two-syllable Turkish words. For each word, create two "parts" by splitting the word into its syllables. Then, create a "leftParts" list containing the first syllables and a "rightParts" list containing the second syllables. These two lists should have their items shuffled so they don't correspond. Also provide the full list of given word parts (all 24 syllables) in a shuffled list. Format as JSON.`;
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
};

export const generateProfessionConnectFromAI = async (): Promise<ProfessionConnectData> => {
    const prompt = `Create a 'Profession Connect' activity. Generate 6 pairs of points to be placed on a 1000x1000 logical grid. Each pair represents a profession. One point in the pair is the name of the profession (e.g., "Aşçı"). The other point is a simple image description of that profession (e.g., "Mutfakta yemek yapan bir kişi"). Assign random x,y coordinates (between 50-950) to each of the 12 points. For image points, the 'label' should be an empty string. For text points, the 'imageDescription' should be empty. Return an empty string for all 'imageBase64' fields. Format as JSON.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            gridDim: { type: Type.INTEGER },
            points: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        imageDescription: { type: Type.STRING },
                        imageBase64: { type: Type.STRING },
                        x: { type: Type.NUMBER },
                        y: { type: Type.NUMBER }
                    },
                    required: ["label", "imageDescription", "x", "y"]
                }
            }
        },
        required: ["title", "prompt", "gridDim", "points"]
    };
    return generateWithSchema(prompt, schema) as Promise<ProfessionConnectData>;
};


// New functions for activities from images
export const generateVisualOddOneOutThemedFromAI = async (topic: string): Promise<VisualOddOneOutThemedData> => {
  const prompt = `Generate a 'Themed Visual Odd One Out' activity about professions. Create 4 rows. Each row is about one profession (e.g., 'Doktor', 'Öğretmen'). For each profession, provide 5 simple image descriptions for a DALL-E style prompt: 4 related to the profession and 1 unrelated. Specify the index of the unrelated (odd one out) description. The theme should be '${topic}'. Format as JSON.`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      prompt: { type: Type.STRING },
      rows: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            imageDescriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            oddOneOutIndex: { type: Type.INTEGER },
          },
          required: ["theme", "imageDescriptions", "oddOneOutIndex"],
        },
      },
    },
    required: ["title", "prompt", "rows"],
  };
  return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutThemedData>;
};

export const generateLogicGridPuzzleFromAI = async (): Promise<LogicGridPuzzleData> => {
  const prompt = `Generate a logic grid puzzle for kids. The puzzle is about 4 students (Ahmet, Eda, Ali, Eylül) and 4 courses (painting, basketball, chess, guitar). Provide 4 clues to solve the puzzle, like "Ahmet goes to a course that uses paints and brushes." or "Ali did not go to a course related to music.". The goal is to match each student to their course. Provide the list of people and a list of categories with items (e.g., category 'Kurslar', items 'Resim', 'Basketbol', etc.). For each course, provide a simple image description. Format as JSON.`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      prompt: { type: Type.STRING },
      clues: { type: Type.ARRAY, items: { type: Type.STRING } },
      people: { type: Type.ARRAY, items: { type: Type.STRING } },
      categories: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  imageDescription: { type: Type.STRING },
                },
                required: ["name", "imageDescription"],
              },
            },
          },
          required: ["title", "items"],
        },
      },
    },
    required: ["title", "prompt", "clues", "people", "categories"],
  };
  return generateWithSchema(prompt, schema) as Promise<LogicGridPuzzleData>;
};

export const generateImageAnagramSortFromAI = async (): Promise<ImageAnagramSortData> => {
  const prompt = `Generate an 'Image Anagram Sort' activity. Create 8 cards. Each card represents a profession. For each card, provide a simple image description (e.g., 'A chef cooking in a kitchen'), a scrambled version of the profession name (e.g., 'AŞÇI' -> 'IÇAŞ'), and the correct profession name. Format as JSON.`;
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
            scrambledWord: { type: Type.STRING },
            correctWord: { type: Type.STRING },
          },
          required: ["imageDescription", "scrambledWord", "correctWord"],
        },
      },
    },
    required: ["title", "prompt", "cards"],
  };
  return generateWithSchema(prompt, schema) as Promise<ImageAnagramSortData>;
};

export const generateAnagramImageMatchFromAI = async (): Promise<AnagramImageMatchData> => {
  const prompt = `Generate an 'Anagram Image Match' puzzle. Create a word bank of 8 scrambled Turkish words. Then, create 8 puzzles. Each puzzle consists of a simple image description and a 'partial answer' which is the correct word with some letters revealed as hints (e.g., '_Ü__Ü_' for 'GÜNLÜK'). The correct word should be one of the unscrambled words from the word bank. Format as JSON.`;
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
            partialAnswer: { type: Type.STRING },
            correctWord: { type: Type.STRING },
          },
          required: ["imageDescription", "partialAnswer", "correctWord"],
        },
      },
    },
    required: ["title", "prompt", "wordBank", "puzzles"],
  };
  return generateWithSchema(prompt, schema) as Promise<AnagramImageMatchData>;
};

export const generateSyllableWordSearchFromAI = async (): Promise<SyllableWordSearchData> => {
  const prompt = `Generate a 'Syllable Word Search' activity. First, provide a list of 16 Turkish syllables. Then, provide 6 pairs of these syllables that can be combined to form 6 meaningful words, along with the correct answers. Next, create a list of 10 related words to find in a word search. Then, generate a 12x12 word search grid containing these 10 words. Finally, provide a prompt for a hidden password made from the unused letters in the word search. Format as JSON.`;
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
            answer: { type: Type.STRING },
          },
          required: ["syllable1", "syllable2", "answer"],
        },
      },
      wordsToFindInSearch: { type: Type.ARRAY, items: { type: Type.STRING } },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      passwordPrompt: { type: Type.STRING },
    },
    required: ["title", "prompt", "syllablesToCombine", "wordsToCreate", "wordsToFindInSearch", "grid", "passwordPrompt"],
  };
  return generateWithSchema(prompt, schema) as Promise<SyllableWordSearchData>;
};

export const generateWordSearchWithPasswordFromAI = async (): Promise<WordSearchWithPasswordData> => {
  const prompt = `Generate a 'Word Search with Password' activity. Create a list of 12-15 related Turkish words. Place them in a 15x15 grid. Some cells in the grid, which may or may not be part of the hidden words, should be marked as password cells. These password cells, when read in order, will reveal a hidden word. Provide the grid, the list of words, and the coordinates of the password cells. Format as JSON.`;
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
            col: { type: Type.INTEGER },
          },
          required: ["row", "col"],
        },
      },
    },
    required: ["title", "prompt", "grid", "words", "passwordCells"],
  };
  return generateWithSchema(prompt, schema) as Promise<WordSearchWithPasswordData>;
};

export const generateWordWebWithPasswordFromAI = async (): Promise<WordWebWithPasswordData> => {
  const prompt = `Generate a 'Word Web with Password' activity. It's a type of crossword. Provide a list of 12 thematically related Turkish words. Create a 12x12 grid and place these words in it like a crossword puzzle. Use 'null' for black cells. One column in the grid should be highlighted as the password column. The letters in this column will form a secret word. Provide the grid, the word list, and the 0-based index of the password column. Format as JSON.`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      prompt: { type: Type.STRING },
      words: { type: Type.ARRAY, items: { type: Type.STRING } },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      passwordColumnIndex: { type: Type.INTEGER },
    },
    required: ["title", "prompt", "words", "grid", "passwordColumnIndex"],
  };
  return generateWithSchema(prompt, schema) as Promise<WordWebWithPasswordData>;
};

export const generateLetterGridWordFindFromAI = async (): Promise<LetterGridWordFindData> => {
  const prompt = `Generate a 'Letter Grid Word Find' activity. Create a 10x8 grid of letters. This is NOT a standard word search; it's just a block of letters. Provide a list of 8 hidden words that can be found within this grid (they can be formed by adjacent letters, but not in straight lines). Finally, provide a prompt asking the user to write a short text using the found words. Format as JSON.`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      prompt: { type: Type.STRING },
      words: { type: Type.ARRAY, items: { type: Type.STRING } },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      writingPrompt: { type: Type.STRING },
    },
    required: ["title", "prompt", "words", "grid", "writingPrompt"],
  };
  return generateWithSchema(prompt, schema) as Promise<LetterGridWordFindData>;
};

export const generateWordPlacementPuzzleFromAI = async (): Promise<WordPlacementPuzzleData> => {
  const prompt = `Generate a 'Word Placement' puzzle. Create an empty crossword-style grid (approx 12x12). Use 'null' for black/unusable cells and an empty string "" for fillable cells. Provide a list of words, grouped by their length (e.g., 3-letter words, 4-letter words, etc.). Also, provide a prompt about an unused word after filling the puzzle. Format as JSON.`;
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
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["length", "words"],
        },
      },
      unusedWordPrompt: { type: Type.STRING },
    },
    required: ["title", "prompt", "grid", "wordGroups", "unusedWordPrompt"],
  };
  return generateWithSchema(prompt, schema) as Promise<WordPlacementPuzzleData>;
};

export const generatePositionalAnagramFromAI = async (): Promise<PositionalAnagramData> => {
  const prompt = `Generate a 'Positional Anagram' puzzle. Create 10 puzzles. For each puzzle, provide a scrambled Turkish word and its correct form. The puzzle involves rearranging the letters to find the correct word. The UI will show numbered boxes. Format as JSON.`;
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
            answer: { type: Type.STRING },
          },
          required: ["id", "scrambled", "answer"],
        },
      },
    },
    required: ["title", "prompt", "puzzles"],
  };
  return generateWithSchema(prompt, schema) as Promise<PositionalAnagramData>;
};
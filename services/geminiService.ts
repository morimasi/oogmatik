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
    AntonymFlowerPuzzleData, ProverbWordChainData, ThematicOddOneOutData, SynonymAntonymGridData, PunctuationColoringData
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
        const parsed = JSON.parse(response.text);
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
        },
      },
    },
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
        },
      },
    },
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
                },
            },
        },
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
                },
            },
        },
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
                },
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<SpellingCheckData>;
};

export const generateLetterGridFromAI = async (gridSize: number, letters: string): Promise<LetterGridTestData> => {
    const targetLetters = letters.split(',').map(l => l.trim().toLowerCase());
    const prompt = `
    ${gridSize}x${gridSize} boyutunda bir harf ızgarası oluştur.
    Izgarayı rastgele Türkçe küçük harflerle doldur.
    Aranacak hedef harfler şunlar olacak: ${targetLetters.join(', ')}.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the letter grid test.' },
            grid: {
                type: Type.ARRAY,
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            targetLetters: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData>;
};

export const generateNumberSearchFromAI = async (rangeStart: number, rangeEnd: number): Promise<NumberSearchData> => {
    const numberCount = (rangeEnd - rangeStart + 1) * 3; // Fill with 3x the numbers needed
    const prompt = `
    ${rangeStart} ile ${rangeEnd} arasındaki tüm sayıları içeren, ancak toplamda ${numberCount} adet rastgele sayıdan oluşan bir liste oluştur. Sayılar 1 ile ${rangeEnd * 1.5} arasında olabilir.
    Bu listeyi rastgele karıştır.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the number search activity.' },
            numbers: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
            },
            range: {
                type: Type.OBJECT,
                properties: {
                    start: { type: Type.INTEGER },
                    end: { type: Type.INTEGER },
                }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<NumberSearchData>;
};

export const generateWordMemoryFromAI = async (topic: string, memorizeCount: number, testCount: number): Promise<WordMemoryData> => {
    const prompt = `
    Çocuklar için '${topic}' konusunda bir kelime hafıza oyunu oluştur.
    İlk olarak, ezberlenmesi gereken ${memorizeCount} tane kelime seç.
    İkinci olarak, bu ${memorizeCount} kelimeyi de içeren toplam ${testCount} kelimelik bir test listesi oluştur. Bu test listesindeki kelimelerin sırasını karıştır.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The main title of the activity.' },
            memorizeTitle: { type: Type.STRING, description: 'Title for the memorization part, e.g., "Bu Kelimeleri Ezberle".' },
            testTitle: { type: Type.STRING, description: 'Title for the test part, e.g., "Ezberlediğin Kelimeleri İşaretle".' },
            wordsToMemorize: { type: Type.ARRAY, items: { type: Type.STRING } },
            testWords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<WordMemoryData>;
};

export const generateStoryPromptFromAI = async (topic: string, keywordCount: number): Promise<StoryCreationPromptData> => {
    const prompt = `
    Çocuklar için '${topic}' konusunda bir hikaye yazma etkinliği oluştur.
    Hikayede kullanılması gereken ${keywordCount} tane anahtar kelime belirle.
    Kısa ve teşvik edici bir başlık ve bir etkinlik açıklaması (prompt) yaz.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            prompt: { type: Type.STRING, description: 'The instruction/prompt for the user.' },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<StoryCreationPromptData>;
};

export const generateFindTheDifferenceFromAI = async (topic: string, rowCount: number): Promise<FindTheDifferenceData> => {
    const prompt = `
    Çocuklar için '${topic}' konusuyla ilgili bir 'farklı olanı bul' etkinliği oluştur. 
    ${rowCount} tane satır oluştur. Her satırda, biri diğerlerinden farklı olan 4 tane basit kelime bulunsun.
    Örneğin: [elma, elma, muz, elma].
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.INTEGER, description: '0-based index of the different item.' },
                    }
                }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<FindTheDifferenceData>;
};

export const generateWordComparisonFromAI = async (topic: string): Promise<WordComparisonData> => {
    const prompt = `
    Çocuklar için '${topic}' konusunda bir kelime karşılaştırma etkinliği oluştur. 
    Her biri yaklaşık 10-12 kelime içeren iki liste hazırla. 
    Listelerde bazı ortak kelimeler ve her listeye özgü bazı farklı kelimeler bulunsun.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            box1Title: { type: Type.STRING, description: 'Title for the first list.' },
            box2Title: { type: Type.STRING, description: 'Title for the second list.' },
            wordList1: { type: Type.ARRAY, items: { type: Type.STRING } },
            wordList2: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<WordComparisonData>;
};

export const generateWordsInStoryFromAI = async (topic: string): Promise<WordsInStoryData> => {
    const prompt = `
    7 yaşındaki bir çocuk için '${topic}' konusunda 100 kelimelik kısa bir Türkçe hikaye yaz.
    Sonra, 12 kelimelik bir liste oluştur. Bu kelimelerin yaklaşık yarısı hikayede geçsin, yarısı geçmesin.
    Her kelime için hikayede geçip geçmediğini boolean olarak belirt.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the story.' },
            story: { type: Type.STRING, description: 'The story text.' },
            wordList: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        isInStory: { type: Type.BOOLEAN },
                    }
                }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<WordsInStoryData>;
};

export const generateOddOneOutFromAI = async (topic: string, groupCount: number): Promise<OddOneOutData> => {
    const prompt = `
    Çocuklar için '${topic}' konusunda bir 'Farkı Fark Et' (anlamsal olarak farklı olanı bulma) etkinliği oluştur.
    ${groupCount} tane grup oluştur. Her grup, biri anlamsal olarak diğerleriyle alakasız olan 4 kelime içersin.
    Örnek: ["kedi", "köpek", "elma", "kuş"] - burada "elma" farklıdır.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            groups: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<OddOneOutData>;
};

export const generateShapeMatchingFromAI = async (rowCount: number): Promise<ShapeMatchingData> => {
    const shapes: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond'];
    const prompt = `
    Çocuklar için bir şekil eşleştirme etkinliği oluştur.
    ${rowCount} tane öğe içeren bir sol sütun oluştur. Her öğe 4 farklı şekilden oluşan bir dizi olsun.
    Bu ${rowCount} öğeyi içeren bir sağ sütun oluştur, ancak sağdaki öğelerin sırasını karıştır.
    Kullanılacak şekiller: ${shapes.join(', ')}.
    Sol sütundaki id'ler sayı, sağ sütundaki id'ler harf olsun (A, B, C...).
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            leftColumn: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.INTEGER },
                        shapes: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            },
            rightColumn: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        shapes: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ShapeMatchingData>;
};

export const generateSymbolCipherFromAI = async (wordCount: number): Promise<SymbolCipherData> => {
    const shapes: ShapeType[] = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond', 'pentagon', 'octagon'];
    const prompt = `
    Çocuklar için bir şekil şifre çözme etkinliği oluştur.
    İlk olarak, 5-6 tane Türkçe harfi rastgele seç ve her birini şu şekillerden biriyle eşleştir: ${shapes.join(', ')}. Bu bizim şifre anahtarımız olacak.
    İkinci olarak, bu harfleri kullanarak ${wordCount} tane 4-5 harfli kelime oluştur.
    Bu kelimeleri şifre anahtarını kullanarak şekil dizilerine dönüştür.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            cipherKey: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        shape: { type: Type.STRING },
                        letter: { type: Type.STRING },
                    }
                }
            },
            wordsToSolve: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        shapeSequence: { type: Type.ARRAY, items: { type: Type.STRING } },
                        wordLength: { type: Type.INTEGER }
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<SymbolCipherData>;
};

export const generateProverbFillFromAI = async (count: number): Promise<ProverbFillData> => {
    const prompt = `
    Çocukların anlayabileceği, yaygın olarak bilinen ${count} tane Türkçe atasözü seç.
    Her atasözünün ortasından bir kelimeyi çıkar. Atasözünü bu eksik kelimeye kadar olan kısım (start) ve eksik kelimeden sonraki kısım (end) olarak ikiye ayır.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            proverbs: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        start: { type: Type.STRING },
                        end: { type: Type.STRING },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ProverbFillData>;
};

export const generateLetterBridgeFromAI = async (count: number): Promise<LetterBridgeData> => {
    const prompt = `
    Bir 'Harf Köprüsü' etkinliği için ${count} tane kelime çifti oluştur. 
    Her çiftte, birinci kelimenin sonuna ve ikinci kelimenin başına aynı harf eklendiğinde iki yeni anlamlı Türkçe kelime oluşmalıdır.
    Örnek: DE(L) ve (L)AN. Ortak harf 'L'.
    Sadece birinci ve ikinci kelimeyi döndür. Ortadaki harf kullanıcı tarafından bulunacak.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            pairs: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        word1: { type: Type.STRING },
                        word2: { type: Type.STRING },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<LetterBridgeData>;
};

export const generateFindDuplicateFromAI = async (rowCount: number, colCount: number): Promise<FindDuplicateData> => {
    const prompt = `
    Bir 'İkiliyi Bul' etkinliği oluştur.
    Her biri ${colCount} karakterden oluşan ${rowCount} tane satır oluştur.
    Her satıra rastgele harfler ve rakamlar yerleştir. Ancak her satırda, karakterlerden sadece BİR tanesi tam olarak iki kez tekrar etsin. Diğer tüm karakterler benzersiz olsun.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            rows: {
                type: Type.ARRAY,
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<FindDuplicateData>;
};

export const generateWordLadderFromAI = async (count: number): Promise<WordLadderData> => {
    const prompt = `
    Çocuklar için bir 'Kelime Merdiveni' etkinliği oluştur. ${count} tane bulmaca üret.
    Her bulmaca için, aynı sayıda harfe sahip bir başlangıç ve bitiş kelimesi seç (4 veya 5 harfli Türkçe kelimeler olsun).
    Bir kelimeden diğerine her adımda sadece tek harf değiştirilerek ulaşılabilmeli.
    Başlangıç ve bitiş kelimeleri ile toplam adım sayısını (boşluk sayısı, yani başlangıç ve bitiş hariç ara kelime sayısı) döndür.
    Örnek: BAŞ -> KAŞ -> KIŞ. Adım sayısı: 1.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            ladders: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        startWord: { type: Type.STRING },
                        endWord: { type: Type.STRING },
                        steps: { type: Type.INTEGER, description: 'Number of intermediate words between start and end.' },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<WordLadderData>;
};

export const generateFindIdenticalWordFromAI = async (count: number): Promise<FindIdenticalWordData> => {
    const prompt = `
    Çocuklar için bir 'Aynısını Bul' dikkat etkinliği oluştur. ${count} tane grup üret.
    Her grup, iki kelimeden oluşan bir çift içersin.
    Bu çiftlerden bazıları tamamen aynı iki kelimeden oluşsun (örn: ["masa", "masa"]).
    Diğer çiftler ise birbirine çok benzeyen ama tek bir harfi farklı olan kelimelerden oluşsun (örn: ["kalem", "kelam"]).
    Yaklaşık yarısı aynı, yarısı farklı olsun.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            groups: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        words: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A pair of words.' }
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<FindIdenticalWordData>;
};

export const generateWordFormationFromAI = async (count: number): Promise<WordFormationData> => {
    const prompt = `
    Çocuklar için bir 'Harflerden Kelime Türetme' etkinliği oluştur. ${count} tane harf seti üret.
    Her set, 7-8 tane rastgele ama anlamlı kelimeler türetmeye uygun Türkçe harf içersin.
    Her set için 1 veya 2 tane joker hakkı belirt.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            sets: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        letters: { type: Type.ARRAY, items: { type: Type.STRING } },
                        jokerCount: { type: Type.INTEGER }
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<WordFormationData>;
};

export const generateReverseWordFromAI = async (topic: string, count: number): Promise<ReverseWordData> => {
    const prompt = `
    Çocuklar için bir 'Ters Oku - Ters Uko' etkinliği oluştur. '${topic}' konusuyla ilgili ${count} tane Türkçe kelime seç.
    Kelimeler 5 ila 10 harf uzunluğunda olabilir.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            words: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ReverseWordData>;
};

export const generateFindLetterPairFromAI = async (gridSize: number, targetPair: string): Promise<FindLetterPairData> => {
    const prompt = `
    Bir 'Harf İkilisini Bul' dikkat testi oluştur.
    Hedef harf ikilisi "${targetPair}" olsun.
    ${gridSize}x${gridSize} boyutunda bir harf ızgarası oluştur.
    Izgarayı rastgele Türkçe küçük harflerle doldur.
    Hedef harf ikilisini ("${targetPair}") bu ızgaranın içine yatay, dikey veya çapraz olarak en az 10-15 kez yerleştir.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            grid: {
                type: Type.ARRAY,
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            targetPair: { type: Type.STRING }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<FindLetterPairData>;
};

export const generateWordGroupingFromAI = async (topic: string, wordCount: number, categoryCount: number): Promise<WordGroupingData> => {
    const prompt = `
    Çocuklar için bir kelime gruplama etkinliği oluştur. '${topic}' konusuyla ilgili olsun.
    ${categoryCount} tane kategori ismi belirle (örn: Meyveler, Hayvanlar, Eşyalar).
    Bu kategorilere dağıtılacak toplam ${wordCount} tane kelimeden oluşan bir kelime havuzu oluştur.
    Sonucu aşağıdaki JSON formatında döndür. Kullanıcı kelimeleri kategorilere yerleştirecek.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
            categoryNames: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<WordGroupingData>;
};

export const generateVisualMemoryFromAI = async (topic: string, memorizeCount: number, testCount: number): Promise<VisualMemoryData> => {
    const prompt = `
    Çocuklar için '${topic}' konusunda bir görsel hafıza oyunu oluştur.
    İlk olarak, ezberlenmesi gereken ${memorizeCount} tane basit, somut nesne adı veya hayvan adı seç. Bu kelimelerle birlikte ilgili bir emoji de ver. (örn: 'Kedi 🐱').
    İkinci olarak, bu ${memorizeCount} öğeyi de içeren toplam ${testCount} öğelik bir test listesi oluştur. Bu test listesindeki öğelerin sırasını karıştır.
    Sonucu aşağıdaki JSON formatında döndür. Öğe olarak sadece emoji ve kelime içeren string'i döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The main title of the activity.' },
            memorizeTitle: { type: Type.STRING, description: 'Title for the memorization part.' },
            testTitle: { type: Type.STRING, description: 'Title for the test part.' },
            itemsToMemorize: { type: Type.ARRAY, items: { type: Type.STRING } },
            testItems: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<VisualMemoryData>;
};


export const generateStoryAnalysisFromAI = async (topic: string): Promise<StoryAnalysisData> => {
    const prompt = `
    7-8 yaşındaki bir çocuk için '${topic}' konusunda 150 kelimelik kısa ve basit bir Türkçe hikaye yaz.
    Hikayeden sonra, hikayeyle ilgili 4 tane analiz sorusu oluştur.
    Sorular şunlar gibi olabilir:
    - Hikayedeki 'mutlu' kelimesinin eş anlamlısı nedir?
    - Hikayedeki 'büyük' kelimesinin zıt anlamlısı nedir?
    - [Karakterin adı] neden [bir eylem] yaptı?
    - Hikayenin ana fikri nedir?
    Her soru için, sorunun cevabını bulmak için hikayeden bir ipucu (context) ver.
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
                        question: { type: Type.STRING, description: 'The analysis question.' },
                        context: { type: Type.STRING, description: 'A hint or context from the story related to the question.'},
                    },
                },
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<StoryAnalysisData>;
};

export const generateCoordinateCipherFromAI = async (topic: string, gridSize: number, cipherLength: number): Promise<CoordinateCipherData> => {
    const prompt = `
    Çocuklar için bir 'Gizemli Bulmaca' (koordinat şifresi) etkinliği oluştur.
    1. ${gridSize}x${gridSize} boyutunda bir harf ızgarası oluştur. Satır başlıkları A, B, C... ve sütun başlıkları 1, 2, 3... olmalı.
    2. Izgarayı, '${topic}' konusuyla ilgili 8-10 tane kelimeyi gizleyerek doldur (kelime bulmacası gibi).
    3. ${cipherLength} harflik, yine '${topic}' ile alakalı bir şifreli kelime veya kısa bir ifade seç.
    4. Bu şifreli ifadenin harflerinin ızgaradaki konumlarını koordinat olarak belirle (örn: "A-1", "C-5").
    5. Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            wordsToFind: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of words hidden in the grid for distraction.' },
            cipherCoordinates: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'The list of coordinates that spell the secret message.' },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<CoordinateCipherData>;
};

export const generateProverbSearchFromAI = async (gridSize: number): Promise<ProverbSearchData> => {
    const prompt = `
    Çocuklar için bir 'Atasözü Avı' kelime bulmaca etkinliği oluştur.
    1. Yaygın olarak bilinen, basit bir Türkçe atasözü seç.
    2. Bu atasözünü oluşturan tüm kelimeleri ${gridSize}x${gridSize} boyutunda bir harf bulmacasına yerleştir.
    3. Boş kalan yerleri rastgele Türkçe harflerle doldur.
    4. Sonucu aşağıdaki JSON formatında döndür. Atasözünün tam metnini de ekle.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            proverb: { type: Type.STRING, description: 'The full proverb hidden in the grid.' },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ProverbSearchData>;
};

export const generateTargetSearchFromAI = async (gridSize: number, target: string, distractor: string): Promise<TargetSearchData> => {
    const prompt = `
    Çocuklar için bir dikkat etkinliği oluştur.
    1. ${gridSize}x${gridSize} boyutunda bir ızgara oluştur.
    2. Izgaranın çoğunu "${distractor}" karakteriyle doldur.
    3. Izgaranın içine rastgele konumlara 10-15 adet "${target}" karakteri yerleştir.
    4. Başlık olarak "'${distractor}'ların arasında kaç tane '${target}' var?" gibi bir metin oluştur.
    5. Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the activity.' },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            target: { type: Type.STRING },
            distractor: { type: Type.STRING },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<TargetSearchData>;
};

export const generateShapeNumberPatternFromAI = async (count: number): Promise<ShapeNumberPatternData> => {
    const prompt = `
    Çocuklar için ${count} tane 'Şekilli Sayı Örüntüsü' bulmacası oluştur.
    Her bulmaca 3 tane üçgenden oluşsun. Her üçgenin köşelerinde veya içinde sayılar bulunsun.
    Sayılar arasında basit bir kural olmalı (toplama, çıkarma, çarpma).
    Üçüncü üçgende bir sayı eksik olsun ve '?' ile belirtilsin.
    Örnek kural: Alttaki iki sayının toplamı üstteki sayıyı verir. Veya köşelerdeki sayıların toplamı ortadaki sayıyı verir.
    Sonucu aşağıdaki JSON formatında döndür. numbers dizisindeki sayıları string olarak döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
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
                                    type: { type: Type.STRING, description: "Must be 'triangle'" },
                                    numbers: { 
                                        type: Type.ARRAY, 
                                        items: { type: Type.STRING },
                                        description: "Array of 3 or 4 numbers as strings, one being '?'" 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ShapeNumberPatternData>;
};

export const generateGridDrawingFromAI = async (rowCount: number, gridDim: number): Promise<GridDrawingData> => {
    const prompt = `
    Çocuklar için bir 'Ayna Çizimi' etkinliği oluştur.
    ${rowCount} tane çizim alıştırması oluştur.
    Her alıştırma için, ${gridDim}x${gridDim} boyutunda bir ızgara üzerinde çizilecek basit bir geometrik desen oluştur.
    Desen, ızgaranın köşe noktalarını birleştiren 3 ila 5 çizgiden oluşmalıdır.
    Her çizgi için başlangıç [x1, y1] ve bitiş [x2, y2] koordinatlarını ver. Koordinatlar 0'dan ${gridDim}'e kadar olabilir.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            gridDim: { type: Type.INTEGER, description: 'The dimension of the grid (e.g., 4 for a 4x4 grid).' },
            drawings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        lines: {
                            type: Type.ARRAY,
                            description: 'An array of lines, where each line is an array of two points [[x1, y1], [x2, y2]]',
                            items: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.ARRAY,
                                    items: { type: Type.INTEGER }
                                }
                            }
                        }
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<GridDrawingData>;
};

export const generateColorWheelMemoryFromAI = async (count: number): Promise<ColorWheelMemoryData> => {
    const prompt = `
    Çocuklar için bir "Renk Çemberi" hafıza etkinliği oluştur.
    ${count} tane basit, somut nesne adı ve bu nesnelerle ilgili bir emoji oluştur (örn: "Kitap 📕").
    Her bir nesne/emoji çifti için şu CSS renklerinden birini ata: "red", "yellow", "blue", "green", "orange", "purple", "pink", "brown". 
    Bu renk, nesnenin yerleştirileceği çark diliminin rengi olacak. Her nesne için farklı bir renk ata.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The main title for the activity.' },
            memorizeTitle: { type: Type.STRING, description: 'Title for the memorization page.' },
            testTitle: { type: Type.STRING, description: 'Title for the test page.' },
            items: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: 'The name of the object with its emoji (e.g., "Kitap 📕").' },
                        color: { type: Type.STRING, description: 'The CSS color for the wheel segment.' },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ColorWheelMemoryData>;
};

export const generateImageComprehensionFromAI = async (topic: string, questionCount: number): Promise<ImageComprehensionData> => {
    // Step 1: Generate the text part (description + questions)
    const textPrompt = `
        Çocuklar için bir "Resme Dikkat" (metin tabanlı) etkinliği oluştur.
        Konu: "${topic}".
        Bu konu hakkında çok detaylı, canlı bir sahne tasvir et (yaklaşık 150 kelime). Bol miktarda nesne, renk, sayı ve eylem içersin.
        Bu sahne açıklamasına dayanarak, sadece metinde cevaplanabilecek ${questionCount} tane detaylı soru oluştur.
        Sorular "ne renk?", "kaç tane?", "kim ne yapıyor?" gibi olmalı.
        Sonucu aşağıdaki JSON formatında döndür.
    `;
    const textSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The main title for the activity.' },
            memorizeTitle: { type: Type.STRING, description: 'Title for the scene description page.' },
            testTitle: { type: Type.STRING, description: 'Title for the questions page.' },
            sceneDescription: { type: Type.STRING, description: 'The detailed description of the scene.' },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
    };
    const textData = await generateWithSchema(textPrompt, textSchema);

    // Step 2: Generate the image from the description
    const imagePrompt = `A vibrant and detailed cartoon illustration for children, depicting the following scene: ${textData.sceneDescription}`;
    const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: { responseModalities: ['IMAGE'] },
    });
    
    let imageBase64 = '';
    const part = imageResponse.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData) {
        imageBase64 = part.inlineData.data;
    }

    if (!imageBase64) {
        throw new Error('Yapay zeka tarafından görsel üretilemedi. Lütfen tekrar deneyin.');
    }

    // Step 3: Combine and return
    return {
        ...textData,
        imageBase64: imageBase64,
    };
};


export const generateCharacterMemoryFromAI = async (topic: string, memorizeCount: number, testCount: number): Promise<CharacterMemoryData> => {
    // Step 1: Generate text descriptions first
    const textPrompt = `
    Çocuklar için bir karakter hafıza oyunu oluştur.
    Konu: "${topic}" (Örn: Kasaba halkı, Süper kahramanlar, Orman hayvanları).
    1. Ezberlenmesi gereken ${memorizeCount} tane benzersiz ve akılda kalıcı çizgi film karakteri için detaylı ve görsel birer açıklama yaz. (örn: 'Kırmızı, çizgili bir tişört giyen, gözlüklü, sarı saçlı, uzun boylu bir adam').
    2. Test için, bu ${memorizeCount} karakteri de içeren, toplam ${testCount} tane karakter açıklaması oluştur. Yeni karakterler de ekle. Bu test listesindeki karakter açıklamalarının sırasını karıştır.
    3. Sonucu aşağıdaki JSON formatında döndür. Sadece metin açıklamalarını döndür, resim verisi ekleme.
    `;
    const textSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            memorizeTitle: { type: Type.STRING },
            testTitle: { type: Type.STRING },
            charactersToMemorize: { type: Type.ARRAY, items: { type: Type.STRING } },
            testCharacters: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
    };
    const textData: {
        title: string;
        memorizeTitle: string;
        testTitle: string;
        charactersToMemorize: string[];
        testCharacters: string[];
    } = await generateWithSchema(textPrompt, textSchema);

    // Step 2: Generate images for each unique description
    const allDescriptions = [...new Set([...textData.charactersToMemorize, ...textData.testCharacters])];
    
    const imagePromises = allDescriptions.map(async (description) => {
        const imagePrompt = `A vibrant and detailed cartoon character for children, full body, on a plain white background. The character is: ${description}`;
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: imagePrompt }] },
            config: { responseModalities: ['IMAGE'] },
        });

        let imageBase64 = '';
        const part = imageResponse.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData) {
            imageBase64 = part.inlineData.data;
        }
        if (!imageBase64) {
             console.warn(`Could not generate image for description: ${description}`);
        }
        return { description, imageBase64 };
    });

    const generatedImages = await Promise.all(imagePromises);
    const imageMap = new Map(generatedImages.map(item => [item.description, item.imageBase64]));

    // Step 3: Combine descriptions with images
    const charactersToMemorize = textData.charactersToMemorize.map(desc => ({
        description: desc,
        imageBase64: imageMap.get(desc) || '',
    })).filter(char => char.imageBase64);

    const testCharacters = textData.testCharacters.map(desc => ({
        description: desc,
        imageBase64: imageMap.get(desc) || '',
    })).filter(char => char.imageBase64);

    if (charactersToMemorize.length < textData.charactersToMemorize.length || testCharacters.length < textData.testCharacters.length) {
        console.warn("Some character images could not be generated.");
    }

    return {
        title: textData.title,
        memorizeTitle: textData.memorizeTitle,
        testTitle: textData.testTitle,
        charactersToMemorize,
        testCharacters,
    };
};

export const generateStorySequencingFromAI = async (topic: string): Promise<StorySequencingData> => {
    const prompt = `
    Çocuklar için bir "Hikaye Oluşturma (Sıralama)" etkinliği oluştur.
    Konu: "${topic}".
    Bu konuyla ilgili, 6 adımdan oluşan basit bir hikaye oluştur. Her adım, bir resim karesinde (panel) ne olduğunun görsel bir açıklaması olmalıdır.
    Bu 6 panel açıklamasını DOĞRU sıralamada oluştur. Panelleri A'dan F'ye kadar ID'lerle etiketle.
    Sonucu aşağıdaki JSON formatında döndür. UI, panelleri kendisi karıştıracaktır.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            prompt: { type: Type.STRING, description: 'Instruction for the user, e.g., "Aşağıdaki 6 kareyi öyle bir dizelim ki anlamlı bir hikaye oluşsun."' },
            panels: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: 'The panel ID (A, B, C, D, E, F).' },
                        description: { type: Type.STRING, description: 'A visual description of what is happening in the panel.' },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<StorySequencingData>;
};

export const generateChaoticNumberSearchFromAI = async (start: number, end: number): Promise<ChaoticNumberSearchData> => {
    const prompt = `
    Çocuklar için bir "Sayıları Bulma" etkinliği oluştur.
    Hedef, ${start} ile ${end} arasındaki sayıları bulmak.
    Bu aralıktaki her sayı için, onu bir tuval üzerinde konumlandırmak üzere bir nesne oluştur.
    Her sayı nesnesi için:
    - value: Sayının kendisi.
    - x: Yatay konum (0 ile 95 arasında bir yüzde değeri).
    - y: Dikey konum (0 ile 95 arasında bir yüzde değeri).
    - size: Yazı tipi boyutu (1.5 ile 5 arasında bir 'rem' değeri).
    - rotation: Dönme açısı (-45 ile 45 arasında bir derece değeri).
    - color: Bir CSS renk adı (örn: "blue", "red", "green", "orange", "purple", "black", "navy").
    Aynı zamanda, hedef aralığın dışında (örn: ${end + 1} ile ${end * 1.5} arası) yaklaşık 20 tane daha dikkat dağıtıcı sayı oluştur ve onları da tuvale yerleştir.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            prompt: { type: Type.STRING, description: `The prompt for the user, e.g., "Aşağıda 1'den 50'ye kadar olan sayılar karışık olarak verilmiştir. Bu sayıları sırasıyla bulup boyayalım."`},
            range: {
                type: Type.OBJECT,
                properties: {
                    start: { type: Type.INTEGER },
                    end: { type: Type.INTEGER },
                }
            },
            numbers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.INTEGER },
                        x: { type: Type.NUMBER, description: 'Horizontal position in %' },
                        y: { type: Type.NUMBER, description: 'Vertical position in %' },
                        size: { type: Type.NUMBER, description: 'Font size in rem' },
                        rotation: { type: Type.NUMBER, description: 'Rotation in degrees' },
                        color: { type: Type.STRING, description: 'CSS color name' },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ChaoticNumberSearchData>;
};

export const generateBlockPaintingFromAI = async (): Promise<BlockPaintingData> => {
    const prompt = `
    Çocuklar için bir "Blok Boyama" etkinliği oluştur.
    1. 12 satır ve 18 sütundan oluşan bir ızgara için bir yapı oluştur.
    2. 4 farklı renkte (örn: 'limegreen', 'dodgerblue', 'deeppink', 'gold') 8 tane polyomino (tetris benzeri şekil) oluştur. Her renkten 2 şekil olsun.
    3. Her şekli, 1'lerin dolu hücreleri gösterdiği bir 2D dizi (pattern) olarak tanımla. Şekiller 2x2, 3x2, 1x4 gibi boyutlarda olabilir.
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity, e.g., "Blok Boyama".' },
            prompt: { type: Type.STRING, description: 'Instruction for the user.' },
            grid: {
                type: Type.OBJECT,
                properties: {
                    rows: { type: Type.INTEGER },
                    cols: { type: Type.INTEGER },
                }
            },
            shapes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        color: { type: Type.STRING },
                        pattern: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.INTEGER } } },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<BlockPaintingData>;
};

export const generateMiniWordGridFromAI = async (): Promise<MiniWordGridData> => {
    const prompt = `
    Çocuklar için 6 tane "Kelime Bulmaca (Mini)" oluştur.
    1. Her bulmaca için 4x4 boyutunda bir harf ızgarası hazırla.
    2. Her ızgaraya 5 harfli, yaygın bir Türkçe kelimeyi yatay veya dikey olarak yerleştir.
    3. Kelimenin ilk harfinin konumunu (0-indeksli satır ve sütun) belirt. Bu harf kullanıcıya renkli gösterilecek.
    4. Izgaranın geri kalan boşluklarını rastgele Türkçe harflerle doldur.
    5. Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            prompt: { type: Type.STRING, description: 'Instruction for the user.' },
            puzzles: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                        start: {
                            type: Type.OBJECT,
                            properties: {
                                row: { type: Type.INTEGER },
                                col: { type: Type.INTEGER },
                            }
                        },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<MiniWordGridData>;
};

export const generateVisualOddOneOutFromAI = async (): Promise<VisualOddOneOutData> => {
    const prompt = `
    Çocuklar için bir "Görsel Fark Bulma" etkinliği oluştur.
    1. Her birinde 7 öğe bulunan 4 satır oluştur.
    2. Her öğe, 8 dilimli bir daireyi temsil eden 8 elemanlı bir boolean dizisi olsun ('segments'). 'true' dolu, 'false' boş dilimi temsil eder.
    3. Her satırda, 6 öğe aynı desene sahip olsun, ancak bir tanesi farklı bir desene sahip olsun (bir dilimi farklı olsun).
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            prompt: { type: Type.STRING, description: 'Instruction for the user.' },
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
                                }
                            }
                        }
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<VisualOddOneOutData>;
};

export const generateShapeCountingFromAI = async (): Promise<ShapeCountingData> => {
    const prompt = `
    Çocuklar için bir "Şekil Sayma" etkinliği oluştur. Hedef şekil üçgen.
    1. Karmaşık geometrik desenler içeren 4 farklı figür oluştur. Bu figürler, birleştirilmiş üçgenlerden oluşmalıdır.
    2. Her figürü, çizilebilecek bir dizi SVG path elemanı olarak tanımla. Her path'in bir 'd' (path data) ve 'fill' (doldurma rengi) özelliği olsun.
    3. Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            prompt: { type: Type.STRING, description: 'Instruction for the user.' },
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
                                    fill: { type: Type.STRING },
                                }
                            }
                        }
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ShapeCountingData>;
};

export const generateSymmetryDrawingFromAI = async (): Promise<SymmetryDrawingData> => {
    const prompt = `
    Çocuklar için bir "Simetri Çizimi" etkinliği oluştur.
    1. 10x10'luk bir ızgara boyutu tanımla.
    2. Dikey bir simetri ekseni belirle (x=5).
    3. Bu eksenin sol tarafında (x < 5) kalacak şekilde, 10-15 tane noktanın (x, y) koordinatlarını oluşturarak bir desen oluştur.
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            prompt: { type: Type.STRING, description: 'Instruction for the user.' },
            gridDim: { type: Type.INTEGER, description: 'The dimension of the grid (e.g., 10 for a 10x10 grid).' },
            dots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.INTEGER },
                        y: { type: Type.INTEGER },
                    }
                }
            },
            axis: { type: Type.STRING, description: "'vertical' or 'horizontal'" }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<SymmetryDrawingData>;
};

export const generateBurdonTestFromAI = async (): Promise<LetterGridTestData> => {
    const prompt = `
    Bir "Burdon Dikkat Testi" oluştur. 30 satır ve 30 sütundan oluşan bir harf ızgarası oluştur.
    Izgarayı rastgele küçük Türkçe harflerle doldur.
    Aranacak hedef harfler "a, b, d, g" olsun.
    Bu hedef harflerin ızgarada dengeli bir şekilde dağıldığından emin ol.
    Başlık olarak "BURDON DİKKAT TESTİ" ve aranacak harfleri belirten bir açıklama ekle.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the letter grid test.' },
            grid: {
                type: Type.ARRAY,
                items: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            targetLetters: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData>;
};

export const generateFindDifferentStringFromAI = async (): Promise<FindDifferentStringData> => {
    const prompt = `
    Bir "Farklı Olanı Bulma" etkinliği oluştur.
    16 satır ve 6 sütundan oluşsun.
    Her satırda, temel dize olarak "VWN" kullanılsın.
    Her satırda bir konumda "VWN" yerine "VMN" gibi çok benzer bir varyasyon kullanılsın. Bu varyasyonun konumu her satır için rastgele olsun.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title of the activity.' },
            prompt: { type: Type.STRING, description: 'Instruction for the user.' },
            rows: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<FindDifferentStringData>;
};

export const generateDotPaintingFromAI = async (): Promise<DotPaintingData> => {
    const prompt = `
    Çocuklar için bir "Nokta Boyama" etkinliği oluştur.
    1. 210x297 (A4 oranı) bir viewBox içinde, düzensiz dikdörtgen bölgelerden oluşan bir ızgara deseni oluştur. Bu deseni bir dizi SVG path 'd' özelliği olarak tanımla.
    2. Bu bölgelerin içine 22 tane nokta yerleştir. Noktaların renkleri "orange", "blue", "deeppink", "black" olsun. Her renkten birkaç tane olsun.
    3. Her noktanın 'cx' ve 'cy' koordinatlarını ve rengini döndür.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title.' },
            prompt1: { type: Type.STRING, description: 'Prompt for the first part.' },
            prompt2: { type: Type.STRING, description: 'Prompt for the second part.' },
            svgViewBox: { type: Type.STRING, description: 'The SVG viewBox string, e.g., "0 0 210 297".' },
            gridPaths: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Array of SVG path d-strings for grid lines.' },
            dots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        cx: { type: Type.NUMBER },
                        cy: { type: Type.NUMBER },
                        color: { type: Type.STRING },
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<DotPaintingData>;
};

export const generateAbcConnectFromAI = async (): Promise<AbcConnectData> => {
    const prompt = `
    Çocuklar için bir "ABC Bağlama" etkinliği oluştur. 3 ayrı bulmaca üret.
    1. Bulmaca: 5x5'lik bir ızgarada A, B, C, D harf çiftleri.
    2. Bulmaca: 5x5'lik bir ızgarada A, B, C, D, E harf çiftleri.
    3. Bulmaca: 8x8'lik bir ızgarada A, B, C, D, E harf çiftleri.
    Her bulmaca için ızgara boyutunu ve her harfin 0-indeksli x, y koordinatlarını içeren bir liste döndür.
    Harf çiftlerinin, yatay ve dikey çizgilerle, diğer yolları kesmeyecek şekilde birleştirilebilir olduğundan emin ol.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title.' },
            prompt: { type: Type.STRING, description: 'Instruction for the user.' },
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
                                    x: { type: Type.INTEGER },
                                    y: { type: Type.INTEGER },
                                }
                            }
                        }
                    }
                }
            }
        },
    };
    return generateWithSchema(prompt, schema) as Promise<AbcConnectData>;
};

export const generatePasswordFinderFromAI = async (): Promise<PasswordFinderData> => {
    const prompt = `
    Çocuklar için bir "Şifre Bul" etkinliği oluştur.
    1. Toplam 18 tane Türkçe kelime oluştur. Bunların yaklaşık yarısı özel isim (Ankara, Elif, Akdeniz gibi - ilk harfi büyük yazılması gerekenler), diğer yarısı cins isim (palto, vişne, gömlek gibi) olsun.
    2. Her kelime için, şifre adayı olacak bir harf seç ve kelimenin kendisinden bağımsız olarak bu harfi belirt.
    3. Her kelimenin özel isim olup olmadığını (isProperNoun) boolean olarak belirt.
    4. Sadece özel isim olan kelimelerdeki şifre adayı harflerin birleşimiyle oluşacak şifrenin uzunluğunu hesapla.
    5. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        isProperNoun: { type: Type.BOOLEAN },
                    }
                }
            },
            passwordLength: { type: Type.INTEGER },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<PasswordFinderData>;
};

export const generateSyllableCompletionFromAI = async (theme: string): Promise<SyllableCompletionData> => {
    const prompt = `
    Çocuklar için bir "Eksik Kelimeler" etkinliği oluştur. Tema: "${theme}".
    1. Bu temayla ilgili 10 tane 2 veya 3 heceli Türkçe kelime oluştur.
    2. Her kelimeyi iki parçaya ayır.
    3. Bu kelime parçalarını (first, second) ve eksik heceleri (syllables) ayrı listeler halinde döndür. 'syllables' listesi karıştırılmış olmalı.
    4. Bulunan kelimelerin kullanılacağı bir hikaye yazma görevi (storyPrompt) ekle.
    Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        second: { type: Type.STRING },
                    }
                }
            },
            syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
            storyPrompt: { type: Type.STRING },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<SyllableCompletionData>;
};

export const generateSynonymWordSearchFromAI = async (): Promise<SynonymWordSearchData> => {
    const prompt = `
    Çocuklar için bir "Eş Anlamlı Kelime Avı" etkinliği oluştur.
    1. Birbirinin eş anlamlısı olan 10 tane Türkçe kelime çifti oluştur (word, synonym).
    2. Bu 10 eş anlamlı kelimeyi (synonym) 15x15'lik bir kelime arama bulmacasına (grid) yerleştir.
    3. Boşlukları rastgele harflerle doldur.
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        synonym: { type: Type.STRING },
                    }
                }
            },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<SynonymWordSearchData>;
};

export const generateWordConnectFromAI = async (): Promise<WordConnectData> => {
    const prompt = `
    Çocuklar için bir "Kelime Bağlama" etkinliği oluştur.
    1. Birbirinin zıt anlamlısı olan 6 tane Türkçe kelime çifti oluştur.
    2. Bu 12 kelimeyi 8x8'lik bir ızgaraya, aralarında kesişmeyen yollarla birleştirilebilecek şekilde yerleştir.
    3. Her kelimenin metnini, çift ID'sini (pairId) ve 0-indeksli x, y koordinatlarını döndür.
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        x: { type: Type.INTEGER },
                        y: { type: Type.INTEGER },
                    }
                }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<WordConnectData>;
};

export const generateSpiralPuzzleFromAI = async (): Promise<SpiralPuzzleData> => {
    const prompt = `
    Çocuklar için bir "Sarmal Bulmaca" etkinliği oluştur.
    1. Birbiriyle ilişkili 12 kelime için ipuçları oluştur (örn: "Öğüt kelimesinin eş anlamlısı").
    2. Bu 12 kelimeyi 13x13'lük bir ızgaraya merkezden başlayıp dışa doğru sarmal şeklinde yerleştir.
    3. Her kelimenin başlangıç konumunu (row, col) ve numarasını (id) belirt.
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        col: { type: Type.INTEGER },
                    }
                }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<SpiralPuzzleData>;
};

export const generateCrosswordFromAI = async (): Promise<CrosswordData> => {
    const prompt = `
    Çocuklar için bir "Çapraz Bulmaca" etkinliği oluştur.
    1. 11 tane ipucu oluştur. İpuçları "YUMUŞAK kelimesinin eş anlamlısı" gibi olmalı.
    2. Bu ipuçlarının cevaplarını, bazı harfleri renkli (şifre) olacak şekilde bir bulmaca ızgarasına yerleştir. Izgara yaklaşık 12x12 boyutunda olabilir.
    3. Izgarayı, boş kareler için null ve dolu kareler için harf içeren bir 2D dizi olarak döndür.
    4. Şifreyi oluşturan hücrelerin koordinatlarını (row, col) belirt.
    5. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        text: { type: Type.STRING },
                    }
                }
            },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING, nullable: true } } },
            passwordCells: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        row: { type: Type.INTEGER },
                        col: { type: Type.INTEGER },
                    }
                }
            },
            passwordLength: { type: Type.INTEGER },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<CrosswordData>;
};

export const generateJumbledWordStoryFromAI = async (theme: string): Promise<JumbledWordStoryData> => {
    const prompt = `
    Çocuklar için bir "Kelime Bulma ve Hikaye Yazma" etkinliği oluştur. Tema: "${theme}".
    1. Tema ile ilgili, her biri 4-7 harfli 8 kelime oluştur.
    2. Her kelimenin harflerini karıştırarak bir jumbled listesi oluştur.
    3. Bulunan kelimelerin kullanılacağı bir hikaye yazma görevi (storyPrompt) ekle.
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        word: { type: Type.STRING },
                    }
                }
            },
            storyPrompt: { type: Type.STRING },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<JumbledWordStoryData>;
};

export const generateHomonymSentenceFromAI = async (): Promise<HomonymSentenceData> => {
    const textPrompt = `
        Çocuklar için bir "Kelime Ağı (Eş Sesli)" etkinliği oluştur.
        1. 8 tane yaygın Türkçe eş sesli kelime seç (örn: yüz, dal, at, yaz, ben, dolu, alay, ekmek).
        2. Her kelime için, kelimenin bir anlamını temsil eden basit bir görsel açıklaması yaz. (örn: 'yüz' için 'insan suratı', 'dal' için 'ağaç dalı').
        3. Sonucu aşağıdaki JSON formatında döndür.
    `;
    const textSchema = {
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
                        description: { type: Type.STRING },
                    }
                }
            },
        },
    };
    const textData = await generateWithSchema(textPrompt, textSchema);

    const imagePromises = textData.items.map(async (item: { word: string, description: string }) => {
        const imagePrompt = `A simple, clear cartoon icon of a ${item.description}, on a white background.`;
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: imagePrompt }] },
            config: { responseModalities: ['IMAGE'] },
        });
        const part = imageResponse.candidates?.[0]?.content?.parts?.[0];
        const imageBase64 = part?.inlineData?.data || '';
        return { word: item.word, imageBase64 };
    });

    const itemsWithImages = await Promise.all(imagePromises);

    return {
        title: textData.title,
        prompt: textData.prompt,
        items: itemsWithImages,
    };
};

export const generateWordGridPuzzleFromAI = async (theme: string): Promise<WordGridPuzzleData> => {
    const prompt = `
    Çocuklar için bir "Kelime Ağı (Yerleştirme)" etkinliği oluştur. Tema: "${theme}".
    1. Tema ile ilgili 12 tane Türkçe kelime listesi oluştur.
    2. Bu kelimelerden 8 tanesini, birbirine geçen bir 15x15'lik bulmaca ızgarasına (Scrabble gibi) yerleştir.
    3. Izgarayı, boş kareler için null, dolu kareler için harf ve bazı ipucu harfleri içeren bir 2D dizi olarak döndür.
    4. Kullanılmayan kelimeleri yazmak için bir talimat ekle.
    5. Sonucu aşağıdaki JSON formatında döndür.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            theme: { type: Type.STRING },
            wordList: { type: Type.ARRAY, items: { type: Type.STRING } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING, nullable: true } } },
            unusedWordPrompt: { type: Type.STRING },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<WordGridPuzzleData>;
};

export const generateProverbSayingSortFromAI = async (): Promise<ProverbSayingSortData> => {
    const prompt = `
    Çocuklar için bir "Atasözü/Özdeyiş" sıralama etkinliği oluştur.
    1. 5 tane yaygın Türkçe atasözü ve 5 tane ünlü özdeyiş bul.
    2. Bunları karışık bir sırada listele ve her birinin türünü ('atasözü' veya 'özdeyiş') belirt.
    3. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        type: { type: Type.STRING },
                    }
                }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ProverbSayingSortData>;
};

export const generateHomonymImageMatchFromAI = async (): Promise<HomonymImageMatchData> => {
    const prompt = `
    Çocuklar için bir "Resim Eşleştirme (Eş Sesli)" etkinliği oluştur.
    1. 5 tane yaygın Türkçe eş sesli kelime seç (örn: at, yüz, dil, ekmek, bin).
    2. Her kelimenin iki farklı anlamını tanımlayan kısa açıklamalar yaz. (örn: 'at' için 'bir binek hayvanı' ve 'bir şeyi fırlatma eylemi').
    3. Ayrıca, bu kelimelerle ilgisiz, harfleri karıştırılmış bir kelime bulmacası için bir kelime ve harfleri oluştur.
    4. Sonucu aşağıdaki JSON formatında, sadece metin verisiyle döndür.
    `;
    const textSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pairs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING }, desc1: { type: Type.STRING }, desc2: { type: Type.STRING } } } },
            wordScramble: { type: Type.OBJECT, properties: { letters: { type: Type.ARRAY, items: { type: Type.STRING } }, word: { type: Type.STRING } } },
        },
    };
    const textData = await generateWithSchema(prompt, textSchema);

    const imagePromises = textData.pairs.flatMap((pair: any) => [
        { word: pair.word, desc: pair.desc1 },
        { word: pair.word, desc: pair.desc2 }
    ]).map(async (item: { word: string, desc: string }) => {
        const imagePrompt = `A simple, clear cartoon icon of: ${item.desc}. On a white background.`;
        const imageResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [{ text: imagePrompt }] }, config: { responseModalities: ['IMAGE'] } });
        const imageBase64 = imageResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
        return { ...item, imageBase64 };
    });

    const images = await Promise.all(imagePromises);
    const leftImages = textData.pairs.map((p: any, i: number) => ({ id: i, word: p.word, imageBase64: images.find(img => img.desc === p.desc1)?.imageBase64 || '' }));
    const rightImages = textData.pairs.map((p: any, i: number) => ({ id: i, word: p.word, imageBase64: images.find(img => img.desc === p.desc2)?.imageBase64 || '' }));

    return {
        title: textData.title,
        prompt: textData.prompt,
        leftImages,
        rightImages,
        wordScramble: textData.wordScramble,
    };
};

export const generateAntonymFlowerPuzzleFromAI = async (): Promise<AntonymFlowerPuzzleData> => {
    const prompt = `
    Çocuklar için bir "Zıt Anlamlı Kelime Bulmacası" etkinliği oluştur.
    1. 9 tane kelime ve zıt anlamlılarını bul (örn: uzun-kısa).
    2. Her zıt anlamlı kelimenin harflerini, şifreyi oluşturacak 2-3 ekstra harfle birleştir ve karıştır. Bu harfler papatyanın yaprakları olacak.
    3. Tüm ekstra harflerin birleşimiyle oluşacak 8 harfli bir şifre kelimesi belirle.
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        petalLetters: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }
                }
            },
            passwordLength: { type: Type.INTEGER },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<AntonymFlowerPuzzleData>;
};

export const generateProverbWordChainFromAI = async (): Promise<ProverbWordChainData> => {
    const prompt = `
    Çocuklar için bir "Atasözü/Özdeyiş Bulma" etkinliği oluştur.
    1. 8 tane kısa ve bilinen Türkçe atasözü veya özdeyiş seç.
    2. Tüm bu cümlelerdeki kelimeleri tek bir listeye koy ve karıştır.
    3. Her kelime için rastgele bir renk ata ('pink', 'orange', 'cyan', 'lime', 'purple', 'yellow', 'red', 'blue').
    4. Çözüm olarak atasözlerinin tam listesini ver.
    5. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        color: { type: Type.STRING },
                    }
                }
            },
            solutions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ProverbWordChainData>;
};

export const generateThematicOddOneOutFromAI = async (theme: string): Promise<ThematicOddOneOutData> => {
    const prompt = `
    Çocuklar için bir "Farklı Özelliği Bulma" etkinliği oluştur. Tema: "${theme}".
    1. 4 satır oluştur. Her satırda, tema ile ilgili 4 kelime ve tema ile ilgisiz 1 kelime olsun.
    2. Her satır için ilgisiz kelimeyi belirt.
    3. Bulunan farklı kelimelerle cümle yazma görevi ekle.
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        oddWord: { type: Type.STRING },
                    }
                }
            },
            sentencePrompt: { type: Type.STRING },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<ThematicOddOneOutData>;
};

export const generateSynonymAntonymGridFromAI = async (): Promise<SynonymAntonymGridData> => {
    const prompt = `
    Çocuklar için bir "Eş ve Zıt Anlamlı Kelime Bulmacası" oluştur.
    1. 10 kelime ve zıt anlamlılarını bul.
    2. 10 kelime ve eş anlamlılarını bul.
    3. Bu 20 zıt/eş anlamlı kelimeyi 15x15'lik bir harf ızgarasına yerleştir.
    4. Boşlukları rastgele harflerle doldur.
    5. Sonucu aşağıdaki JSON formatında döndür. Sadece orijinal kelimeleri ve ızgarayı döndür, cevapları kullanıcı bulacak.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            antonyms: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING } } } },
            synonyms: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { word: { type: Type.STRING } } } },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<SynonymAntonymGridData>;
};

export const generatePunctuationColoringFromAI = async (): Promise<PunctuationColoringData> => {
    const prompt = `
    Çocuklar için bir "Görsel Boyama (Noktalama)" etkinliği oluştur.
    1. Her biri farklı bir noktalama işareti (., ?, !, :, ‘, “”, -) gerektiren 8 tane basit cümle oluştur. Cümlenin sonuna parantez içinde ( ) boşluk bırak.
    2. Her cümle için bir renk ata ('salmon', 'skyblue', 'mediumpurple', 'limegreen', 'gold', 'hotpink', 'darkorange', 'deepskyblue').
    3. Her cümlenin gerektirdiği doğru noktalama işaretini belirt.
    4. Sonucu aşağıdaki JSON formatında döndür.
    `;
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
                        correctMark: { type: Type.STRING },
                    }
                }
            },
        },
    };
    return generateWithSchema(prompt, schema) as Promise<PunctuationColoringData>;
};
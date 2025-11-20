

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
    WordPlacementPuzzleData, PositionalAnagramData, ImageAnagramSortData, AnagramImageMatchData, WordComparisonData,
    ResfebeData
} from '../../types';


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
  
  let wordLengthInstruction = "Kelimeler 3-4 harfli ve somut, görselleştirilebilir nesneler olsun.";
  if (difficulty === 'Orta') wordLengthInstruction = "Kelimeler 5-6 harfli ve somut olsun.";
  if (difficulty === 'Zor') wordLengthInstruction = "Kelimeler 7-9 harfli, bazıları soyut olabilir.";
  if (difficulty === 'Uzman') wordLengthInstruction = "Kelimeler 10+ harfli, soyut veya bileşik kelimeler olmalı.";

  const prompt = `
    "${difficulty}" zorluk seviyesine uygun, '${topic}' konusuyla ilgili ${itemCount} tane Türkçe kelime seç.
    KELİME TÜRÜ: ${wordLengthInstruction}
    Her kelimenin harflerini karıştırarak anagramını oluştur.
    Her kelime için, kelimenin ne olduğunu ima eden, çocuklara uygun, basit, renkli bir görsel oluşturmak için detaylı bir **İngilizce** 'imagePrompt' üret.
    Tüm anagramlar çözüldükten sonra, çocukların bu kelimelerden en az üçünü kullanarak yaratıcı bir cümle yazmaları için bir yönlendirme metni ('sentencePrompt') oluştur.
    
    PEDAGOGICAL NOTE: "Fonolojik farkındalık, harf dizilimi belleği ve kelime türetme becerisi."
    INSTRUCTION: "Karışık harfleri doğru sıraya dizerek gizli kelimeyi bul."

    ÖNEMLİ: Her seferinde farklı kelimeler seç.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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
    
    let difficultyInstruction = "Çok bariz ve basit yazım hataları (örn: 'soğan' yerine 'sogan', 'ağaç' yerine 'agac'). Kelimeler kısa ve yaygın olsun.";
    if (difficulty === 'Orta') difficultyInstruction = "Orta seviye hatalar (de/da ayrımı, ki eki, yumuşak g kullanımı, 'herkes' yerine 'herkez').";
    if (difficulty === 'Zor') difficultyInstruction = "Kafa karıştırıcı, çift ünsüzler, düzeltme işaretleri veya yabancı kökenli kelimelerin yazımı (örn: 'şoför', 'orijinal').";
    if (difficulty === 'Uzman') difficultyInstruction = "Akademik kelimeler, köken bilgisi gerektiren çok ince nüanslı hatalar, bitişik/ayrı yazılan birleşik kelimeler, satır sonu bölmeleri.";

    const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun, Türkçede sıkça yanlış yazılan ${itemCount} kelime bul.
    ZORLUK KRİTERİ: ${difficultyInstruction}
    Her kelime için:
    1. Doğru yazılışını ve 2 tane yaygın yapılan yanlış varyasyonunu içeren 3 seçenekli bir liste oluştur.
    2. Doğru kelimeyi görselleştiren, basit ve anlaşılır, "children's book illustration" tarzında bir **İngilizce** 'imagePrompt' oluştur.
    
    PEDAGOGICAL NOTE: "Görsel sözcük belleği (ortografik farkındalık) ve dikkat."
    INSTRUCTION: "Seçeneklerden yazımı doğru olan kelimeyi bul ve işaretle."

    ÖNEMLİ: Her üretimde farklı kelimeler kullan.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The title for the spelling check activity.' },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            checks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        correct: { type: Type.STRING, description: 'The correctly spelled word.' },
                        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Array of 3 options, including the correct one.' },
                        imagePrompt: { type: Type.STRING, description: 'An English prompt for generating an image for the correct word.' }
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

export const generateWordComparisonFromAI = async (options: GeneratorOptions): Promise<WordComparisonData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  
  let similarityInstruction = "Kelimeler birbirinden görsel ve işitsel olarak tamamen farklı olsun. Ayırt etmek çok kolay olsun.";
  if (difficulty === 'Orta') similarityInstruction = "Kelimeler görsel olarak biraz benzesin (örn: kalem - kelam, masa - kasa).";
  if (difficulty === 'Zor') similarityInstruction = "Kelimeler anagram gibi olsun veya sadece 1 harf fark olsun (örn: kitap - katip).";
  if (difficulty === 'Uzman') similarityInstruction = "Kelimeler neredeyse aynı olsun, sadece çok dikkatli bakınca fark edilen harf değişiklikleri olsun (örn: I/İ, O/Ö, b/d/p karışıklığı, 'şemsiye' - 'şemşiye').";

  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun, iki farklı kutu için 10'ar kelimelik iki liste oluştur. 
    Listelerdeki kelimelerin çoğu aynı olsun ama her listede 3-4 tane farklı kelime bulunsun.
    BENZERLİK VE ZORLUK KRİTERİ: ${similarityInstruction}
    
    PEDAGOGICAL NOTE: "Kısa süreli bellek, görsel kıyaslama ve dikkat sürdürme."
    INSTRUCTION: "İki listeyi karşılaştır. Sadece bir listede olup diğerinde olmayan kelimeleri bul."

    Her seferinde tamamen benzersiz kelime setleri üret.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      box1Title: { type: Type.STRING },
      box2Title: { type: Type.STRING },
      wordList1: { type: Type.ARRAY, items: { type: Type.STRING } },
      wordList2: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['title', 'box1Title', 'box2Title', 'wordList1', 'wordList2', 'instruction', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordComparisonData[]>;
};

export const generateLetterBridgeFromAI = async (options: GeneratorOptions): Promise<LetterBridgeData[]> => {
  const { itemCount, difficulty, worksheetCount } = options;
  
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun 'Harf Köprüsü' etkinliği için ${itemCount} tane kelime çifti oluştur.
    Kelimeler öyle seçilmeli ki, birinci kelimenin sonuna ve ikinci kelimenin başına aynı harf eklendiğinde iki yeni anlamlı kelime oluşsun (örn: BA_A -> BALA, T_A -> TARA).
    Etkinlik sonunda, oluşturulan yeni kelimelerden ikisini kullanarak bir cümle kurma görevi (followUpPrompt) ekle.
    
    PEDAGOGICAL NOTE: "Kelime sonu ve başı ses farkındalığı, türetimsel düşünme."
    INSTRUCTION: "Ortadaki boşluğa bir harf yazarak her iki kelimeyi de tamamla."

    Her seferinde tamamen yeni kelimeler kullan.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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
    const stepCount = steps || 3;
    
    const prompt = `
    '${topic}' konusunda ve "${difficulty}" zorluk seviyesine uygun bir Kelime Merdiveni bulmacası oluştur.
    ${itemCount} tane bulmaca hazırla. Her bulmaca için, aynı harf sayısına sahip, tematik olarak ilişkili bir başlangıç ve bitiş kelimesi bul (örn: KIŞ -> YAZ).
    Dönüşüm ideal olarak ${stepCount} adımda gerçekleşmelidir. Kelimelerin geçerli Türkçe kelimeler olduğundan emin ol.
    
    PEDAGOGICAL NOTE: "Ses-harf ilişkisi (fonem manipülasyonu) ve kelime analizi."
    INSTRUCTION: "Her basamakta sadece bir harfi değiştirerek hedefe ulaş."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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
    Her set için, ${difficulty === 'Başlangıç' ? 5 : difficulty === 'Orta' ? 7 : 9} harfli bir ana kelime seç ve harflerini karıştır.
    Joker hakkı sayısını belirle.
    Son olarak, türetilen kelimelerden bulunması gereken bir 'gizli kelime' ve bu kelimeyi bulmak için bir ipucu ('mysteryWordChallenge') oluştur.
    
    PEDAGOGICAL NOTE: "Anagram çözme, kelime dağarcığı aktivasyonu ve kombinasyonel düşünme."
    INSTRUCTION: "Verilen harfleri kullanarak anlamlı kelimeler türet."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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
    Etkinliğin sonuna, palindromlar veya kelimeleri tersten okuma ile ilgili eğlenceli bir bilgi ('funFact') ekle.
    
    PEDAGOGICAL NOTE: "Görsel işlemleme hızı, harf sırası farkındalığı ve ortografik kod çözme."
    INSTRUCTION: "Kelimeleri tersten oku ve yanındaki boşluğa doğrusunu yaz."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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
    Her kategori için ${Math.floor(itemCount / categoryCount)} tane kelime bul.
    Her kelime için bir 'text' (kelimenin kendisi) ve onu görselleştiren basit, "cute icon style" bir **İngilizce** 'imagePrompt' oluştur.
    Kullanıcı, resimli kelimeleri doğru kategorilere sürükleyip bırakacak.

    PEDAGOGICAL NOTE: "Semantik kategorizasyon, kavramsal düşünme ve görsel ilişkilendirme."
    INSTRUCTION: "Her bir kelimeyi/resmi anlamına uygun olan kategori kutusuna yerleştir."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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
export const generateMiniWordGridFromAI = async (options: any) => [] as any;
export const generatePasswordFinderFromAI = async (options: any) => [] as any;

export const generateSyllableCompletionFromAI = async (options: GeneratorOptions): Promise<SyllableCompletionData[]> => {
    const {itemCount, difficulty, worksheetCount, theme} = options;
    const prompt = `
    '${theme}' temalı ve "${difficulty}" seviyesine uygun 'Hece Tamamlama' etkinliği oluştur.
    ${itemCount} tane kelimeyi hecelerine ayır (ilk hece ve geri kalanı).
    Bu kelimelerin sığacağı, içinde boşluklar bulunan kısa ve anlamlı bir hikaye şablonu ('storyTemplate') oluştur. Boşlukları __WORD__ şeklinde belirt.
    Ayrıca hecelerin ikinci kısımlarını karışık olarak liste halinde ver.
    
    PEDAGOGICAL NOTE: "Hece farkındalığı ve parça-bütün ilişkisi."
    INSTRUCTION: "İlk hecesi verilen kelimeleri kutudaki hecelerle tamamla."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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

export const generateSynonymWordSearchFromAI = async (options: any) => [] as any;

export const generateSpiralPuzzleFromAI = async (options: GeneratorOptions): Promise<SpiralPuzzleData[]> => {
    const {itemCount, difficulty, worksheetCount, topic, gridSize} = options;
    const prompt = `
    '${topic}' temalı, "${difficulty}" seviyesine uygun ${gridSize}x${gridSize} boyutunda bir 'Sarmal Bulmaca' oluştur.
    ${itemCount} tane kelime ve bu kelimeler için ipuçları hazırla. Kelimeleri sarmal şekilde ızgaraya yerleştir.
    Bulmacanın sonunda, konuyla ilgili bir şifre veya ek bir soru ('passwordPrompt') olsun.
    
    PEDAGOGICAL NOTE: "Görsel takip, yön algısı ve kelime bilgisi."
    INSTRUCTION: "İpuçlarını çöz ve kelimeleri dışarıdan içeriye doğru sarmal olarak yaz."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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
    ${itemCount} tane kelime seç. Bu kelimeler için '${clueType}' türünde ipuçları hazırla. Bazı ipuçları için metin yerine görsel oluşturmak üzere **İngilizce** 'imagePrompt' kullan.
    ${passwordLength} harfli bir şifre kelimesi belirle ve bu şifreyi oluşturan harflerin hücrelerini işaretle.
    Bulmaca çözüldükten sonra şifrenin anlamı veya temayla ilişkisi hakkında bir soru ('passwordPrompt') sor.
    
    PEDAGOGICAL NOTE: "Uzamsal organizasyon, kelime çağrışımı ve problem çözme."
    INSTRUCTION: "Soldan sağa ve yukarıdan aşağıya ipuçlarını takip ederek bulmacayı çöz."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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

export const generateJumbledWordStoryFromAI = async (options: any) => [] as any;
export const generateWordGridPuzzleFromAI = async (options: any) => [] as any;
export const generateAntonymFlowerPuzzleFromAI = async (options: any) => [] as any;

export const generateSynonymAntonymGridFromAI = async (options: GeneratorOptions): Promise<SynonymAntonymGridData[]> => {
    const {itemCount, difficulty, worksheetCount, gridSize} = options;
    const prompt = `
    "${difficulty}" seviyesine uygun bir 'Eş ve Zıt Anlamlı Kelime Izgarası' oluştur.
    ${Math.ceil(itemCount/2)} tane kelime ve eş anlamlısını, ${Math.floor(itemCount/2)} tane kelime ve zıt anlamlısını bul.
    Bu eş/zıt anlamlı kelimeleri ${gridSize}x${gridSize} boyutunda bir kelime avı bulmacasına gizle.
    Son olarak, bir kelime ve onun eş anlamlısı arasındaki ince anlam farkını sorgulayan bir 'nuanceQuestion' oluştur.
    
    PEDAGOGICAL NOTE: "Kelime anlam ilişkileri (semantik ağlar) ve kelime hazinesi."
    INSTRUCTION: "Listelenen kelimelerin eş veya zıt anlamlılarını bulmacada bul."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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
    const prompt = `Create an antonym resfebe puzzle for difficulty level "${difficulty}". Generate ${itemCount} puzzles. For each puzzle, generate a Turkish word. Then, create creative visual/textual clues (resfebe) to represent that word. For image clues, provide a clear, simple English image generation prompt. Then provide the antonym of the word. Create ${worksheetCount} unique worksheets.
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

export const generateThematicWordSearchColorFromAI = async (options: any) => [] as any;
export const generatePunctuationSpiralPuzzleFromAI = async (options: any) => [] as any;
export const generateThematicJumbledWordStoryFromAI = async (options: any) => [] as any;
export const generateSynonymMatchingPatternFromAI = async (options: any) => [] as any;
export const generateMissingPartsFromAI = async (options: any) => [] as any;
export const generateWordWebFromAI = async (options: any) => [] as any;

export const generateHomonymSentenceWritingFromAI = async (options: GeneratorOptions): Promise<HomonymSentenceData[]> => {
    const { itemCount, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesine uygun bir 'Eş Sesli Kelime Cümle Yazma' etkinliği oluştur.
    ${itemCount} tane yaygın Türkçe eş sesli kelime seç.
    Her kelime için:
    1. İki farklı anlamını ('meaning1', 'meaning2') kısaca açıkla.
    2. Her bir anlam için, o anlamı temsil eden basit, net ve çocuklara uygun bir görsel oluşturmak için detaylı bir **İngilizce** 'imagePrompt_1' ve 'imagePrompt_2' üret.
    Kullanıcının her anlam için ayrı bir cümle yazması gerekecek.
    
    PEDAGOGICAL NOTE: "Eş sesli kelimelerin (sesteş) farklı bağlamlarda kullanımını kavrama."
    INSTRUCTION: "Aynı kelimenin iki farklı anlamı için birer cümle yaz."

    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
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
    const prompt = `Create a homonym image matching puzzle for difficulty "${difficulty}". For each worksheet, pick a common Turkish homonym. Create two image prompts (in English) for its two different meanings. Also create a simple word scramble for the homonym itself. The user will match the images and solve the scramble. 
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
    const prompt = `Create an image anagram sorting activity with theme '${topic}' for difficulty level "${difficulty}". Generate ${itemCount} cards. Each card must have a scrambled word, its correct form, a description, and a simple, clear English image generation prompt. The user will solve the anagrams and sort the cards alphabetically. 
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
    const prompt = `Create an anagram-image matching activity with theme '${topic}' for difficulty level "${difficulty}". Generate a word bank of ${itemCount} words. Then, create ${itemCount} puzzles. Each puzzle should have an image (provide English image prompt), the correct word, and a version of the answer with some letters filled in as a clue. The user finds the word in the word bank that matches the image and clue. 
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

export const generateSyllableWordSearchFromAI = async (options: any) => [] as any;
export const generateWordSearchWithPasswordFromAI = async (options: any) => [] as any;
export const generateWordWebWithPasswordFromAI = async (options: any) => [] as any;
export const generateLetterGridWordFindFromAI = async (options: any) => [] as any;
export const generateWordPlacementPuzzleFromAI = async (options: any) => [] as any;
export const generatePositionalAnagramFromAI = async (options: any) => [] as any;

import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData, ProverbSayingSortData, ProverbWordChainData, MultipleChoiceStoryQuestion, OpenEndedStoryQuestion, StoryQuestion, ProverbFillData, ProverbSearchData } from '../../types';

export const generateStoryComprehensionFromAI = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { topic, difficulty, worksheetCount, characterName, storyLength, genre } = options;
    
    let wordCount = "100-150";
    if (storyLength === 'short') wordCount = "50-80";
    else if (storyLength === 'long') wordCount = "200-250";
   
    let style = "orta seviye kelime dağarcığı, net ve anlaşılır cümle yapıları. 2 çoktan seçmeli, 1 açık uçlu soru hazırla.";
    if (difficulty === 'Başlangıç') style = "çok basit, kısa ve anlaşılır cümleler. Karmaşık kelime olmasın. 3 tane basit, çoktan seçmeli soru hazırla.";
    if (difficulty === 'Zor') style = "zengin kelime dağarcığı, deyimler, mecaz anlamlar ve daha uzun cümleler. 2 çoktan seçmeli (biri çıkarım gerektirsin), 2 açık uçlu soru hazırla.";
    if (difficulty === 'Uzman') style = "edebi bir dil, karmaşık cümle yapıları, soyut kavramlar. 1 çoktan seçmeli, 2 açık uçlu (yoruma dayalı) ve 1 kelime bilgisi sorusu hazırla.";

    
    const charInstruction = characterName ? `Ana karakterin adı: ${characterName}.` : "";
    const genreInstruction = genre ? `Hikaye türü: ${genre}.` : "";

    const prompt = `
    "${difficulty}" zorluk seviyesindeki bir çocuk için '${topic}' konusunda bir hikaye yaz.
    ${charInstruction}
    ${genreInstruction}
    Hikaye Uzunluğu: yaklaşık ${wordCount} kelime.
    Dil ve Üslup: ${style}
    
    Hikayeyi yazdıktan sonra, aşağıdaki bilgileri de oluştur:
    1.  **imagePrompt**: Hikayeyi özetleyen, çocuklara uygun, basit, renkli ve neşeli bir çizgi film tarzı resmi oluşturmak için kullanılacak, detaylı bir **İngilizce** görsel istemi.
    2.  **mainIdea**: Hikayenin ana fikrini bir cümleyle özetle.
    3.  **characters**: Hikayedeki ana karakterlerin isimlerini veya tanımlarını liste olarak ver.
    4.  **setting**: Hikayenin geçtiği mekanı kısaca tanımla.
    5.  **questions**: Hikayeyle ilgili, yukarıda zorluk seviyesi için belirtilen sayıda ve türde sorular oluştur.
        -   'multiple-choice' sorular için 3 seçenek sun ve doğru olanın indeksini belirt.
        -   'open-ended' sorular için sadece soruyu yaz.
    
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            imagePrompt: { type: Type.STRING, description: "Detailed English prompt for generating a cartoonish, kid-friendly image based on the story." },
            mainIdea: { type: Type.STRING },
            characters: { type: Type.ARRAY, items: { type: Type.STRING } },
            setting: { type: Type.STRING },
            questions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['multiple-choice', 'open-ended'] },
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answerIndex: { type: Type.INTEGER },
                    },
                    required: ['type', 'question']
                },
            },
        },
        required: ['title', 'story', 'imagePrompt', 'mainIdea', 'characters', 'setting', 'questions']
    };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<StoryData[]>;
};

export const generateStoryAnalysisFromAI = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
  const { topic, difficulty, worksheetCount, storyLength } = options;
  
  const prompt = `
    '${topic}' konusunda ve "${difficulty}" zorluk seviyesine uygun, ${storyLength} uzunluğunda bir hikaye yaz.
    Hikaye sonrası için 4 tane analiz sorusu oluştur. Her biri farklı türde olmalı:
    1.  **Tema Sorusu**: Hikayenin ana mesajı veya teması hakkında bir soru (örn: "Hikaye bize arkadaşlığın önemi hakkında ne öğretiyor?").
    2.  **Karakter Motivasyon Sorusu**: Ana karakterin bir eylemi neden yaptığına dair bir soru (örn: "Ayşe neden ormana tek başına gitmeye karar verdi?").
    3.  **Sebep-Sonuç Sorusu**: Hikayedeki bir olayın sonucunu sorgulayan bir soru (örn: "Sihirli fasulyeyi ektiğinde ne oldu?").
    4.  **Çıkarım Sorusu**: Metinde doğrudan yazmayan ama anlaşılabilecek bir detayı soran bir soru (örn: "Hikayenin sonunda karakterin kendini nasıl hissettiğini düşünüyorsun?").
    Ayrıca, hikayeyi anlatan basit ve ilgi çekici bir görsel için İngilizce bir 'imagePrompt' oluştur.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      story: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      analysisQuestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ['tema', 'karakter', 'sebep-sonuç', 'çıkarım'] },
            question: { type: Type.STRING }
          },
          required: ['type', 'question']
        }
      }
    },
    required: ['title', 'story', 'imagePrompt', 'analysisQuestions']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<StoryAnalysisData[]>;
};

export const generateStoryCreationPromptFromAI = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
  const { topic, itemCount: keywordCount, difficulty, worksheetCount } = options;
  
  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun bir hikaye oluşturma etkinliği hazırla.
    Hikayede kullanılması gereken ${keywordCount} tane anahtar kelime belirle.
    Çocuğun bu kelimeleri kullanarak hikaye yazması için ilham verici bir yönlendirme (prompt) metni oluştur.
    Ayrıca, hikayeye ilham verecek, çocuklara uygun, basit, renkli bir görsel için detaylı bir **İngilizce** 'imagePrompt' oluştur.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      prompt: { type: Type.STRING },
      keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      imagePrompt: { type: Type.STRING }
    },
    required: ['title', 'prompt', 'keywords', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<StoryCreationPromptData[]>;
};

export const generateWordsInStoryFromAI = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
  const { topic, difficulty, worksheetCount, storyLength } = options;
  const prompt = `
    '${topic}' konusunda, "${difficulty}" zorluk seviyesine ve '${storyLength}' uzunluğuna uygun kısa bir hikaye yaz.
    Hikayeden ${difficulty === 'Başlangıç' ? '3' : '5'} tane önemli ve anlamı öğrenilebilecek kelime seç.
    Her kelime için, çocuğun kelime dağarcığını geliştirecek bir soru oluştur. Soru ya kelimenin anlamını sormalı ("'cesur' kelimesi ne demektir?") ya da o kelimeyi yeni bir cümlede kullanmasını istemeli ("'keşfetmek' kelimesini kullanarak bir cümle yaz.").
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      story: { type: Type.STRING },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            question: { type: Type.STRING }
          },
          required: ['word', 'question']
        }
      }
    },
    required: ['title', 'story', 'questions']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordsInStoryData[]>;
};

export const generateStorySequencingFromAI = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    const prompt = `
    '${topic}' konusunda ve "${difficulty}" zorluk seviyesine uygun 4 panellik bir hikaye oluştur.
    Her panel için, sahneyi anlatan kısa bir açıklama ('description') ve o sahneyi anlatan basit, renkli, çizgi film tarzı bir görsel oluşturmak için detaylı bir **İngilizce** 'imagePrompt' üret.
    Panelleri (A, B, C, D) karışık sırada ver.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
    `;
    const singleSchema = {
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
                        description: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["id", "description", "imagePrompt"]
                }
            }
        },
        required: ["title", "prompt", "panels"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StorySequencingData[]>;
};

export const generateProverbSayingSortFromAI = async(options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a "Proverb or Saying" sorting activity, appropriate for difficulty level "${difficulty}". Provide a list of ${itemCount} Turkish items. Each item is either a proverb ('atasözü') or a saying ('özdeyiş'). The user must classify each one. 
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
                        text: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['atasözü', 'özdeyiş'] }
                    },
                    required: ["text", "type"]
                }
            }
        },
        required: ["title", "prompt", "items"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ProverbSayingSortData[]>;
}

export const generateProverbWordChainFromAI = async(options: GeneratorOptions): Promise<ProverbWordChainData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Create a proverb word chain activity, appropriate for difficulty level "${difficulty}". Provide a word cloud of about ${itemCount*5} Turkish words that can form ${itemCount} proverbs or sayings. Also provide the full solutions. Assign a random hex color to each word. 
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
    return generateWithSchema(prompt, schema) as Promise<ProverbWordChainData[]>;
}

export const generateProverbFillInTheBlankFromAI = async (options: GeneratorOptions): Promise<ProverbFillData[]> => {
  const { itemCount, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun ${itemCount} tane Türkçe atasözü seç. Her atasözünde bir kelimeyi eksik bırakarak 'start' ve 'end' kısımlarını oluştur.
    Ayrıca, seçilen tüm atasözlerinin genel anlamını veya onlardan çıkarılacak dersi özetleyen kısa bir 'meaning' metni oluştur.
    Son olarak, öğrencinin bu atasözlerinden birini kullanarak kendi hayatından bir örnek anlattığı bir paragraf yazması için 'usagePrompt' oluştur.
    ÖNEMLİ: Her üretimde farklı atasözleri kullanmaya çalış.
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
            end: { type: Type.STRING },
            full: { type: Type.STRING }
          },
          required: ['start', 'end', 'full']
        }
      },
      meaning: { type: Type.STRING },
      usagePrompt: { type: Type.STRING }
    },
    required: ['title', 'proverbs', 'meaning', 'usagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<ProverbFillData[]>;
};

export const generateProverbSearchFromAI = async (options: GeneratorOptions): Promise<ProverbSearchData[]> => {
  const { difficulty, worksheetCount, gridSize } = options;
  const prompt = `
    "${difficulty}" zorluk seviyesine uygun bir 'Atasözü Avı' etkinliği oluştur. ${gridSize}x${gridSize} boyutunda bir harf tablosu oluştur ve içine bir Türkçe atasözü gizle.
    Ayrıca, bu atasözünün anlamını açıklayan kısa bir 'meaning' metni de ekle.
    Her seferinde benzersiz bir atasözü seç.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      proverb: { type: Type.STRING },
      meaning: { type: Type.STRING }
    },
    required: ['title', 'grid', 'proverb', 'meaning']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<ProverbSearchData[]>;
};

// FIX: Removed mock functions that are implemented in other files to prevent export ambiguity.
// These functions are thematically better suited for wordGames.ts and memoryAttention.ts.

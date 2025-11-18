import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { OfflineGeneratorOptions } from '../offlineGenerators';
import { StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData, ProverbSayingSortData, ProverbWordChainData, GeneratorOptions } from '../../types';

export const generateStoryComprehensionFromAI = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { topic, difficulty, worksheetCount, characterName, storyLength, genre } = options;
    
    let wordCount = "50-80";
    if (storyLength === 'short') wordCount = "50-80";
    else if (storyLength === 'medium') wordCount = "100-150";
    else if (storyLength === 'long') wordCount = "200-250";
    else if (difficulty === 'Orta') wordCount = "100-150"; // Fallback
    else if (difficulty === 'Zor') wordCount = "200-250"; // Fallback

    let style = "çok basit, kısa ve anlaşılır cümleler. Karmaşık kelime olmasın.";
    if (difficulty === 'Zor') style = "zengin kelime dağarcığı, deyimler, mecaz anlamlar.";
    
    const charInstruction = characterName ? `Ana karakterin adı: ${characterName}.` : "";
    const genreInstruction = genre ? `Hikaye türü: ${genre}.` : "";

    const prompt = `
    "${difficulty}" zorluk seviyesindeki bir çocuk için '${topic}' konusunda bir hikaye yaz.
    ${charInstruction}
    ${genreInstruction}
    Hikaye Uzunluğu: ${wordCount} kelime.
    Dil ve Üslup: ${style}
    
    Hikayeden sonra, hikayeyle ilgili 3 tane çoktan seçmeli anlama sorusu oluştur. 
    Her soru için 3 seçenek sun ve doğru seçeneğin indeksini (0, 1 veya 2) belirt.
    
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun. Mümkün olduğunda emoji kullan.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
    const singleSchema = {
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
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<StoryData[]>;
};

export const generateStoryAnalysisFromAI = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  
  let difficultyInstruction = "Metin çok kısa olsun. Sorular çok basit olsun.";
  if (difficulty === 'Zor') difficultyInstruction = "Metin karmaşık olsun. Sorular detaylı analiz gerektirsin.";
  
  const prompt = `
    '${topic}' konusunda ve "${difficulty}" zorluk seviyesine uygun, içinde eş ve zıt anlamlı kelimeler barındıran bir hikaye yaz.
    ZORLUK DETAYI: ${difficultyInstruction}
    Hikaye sonrası için 3 tane analiz sorusu oluştur. Sorular "Hikayedeki 'mutlu' kelimesinin zıt anlamlısı nedir?" gibi dil bilgisi veya detay analizi odaklı olmalı.
    Her soru için, cevabın bulunabileceği ipucu (context) metnini de belirt.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur.
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
            question: { type: Type.STRING },
            context: { type: Type.STRING }
          },
          required: ['question', 'context']
        }
      }
    },
    required: ['title', 'story', 'questions']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<StoryAnalysisData[]>;
};

export const generateStoryCreationPromptFromAI = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
  const { topic, itemCount: keywordCount, difficulty, worksheetCount } = options;
  
  let keywordType = "Basit, somut kelimeler (top, ev, kedi).";
  if (difficulty === 'Zor') keywordType = "Soyut, duygusal kelimeler (cesaret, hüzün, macera).";
  
  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun bir hikaye oluşturma etkinliği hazırla.
    Hikayede kullanılması gereken ${keywordCount} tane anahtar kelime belirle.
    KELİME TÜRÜ: ${keywordType}
    Çocuğun bu kelimeleri kullanarak hikaye yazması için ilham verici bir yönlendirme (prompt) metni oluştur.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      prompt: { type: Type.STRING },
      keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['title', 'prompt', 'keywords']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<StoryCreationPromptData[]>;
};

export const generateWordsInStoryFromAI = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const prompt = `
    '${topic}' konusunda ve "${difficulty}" zorluk seviyesine uygun kısa bir hikaye yaz.
    Ardından, 12 kelimelik bir liste oluştur. Bu listenin yarısı hikayede geçen kelimelerden, diğer yarısı ise geçmeyen (ama konuya yakın çeldirici) kelimelerden oluşsun.
    Her kelimenin hikayede olup olmadığını (isInStory) boolean olarak belirt.
    Bu kurallara göre, her biri benzersiz içeriklere sahip ${worksheetCount} tane çalışma sayfası verisi oluşturup bir JSON dizisi olarak döndür.
  `;
  const singleSchema = {
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
            isInStory: { type: Type.BOOLEAN }
          },
          required: ['word', 'isInStory']
        }
      }
    },
    required: ['title', 'story', 'wordList']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordsInStoryData[]>;
};

export const generateStorySequencingFromAI = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    let complexity = "Olay örgüsü çok net ve basit.";
    if (difficulty === 'Zor' || difficulty === 'Uzman') complexity = "Olay örgüsü karmaşık, sebep-sonuç ilişkisi dikkat gerektirsin.";

    const prompt = `
    Create a story sequencing activity about '${topic}', appropriate for difficulty level "${difficulty}".
    COMPLEXITY: ${complexity}
    Generate a 4-panel story. For each panel, provide a short description of the scene.
    The panels should be given in a jumbled order. Each panel needs a letter ID (A, B, C, D).
    The user's goal is to put the panels in the correct chronological order to tell the story.
    Create ${worksheetCount} unique worksheets based on these rules and return them in a JSON array.
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
                        description: { type: Type.STRING }
                    },
                    required: ["id", "description"]
                }
            }
        },
        required: ["title", "prompt", "panels"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StorySequencingData[]>;
};

export const generateProverbSayingSortFromAI = async(options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a "Proverb or Saying" sorting activity, appropriate for difficulty level "${difficulty}". Provide a list of 10 Turkish items. Each item is either a proverb ('atasözü') or a saying ('özdeyiş'). The user must classify each one. 
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
    const { difficulty, worksheetCount } = options;
    const prompt = `Create a proverb word chain activity, appropriate for difficulty level "${difficulty}". Provide a word cloud of about 20 Turkish words that can form 3-4 proverbs or sayings. Also provide the full solutions. Assign a random hex color to each word. 
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

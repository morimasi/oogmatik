
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { OfflineGeneratorOptions } from '../offlineGenerators';
import { StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData, ProverbSayingSortData, ProverbWordChainData } from '../../types';

export const generateStoryComprehensionFromAI = async (options: OfflineGeneratorOptions): Promise<StoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" zorluk seviyesindeki bir çocuk için '${topic}' konusunda 100-150 kelimelik kısa ve basit bir Türkçe hikaye yaz. 
    Hikayenin bir başlığı olsun.
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

export const generateStoryAnalysisFromAI = async (options: OfflineGeneratorOptions): Promise<StoryAnalysisData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const prompt = `
    '${topic}' konusunda ve "${difficulty}" zorluk seviyesine uygun, içinde eş ve zıt anlamlı kelimeler barındıran 150-200 kelimelik bir hikaye yaz.
    Hikaye sonrası için 3 tane analiz sorusu oluştur. Sorular "Hikayedeki 'mutlu' kelimesinin zıt anlamlısı nedir?" gibi olmalı.
    Her soru için, cevabın bulunabileceği ipucu (context) metnini de belirt.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
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

export const generateStoryCreationPromptFromAI = async (options: OfflineGeneratorOptions): Promise<StoryCreationPromptData[]> => {
  const { topic, itemCount: keywordCount, difficulty, worksheetCount } = options;
  const prompt = `
    '${topic}' konusuyla ilgili ve "${difficulty}" zorluk seviyesine uygun bir hikaye oluşturma etkinliği hazırla.
    Hikayede kullanılması gereken ${keywordCount} tane anahtar kelime belirle.
    Çocuğun bu kelimeleri kullanarak hikaye yazması için bir yönlendirme (prompt) metni oluştur.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
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

export const generateWordsInStoryFromAI = async (options: OfflineGeneratorOptions): Promise<WordsInStoryData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const prompt = `
    '${topic}' konusunda ve "${difficulty}" zorluk seviyesine uygun 100-120 kelimelik kısa bir hikaye yaz.
    Ardından, 12 kelimelik bir liste oluştur. Bu listenin yarısı hikayede geçen kelimelerden, diğer yarısı ise geçmeyen kelimelerden oluşsun.
    Her kelimenin hikayede olup olmadığını (isInStory) boolean olarak belirt.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
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

export const generateStorySequencingFromAI = async (options: OfflineGeneratorOptions): Promise<StorySequencingData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    Create a story sequencing activity about '${topic}', appropriate for difficulty level "${difficulty}".
    Generate a simple 4-panel story. For each panel, provide a short description of the scene.
    The panels should be given in a jumbled order. Each panel needs a letter ID (A, B, C, D).
    The user's goal is to put the panels in the correct chronological order to tell the story.
    Her seferinde tamamen yeni, benzersiz ve daha önce ürettiklerinden farklı bir içerik oluştur. Başlıklar, istemler ve içerikler çocuklar için eğlenceli, ilgi çekici ve yaratıcı olsun.
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

export const generateProverbSayingSortFromAI = async(options: OfflineGeneratorOptions): Promise<ProverbSayingSortData[]> => {
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

export const generateProverbWordChainFromAI = async(options: OfflineGeneratorOptions): Promise<ProverbWordChainData[]> => {
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

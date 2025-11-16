import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData, ProverbSayingSortData, ProverbWordChainData } from '../../types';

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
                        type: { type: Type.STRING }
                    },
                    required: ["text", "type"]
                }
            }
        },
        required: ["title", "prompt", "items"]
    };
    return generateWithSchema(prompt, schema) as Promise<ProverbSayingSortData>;
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
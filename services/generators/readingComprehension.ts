
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData, ProverbSayingSortData, ProverbWordChainData, MultipleChoiceStoryQuestion, OpenEndedStoryQuestion, StoryQuestion, ProverbFillData, ProverbSearchData } from '../../types';

// Shared Pedagogy Note
const PED_NOTE = "Disleksik bireyler için optimize edilmiş; kısa paragraflar, somut dil ve açık yönergeler içerir.";

export const generateStoryComprehensionFromAI = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { topic, difficulty, worksheetCount, characterName, storyLength, genre } = options;
    
    let wordCount = "100-150";
    if (storyLength === 'short') wordCount = "60-80";
    else if (storyLength === 'long') wordCount = "200-250";
   
    const diffPrompt = difficulty === 'Başlangıç' 
        ? "Kısa, basit cümleler (Özne-Yüklem). Deyim kullanma. Somut olaylar." 
        : difficulty === 'Uzman' 
        ? "Zengin betimlemeler, çıkarım gerektiren olaylar." 
        : "Orta uzunlukta cümleler.";

    const charInstruction = characterName ? `Ana karakterin adı: ${characterName}.` : "";
    const genreInstruction = genre ? `Tür: ${genre}.` : "";

    const prompt = `
    DİSLEKSİ DOSTU İÇERİK ÜRETİMİ:
    Konu: '${topic}'. Zorluk: "${difficulty}". Uzunluk: ${wordCount} kelime.
    ${charInstruction} ${genreInstruction}
    
    Yazım Kuralları:
    1. ${diffPrompt}
    2. Paragrafları kısa tut.
    3. Karmaşık, iç içe geçmiş cümlelerden kaçın.
    4. Hikayede net bir "Giriş - Olay - Sonuç" yapısı olsun.

    Sorular (Bloom Taksonomisi):
    1. Hatırlama (Literal): Metinde açıkça yazan bir detay.
    2. Çıkarım (Inferential): Karakterin duygusu veya olayların nedeni.
    3. Değerlendirme (Critical): "Sen olsan ne yapardın?" tarzı.

    JSON Çıktısı:
    - story: Hikaye metni (satır sonlarına \\n ekleyerek paragrafları ayır).
    - pedagogicalNote: "${PED_NOTE}"
    - imagePrompt: İngilizce, çocuklara uygun illüstrasyon istemi.
    - mainIdea: 1 cümlelik ana fikir.
    - characters: Karakter listesi.
    - setting: Mekan.
    - questions: 3 adet soru (Type: multiple-choice veya open-ended).
    
    ${worksheetCount} adet üret.
  `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
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
        required: ['title', 'story', 'imagePrompt', 'mainIdea', 'characters', 'setting', 'questions', 'pedagogicalNote']
    };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<StoryData[]>;
};

export const generateStoryAnalysisFromAI = async (options: GeneratorOptions): Promise<StoryAnalysisData[]> => {
  const { topic, difficulty, worksheetCount, storyLength } = options;
  
  const prompt = `
    '${topic}' konusunda, "${difficulty}" seviyesinde, '${storyLength}' uzunluğunda bir hikaye yaz.
    Hikaye mantıksal bir akışa (neden-sonuç) sahip olsun.
    
    Analiz Soruları (4 Adet):
    1. Tema: Hikayenin vermek istediği mesaj.
    2. Karakter: Ana karakterin kişilik özelliği.
    3. Sebep-Sonuç: Bir olayın nedenine odaklan.
    4. Çıkarım: Metinde yazmayan ama anlaşılan bir detay.
    
    ${worksheetCount} adet üret.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      story: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
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
    required: ['title', 'story', 'imagePrompt', 'analysisQuestions', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<StoryAnalysisData[]>;
};

export const generateStoryCreationPromptFromAI = async (options: GeneratorOptions): Promise<StoryCreationPromptData[]> => {
  const { topic, itemCount: keywordCount, difficulty, worksheetCount } = options;
  
  const prompt = `
    '${topic}' konusunda yaratıcı yazma etkinliği.
    ${keywordCount} adet, birbiriyle ilişkili (semantik bağlamı olan) anahtar kelime seç.
    Öğrenciye ilham verecek kısa bir "Hikaye Başlatıcı" (Prompt) yaz.
    Görsel: Hikayenin geçtiği dünyayı betimleyen İngilizce prompt.
    ${worksheetCount} adet üret.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      prompt: { type: Type.STRING },
      keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      imagePrompt: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING }
    },
    required: ['title', 'prompt', 'keywords', 'imagePrompt', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<StoryCreationPromptData[]>;
};

export const generateWordsInStoryFromAI = async (options: GeneratorOptions): Promise<WordsInStoryData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const prompt = `
    '${topic}' konusunda kısa bir hikaye yaz.
    Hikaye içinde geçen, öğrencinin kelime dağarcığına katabileceği ${difficulty === 'Başlangıç' ? '3' : '5'} kelimeyi seç.
    Bu kelimelerin anlamını pekiştirecek sorular sor (Örn: Cümle içinde kullan, zıt anlamlısını bul).
    ${worksheetCount} adet üret.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      story: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
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
    required: ['title', 'story', 'questions', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<WordsInStoryData[]>;
};

export const generateStorySequencingFromAI = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    
    const prompt = `
    '${topic}' konusunda 4 aşamalı mantıksal bir olay örgüsü oluştur (Giriş -> Olay -> Doruk -> Sonuç).
    Panelleri karışık sırada ver.
    Her panel için sahneyi anlatan İngilizce 'imagePrompt' oluştur.
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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
        required: ["title", "prompt", "panels", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StorySequencingData[]>;
};

export const generateProverbSayingSortFromAI = async(options: GeneratorOptions): Promise<ProverbSayingSortData[]> => {
    const { difficulty, worksheetCount, itemCount } = options;
    const prompt = `Türkçe Atasözü ve Özdeyiş (Vecize) ayırma etkinliği. ${itemCount} adet karışık cümle ver. Her birinin türünü belirt.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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
        required: ["title", "prompt", "items", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ProverbSayingSortData[]>;
}

export const generateProverbWordChainFromAI = async(options: GeneratorOptions): Promise<ProverbWordChainData[]> => {
    const { worksheetCount, itemCount } = options;
    const prompt = `${itemCount} adet atasözü seç. Bu atasözlerini oluşturan tüm kelimeleri karışık bir "Kelime Bulutu" olarak ver. Ayrıca çözümleri listele.`;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
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
        required: ["title", "prompt", "wordCloud", "solutions", "pedagogicalNote"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<ProverbWordChainData[]>;
}

export const generateProverbFillInTheBlankFromAI = async (options: GeneratorOptions): Promise<ProverbFillData[]> => {
  const { itemCount, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" seviyesine uygun ${itemCount} atasözü seç.
    Öğrenci için anlaması en kritik olan kelimeyi boşluk bırak ('start' ve 'end' olarak böl).
    Seçilen atasözlerinin genel bir temasını (örn: Tasarruf, Dostluk) 'meaning' alanında açıkla.
    ${worksheetCount} adet üret.
  `;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
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
    required: ['title', 'proverbs', 'meaning', 'usagePrompt', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<ProverbFillData[]>;
};

export const generateProverbSearchFromAI = async (options: GeneratorOptions): Promise<ProverbSearchData[]> => {
  const { difficulty, worksheetCount, gridSize } = options;
  const prompt = `Atasözü Avı bulmacası. Bir atasözünü ${gridSize}x${gridSize} ızgaraya gizle.`;
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
      proverb: { type: Type.STRING },
      meaning: { type: Type.STRING }
    },
    required: ['title', 'grid', 'proverb', 'meaning', 'pedagogicalNote']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<ProverbSearchData[]>;
};

// Re-exports for consistent API
export const generateProverbSentenceFinderFromAI = generateProverbWordChainFromAI;

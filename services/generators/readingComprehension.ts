
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import { StoryData, StoryAnalysisData, StoryCreationPromptData, StorySequencingData } from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bilişsel beceri açıklaması.
3. "instruction": Net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Konuyla ilgili sevimli, renkli bir illüstrasyon (örneğin: 'Children book illustration style').
5. İçerik özgün ve eğitici olmalı.
`;

export const generateStoryComprehensionFromAI = async (options: GeneratorOptions): Promise<StoryData[]> => {
    const { topic, difficulty, worksheetCount } = options;
    const prompt = `
    '${topic}' konulu, "${difficulty}" seviyesinde hikaye.
    **İngilizce** 'imagePrompt' oluştur. Stil: "Colorful storybook illustration".
    ${PEDAGOGICAL_PROMPT}
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
  const { topic, difficulty, worksheetCount } = options;
  const prompt = `
    '${topic}' konulu Hikaye Analizi.
    **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
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
  const { topic, worksheetCount } = options;
  const prompt = `
    '${topic}' konulu Hikaye Oluşturma İstemi.
    **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
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

export const generateStorySequencingFromAI = async (options: GeneratorOptions): Promise<StorySequencingData[]> => {
    const { topic, worksheetCount } = options;
    const prompt = `
    '${topic}' konulu Hikaye Sıralama.
    Her panel için **İngilizce** 'imagePrompt'.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            panels: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, description: { type: Type.STRING }, imagePrompt: { type: Type.STRING } }, required: ["id", "description", "imagePrompt"] } }
        },
        required: ["title", "prompt", "panels", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<StorySequencingData[]>;
};

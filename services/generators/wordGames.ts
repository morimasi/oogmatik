
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    WordSearchData, AnagramsData, CrosswordData
} from '../../types';

const getDifficultyPrompt = (diff: string) => {
    return `Zorluk: ${diff}.`;
};

const PEDAGOGICAL_PROMPT = `[ROL: PEDAGOG] Sözel oyun materyali üret. Sadece JSON.`;

export const generateWordSearchFromAI = async (options: GeneratorOptions): Promise<WordSearchData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const prompt = `Konu: ${topic}. ${getDifficultyPrompt(difficulty)} Kelime Bulmaca üret. ${PEDAGOGICAL_PROMPT}`;
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        instruction: { type: Type.STRING },
        pedagogicalNote: { type: Type.STRING },
        grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
        words: { type: Type.ARRAY, items: { type: Type.STRING } },
        hiddenMessage: { type: Type.STRING }
      },
      required: ['title', 'instruction', 'grid', 'words']
    }
  };
  return generateWithSchema(prompt, schema);
};

export const generateAnagramFromAI = async (options: GeneratorOptions): Promise<AnagramsData[]> => {
    const { topic, difficulty } = options;
    const prompt = `Konu: ${topic}. Anagram etkinliği üret. ${PEDAGOGICAL_PROMPT}`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                anagrams: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            word: { type: Type.STRING },
                            scrambled: { type: Type.STRING },
                            letters: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ['word', 'scrambled']
                    }
                }
            },
            required: ['title', 'anagrams']
        }
    };
    return generateWithSchema(prompt, schema);
};

export const generateCrosswordFromAI = async (options: GeneratorOptions): Promise<CrosswordData[]> => {
    const { topic, difficulty } = options;
    const prompt = `Konu: ${topic}. Çapraz bulmaca üret. ${PEDAGOGICAL_PROMPT}`;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                clues: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.INTEGER },
                            direction: { type: Type.STRING },
                            text: { type: Type.STRING },
                            word: { type: Type.STRING }
                        },
                        required: ['id', 'direction', 'text', 'word']
                    }
                },
                passwordPrompt: { type: Type.STRING }
            },
            required: ['title', 'grid', 'clues', 'passwordPrompt']
        }
    };
    return generateWithSchema(prompt, schema);
};

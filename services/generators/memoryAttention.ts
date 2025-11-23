
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    VisualMemoryData, LetterGridTestData, StroopTestData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bu etkinlik hangi bilişsel beceriyi desteklediğini açıkla (örn: görsel hafıza, seçici dikkat).
3. "instruction": Öğrenciye yönelik net yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Konuyla ilgili sevimli, renkli bir illüstrasyon.
5. İçerik dolu ve gerçekçi olmalı.
`;

export const generateVisualMemoryFromAI = async (options: GeneratorOptions): Promise<VisualMemoryData[]> => {
  const { topic, difficulty, worksheetCount } = options;
  const prompt = `
    "${difficulty}" seviyesinde, '${topic}' temalı Görsel Hafıza Testi.
    Nesneler için **İngilizce** 'imagePrompt' ve Türkçe 'description' üret.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
  `;
  const itemSchema = {
      type: Type.OBJECT,
      properties: {
          description: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
      },
      required: ['description', 'imagePrompt']
  };
  const singleSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      instruction: { type: Type.STRING },
      pedagogicalNote: { type: Type.STRING },
      imagePrompt: { type: Type.STRING },
      memorizeTitle: { type: Type.STRING },
      testTitle: { type: Type.STRING },
      itemsToMemorize: { type: Type.ARRAY, items: itemSchema },
      testItems: { type: Type.ARRAY, items: itemSchema }
    },
    required: ['title', 'memorizeTitle', 'testTitle', 'itemsToMemorize', 'testItems', 'instruction', 'pedagogicalNote', 'imagePrompt']
  };
  const schema = { type: Type.ARRAY, items: singleSchema };
  return generateWithSchema(prompt, schema) as Promise<VisualMemoryData[]>;
};

export const generateBurdonTestFromAI = async (options: GeneratorOptions): Promise<LetterGridTestData[]> => {
    const { gridSize, difficulty, worksheetCount, targetLetters } = options;
    const prompt = `
    "${difficulty}" seviyesinde Burdon Dikkat Testi (Harf Izgarası). 
    Hedefler: a, b, d, g.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
            targetLetters: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'grid', 'targetLetters', 'instruction', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LetterGridTestData[]>;
};

export const generateStroopTestFromAI = async (options: GeneratorOptions): Promise<StroopTestData[]> => {
     const prompt = `Stroop Testi oluştur. Renk isimleri ile renkler uyumsuz olsun. ${PEDAGOGICAL_PROMPT}`;
     const singleSchema = {
         type: Type.OBJECT,
         properties: {
             title: { type: Type.STRING },
             instruction: { type: Type.STRING },
             pedagogicalNote: { type: Type.STRING },
             imagePrompt: { type: Type.STRING }, 
             items: {
                 type: Type.ARRAY,
                 items: {
                     type: Type.OBJECT,
                     properties: { text: { type: Type.STRING }, color: { type: Type.STRING } },
                     required: ["text", "color"]
                 }
             }
         },
         required: ["title", "items", 'instruction', 'pedagogicalNote', 'imagePrompt']
     };
     const schema = { type: Type.ARRAY, items: singleSchema };
     return generateWithSchema(prompt, schema) as Promise<StroopTestData[]>;
}

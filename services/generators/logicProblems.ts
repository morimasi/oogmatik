
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { GeneratorOptions } from '../../types';
import {
    NumberPatternData, LogicGridPuzzleData
} from '../../types';

const PEDAGOGICAL_PROMPT = `
EĞİTİMSEL İÇERİK KURALLARI:
1. Çıktı JSON formatında olmalı.
2. "pedagogicalNote": Bu etkinlik hangi bilişsel beceriyi (örn: sıralı düşünme, görsel ayırt etme, mantıksal çıkarım) desteklediğini açıklayan kısa bir not.
3. "instruction": Öğrenciye yönelik kısa, net ve cesaretlendirici bir yönerge.
4. "imagePrompt": Etkinlik için MUTLAKA bir adet ana görsel betimlemesi (İngilizce). Konuyla ilgili sevimli, renkli bir illüstrasyon.
5. İçerik asla "Lorem ipsum" veya yer tutucu olmamalı, gerçek ve eğitici veri üret.
`;

export const generateNumberPatternFromAI = async (options: GeneratorOptions): Promise<NumberPatternData[]> => {
    const { itemCount, difficulty, worksheetCount, patternType } = options;
    
    let patternRules = "Basit aritmetik artışlar (örn: +2, +5).";
    if (patternType === 'geometric' || difficulty === 'Orta') patternRules = "Artış/Azalış karışık veya çarpma/bölme.";
    if (patternType === 'complex' || difficulty === 'Zor') patternRules = "İki aşamalı kurallar (x2 +1) veya Fibonacci.";
    if (difficulty === 'Uzman') patternRules = "Karmaşık diziler, karesel artışlar.";

    const prompt = `
    "${difficulty}" zorluk seviyesinde, ${itemCount} adet Sayı Örüntüsü oluştur.
    Kural: ${patternRules}
    Her örüntü bir dizi sayı ve sonunda '?' içermeli.
    Cevabı (answer) belirt.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet çalışma sayfası verisi üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            patterns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        sequence: { type: Type.STRING },
                        answer: { type: Type.STRING },
                    },
                     required: ['sequence', 'answer']
                },
            },
        },
        required: ['title', 'instruction', 'patterns', 'pedagogicalNote', 'imagePrompt']
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<NumberPatternData[]>;
};

export const generateLogicGridPuzzleFromAI = async (options: GeneratorOptions): Promise<LogicGridPuzzleData[]> => {
    const { difficulty, worksheetCount } = options;
    const prompt = `
    "${difficulty}" seviyesinde Mantık Tablosu (Logic Grid Puzzle).
    Kişiler, nesneler ve özellikleri içeren ipuçları ver.
    Nesneler için **İngilizce** 'imagePrompt' oluştur.
    ${PEDAGOGICAL_PROMPT}
    ${worksheetCount} adet üret.
    `;
    const singleSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            prompt: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }, 
            clues: { type: Type.ARRAY, items: { type: Type.STRING } },
            people: { type: Type.ARRAY, items: { type: Type.STRING } },
            categories: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    imageDescription: { type: Type.STRING },
                                    imagePrompt: { type: Type.STRING }
                                },
                                required: ["name", "imageDescription", "imagePrompt"]
                            }
                        }
                    },
                    required: ["title", "items"]
                }
            }
        },
        required: ["title", "prompt", "clues", "people", "categories", "instruction", "pedagogicalNote", "imagePrompt"]
    };
    const schema = { type: Type.ARRAY, items: singleSchema };
    return generateWithSchema(prompt, schema) as Promise<LogicGridPuzzleData[]>;
};

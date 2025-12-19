
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { InteractiveStoryData, ReadingStudioConfig } from '../../types';

export const generateInteractiveStory = async (config: ReadingStudioConfig): Promise<InteractiveStoryData> => {
    
    const lengthMap = {
        'short': 'Kısa (80-100 kelime).',
        'medium': 'Orta (150-200 kelime).',
        'long': 'Uzun (300-400 kelime).',
        'epic': 'Destansı (500+ kelime).'
    };

    const complexityMap = {
        'simple': '1. Sınıf: Çok basit, kısa cümleler.',
        'moderate': '3. Sınıf: Standart anlatım.',
        'advanced': '5. Sınıf+: Zengin dil.'
    };

    let tasksInstruction = "HİKAYE BAĞLAMINA GÖRE şu bileşenleri üret:";
    if (config.include5N1K) tasksInstruction += "\n- 5N 1K: 6 adet.";
    if (config.countMultipleChoice > 0) tasksInstruction += `\n- Test: ${config.countMultipleChoice} adet.`;
    if (config.countTrueFalse > 0) tasksInstruction += `\n- Doğru/Yanlış: ${config.countTrueFalse} adet.`;
    if (config.countFillBlanks > 0) tasksInstruction += `\n- Boşluk Doldurma: ${config.countFillBlanks} adet (kelimeyi metinde '........' ile maskele).`;
    if (config.countLogic > 0) tasksInstruction += `\n- Mantık Sorusu: ${config.countLogic} adet.`;
    if (config.countInference > 0) tasksInstruction += `\n- Çıkarım Sorusu: ${config.countInference} adet.`;

    const prompt = `
    [ROL: UZMAN ÖĞRETİM TASARIMCISI]
    KONU: "${config.topic}"
    TÜR: ${config.genre}
    UZUNLUK: ${lengthMap[config.length]}
    SEVİYE: ${complexityMap[config.textComplexity]}
    ÖĞRENCİ: ${config.studentName}
    
    ${tasksInstruction}
    
    GÖRSEL PROMPT: "Educational children storybook style, high contrast".
    
    ÇIKTI: JSON formatında.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            vocabulary: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, definition: { type: Type.STRING } },
                    required: ['word', 'definition']
                }
            },
            creativeTask: { type: Type.STRING },
            fiveW1H: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { 
                        type: { type: Type.STRING, enum: ['who', 'where', 'when', 'what', 'why', 'how'] },
                        question: { type: Type.STRING },
                        answer: { type: Type.STRING }
                    },
                    required: ['type', 'question', 'answer']
                }
            },
            multipleChoice: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        answer: { type: Type.STRING }
                    },
                    required: ['question', 'options', 'answer']
                }
            },
            trueFalse: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { question: { type: Type.STRING }, answer: { type: Type.BOOLEAN } },
                    required: ['question', 'answer']
                }
            },
            fillBlanks: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { sentence: { type: Type.STRING }, answer: { type: Type.STRING } },
                    required: ['sentence', 'answer']
                }
            },
            logicQuestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { question: { type: Type.STRING }, answer: { type: Type.STRING }, hint: { type: Type.STRING } },
                    required: ['question', 'answer', 'hint']
                }
            },
            inferenceQuestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
                    required: ['question', 'answer']
                }
            }
        },
        required: ['title', 'story', 'fiveW1H']
    };

    return await generateWithSchema(prompt, schema);
};


import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { InteractiveStoryData, ReadingStudioConfig } from '../../types';

export const generateInteractiveStory = async (config: ReadingStudioConfig): Promise<InteractiveStoryData> => {
    
    const lengthMap = {
        'short': 'Kısa (80-100 kelime).',
        'medium': 'Orta (150-200 kelime).',
        'long': 'Uzun (300-400 kelime).',
        'epic': 'Geniş (500+ kelime).'
    };

    const complexityMap = {
        'simple': 'Basit cümleler, somut kelimeler.',
        'moderate': 'Günlük dil, akıcı yapı.',
        'advanced': 'Zengin kelime haznesi, çıkarım gerektiren kurgu.'
    };

    // Dinamik Talimat Seti
    let tasksInstruction = "HİKAYEYE ÖZEL ETKİNLİKLER ÜRET:";
    if (config.include5N1K) tasksInstruction += "\n- 5N 1K: Hikayeyi analiz eden 6 temel soru.";
    if (config.countMultipleChoice > 0) tasksInstruction += `\n- Test: ${config.countMultipleChoice} adet 3 şıklı soru.`;
    if (config.countTrueFalse > 0) tasksInstruction += `\n- Doğru/Yanlış: ${config.countTrueFalse} adet yargı cümlesi.`;
    if (config.countFillBlanks > 0) tasksInstruction += `\n- Boşluk Doldurma: ${config.countFillBlanks} adet, kritik kelimesi '_______' ile maskelenmiş cümle.`;
    if (config.countLogic > 0) tasksInstruction += `\n- Mantık: ${config.countLogic} adet analitik düşünme sorusu.`;
    if (config.countInference > 0) tasksInstruction += `\n- Çıkarım: ${config.countInference} adet metinde gizli bilgiyi buldurma sorusu.`;
    if (config.focusVocabulary) tasksInstruction += `\n- Sözlük: 4 adet zor kelime ve anlamı.`;
    if (config.includeCreativeTask) tasksInstruction += `\n- Yaratıcı Görev: Yazma veya çizme odaklı bir atölye görevi.`;

    const prompt = `
    ROL: PROFESYONEL EĞİTİM YAYINCISI
    KONU: "${config.topic || 'Genel'}" | TÜR: ${config.genre} | TON: ${config.tone}
    HEDEF: ${config.gradeLevel} (Öğrenci: ${config.studentName || 'Öğrenci'})
    PARAMETRELER: Uzunluk: ${lengthMap[config.length]}, Karmaşıklık: ${complexityMap[config.textComplexity]}

    ${tasksInstruction}

    GÖRSEL PROMPT: Hikaye sahnesi için İNGİLİZCE prompt yaz. Stil: "${config.imageGeneration?.style || 'storybook'}".

    ÖNEMLİ: Sadece JSON döndür.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            vocabulary: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, definition: { type: Type.STRING } },
                    required: ['word', 'definition']
                }
            },
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
                    properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
                    required: ['question', 'answer']
                }
            },
            inferenceQuestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
                    required: ['question', 'answer']
                }
            },
            creativeTask: { type: Type.STRING }
        },
        required: ['title', 'story']
    };

    const result = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview'); 
    
    return {
        ...result,
        gradeLevel: config.gradeLevel,
        genre: config.genre,
        wordCount: result.story ? result.story.split(' ').length : 0,
        fiveW1H: result.fiveW1H || [],
        multipleChoice: result.multipleChoice || [],
        trueFalse: result.trueFalse || [],
        fillBlanks: result.fillBlanks || [],
        logicQuestions: result.logicQuestions || [],
        inferenceQuestions: result.inferenceQuestions || []
    } as InteractiveStoryData;
};

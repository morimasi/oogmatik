
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { InteractiveStoryData, ReadingStudioConfig } from '../../types';

export const generateInteractiveStory = async (config: ReadingStudioConfig): Promise<InteractiveStoryData> => {

    const lengthMap = {
        'short': 'Kısa ve öz (80-120 kelime).',
        'medium': 'Orta uzunlukta (180-250 kelime).',
        'long': 'Kapsamlı ve detaylı (350-500 kelime).',
        'epic': 'Zengin kurgulu ve uzun (600+ kelime).'
    };

    const complexityMap = {
        'simple': 'Çok basit cümle yapısı, somut kavramlar, 1. kademe dil seviyesi.',
        'moderate': 'Standart okul seviyesi, bileşik cümleler, 2. kademe dil seviyesi.',
        'advanced': 'Zengin kelime dağarcığı, edebi sanatlar, 3. kademe üstü dil seviyesi.'
    };

    let tasksInstruction = `HİKAYE İÇERİĞİNE %100 UYUMLU şu interaktif bileşenleri üret:`;
    if (config.include5N1K) tasksInstruction += "\n- 5N 1K Analizi: Metindeki gerçek verilere dayalı 6 soru-cevap çifti.";
    if (config.countMultipleChoice > 0) tasksInstruction += `\n- Çoktan Seçmeli Test: ${config.countMultipleChoice} adet (Çeldiriciler mantıklı olmalı).`;
    if (config.countTrueFalse > 0) tasksInstruction += `\n- Doğru/Yanlış Sorgusu: ${config.countTrueFalse} adet.`;
    if (config.countFillBlanks > 0) tasksInstruction += `\n- Boşluk Doldurma: ${config.countFillBlanks} adet (Metindeki kilit kavramlar seçilmeli).`;
    if (config.countLogic > 0) tasksInstruction += `\n- Mantık/Muhakeme: ${config.countLogic} adet (Hikaye evreninde geçen bir problem).`;
    if (config.countInference > 0) tasksInstruction += `\n- Çıkarım Yapma: ${config.countInference} adet (Satır aralarını okuma soruları).`;

    const prompt = `
    [ROL: DİSLEKSİ UZMANI, ÇOCUK EDEBİYATI YAZARI VE EĞİTİM TEKNOLOĞU]
    
    Aşağıdaki parametrelerle %100 özgün ve disleksi dostu bir eğitim materyali tasarla:
    
    PARAMETRELER:
    1. KONU/TEMA: "${config.topic}"
    2. TÜR: ${config.genre}
    3. ANLATIM TONU: ${config.tone}
    4. HEDEF KİTLE: ${config.gradeLevel} seviyesi.
    5. ANA KARAKTER: İSİM: "${config.characterName || 'Öğrenci'}", ÖZELLİKLER: "${config.characterTraits || 'Meraklı ve cesur'}"
    6. DİL KARMAŞIKLIĞI: ${complexityMap[config.textComplexity || 'moderate']}
    7. METİN UZUNLUĞU: ${lengthMap[config.length || 'medium']}
    
    ÖZEL TALİMATLAR:
    - Hikaye metni kısa paragraflar halinde, net ve akıcı olmalıdır.
    - Metin içerisinde öğrencinin okumakta zorlanabileceği "fonolojik kavis" içeren kelimeleri seçip "vocabulary" kısmına anlamlarıyla ekle.
    - "creativeTask" alanı öğrenciyi çizim yapmaya veya kendi sonunu yazmaya teşvik etmelidir.
    - "pedagogicalNote" kısmında bu metnin hangi bilişsel beceriyi (örn: görsel bellek, işitsel ayırt etme) desteklediğini belirt.

    GÖRSEL ÜRETİM TALİMATI (imagePrompt):
    - Stil: ${config.imageGeneration.style || 'storybook'} tarzında.
    - Detay: ${config.imageGeneration.complexity === 'detailed' ? 'Zengin dokulu' : 'Net ve sade'}.
    - İçerik: "${config.characterName || 'Karakter'}" karakterini "${config.topic}" temasıyla betimleyen bir sahne.
    
    EĞİTSEL GÖREVLER:
    ${tasksInstruction}
    
    DİKKAT: Sadece JSON döndür.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            genre: { type: Type.STRING },
            gradeLevel: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING, description: "Detailed visual prompt for the main scene" },
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
        required: ['title', 'story', 'imagePrompt', 'fiveW1H']
    };

    // Fix: Removed the third argument 'gemini-3-flash-preview' as generateWithSchema only expects two arguments
    return await generateWithSchema(prompt, schema);
};

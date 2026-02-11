
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
    if (config.countFillBlanks > 0) tasksInstruction += `\n- Boşluk Doldurma: ${config.countFillBlanks} adet (Önemli kavramlar metinden seçilip maskelenmeli).`;
    if (config.countLogic > 0) tasksInstruction += `\n- Mantık/Muhakeme: ${config.countLogic} adet (Hikaye evreninde geçen bir problem).`;
    if (config.countInference > 0) tasksInstruction += `\n- Çıkarım Yapma: ${config.countInference} adet (Satır aralarını okuma soruları).`;

    const prompt = `
    [ROL: PROFESYONEL ÇOCUK EDEBİYATI YAZARI VE EĞİTİM TEKNOLOĞU]
    
    Aşağıdaki parametrelerin TAMAMINI kullanarak eşsiz bir eğitim materyali tasarla:
    
    1. KONU/TEMA: "${config.topic}"
    2. TÜR: ${config.genre} (Bu türün anlatım tekniklerini kullan)
    3. ANLATIM TONU: ${config.tone} (Örn: Eğlenceli ise mizah kat, Öğretici ise bilgi vurgula)
    4. HEDEF KİTLE: ${config.gradeLevel} seviyesindeki bir çocuk.
    5. DİL KARMAŞIKLIĞI: ${complexityMap[config.textComplexity]}
    6. METİN UZUNLUĞU: ${lengthMap[config.length]}
    
    GÖRSEL ÜRETİM TALİMATI (imagePrompt):
    - Hikayenin ana olayını veya en can alıcı sahnesini betimleyen profesyonel bir görsel promptu yaz.
    - Stil: ${config.imageGeneration.style} tarzında.
    - Detay Seviyesi: ${config.imageGeneration.complexity === 'detailed' ? 'Yüksek detaylı, dokulu ve zengin' : 'Minimalist, net hatlı ve temiz'}.
    - Şart: Görselde hikayedeki ana karakter ve çevre mutlaka hikayedeki anlatıma uygun yer almalı.
    
    EĞİTSEL GÖREVLER:
    ${tasksInstruction}
    
    DİKKAT: Sadece JSON formatında, metin dışına çıkmadan yanıt ver. Hikaye disleksi dostu (dyslexia-friendly) yapıda, kısa paragraflar ve net bir akışla yazılmalıdır.
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


import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { InteractiveStoryData, ReadingStudioConfig } from '../../types';

export const generateInteractiveStory = async (config: ReadingStudioConfig): Promise<InteractiveStoryData> => {
    
    // 1. Ayarları Doğal Dile Çevirme (Mapping)
    const lengthMap = {
        'short': 'Kısa (80-100 kelime).',
        'medium': 'Orta (150-200 kelime).',
        'long': 'Uzun (300-400 kelime).',
        'epic': 'Geniş ve detaylı (500+ kelime).'
    };

    const complexityMap = {
        'simple': 'Çok basit, kısa cümleler. Somut kelimeler. Disleksi dostu yapı.',
        'moderate': 'Günlük konuşma dili. Orta uzunlukta cümleler.',
        'advanced': 'Zengin kelime dağarcığı, soyut kavramlar ve yan cümleçikler.'
    };

    const imageStyleMap = {
        'storybook': 'Children book illustration style, flat vector, clean lines, bright colors',
        'realistic': 'Realistic educational illustration, highly detailed',
        'cartoon': 'Cartoon style, expressive characters, vibrant',
        'sketch': 'Pencil sketch style, black and white artistic',
        'watercolor': 'Watercolor painting style, soft edges',
        '3d_render': '3D clay render style, cute, plastic texture'
    };

    // 2. Dinamik Talimat İnşası
    let tasksInstruction = "GÖREV: Aşağıdaki bileşenleri hikayeye tam uyumlu ve çocuk dostu bir dille üret:";
    
    if (config.include5N1K) tasksInstruction += "\n- 5N 1K Soruları (Kim, Ne, Nerede, Ne Zaman, Neden, Nasıl): Tam 6 adet.";
    if (config.countMultipleChoice > 0) tasksInstruction += `\n- Test Soruları: ${config.countMultipleChoice} adet, 3 şıklı, hikayeyi analiz eden sorular.`;
    if (config.countTrueFalse > 0) tasksInstruction += `\n- Doğru/Yanlış Soruları: ${config.countTrueFalse} adet, hikayedeki gerçekleri sorgulayan cümleler.`;
    if (config.countFillBlanks > 0) tasksInstruction += `\n- Boşluk Doldurma: ${config.countFillBlanks} adet, hikayeden alınmış ve kritik kelimesi '_______' ile maskelenmiş cümleler.`;
    if (config.countLogic > 0) tasksInstruction += `\n- Mantık Sorusu: ${config.countLogic} adet, hikayedeki olaylar arası neden-sonuç bağı kuran analitik sorular.`;
    if (config.countInference > 0) tasksInstruction += `\n- Çıkarım Sorusu: ${config.countInference} adet, metinde açıkça yazmayan ama ipuçlarından anlaşılan yorum soruları.`;
    if (config.focusVocabulary) tasksInstruction += `\n- Sözlükçe: Metindeki en önemli/zor 4 kelime ve çocuk dostu tanımları.`;
    if (config.includeCreativeTask) tasksInstruction += `\n- Yaratıcı Görev: Öğrenciyi hikaye ile ilgili bir çizim yapmaya veya yazmaya teşvik eden özgün bir görev.`;

    const style = config.imageGeneration?.enabled ? (imageStyleMap[config.imageGeneration.style] || imageStyleMap['storybook']) : imageStyleMap['storybook'];

    // 3. Ana Prompt
    const prompt = `
    ROL: KIDEMLİ EĞİTİM İÇERİK UZMANI VE ÇOCUK KİTABI YAZARI
    KONU: "${config.topic || 'Çocukların ilgisini çecek eğlenceli bir konu'}"
    TÜR: ${config.genre} | TON: ${config.tone}
    HEDEF KİTLE: ${config.gradeLevel} (Öğrenci Adı: ${config.studentName || 'Öğrenci'})
    
    METİN PARAMETRELERİ:
    - Uzunluk: ${lengthMap[config.length]}
    - Karmaşıklık: ${complexityMap[config.textComplexity]}
    
    -- DİSLEKSİ DOSTU KURALLAR --
    1. Paragraflar kısa olsun.
    2. Karmaşık, iç içe geçmiş cümlelerden kaçın.
    
    ${tasksInstruction}

    GÖRSEL PROMPT: Hikayenin en önemli sahnesini betimleyen İNGİLİZCE prompt yaz. Stil: "${style}".
    
    ÇIKTI FORMATI: Sadece geçerli bir JSON döndür.
    `;

    // 4. Genişletilmiş Şema Tanımı
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
                    properties: { question: { type: Type.STRING }, answer: { type: Type.STRING }, hint: { type: Type.STRING } },
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
            creativeTask: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING }
        },
        required: ['title', 'story']
    };

    const result = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview'); 
    
    return {
        ...result,
        gradeLevel: config.gradeLevel,
        genre: config.genre,
        wordCount: result.story ? result.story.split(' ').length : 0,
        vocabulary: result.vocabulary || [],
        fiveW1H: result.fiveW1H || [],
        multipleChoice: result.multipleChoice || [],
        trueFalse: result.trueFalse || [],
        fillBlanks: result.fillBlanks || [],
        logicQuestions: result.logicQuestions || [],
        inferenceQuestions: result.inferenceQuestions || []
    } as InteractiveStoryData;
};

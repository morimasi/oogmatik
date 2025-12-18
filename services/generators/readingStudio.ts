
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { InteractiveStoryData, ReadingStudioConfig } from '../../types';

export const generateInteractiveStory = async (config: ReadingStudioConfig): Promise<InteractiveStoryData> => {
    
    // 1. Ayarları Doğal Dile Çevirme (Mapping)
    
    const lengthMap = {
        'short': 'Kısa (80-100 kelime). Tek bir odak noktası olsun.',
        'medium': 'Orta (150-200 kelime). Giriş, gelişme ve sonuç belirgin olsun.',
        'long': 'Uzun (300-400 kelime). Detaylı betimlemeler içersin.',
        'epic': 'Destansı (500+ kelime). Birden fazla olay örgüsü olsun.'
    };

    const complexityMap = {
        'simple': '1. Sınıf Seviyesi: Çok basit, kısa cümleler. Somut kelimeler. Devrik cümle yok.',
        'moderate': '3. Sınıf Seviyesi: Günlük konuşma dili. Orta uzunlukta cümleler.',
        'advanced': '5. Sınıf+ Seviyesi: Zengin kelime dağarcığı, mecazlar ve yan cümleçikler.'
    };

    const imageStyleMap = {
        'storybook': 'Children book illustration style, flat vector, clean lines, bright colors, white background',
        'realistic': 'Realistic educational illustration, highly detailed, 4k, white background',
        'cartoon': 'Cartoon style, expressive characters, fun outlines, vibrant, white background',
        'sketch': 'Pencil sketch style, black and white artistic, doodle',
        'watercolor': 'Watercolor painting style, soft edges, artistic, pastel colors',
        '3d_render': '3D clay render style, cute, plastic texture, isometric'
    };

    // 2. Pedagojik Strateji ve Bileşen Sayıları
    
    let tasksInstruction = "Aşağıdaki bileşenleri belirtilen sayılarda üret:";
    
    if (config.include5N1K) tasksInstruction += "\n- 5N 1K Soruları (Kim, Ne, Nerede, Ne Zaman, Neden, Nasıl): Tam 6 adet.";
    if (config.countMultipleChoice > 0) tasksInstruction += `\n- Çoktan Seçmeli Test Sorusu: Tam ${config.countMultipleChoice} adet. (3 şıklı).`;
    if (config.countTrueFalse > 0) tasksInstruction += `\n- Doğru/Yanlış Sorusu: Tam ${config.countTrueFalse} adet.`;
    if (config.countFillBlanks > 0) tasksInstruction += `\n- Boşluk Doldurma Cümlesi: Tam ${config.countFillBlanks} adet. (Metinden alınan cümleler).`;
    if (config.countLogic > 0) tasksInstruction += `\n- Mantık/Muhakeme Sorusu: Tam ${config.countLogic} adet.`;
    if (config.countInference > 0) tasksInstruction += `\n- Çıkarım (Inference) Sorusu: Tam ${config.countInference} adet. (Metinde açıkça yazmayan, ipucundan bulunacak).`;
    if (config.focusVocabulary) tasksInstruction += `\n- Sözlükçe: Metindeki en önemli 4 kelime ve çocuk dostu tanımları.`;
    if (config.includeCreativeTask) tasksInstruction += `\n- Yaratıcı Görev: Hikaye ile ilgili bir çizim veya yazma görevi.`;

    // 3. Görsel Prompt Talimatı
    // Her durumda bir görsel prompt üretiyoruz, böylece kullanıcı sonradan görseli açmak isterse veri hazır olur.
    const style = config.imageGeneration?.enabled ? (imageStyleMap[config.imageGeneration.style] || imageStyleMap['storybook']) : imageStyleMap['storybook'];
    
    const imageInstruction = `
    GÖRSEL İPUCU (Image Prompt): 
    Hikayenin en önemli sahnesini betimleyen, İNGİLİZCE, kısa ve net bir prompt yaz.
    Stil Anahtar Kelimeleri (Bunları promptun sonuna ekle): "${style}".
    Prompt örneği: "A cute cat sitting on a red roof, sunny day, blue sky, ${style}"
    `;

    // 4. Ana Prompt İnşası
    
    const prompt = `
    [ROL: KIDEMLİ EĞİTİM İÇERİK UZMANI VE ÇOCUK KİTABI YAZARI]
    
    GÖREV: Aşağıdaki kriterlere tam olarak uyan, özgün ve eğitici bir hikaye ve etkinlik seti oluştur.
    
    -- HİKAYE YAPILANDIRMASI --
    Konu: "${config.topic || 'Çocukların ilgisini çekecek sürpriz bir konu'}"
    Tür: ${config.genre}
    Ton: ${config.tone}
    Hedef Kitle: ${config.gradeLevel}
    Öğrenci Adı (Varsa hikayeye kat): "${config.studentName}"
    
    Uzunluk: ${lengthMap[config.length] || lengthMap['medium']}
    Dil Seviyesi: ${complexityMap[config.textComplexity || 'moderate']}
    
    -- DİSLEKSİ DOSTU YAZIM KURALLARI --
    1. Paragraflar kısa olsun (en fazla 3-4 cümle).
    2. Karmaşık, iç içe geçmiş cümlelerden kaçın.
    3. Soyut kavramları somut örneklerle anlat.
    4. "Disleksi Dostu" bir akış sağla.
    
    -- İSTENEN BİLEŞENLER --
    ${tasksInstruction}

    ${imageInstruction}
    
    ÇIKTI FORMATI: Sadece geçerli bir JSON döndür.
    `;

    // 5. Şema Tanımı (Types/Verbal.ts ile uyumlu)
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            mainIdea: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            
            // Bileşenler
            vocabulary: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { word: { type: Type.STRING }, definition: { type: Type.STRING } },
                    required: ['word', 'definition']
                }
            },
            creativeTask: { type: Type.STRING },
            
            // Soru Tipleri
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
        required: ['title', 'story', 'pedagogicalNote', 'imagePrompt', 'fiveW1H']
    };

    // 6. AI Çağrısı
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

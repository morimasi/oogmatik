
import { Type } from "@google/genai";
import { generateWithSchema } from '../geminiClient';
import { InteractiveStoryData, ReadingStudioConfig } from '../../types';

export const generateInteractiveStory = async (config: ReadingStudioConfig): Promise<InteractiveStoryData> => {
    
    // Uzunluk haritası
    const lengthMap = {
        'short': '80-100 kelime (1-2 paragraf)',
        'medium': '150-200 kelime (3-4 paragraf)',
        'long': '300-400 kelime (Tam sayfa)',
        'epic': '500+ kelime (Detaylı hikaye)'
    };

    // Karmaşıklık haritası
    const complexityMap = {
        'simple': 'Çok basit cümleler, somut kelimeler, devrik cümle yok. (1-2. Sınıf seviyesi)',
        'moderate': 'Orta uzunlukta cümleler, günlük dil, az sayıda mecaz. (3-4. Sınıf seviyesi)',
        'advanced': 'Zengin betimlemeler, yan cümleçikler, deyimler ve soyut kavramlar. (5+ Sınıf seviyesi)'
    };

    // Görsel Stil Haritası
    const imageStyleMap = {
        'storybook': 'Children book illustration style, colorful, flat vector, clear shapes',
        'realistic': 'Realistic educational illustration, highly detailed, vivid colors',
        'cartoon': 'Cartoon style, expressive characters, vibrant, fun',
        'sketch': 'Pencil sketch style, black and white, artistic',
        'watercolor': 'Watercolor painting style, soft colors, artistic',
        '3d_render': '3D Render style, cute clay or plastic texture, bright lighting'
    };

    let pedagogicalStrategy = `
    [PEDAGOJİK STRATEJİ - BLOOM TAKSONOMİSİ]:
    1. **Bilgi (Knowledge):** Metindeki somut gerçekleri (isimler, yerler, renkler) sorgulayan 5N1K soruları.
    2. **Kavrama (Comprehension):** Metnin ana fikrini ve olay örgüsünü test eden Doğru/Yanlış ve Boşluk Doldurma soruları.
    3. **Analiz (Analysis):** Metinde açıkça yazmayan, çocuğun ipuçlarından çıkarım yapmasını gerektiren "Inference" soruları. (Örn: "Çocuk neden şemsiyesini aldı?" -> Çünkü hava bulutluydu).
    4. **Değerlendirme (Evaluation):** Karakterlerin davranışlarını yargılayan veya alternatif sonlar düşündüren Mantık soruları.
    5. **Müdahale (Intervention):** Disleksi dostu kelime çalışmaları (Harf farkındalığı, heceleme).
    `;

    // Görsel Prompt Talimatı (Sadece aktifse)
    let imageInstruction = "";
    if (config.imageGeneration?.enabled) {
        const styleDesc = imageStyleMap[config.imageGeneration.style] || imageStyleMap['storybook'];
        imageInstruction = `
        GÖRSEL İPUCU (Image Prompt): Hikayenin en can alıcı sahnesini anlatan, detaylı İngilizce prompt yaz.
        Stil Talimatı: "${styleDesc}".
        Not: Görsel betimlemesi hikaye ile tam uyumlu olmalıdır.
        `;
    } else {
        imageInstruction = `GÖRSEL İPUCU (Image Prompt): "" (Boş bırak)`;
    }

    const prompt = `
    [ROL: KIDEMLİ EĞİTİM PSİKOLOĞU, DİSLEKSİ UZMANI ve ÇOCUK KİTABI YAZARI]
    
    HEDEF KİTLE: ${config.gradeLevel} seviyesindeki öğrenci.
    AMAÇ: Okuduğunu anlama, kelime dağarcığını geliştirme, eleştirel düşünme ve görsel algıyı destekleme.
    
    KONU: ${config.topic || 'Çocuğun ilgisini çekecek, macera dolu ve öğretici bir tema'}
    TÜR: ${config.genre} (${config.tone} bir tonla)
    
    METİN YAPILANDIRMASI:
    - Hedef Uzunluk: ${lengthMap[config.length] || lengthMap['medium']}
    - Dil Karmaşıklığı: ${complexityMap[config.textComplexity || 'moderate']}
    - Disleksi Dostu: Paragraflar kısa tutulmalı, akış net olmalı.
    
    ${pedagogicalStrategy}
    
    İÇERİK ÇIKTILARI:
    - "vocabulary" kısmına metinde geçen, öğrencinin zorlanabileceği veya yeni öğreneceği ${config.focusVocabulary ? '4-5 adet' : '0'} kelime seç ve çocuk dostu tanımlarını yaz.
    - "creativeTask" için çocuğun hayal gücünü kullanabileceği, çizim veya kısa yazma içeren eğlenceli bir görev ver.
    
    SORU ADETLERİ (Tam Sayılar):
    - 5N1K (Açık Uçlu): ${config.include5N1K ? '5 adet' : '0'}
    - Çoktan Seçmeli (Test): ${config.countMultipleChoice} adet
    - Doğru/Yanlış: ${config.countTrueFalse} adet
    - Mantık/Yorum: ${config.countLogic} adet
    - Çıkarım (Inference): ${config.countInference} adet

    ${imageInstruction}
    
    SADECE JSON DÖNDÜR.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            mainIdea: { type: Type.STRING },
            segments: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { id: { type: Type.STRING }, text: { type: Type.STRING } },
                    required: ['id', 'text']
                }
            },
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
            },
            interventionQuestions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { 
                        question: { type: Type.STRING }, 
                        type: { type: Type.STRING, enum: ['word_hunt', 'spelling', 'visual_memory'] } 
                    },
                    required: ['question', 'type']
                }
            }
        },
        required: ['title', 'story', 'segments', 'fiveW1H', 'vocabulary']
    };

    const result = await generateWithSchema(prompt, schema, 'gemini-2.5-flash'); 
    return {
        ...result,
        gradeLevel: config.gradeLevel,
        genre: config.genre,
        wordCount: result.story.split(' ').length
    };
};

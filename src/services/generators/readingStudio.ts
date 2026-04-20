
import { generateWithSchema } from '../geminiClient.js';
import { InteractiveStoryData, ReadingStudioConfig } from '../../types.js';

export const generateInteractiveStory = async (config: ReadingStudioConfig): Promise<InteractiveStoryData> => {

    const lengthMap = {
        'short': 'Kısa ve yoğun (100-150 kelime).',
        'medium': 'Orta uzunlukta ve akıcı (250-350 kelime).',
        'long': 'Kapsamlı ve edebi (450-600 kelime).',
        'epic': 'Dünya inşası olan zengin kurgu (800+ kelime).'
    };

    const complexityMap = {
        'simple': 'Somut kavramlar, kısa ve net cümleler, disleksi dostu basit morfoloji.',
        'moderate': 'Müfredat uyumlu, bileşik cümleler, kavramsal zenginlik.',
        'advanced': 'Metaforik dil, zengin sıfat kullanımı, yüksek edebi değer.'
    };

    const profile = config.studentProfile || {};
    const diagnosisStr = profile.diagnosis?.join(', ') || 'Özel Öğrenme Güçlüğü (Genel)';
    const interestsStr = profile.interests?.join(', ') || 'Macera, Bilim, Doğa';

    const prompt = `
    [ROL: DİSLEKSİ MÜDAHALE UZMANI & ÖDÜLLÜ ÇOCUK YAZARI]
    
    Öğrenci "${config.studentName || 'Öğrenci'}" için "${config.topic}" temalı, ${config.gradeLevel} seviyesinde "Ultra-Premium" bir okuma materyali tasarla. 
    
    KLİNİK HEDEF: 
    - Tanı: ${diagnosisStr}
    - İlgi: ${interestsStr}
    - Odak: "${config.phonemeFocus || 'Akıcı Okuma'}"
    
    İÇERİK MİMARİSİ (AŞAĞIDAKİ TÜM BİLEŞENLERİ EKSİKSİZ ÜRET):
    1. STORY: ${lengthMap[config.length || 'medium']} uzunluğunda, ${complexityMap[config.textComplexity || 'moderate']} yapıda sürükleyici bir anlatı.
    2. SYLLABIFIED_STORY: Story alanındaki metnin aynısını, her kelimenin hecelerini kısa çizgi ile ayırarak oluştur.
    3. PEDAGOGICAL_GOALS: Bu metinle hedeflenen 3-5 adet bilişsel hedef.
    4. 5N1K: Metne dayalı 6 soru (Kim, Ne, Nerede, Ne Zaman, Nasıl, Neden) ve cevapları.
    5. VOCABULARY: Metindeki 5 zor kelime, anlamı ve örnek cümlesi.
    6. TEST_QUESTIONS: Metinle ilgili 4 adet çoktan seçmeli soru. Her sorunun 4 şıkkı (A, B, C, D) ve 1 doğru cevabı olmalı.
    7. LOGIC_QUESTIONS: Olaylar arası mantık kurmayı gerektiren 1 zor soru.
    8. SYLLABLE_TRAIN: Metindeki en kritik 5 ile 10 ARASI kelimenin hecelerine ayrılmış listesi (vagon grafiği için).
    9. CREATIVE_PROMPT: Öğrencinin hikayenin devamını çizmesi veya yazması için yaratıcı bir yönerge.
    
    FORMAT: Sadece JSON döndür.
    `;

    const schema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            story: { type: 'STRING' },
            syllabifiedStory: { type: 'STRING' },
            genre: { type: 'STRING' },
            gradeLevel: { type: 'STRING' },
            pedagogicalGoals: { type: 'ARRAY', items: { type: 'STRING' } },
            imagePrompt: { type: 'STRING' },
            creativePrompt: { type: 'STRING' },
            vocabulary: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: { word: { type: 'STRING' }, definition: { type: 'STRING' }, example: { type: 'STRING' } },
                    required: ['word', 'definition']
                }
            },
            syllableTrain: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: { word: { type: 'STRING' }, syllables: { type: 'ARRAY', items: { type: 'STRING' } } },
                    required: ['word', 'syllables']
                }
            },
            fiveW1H: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        type: { type: 'STRING', enum: ['who', 'where', 'when', 'what', 'why', 'how'] },
                        question: { type: 'STRING' },
                        answer: { type: 'STRING' }
                    },
                    required: ['type', 'question', 'answer']
                }
            },
            logicQuestions: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: { question: { type: 'STRING' }, answer: { type: 'STRING' }, hint: { type: 'STRING' } },
                    required: ['question', 'answer', 'hint']
                }
            },
            multipleChoice: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: {
                        question: { type: 'STRING' },
                        options: { type: 'ARRAY', items: { type: 'STRING' } },
                        answer: { type: 'STRING' }
                    },
                    required: ['question', 'options', 'answer']
                }
            }
        },
        required: ['title', 'story', 'syllabifiedStory', 'pedagogicalGoals', 'multipleChoice', 'syllableTrain', 'creativePrompt']
    };

    return await generateWithSchema(prompt, schema);
};

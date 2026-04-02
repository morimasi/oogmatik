
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

    let tasksInstruction = `METİNLE TAM UYUMLU ŞU ÜST DÜZEY BİLEŞENLERİ ÜRET:`;
    if (config.include5N1K) tasksInstruction += "\n- 5N 1K Analizi: (Kim, Ne, Nerede, Ne Zaman, Nasıl, Neden) soruları ve metne dayalı kanıtlı cevapları.";
    if (config.countMultipleChoice > 0) tasksInstruction += `\n- Eleştirel Düşünme Soruları: ${config.countMultipleChoice} adet (Metin dışı çıkarım yaptıran).`;
    if (config.countFillBlanks > 0) tasksInstruction += `\n- Semantik Boşluk Doldurma: ${config.countFillBlanks} adet (Anlam akışını bozan boşluklar).`;
    if (config.countLogic > 0) tasksInstruction += `\n- Mantıksal Akıl Yürütme: ${config.countLogic} adet (Metindeki olaylar arası neden-sonuç zincirini sorgulayan).`;

    const prompt = `
    [ROL: DİSLEKSİ MÜDAHALE UZMANI & ÖDÜLLÜ ÇOCUK YAZARI]
    
    Öğrenci "${config.studentName || 'Öğrenci'}" için "${config.topic}" temalı, ${config.gradeLevel} seviyesinde "Ultra-Premium" bir okuma materyali tasarla. 
    
    KLİNİK HEDEF: 
    - Tanı: ${diagnosisStr}
    - İlgi: ${interestsStr}
    - Odak: "${config.phonemeFocus || 'Akıcı Okuma'}"
    
    İÇERİK MİMARİSİ:
    1. STORY: ${lengthMap[config.length || 'medium']} uzunluğunda, ${complexityMap[config.textComplexity || 'moderate']} yapıda sürükleyici bir anlatı.
    2. SYLLABIFIED_STORY: Bu alan çok kritik! Story alanındaki metnin aynısını, her kelimenin hecelerini kısa çizgi ile ayırarak (örn: "ku-şun-lar", "öğ-ren-ci") oluştur. Disleksi desteği için gereklidir.
    3. PEDAGOGICAL_NOTE: Bu metnin neden bu öğrenci için uygun olduğunu, hangi bilişsel beceriyi (işitsel bellek, görsel dikkat vb.) tetiklediğini teknik olarak açıkla.
    
    ${tasksInstruction}
    
    FORMAT: Sadece JSON döndür. story ve syllabifiedStory alanlarında çift tırnak kaçışlarına (escape) dikkat et.
    `;

    const schema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            story: { type: 'STRING' },
            syllabifiedStory: { type: 'STRING', description: "Metnin hecelenmiş versiyonu (örn: ma-sa-yı kur-du)" },
            genre: { type: 'STRING' },
            gradeLevel: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING', description: "Uygulanan nöro-pedagojik stratejinin uzman açıklaması" },
            imagePrompt: { type: 'STRING' },
            vocabulary: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: { word: { type: 'STRING' }, definition: { type: 'STRING' }, example: { type: 'STRING' } },
                    required: ['word', 'definition']
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
            inferenceQuestions: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: { question: { type: 'STRING' }, answer: { type: 'STRING' } },
                    required: ['question', 'answer']
                }
            }
        },
        required: ['title', 'story', 'syllabifiedStory', 'pedagogicalNote', 'imagePrompt']
    };

    return await generateWithSchema(prompt, schema);
};

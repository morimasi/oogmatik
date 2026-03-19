
import { generateWithSchema } from '../geminiClient.js';
import { InteractiveStoryData, ReadingStudioConfig } from '../../types.js';

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

    const profile = config.studentProfile || {};
    const diagnosisStr = profile.diagnosis?.join(', ') || 'Belirtilmemiş';
    const interestsStr = profile.interests?.join(', ') || 'Belirtilmemiş';

    let tasksInstruction = `HİKAYE İÇERİĞİNE %100 UYUMLU şu interaktif bileşenleri üret:`;
    if (config.include5N1K) tasksInstruction += "\n- 5N 1K Analizi: Metindeki gerçek verilere dayalı 6 soru-cevap çifti (Kim, Ne, Nerede, Ne Zaman, Nasıl, Neden).";
    if (config.countMultipleChoice > 0) tasksInstruction += `\n- Çoktan Seçmeli Test: ${config.countMultipleChoice} adet.`;
    if (config.countTrueFalse > 0) tasksInstruction += `\n- Doğru/Yanlış Sorgusu: ${config.countTrueFalse} adet.`;
    if (config.countFillBlanks > 0) tasksInstruction += `\n- Boşluk Doldurma: ${config.countFillBlanks} adet (Metindeki kilit kavramlar seçilmeli).`;
    if (config.countLogic > 0) tasksInstruction += `\n- Mantık/Muhakeme: ${config.countLogic} adet (${config.logicDifficulty || 'Medium'} zorlukta, metinle bağlantılı gizem veya problem).`;
    if (config.countInference > 0) tasksInstruction += `\n- Çıkarım Yapma: ${config.countInference} adet (Yazarın amacını veya karakter duygu durumunu sorgulayan).`;

    if (config.phonemeFocus) {
        tasksInstruction += `\n- KRİTİK ODAK: Hikayede ve sorularda özellikle "${config.phonemeFocus}" seslerini içeren kelimeleri (Özellikle karıştırılan çiftlerse) sıkça ve vurgulu kullan.`;
    }
    if (config.syllableFocus) {
        tasksInstruction += `\n- TEKNİK: Kelimeleri hece yapılarına göre analiz edilebilir netlikte tut.`;
    }

    const prompt = `
    [ROL: DİSLEKSİ VE ÖZEL EĞİTİM UZMANI, ÖDÜLLÜ ÇOCUK EDEBİYATI YAZARI]
    
    Aşağıdaki öğrenci profiline ve parametrelere göre %100 özgün, pedagojik değeri yüksek bir eğitim materyali tasarla.
    
    ÖĞRENCİ PROFİLİ:
    - İsim: "${config.studentName || 'Öğrenci'}"
    - Seviye: ${config.gradeLevel}
    - Tanı/Durum: ${diagnosisStr}
    - İlgi Alanları: ${interestsStr}
    
    YAZIM PARAMETRELERİ:
    - TEMA: "${config.topic}"
    - TÜR: ${config.genre}
    - TON: ${config.tone}
    - DİL: ${complexityMap[config.textComplexity || 'moderate']}
    - UZUNLUK: ${lengthMap[config.length || 'medium']}
    - ANA KARAKTER: "${config.characterName || config.studentName || 'Kahraman'}" (${config.characterTraits || 'Cesur ve meraklı'})
    
    KLİNİK TALİMATLAR:
    1. Okunabilirlik: Kısa paragraflar, net punto odaklı temiz cümleler kullan.
    2. Motivasyon: Karakterin zorluklarla başa çıkma şekli üzerinden öğrenciye özgüven aşıla.
    3. Kelime Çalışması: Fonolojik olarak zorlayıcı kelimeleri (vocabulary) anlamlarıyla seç.
    
    GÖRSEL TASARIM (imagePrompt):
    - Stil: ${config.imageGeneration.style || 'storybook'} tarzında, ${config.imageGeneration.complexity === 'detailed' ? 'detaylı' : 'net hatlı'} çizim.
    - İçerik: "${config.topic}" dünyasında "${config.characterName || 'Karakter'}" karakterinin en etkileyici anı.
    
    ÜRETİLECEK BİLEŞENLER:
    ${tasksInstruction}
    
    DİKKAT: Sadece JSON döndür.
    `;

    const schema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            story: { type: 'STRING' },
            genre: { type: 'STRING' },
            gradeLevel: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING', description: "Hangi bilişsel becerinin hedeflendiği (Disleksi uzmanı bakışıyla)" },
            imagePrompt: { type: 'STRING' },
            vocabulary: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: { word: { type: 'STRING' }, definition: { type: 'STRING' } },
                    required: ['word', 'definition']
                }
            },
            creativeTask: { type: 'STRING' },
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
            },
            trueFalse: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: { question: { type: 'STRING' }, answer: { type: 'BOOLEAN' } },
                    required: ['question', 'answer']
                }
            },
            fillBlanks: {
                type: 'ARRAY',
                items: {
                    type: 'OBJECT',
                    properties: { sentence: { type: 'STRING' }, answer: { type: 'STRING' } },
                    required: ['sentence', 'answer']
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
        required: ['title', 'story', 'imagePrompt', 'fiveW1H']
    };

    // Fix: Using stable gemini-3-flash for maximum speed and cost efficiency
    return await generateWithSchema(prompt, schema);
};

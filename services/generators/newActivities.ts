
import { Type } from "@google/genai";
import { generateWithSchema, analyzeImage } from '../geminiClient';
import { 
    GeneratorOptions, 
    MapInstructionData, 
    ActivityType, 
    FamilyRelationsData, 
    FamilyLogicTestData,
    SyllableWordBuilderData
} from '../../types';
import { PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE, getStudentContextPrompt } from './prompts';

export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { difficulty, studentContext } = options;
    
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: "Akrabalık İlişkileri ve Eşleştirme" etkinliği oluştur. 
    ZORLUK: ${difficulty}
    
    KURALLAR:
    1. Tanımlar disleksi dostu, kısa ve net olmalıdır.
    2. "Başlangıç" seviyesinde temel aile üyeleri (Anne, Baba, Kardeş, Teyze, Amca, Dayı, Hala, Dede, Anneanne, Babaanne).
    3. "Orta" seviyede kuzenler, yeğenler, yenge, enişte ekle.
    4. "Zor/Uzman" seviyesinde görümce, elti, bacanak, kayınço gibi daha karmaşık bağlar ekle.
    5. 'momRelatives' ve 'dadRelatives' dizilerini kategorize edilmiş şekilde doldur.
    
    ÇIKTI FORMATI: Sadece JSON dizi döndür.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                pairs: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            definition: { type: Type.STRING },
                            label: { type: Type.STRING },
                            side: { type: Type.STRING, enum: ['mom', 'dad'] }
                        },
                        required: ['definition', 'label', 'side']
                    }
                },
                momRelatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                dadRelatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                difficulty: { type: Type.STRING }
            },
            required: ['title', 'pairs', 'momRelatives', 'dadRelatives']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateFamilyLogicTestFromAI = async (options: GeneratorOptions): Promise<FamilyLogicTestData[]> => {
    const { difficulty, itemCount, studentContext } = options;
    
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: "Akrabalık Mantık ve Çıkarım Testi" oluştur. 
    ZORLUK: ${difficulty}
    ADET: ${itemCount || 10} ifade.
    
    KURALLAR:
    1. İfadeler mantıksal bir akrabalık bağı önermesi içermelidir.
    2. Örn: "Halam babamın kız kardeşidir." (Doğru), "Dayım babamın kardeşidir." (Yanlış).
    3. Bazı ifadeler şaşırtıcı ve muhakeme gerektirici olmalıdır.
    4. Disleksi dostu: Kritik kelimelerin altı çizilebilir ya da kalın yazılabilir.
    
    ÇIKTI FORMATI: Sadece JSON dizi döndür.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                statements: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            isTrue: { type: Type.BOOLEAN }
                        },
                        required: ['text', 'isTrue']
                    }
                },
                difficulty: { type: Type.STRING }
            },
            required: ['title', 'statements']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateSyllableWordBuilderFromAI = async (options: GeneratorOptions): Promise<SyllableWordBuilderData[]> => {
    const { topic, difficulty, itemCount, studentContext } = options;
    
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    
    GÖREV: "Hece Dedektifi: Kelime İnşası" etkinliği oluştur. 
    ZORLUK: ${difficulty} (Başlangıç: 2 hece, Orta: 3 hece, Zor: 4+ hece)
    ADET: ${itemCount || 6} kelime.
    TEMA: ${topic || 'Günlük Yaşam Objeleri'}
    
    TASARIM KURALLARI:
    1. Kelimeler kesinlikle TÜRKÇE heceleme kurallarına göre hecelenmelidir (Örn: A-RA-BA).
    2. Her kelime için net, izole ve çocuk dostu bir "imagePrompt" yaz.
    3. Tüm heceleri içeren, içine bir miktar çeldirici (benzer sesli heceler) eklenmiş karışık bir "syllableBank" oluştur.
    4. Disleksi dostu: Kelimeler net, somut ve görselleştirilebilir olsun.
    
    ÇIKTI FORMATI: Sadece JSON dizi döndür.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                words: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.NUMBER },
                            targetWord: { type: Type.STRING },
                            syllables: { type: Type.ARRAY, items: { type: Type.STRING } },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ['targetWord', 'syllables', 'imagePrompt']
                    }
                },
                syllableBank: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'words', 'syllableBank']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateFromRichPrompt = async (activityType: ActivityType, blueprint: string, options: GeneratorOptions) => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(options.studentContext)}

    GÖREV: ${activityType} türünde, ekteki blueprint (MİMARİ TASLAK) talimatlarını kullanarak yeni ve özgün içerik üret.
    
    PARAMETRELER:
    - ZORLUK: ${options.difficulty}
    - KONU: ${options.topic}
    - ÖĞE ADEDİ: ${options.itemCount}

    MİMARİ TASLAK:
    ========================================================================
    ${blueprint}
    ========================================================================

    DİKKAT: Üretilen veriler yukarıdaki blueprint'te belirtilen yerleşim ve mantık kurallarına (örn: ızgara boyutu, eşleştirme mantığı, soru yapısı) BİREBİR uygun olmalıdır.
    
    ${IMAGE_GENERATION_GUIDE}
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                sections: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING }, // 'text', 'grid', 'list', 'matching', 'image'
                            title: { type: Type.STRING },
                            content: { type: Type.STRING },
                            items: { type: Type.ARRAY, items: { type: Type.STRING } },
                            gridData: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                        }
                    }
                }
            },
            required: ['title', 'instruction']
        }
    };

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

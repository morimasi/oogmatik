
import { Type } from "@google/genai";
import { generateWithSchema, analyzeImage } from '../geminiClient';
import { GeneratorOptions, FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, ActivityType } from '../../types';
import { PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE, getStudentContextPrompt } from './prompts';

// Fix: Added generateFromRichPrompt to handle the reconstruction of custom activity structures identified by AI vision
export const generateFromRichPrompt = async (activityType: ActivityType, instructions: string, options: GeneratorOptions): Promise<any> => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(options.studentContext)}

    GÖREV: "${activityType}" türünde, disleksi ve özel öğrenme güçlüğü dostu bir eğitim materyali üret.
    
    MİMARİ YÖNERGE (BU ŞABLONA SADIK KALARAK İÇERİĞİ KURGULA):
    ${instructions}
    
    ÖZEL PARAMETRELER:
    - Zorluk Seviyesi: ${options.difficulty}
    - Tema/Konu: ${options.topic || 'Genel'}
    - Öğe Sayısı: ${options.itemCount || 10}
    
    ${options.customInput ? `[MULTIMODAL]: Bu içerik bir görsel analizinden türetilmiştir. Görseldeki yerleşim mantığını koru ancak tamamen yeni ve özgün veriler kullan.` : ''}
    
    ${IMAGE_GENERATION_GUIDE}
    
    ÇIKTI: Kesinlikle ve sadece JSON formatında, "sections" dizisi içeren bir nesne döndür.
    `;

    const schema = {
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
                        type: { type: Type.STRING, enum: ['text', 'image', 'list', 'grid'] },
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        items: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ['type']
                }
            }
        },
        required: ['title', 'instruction', 'sections']
    };

    if (options.customInput && options.customInput.startsWith('data:image')) {
        return await analyzeImage(options.customInput, prompt, schema, 'gemini-3-flash-preview');
    }

    return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
};

export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { worksheetCount, itemCount, topic, studentContext } = options;
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    Akrabalık İlişkileri Eşleştirme etkinliği oluştur. 
    Konu: ${topic || 'Akrabalık'}. ${itemCount || 10} adet çift oluştur. 
    Sadece JSON döndür.
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
                leftColumn: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, 
                        required: ['text', 'id'] 
                    } 
                }, 
                rightColumn: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, 
                        required: ['text', 'id'] 
                    } 
                } 
            }, 
            required: ['title', 'instruction', 'leftColumn', 'rightColumn'] 
        } 
    };
    return generateWithSchema(prompt, schema) as Promise<FamilyRelationsData[]>;
};

export const generateLogicDeductionFromAI = async (options: GeneratorOptions): Promise<LogicDeductionData[]> => {
    const { worksheetCount, itemCount, topic, difficulty, studentContext } = options;
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    Mantıksal Çıkarım Bulmacaları. 
    Kategori: ${topic || 'Karışık'}. Zorluk: ${difficulty}. ${itemCount || 4} adet soru üret. 
    SADECE JSON.
    `;
    const schema = { 
        type: Type.ARRAY, 
        items: { 
            type: Type.OBJECT, 
            properties: { 
                title: { type: Type.STRING }, 
                instruction: { type: Type.STRING }, 
                pedagogicalNote: { type: Type.STRING }, 
                questions: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            riddle: { type: Type.STRING }, 
                            options: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                            answerIndex: { type: Type.NUMBER }, 
                            correctLetter: { type: Type.STRING } 
                        }, 
                        required: ['riddle', 'options', 'answerIndex'] 
                    } 
                } 
            }, 
            required: ['title', 'instruction', 'questions'] 
        } 
    };
    return generateWithSchema(prompt, schema) as Promise<LogicDeductionData[]>;
};

export const generateNumberBoxLogicFromAI = async (options: GeneratorOptions): Promise<NumberBoxLogicData[]> => {
    const { worksheetCount, itemCount, numberRange, studentContext } = options;
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}
    Kutulu Sayı Analizi etkinliği. 
    Sayı Aralığı: ${numberRange || '1-50'}. ${itemCount || 2} adet bulmaca seti üret.
    SADECE JSON.
    `;
    const schema = { 
        type: Type.ARRAY, 
        items: { 
            type: Type.OBJECT, 
            properties: { 
                title: { type: Type.STRING }, 
                instruction: { type: Type.STRING }, 
                pedagogicalNote: { type: Type.STRING }, 
                puzzles: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            box1: { type: Type.ARRAY, items: { type: Type.NUMBER } }, 
                            box2: { type: Type.ARRAY, items: { type: Type.NUMBER } }, 
                            questions: { 
                                type: Type.ARRAY, 
                                items: { 
                                    type: Type.OBJECT, 
                                    properties: { 
                                        text: { type: Type.STRING }, 
                                        options: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                                        correctAnswer: { type: Type.STRING } 
                                    }, 
                                    required: ['text', 'options'] 
                                } 
                            } 
                        }, 
                        required: ['box1', 'box2', 'questions'] 
                    } 
                } 
            }, 
            required: ['title', 'instruction', 'puzzles'] 
        } 
    };
    return generateWithSchema(prompt, schema) as Promise<NumberBoxLogicData[]>;
};

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, studentContext } = options;
    
    const prompt = `
    [ROL: KIDEMLİ COĞRAFYA VE ÖZEL EĞİTİM UZMANI]
    ${getStudentContextPrompt(studentContext)}
    "Harita Dedektifi" (Türkiye Coğrafyası ve Yönerge Takibi) etkinliği oluştur.
    
    Zorluk Seviyesi: ${difficulty}.
    
    GÖREV STRATEJİSİ:
    1. Yönergeler karmaşık mantık ve görsel tarama gerektirmeli.
    2. Konum bazlı sorular: "İç Anadolu'nun doğusunda yer alan ve ismi 'S' ile başlayan..."
    3. Rota bazlı sorular: "İstanbul'dan Ankara'ya en kısa yoldan giderken geçilen..."
    4. Özellik bazlı sorular: "Denize kıyısı olan ama Akdeniz bölgesinde olmayan..."
    
    ÇIKTI FORMATI:
    - title: "Harita Dedektifi"
    - instruction: Öğrenciye yönelik motive edici yönerge.
    - pedagogicalNote: Bu çalışmanın bilişsel faydaları.
    - instructions: En az 10 adet profesyonel yönerge dizisi.
    
    ÖNEMLİ: Sadece geçerli JSON döndür. Gemini 3.0 Flash Preview yeteneklerini kullan.
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'instruction', 'instructions']
        }
    };

    const raw = await generateWithSchema(prompt, schema, 'gemini-3-flash-preview') as any[];
    
    const { generateOfflineMapDetective } = await import('../offlineGenerators/mapDetective');
    const base = await generateOfflineMapDetective({ ...options, worksheetCount: 1 });
    
    return raw.map((item: any) => ({
        ...item,
        cities: base[0].cities,
        settings: { showCityNames: true, markerStyle: 'circle', difficulty }
    }));
};

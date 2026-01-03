
import { Type } from "@google/genai";
import { generateWithSchema, analyzeImage } from '../geminiClient';
import { 
    GeneratorOptions, 
    MapInstructionData, 
    ActivityType, 
    FamilyRelationsData, 
    LogicDeductionData, 
    NumberBoxLogicData, 
    MindGamesData, 
    MindGames56Data 
} from '../../types';
import { PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE, getStudentContextPrompt } from './prompts';

/**
 * AI WORKSHEET CONVERTER (DESIGN CLONER)
 * Analyzes an image and generates a variation with the same architecture but fresh content.
 */
export const generateAiWorksheetConverterFromAI = async (options: GeneratorOptions): Promise<any> => {
    const { topic, difficulty, studentContext, customInput } = options;
    
    if (!customInput || !customInput.startsWith('data:image')) {
        throw new Error("Dönüştürme işlemi için bir görsel (JPG/PNG) yüklenmesi zorunludur.");
    }

    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(studentContext)}

    GÖREV: Ekteki çalışma sayfasını analiz et ve "DİJİTAL İKİZ" bir varyasyon üret.
    
    ANALİZ KRİTERLERİ:
    1. Görsel Mimariyi (Layout) belirle: Sütunlar, tablolar, eşleştirme alanları vb.
    2. Soru Mantığını anla: Ne tür bir bilişsel beceri ölçülüyor?
    3. YENİ İÇERİK ÜRET: Orijinaldeki kelimeleri, sayıları veya cümleleri KESİNLİKLE kullanma. Tamamen yeni ve özgün veriler üret.
    
    ZORLUK: ${difficulty}
    
    ÇIKTI: 'sections' dizisi içeren zengin bir veri yapısı döndür. 
    Her section; 'type' (text|list|grid|matching), 'title', 'content' veya 'items' içermeli.
    `;

    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            instruction: { type: Type.STRING },
            pedagogicalNote: { type: Type.STRING },
            sections: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING, enum: ['text', 'image', 'list', 'grid', 'matching'] },
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                        gridData: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                    },
                    required: ['type']
                }
            }
        },
        required: ['title', 'instruction', 'sections']
    };

    const result = await analyzeImage(customInput, prompt, schema, 'gemini-3-flash-preview');
    return Array.isArray(result) ? result : [result];
};

/**
 * Generic generator that uses a custom-defined prompt (blueprint)
 * This is used for generating content from OCR-derived architectures.
 */
export const generateFromRichPrompt = async (activityType: ActivityType, blueprint: string, options: GeneratorOptions): Promise<any> => {
    const { topic, difficulty, itemCount, studentContext, customInput } = options;

    const prompt = `
    ${blueprint}

    [EXECUTION PARAMETERS]:
    - TOPIC: ${topic || 'General'}
    - DIFFICULTY: ${difficulty}
    - ITEM COUNT: ${itemCount || 8}
    
    ${getStudentContextPrompt(studentContext)}
    `;

    // We use a flexible schema for custom prompts to handle varied architectures
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
                        type: { type: Type.STRING, enum: ['text', 'image', 'list', 'grid', 'matching'] },
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                        gridData: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
                    },
                    required: ['type']
                }
            }
        },
        required: ['title', 'instruction', 'sections']
    };

    if (customInput && customInput.startsWith('data:image')) {
        return await analyzeImage(customInput, prompt, schema, 'gemini-3-flash-preview');
    } else {
        return await generateWithSchema(prompt, schema, 'gemini-3-flash-preview');
    }
};

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, studentContext, mapInstructionTypes, emphasizedRegion, itemCount, showCityNames, markerStyle, customInput } = options;
    
    const typesDesc = mapInstructionTypes?.join(', ') || 'Konum Mantığı, Harf Özellikleri, Coğrafi Özellikler';
    const regionDesc = emphasizedRegion === 'all' ? 'Tüm Türkiye' : `${emphasizedRegion} Bölgesi`;

    const prompt = `
    [ROL: KIDEMLİ COĞRAFYA VE ÖZEL EĞİTİM UZMANI]
    ${getStudentContextPrompt(studentContext)}
    "Harita Dedektifi" (Türkiye Coğrafyası ve Yönerge Takibi) etkinliği oluştur.
    
    ZORUNLU KRİTERLER:
    - ODAK BÖLGE: ${regionDesc}. SADECE bu bölgedeki illeri temel al. 
    - YÖNERGE TİPLERİ: ${typesDesc} kategorilerinden karma sorular hazırla.
    - ADET: Her sayfa için tam ${itemCount || 8} adet yönerge üret.
    - ZORLUK: ${difficulty}. 
    
    ÇIKTI FORMATI:
    - title: "Harita Dedektifi: ${regionDesc}"
    - instructions: [SADECE string dizi]
    
    SADECE JSON DÖNDÜR.
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
    
    const { generateOfflineMapInstruction } = await import('../offlineGenerators/mapDetective');
    const base = await generateOfflineMapInstruction({ ...options, worksheetCount: 1 });
    
    return raw.map((item: any) => ({
        ...item,
        imageBase64: customInput, // KULLANICI KAYNAĞINI AKTAR
        cities: base[0].cities,
        settings: { 
            showCityNames: showCityNames ?? true, 
            markerStyle: markerStyle ?? 'circle', 
            difficulty 
        }
    }));
};

export const generateFamilyRelationsFromAI = async (options: GeneratorOptions): Promise<FamilyRelationsData[]> => {
    const { topic, itemCount } = options;
    const prompt = `Akrabalık İlişkileri Eşleştirme. Konu: ${topic || 'Akrabalık'}. ${itemCount || 10} çift oluştur. [ROL: UZMAN PEDAGOG] Sadece JSON.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, imagePrompt: { type: Type.STRING }, leftColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, required: ['text', 'id'] } }, rightColumn: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, id: { type: Type.NUMBER } }, required: ['text', 'id'] } } }, required: ['title', 'instruction', 'leftColumn', 'rightColumn'] } };
    return generateWithSchema(prompt, schema) as Promise<FamilyRelationsData[]>;
};

export const generateLogicDeductionFromAI = async (options: GeneratorOptions): Promise<LogicDeductionData[]> => {
    const { itemCount, topic } = options;
    const prompt = `Mantıksal Çıkarım Bulmacaları. Kategori: ${topic || 'Karışık'}. ${itemCount || 4} soru. [ROL: UZMAN PEDAGOG] Sadece JSON.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { riddle: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answerIndex: { type: Type.NUMBER }, correctLetter: { type: Type.STRING } }, required: ['riddle', 'options', 'answerIndex'] } } }, required: ['title', 'instruction', 'questions'] } };
    return generateWithSchema(prompt, schema) as Promise<LogicDeductionData[]>;
};

export const generateNumberBoxLogicFromAI = async (options: GeneratorOptions): Promise<NumberBoxLogicData[]> => {
    const { itemCount, numberRange } = options;
    const prompt = `Kutulu Sayı Analizi. Sayı Aralığı: ${numberRange}. ${itemCount || 2} bulmaca seti. [ROL: UZMAN PEDAGOG] Sadece JSON.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, instruction: { type: Type.STRING }, pedagogicalNote: { type: Type.STRING }, puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { box1: { type: Type.ARRAY, items: { type: Type.NUMBER } }, box2: { type: Type.ARRAY, items: { type: Type.NUMBER } }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING } }, required: ['text', 'options'] } } }, required: ['box1', 'box2', 'questions'] } } }, required: ['title', 'instruction', 'puzzles'] } };
    return generateWithSchema(prompt, schema) as Promise<NumberBoxLogicData[]>;
};

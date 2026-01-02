
import { Type } from "@google/genai";
import { generateWithSchema, analyzeImage } from '../geminiClient';
import { GeneratorOptions, FamilyRelationsData, LogicDeductionData, NumberBoxLogicData, MapInstructionData, ActivityType } from '../../types';
import { PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE, getStudentContextPrompt } from './prompts';

// Fix: Added generateFromRichPrompt to handle the reconstruction of custom activity structures identified by AI vision
export const generateFromRichPrompt = async (activityType: ActivityType, instructions: string, options: GeneratorOptions): Promise<any> => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(options.studentContext)}

    GÖREV: "${activityType}" türünde, disleksi ve özel öğrenme güçlüğü dostu bir education materyali üret.
    
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

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, studentContext, mapInstructionTypes, emphasizedRegion, itemCount, showCityNames, markerStyle } = options;
    
    const typesDesc = mapInstructionTypes?.join(', ') || 'Konum Mantığı, Harf Özellikleri, Coğrafi Özellikler';
    const regionDesc = emphasizedRegion === 'all' ? 'Tüm Türkiye' : `${emphasizedRegion} Bölgesi`;

    const prompt = `
    [ROL: KIDEMLİ COĞRAFYA VE ÖZEL EĞİTİM UZMANI]
    ${getStudentContextPrompt(studentContext)}
    "Harita Dedektifi" (Türkiye Coğrafyası ve Yönerge Takibi) etkinliği oluştur.
    
    ZORUNLU KRİTERLER:
    - ODAK BÖLGE: ${regionDesc}. SADECE bu bölgedeki illeri veya bu bölgeyle doğrudan ilişkili (komşu vb.) coğrafi özellikleri temel al. 
    - YÖNERGE TİPLERİ: ${typesDesc} kategorilerinden karma sorular hazırla.
    - ADET: Her sayfa için tam ${itemCount || 8} adet bağımsız yönerge üret.
    - ZORLUK: ${difficulty}. 
      * Başlangıç: "X ilini bul ve kırmızıya boya." tarzı tek aşamalı.
      * Uzman: "${regionDesc} bölgesinde olup, ismi 'A' ile başlayan ve denize kıyısı olan ili bul, bu ilin hemen doğusundaki komşusuna git ve ismini yaz." tarzı çok katmanlı.
    
    STRATEJİ:
    1. Hayali şehir uydurma, Türkiye'nin gerçek 81 ilini kullan.
    2. Disleksi dostu, kısa ve eylem odaklı cümleler kur.
    3. Eğer bir bölge seçildiyse (Örn: Ege), tüm yönergeler Ege bölgesi şehirlerini hedef almalıdır.
    
    ÇIKTI FORMATI:
    - title: "Harita Dedektifi: ${regionDesc}"
    - instruction: Öğrenci için yönlendirici talimat.
    - pedagogicalNote: Akademik dille eğitsel faydalar.
    - instructions: [SADECE stringlerden oluşan bir dizi]
    
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
    
    // Şehir koordinat veritabanını offline motordan al (Tutarlılık için)
    const { generateOfflineMapInstruction } = await import('../offlineGenerators/mapDetective');
    const base = await generateOfflineMapInstruction({ ...options, worksheetCount: 1 });
    
    return raw.map((item: any) => ({
        ...item,
        cities: base[0].cities,
        settings: { 
            showCityNames: showCityNames ?? true, 
            markerStyle: markerStyle ?? 'circle', 
            difficulty 
        }
    }));
};

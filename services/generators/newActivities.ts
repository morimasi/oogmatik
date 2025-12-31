
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

export const generateMapInstructionFromAI = async (options: GeneratorOptions): Promise<MapInstructionData[]> => {
    const { worksheetCount, difficulty, studentContext, mapInstructionTypes, emphasizedRegion, itemCount } = options;
    
    const typesDesc = mapInstructionTypes?.join(', ') || 'Yönler, Harf Özellikleri, Coğrafi Özellikler';
    const regionDesc = emphasizedRegion === 'all' ? 'Tüm Türkiye' : `${emphasizedRegion} Bölgesi`;

    const prompt = `
    [ROL: KIDEMLİ COĞRAFYA VE ÖZEL EĞİTİM UZMANI]
    ${getStudentContextPrompt(studentContext)}
    "Harita Dedektifi" (Türkiye Coğrafyası ve Yönerge Takibi) etkinliği oluştur.
    
    ZORUNLU KISITLAMALAR:
    - ODAK BÖLGE: ${regionDesc}. SADECE bu bölgedeki şehirleri temel alan sorular hazırla.
    - YÖNERGE TİPLERİ: ${typesDesc}.
    - YÖNERGE ADEDİ: Her sayfa için tam ${itemCount || 8} adet.
    - ZORLUK: ${difficulty}.
    
    GÖREV STRATEJİSİ:
    1. Yönergeler SADECE konum değil, fonolojik ve coğrafi mantık içermeli.
    2. "Kuzeyinde şu olan, ismi 'A' ile biten ve deniz kıyısı olmayan..." gibi çok katmanlı sorular sor.
    3. Hayali şehir uydurma, Türkiye'nin gerçek 81 ilini kullan.
    4. Disleksi dostu, eylem odaklı (Boya, İşaretle, Çiz) emir kipleri kullan.
    
    ÇIKTI FORMATI:
    - title: "Harita Dedektifi"
    - instruction: Öğrenci motivasyon yönergesi.
    - pedagogicalNote: Bilişsel faydalar (akademik dil).
    - instructions: [string array]
    
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
    
    // Şehir koordinat veritabanını offline'dan al
    const { generateOfflineMapDetective } = await import('../offlineGenerators/mapDetective');
    const base = await generateOfflineMapDetective({ ...options, worksheetCount: 1 });
    
    return raw.map((item: any) => ({
        ...item,
        cities: base[0].cities,
        settings: { 
            showCityNames: options.showCityNames || false, 
            markerStyle: options.markerStyle || 'circle', 
            difficulty 
        }
    }));
};


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
    const regionDesc = emphasizedRegion === 'all' ? 'Tüm Türkiye' : emphasizedRegion;

    const prompt = `
    [ROL: KIDEMLİ COĞRAFYA VE ÖZEL EĞİTİM UZMANI]
    ${getStudentContextPrompt(studentContext)}
    "Harita Dedektifi" (Türkiye Coğrafyası ve Yönerge Takibi) etkinliği oluştur.
    
    Zorluk Seviyesi: ${difficulty}.
    ODAK BÖLGE: ${regionDesc}
    YÖNERGE TİPLERİ: ${typesDesc}
    YÖNERGE ADEDİ: ${itemCount || 8}
    
    GÖREV STRATEJİSİ:
    1. Yönergeler karmaşık mantık ve görsel tarama gerektirmeli.
    2. Konum bazlı sorular: "İç Anadolu'nun doğusunda yer alan ve ismi 'S' ile başlayan..."
    3. Rota bazlı sorular: "İstanbul'dan Ankara'ya en kısa yoldan giderken geçilen..."
    4. Özellik bazlı sorular: "Denize kıyısı olan ama Akdeniz bölgesinde olmayan..."
    5. Disleksi dostu kısa ve net eylem cümleleri kur.
    
    ÇIKTI FORMATI:
    - title: "Harita Dedektifi"
    - instruction: Öğrenciye yönelik motive edici yönerge.
    - pedagogicalNote: Bu çalışmanın bilişsel faydaları.
    - instructions: Kesinlikle ${itemCount || 8} adet profesyonel yönerge dizisi.
    
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
    
    // Şehir veritabanını offline'dan çekip AI yönergeleriyle birleştiriyoruz
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

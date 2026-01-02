
import { Type } from "@google/genai";
import { generateWithSchema, analyzeImage } from '../geminiClient';
import { GeneratorOptions, MapInstructionData, ActivityType } from '../../types';
import { PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE, getStudentContextPrompt } from './prompts';

/**
 * OCR BLUEPRINT'ten DİJİTAL İKİZ ÜRETİCİ
 * Bu fonksiyon, OCR ile analiz edilen bir sayfanın mimarisini alır ve farklı verilerle varyasyon üretir.
 */
export const generateFromRichPrompt = async (activityType: ActivityType, instructions: string, options: GeneratorOptions): Promise<any> => {
    const prompt = `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(options.studentContext)}

    GÖREV: Ekteki mimari taslağa (BLUEPRINT) dayalı bir "DİJİTAL İKİZ" materyal üret.
    
    TASLAK (ARCHITECTURAL BLUEPRINT):
    =========================================
    ${instructions}
    =========================================
    
    ÜRETİM KURALLARI:
    1. **Sıfır Kopyalama:** Orijinal görseldeki verileri (sayılar, kelimeler, cümleler) KESİNLİKLE kullanma. Her şeyi yeniden ve özgün olarak oluştur.
    2. **Mimari Sadakat:** Görseldeki yerleşim düzenini (tablo, kutu, kolon yapısı vb.) aynen koru.
    3. **Varyasyon:** Eğer orijinalde 10 soru varsa, sen de tam 10 tane benzer mantıkta ama farklı içerikte soru üret.
    4. **Disleksi Uyumu:** ${options.difficulty} zorluk seviyesine uygun, disleksi dostu dil ve görselleştirme kullan.
    
    ${IMAGE_GENERATION_GUIDE}
    
    ÇIKTI: JSON formatında, 'sections' dizisi içeren zengin bir veri yapısı döndür. 
    Her section; 'type' (text|list|grid|matching), 'title' (opsiyonel), 'content' ve 'items' içermeli.
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
                        type: { type: Type.STRING, enum: ['text', 'image', 'list', 'grid', 'matching'] },
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        items: { type: Type.ARRAY, items: { type: Type.STRING } },
                        columnLabels: { type: Type.ARRAY, items: { type: Type.STRING } }, // Izgaralar için
                        gridData: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } } // Karmaşık tablolar için
                    },
                    required: ['type']
                }
            }
        },
        required: ['title', 'instruction', 'sections']
    };

    // Multimodal destek: Orijinal görseli AI'ya referans olarak tekrar gönderiyoruz ki mimariyi gözüyle de teyit etsin
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
    - ODAK BÖLGE: ${regionDesc}. SADECE bu bölgedeki illeri veya bu bölgeyle doğrudan ilişkili coğrafi özellikleri temel al. 
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
        cities: base[0].cities,
        settings: { 
            showCityNames: showCityNames ?? true, 
            markerStyle: markerStyle ?? 'circle', 
            difficulty 
        }
    }));
};

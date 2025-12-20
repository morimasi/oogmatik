
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ MİMARI]
        GÖREV: Görüntüdeki etkinliğin MİMARİ PLANINI (Blueprint) çıkar. 
        
        KRİTİK KURALLAR:
        1. **Döngü Yasaktır:** Soruları veya içerikleri tek tek yazma. Yapıyı tarif et. 
           - YANLIŞ: "Soru 1 şu, Soru 2 şu..." (Bu döngüye sebep olur)
           - DOĞRU: "Sayfada 2 sütunlu, toplam 10 soruluk bir test yapısı var. Her soru görsel içeriyor."
        2. **Birebir Klonlama:** Orijinal sayfadaki tablo sütun sayısını, grid yapısını ve görsel yerleşimlerini (sol/sağ/üst) teknik olarak belirt.
        3. **Algoritma Çıkarımı:** Etkinliğin çözüm mantığını (eşleştirme mi, hesaplama mı, boyama mı) teknik bir dille özetle.
        
        ÇIKTI (Kesinlikle JSON):
        {
            "detectedType": "ActivityType",
            "title": "Ana Başlık",
            "description": "Kısa özet",
            "layoutHint": {
                "containerType": "grid | list",
                "gridCols": 1,
                "hasImages": true
            },
            "blueprint": "TEKNİK ÖZET: [YAPI] + [SORU TİPİ] + [GÖRSEL KONUMU]. Örn: 3x4 tablo yapısı, hücrelerde meyve isimleri, her satır sonunda boyama alanı."
        }
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                layoutHint: {
                    type: Type.OBJECT,
                    properties: {
                        containerType: { type: Type.STRING },
                        gridCols: { type: Type.NUMBER },
                        hasImages: { type: Type.BOOLEAN }
                    },
                    required: ['containerType', 'gridCols']
                },
                blueprint: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'blueprint', 'layoutHint']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-3-flash-preview');
            
            const safeType = result.detectedType && (validIds.includes(result.detectedType) || result.detectedType === 'CUSTOM_GENERATED') 
                ? result.detectedType 
                : 'CUSTOM_GENERATED';

            return {
                rawText: '', 
                detectedType: safeType,
                title: result.title || 'Analiz Edilen Etkinlik',
                description: result.description || 'Tasarım klonlandı.',
                generatedTemplate: result.blueprint || '',
                structuredData: {
                    difficulty: 'Orta',
                    itemCount: 10,
                    topic: 'Genel',
                    instructions: result.blueprint || '',
                    components: [],
                    layoutHint: result.layoutHint 
                },
                baseType: safeType
            };
        } catch (error) {
            console.error("OCR Analysis Error:", error);
            throw new Error("Görsel mimarisi çözümlenemedi. Lütfen daha net bir görsel yükleyin.");
        }
    }
};

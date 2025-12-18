
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ MÜHENDİSİ]
        
        GÖREV: Yüklenen eğitim materyalinin "Bileşen Mimarisini" (Component Architecture) çıkar.
        Sadece metinleri değil, sayfadaki **GÖRSEL YAPILARI (WIDGETS)** tanımla.
        
        TESPİT ETMEN GEREKEN YAPILAR:
        1. **TABLOLAR (Tables):** Satır ve sütun çizgileri var mı?
        2. **GRAFİKLER (Charts):** Sütun grafiği, pasta grafiği veya sayı doğrusu var mı?
        3. **ŞEKİL IZGARALARI (Shape Grids):** Boyanması gereken kareler, kutucuklar var mı?
        4. **ALGORİTMA/KOD (Algorithms):** Adım adım işlemler, oklar, akış şemaları veya kod benzeri yapılar var mı?
        5. **KARTLAR (Cards):** Bilgi kutucukları var mı?
        
        ANALİZ ÇIKTISI (JSON):
        {
            "detectedType": "ActivityType veya 'CUSTOM_GENERATED'",
            "title": "Başlık",
            "description": "Özet",
            "estimatedDifficulty": "Orta",
            "estimatedItemCount": 10,
            "topic": "Konu",
            "layoutStyle": {
                "containerType": "grid" | "list",
                "gridCols": 1 | 2 | 3 | 4,
                "cardStyle": "simple" | "border" | "shadow"
            },
            "generatedTemplate": "YAPAY ZEKA İÇİN ÜRETİM EMRİ:\n- Konu: [KONU]\n- Eğer görselde TABLO varsa, 'type: table' kullan.\n- Eğer ALGORİTMA varsa, 'type: code_block' kullan.\n- Eğer ŞEKİL IZGARASI varsa, 'type: shape_grid' kullan.\n- Detaylı talimatlar..."
        }
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedDifficulty: { type: Type.STRING, enum: ['Başlangıç', 'Orta', 'Zor', 'Uzman'] },
                estimatedItemCount: { type: Type.INTEGER },
                topic: { type: Type.STRING },
                layoutStyle: {
                    type: Type.OBJECT,
                    properties: {
                        containerType: { type: Type.STRING, enum: ['grid', 'list', 'flex'] },
                        gridCols: { type: Type.INTEGER },
                        cardStyle: { type: Type.STRING, enum: ['simple', 'border', 'shadow', 'colorful'] }
                    },
                    required: ['containerType', 'gridCols']
                },
                generatedTemplate: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'description', 'layoutStyle', 'generatedTemplate']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-2.5-flash');
            
            const safeType = result.detectedType && (validIds.includes(result.detectedType) || result.detectedType === 'CUSTOM_GENERATED') 
                ? result.detectedType 
                : 'CUSTOM_GENERATED';

            return {
                rawText: '', 
                detectedType: safeType,
                title: result.title || 'Analiz Edilen Etkinlik',
                description: result.description || 'Tasarım kopyalandı.',
                generatedTemplate: result.generatedTemplate || 'Standart üretim.',
                structuredData: {
                    difficulty: result.estimatedDifficulty as any || 'Orta',
                    itemCount: result.estimatedItemCount || 10,
                    topic: result.topic || 'Genel',
                    instructions: result.generatedTemplate || '',
                    components: [],
                    layoutHint: result.layoutStyle 
                },
                baseType: safeType
            };
        } catch (error) {
            console.error("OCR Service Error:", error);
            throw error; 
        }
    },

    convertToWorksheetData: (ocrData: OCRResult): { type: ActivityType, data: any[] } => {
        return { type: ocrData.baseType as ActivityType, data: [] };
    }
};

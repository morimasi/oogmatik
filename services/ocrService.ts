
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ MÜHENDİSİ VE MİMARI]
        
        GÖREV: Yüklenen eğitim materyalinin "DNA'sını" çıkar. Sadece metni okuma, sayfanın İNŞA EDİLME MANTIĞINI çöz.
        
        ANALİZ KRİTERLERİ:
        1. **Yapısal Düzen:** Sayfa tek sütun mu? İki sütunlu mu? Izgara (grid) yapısı mı var?
        2. **Bileşen Tespiti:** 
           - Tablo varsa: Satır/sütun sayısı nedir? Başlıklar neler?
           - Görsel varsa: Konumu neresi? Ne anlatıyor?
           - Soru varsa: Tipi nedir? (Eşleştirme, Boşluk Doldurma, Test).
        3. **Algoritma:** Etkinlik nasıl çözülüyor? (Örn: "Soldaki sayı ile sağdaki harfi topla" gibi bir mantık var mı?)
        
        ÇIKTI (Kesinlikle JSON):
        {
            "detectedType": "Mevcut ActivityType listesinden en yakını veya 'CUSTOM_GENERATED'",
            "title": "Görseldeki ana başlık",
            "description": "Etkinliğin ne yaptığının özeti",
            "estimatedDifficulty": "Başlangıç | Orta | Zor | Uzman",
            "topic": "Etkinlik konusu",
            "layoutHint": {
                "containerType": "grid | list",
                "gridCols": 1, 2, 3, 4,
                "hasImages": true/false,
                "hasTables": true/false
            },
            "blueprint": "Yapay zekanın bu sayfayı BİREBİR YENİDEN ÜRETMESİ İÇİN teknik talimat. Örn: 'Sayfada 2x5 bir tablo var, her hücrede meyve isimleri olmalı. Alt kısımda 3 satırlık bir not alanı var.'",
            "originalContentSummary": "Orijinal içerikteki örnek verilerin özeti."
        }
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedDifficulty: { type: Type.STRING },
                topic: { type: Type.STRING },
                layoutHint: {
                    type: Type.OBJECT,
                    properties: {
                        containerType: { type: Type.STRING },
                        gridCols: { type: Type.NUMBER },
                        hasImages: { type: Type.BOOLEAN },
                        hasTables: { type: Type.BOOLEAN }
                    },
                    required: ['containerType', 'gridCols']
                },
                blueprint: { type: Type.STRING },
                originalContentSummary: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'blueprint', 'layoutHint']
        };

        try {
            // Force gemini-3-flash-preview for high speed and layout understanding
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-3-flash-preview');
            
            const safeType = result.detectedType && (validIds.includes(result.detectedType) || result.detectedType === 'CUSTOM_GENERATED') 
                ? result.detectedType 
                : 'CUSTOM_GENERATED';

            return {
                rawText: result.originalContentSummary || '', 
                detectedType: safeType,
                title: result.title || 'Analiz Edilen Etkinlik',
                description: result.description || 'Tasarım klonlandı.',
                generatedTemplate: result.blueprint || '',
                structuredData: {
                    difficulty: result.estimatedDifficulty as any || 'Orta',
                    itemCount: 10,
                    topic: result.topic || 'Genel',
                    instructions: result.blueprint || '',
                    components: [],
                    layoutHint: result.layoutHint 
                },
                baseType: safeType
            };
        } catch (error) {
            console.error("OCR Analysis Error:", error);
            throw new Error("Görsel mimarisi çözümlenemedi.");
        }
    }
};

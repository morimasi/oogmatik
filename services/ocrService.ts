
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';

export const ocrService = {
    /**
     * Görseli analiz eder ve "Pedagojik Blueprint" (DNA) çıkarır.
     */
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const prompt = `
        [GÖREV: EĞİTİM MATERYALİ DNA ANALİZİ]
        Görüntüdeki materyalin yapısını, amacını ve içindeki bilgileri çöz. 
        
        ANALİZ KRİTERLERİ:
        1. Bu materyalin ana türü nedir? (Sayısal, Sözel, Görsel Dikkat vb.)
        2. Materyal hangi mantıkla çalışıyor? (Örn: Eşleştirme, Sıralama, Boşluk Doldurma)
        3. Blueprint: Bu materyalin bir "Yapay Zeka" tarafından benzerinin üretilmesi için gerekli EN DETAYLI teknik talimat setini yaz.
        
        DİKKAT: Sadece blueprint odaklı teknik veri döndür.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                blueprint: { type: Type.STRING, description: "Detailed AI generation instructions" },
                elements: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING },
                            content: { type: Type.STRING }
                        }
                    }
                }
            },
            required: ['detectedType', 'title', 'blueprint']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema);
            
            return {
                rawText: result.description,
                detectedType: result.detectedType,
                title: result.title,
                description: result.description,
                generatedTemplate: result.blueprint, // Bu artık üretim motoru için girdi olacak
                structuredData: result,
                baseType: 'OCR_CONTENT'
            };
        } catch (error) {
            console.error("Deep OCR Error Core:", error);
            throw error;
        }
    }
};

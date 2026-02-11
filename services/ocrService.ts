
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';

export const ocrService = {
    /**
     * processImage: Görselden mimari şema çıkarır.
     */
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const prompt = `
        [MİMARİ KLONLAMA MOTORU]
        Bu çalışma sayfasını analiz et ve 'BLUEPRINT' yapısını çıkar.
        
        SADECE metni okuma; şu yapıları tespit et:
        - logic_card (Mantık soruları)
        - grid (Izgaralar)
        - table (Tablolar)
        - dual_column (Eşleştirme)
        
        Amacımız: Bu düzenin (layout) aynısını kullanarak, içindeki verileri (sayıları/kelimeleri) değiştirmektir.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                detectedType: { type: Type.STRING },
                description: { type: Type.STRING },
                worksheetBlueprint: { type: Type.STRING, description: "Teknik mimari açıklama" },
                structuredData: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        detectedType: { type: Type.STRING },
                        worksheetBlueprint: { type: Type.STRING }
                    }
                }
            },
            required: ['title', 'worksheetBlueprint']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-3-pro-preview');
            
            return {
                rawText: result.description || result.worksheetBlueprint,
                detectedType: result.detectedType || 'Custom Activity',
                title: result.title,
                description: result.description || '',
                generatedTemplate: result.worksheetBlueprint,
                structuredData: {
                    ...result,
                    // God Mode: Blueprint'i doğrudan prompt olarak kullanıma hazırla
                    worksheetBlueprint: `Bu tasarımı klonla: ${result.worksheetBlueprint}`
                },
                baseType: 'OCR_CONTENT'
            };
        } catch (error) {
            console.error("Deep OCR Error:", error);
            throw error;
        }
    }
};

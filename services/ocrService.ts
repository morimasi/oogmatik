
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const prompt = `
        [MİMARİ KLONLAMA MOTORU - GOD MODE]
        Bu çalışma sayfasını derinlemesine analiz et ve 'BLUEPRINT_V1.0' formatında mimari DNA'sını çıkar.
        
        SADECE metni okuma; şu mimari katmanları çöz:
        - ROOT_CONTAINER (Layout tipi)
        - LOGIC_MODULES (Soru bloklarının teknik yapısı)
        - DATA_TABLE (Blok içindeki sayı/kelime dizilimleri)
        - SOLUTION_LOGIC (Cevaba nasıl gidiliyor?)
        - FOOTER_VALIDATION (Kontrol mekanizması)
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                detectedType: { type: Type.STRING },
                worksheetBlueprint: { type: Type.STRING, description: "BLUEPRINT_V1.0 formatında teknik mimari DNA" }
            },
            required: ['title', 'worksheetBlueprint']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-3-pro-preview');
            
            return {
                rawText: result.worksheetBlueprint,
                detectedType: result.detectedType || 'ARCH_CLONE',
                title: result.title,
                description: "Mimari DNA başarıyla analiz edildi. Klonlama için hazır.",
                generatedTemplate: result.worksheetBlueprint,
                structuredData: result,
                baseType: 'OCR_CONTENT'
            };
        } catch (error) {
            console.error("Deep Arch Analysis Error:", error);
            throw error;
        }
    }
};

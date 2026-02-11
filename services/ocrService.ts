
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const prompt = `
        [MİMARİ KLONLAMA MOTORU - GEMINI 3 FLASH THINKING]
        Bu çalışma sayfasını derinlemesine analiz et ve 'BLUEPRINT_V1.0' formatında mimari DNA'sını çıkar.
        
        ANALİZ PROTOKOLÜ (Thinking):
        1. ROOT_CONTAINER: Sayfa genel yerleşimi.
        2. LOGIC_MODULES: Soru bloklarının teknik yapısı.
        3. SOLUTION_LOGIC: Cevaba giden mantıksal yol.
        
        SADECE metni okuma; sayfa hiyerarşisini çöz.
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
            // geminiClient zaten MASTER_MODEL (Flash) kullanacak şekilde güncellendi
            const result = await analyzeImage(base64Image, prompt, schema);
            
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

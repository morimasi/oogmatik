
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';

export const ocrService = {
    processImage: async (base64Image: string, targetType: 'CONVERTER' | 'ALGORITHM'): Promise<OCRResult> => {
        const prompt = `
        [GÖREV: EĞİTİM MATERYALİ DNA ANALİZİ]
        Görüntüdeki materyalin pedagojik mantığını ve görsel hiyerarşisini çöz. 
        
        KULLANIM AMACI: ${targetType === 'ALGORITHM' ? 'Bu materyal bir mantıksal sıralama algoritmasına dönüştürülecek.' : 'Bu materyal bir çalışma sayfasına dönüştürülecek.'}

        TALİMATLAR:
        1. 'blueprint' alanı: Bu materyalin aynısını (veya varyasyonunu) üretmek için bir yapay zekaya verilecek EN DETAYLI teknik yönergeyi yaz.
        2. 'detectedType': Materyalin ana türünü belirle (Örn: Sözel Mantık, Görsel Dikkat, Matematik).
        3. 'baseType': ${targetType === 'ALGORITHM' ? 'ALGORITHM_GENERATOR' : 'AI_WORKSHEET_CONVERTER'}.
        
        KESİN KURAL: SADECE JSON. Açıklama yapma.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                blueprint: { type: Type.STRING },
                layoutJSON: {
                    type: Type.OBJECT,
                    properties: {
                        structure: { type: Type.STRING },
                        hasVisuals: { type: Type.BOOLEAN },
                        complexity: { type: Type.STRING }
                    }
                },
                baseType: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'blueprint', 'layoutJSON']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema);
            
            return {
                rawText: '', 
                detectedType: result.detectedType,
                title: result.title,
                description: result.description,
                generatedTemplate: result.blueprint,
                structuredData: {
                    layoutHint: result.layoutJSON,
                    originalBlueprint: result.blueprint
                },
                baseType: targetType === 'ALGORITHM' ? 'ALGORITHM_GENERATOR' : (result.baseType || 'AI_WORKSHEET_CONVERTER')
            };
        } catch (error) {
            console.error("Deep OCR Error Core:", error);
            throw error;
        }
    }
};

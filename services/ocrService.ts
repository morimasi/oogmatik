
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';

export const ocrService = {
    /**
     * MATERYAL KLONLAMA VE DİJİTAL İKİZ ÜRETİMİ
     * Modelin görseli analiz ederken "sohbet" etmesini engelleyen sıkılaştırılmış prompt.
     */
    processImage: async (base64Image: string, targetType: 'CONVERTER' | 'ALGORITHM'): Promise<OCRResult> => {
        const prompt = `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ MİMARI]
        GÖREV: Görüntüdeki çalışma sayfasının mimarisini çöz ve dijital bir blueprint oluştur.
        
        KESİN KURALLAR:
        1. Sadece belirtilen JSON şemasında yanıt ver.
        2. Görsel kalitesi düşükse veya metin okunmuyorsa bile ASLA açıklama yapma, 'title' alanına "Analiz Edilemedi" yazarak şemayı doldur.
        3. 'blueprint' alanı, bu sayfanın aynısını (farklı verilerle) üretmek için başka bir AI modeline verilecek teknik talimatları içermelidir.
        
        ÇIKTI FORMATI:
        {
            "detectedType": "Bileşen Tipi",
            "title": "Sayfa Başlığı",
            "description": "Pedagojik Amaç",
            "blueprint": "Teknik üretim algoritması...",
            "layoutJSON": {
                "structure": "grid | columns | random",
                "blocks": [
                    { "id": "b1", "type": "header", "relativeY": 0, "height": 10 }
                ]
            },
            "baseType": "ACTIVITY_ID"
        }
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
                        blocks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    type: { type: Type.STRING },
                                    relativeY: { type: Type.NUMBER },
                                    height: { type: Type.NUMBER },
                                    cols: { type: Type.NUMBER, nullable: true }
                                }
                            }
                        }
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
                baseType: result.baseType || 'AI_WORKSHEET_CONVERTER'
            };
        } catch (error) {
            console.error("Deep OCR Error Core:", error);
            throw error;
        }
    },

    /**
     * HARİTA ANALİZ MOTORU
     */
    analyzeMapImage: async (base64Image: string): Promise<any> => {
        const prompt = `
        Görseldeki harita üzerindeki önemli noktaları koordinatlarıyla çıkar. 
        Sadece JSON döndür.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                mapContext: { type: Type.STRING },
                points: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            name: { type: Type.STRING },
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER },
                            isTarget: { type: Type.BOOLEAN }
                        }
                    }
                }
            }
        };

        return await analyzeImage(base64Image, prompt, schema);
    }
};

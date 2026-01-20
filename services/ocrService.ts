
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    /**
     * MATERYAL KLONLAMA VE DİJİTAL İKİZ ÜRETİMİ
     * Gelişmiş Mod: Sayfanın hem mantığını hem de görsel iskeletini (Visual Tree) çıkarır.
     */
    processImage: async (base64Image: string, targetType: 'CONVERTER' | 'ALGORITHM'): Promise<OCRResult> => {
        const prompt = `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ MİMARI & BİLGİSAYARLI GÖRÜ UZMANI]
        GÖREV: Görüntüdeki çalışma sayfasının hem PEDAGOJİK hem de GÖRSEL DNA'SINI analiz et.
        
        ANALİZ KRİTERLERİ:
        1. **Görsel İskelet (Visual Tree):** Sayfadaki her bir bilgi bloğunun (başlık, soru, görsel, tablo) koordinatlarını ve kapladığı alanı (%) belirle.
        2. **Mantıksal Akış:** Öğrenciden istenen eylemin (eşleştirme, yazma, boyama) bilişsel haritasını çıkar.
        3. **Veri Karakteristiği:** Sorulardaki sayısal veya sözel verilerin zorluk ve stilini analiz et.
        
        ÇIKTI FORMATI (SADECE JSON):
        {
            "detectedType": "En yakın ActivityType",
            "title": "Orijinal Başlık",
            "description": "Pedagojik Amaç",
            "blueprint": "AI ÜRETİM KOMUTU: [Düzene ve mantığa sadık kalarak tamamen yeni verilerle içerik üretme talimatı]",
            "layoutJSON": {
                "structure": "grid | columns | random",
                "blocks": [
                    { "id": "b1", "type": "header", "relativeY": 0, "height": 10 },
                    { "id": "b2", "type": "question-group", "relativeY": 15, "height": 60, "cols": 2 }
                ]
            },
            "styleDNA": {
                "fontWeight": "bold | normal",
                "density": "high | medium | low",
                "borderStyle": "dashed | solid"
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
                styleDNA: {
                    type: Type.OBJECT,
                    properties: {
                        fontWeight: { type: Type.STRING },
                        density: { type: Type.STRING },
                        borderStyle: { type: Type.STRING }
                    }
                },
                baseType: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'blueprint', 'layoutJSON']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-3-flash-preview');
            
            return {
                rawText: '', 
                detectedType: result.baseType || 'AI_WORKSHEET_CONVERTER',
                title: result.title,
                description: result.description,
                generatedTemplate: result.blueprint,
                structuredData: {
                    layoutHint: result.layoutJSON,
                    styleDNA: result.styleDNA,
                    originalBlueprint: result.blueprint
                },
                baseType: result.baseType || 'AI_WORKSHEET_CONVERTER'
            };
        } catch (error) {
            console.error("Deep OCR Error:", error);
            throw new Error("Görsel mimarisi çözümlenemedi.");
        }
    },

    /**
     * HARİTA ANALİZ MOTORU
     * Özel bir harita görselini analiz eder ve yönerge üretimi için veriye dönüştürür.
     */
    analyzeMapImage: async (base64Image: string): Promise<any> => {
        const prompt = `
        [GÖREV: MULTIMODAL HARİTA ANALİZİ]
        Ekteki harita görselini analiz et ve yönerge takibi için içindeki önemli nesneleri/noktaları belirle.
        1. Görülen tüm metinleri ve etiketleri (şehir adları, duraklar, nesneler) çıkar.
        2. Görsel üzerinde 0-1000 arası x ve 0-500 arası y koordinat sistemine göre bu noktaların konumlarını tahmin et.
        3. Haritanın bağlamını belirle (Şehir haritası, oda planı, oyun haritası vb.).
        
        JSON Formatında Yanıt Ver:
        {
            "mapContext": "...",
            "points": [
                { "id": "p1", "name": "...", "x": number, "y": number, "isTarget": boolean }
            ]
        }
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

        return await analyzeImage(base64Image, prompt, schema, 'gemini-3-flash-preview');
    }
};

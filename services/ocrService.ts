
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';

export const ocrService = {
    /**
     * Görseli analiz eder ve "Vektörel Mimari Blueprint" çıkarır.
     * Bu aşamada sadece veriyi değil, görselin "MİMARİ DNA"sını yakalarız.
     */
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const prompt = `
        [GÖREV: VEKTÖREL MİMARİ ANALİZ - KLONLAMA MODU]
        Bu görseli bir grafik tasarımcı ve yazılım mimarı gözüyle analiz et. 
        Amacımız bu kağıdın BİREBİR AYNI DÜZENİNİ (Layout) dijital olarak inşa etmek.

        ANALİZ TALİMATLARI:
        1. Blok Tespiti: Görseldeki her ana bölümü (Header, Table, Grid, Text Area) 'blocks' dizisine ekle.
        2. Vektörel Veri: Tablo varsa 'cols' ve 'rows' değerlerini, içindeki metinleri 'cells' dizisine KESİN olarak yaz.
        3. Stil Yakalama: Metinlerin hizalamasını (textAlign) ve ağırlığını (fontWeight) tespit et.
        4. Algoritma Çıkarımı: Bu çalışmanın mantığını 'algorithmBlueprint' alanında açıkla.

        KRİTİK: 'layoutArchitecture' altındaki 'blocks' yapısı Frontend'in 'BlockRenderer' bileşeniyle %100 uyumlu olmalıdır.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                worksheetBlueprint: { type: Type.STRING, description: "Görselin mimari yapısını anlatan teknik JSON şablonu" },
                algorithmBlueprint: { type: Type.STRING, description: "Çözüm mantığı" },
                layoutArchitecture: {
                    type: Type.OBJECT,
                    properties: {
                        blocks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['header', 'text', 'grid', 'table', 'svg_shape', 'dual_column', 'image'] },
                                    content: { 
                                        type: Type.OBJECT,
                                        properties: {
                                            text: { type: Type.STRING },
                                            cols: { type: Type.INTEGER },
                                            rows: { type: Type.INTEGER },
                                            cells: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            headers: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            data: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } },
                                            left: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            right: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            prompt: { type: Type.STRING },
                                            viewBox: { type: Type.STRING },
                                            paths: { type: Type.ARRAY, items: { type: Type.STRING } }
                                        }
                                    },
                                    style: {
                                        type: Type.OBJECT,
                                        properties: {
                                            textAlign: { type: Type.STRING },
                                            fontWeight: { type: Type.STRING },
                                            fontSize: { type: Type.INTEGER }
                                        }
                                    },
                                    weight: { type: Type.INTEGER }
                                },
                                required: ['type', 'content']
                            }
                        }
                    },
                    required: ['blocks']
                }
            },
            required: ['detectedType', 'title', 'layoutArchitecture', 'worksheetBlueprint', 'algorithmBlueprint']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema);
            return {
                rawText: result.description,
                detectedType: result.detectedType,
                title: result.title,
                description: result.description,
                generatedTemplate: JSON.stringify(result.layoutArchitecture),
                structuredData: result,
                baseType: 'OCR_CONTENT'
            };
        } catch (error) {
            console.error("Architectural OCR Error:", error);
            throw error;
        }
    }
};

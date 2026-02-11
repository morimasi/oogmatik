
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
        [GÖREV: MİMARİ ANALİZ - PEDAGOJİK DİJİTALLEŞTİRME]
        Görüntüdeki materyali bir grafik tasarımcı ve özel eğitim uzmanı gözüyle teknik olarak parçala.
        
        ANALİZ KRİTERLERİ:
        1. Blok Tipi Tespit Et: (header, text, grid, table, dual_column, svg_shape)
        2. Görsel Hiyerarşi: Başlık nerede? Sorular nasıl dizilmiş? 
        3. Matematiksel Yapı: Eğer bir tablo veya grid varsa, satır/sütun sayısını KESİN olarak belirle.
        
        ÖNEMLİ: Çıktıdaki 'blocks' dizisi, frontend'in 'BlockRenderer' bileşeniyle tam uyumlu olmalıdır.
        İçerikleri 'content' objesi içinde, tipleri 'type' stringi olarak döndür.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                worksheetBlueprint: { 
                    type: Type.STRING, 
                    description: "Bu görselin teknik mimarisini anlatan, yeni üretim için kullanılacak detaylı JSON iskeleti açıklaması." 
                },
                algorithmBlueprint: {
                    type: Type.STRING,
                    description: "Bu çalışmanın mantığını anlatan adım adım çözüm yolu açıklaması."
                },
                layoutArchitecture: {
                    type: Type.OBJECT,
                    properties: {
                        blocks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['header', 'text', 'grid', 'table', 'svg_shape', 'dual_column'] },
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
                                            paths: { type: Type.ARRAY, items: { type: Type.STRING } }
                                        }
                                    },
                                    weight: { type: Type.INTEGER }
                                },
                                required: ['type', 'content']
                            }
                        }
                    }
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
                generatedTemplate: result.worksheetBlueprint,
                structuredData: result,
                baseType: 'OCR_CONTENT'
            };
        } catch (error) {
            console.error("Advanced OCR Analysis Error:", error);
            throw error;
        }
    }
};

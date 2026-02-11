
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';

export const ocrService = {
    /**
     * Görseli analiz eder ve "Pedagojik Blueprint" (DNA) çıkarır.
     * Bu blueprint iki ayrı üretim kanalı (Çalışma Sayfası ve Algoritma) için baz oluşturur.
     */
    processImage: async (base64Image: string): Promise<OCRResult> => {
        const prompt = `
        [GÖREV: EĞİTİM MATERYALİ DNA ANALİZİ - VİZYON MOTORU]
        Görüntüdeki materyalin (Fiziksel çalışma kağıdı) yapısını, içindeki verileri ve bilişsel mekanizmayı tam isabetle çöz. 
        
        ANALİZ KRİTERLERİ:
        1. MATERYAL TİPİ: Bu bir bulmaca mı (Futoshiki, Sudoku vb.), okuma parçası mı yoksa işlem kağıdı mı?
        2. MANTIKSAL AKIŞ: Bir öğrenci bu kağıdı çözerken hangi adımları izlemeli? (Örn: Önce sembolleri tanı, sonra büyüktür/küçüktür işaretlerine bak vb.)
        
        BLUEPRINT ÜRETİMİ:
        - worksheetBlueprint: Benzer yapıda yepyeni sorular üretmek için yönerge.
        - algorithmBlueprint: Bu bulmacanın ÇÖZÜM SÜRECİNİ veya içindeki KONUYU bir akış şemasına (Flowchart) dönüştürmek için gereken mantıksal basamaklar.
        
        DİKKAT: Futoshiki gibi oyunlarda 'algorithmBlueprint' mutlaka eşitsizlik işaretlerinin ve sayı yerleştirme kurallarının çözüm adımlarını içermelidir.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING, description: "Örn: Futoshiki, Görsel Dikkat vb." },
                title: { type: Type.STRING, description: "Görselden çıkarılan başlık" },
                description: { type: Type.STRING, description: "Materyalin eğitsel hedefi" },
                worksheetBlueprint: { type: Type.STRING, description: "İçerik üretimi için teknik talimatlar" },
                algorithmBlueprint: { type: Type.STRING, description: "Mantıksal algoritma üretimi için çözüm basamakları yönergesi" },
                baseType: { type: Type.STRING, description: "OCR_CONTENT" }
            },
            required: ['detectedType', 'title', 'worksheetBlueprint', 'algorithmBlueprint']
        };

        try {
            // Gemini 3'ün derin analiz gücünü (4000 token thinking) kullanarak görseli okuyoruz.
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
            console.error("Deep Vision OCR Error:", error);
            throw error;
        }
    }
};

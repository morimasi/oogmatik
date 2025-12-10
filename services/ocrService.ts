
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        // List valid Activity IDs to guide the AI
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = `
        [ROL: EĞİTİM MATERYALİ TERSİNE MÜHENDİSİ]
        
        GÖREV: Kullanıcının yüklediği görseli analiz et ve bu etkinliğin **ALGORİTMASINI** çıkar.
        Amacımız: Bu görselin mantığını kopyalayarak, farklı verilerle sonsuz sayıda benzer etkinlik üretebilmek.

        ANALİZ ADIMLARI:
        1. **Görsel Ayrıştırma:** Sayfada ne var? (Tablo, liste, eşleştirme, boşluk doldurma, görsel bulmaca).
        2. **Mantık Çözümleme:** Sorular nasıl oluşturulmuş? 
           - Örn: "Sol taraftaki sayı ile sağdaki nesne sayısı eşleşiyor."
           - Örn: "Her satırda 3 elma var, 1 tanesi farklı renkte."
        3. **Zorluk Seviyesi:** Hedef kitle kim? (Okul öncesi, İlkokul, Özel Eğitim).

        4. **MASTER PROMPT OLUŞTURMA (generatedTemplate):**
           Bu alan, bir "Algoritma Tanımı" olmalıdır. Başka bir yapay zekaya verildiğinde, orijinal görseli görmeden aynı tarzda içerik üretebilmelidir.
           Şunları içermelidir:
           - **KONU:** Etkinliğin teması.
           - **KURAL SETİ:** Soruların nasıl oluşturulacağı (Matematiksel veya Sözel kural).
           - **GÖRSEL İSTEMİ (ImagePrompt):** Kullanılacak görsellerin stili (Flat vector, black & white outline vb.).
           - **FORMAT:** JSON çıktısının nasıl olması gerektiği.

        ÇIKTI FORMATI (JSON):
        {
            "detectedType": "Mevcut ActivityType listesinden en yakını veya 'CUSTOM_GENERATED'",
            "title": "Görselden Algılanan Başlık",
            "description": "Etkinliğin kısa mantıksal açıklaması",
            "estimatedDifficulty": "Başlangıç" | "Orta" | "Zor" | "Uzman",
            "estimatedItemCount": Sayı (Görseldeki soru adedi),
            "topic": "Algılanan Konu",
            "generatedTemplate": "Detaylı, teknik ve kural tabanlı üretim komutu (Prompt)."
        }
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                estimatedDifficulty: { type: Type.STRING, enum: ['Başlangıç', 'Orta', 'Zor', 'Uzman'] },
                estimatedItemCount: { type: Type.INTEGER },
                topic: { type: Type.STRING },
                generatedTemplate: { type: Type.STRING, description: "Etkinliğin mantığını ve algoritmasını içeren detaylı prompt." }
            },
            required: ['detectedType', 'title', 'description', 'estimatedDifficulty', 'generatedTemplate']
        };

        const result = await analyzeImage(base64Image, prompt, schema);
        
        return {
            rawText: '', 
            detectedType: result.detectedType,
            title: result.title,
            description: result.description,
            generatedTemplate: result.generatedTemplate,
            structuredData: {
                difficulty: result.estimatedDifficulty,
                itemCount: result.estimatedItemCount || 10,
                topic: result.topic || 'Genel',
                instructions: result.generatedTemplate // Use the rich template as instructions
            },
            baseType: result.detectedType
        };
    },

    convertToWorksheetData: (ocrData: OCRResult): { type: ActivityType, data: any[] } => {
        return { type: ocrData.baseType as ActivityType, data: [] };
    }
};

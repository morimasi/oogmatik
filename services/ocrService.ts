
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        // List valid Activity IDs to guide the AI
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = `
        [ROL: KIDEMLİ EĞİTİM TEKNOLOJİLERİ VE PROMPT MÜHENDİSİ]
        
        GÖREV: Yüklenen görseldeki çalışma kağıdını "Tersine Mühendislik" (Reverse Engineering) yöntemiyle analiz et.
        Amacımız: Bu görselin **BİREBİR AYNISINI** (mantık, zorluk, stil ve yapı olarak) üretebilecek, yapay zekaya verilecek **DETAYLI BİR KOMUT (PROMPT)** oluşturmaktır.
        
        ADIM 1: DERİNLEMESİNE ANALİZ
        - İçerik Türü: Matematik mi? Dil bilgisi mi? Dikkat mi?
        - Soru Yapısı: Çoktan seçmeli mi? Boşluk doldurma mı? Eşleştirme mi?
        - Zorluk Seviyesi: Sayı aralıkları ne? Kelime uzunlukları ne?
        - Görsel Stil: İkonlar var mı? Varsa ne tarz? (Flat, outline, renkli?)
        - Pedagojik Hedef: Bu kağıt neyi ölçüyor?

        ADIM 2: EŞLEŞTİRME
        Görseli şu listedeki en uygun 'ActivityType' ID'sine eşle: [${validIds}].
        (Eğer tam uyan yoksa en yakınını seç).

        ADIM 3: ZENGİN PROMPT OLUŞTURMA (generatedTemplate)
        Görseldeki etkinliği yeniden üretecek "Master Prompt"u yaz.
        - Örnek (Kötü): "Matematik sorusu üret."
        - Örnek (İyi - Beklenen): "2. Sınıf seviyesinde, 1-50 arası sayılarla toplama işlemi üret. Sayılar alt alta yazılsın. Her işlemin yanında, sayı adedi kadar 'Elma' ikonu olsun. Sonuç kısmı boş bırakılsın. Sayfa başlığı 'Elmalarla Toplama' olsun."

        ÇIKTI FORMATI (JSON):
        {
            "detectedType": "ActivityType ID'si",
            "title": "Görselden Algılanan Başlık",
            "description": "Kullanıcı için kısa açıklama (örn: Görsel destekli toplama işlemi)",
            "estimatedDifficulty": "Başlangıç" | "Orta" | "Zor" | "Uzman",
            "estimatedItemCount": Sayı (Tahmini soru adedi),
            "topic": "Konu (örn: Uzay, Meyveler)",
            "generatedTemplate": "Buraya ADIM 3'teki detaylı, zengin ve teknik promptu yaz."
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
                generatedTemplate: { type: Type.STRING, description: "Görselin mantığını kopyalayan detaylı AI komutu." }
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

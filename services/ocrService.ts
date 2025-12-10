
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        // List valid Activity IDs to guide the AI
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ ANALİSTİ]
        
        GÖREV: Yüklenen görseldeki çalışma kağıdını analiz et ve sistemdeki EN UYGUN aktivite türüne eşle.
        Amacımız, bu kağıdın mantığını (logic) kopyalayıp, aynı yapıda yeni içerikler üretebilmek.
        
        ADIM 1: GÖRSEL ANALİZİ
        - Görseldeki aktivite ne? (Örn: Toplama işlemi, Kelime Bulmaca, Okuma Parçası, Eşleştirme).
        - Zorluk seviyesi ne? (Başlangıç, Orta, Zor).
        - İçerik konusu ne? (Matematik, Türkçe, Dikkat).

        ADIM 2: TÜR EŞLEŞTİRME (ÇOK ÖNEMLİ)
        Görseli şu listedeki en uygun 'ActivityType' ID'sine eşle:
        [${validIds}]
        
        Eğer görsel Matematik işlemi içeriyorsa -> 'BASIC_OPERATIONS' seç.
        Eğer metin okuma ve soru varsa -> 'STORY_COMPREHENSION' seç.
        Eğer kelime bulmaca ise -> 'WORD_SEARCH' seç.
        Eğer eşleştirme ise -> 'WORD_CONNECT' seç.
        Eğer şekil/desen kopyalama ise -> 'GRID_DRAWING' seç.
        
        Eğer tam uyan yoksa, en yakın olanı seç ve 'customInstructions' alanına farkları not et.

        ADIM 3: PARAMETRE TAHMİNİ
        Bu aktiviteyi yeniden üretmek için gereken varsayılan parametreleri tahmin et.

        ÇIKTI FORMATI (JSON):
        {
            "detectedType": "ActivityType ID'si (Örn: BASIC_OPERATIONS)",
            "title": "Önerilen Başlık (Örn: 2. Sınıf Toplama Alıştırması)",
            "description": "Görselin pedagojik analizi ve mantığı.",
            "estimatedDifficulty": "Başlangıç" | "Orta" | "Zor",
            "estimatedItemCount": "Tahmini soru/öğe sayısı (Number)",
            "topic": "Algılanan konu (Örn: Uzay, Sayılar, Hayvanlar)",
            "customInstructions": "Eğer standart tipten farkı varsa, AI'ya verilecek ek talimat."
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
                customInstructions: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'description', 'estimatedDifficulty']
        };

        const result = await analyzeImage(base64Image, prompt, schema);
        
        return {
            rawText: '', 
            detectedType: result.detectedType,
            title: result.title,
            description: result.description,
            // We map these to helper props for the UI
            structuredData: {
                difficulty: result.estimatedDifficulty,
                itemCount: result.estimatedItemCount || 10,
                topic: result.topic || 'Genel',
                instructions: result.customInstructions
            },
            baseType: result.detectedType
        };
    },

    // Not used in new flow but kept for compatibility
    convertToWorksheetData: (ocrData: OCRResult): { type: ActivityType, data: any[] } => {
        return { type: ocrData.baseType as ActivityType, data: [] };
    }
};

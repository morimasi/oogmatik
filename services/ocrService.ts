
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    /**
     * Specialized multimodal analysis for converting physical activities into digital blueprints.
     */
    processImage: async (base64Image: string, targetType?: 'CONVERTER' | 'ALGORITHM'): Promise<OCRResult> => {
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = targetType === 'ALGORITHM' ? `
        [ROL: KIDEMLİ ALGORİTMA ve MANTIK TASARIMCISI]
        GÖREV: Görüntüdeki etkinliğin MANTIKSAL AKIŞINI (Algoritmasını) çıkar. 
        
        ANALİZ KRİTERLERİ:
        1. **Adım Adım Yapı:** Başlangıçtan bitişe giden mantıksal adımları belirle.
        2. **Karar Mekanizmaları:** Eğer görselde bir yol ayırımı, evet/hayır durumu veya koşul varsa bunu 'decision' adımı olarak işaretle.
        3. **Giriş/Çıkış:** Kullanıcının girmesi gereken verileri (input) ve elde edilen sonucu (output) belirle.
        4. **Algoritma Özeti:** Bu mantığı 'Algorithm Generator' modülünde çalışacak teknik bir talimata dönüştür.
        
        ÇIKTI (Kesinlikle JSON):
        {
            "detectedType": "ALGORITHM_GENERATOR",
            "title": "Analiz Edilen Algoritma",
            "description": "Görselden çıkarılan mantıksal akış şeması.",
            "blueprint": "AKIŞ TALİMATI: [ADIMLAR] + [KARARLAR]. Her adım net ve sıralı olmalı."
        }
        ` : `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ MİMARI]
        GÖREV: Görüntüdeki etkinliğin MİMARİ PLANINI (Blueprint) çıkar. 
        
        KRİTİK KURALLAR:
        1. **Döngü Yasaktır:** Soruları veya içerikleri tek tek yazma. Yapıyı ve kuralı tarif et. 
        2. **Birebir Klonlama:** Orijinal sayfadaki tablo sütun sayısını, grid yapısını ve görsel yerleşimlerini (sol/sağ/üst) teknik olarak belirt.
        3. **Algoritma Çıkarımı:** Etkinliğin çözüm mantığını (eşleştirme mi, hesaplama mı, boyama mı) teknik bir dille özetle.
        
        ÇIKTI (Kesinlikle JSON):
        {
            "detectedType": "ActivityType",
            "title": "Ana Başlık",
            "description": "Kısa özet",
            "layoutHint": {
                "containerType": "grid | list",
                "gridCols": 1,
                "hasImages": true
            },
            "blueprint": "TEKNİK ÖZET: [YAPI] + [SORU TİPİ] + [GÖRSEL KONUMU]. Örn: 3x4 tablo yapısı, hücrelerde meyve isimleri, her satır sonunda boyama alanı."
        }
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                layoutHint: {
                    type: Type.OBJECT,
                    properties: {
                        containerType: { type: Type.STRING },
                        gridCols: { type: Type.NUMBER },
                        hasImages: { type: Type.BOOLEAN }
                    }
                },
                blueprint: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'blueprint']
        };

        try {
            // Model specifically pinned to gemini-3-flash-preview as per professor's instruction
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-3-flash-preview');
            
            let safeType = result.detectedType;
            if (targetType === 'ALGORITHM') safeType = 'ALGORITHM_GENERATOR';
            else if (!validIds.includes(safeType) && safeType !== 'CUSTOM_GENERATED') safeType = 'AI_WORKSHEET_CONVERTER';

            return {
                rawText: '', 
                detectedType: safeType,
                title: result.title || 'Analiz Edilen Etkinlik',
                description: result.description || 'Tasarım klonlandı.',
                generatedTemplate: result.blueprint || '',
                structuredData: {
                    difficulty: 'Orta',
                    itemCount: 10,
                    topic: 'Genel',
                    instructions: result.blueprint || '',
                    components: [],
                    layoutHint: result.layoutHint 
                },
                baseType: safeType
            };
        } catch (error) {
            console.error("OCR Analysis Error:", error);
            throw new Error("Görsel mimarisi çözümlenemedi. Lütfen daha net bir görsel yükleyin.");
        }
    }
};

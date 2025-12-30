
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    /**
     * Specialized multimodal analysis for converting physical activities into digital blueprints.
     * Pinned to gemini-3-flash-preview as per strict instruction.
     */
    processImage: async (base64Image: string, targetType: 'CONVERTER' | 'ALGORITHM'): Promise<OCRResult> => {
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = targetType === 'ALGORITHM' ? `
        [ROL: KIDEMLİ ALGORİTMA TASARIMCISI & ÖZEL EĞİTİM PROFESÖRÜ]
        GÖREV: Görüntüdeki etkinliğin MANTIKSAL AKIŞINI (Algoritmasını) analiz et. 
        
        ANALİZ KRİTERLERİ:
        1. **Adım Adım Yapı:** Başlangıçtan bitişe giden mantıksal adımları ("Başla", "İşlem", "Karar", "Giriş/Çıkış", "Bitiş") belirle.
        2. **Karar Mekanizmaları:** Eğer görselde bir yol ayırımı, evet/hayır durumu veya koşul varsa bunu 'decision' adımı olarak işaretle.
        3. **İçerik Klonlama:** Orijinaldeki konuyu koru ama adımları modern, disleksi dostu bir dille yeniden yaz.
        
        ÇIKTI (Kesinlikle JSON):
        {
            "detectedType": "ALGORITHM_GENERATOR",
            "title": "Görselden Üretilen Algoritma",
            "description": "Görseldeki mantıksal akışın dijital analizi.",
            "blueprint": "AKIŞ TALİMATI: [ADIMLAR] + [KARARLAR]. Her adım net ve sıralı olmalı. Çocukların anlayabileceği basitlikte kurgula.",
            "layoutHint": { "type": "flowchart", "nodeCount": 6 }
        }
        ` : `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ MİMARI & ÖZEL ÖĞRENME GÜÇLÜĞÜ UZMANI]
        GÖREV: Görüntüdeki çalışma sayfasının MİMARİ PLANINI (Blueprint) çıkar. 
        
        MİMARİ ANALİZ KURALLARI:
        1. **Yapısal Sadakat:** Orijinal sayfadaki tablo sütun sayısını, grid yapısını ve görsel yerleşimlerini (sol/sağ/üst) teknik olarak belirle.
        2. **Mantık Klonlama:** Sayfadaki soruların çözüm mantığını (eşleştirme mi, hesaplama mı, boyama mı) teknik bir dille özetle.
        3. **Döngü Yasaktır:** Soruları veya içerikleri tek tek kopyalama. Yapıyı ve kuralı tarif et. 
        
        ÇIKTI (Kesinlikle JSON):
        {
            "detectedType": "ActivityType",
            "title": "Kağıttan Dönüştürülen Etkinlik",
            "description": "Fiziksel materyalden AI ile üretilen yeni form.",
            "layoutHint": {
                "containerType": "grid | list | table",
                "gridCols": 1,
                "hasImages": true
            },
            "blueprint": "TEKNİK ÖZET: [YAPI] + [SORU TİPİ] + [GÖRSEL KONUMU]. Örn: 3x4 tablo yapısı, hücrelerde nesne isimleri, her satır sonunda cevap kutusu."
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
                        hasImages: { type: Type.BOOLEAN },
                        nodeCount: { type: Type.NUMBER }
                    }
                },
                blueprint: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'blueprint']
        };

        try {
            // Force use of gemini-3-flash-preview as instructed
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-3-flash-preview');
            
            let safeType = result.detectedType;
            if (targetType === 'ALGORITHM') safeType = 'ALGORITHM_GENERATOR';
            else if (!validIds.includes(safeType) && safeType !== 'CUSTOM_GENERATED') safeType = 'AI_WORKSHEET_CONVERTER';

            return {
                rawText: '', 
                detectedType: safeType,
                title: result.title || 'Analiz Edilen Materyal',
                description: result.description || 'AI ile yeniden yapılandırıldı.',
                generatedTemplate: result.blueprint || '',
                structuredData: {
                    difficulty: 'Orta',
                    itemCount: 10,
                    topic: 'Görsel Analiz',
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

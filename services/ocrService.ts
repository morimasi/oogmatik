
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    /**
     * Specialized multimodal analysis for converting physical activities into digital blueprints.
     * Uses vision to identify grid structures, question patterns, and visual components.
     */
    processImage: async (base64Image: string, targetType: 'CONVERTER' | 'ALGORITHM'): Promise<OCRResult> => {
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = targetType === 'ALGORITHM' ? `
        [ROL: KIDEMLİ ALGORİTMA TASARIMCISI & ÖZEL EĞİTİM PROFESÖRÜ]
        GÖREV: Görüntüdeki etkinliğin MANTIKSAL AKIŞINI (Algoritmasını) analiz et. 
        
        MULTIMODAL ANALİZ KRİTERLERİ:
        1. **Adım Adım Yapı:** Başlangıçtan bitişe giden mantıksal adımları ("Başla", "İşlem", "Karar", "Giriş/Çıkış", "Bitiş") görsel hiyerarşiye göre belirle.
        2. **Karar Mekanizmaları:** Eğer görselde bir yol ayırımı, evet/hayır durumu veya koşul varsa bunu 'decision' adımı olarak işaretle.
        3. **Varlık Klonlama:** Orijinal görseldeki "Problem Senaryosunu" (Challenge) ve terminolojiyi koru ancak adımları disleksi dostu bir dille yeniden kurgula.
        
        ÇIKTI (Kesinlikle JSON):
        {
            "detectedType": "ALGORITHM_GENERATOR",
            "title": "Görselden Analiz Edilen Akış",
            "description": "Görseldeki mantıksal akışın dijital simülasyonu.",
            "blueprint": "ALGORİTMA TALİMATI: [Orijinal görseldeki adımların mantığını burada teknik olarak tarif et]. Bu tarif, yeni bir algoritma üretmek için kullanılacaktır.",
            "layoutHint": { "type": "flowchart", "nodeCount": 6 }
        }
        ` : `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ MİMARI & ÖZEL ÖĞRENME GÜÇLÜĞÜ UZMANI]
        GÖREV: Görüntüdeki çalışma sayfasının MİMARİ PLANINI (Blueprint) çıkar ve dijital ikizini üretmek için talimat hazırla.
        
        MİMARİ ANALİZ KURALLARI:
        1. **Yapısal Sadakat:** Görseldeki tablo sütun sayısını, grid yapısını, soru-cevap kutusu yerleşimini (sol/sağ/üst) teknik olarak belirle.
        2. **Pedagojik Mantık:** Sayfadaki soruların çözüm mantığını (eşleştirme, hesaplama, labirent, boyama vb.) profesyonel bir dille özetle.
        3. **İçerik Stratejisi:** Soruları tek tek kopyalama. Bunun yerine "Şu zorlukta, şu konuda, şu mimaride sorular üret" talimatı oluştur. 
        
        ÇIKTI (Kesinlikle JSON):
        {
            "detectedType": "ActivityType",
            "title": "Dönüştürülen Materyal",
            "description": "Fiziksel materyalden AI ile türetilen interaktif form.",
            "layoutHint": {
                "containerType": "grid | list | table",
                "gridCols": 1,
                "hasImages": true
            },
            "blueprint": "MİMARİ TALİMAT: [Görseldeki yapı ve soru mantığının teknik özeti]. Örn: '4x4 grid yapısı, her hücrede bir harf, altlarında cevap çizgisi olsun.'",
            "baseType": "En yakın ActivityType eşleşmesi"
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
                blueprint: { type: Type.STRING },
                baseType: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'blueprint']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-3-flash-preview');
            
            let safeType = result.baseType || result.detectedType;
            if (targetType === 'ALGORITHM') safeType = 'ALGORITHM_GENERATOR';
            else if (!validIds.includes(safeType)) safeType = 'AI_WORKSHEET_CONVERTER';

            return {
                rawText: '', 
                detectedType: safeType,
                title: result.title || 'Analiz Edilen Materyal',
                description: result.description || 'Görsel mimarisi AI ile çözümlendi.',
                generatedTemplate: result.blueprint || '',
                structuredData: {
                    difficulty: 'Orta',
                    itemCount: 10,
                    topic: 'Görsel Analiz',
                    instructions: result.blueprint || '',
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

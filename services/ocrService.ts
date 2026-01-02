
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    /**
     * MATERYAL KLONLAMA VE DİJİTAL İKİZ ÜRETİMİ
     * Görüntüdeki etkinliğin hem görsel düzenini (layout) hem de pedagojik kurgusunu analiz eder.
     */
    processImage: async (base64Image: string, targetType: 'CONVERTER' | 'ALGORITHM'): Promise<OCRResult> => {
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = `
        [ROL: KIDEMLİ EĞİTİM MATERYALİ MİMARI & ÖZEL ÖĞRENME PROFESÖRÜ]
        GÖREV: Görüntüdeki çalışma sayfasının "PEDAGOJİK VE GÖRSEL DNA'SINI" analiz et ve bir üretim taslağı (blueprint) oluştur.
        
        ANALİZ KRİTERLERİ (DERİNLEMESİNE):
        1. **Görsel Mimari:** Sayfa düzeni nasıl? (Örn: 2 sütunlu eşleştirme, 4x4 harf matrisi, alt alta dizili sorular, görsel etrafında metinler vb.)
        2. **Mantıksal Akış:** Öğrenciden ne yapması isteniyor? (Eleme mi, toplama mı, hece ayırma mı, görsel tarama mı?)
        3. **Veri Yapısı:** Sorularda kullanılan verilerin karakteristiği nedir? (Örn: Sadece tek basamaklı sayılar, "b" ve "d" içeren kelimeler, 3 heceli sözcükler vb.)
        4. **İkiz Üretim Talimatı:** Bu etkinliğin BİREBİR AYNI DÜZENİNDE ama TAMAMEN FARKLI verilerle (yeni sorular, yeni kelimeler) üretilmesi için AI'ya teknik bir komut yaz.
        
        ÇIKTI FORMATI (SADECE JSON):
        {
            "detectedType": "En yakın ActivityType",
            "title": "Orijinal Başlık veya Tanımlayıcı İsim",
            "description": "Pedagojik amacın özeti",
            "blueprint": "AI ÜRETİM KOMUTU: [Bu bölüm çok detaylı olmalı. Sayfanın mimarisini ve soru mantığını 'Şu düzende, şu kısıtlamalarla yeni veriler üret' şeklinde tarif et.]",
            "layoutHint": {
                "structure": "grid | list | columns | matching | maze",
                "columns": number,
                "hasVisuals": boolean,
                "dataComplexity": "low | medium | high"
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
                layoutHint: {
                    type: Type.OBJECT,
                    properties: {
                        structure: { type: Type.STRING },
                        columns: { type: Type.NUMBER },
                        hasVisuals: { type: Type.BOOLEAN },
                        dataComplexity: { type: Type.STRING }
                    },
                    required: ['structure']
                },
                baseType: { type: Type.STRING }
            },
            required: ['detectedType', 'title', 'blueprint', 'layoutHint']
        };

        try {
            const result = await analyzeImage(base64Image, prompt, schema, 'gemini-3-flash-preview');
            
            return {
                rawText: '', 
                detectedType: result.baseType || 'AI_WORKSHEET_CONVERTER',
                title: result.title,
                description: result.description,
                generatedTemplate: result.blueprint, // AI artık buradaki mimari talimatı kullanacak
                structuredData: {
                    layoutHint: result.layoutHint,
                    originalBlueprint: result.blueprint
                },
                baseType: result.baseType || 'AI_WORKSHEET_CONVERTER'
            };
        } catch (error) {
            console.error("Deep OCR Error:", error);
            throw new Error("Görsel mimarisi çözümlenemedi. Lütfen daha net bir görsel kullanın.");
        }
    }
};

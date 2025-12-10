
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, BasicOperationsData, StoryData, WordConnectData, FindTheDifferenceData } from '../types';

export const ocrService = {
    processImage: async (base64Image: string): Promise<any> => {
        const prompt = `
        [ROL: UZMAN EĞİTİM MATERYALİ MİMARI - TERSİNE MÜHENDİSLİK MODU]
        
        GÖREV: Yüklenen görseldeki çalışma kağıdını "Pedagojik Mantık" seviyesinde analiz et.
        Amacımız bu kağıdın **AYNISINI DEĞİL**, bu mantıkla sınırsız sayıda **YENİ VARYASYON** üretebilecek bir yapay zeka komutu (PROMPT TEMPLATE) oluşturmak.
        
        ADIM 1: DERİN ANALİZ
        - Etkinlik Türü: Ne yaptırıyor? (Örn: Görsel eşleştirme, Sayı örüntüsü, Kelime avı).
        - Girdi/Çıktı Yapısı: Kullanıcı ne görüyor, ne yapması gerekiyor?
        - Zorluk Seviyesi: Hangi yaş grubuna uygun?
        - Görsel Stil: Vektörel mi, gerçekçi mi, soyut mu?

        ADIM 2: EŞLEŞTİRME VEYA YENİ TÜR TANIMLAMA
        Görseli sistemdeki mevcut türlerden birine (MATH, READING, MATCHING, DIFFERENCE) benzetebiliyorsan onu seç.
        Benzemiyorsa "CUSTOM" (Özel) olarak işaretle ve kendi mantığını kur.
        
        ADIM 3: TERSİNE MÜHENDİSLİK (PROMPT TEMPLATE)
        "generatedTemplate" alanı için öyle bir İngilizce/Türkçe komut yaz ki, bu komutu başka bir AI'ya verdiğimde, bana bu kağıdın mantığında ama farklı verilerle (sayılar, kelimeler değişmiş) dolu bir JSON çıktısı versin.
        Template içinde {{worksheetCount}}, {{difficulty}}, {{topic}} gibi değişken yer tutucuları kullan.

        ÇIKTI FORMATI (JSON):
        {
            "detectedType": "MATH" | "READING" | "MATCHING" | "DIFFERENCE" | "CUSTOM",
            "title": "Etkinlik Başlığı",
            "description": "Pedagojik açıklama.",
            "generatedTemplate": "AI Prompt Şablonu buraya gelecek...",
            "baseType": "Hangi render bileşeni kullanılmalı? (BASIC_OPERATIONS, STORY_COMPREHENSION, WORD_CONNECT, vb.)",
            "sampleData": { ...bir adet örnek veri JSON'ı... }
        }
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                generatedTemplate: { type: Type.STRING, description: "Reusable AI prompt template string" },
                baseType: { type: Type.STRING, description: "Existing ActivityType enum key for rendering logic" },
                sampleData: { 
                    type: Type.OBJECT, 
                    description: "Example data matching the schema of baseType",
                    properties: {}, // Allow loose object
                    nullable: true
                }
            },
            required: ['detectedType', 'title', 'description', 'generatedTemplate', 'baseType']
        };

        return await analyzeImage(base64Image, prompt, schema);
    },

    // Converts OCR raw data to immediate preview data
    convertToWorksheetData: (ocrData: any): { type: ActivityType, data: any[] } => {
        // If the AI successfully generated sample data that matches our schema, use it directly
        if (ocrData.sampleData && ocrData.baseType) {
            return {
                type: ocrData.baseType as ActivityType,
                data: [ocrData.sampleData]
            };
        }

        // Fallback: Legacy manual mapping (safety net)
        // 1. MATCHING ACTIVITY (Word Connect)
        if (ocrData.detectedType === 'MATCHING') {
            const sheetData: WordConnectData = {
                title: ocrData.title || "Eşleştirme Etkinliği",
                instruction: `İlişkili olanları çizgilerle eşleştirin.`,
                pedagogicalNote: ocrData.description,
                gridDim: 4,
                points: [
                    { word: "Örnek 1", pairId: 0, x: 0, y: 0, color: "#000" },
                    { word: "Cevap 1", pairId: 0, x: 1, y: 1, color: "#000" },
                    { word: "Örnek 2", pairId: 1, x: 0, y: 1, color: "#000" },
                    { word: "Cevap 2", pairId: 1, x: 1, y: 0, color: "#000" }
                ]
            };
            return { type: 'WORD_CONNECT' as ActivityType, data: [sheetData] };
        }

        // Default generic
        return { 
            type: 'STORY_COMPREHENSION' as ActivityType, 
            data: [{
                title: ocrData.title || "Analiz Sonucu",
                story: `Bu etkinlik özel bir yapıya sahip. Sistem bu mantığı 'Özel Aktivite' olarak kaydedebilir.\n\nAlgılanan Mantık:\n${ocrData.description}`,
                questions: [],
                instruction: "İçeriği inceleyin.",
                mainIdea: "", characters: [], setting: ""
            }] 
        };
    }
};


import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        // List valid Activity IDs to guide the AI
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = `
        [GÖREV: GÖRSEL PEDAGOJİK ANALİZ VE KLONLAMA]
        Sen, eğitim materyalleri konusunda uzmanlaşmış bir Multimodal Yapay Zekasın.
        Kullanıcının yüklediği görseli detaylıca analiz et ve bu materyalin **BİREBİR KOPYASINI** dijital ortamda yeniden oluşturmak için gereken **TÜM TALİMATLARI** çıkar.

        ADIM 1: GÖRSEL DETAYLAR
        - Kağıtta ne var? (Sayılar, nesneler, çizimler, tablolar).
        - Nesneler neye benziyor? (Örn: "Karikatür tarzı elma", "Basit çizgi film araba", "Renkli balonlar").
        
        ADIM 2: MANTIK VE ALGORİTMA
        - Sorular nasıl kurgulanmış? 
        - Örn: "Soldaki sayıyı sağdaki nesne sayısıyla eşleştirme".
        - Örn: "Yukarıdan aşağıya artan sayı örüntüsü, kural +3".
        
        ADIM 3: ZORLUK VE KAPSAM
        - Hangi sınıf seviyesi? Sayılar kaç basamaklı? Kelimeler ne kadar zor?

        ADIM 4: EŞLEŞTİRME
        Görseli şu listedeki en uygun 'ActivityType' ID'sine eşle: [${validIds}].
        
        ADIM 5: MASTER PROMPT OLUŞTURMA (generatedTemplate)
        "generatedTemplate" alanına öyle bir prompt yaz ki, bu promptu alan bir metin tabanlı yapay zeka, görseli hiç görmeden **AYNI MANTIKTA** ve **AYNI STİLDE** yeni sorular üretebilsin.
        Prompt şu detayları içermelidir:
        - KONU: Aktivitenin teması.
        - MANTIK: Soruların matematiksel veya sözel kurgusu.
        - GÖRSEL İSTEMİ (Image Prompt): Görsellerin stili ve içeriği (İngilizce).
        - FORMAT: Soruların nasıl sunulacağı.

        ÇIKTI FORMATI (JSON):
        {
            "detectedType": "ActivityType ID'si",
            "title": "Görselden Algılanan Başlık",
            "description": "Kullanıcı için kısa açıklama",
            "estimatedDifficulty": "Başlangıç" | "Orta" | "Zor" | "Uzman",
            "estimatedItemCount": Sayı (Tahmini soru adedi),
            "topic": "Konu (örn: Uzay, Meyveler)",
            "generatedTemplate": "Detaylı, zengin ve teknik üretim promptu."
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
    
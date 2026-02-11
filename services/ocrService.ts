
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
        [GÖREV: EĞİTİM MATERYALİ DNA ANALİZİ]
        Görüntüdeki materyalin yapısını, amacını ve içindeki bilişsel mekanizmayı çöz. 
        
        ANALİZ KRİTERLERİ (İKİ AYRI ÜRETİM KANALI İÇİN):
        1. KANAL (İÇERİK VARYASYONU): Bu materyalin görsel düzenini (tablo, kutu, liste) koruyarak, aynı zorluk seviyesinde yepyeni, özgün sorular nasıl üretilir? (Klavuz oluştur).
        2. KANAL (MANTIKSAL ALGORİTMA): Bu materyaldeki çözüm sürecini veya konuyu adım adım bir "Problem Çözme Algoritmasına" nasıl dönüştürebiliriz? (Akış Şeması yönergesi oluştur).
        
        BLUEPRINT TALİMATI:
        İçerik üreticisi AI'ya yönelik, bu görseldeki pedagojik mantığı klonlamasını sağlayacak TEKNİK ve YÖNERGE ODAKLI bir blueprint yaz.
        
        DİKKAT: Yanıtın KESİNLİKLE JSON objesi olmalıdır. Gereksiz metin ekleme.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                detectedType: { type: Type.STRING, description: "Örn: Görsel Dikkat, Sözel Muhakeme, Matematik Labirenti vb." },
                title: { type: Type.STRING, description: "Görselden çıkarılan veya atanan başlık" },
                description: { type: Type.STRING, description: "Materyalin eğitsel hedefi ve disleksi/diskalkuli için önemi" },
                worksheetBlueprint: { type: Type.STRING, description: "Yeni çalışma sayfası üretmek için teknik talimatlar" },
                algorithmBlueprint: { type: Type.STRING, description: "Adım adım algoritma akışı oluşturmak için mantıksal yönergeler" },
                baseType: { type: Type.STRING, description: "OCR_CONTENT" }
            },
            required: ['detectedType', 'title', 'worksheetBlueprint', 'algorithmBlueprint']
        };

        try {
            // Gemini 3 Thinking Mode ile derin analiz
            const result = await analyzeImage(base64Image, prompt, schema);
            
            return {
                rawText: result.description,
                detectedType: result.detectedType,
                title: result.title,
                description: result.description,
                generatedTemplate: result.worksheetBlueprint, // Eski sistem uyumluluğu için
                structuredData: result, // Tüm zengin veri (ikiz blueprintler dahil)
                baseType: 'OCR_CONTENT'
            };
        } catch (error) {
            console.error("Deep Vision OCR Error:", error);
            throw error;
        }
    }
};

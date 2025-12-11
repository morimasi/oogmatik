
import { Type } from "@google/genai";
import { analyzeImage } from './geminiClient';
import { ActivityType, OCRResult } from '../types';
import { ACTIVITIES } from '../constants';

export const ocrService = {
    processImage: async (base64Image: string): Promise<OCRResult> => {
        // List valid Activity IDs to guide the AI
        const validIds = ACTIVITIES.map(a => a.id).join(', ');

        const prompt = `
        [ROL: KIDEMLİ EĞİTİM TEKNOLOĞU, VERİ BİLİMCİ VE TERSİNE MÜHENDİSLİK UZMANI]
        
        GÖREV: Yüklenen eğitim materyali görselini piksel piksel analiz et ve bu etkinliğin **KAYNAK KODUNU/ALGORİTMASINI** çıkar.
        Amacımız: Bu görselin mantığını kopyalayarak, farklı verilerle sonsuz sayıda benzer etkinlik üretebilmek.
        
        DETAYLI ANALİZ SÜRECİ:

        1. **GÖRSEL & ŞEKİL ANALİZİ (Visual & Geometry):**
           - Sayfada hangi şekiller var? (Daire, kare, beşgen, özel vektörler).
           - Şekillerin konumu ve düzeni ne? (Izgara, dairesel dizilim, liste, rastgele dağılım).
        
        2. **MATEMATİKSEL & MANTIKSAL ALGORİTMA (Core Logic):**
           - Sorunun çözüm formülü ne? (Örn: \`Sonuç = (ŞekilKenarSayısı * İçindekiSayı) + 5\`).
           - Örüntü kuralı ne? (Örn: Fibonacci, +2 artış, Ayna görüntüsü).

        3. **EN YAKIN AKTİVİTE TÜRÜ (Activity Mapping):**
           - Bu görsel şu listedeki hangi türe en yakın: [${validIds}]?
           - Eğer listede yoksa, en uygun genel kategori nedir (Math, Logic, Word)?

        4. **MASTER PROMPT OLUŞTURMA (generatedTemplate - KRİTİK):**
           Bu alan, bir yapay zeka için "Üretim Emri" olmalıdır. 
           **ÇOK ÖNEMLİ:** Üretilecek JSON verisinin hangi alanda olması gerektiğini AÇIKÇA belirt.
           - Eğer bu bir kelime/bulmaca ise: "Verileri 'grid' veya 'puzzles' array'ine koy."
           - Eğer bu bir matematik işlemi ise: "Verileri 'operations' array'ine koy."
           - Eğer bu bir liste/eşleştirme ise: "Verileri 'items' veya 'pairs' array'ine koy."
           - Eğer bu bir metin/soru ise: "Verileri 'questions' array'ine koy."

           Prompt şablonu şöyle olmalı:
           "KONU: [Konu]
            GÖREV: [Detaylı Algoritma]
            VERİ YAPISI: [Hangi JSON field kullanılacak?]
            ÖRNEK VERİ: [Bir örnek]
            KURALLAR: [Kısıtlamalar]"

        ÇIKTI FORMATI (JSON):
        {
            "detectedType": "Mevcut ActivityType listesinden en yakını veya 'CUSTOM_GENERATED'",
            "title": "Görselden Algılanan Başlık",
            "description": "Etkinliğin matematiksel ve görsel mantığının teknik açıklaması.",
            "estimatedDifficulty": "Başlangıç" | "Orta" | "Zor" | "Uzman",
            "estimatedItemCount": Sayı (Görseldeki soru adedi),
            "topic": "Algılanan Konu (Örn: Çarpım Tablosu, Zıt Anlamlılar)",
            "components": ["Tablo 3x3", "Vektörel Elma İkonu", "Eşleştirme Çizgileri"],
            "generatedTemplate": "Buraya, yukarıda 4. maddede belirtilen DETAYLI, TEKNİK ve 'Hangi JSON Field Kullanılacak' bilgisini içeren Master Prompt metnini yaz."
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
                components: { type: Type.ARRAY, items: { type: Type.STRING } },
                generatedTemplate: { type: Type.STRING, description: "Etkinliğin mantığını, görsel yapısını ve veri yapısını (grid/items/operations) içeren çok detaylı üretim promptu." }
            },
            required: ['detectedType', 'title', 'description', 'estimatedDifficulty', 'generatedTemplate', 'components']
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
                instructions: result.generatedTemplate,
                components: result.components
            },
            baseType: result.detectedType
        };
    },

    convertToWorksheetData: (ocrData: OCRResult): { type: ActivityType, data: any[] } => {
        return { type: ocrData.baseType as ActivityType, data: [] };
    }
};

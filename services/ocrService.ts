
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
           - Renk kodları veya görsel ipuçları var mı? (Örn: "Kırmızı olanlar tek sayı").
        
        2. **VERİ & TABLO ANALİZİ (Data & Graph):**
           - Eğer bir tablo veya grafik varsa; X ve Y eksenleri neyi temsil ediyor?
           - Hücreler arasındaki ilişki ne? (Örn: Satır toplamı, Sütun çarpımı).
           - Veri akışı nasıl? (Soldan sağa mı, merkezden dışa mı?).

        3. **MATEMATİKSEL & MANTIKSAL ALGORİTMA (Core Logic):**
           - Sorunun çözüm formülü ne? (Örn: \`Sonuç = (ŞekilKenarSayısı * İçindekiSayı) + 5\`).
           - Örüntü kuralı ne? (Örn: Fibonacci, +2 artış, Ayna görüntüsü).
           - Değişkenler neler? (Hangi kısımlar sabit, hangi kısımlar değiştirilebilir?).

        4. **PEDAGOJİK HEDEF (Target Skill):**
           - Bu etkinlik hangi bilişsel beceriyi ölçüyor? (Görsel Dikkat, İşlem Akıcılığı, Uzamsal Algı, Okuduğunu Anlama).
           - Hedef kitle kim? (Okul öncesi, Özel Eğitim, İlkokul).

        5. **MASTER PROMPT OLUŞTURMA (generatedTemplate - KRİTİK):**
           Bu alan, bir yapay zeka için "Üretim Emri" olmalıdır. Orijinal görseli hiç görmeyen bir yapay zeka, sadece bu metni okuyarak aynı stilde ve mantıkta *yepyeni* sorular üretebilmelidir.
           Şunları KESİN olarak içermelidir:
           - **KONU & KAPSAM:** Etkinliğin tam adı ve amacı.
           - **DEĞİŞKENLER:** Hangi sayı aralıkları veya kelime havuzları kullanılacak?
           - **GÖRSEL İSTEMİ (ImagePrompt):** Kullanılacak görsellerin stili (Flat vector, black & white outline, clean educational style). Asla soyut konuşma, somut görsel betimlemeleri yap.
           - **JSON FORMATI:** Verinin nasıl yapılandırılacağı (Array of Objects, Grid Matrix vb.).
           - **KURAL SETİ:** "Doğru cevap asla A şıkkı olmasın", "Çeldiriciler fonetik olarak benzesin" gibi teknik kurallar.

        ÇIKTI FORMATI (JSON):
        {
            "detectedType": "Mevcut ActivityType listesinden en yakını veya 'CUSTOM_GENERATED'",
            "title": "Görselden Algılanan Başlık",
            "description": "Etkinliğin matematiksel ve görsel mantığının teknik açıklaması.",
            "estimatedDifficulty": "Başlangıç" | "Orta" | "Zor" | "Uzman",
            "estimatedItemCount": Sayı (Görseldeki soru adedi),
            "topic": "Algılanan Konu (Örn: Çarpım Tablosu, Zıt Anlamlılar)",
            "components": ["Tablo 3x3", "Vektörel Elma İkonu", "Eşleştirme Çizgileri"],
            "generatedTemplate": "Buraya, yukarıda 5. maddede belirtilen DETAYLI, TEKNİK ve KURAL TABANLI 'Master Prompt' metnini yaz."
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
                generatedTemplate: { type: Type.STRING, description: "Etkinliğin mantığını, görsel yapısını ve matematiksel algoritmasını içeren çok detaylı üretim promptu." }
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

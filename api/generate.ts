
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Basit bir bekleme (sleep) yardımcı fonksiyonu
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { prompt, schema, model } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" ve "schema" alanları zorunludur.' });
        }
        
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            console.error("API_KEY bulunamadı.");
            return res.status(500).json({ error: 'Sunucuda API anahtarı yapılandırılmamış. Lütfen Vercel ayarlarını kontrol edin.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const maxRetries = 2; 
        
        // MODEL SEÇİM STRATEJİSİ (Sıfır Maliyet / Hız Odaklı)
        // Görsel üretimi (Imagen) kapalı olduğu için en hızlı metin modeli yeterlidir.
        // Flash modeli hem kod (SVG) yazabilir hem de mantıksal kurgu yapabilir.
        let selectedModel = model || "gemini-1.5-flash-latest"; 

        // Adım 1: İçerik ve Görsel Kodu Üretimi (Tek Seferde)
        let data;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
                
                // Prompt Zenginleştirme: Profesyonel SVG Sanat Yönetmenliği
                const enhancedPrompt = `${prompt}
                
                [SİSTEM TALİMATI - ART DIRECTOR MODU]
                Sen dünya standartlarında bir "Vektör İllüstratörü" ve "Eğitim Materyali Tasarımcısı"sın.
                
                GÖREVİN: 
                Şemadaki 'imagePrompt' veya 'imageBase64' alanları için harici resim oluşturmak yerine, doğrudan PROFESYONEL SVG KODU yazacaksın.

                **SVG TASARIM KURALLARI (Kesinlikle Uygula):**
                1.  **CANVAS:** Her zaman <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"> kullan.
                2.  **STİL:** "Modern Flat 2.0" tarzı. Siyah dış çizgiler (stroke) KULLANMA. Şekilleri renkli dolgularla (fill) oluştur.
                3.  **RENK PALETİ:** Sadece şu profesyonel eğitim renklerini kullan:
                    - Ana Renkler: #4F46E5 (Indigo), #EF4444 (Rose), #F59E0B (Amber), #10B981 (Emerald), #3B82F6 (Blue).
                    - Detay Renkleri: #1F2937 (Koyu Gri - Göz/Detay için), #F3F4F6 (Açık Gri - Arka plan vurgusu).
                4.  **DERİNLİK (Işık ve Gölge):**
                    - Her ana şeklin üzerine bir "Highlight" (Parlama) ekle: Beyaz renk (#FFFFFF) ve opacity="0.2".
                    - Her ana şeklin altına veya yanına bir "Shadow" (Gölge) ekle: Siyah renk (#000000) ve opacity="0.15".
                5.  **KOMPOZİSYON:**
                    - Nesneyi tam ortaya (center) yerleştir.
                    - Kenarlardan en az 20px boşluk bırak (padding).
                    - Arka plana, nesneyi vurgulayan soluk, pastel tonlu, soyut bir daire veya "blob" ekle.
                6.  **KOD YAPISI:** Karmaşık path'ler yerine mümkün olduğunca <circle>, <rect rx="20"> (yuvarlak köşe), <ellipse> gibi geometrik şekillerle kompozisyon kur. Bu daha temiz görünür.

                **ÖRNEK SENARYO:**
                Eğer "Elma" istenirse: Sadece kırmızı bir daire çizme. 
                - Arkaya soluk yeşil bir daire koy.
                - Kırmızı gövdeyi çiz (hafif kalp şeklinde path).
                - Üstüne beyaz, yarım ay şeklinde bir parlama (highlight) ekle.
                - Altına koyu kırmızı/siyah bir gölge (shadow) ekle.
                - Kahverengi sap ve yeşil yaprak ekle.

                Eğer nesne çok karmaşıksa (örneğin "insan yüzü"), stilize ve minimalist (ikonik) çalış. Gerçekçi olmaya çalışma.
                Eğer SVG çizimi imkansızsa, en yüksek kalitede, ilgili bir EMOJİ döndür.
                `;

                const textResponse = await ai.models.generateContent({
                    model: selectedModel, 
                    contents: enhancedPrompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        temperature: 0.75, // Biraz daha yaratıcılık ama kontrollü (0.85'ten düşürüldü)
                        topP: 0.95,
                        topK: 40
                    },
                });

                const jsonText = textResponse.text;
                if (!jsonText) throw new Error("Yapay zekadan boş bir metin yanıtı alındı.");
                
                const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
                
                try {
                    data = JSON.parse(cleanedJsonText);
                } catch (parseError) {
                    console.error("JSON Parse Error on AI Response:", cleanedJsonText);
                    throw new Error("Yapay zeka yanıtı geçerli bir JSON formatında değildi.");
                }
                
                break; // Başarılı
            } catch (error: any) {
                console.error(`Attempt ${attempt + 1} failed (${selectedModel}):`, error.message);
                
                if ((error.status === 429 || error.status === 503)) {
                    await sleep(1000);
                    continue;
                }
                
                if (attempt < maxRetries - 1) await sleep(1500);
                else throw error;
            }
        }

        if (!data) return res.status(500).json({ error: "Yapay zeka yanıt vermedi." });
        
        return res.status(200).json(data);

    } catch (error: unknown) {
        console.error("API Handler Error:", error);
        let statusCode = 500;
        let errorMessage = "Sunucu hatası.";

        if (error instanceof Error) {
            if ('status' in error) {
                statusCode = (error as any).status || 500;
            }
            errorMessage = error.message;
            
            if (statusCode === 429) {
                errorMessage = "API kotası aşıldı. Lütfen Hızlı Mod'u kullanın.";
            }
        }
        
        return res.status(statusCode).json({ error: errorMessage });
    }
}

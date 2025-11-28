
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
                
                [SİSTEM TALİMATI - KREATİF DİREKTÖR MODU]
                Sen ödüllü bir "Eğitim Materyali Tasarımcısı" ve "Kıdemli Vektör İllüstratörü"sün.
                Amacın: Çocuklar için "Premium/Ücretli Üyelik" kalitesinde, görsel olarak zengin ve pedagojik olarak kusursuz içerikler üretmek.
                
                GÖREVİN: 
                Şemadaki 'imagePrompt' veya 'imageBase64' alanları için harici resim oluşturmak yerine, doğrudan PROFESYONEL SVG KODU yazacaksın.

                **SVG TASARIM KURALLARI (Stil Rehberi):**
                1.  **CANVAS:** Her zaman <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"> kullan.
                2.  **STİL: "Modern Flat 2.0" (Düz Tasarım)**
                    - Siyah dış çizgiler (stroke) KESİNLİKLE KULLANMA. Şekilleri renkli dolgularla (fill) oluştur.
                    - "Kawaii" tarzı sevimli, yuvarlak hatlı çizimler yap. Sivri köşelerden kaçın (rx/ry kullan).
                3.  **RENK PALETİ (Eğitim Dostu):**
                    - Ana Renkler: #4F46E5 (Indigo), #EF4444 (Rose), #F59E0B (Amber), #10B981 (Emerald), #3B82F6 (Blue).
                    - Ten Renkleri: #FCA5A5, #FDBA74, #A78BFA (Çeşitlilik içerir).
                    - Arka Plan Vurgusu: Nesnenin arkasına mutlaka soluk bir daire veya organik şekil (blob) ekle (#F3F4F6 veya #E0E7FF).
                4.  **DERİNLİK VE HACİM (Çok Önemli):**
                    - **Highlight (Parlama):** Her ana şeklin üzerine beyaz (#FFFFFF) ve opacity="0.2" olan bir katman ekle. (Örn: Elmanın sol üst köşesine parlama).
                    - **Shadow (Gölge):** Her ana şeklin altına veya yanına siyah (#000000) ve opacity="0.15" olan bir gölge katmanı ekle.
                5.  **KOMPOZİSYON:**
                    - Nesneyi tam ortaya (center) yerleştir.
                    - Kenarlardan en az 40px "padding" bırak. Görsel taşmamalı.
                6.  **KOD YAPISI:**
                    - Karmaşık 'path'ler yerine mümkün olduğunca <circle>, <rect rx="20">, <ellipse> kombinasyonları kullan.
                    - Kod temiz ve optimize olmalı.

                **ÖRNEK SENARYO (Elma Çizimi):**
                - Sadece kırmızı bir daire çizip bırakma.
                - 1. Katman: Arkaya soluk yeşil (#DCFCE7) büyük bir daire (blob).
                - 2. Katman: Kırmızı (#EF4444) gövde (hafif kalp şeklinde path).
                - 3. Katman: Altına koyu kırmızı (#991B1B) hilal şeklinde gölge.
                - 4. Katman: Üstüne beyaz (#FFFFFF, op:0.3) oval parlama.
                - 5. Katman: Kahverengi sap ve detaylı yeşil yaprak.
                - 6. Katman: Yüze sevimli bir ifade (gözler ve gülümseme) ekle.

                Eğer nesne soyutsa (örneğin "Mutluluk"), bunu renkli balonlar veya gülen bir güneş ile somutlaştır.
                Eğer SVG çizimi teknik olarak imkansızsa, en yüksek kalitede, ilgili bir EMOJİ döndür (ancak öncelik her zaman SVG'dir).
                `;

                const textResponse = await ai.models.generateContent({
                    model: selectedModel, 
                    contents: enhancedPrompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        temperature: 0.7, // Yaratıcılık ve tutarlılık dengesi
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

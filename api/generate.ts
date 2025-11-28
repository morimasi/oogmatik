
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
                
                // Prompt Zenginleştirme: SVG ve Emoji Stratejisi
                const enhancedPrompt = `${prompt}
                
                [SİSTEM TALİMATI - SIFIR MALİYETLİ GÖRSEL ÜRETİMİ]
                1. Random Seed: ${uniqueSeed}. Önceki cevapları tekrar etme.
                2. GÖRSEL ALANLARI ('imagePrompt' veya 'imageBase64'):
                   - Bu alanlar için harici bir resim üretilmeyecektir.
                   - Bunun yerine, bu alanlara doğrudan GÖRSELİ TEMSİL EDEN KOD veya İKON yazmalısın.
                   - TERCİH 1 (Basit Nesneler): İlgili bir EMOJİ kullan (Örn: "Elma" için "🍎").
                   - TERCİH 2 (Karmaşık/Geometrik): Basit bir SVG KODU string'i yaz (Örn: "<svg viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='red'/></svg>").
                   - SVG kodları "flat", "clean", "colorful" ve "simple" olmalı.
                3. ANİMASYON: Video üretme. CSS animasyon sınıfları veya tanımları kullan.
                `;

                const textResponse = await ai.models.generateContent({
                    model: selectedModel, 
                    contents: enhancedPrompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        temperature: 0.85,
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

        // Adım 2: Görsel Üretimi (Imagen) - DEVRE DIŞI BIRAKILDI
        // Maliyeti düşürmek ve hızı artırmak için görsel üretimi kaldırıldı. 
        // Yapay zeka artık doğrudan SVG kodu veya Emoji döndürüyor.
        
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

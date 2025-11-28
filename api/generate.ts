
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
        
        // MODEL SEÇİM STRATEJİSİ (Ücretli/Paid Tier için Optimize Edildi)
        // Raporlama ve karmaşık analiz için Pro, standart oyunlar için Flash.
        // Kullanıcı 'gemini-3-pro-preview' gönderdiyse onu kullan, yoksa varsayılanları seç.
        let selectedModel = model;
        
        if (!selectedModel) {
            // Varsayılan olarak en hızlı ve uygun maliyetli olan Flash 1.5
            selectedModel = "gemini-1.5-flash-latest"; 
        }

        // Adım 1: Metin Üretimi
        let data;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Seed ekleyerek her seferinde farklı sonuç üretilmesini sağlıyoruz
                const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
                
                // Prompt Zenginleştirme
                const enhancedPrompt = `${prompt}
                
                [SİSTEM TALİMATI - PRO]
                1. Random Seed: ${uniqueSeed}. Asla önceki cevabın aynısını verme. Yaratıcı ol.
                2. GÖRSEL BETİMLEME: Şemada 'imagePrompt' alanı varsa, çocuklar için uygun, canlı, renkli, 'flat vector art' veya '3D cartoon style' stilinde İngilizce betimleme yaz.
                3. ANİMASYON MANTIĞI: Video üretme. Bunun yerine CSS animasyonları için sınıflar veya tanımlar kullan. Eğer bir hareket gerekiyorsa (örn: zıplayan top), bunu metin içinde belirt.
                `;

                const textResponse = await ai.models.generateContent({
                    model: selectedModel, 
                    contents: enhancedPrompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        temperature: 0.85, // Yaratıcılık için biraz artırıldı
                        topP: 0.95,
                        topK: 40
                    },
                });

                const jsonText = textResponse.text;
                if (!jsonText) throw new Error("Yapay zekadan boş bir metin yanıtı alındı.");
                
                // Markdown temizliği (bazen ```json ... ``` formatında gelebilir)
                const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
                
                try {
                    data = JSON.parse(cleanedJsonText);
                } catch (parseError) {
                    console.error("JSON Parse Error on AI Response:", cleanedJsonText);
                    throw new Error("Yapay zeka yanıtı geçerli bir JSON formatında değildi.");
                }
                
                break; // Başarılı olursa döngüden çık
            } catch (error: any) {
                console.error(`Attempt ${attempt + 1} failed (${selectedModel}):`, error.message);
                
                // Eğer 429 (Quota) veya 503 (Overloaded) hatasıysa ve Pro modelindeysek, Flash'a düşür
                if ((error.status === 429 || error.status === 503) && selectedModel.includes('pro')) {
                    console.warn("Switching to Flash model due to quota/load...");
                    selectedModel = "gemini-1.5-flash-latest";
                    await sleep(1000);
                    continue;
                }
                
                if (attempt < maxRetries - 1) await sleep(1500);
                else throw error;
            }
        }

        if (!data) return res.status(500).json({ error: "Yapay zeka yanıt vermedi." });

        // Adım 2: Görsel Üretimi (Google Imagen 3)
        // JSON içindeki 'imagePrompt' alanlarını bulup görsel üretir.
        const imagePromptsToProcess: { obj: any, imagePrompt: string }[] = [];
        
        const findImagePrompts = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
                obj.forEach(findImagePrompts);
                return;
            }
            Object.keys(obj).forEach(key => {
                if (key === 'imagePrompt' && typeof obj[key] === 'string' && obj[key].length > 0) {
                    imagePromptsToProcess.push({ obj: obj, imagePrompt: obj[key] });
                } else {
                    findImagePrompts(obj[key]);
                }
            });
        };

        findImagePrompts(data);
        
        if (imagePromptsToProcess.length > 0) {
            // Hız için paralel istek, ancak kota sınırına dikkat (Maks 3-4 görsel)
            const chunk = imagePromptsToProcess.slice(0, 4); 
            
            await Promise.all(chunk.map(async ({ obj, imagePrompt }) => {
                try {
                    // Imagen 3 en kaliteli ve hızlı görsel modelidir
                    const imageResponse = await ai.models.generateImages({
                        model: 'imagen-3.0-generate-001', 
                        prompt: imagePrompt + ", white background, high quality, educational illustration, vector style, cute",
                        config: {
                            numberOfImages: 1,
                            outputMimeType: 'image/png', 
                            aspectRatio: '1:1'
                        },
                    });
        
                    const base64String = imageResponse.generatedImages?.[0]?.image?.imageBytes;

                    if (base64String) {
                        obj['imageBase64'] = base64String;
                        // İsteğe bağlı: imagePrompt'u silerek response boyutunu küçültebilirsiniz
                        // delete obj['imagePrompt']; 
                    } 
                } catch (imgError: any) {
                    console.warn("Görsel oluşturulamadı (Imagen):", imgError.message);
                    // Hata durumunda boş string bırak, frontend emoji/placeholder kullanır
                    obj['imageBase64'] = '';
                }
            }));
        }
        
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
                errorMessage = "API kotası aşıldı. Lütfen Google Cloud Console üzerinden Billing (Faturalandırma) hesabınızı kontrol edin veya Hızlı Mod'u kullanın.";
            }
        }
        
        return res.status(statusCode).json({ error: errorMessage });
    }
}

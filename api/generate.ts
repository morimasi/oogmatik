
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Basit bir bekleme (sleep) yardımcı fonksiyonu
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { prompt, schema } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" ve "schema" alanları zorunludur.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY environment variable is not set on Vercel.");
            return res.status(500).json({ error: 'Sunucuda API anahtarı yapılandırılmamış.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        // Retries reduced to 1 to fail fast on 429 and switch to offline mode quickly
        const maxRetries = 1; 
        
        // Adım 1: Metin Üretimi (Gemini 2.5 Flash)
        let data;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const textResponse = await ai.models.generateContent({
                    model: "gemini-2.5-flash", // Metin için en hızlı ve verimli model
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        temperature: 0.9,
                    },
                });

                const jsonText = textResponse.text;
                if (!jsonText) throw new Error("Yapay zekadan boş bir metin yanıtı alındı.");
                
                const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
                data = JSON.parse(cleanedJsonText);
                break;
            } catch (error: any) {
                // 429 durumunda bekleme yapma, direkt hata fırlat ki client Hızlı Mod'a geçsin
                if (error.status === 429) {
                    throw error;
                }
                if (attempt < maxRetries - 1) {
                     await sleep(1000);
                } else {
                    throw error;
                }
            }
        }

        if (!data) return res.status(500).json({ error: "Yapay zeka yanıt vermedi." });

        // Adım 2: Görsel Üretimi (Imagen 4.0) - Hata Toleranslı
        // Görsel üretimi başarısız olsa bile metin verisi döndürülür (Sistem Çökmez).
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
            // KOTA DOSTU STRATEJİ: Sadece 1 görsel üret, diğerlerini atla.
            // Bu sayede kota aşımı riski azalır ve yanıt süresi kısalır.
            const chunk = imagePromptsToProcess.slice(0, 1); 
            
            await Promise.all(chunk.map(async ({ obj, imagePrompt }) => {
                try {
                    const imageResponse = await ai.models.generateImages({
                        model: 'imagen-4.0-generate-001', // En yüksek kalite görsel modeli
                        prompt: imagePrompt,
                        config: {
                            numberOfImages: 1,
                            outputMimeType: 'image/jpeg',
                            aspectRatio: '1:1',
                        },
                    });
                    const base64Data = imageResponse.generatedImages?.[0]?.image?.imageBytes;
                    if (base64Data) obj['imageBase64'] = base64Data;
                    delete obj['imagePrompt']; // Prompt'u temizle, artık veriye sahibiz
                } catch (imgError) {
                    console.warn("Görsel oluşturulamadı (Hata Toleransı Devrede). Metin içeriği korunuyor.");
                    obj['imageBase64'] = ''; // Alanı boş bırak, arayüzde fallback gösterilir
                    delete obj['imagePrompt'];
                }
            }));
            
            // İşlenmeyen diğer imagePrompt'ları temizle
             imagePromptsToProcess.forEach(({obj}) => {
                 if(obj.imagePrompt) delete obj.imagePrompt;
                 if(!obj.imageBase64) obj.imageBase64 = '';
             });
        }
        
        return res.status(200).json(data);

    } catch (error: unknown) {
        console.error("API Handler Error:", error);
        let statusCode = 500;
        let errorMessage = "Sunucu hatası.";

        if (error instanceof Error && 'status' in error) {
            const apiError = error as { status: number; message: string };
            statusCode = apiError.status || 500;
            errorMessage = apiError.message;
            
            if (statusCode === 429) {
                errorMessage = "API kotası aşıldı (429). Lütfen 'Hızlı Mod'u deneyin.";
            }
        }
        
        return res.status(statusCode).json({ error: errorMessage });
    }
}

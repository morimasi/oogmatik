
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Basit bir bekleme (sleep) yardımcı fonksiyonu
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Gemini API hatasından yeniden deneme gecikmesini çıkarmak için yardımcı fonksiyon
const getRetryDelay = (error: any): number | null => {
    try {
        const errorJsonString = error.message.substring(error.message.indexOf('{'));
        const errorDetails = JSON.parse(errorJsonString);
        
        const retryInfo = errorDetails?.error?.details?.find(
            (detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        );

        if (retryInfo && retryInfo.retryDelay) {
            const delayString = retryInfo.retryDelay;
            const seconds = parseFloat(delayString);
            if (!isNaN(seconds)) {
                return seconds * 1000;
            }
        }
    } catch (e) {
        // Ayrıştırılamadı, varsayılan mantığa geri dön
    }
    return null;
};

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
        const maxRetries = 3; // Retries reduced slightly to prevent long hangs
        
        // Adım 1: Metin Üretimi
        let data;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const textResponse = await ai.models.generateContent({
                    model: "gemini-3-pro-preview", 
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
                const isRetryable = error.status === 503 || error.status === 429;
                if (isRetryable && attempt < maxRetries - 1) {
                    let delay = getRetryDelay(error);
                    if (delay === null) delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    console.warn(`Metin oluşturma denemesi ${attempt + 1} başarısız: ${error.status}. Bekleniyor: ${Math.round(delay)}ms`);
                    await sleep(delay);
                } else {
                    throw error;
                }
            }
        }

        if (!data) return res.status(500).json({ error: "Yapay zeka yanıt vermedi." });

        // Adım 2: Görsel Üretimi (Imagen 4.0)
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
            // Imagen için eşzamanlılık limiti. Kotayı korumak için düşük tutuyoruz.
            const CONCURRENCY_LIMIT = 2; 
            
            for (let i = 0; i < imagePromptsToProcess.length; i += CONCURRENCY_LIMIT) {
                const chunk = imagePromptsToProcess.slice(i, i + CONCURRENCY_LIMIT);
                
                // Chunk içindeki her bir görsel isteği için Promise oluşturuyoruz
                const promises = chunk.map(async ({ obj, imagePrompt }) => {
                    // Her görsel için kendi retry döngüsü
                    for (let attempt = 0; attempt < maxRetries; attempt++) {
                        try {
                            // OPTIMIZATION: Görsel kalitesi için Imagen 4.0
                            const imageResponse = await ai.models.generateImages({
                                model: 'imagen-4.0-generate-001',
                                prompt: imagePrompt,
                                config: {
                                    numberOfImages: 1,
                                    outputMimeType: 'image/jpeg',
                                    aspectRatio: '1:1',
                                },
                            });
                            
                            const base64Data = imageResponse.generatedImages?.[0]?.image?.imageBytes;
                            
                            if (base64Data) {
                                obj['imageBase64'] = base64Data;
                            } else {
                                obj['imageBase64'] = '';
                            }
                            // Başarılı olsa da olmasa da, işlendiği için prompt'u siliyoruz.
                            delete obj['imagePrompt'];
                            return; // Başarılı, döngüden çık

                        } catch (imgError: any) {
                             const isRetryable = imgError.status === 503 || imgError.status === 429;
                             if (isRetryable && attempt < maxRetries - 1) {
                                let delay = getRetryDelay(imgError);
                                if (delay === null) delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000; // Görsel için daha uzun bekleme
                                console.warn(`Görsel denemesi ${attempt + 1} başarısız (${imgError.status}). Bekleniyor: ${Math.round(delay)}ms`);
                                await sleep(delay);
                            } else {
                                // CRITICAL FIX: Eğer tüm denemeler başarısız olursa (örn: Kota bitti),
                                // HATAYI FIRLATMA. Bunun yerine görseli boş bırak ve devam et.
                                // Böylece kullanıcı metin içeriğini en azından görebilir.
                                console.error(`Görsel oluşturulamadı (İstem: ${imagePrompt.substring(0, 30)}...):`, imgError.message);
                                obj['imageBase64'] = ''; // Boş görsel
                                delete obj['imagePrompt'];
                                return; // Hata ile döngüden çık (Graceful degradation)
                            }
                        }
                    }
                });
                
                // Chunk'ın bitmesini bekle
                await Promise.all(promises);
            }
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

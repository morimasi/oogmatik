
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Basit bir bekleme (sleep) yardımcı fonksiyonu
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Gemini API hatasından yeniden deneme gecikmesini çıkarmak için yardımcı fonksiyon
const getRetryDelay = (error: any): number | null => {
    try {
        // SDK'dan gelen hata mesajı genellikle JSON yanıtını içerir.
        // Hata mesajından JSON dizesini ayıklamaya çalışıyoruz.
        const errorJsonString = error.message.substring(error.message.indexOf('{'));
        const errorDetails = JSON.parse(errorJsonString);
        
        const retryInfo = errorDetails?.error?.details?.find(
            (detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        );

        if (retryInfo && retryInfo.retryDelay) {
            // Örn: "2.697700806s" veya "2s"
            const delayString = retryInfo.retryDelay;
            const seconds = parseFloat(delayString);
            if (!isNaN(seconds)) {
                return seconds * 1000; // Milisaniyeye çevir
            }
        }
    } catch (e) {
        // Ayrıştırılamadı, varsayılan mantığa geri dön
    }
    return null;
};

// Bu bir Vercel sunucusuz işlevidir.
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Tüm yanıtlar için CORS başlıklarını ayarla, hatalar dahil
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        // CORS için ön kontrol isteklerini işle
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
        const maxRetries = 4;
        
        // Adım 1: Ana JSON yapısını resim istemleriyle birlikte oluştur (yeniden deneme mantığıyla)
        let data;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // MODEL GÜNCELLEMESİ: Daha gelişmiş metin modeli (Gemini 3 Pro Preview)
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
                if (!jsonText) {
                     throw new Error("Yapay zekadan boş bir metin yanıtı alındı.");
                }
                
                const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
                data = JSON.parse(cleanedJsonText);
                break; // Başarılı, döngüden çık
            } catch (error: any) {
                const isRetryable = error.status === 503 || error.status === 429;
                if (isRetryable && attempt < maxRetries - 1) {
                    let delay = getRetryDelay(error);
                    if (delay === null) {
                        // API'den gecikme bilgisi alınamazsa üstel geri çekilmeye geri dön
                        delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    }
                    console.warn(`Metin oluşturma denemesi ${attempt + 1}, ${error.status} hatasıyla başarısız oldu. Yaklaşık ${Math.round(delay / 1000)}s içinde yeniden denenecek...`);
                    await sleep(delay);
                } else {
                    throw error; // Yeniden denemez veya denemeler bittiyse hatayı tekrar fırlat
                }
            }
        }

        if (!data) {
             return res.status(500).json({ error: "Yapay zeka birden çok denemeye rağmen yanıt vermedi." });
        }

        // Adım 2: 'imagePrompt' alanlarını özyinelemeli olarak bul ve eşzamanlılık kontrolü ile resimleri oluştur
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
                    findImagePrompts(obj[key]); // Diğer özelliklere özyinelemeli olarak devam et
                }
            });
        };

        findImagePrompts(data);
        
        if (imagePromptsToProcess.length > 0) {
            const CONCURRENCY_LIMIT = 3; // Imagen modeli için eşzamanlılık limiti
            for (let i = 0; i < imagePromptsToProcess.length; i += CONCURRENCY_LIMIT) {
                const chunk = imagePromptsToProcess.slice(i, i + CONCURRENCY_LIMIT);
                const promises = chunk.map(async ({ obj, imagePrompt }) => {
                    for (let attempt = 0; attempt < maxRetries; attempt++) {
                        try {
                            // MODEL GÜNCELLEMESİ: Yüksek kaliteli resim modeli (Imagen 4)
                            // Sadece statik resimler (video yok)
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
                                obj['imageBase64'] = ''; // Resim döndürülmezse boş dize ata
                                console.warn(`"${imagePrompt}" istemi için resim verisi bulunamadı.`);
                            }
                            delete obj['imagePrompt']; // Sonuç ne olursa olsun istem alanını temizle
                            return; // Bu resim için başarılı, iç döngüden çık
                        } catch (imgError: any) {
                             const isRetryable = imgError.status === 503 || imgError.status === 429;
                             if (isRetryable && attempt < maxRetries - 1) {
                                let delay = getRetryDelay(imgError);
                                if (delay === null) {
                                    delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                                }
                                console.warn(`Resim oluşturma denemesi ${attempt + 1} "${imagePrompt}" için başarısız oldu. Yaklaşık ${Math.round(delay / 1000)}s içinde yeniden denenecek...`);
                                await sleep(delay);
                            } else {
                                console.error(`"${imagePrompt}" istemi için resim oluşturma başarısız oldu:`, imgError);
                                obj['imageBase64'] = ''; // Son hatada istemci çökmesini önlemek için boş ata
                                delete obj['imagePrompt'];
                                return; // Bu resimden vazgeç
                            }
                        }
                    }
                });
                await Promise.all(promises);
            }
        }
        
        // Adım 3: Gömülü resim verileriyle son JSON'u döndür
        return res.status(200).json(data);

    } catch (error: unknown) {
        // Sunucuda tam hatayı Vercel günlüklerinde hata ayıklama için kaydet
        console.error("Sunucusuz fonksiyonda kritik hata:", error);
        
        let clientErrorMessage = "Yapay zeka ile içerik oluşturulurken sunucu tarafında bir hata oluştu.";
        let statusCode = 500;
        let errorDetails = 'Bilinmeyen hata.';

        if (error instanceof Error && 'status' in error) {
            const apiError = error as { status?: number; message: string };
            errorDetails = apiError.message;
            if (apiError.status === 429) {
                clientErrorMessage = 'API kullanım kotası aşıldı. Bu, ücretsiz katmanda sıkça olabilir. Lütfen bir dakika bekleyip tekrar deneyin.';
                statusCode = 429;
            } else if (apiError.status === 503) {
                clientErrorMessage = 'Model şu anda aşırı yüklü. Lütfen daha sonra tekrar deneyin.';
                statusCode = 503;
            } else if (apiError.message.includes('API key not valid')) {
                clientErrorMessage = 'Sunucuda yapılandırılan API anahtarı geçersiz. Lütfen Vercel proje ayarlarınızı kontrol edin.';
                statusCode = 401;
            } else if (apiError.message.includes('permission denied') || apiError.message.includes('billing')) {
                 clientErrorMessage = 'API anahtarının bu modeli kullanma izni yok veya projeniz için faturalandırma etkin değil.';
                 statusCode = 403;
            } else if (apiError.message.includes('timed out')) {
                clientErrorMessage = 'Yapay zeka sunucusundan yanıt alınamadı, zaman aşımına uğradı.';
                statusCode = 504;
            } else if (apiError.message.includes('400 BAD REQUEST')) {
                clientErrorMessage = 'Yapay zekaya geçersiz bir istek gönderildi. Lütfen girdilerinizi kontrol edin.';
                statusCode = 400;
            }
        }
        
        const errorResponse: { error: string, details?: string } = { error: clientErrorMessage };
        if (process.env.NODE_ENV !== 'production') {
            errorResponse.details = errorDetails;
        }

        return res.status(statusCode).json(errorResponse);
    }
}

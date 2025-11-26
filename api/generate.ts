
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
        const { prompt, schema, model } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" ve "schema" alanları zorunludur.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY environment variable is not set on Vercel.");
            return res.status(500).json({ error: 'Sunucuda API anahtarı yapılandırılmamış.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const maxRetries = 1; 
        
        // Raporlama için daha zeki model, oyunlar için daha hızlı model
        const selectedModel = model || "gemini-2.5-flash";

        // Adım 1: Metin Üretimi
        let data;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const textResponse = await ai.models.generateContent({
                    model: selectedModel, 
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
                if (error.status === 429) throw error;
                if (attempt < maxRetries - 1) await sleep(1000);
                else throw error;
            }
        }

        if (!data) return res.status(500).json({ error: "Yapay zeka yanıt vermedi." });

        // Adım 2: Görsel Üretimi (Gemini 2.5 Flash Image - Nano Banana)
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
            // Kota dostu olması için maksimum 3 görsel üretelim (ana görsel + 2 detay gibi)
            const chunk = imagePromptsToProcess.slice(0, 3); 
            
            await Promise.all(chunk.map(async ({ obj, imagePrompt }) => {
                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash-image',
                        contents: { parts: [{ text: imagePrompt }] },
                        config: {
                            // responseMimeType ve responseSchema resim üretimi için kullanılmaz
                        }
                    });

                    let imageFound = false;
                    const candidate = response.candidates?.[0];
                    const parts = candidate?.content?.parts;

                    if (parts) {
                        for (const part of parts) {
                            if (part.inlineData && part.inlineData.data) {
                                obj['imageBase64'] = part.inlineData.data;
                                imageFound = true;
                                break;
                            }
                        }
                    }
                    
                    // Sadece görsel başarıyla geldiyse metni sil, yoksa frontend fallback kullansın
                    if (imageFound) {
                        delete obj['imagePrompt'];
                    }
                } catch (imgError) {
                    console.warn("Görsel oluşturulamadı, metin korunuyor:", imgError);
                    obj['imageBase64'] = '';
                    // imagePrompt silinmez ki frontend fallback olarak kullanabilsin
                }
            }));
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

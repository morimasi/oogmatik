
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

// This is a Vercel serverless function.
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') {
        // Handle preflight requests for CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST', 'OPTIONS']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
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
        
        // Step 1: Generate the main JSON structure with image prompts
        const textResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.9,
            },
        });

        const jsonText = textResponse.text;
        if (!jsonText) {
             console.warn("AI returned an empty response text.");
             return res.status(500).json({ error: "Yapay zekadan boş bir metin yanıtı alındı." });
        }
        
        let data;
        try {
            // It's possible the model returns markdown with ```json ... ```, so let's clean it.
            const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
            data = JSON.parse(cleanedJsonText);
        } catch (parseError) {
            console.error("Failed to parse JSON response from AI:", jsonText);
            return res.status(500).json({ error: "Yapay zekadan gelen yanıt ayrıştırılamadı (Geçersiz JSON)." });
        }

        // Step 2: Recursively find 'imagePrompt' fields and generate images in parallel
        const imageGenerationPromises: Promise<void>[] = [];
        const findAndQueueImagePrompts = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;

            if (Array.isArray(obj)) {
                obj.forEach(findAndQueueImagePrompts);
                return;
            }

            Object.keys(obj).forEach(key => {
                if (key === 'imagePrompt' && typeof obj[key] === 'string' && obj[key].length > 0) {
                    const imagePrompt = obj[key];
                    const promise = (async () => {
                        try {
                            const imageResponse = await ai.models.generateContent({
                                model: 'gemini-2.5-flash-image',
                                contents: { parts: [{ text: imagePrompt }] },
                                config: { responseModalities: [Modality.IMAGE] },
                            });
                            
                            const partWithImageData = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
                            if (partWithImageData?.inlineData) {
                                obj['imageBase64'] = partWithImageData.inlineData.data;
                            } else {
                                obj['imageBase64'] = '';
                                console.warn(`No image data found in Gemini response for prompt: "${imagePrompt}"`);
                            }
                        } catch (imgError) {
                            console.error(`Image generation failed for prompt: "${imagePrompt}"`, imgError);
                            obj['imageBase64'] = ''; // Set empty on error to prevent client crashes
                        } finally {
                            delete obj[key]; // Clean up the prompt field
                        }
                    })();
                    imageGenerationPromises.push(promise);
                } else {
                    findAndQueueImagePrompts(obj[key]); // Recurse into other properties
                }
            });
        };

        findAndQueueImagePrompts(data);
        
        if(imageGenerationPromises.length > 0) {
            await Promise.all(imageGenerationPromises);
        }
        
        // Set CORS headers for local development and Vercel preview environments
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Step 3: Return the final JSON with embedded image data
        return res.status(200).json(data);

    } catch (error) {
        // Log the full error on the server for debugging in Vercel logs
        console.error("Sunucusuz fonksiyonda kritik hata:", error);
        
        let clientErrorMessage = "Yapay zeka ile içerik oluşturulurken sunucu tarafında bir hata oluştu.";
        let statusCode = 500;

        if (error && typeof error === 'object' && 'message' in error) {
            const errorMessage = (error as Error).message;
            if (errorMessage.includes('API key not valid')) {
                clientErrorMessage = 'Sunucuda yapılandırılan API anahtarı geçersiz. Lütfen Vercel proje ayarlarınızı kontrol edin.';
                statusCode = 401;
            } else if (errorMessage.includes('permission denied') || errorMessage.includes('billing')) {
                 clientErrorMessage = 'API anahtarının bu modeli kullanma izni yok veya projeniz için faturalandırma etkin değil.';
                 statusCode = 403;
            } else if (errorMessage.includes('timed out')) {
                clientErrorMessage = 'Yapay zeka sunucusundan yanıt alınamadı, zaman aşımına uğradı.';
                statusCode = 504;
            } else if (errorMessage.includes('400 BAD REQUEST')) {
                clientErrorMessage = 'Yapay zekaya geçersiz bir istek gönderildi. Lütfen girdilerinizi kontrol edin.';
                statusCode = 400;
            }
        }
        
        const errorResponse = { error: clientErrorMessage };
        if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
            (errorResponse as any).details = error.message;
        }

        return res.status(statusCode).json(errorResponse);
    }
}

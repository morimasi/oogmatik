
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
            data = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("Failed to parse JSON response from AI:", jsonText);
            return res.status(500).json({ error: "Yapay zekadan gelen yanıt ayrıştırılamadı (Geçersiz JSON)." });
        }

        // Step 2: Recursively find 'imagePrompt' fields and generate images
        const generateImagesInObject = async (obj: any) => {
            if (!obj || typeof obj !== 'object') return;

            if (Array.isArray(obj)) {
                for (const item of obj) {
                    await generateImagesInObject(item);
                }
                return;
            }

            const keys = Object.keys(obj);
            for (const key of keys) {
                // Check for the special key 'imagePrompt'
                if (key === 'imagePrompt' && typeof obj[key] === 'string' && obj[key].length > 0) {
                     try {
                        const imageResponse = await ai.models.generateContent({
                            model: 'gemini-2.5-flash-image',
                            contents: { parts: [{ text: obj[key] }] },
                            config: { responseModalities: [Modality.IMAGE] },
                        });
                        
                         for (const part of imageResponse.candidates[0].content.parts) {
                            if (part.inlineData) {
                                obj['imageBase64'] = part.inlineData.data;
                                break;
                            }
                        }
                     } catch (imgError) {
                        console.error("Image generation failed for prompt:", obj[key], imgError);
                        obj['imageBase64'] = ''; // Set empty on error to prevent client crashes
                     }
                     delete obj[key]; // Clean up the prompt field
                } else {
                     await generateImagesInObject(obj[key]); // Recurse into other properties
                }
            }
        };

        await generateImagesInObject(data);
        
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
        
        if (error instanceof Error) {
            // Provide more specific feedback for common API key issues
            if (error.message.includes('API key not valid')) {
                clientErrorMessage = 'Sunucuda yapılandırılan API anahtarı geçersiz. Lütfen Vercel proje ayarlarınızı kontrol edin.';
            } else if (error.message.includes('permission denied')) {
                 clientErrorMessage = 'API anahtarının bu modeli kullanma izni yok veya projeniz için faturalandırma etkin değil.';
            }
        }
        
        return res.status(500).json({ error: clientErrorMessage });
    }
}

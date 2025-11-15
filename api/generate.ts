
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * Finds all objects within a nested structure that contain an 'imagePrompt' key.
 * This is used to gather all image generation tasks to run them in parallel.
 * @param obj The object or array to search through.
 * @returns An array of unique objects that have an 'imagePrompt'.
 */
const findObjectsWithImagePrompts = (obj: any): any[] => {
    const objectsToProcess: any[] = [];
    const visited = new Set();

    function traverse(current: any) {
        if (!current || typeof current !== 'object' || visited.has(current)) {
            return;
        }
        visited.add(current);
        
        if (Array.isArray(current)) {
            for (const item of current) {
                traverse(item);
            }
            return;
        }

        if (current.hasOwnProperty('imagePrompt') && typeof current['imagePrompt'] === 'string' && current['imagePrompt'].length > 0) {
            objectsToProcess.push(current);
        }
        
        for (const key in current) {
            if (current.hasOwnProperty(key)) {
                traverse(current[key]);
            }
        }
    }

    traverse(obj);
    return objectsToProcess;
};


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

        let jsonText = textResponse.text;
        if (!jsonText) {
             console.warn("AI returned an empty response text.");
             return res.status(500).json({ error: "Yapay zekadan boş bir metin yanıtı alındı." });
        }
        
        let data;
        try {
            // Handle potential markdown code blocks in the response for robust parsing
            const match = jsonText.match(/```(json)?\s*([\s\S]*?)\s*```/);
            if (match && match[2]) {
                jsonText = match[2];
            }
            data = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("Failed to parse JSON response from AI:", jsonText);
            return res.status(500).json({ error: "Yapay zekadan gelen yanıt ayrıştırılamadı (Geçersiz JSON)." });
        }

        // Step 2: Find all 'imagePrompt' fields and generate images in parallel to prevent timeouts
        const objectsToProcess = findObjectsWithImagePrompts(data);

        if (objectsToProcess.length > 0) {
            const imageGenerationPromises = objectsToProcess.map(async (obj) => {
                const imagePrompt = obj.imagePrompt;
                if (!imagePrompt) return;

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
                    console.error("Image generation failed for prompt:", imagePrompt, imgError);
                    obj['imageBase64'] = ''; // Set empty on error to prevent client crashes
                }
                delete obj.imagePrompt; // Clean up the prompt field after processing
            });
            
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

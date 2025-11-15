
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

/**
 * A robust wrapper for generating and parsing JSON from the Gemini API, with built-in retries.
 * @param ai The GoogleGenAI client instance.
 * @param prompt The prompt to send to the model.
 * @param schema The response schema for the JSON output.
 * @param maxRetries The maximum number of times to retry on failure.
 * @returns The parsed JSON data.
 */
const generateJsonWithRetries = async (ai: GoogleGenAI, prompt: string, schema: any, maxRetries: number = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`JSON Generation: Attempt ${attempt}/${maxRetries}...`);
        try {
            const textResponse = await ai.models.generateContent({
                model: "gemini-2.5-pro",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.5,
                },
            });

            let jsonText = textResponse.text;
            if (!jsonText) {
                console.warn(`Attempt ${attempt} failed: AI returned an empty response text.`);
                if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 500));
                continue; // Retry
            }
            
            console.log(`Attempt ${attempt}: Received raw text from AI. Length: ${jsonText.length}.`);

            // Handle potential markdown code blocks
            const match = jsonText.match(/```(json)?\s*([\s\S]*?)\s*```/);
            if (match && match[2]) {
                jsonText = match[2];
            }
            
            const data = JSON.parse(jsonText);
            console.log(`Attempt ${attempt}: JSON parsing successful.`);
            return data; // Success, exit the loop and return data

        } catch (error) {
            console.error(`Attempt ${attempt} failed with error:`, error);
            if (attempt === maxRetries) {
                throw new Error(`Failed to generate and parse valid JSON after ${maxRetries} attempts.`);
            }
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }
    }
    throw new Error("Failed to get a valid response from the AI model after all retries.");
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

    console.log("--- New Generation Request ---");

    try {
        const { prompt, schema } = req.body;

        if (!prompt || !schema) {
            console.error("Missing prompt or schema in request body.");
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" ve "schema" alanları zorunludur.' });
        }
        
        console.log("Generating content for prompt (first 200 chars):", prompt.substring(0, 200) + "...");
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY environment variable is not set on Vercel.");
            return res.status(500).json({ error: 'Sunucuda API anahtarı yapılandırılmamış.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        // Step 1: Generate main JSON structure with retries
        const data = await generateJsonWithRetries(ai, prompt, schema, 3);
        
        if (!data) {
            console.error("JSON generation with retries failed to produce data.");
            return res.status(500).json({ error: "Yapay zeka modeli tutarlı bir yanıt üretemedi." });
        }
        console.log("Step 1: JSON structure generation successful.");

        // Step 2: Find all 'imagePrompt' fields and generate images in parallel to prevent timeouts
        const objectsToProcess = findObjectsWithImagePrompts(data);
        console.log(`Step 2: Found ${objectsToProcess.length} image prompts to process.`);


        if (objectsToProcess.length > 0) {
            const imageGenerationPromises = objectsToProcess.map(async (obj) => {
                const imagePrompt = obj.imagePrompt;
                if (!imagePrompt) return;

                try {
                    console.log(`Generating image for prompt: "${imagePrompt.substring(0, 50)}..."`);
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
            console.log("Step 2: All image generations complete.");
        }
        
        // Set CORS headers for local development and Vercel preview environments
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Step 3: Return the final JSON with embedded image data
        console.log("Step 3: Returning final data successfully.");
        return res.status(200).json(data);

    } catch (error) {
        // Log the full error on the server for debugging in Vercel logs
        console.error("--- Critical Error in Serverless Function ---");
        console.error("Error occurred for prompt:", req.body.prompt ? req.body.prompt.substring(0, 200) + "..." : "N/A");
        console.error("Full Error:", error);
        
        let clientErrorMessage = "Yapay zeka ile içerik oluşturulurken sunucu tarafında bir hata oluştu.";
        
        if (error instanceof Error) {
            // Provide more specific feedback for common API key issues
            if (error.message.includes('API key not valid')) {
                clientErrorMessage = 'Sunucuda yapılandırılan API anahtarı geçersiz. Lütfen Vercel proje ayarlarınızı kontrol edin.';
            } else if (error.message.includes('permission denied')) {
                 clientErrorMessage = 'API anahtarının bu modeli kullanma izni yok veya projeniz için faturalandırma etkin değil.';
            } else if (error.message.includes('timed out') || error.message.includes('deadline exceeded')) {
                 clientErrorMessage = 'İstek zaman aşımına uğradı. Lütfen daha az karmaşık bir etkinlik oluşturmayı deneyin veya bir süre sonra tekrar deneyin.';
            } else if (error.message.includes('Failed to generate and parse valid JSON')) {
                clientErrorMessage = 'Yapay zeka modeli tutarlı bir yanıt üretemedi. Lütfen tekrar deneyin.'
            }
        }
        
        return res.status(500).json({ error: clientErrorMessage });
    }
}

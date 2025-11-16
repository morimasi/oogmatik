
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

const generateImageWithRetries = async (ai: GoogleGenAI, prompt: string, maxRetries: number = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`Image Generation for prompt "${prompt.substring(0, 50)}...": Attempt ${attempt}/${maxRetries}...`);
        try {
            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            const partWithImageData = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

            if (partWithImageData?.inlineData) {
                console.log(`Attempt ${attempt} successful.`);
                return partWithImageData.inlineData.data;
            } else {
                 console.warn(`Attempt ${attempt} failed: AI did not return image data.`);
                 // Log response for debugging if available
                 if (imageResponse) {
                     console.warn('Full AI Response:', JSON.stringify(imageResponse, null, 2));
                 }
                 if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                 continue;
            }
        } catch (error: any) {
            console.error(`Attempt ${attempt} failed with error:`, error.message);
            if (attempt === maxRetries) {
                throw new Error(`Failed to generate image after ${maxRetries} attempts.`);
            }
            await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
    }
    throw new Error("Yapay zeka modelinden, yapılan tüm denemelere rağmen geçerli bir resim alınamadı.");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') {
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
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" alanı zorunludur.' });
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY environment variable is not set.");
            return res.status(500).json({ error: 'Sunucuda API anahtarı yapılandırılmamış.' });
        }
        const ai = new GoogleGenAI({ apiKey });

        const imageBase64 = await generateImageWithRetries(ai, prompt);
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json({ imageBase64 });

    } catch (error) {
        console.error("--- Critical Error in /api/generate-image ---", error);
        let errorMessage = "Resim oluşturulurken sunucuda bir hata oluştu.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(500).json({ error: errorMessage });
    }
}

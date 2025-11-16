
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

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
                if (attempt < maxRetries) await new Promise(resolve => setTimeout(resolve, 500 * attempt));
                continue;
            }
            
            console.log(`Attempt ${attempt}: Received raw text from AI. Length: ${jsonText.length}.`);

            // responseMimeType: "application/json" should prevent markdown, but as a fallback:
            const match = jsonText.match(/```(json)?\s*([\s\S]*?)\s*```/);
            if (match && match[2]) {
                jsonText = match[2];
            }
            
            const data = JSON.parse(jsonText);
            console.log(`Attempt ${attempt}: JSON parsing successful.`);
            return data;

        } catch (error: any) {
            console.error(`Attempt ${attempt} failed.`);
            if (error.message) console.error("Error Message:", error.message);
            // Vercel logs might truncate, so substring the stack
            if (error.stack) console.error("Error Stack:", error.stack.substring(0, 1000));
            
            if (attempt === maxRetries) {
                throw new Error(`Yapay zeka ${maxRetries} denemeden sonra geçerli bir JSON üretemedi. Son hata: ${error.message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 500 * attempt)); 
        }
    }
    throw new Error("Tüm denemelerden sonra yapay zeka modelinden geçerli bir yanıt alınamadı.");
};

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

    console.log("--- New Text Generation Request ---");

    try {
        const { prompt, schema } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" ve "schema" alanları zorunludur.' });
        }
        
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Sunucuda API anahtarı yapılandırılmamış.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const data = await generateJsonWithRetries(ai, prompt, schema, 3);
        
        if (!data) {
            return res.status(500).json({ error: "Yapay zeka modeli tutarlı bir yanıt üretemedi." });
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        return res.status(200).json(data);

    } catch (error) {
        console.error("--- Critical Error in /api/generate ---", error);
        
        let clientErrorMessage = "Yapay zeka ile içerik oluşturulurken sunucu tarafında bir hata oluştu.";
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                clientErrorMessage = 'Sunucuda yapılandırılan API anahtarı geçersiz.';
            } else {
                clientErrorMessage = error.message;
            }
        }
        
        return res.status(500).json({ error: clientErrorMessage });
    }
}

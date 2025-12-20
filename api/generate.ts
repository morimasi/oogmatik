
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış veya risk grubundaki çocuklar için bilimsel temelli, hatasız ve JSON formatında eğitim materyali üretmek.
Sadece ham JSON döndür.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { prompt, schema, image, model, mimeType, useSearch } = req.body;
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) return res.status(500).json({ error: 'API anahtarı eksik.' });

        const ai = new GoogleGenAI({ apiKey });
        
        // Kullanıcı isteği doğrultusunda tüm servisler Gemini 3 Flash'a çekildi.
        const selectedModel = "gemini-3-flash-preview";

        const generationConfig = {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.7,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        };

        if (useSearch) {
            (generationConfig as any).tools = [{ googleSearch: {} }];
        }

        let contents: any[] = image ? [
            { parts: [{ inlineData: { mimeType: mimeType || 'image/jpeg', data: image } }, { text: prompt }] }
        ] : [
            { parts: [{ text: prompt }] }
        ];

        const result = await ai.models.generateContent({
            model: selectedModel,
            contents: contents,
            config: generationConfig,
        });
        
        if (result.text) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(200).send(result.text);
        }

        throw new Error("AI failed to generate content.");

    } catch (error: any) {
        console.error("API Handler Error:", error);
        return res.status(500).json({ error: error.message });
    }
}

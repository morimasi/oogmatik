
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const MASTER_MODEL = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
MODEL: Gemini 3 Flash (Thinking & Multimodal Enabled).
Görevin: Klinik hassasiyetle eğitim materyali üretmek.
KURAL: Yanıtın SADECE geçerli bir JSON olmalıdır. Üretimden önce mimari DNA'yı ve pedagojik hedefleri derinlemesine düşün.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

    try {
        const { prompt, schema, image, mimeType, useSearch } = req.body;
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'API anahtarı eksik.' });

        const ai = new GoogleGenAI({ apiKey });

        const config: any = {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.1, 
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ],
            // GEMINI 3 THINKING CONFIGURATION
            maxOutputTokens: 12000,
            thinkingConfig: { thinkingBudget: 4000 }
        };

        if (useSearch) config.tools = [{ googleSearch: {} }];

        let parts: any[] = [];
        if (image) {
            parts.push({ 
                inlineData: { 
                    mimeType: mimeType || 'image/jpeg', 
                    data: image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "") 
                } 
            });
        }
        parts.push({ text: prompt });

        const result = await ai.models.generateContent({
            model: MASTER_MODEL,
            contents: { parts },
            config: config,
        });
        
        if (result.text) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(200).send(result.text);
        }
        throw new Error("AI yanıt üretemedi.");
    } catch (error: any) {
        console.error("API Handler Error:", error);
        return res.status(500).json({ error: error.message });
    }
}

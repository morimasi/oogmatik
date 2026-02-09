
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const DEFAULT_MODEL = "gemini-3-flash-preview";

// Fix: Escaped backticks to prevent premature string termination and syntax errors
const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış çocuklar için bilimsel temelli eğitim materyali üretmek.

KURAL: 
1. Yanıtın SADECE geçerli bir JSON olmalıdır. 
2. Görsel analiz ediyorsan, görselle ilgili yorum yapma, doğrudan JSON dön.
3. Asla Markdown (\`\`\`json) bloğu dışında metin ekleme.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

    try {
        const { prompt, schema, image, mimeType, useSearch, model } = req.body;
        
        // Fix: Initialization using process.env.API_KEY directly as per guidelines
        if (!process.env.API_KEY) return res.status(500).json({ error: 'API anahtarı eksik.' });
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const selectedModel = model || DEFAULT_MODEL;

        // Fix: Renamed generationConfig to config for clarity and removed deprecated 'any' cast if possible, 
        // though keeping the logic for configuration parameters.
        const config: any = {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.1, 
            topP: 0.8,
            topK: 40,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        };

        // OCR için thinking bütçesini kapatmıyoruz, ancak standart üretimde token tasarrufu için kapatıyoruz.
        if (!image) {
            config.thinkingConfig = { thinkingBudget: 0 };
        }

        if (useSearch) config.tools = [{ googleSearch: {} }];

        let parts: any[] = [];
        if (image) {
            parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "") } });
        }
        parts.push({ text: prompt });

        // Fix: contents property structured as an object instead of an array of objects for better compliance
        const result = await ai.models.generateContent({
            model: selectedModel,
            contents: { parts },
            config: config,
        });
        
        // Fix: result.text property access is correct (not calling it as a method)
        if (result.text) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(200).send(result.text);
        }
        throw new Error("AI yanıt üretemedi veya boş bir cevap döndü.");
    } catch (error: any) {
        console.error("API Handler Error:", error);
        return res.status(500).json({ error: error.message });
    }
}

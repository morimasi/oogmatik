
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış veya risk grubundaki çocuklar için bilimsel temelli, hatasız ve JSON formatında eğitim materyali üretmek.
Yanıtın SADECE geçerli bir JSON olmalıdır. Başka hiçbir açıklama yapma.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { prompt, schema, image, mimeType, useSearch } = req.body;
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) return res.status(500).json({ error: 'API anahtarı eksik.' });

        const ai = new GoogleGenAI({ apiKey });
        
        // Tüm sistem gemini-3-flash-preview modeline sabitlendi
        const selectedModel = "gemini-3-flash-preview";

        const generationConfig = {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.4, // Daha tutarlı çıktı için düşürüldü
            topP: 0.8,
            topK: 40,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        };

        if (useSearch) {
            (generationConfig as any).tools = [{ googleSearch: {} }];
        }

        let contents: any[] = image ? [
            { 
                parts: [
                    { inlineData: { mimeType: mimeType || 'image/jpeg', data: image } }, 
                    { text: prompt }
                ] 
            }
        ] : [
            { parts: [{ text: prompt }] }
        ];

        const result = await ai.models.generateContent({
            model: selectedModel,
            contents: contents,
            config: generationConfig,
        });
        
        if (result.text) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(200).send(result.text);
        }

        throw new Error("AI yanıt üretemedi.");

    } catch (error: any) {
        console.error("API Handler Error:", error);
        // Hata mesajını daha temiz gönderelim
        const msg = error.message?.includes("Safety") ? "İçerik güvenlik filtresine takıldı." : error.message;
        return res.status(500).json({ error: msg });
    }
}


import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const DEFAULT_MODEL = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış veya risk grubundaki çocuklar için bilimsel temelli, hatasız ve JSON formatında eğitim materyali üretmek.
Multimodal yeteneklerini (görsel analiz ve zengin metin üretimi) en üst seviyede kullan.
Yanıtın SADECE geçerli bir JSON olmalıdır. Başka hiçbir açıklama yapma.
DİKKAT: Cümleleri veya objeleri sonsuz döngüde tekrar etme!
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

    try {
        const { prompt, schema, image, mimeType, useSearch, model } = req.body;
        const apiKey = process.env.API_KEY;
        if (!apiKey) return res.status(500).json({ error: 'API anahtarı eksik.' });

        const ai = new GoogleGenAI({ apiKey });
        const selectedModel = model || DEFAULT_MODEL;

        const generationConfig: any = {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.2, 
            topP: 0.8,
            topK: 40,
            // Gemini 3 modelleri için akıl yürütme bütçesini sınırla
            thinkingConfig: { thinkingBudget: 0 },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        };

        if (useSearch) generationConfig.tools = [{ googleSearch: {} }];

        let parts: any[] = [];
        if (image) {
            parts.push({ inlineData: { mimeType: mimeType || 'image/jpeg', data: image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "") } });
        }
        parts.push({ text: prompt });

        const result = await ai.models.generateContent({
            model: selectedModel,
            contents: [{ role: 'user', parts }],
            config: generationConfig,
        });
        
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

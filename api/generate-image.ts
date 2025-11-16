
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

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

        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const partWithImageData = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (partWithImageData?.inlineData) {
            const imageBase64 = partWithImageData.inlineData.data;
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(200).json({ imageBase64 });
        } else {
            throw new Error("Yapay zeka modelinden resim verisi alınamadı.");
        }
    } catch (error) {
        console.error("Resim oluşturma hatası:", error);
        let errorMessage = "Resim oluşturulurken bir hata oluştu.";
        if (error instanceof Error && error.message.includes('deadline')) {
            errorMessage = "Resim oluşturma isteği zaman aşımına uğradı.";
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(500).json({ error: errorMessage });
    }
}

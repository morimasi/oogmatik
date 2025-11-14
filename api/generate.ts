import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { prompt, schema } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'Prompt and schema are required.' });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.9,
            },
        });

        const jsonText = response.text;
        if (!jsonText) {
             return res.status(500).json({ error: "AI returned an empty response." });
        }
        
        const parsed = JSON.parse(jsonText);
        
        // Set CORS headers for local development and Vercel preview
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        return res.status(200).json(parsed);

    } catch (error) {
        console.error("Error in serverless function:", error);
        return res.status(500).json({ error: "Yapay zeka ile içerik oluşturulurken sunucu tarafında bir hata oluştu." });
    }
}
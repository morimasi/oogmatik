import { GoogleGenAI } from "@google/genai";

// This is a Vercel serverless function.
export default async function handler(req, res) {
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

    try {
        const { prompt, schema } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'Prompt and schema are required.' });
        }
        
        // This is where we securely use the API key from Vercel's environment variables.
        // It's never exposed to the client.
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'API key is not configured on the server.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.9, // Keep the creativity setting
            },
        });

        const jsonText = response.text;
        if (!jsonText) {
             return res.status(500).json({ error: "AI returned an empty response." });
        }
        
        const parsed = JSON.parse(jsonText);
        
        // Set CORS headers for local development and Vercel preview environments
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        return res.status(200).json(parsed);

    } catch (error) {
        console.error("Error in serverless function:", error);
        // Don't leak detailed server errors to the client
        return res.status(500).json({ error: "Yapay zeka ile içerik oluşturulurken sunucu tarafında bir hata oluştu." });
    }
}

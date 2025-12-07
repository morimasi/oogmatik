
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// System Instruction: The AI's persona and strict rules.
// Note: Specific pedagogical rules are now injected via the prompt body from the client (prompts.ts),
// but this acts as a global safety and role enforcement layer.
const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış veya risk grubundaki çocuklar için **bilimsel temelli, hatasız ve JSON formatında** eğitim materyali üretmek.

KESİN KURALLAR:
1. Sadece JSON döndür.
2. Türkçe dilbilgisi kurallarına %100 uy.
3. Çocuk dostu, pozitif ve teşvik edici ol.
4. "imagePrompt" alanlarını İngilizce ve detaylı görsel betimlemelerle doldur.
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
        const { prompt, schema, model } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" ve "schema" alanları zorunludur.' });
        }
        
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            console.error("API_KEY bulunamadı.");
            return res.status(500).json({ error: 'Sunucu yapılandırma hatası: API anahtarı eksik.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        // Use flash model by default for speed and cost efficiency
        let selectedModel = model || "gemini-2.5-flash"; 

        try {
            // Streaming yanıtı başlat
            const stream = await ai.models.generateContentStream({
                model: selectedModel, 
                contents: prompt, // The prompt now contains the rich pedagogical instructions from prompts.ts
                config: {
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.7, // Slightly creative but controlled
                    topP: 0.95,
                    topK: 40,
                    // Safety Settings: Allow educational content
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    ]
                },
            });

            // Headerları ayarla - Text stream olarak döneceğiz
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');

            // Chunkları client'a ilet
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    res.write(chunkText);
                }
            }
            
            res.end();

        } catch (error: any) {
            console.error(`Stream error (${selectedModel}):`, error.message);
            if (!res.headersSent) {
                if (error.status === 429 || error.status === 503) {
                    return res.status(429).json({ error: "API kotası aşıldı veya servis meşgul." });
                }
                return res.status(500).json({ error: "Yapay zeka akışı sırasında hata oluştu." });
            } else {
                res.end();
            }
        }

    } catch (error: unknown) {
        console.error("API Handler Error:", error);
        if (!res.headersSent) {
            let errorMessage = "Sunucu hatası.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            return res.status(500).json({ error: errorMessage });
        }
        res.end();
    }
}

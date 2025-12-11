
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// System Instruction: The AI's persona and strict rules.
const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış veya risk grubundaki çocuklar için **bilimsel temelli, hatasız ve JSON formatında** eğitim materyali üretmek.

KESİN KURALLAR:
1. Sadece JSON döndür. Markdown bloğu kullanma (örn: \`\`\`json ... \`\`\` YAZMA).
2. Türkçe dilbilgisi kurallarına %100 uy.
3. Çocuk dostu, pozitif ve teşvik edici ol.
4. "imagePrompt" alanlarını İngilizce ve detaylı görsel betimlemelerle doldur.
5. Multimodal Tasarımcı gibi davran: Metin ve görsel uyumunu en üst düzeyde tut.
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
        const { prompt, schema, image } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" ve "schema" alanları zorunludur.' });
        }
        
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            console.error("API_KEY bulunamadı.");
            return res.status(500).json({ error: 'Sunucu yapılandırma hatası: API anahtarı eksik.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        // Common Configuration
        const generationConfig = {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.7, 
            topP: 0.95,
            topK: 40,
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        };

        // Build contents array
        let contents: any = prompt;
        if (image) {
            // Remove header if present (data:image/png;base64,)
            const cleanImage = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
            contents = {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: cleanImage } },
                    { text: prompt }
                ]
            };
        }

        // --- UPDATED ROBUST MODEL STRATEGY ---
        // 1. Primary: Gemini 2.5 Flash (Newest, Fastest, Best Multimodal)
        // 2. Secondary: Gemini 1.5 Flash (Most Stable, High Rate Limits)
        // 3. Tertiary: Gemini 1.5 Pro Latest (Fallback for complex reasoning if flash fails)
        
        const modelChain = [
            "gemini-2.5-flash",        // HIZLI, GÜÇLÜ VE YENİ
            "gemini-1.5-flash",        // SAĞLAM YEDEK
            "gemini-1.5-pro-latest"    // SON ÇARE (Daha yavaş ama zeki)
        ];
        
        let lastError = null;
        let successResponseText = null;

        // Try models in sequence (Daisy-chaining)
        for (const currentModel of modelChain) {
            try {
                console.log(`Attempting generation with model: ${currentModel} (Image: ${!!image})`);
                
                const result = await ai.models.generateContent({
                    model: currentModel, 
                    contents: contents, 
                    config: generationConfig,
                });
                
                successResponseText = result.text;
                if (!successResponseText) throw new Error("Empty response from AI");

                // Clean markdown code blocks if present
                successResponseText = successResponseText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
                
                // If we got here, success!
                break; 

            } catch (error: any) {
                const errorMsg = error.message || String(error);
                // Extract status code if available
                const status = error.status || (error.response ? error.response.status : 500);
                
                console.warn(`Model ${currentModel} failed (${status}):`, errorMsg);
                lastError = { status, message: errorMsg };

                // Critical Auth errors -> Fail immediately, don't retry other models
                if (status === 401 || status === 403 || errorMsg.includes('API key')) {
                     return res.status(status).json({ error: `Yetkilendirme hatası: ${errorMsg}` });
                }
                
                // If it's a 404 (Model Not Found) or 429 (Rate Limit), we continue to the next model in the loop
                // ... continue loop
            }
        }

        if (successResponseText) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(200).send(successResponseText);
        }

        // All models failed
        console.error("All AI models failed.");
        return res.status(lastError?.status || 500).json({ 
            error: `Tüm yapay zeka modelleri meşgul veya erişilemez. (${lastError?.message})` 
        });

    } catch (error: any) {
        console.error("API Handler Critical Error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Sunucu tarafında kritik bir hata oluştu." });
        }
        res.end();
    }
}

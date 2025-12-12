
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

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
        const { prompt, schema, image, model, mimeType } = req.body;

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

        // Build contents array properly for @google/genai SDK
        let contents: any[];
        
        if (image) {
            // Remove header if present (data:image/png;base64,) just in case
            const cleanImage = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
            contents = [
                {
                    parts: [
                        { inlineData: { mimeType: mimeType || 'image/jpeg', data: cleanImage } },
                        { text: prompt }
                    ]
                }
            ];
        } else {
            // Text only
            contents = [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ];
        }

        // --- OFFICIAL STABLE MODEL STRATEGY (Updated) ---
        // 1. gemini-1.5-flash: Highest Rate Limits (15 RPM free), Fast, Multimodal.
        // 2. gemini-1.5-flash-8b: Optimized for simple tasks, very fast.
        // 3. gemini-1.5-pro: Higher intelligence, lower rate limit (2 RPM free). Use as last resort.
        
        // Removed 'exp' models to prevent instability.
        const stableModels = [
            "gemini-1.5-flash", 
            "gemini-1.5-flash-8b", 
            "gemini-1.5-pro"
        ];
        
        // Determine primary model
        let primaryModel = "gemini-1.5-flash"; // Default safe choice

        // If client requested a specific model, check if it is stable
        if (model) {
            if (stableModels.includes(model)) {
                primaryModel = model;
            } else if (model.includes('pro')) {
                primaryModel = "gemini-1.5-pro";
            } else {
                primaryModel = "gemini-1.5-flash";
            }
        }

        // Construct the chain: Primary -> Others
        // Filter out primary from stable list to avoid dupes, then append
        const modelChain = [
            primaryModel,
            ...stableModels.filter(m => m !== primaryModel)
        ];
        
        let lastError = null;
        let successResponseText = null;

        // Try models in sequence (Daisy-chaining)
        for (const currentModel of modelChain) {
            try {
                // console.log(`Attempting generation with model: ${currentModel}`);
                
                const result = await ai.models.generateContent({
                    model: currentModel, 
                    contents: contents, 
                    config: generationConfig,
                });
                
                successResponseText = result.text;
                if (!successResponseText) {
                    if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts[0].text) {
                        successResponseText = result.candidates[0].content.parts[0].text;
                    } else {
                         // Empty response means model failed to generate useful content
                         continue;
                    }
                }

                // Clean markdown code blocks if present
                successResponseText = successResponseText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
                
                // If we got here, success!
                break; 

            } catch (error: any) {
                const errorMsg = error.message || String(error);
                const status = error.status || (error.response ? error.response.status : 500);
                
                console.warn(`Model ${currentModel} failed (${status}):`, errorMsg.substring(0, 100));
                lastError = { status, message: errorMsg, model: currentModel };

                // Critical Auth errors -> Fail immediately
                if (status === 401 || status === 403 || errorMsg.includes('API key')) {
                     return res.status(status).json({ error: `Yetkilendirme hatası: ${errorMsg}` });
                }
                // Continue loop for 429 (Quota), 503 (Overloaded), 404 (Not Found)
            }
        }

        if (successResponseText) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(200).send(successResponseText);
        }

        // All models failed
        console.error("All AI models failed.");
        return res.status(lastError?.status || 500).json({ 
            error: `Yapay zeka servisine ulaşılamadı. Lütfen kısa bir süre sonra tekrar deneyin. (Hata: ${lastError?.status})` 
        });

    } catch (error: any) {
        console.error("API Handler Critical Error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Sunucu tarafında kritik bir hata oluştu." });
        }
        res.end();
    }
}

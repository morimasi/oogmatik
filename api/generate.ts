
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
        const { prompt, schema, model, image } = req.body;

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
            // Safety Settings: Allow educational content
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
            contents = {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: image } },
                    { text: prompt }
                ]
            };
        }

        // --- MODEL SELECTION STRATEGY ---
        // Primary: gemini-2.5-flash (Most current/stable for general text)
        // Primary Vision: gemini-2.5-flash (Supports multimodal)
        // Fallback: gemini-1.5-flash (Reliable backup)
        
        // Determine requested model or default
        let requestedModel = model || "gemini-2.5-flash";
        
        // Fallback list to try in order
        const modelsToTry = [
            requestedModel,
            "gemini-2.5-flash",
            "gemini-1.5-flash", // Safe backup
            "gemini-1.5-pro-latest" // Last resort, but powerful
        ];
        
        // Deduplicate
        const uniqueModels = [...new Set(modelsToTry)];

        // STRATEGY SPLIT: 
        // 1. For Images: Use non-streaming with Fallback Logic (Crucial for 429/404 errors)
        // 2. For Text: Use generateContentStream for better UX, but handle model fallback manually if needed.

        if (image) {
            for (const currentModel of uniqueModels) {
                try {
                    console.log(`Trying Vision Model: ${currentModel}`);
                    const result = await ai.models.generateContent({
                        model: currentModel, 
                        contents: contents, 
                        config: generationConfig,
                    });
                    
                    let text = result.text || "{}";
                    // Remove markdown code blocks if present
                    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
                    
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.status(200).send(text); 
                    return; // Exit on success
                } catch (error: any) {
                    const errorMsg = error.message || String(error);
                    console.warn(`Model ${currentModel} failed:`, errorMsg);
                    
                    // Specific Error Handling for Retry Logic:
                    // 429: Too Many Requests (Quota)
                    // 503: Service Unavailable
                    // 404: Model Not Found (Crucial fix for deprecated models)
                    const status = error.status || (error.response ? error.response.status : 0);
                    
                    if (status !== 429 && status !== 503 && status !== 404 && !errorMsg.includes("not found")) {
                         // If it's a logic error (400), don't retry, just fail.
                         throw error; 
                    }
                    
                    // If it's the last model in the list, throw the error
                    if (currentModel === uniqueModels[uniqueModels.length - 1]) {
                        throw error;
                    }
                    
                    console.log(`Switching to fallback model...`);
                    // Continue loop to next model...
                }
            }
            return;
        }

        // Streaming for Text-Only Requests
        // We wrap the stream attempt in a loop to handle model fallbacks for text too
        for (const currentModel of uniqueModels) {
            try {
                const stream = await ai.models.generateContentStream({
                    model: currentModel, 
                    contents: contents, 
                    config: generationConfig,
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
                return; // Success

            } catch (error: any) {
                const errorMsg = error.message || String(error);
                console.error(`Stream error (${currentModel}):`, errorMsg);
                
                // If headers sent, we can't retry gracefully in this stream response
                if (res.headersSent) {
                    res.end();
                    return;
                }
                
                // If it's the last model, return error
                if (currentModel === uniqueModels[uniqueModels.length - 1]) {
                    if (error.status === 429 || error.status === 503) {
                        return res.status(429).json({ error: "API kotası aşıldı veya servis meşgul. (Text)" });
                    }
                    return res.status(500).json({ error: `Yapay zeka akışı sırasında hata oluştu: ${errorMsg}` });
                }
                
                // Continue to next model
                continue;
            }
        }

    } catch (error: any) {
        console.error("API Handler Error:", error);
        if (!res.headersSent) {
            let errorMessage = "Sunucu hatası.";
            let statusCode = 500;
            
            if (error.status === 429 || error.status === 503) {
                statusCode = 429;
                errorMessage = "API kotası aşıldı veya servis meşgul. Lütfen kısa bir süre sonra tekrar deneyin.";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            // Clean up error message for user
            if (errorMessage.includes("404") || errorMessage.includes("not found")) {
                 errorMessage = "Model yapılandırma hatası (Model Bulunamadı veya Erişim Yok).";
            }
            
            return res.status(statusCode).json({ error: errorMessage });
        }
        res.end();
    }
}

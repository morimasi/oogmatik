
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

        // --- ROBUST MODEL STRATEGY ---
        // 1. Primary: Gemini 1.5 Flash (Fastest, High Throughput, Multimodal)
        // 2. Secondary: Gemini 1.5 Pro (More Intelligent, Higher Limits, Multimodal fallback)
        // 3. Tertiary: Gemini 1.0 Pro (Legacy Text-Only fallback if no image)
        
        const modelChain = [
            "gemini-1.5-flash", // HIZLI VE GÜÇLÜ
            "gemini-1.5-pro",   // ZEKİ VE KARMAŞIK
            "gemini-1.0-pro"    // GÜVENLİ LİMAN (Sadece metin ise)
        ];
        
        // If image is present, remove text-only models from fallback chain
        const activeModels = image 
            ? modelChain.filter(m => !m.includes('1.0')) 
            : modelChain;

        let lastError = null;

        // Try models in sequence (Daisy-chaining)
        for (const currentModel of activeModels) {
            try {
                console.log(`Attempting generation with model: ${currentModel} (Image: ${!!image})`);
                
                // Use streaming for text-only to keep connection alive, regular for complex JSON to ensure integrity
                // For JSON schema enforcement, generateContent is often safer than stream for parsing assurance
                const result = await ai.models.generateContent({
                    model: currentModel, 
                    contents: contents, 
                    config: generationConfig,
                });
                
                let text = result.text || "{}";
                // Clean markdown code blocks if present
                text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
                
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.status(200).send(text); 
                return; // Success! Exit function.

            } catch (error: any) {
                const errorMsg = error.message || String(error);
                const status = error.status || (error.response ? error.response.status : 500);
                
                console.warn(`Model ${currentModel} failed (${status}):`, errorMsg);
                lastError = { status, message: errorMsg };

                // Critical Auth errors -> Fail immediately, don't retry other models
                if (status === 401 || status === 403 || errorMsg.includes('API key')) {
                     return res.status(status).json({ error: `Yetkilendirme hatası: ${errorMsg}` });
                }
                
                // If it's the last model, throw/return error
                if (currentModel === activeModels[activeModels.length - 1]) {
                    break;
                }
                // Continue to next model in loop...
            }
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

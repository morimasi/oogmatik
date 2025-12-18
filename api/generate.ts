
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış veya risk grubundaki çocuklar için **bilimsel temelli, hatasız ve JSON formatında** eğitim materyali üretmek.

*** ÇOK ÖNEMLİ FORMAT KURALLARI ***
1. Çıktın, başından sonuna kadar **SADECE GEÇERLİ BİR JSON** olmalıdır.
2. JSON başına veya sonuna asla sohbet metni, açıklama, "İşte cevabınız:" gibi ifadeler EKLEME.
3. Markdown kod bloğu (\`\`\`json ... \`\`\`) KULLANMA. Doğrudan ham JSON döndür.
4. "imagePrompt" alanlarını İngilizce ve detaylı görsel betimlemelerle doldur.
5. Türkçe dilbilgisi kurallarına %100 uy.
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
        const { prompt, schema, image, model, mimeType, useSearch } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" ve "schema" alanları zorunludur.' });
        }
        
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            console.error("API_KEY bulunamadı.");
            return res.status(500).json({ error: 'Sunucu yapılandırma hatası: API anahtarı eksik.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        let finalPrompt = prompt;

        // --- STEP 1: GOOGLE SEARCH GROUNDING (OPTIONAL) ---
        if (useSearch) {
            try {
                const searchModel = "gemini-2.5-flash"; 
                
                const searchPrompt = `
                I need accurate, real-time information to create educational content.
                Please research the following topic thoroughly using Google Search:
                
                "${prompt.substring(0, 300)}..."
                
                Focus on:
                - Recent facts and figures
                - Correct terminology
                - Interesting details suitable for children
                
                Provide a summary of the findings.
                `;

                const searchResponse = await ai.models.generateContent({
                    model: searchModel,
                    contents: [{ role: 'user', parts: [{ text: searchPrompt }] }],
                    config: {
                        tools: [{ googleSearch: {} }],
                    }
                });
                
                const searchResultText = searchResponse.text;
                
                if (searchResultText) {
                    console.log("Search successful, enriching context.");
                    finalPrompt = `
                    [ARKA PLAN BİLGİSİ / ARAŞTIRMA SONUÇLARI]:
                    ${searchResultText}
                    
                    YUKARIDAKİ GÜNCEL BİLGİLERİ KULLANARAK ASIL GÖREVİ YAP:
                    ${prompt}
                    `;
                }
            } catch (searchError) {
                console.warn("Google Search Grounding failed, proceeding with standard generation:", searchError);
            }
        }

        // --- STEP 2: CONTENT GENERATION (JSON) ---
        
        const generationConfig = {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: schema,
            maxOutputTokens: 8192, // Ensure maximum token limit
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

        let contents: any[];
        
        if (image) {
            const cleanImage = image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
            contents = [
                {
                    parts: [
                        { inlineData: { mimeType: mimeType || 'image/jpeg', data: cleanImage } },
                        { text: finalPrompt }
                    ]
                }
            ];
        } else {
            contents = [
                {
                    parts: [
                        { text: finalPrompt }
                    ]
                }
            ];
        }

        // --- STABLE MODEL STRATEGY ---
        // Prioritize models with higher limits and stability.
        const stableModels = [
            "gemini-2.5-flash",       // Primary: Latest & Fast
            "gemini-1.5-flash",       // Backup: Very Stable
            "gemini-1.5-flash-8b"     // Backup 2: High speed, low cost
        ];
        
        let selectedModel = "gemini-2.5-flash";
        // Only allow overrides if they are in our stable list
        if (model && stableModels.includes(model)) {
            selectedModel = model;
        }

        const modelChain = [
            selectedModel,
            ...stableModels.filter(m => m !== selectedModel)
        ];
        
        let lastError = null;
        let successResponseText = null;

        for (const currentModel of modelChain) {
            try {
                // Add small delay before retries (except first attempt) to handle rate limits gracefully
                if (currentModel !== modelChain[0]) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                console.log(`Trying model: ${currentModel}`);
                const result = await ai.models.generateContent({
                    model: currentModel, 
                    contents: contents, 
                    config: generationConfig,
                });
                
                successResponseText = result.text;
                if (!successResponseText) {
                    // Safe access with optional chaining to prevent TS errors
                    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (candidateText) {
                        successResponseText = candidateText;
                    } else {
                         console.warn(`Model ${currentModel} returned empty response.`);
                         continue; 
                    }
                }

                // Force clean any lingering markdown
                successResponseText = successResponseText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
                break; 

            } catch (error: any) {
                const errorMsg = error.message || String(error);
                const status = error.status || (error.response ? error.response.status : 500);
                
                console.warn(`Model ${currentModel} failed (${status}):`, errorMsg.substring(0, 100));
                lastError = { status, message: errorMsg, model: currentModel };

                // Don't retry auth errors
                if (status === 400 || status === 401 || status === 403 || errorMsg.includes('API key')) {
                     return res.status(status).json({ error: `Yetkilendirme hatası: ${errorMsg}` });
                }
            }
        }

        if (successResponseText) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.status(200).send(successResponseText);
        }

        console.error("All AI models failed.");
        return res.status(lastError?.status || 500).json({ 
            error: `Yapay zeka servisine ulaşılamadı. Tüm modeller meşgul (429) veya hata verdi. Lütfen 30 saniye sonra tekrar deneyin.` 
        });

    } catch (error: any) {
        console.error("API Handler Critical Error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Sunucu tarafında kritik bir hata oluştu." });
        }
        res.end();
    }
}

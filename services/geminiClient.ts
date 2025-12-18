
import { GoogleGenAI } from "@google/genai";

// Helper to attempt JSON repair
const tryRepairJson = (jsonStr: string): any => {
    // 0. Remove Markdown
    let cleaned = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Primary JSON Parse failed, attempting repair...");

        // 1. Fix missing commas between objects in array (Common AI error: {...} {...})
        cleaned = cleaned.replace(/}\s*{/g, '},{');
        
        // 2. Balance Quotes (If cut off inside a string)
        let quoteCount = 0;
        for (let i = 0; i < cleaned.length; i++) {
            if (cleaned[i] === '"' && (i === 0 || cleaned[i-1] !== '\\')) quoteCount++;
        }
        if (quoteCount % 2 !== 0) {
            cleaned += '"';
        }

        // 3. Remove trailing comma (if cut off right after one: "item",)
        if (cleaned.trim().endsWith(',')) {
            cleaned = cleaned.trim().slice(0, -1);
        }

        // 4. Balance Brackets/Braces
        const openBraces = (cleaned.match(/{/g) || []).length;
        const closeBraces = (cleaned.match(/}/g) || []).length;
        const openBrackets = (cleaned.match(/\[/g) || []).length;
        const closeBrackets = (cleaned.match(/\]/g) || []).length;

        let repaired = cleaned;
        for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}';
        for (let i = 0; i < (openBrackets - closeBrackets); i++) repaired += ']';

        try {
            return JSON.parse(repaired);
        } catch (e2) {
             // 5. Aggressive Fallback: Truncate to the last valid comma separator
             const lastComma = repaired.lastIndexOf(',');
             if (lastComma > 0) {
                 const truncated = repaired.substring(0, lastComma);
                 
                 // Re-balance the truncated version
                 const tOpenBraces = (truncated.match(/{/g) || []).length;
                 const tCloseBraces = (truncated.match(/}/g) || []).length;
                 const tOpenBrackets = (truncated.match(/\[/g) || []).length;
                 const tCloseBrackets = (truncated.match(/\]/g) || []).length;
                 
                 let tRepaired = truncated;
                 for (let i = 0; i < (tOpenBraces - tCloseBraces); i++) tRepaired += '}';
                 for (let i = 0; i < (tOpenBrackets - tCloseBrackets); i++) tRepaired += ']';
                 
                 try { return JSON.parse(tRepaired); } catch (e4) { }
             }

             // 6. Last Resort: Find largest valid JSON substring
             const jsonObjectRegex = /{[\s\S]*}/;
             const jsonArrayRegex = /\[[\s\S]*\]/;
             const objectMatch = cleaned.match(jsonObjectRegex);
             const arrayMatch = cleaned.match(jsonArrayRegex);
             let bestMatch = null;
             
             if (objectMatch && arrayMatch) {
                 bestMatch = objectMatch[0].length > arrayMatch[0].length ? objectMatch[0] : arrayMatch[0];
             } else if (objectMatch) bestMatch = objectMatch[0];
             else if (arrayMatch) bestMatch = arrayMatch[0];

             if (bestMatch) {
                 try { return JSON.parse(bestMatch); } catch (e5) {}
             }

             console.error("JSON Repair Failed. Final attempt string:", repaired);
             throw new Error("Yapay zeka yanıtı onarılamadı (Bozuk Veri Formatı).");
        }
    }
};

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

// --- CLIENT SIDE FALLBACK ---
const generateDirectly = async (params: { 
    prompt: string, 
    schema: any, 
    model?: string, 
    image?: string, 
    mimeType?: string,
    useSearch?: boolean 
}) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Sunucu bağlantısı yok ve API Anahtarı eksik.");

    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare contents
    let contents: any[] = [];
    if (params.image) {
        // Ensure clean base64
        const cleanBase64 = params.image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
        contents = [{
            parts: [
                { inlineData: { mimeType: params.mimeType || 'image/jpeg', data: cleanBase64 } },
                { text: params.prompt }
            ]
        }];
    } else {
        contents = [{ parts: [{ text: params.prompt }] }];
    }

    const modelName = params.model || 'gemini-2.5-flash';
    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
    };

    if (params.useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    // Stable Model Chain logic for Client Side
    const models = [modelName, 'gemini-2.5-flash', 'gemini-1.5-flash'];
    let lastError;

    for (const m of models) {
        try {
            console.log(`[Client Fallback] Trying model: ${m}`);
            const response = await ai.models.generateContent({
                model: m,
                contents: contents,
                config: config
            });
            
            if (response.text) {
                return tryRepairJson(response.text);
            }
        } catch (e: any) {
            console.warn(`[Client Fallback] Model ${m} failed:`, e.message);
            lastError = e;
            // Short delay
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    
    throw lastError || new Error("Tüm modeller başarısız oldu.");
};

export const generateWithSchema = async (prompt: string, schema: any, model?: string, useSearch?: boolean) => {
    try {
        const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const enhancedPrompt = `${prompt}\n\n[Context ID: ${uniqueSeed}]`;

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: enhancedPrompt, 
                schema, 
                model: model || 'gemini-2.5-flash',
                useSearch: useSearch || false
            }),
        });

        if (response.status === 404) {
            // API route not found, use client fallback
            console.warn("Backend API (404), switching to Client-Side generation.");
            return await generateDirectly({ prompt: enhancedPrompt, schema, model, useSearch });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API hatası: ${response.status} - ${errorText}`);
        }
        
        const fullText = await response.text();
        return tryRepairJson(fullText);

    } catch (error: any) {
        // Fallback for network errors (failed to fetch)
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('404')) {
            console.warn("Network error reaching backend, switching to Client-Side.");
             return await generateDirectly({ prompt, schema, model, useSearch });
        }
        console.error("API Call Error:", error);
        throw error;
    }
};

export const analyzeImage = async (base64Image: string, prompt: string, schema: any, model?: string) => {
    try {
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                schema,
                image: cleanBase64,
                mimeType: 'image/jpeg',
                model: model || 'gemini-2.5-flash'
            }),
        });

        if (response.status === 404) {
             console.warn("Backend API (404), switching to Client-Side Vision.");
             return await generateDirectly({ prompt, schema, image: base64Image, model });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Vision API Failed: ${response.status} - ${errorText}`);
        }
        
        const fullText = await response.text();
        return tryRepairJson(fullText);

    } catch (error: any) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('404')) {
             console.warn("Network error reaching backend Vision, switching to Client-Side.");
             return await generateDirectly({ prompt, schema, image: base64Image, model });
        }
        console.error("Vision API Error:", error);
        throw error;
    }
};

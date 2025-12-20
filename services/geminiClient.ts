
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
             // 5. Aggressive Fallback: Find largest valid JSON substring
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
             throw new Error("Yapay zeka yanıtı onarılamadı.");
        }
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış veya risk grubundaki çocuklar için bilimsel temelli, hatasız ve JSON formatında eğitim materyali üretmek.
Sadece ham JSON döndür, açıklama yapma.
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
    if (!apiKey) throw new Error("API Anahtarı eksik.");

    const ai = new GoogleGenAI({ apiKey });
    
    let contents: any[] = [];
    if (params.image) {
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

    // Her durumda gemini-3-flash-preview kullanımı zorunlu kılındı.
    const modelName = 'gemini-3-flash-preview';
    
    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
    };

    if (params.useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: config
    });
    
    if (response.text) {
        return tryRepairJson(response.text);
    }
    throw new Error("Boş yanıt alındı.");
};

export const generateWithSchema = async (prompt: string, schema: any, model?: string, useSearch?: boolean) => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt, 
                schema, 
                model: 'gemini-3-flash-preview',
                useSearch: useSearch || false
            }),
        });

        if (!response.ok) {
            return await generateDirectly({ prompt, schema, model: 'gemini-3-flash-preview', useSearch });
        }
        
        const fullText = await response.text();
        return tryRepairJson(fullText);

    } catch (error: any) {
        return await generateDirectly({ prompt, schema, model: 'gemini-3-flash-preview', useSearch });
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
                model: 'gemini-3-flash-preview'
            }),
        });

        if (!response.ok) {
            return await generateDirectly({ prompt, schema, image: base64Image, model: 'gemini-3-flash-preview' });
        }
        
        const fullText = await response.text();
        return tryRepairJson(fullText);

    } catch (error: any) {
        return await generateDirectly({ prompt, schema, image: base64Image, model: 'gemini-3-flash-preview' });
    }
};

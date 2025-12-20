
import { GoogleGenAI } from "@google/genai";

const tryRepairJson = (jsonStr: string): any => {
    let cleaned = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Primary JSON Parse failed, attempting extreme repair...");

        // 1. Remove repetitive patterns that often break JSON (Hallucination fix)
        // If the string has the same 50+ chars repeated more than 3 times, it's likely a loop
        const loopMatch = cleaned.match(/(.{50,})\1{2,}/g);
        if (loopMatch) {
            console.warn("Repetition loop detected in AI response. Truncating loop.");
            cleaned = cleaned.replace(/(.{50,})\1{5,}/g, '$1'); 
        }

        // 2. Fix missing commas between elements
        cleaned = cleaned.replace(/}\s*{/g, '},{').replace(/]\s*\[/g, '],[');
        
        // 3. Balance quotes
        let quoteCount = 0;
        for (let i = 0; i < cleaned.length; i++) {
            if (cleaned[i] === '"' && (i === 0 || cleaned[i-1] !== '\\')) quoteCount++;
        }
        if (quoteCount % 2 !== 0) cleaned += '"';

        // 4. Force balance brackets/braces
        let repaired = cleaned;
        const openBraces = (repaired.match(/{/g) || []).length;
        const closeBraces = (repaired.match(/}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;

        for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}';
        for (let i = 0; i < (openBrackets - closeBrackets); i++) repaired += ']';

        try {
            return JSON.parse(repaired);
        } catch (e2) {
             // Final fallback: find the last complete object/array before the mess
             const lastGoodIndex = Math.max(repaired.lastIndexOf('}'), repaired.lastIndexOf(']'));
             if (lastGoodIndex > 0) {
                 const truncated = repaired.substring(0, lastGoodIndex + 1);
                 try { return JSON.parse(truncated); } catch (e3) {}
             }
             throw new Error("Yapay zeka yanıtı onarılamayacak kadar bozuk.");
        }
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
Disleksi, Diskalkuli ve DEHB için materyal üretirsin.
Kural: Sadece JSON döndür. Döngüsel metinlerden (aynı cümleyi tekrar etmek) KESİNLİKLE kaçın.
`;

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
    const modelName = 'gemini-3-flash-preview';
    
    let contents: any[] = [];
    if (params.image) {
        contents = [{
            parts: [
                { inlineData: { mimeType: params.mimeType || 'image/jpeg', data: params.image } },
                { text: params.prompt }
            ]
        }];
    } else {
        contents = [{ parts: [{ text: params.prompt }] }];
    }

    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: 0.2, // Lower temperature to avoid loops
    };

    if (params.useSearch) config.tools = [{ googleSearch: {} }];

    const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: config
    });
    
    if (response.text) return tryRepairJson(response.text);
    throw new Error("Boş yanıt alındı.");
};

export const generateWithSchema = async (prompt: string, schema: any, model?: string, useSearch?: boolean) => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, schema, model: 'gemini-3-flash-preview', useSearch: useSearch || false }),
        });
        if (!response.ok) return await generateDirectly({ prompt, schema, useSearch });
        const fullText = await response.text();
        return tryRepairJson(fullText);
    } catch (error: any) {
        return await generateDirectly({ prompt, schema, useSearch });
    }
};

export const analyzeImage = async (base64Image: string, prompt: string, schema: any, model?: string) => {
    try {
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, schema, image: cleanBase64, mimeType: 'image/jpeg', model: 'gemini-3-flash-preview' }),
        });
        if (!response.ok) return await generateDirectly({ prompt, schema, image: cleanBase64 });
        const fullText = await response.text();
        return tryRepairJson(fullText);
    } catch (error: any) {
        return await generateDirectly({ prompt, schema, image: base64Image });
    }
};

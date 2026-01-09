
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

const tryRepairJson = (jsonStr: string): any => {
    let cleaned = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Primary JSON Parse failed, attempting extreme repair...");
        const loopMatch = cleaned.match(/(.{50,})\1{2,}/g);
        if (loopMatch) {
            cleaned = cleaned.replace(/(.{50,})\1{5,}/g, '$1'); 
        }
        cleaned = cleaned.replace(/}\s*{/g, '},{').replace(/]\s*\[/g, '],[');
        let quoteCount = 0;
        for (let i = 0; i < cleaned.length; i++) {
            if (cleaned[i] === '"' && (i === 0 || cleaned[i-1] !== '\\')) quoteCount++;
        }
        if (quoteCount % 2 !== 0) cleaned += '"';
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
Kural: Sadece JSON döndür. Multimodal yeteneklerini (görsel analiz ve zengin metin üretimi) en üst seviyede kullan.
Döngüsel metinlerden (aynı cümleyi tekrar etmek) KESİNLİKLE kaçın.
Eğer görseller için SVG kodu istenirse, bunu imageBase64 alanına doğrudan yaz.
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
    const modelName = params.model || DEFAULT_MODEL;
    
    let parts: any[] = [];
    if (params.image) {
        parts.push({ 
            inlineData: { 
                mimeType: params.mimeType || 'image/jpeg', 
                data: params.image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "") 
            } 
        });
    }
    parts.push({ text: params.prompt });

    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: 0.2,
    };

    if (params.useSearch) config.tools = [{ googleSearch: {} }];

    const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts }],
        config: config
    });
    
    if (response.text) return tryRepairJson(response.text);
    throw new Error("Boş yanıt alındı.");
};

export const generateWithSchema = async (prompt: string, schema: any, model?: string, useSearch?: boolean) => {
    const targetModel = model || DEFAULT_MODEL;
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, schema, model: targetModel, useSearch: useSearch || false }),
        });
        if (!response.ok) return await generateDirectly({ prompt, schema, model: targetModel, useSearch });
        const fullText = await response.text();
        return tryRepairJson(fullText);
    } catch (error: any) {
        return await generateDirectly({ prompt, schema, model: targetModel, useSearch });
    }
};

/**
 * Görüntü analizi için multimodal metot.
 */
export const analyzeImage = async (image: string, prompt: string, schema: any, model?: string) => {
    return await generateDirectly({ 
        prompt, 
        schema, 
        model: model || DEFAULT_MODEL, 
        image 
    });
};

/**
 * Yeni: Gemini 2.5 Flash ile doğrudan görsel üretimi (Base64)
 * Bu metot, dış servisler yerine Gemini'nin multimodal yeteneğini kullanır.
 */
export const generateNanoImage = async (prompt: string): Promise<string | null> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({
            model: IMAGE_GEN_MODEL,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                imageConfig: { aspectRatio: "1:1" }
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Nano image generation failed:", e);
        return null;
    }
};

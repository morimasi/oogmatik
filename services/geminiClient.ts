
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

const tryRepairJson = (jsonStr: string): any => {
    // 1. Markdown bloklarını ve görünmez karakterleri temizle
    let cleaned = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Primary JSON Parse failed, attempting deep regex extraction...");
        
        // 2. En geniş kapsamlı {} veya [] bloğunu bul (Cerrahi müdahale)
        const firstOpenBrace = cleaned.indexOf('{');
        const firstOpenBracket = cleaned.indexOf('[');
        let startIdx = -1;
        let char = '';

        if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
            startIdx = firstOpenBrace;
            char = '}';
        } else if (firstOpenBracket !== -1) {
            startIdx = firstOpenBracket;
            char = ']';
        }

        if (startIdx !== -1) {
            const lastIdx = cleaned.lastIndexOf(char);
            if (lastIdx !== -1) {
                const extracted = cleaned.substring(startIdx, lastIdx + 1);
                try {
                    return JSON.parse(extracted);
                } catch (e2) {
                    // 3. Eksik parantezleri otomatik tamamlama denemesi
                    let repaired = extracted;
                    const openBraces = (repaired.match(/{/g) || []).length;
                    const closeBraces = (repaired.match(/}/g) || []).length;
                    for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}';
                    
                    try {
                        return JSON.parse(repaired);
                    } catch (e3) {
                        throw new Error("AI yanıtı geçerli bir JSON yapısına sahip değil.");
                    }
                }
            }
        }
        throw new Error("Yanıt içinde geçerli bir veri bloğu bulunamadı.");
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun Klinik Yapay Zeka Motorusun.
Görevin: Özel öğrenme güçlüğü olan çocuklar için materyal üretmek.
KESİN KURAL: Asla açıklama yapma. Sadece geçerli JSON döndür. 
Görsel analiz ediyorsan sadece teknik blueprint ve yapısal veriye odaklan.
`;

const generateDirectly = async (params: { 
    prompt: string, 
    schema: any, 
    model?: string, 
    image?: string, 
    mimeType?: string,
    useSearch?: boolean,
    isOcr?: boolean
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
        temperature: 0.1,
    };

    if (!params.isOcr) {
        config.thinkingConfig = { thinkingBudget: 0 };
    }

    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: config
    });
    
    const text = response.text;
    if (text) return tryRepairJson(text);
    throw new Error("Yapay zeka yanıt üretemedi.");
};

export const generateWithSchema = async (prompt: string, schema: any, model?: string, useSearch?: boolean) => {
    return await generateDirectly({ prompt, schema, model, useSearch, isOcr: false });
};

export const analyzeImage = async (image: string, prompt: string, schema: any, model?: string) => {
    return await generateDirectly({ 
        prompt, 
        schema, 
        model: model || DEFAULT_MODEL, 
        image,
        isOcr: true 
    });
};

export const generateNanoImage = async (prompt: string): Promise<string | null> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) return null;
    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({
            model: IMAGE_GEN_MODEL,
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
        });
        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        return null;
    }
};

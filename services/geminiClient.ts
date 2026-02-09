
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

const tryRepairJson = (jsonStr: string): any => {
    // 1. Markdown bloklarını temizle
    let cleaned = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Primary JSON Parse failed, attempting regex-based extraction...");
        
        // 2. Regex ile en geniş kapsamlı {} veya [] bloğunu bul (AI'nın fazla konuştuğu durumlar için)
        const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        
        if (jsonMatch) {
            const extracted = jsonMatch[0];
            try {
                return JSON.parse(extracted);
            } catch (e2) {
                console.warn("Regex extraction failed, attempting structural repair...");
                // 3. Eksik parantezleri kapatma (Stratejik onarım)
                let repaired = extracted;
                const openBraces = (repaired.match(/{/g) || []).length;
                const closeBraces = (repaired.match(/}/g) || []).length;
                const openBrackets = (repaired.match(/\[/g) || []).length;
                const closeBrackets = (repaired.match(/\]/g) || []).length;

                for (let i = 0; i < (openBraces - closeBraces); i++) repaired += '}';
                for (let i = 0; i < (openBrackets - closeBrackets); i++) repaired += ']';
                
                try {
                    return JSON.parse(repaired);
                } catch (e3) {
                    console.error("Structural repair failed completely.");
                    throw new Error("Yapay zeka yanıtı geçerli bir veri yapısına sahip değil.");
                }
            }
        }
        throw new Error("Yanıt içinde JSON bloğu bulunamadı.");
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun Klinik Yapay Zeka Motorusun.
Görevin: Disleksi, Diskalkuli ve DEHB tanısı almış çocuklar için tıbbi ve pedagojik hassasiyete sahip materyaller üretmek.

KURAL: 
1. Sadece geçerli JSON döndür. Konuşma, açıklama yapma.
2. Görsel analiz ediyorsan, tasarımın mimari yapısını (Layout) çöz.
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

    // OCR işlemlerinde düşünme bütçesini açık tutuyoruz
    if (!params.isOcr) {
        config.thinkingConfig = { thinkingBudget: 0 };
    }

    if (params.useSearch) config.tools = [{ googleSearch: {} }];

    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: config
    });
    
    if (response.text) return tryRepairJson(response.text);
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
            config: {
                imageConfig: { aspectRatio: "1:1" }
            }
        });

        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (e) {
        console.error("Image generation failed:", e);
        return null;
    }
};

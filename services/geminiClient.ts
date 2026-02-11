
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

/**
 * AI yanıtı içinden JSON bloğunu cımbızla çeker.
 * Markdown bloklarını (```json) ve çevreleyici metinleri temizler.
 */
const tryRepairJson = (jsonStr: string): any => {
    // 1. Temel temizlik
    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    
    // 2. Markdown bloklarını kaldır
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Standart JSON parse başarısız, derin ayıklama deneniyor...");
        
        // 3. Regex ile en geniş kapsamlı {} veya [] bloğunu bul
        const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e2) {
                // 4. Parantez eşleşmesi bozuksa manuel düzeltme denemesi (Acil durum)
                let fragment = jsonMatch[0];
                const openBraces = (fragment.match(/\{/g) || []).length;
                const closeBraces = (fragment.match(/\}/g) || []).length;
                
                if (openBraces > closeBraces) {
                    fragment += '}'.repeat(openBraces - closeBraces);
                }
                
                try {
                    return JSON.parse(fragment);
                } catch (e3) {
                    throw new Error("AI yanıtı geçerli bir JSON yapısında değil.");
                }
            }
        }
        throw new Error("Yanıt içinde geçerli bir JSON bloğu tespit edilemedi.");
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun. 
GÖREVİN: Sadece saf JSON veri yapıları üretmek. 
KESİN KURALLAR:
1. Asla açıklama yapma.
2. Markdown ( \`\`\`json ) bloklarını kullanabilirsin ama dışında metin bırakma.
3. Görsel analiz ediyorsan nesnelerin pozisyonlarını ve pedagojik mantığını blueprint olarak çıkar.
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
    
    if (response.text) return tryRepairJson(response.text);
    throw new Error("AI yanıt üretmedi.");
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

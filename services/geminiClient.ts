
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-flash-preview';

/**
 * tryRepairJson: AI'dan gelen ham metni atomik seviyede JSON'a dönüştürür.
 */
const tryRepairJson = (jsonStr: string): any => {
    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        let fragment = jsonMatch ? jsonMatch[0] : cleaned;
        
        fragment = fragment
            .replace(/,\s*([\}\]])/g, '$1')
            .replace(/\\n/g, ' ')
            .replace(/\\"/g, '"');

        const braceCount = (fragment.match(/\{/g) || []).length - (fragment.match(/\}/g) || []).length;
        const bracketCount = (fragment.match(/\[/g) || []).length - (fragment.match(/\\]/g) || []).length;
        
        if (braceCount > 0) fragment += '}'.repeat(braceCount);
        if (bracketCount > 0) fragment += ']'.repeat(bracketCount);
        
        try {
            return JSON.parse(fragment);
        } catch (e2) {
            try {
                const lastBrace = fragment.lastIndexOf('}');
                const lastBracket = fragment.lastIndexOf(']');
                const lastIndex = Math.max(lastBrace, lastBracket);
                const superCleaned = fragment.substring(0, lastIndex + 1);
                return JSON.parse(superCleaned);
            } catch (e3) {
                throw new Error("AI yanıtı JSON formatına dönüştürülemedi.");
            }
        }
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun. 
GÖREVİN: Disleksi/diskalkuli odaklı eğitim blueprintleri üretmek.
KURAL: SADECE SAF JSON DÖN. Açıklama yapma.
MODEL MODU: Thinking & Multimodal Reasoning Aktif.
`;

const generateDirectly = async (params: { 
    prompt: string, 
    schema: any, 
    model?: string, 
    image?: string, 
    mimeType?: string,
    isOcr?: boolean
}) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Anahtarı eksik.");

    const ai = new GoogleGenAI({ apiKey });
    const modelName = DEFAULT_MODEL;
    
    let parts: any[] = [];
    if (params.image) {
        const base64Data = params.image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "").trim();
        parts.push({ 
            inlineData: { 
                mimeType: params.mimeType || 'image/jpeg', 
                data: base64Data
            } 
        });
    }
    parts.push({ text: params.prompt });

    const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: params.schema,
        temperature: 0.1,
        // OPTIMIZATION: 16K -> 8K (Hız için muhakeme bütçesi düşürüldü)
        thinkingConfig: { thinkingBudget: 8000 }
    };

    const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: config
    });
    
    if (response.text) return tryRepairJson(response.text);
    throw new Error("AI yanıt üretmedi.");
};

export const generateWithSchema = async (prompt: string, schema: any, model?: string) => {
    return await generateDirectly({ prompt, schema, model, isOcr: false });
};

export const analyzeImage = async (image: string, prompt: string, schema: any, model?: string) => {
    return await generateDirectly({ 
        prompt, 
        schema, 
        model: DEFAULT_MODEL, 
        image,
        isOcr: true 
    });
};

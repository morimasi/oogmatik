
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

/**
 * AI yanıtı içinden JSON bloğunu cımbızla çeker ve yapısal bozuklukları onarır.
 */
const tryRepairJson = (jsonStr: string): any => {
    // 1. Görünmez karakter temizliği
    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    
    // 2. Markdown bloklarını kaldır (Hem json hem düz bloklar)
    cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Standart JSON parse başarısız, derin ayıklama (RegEx Extraction) deneniyor...");
        
        // 3. En geniş kapsamlı {} veya [] bloğunu bul (İç içe yapılar için optimize edildi)
        const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        
        if (jsonMatch) {
            let fragment = jsonMatch[0];
            
            // 4. Auto-Repair: Eksik parantezleri tamamla
            const openBraces = (fragment.match(/\{/g) || []).length;
            const closeBraces = (fragment.match(/\}/g) || []).length;
            const openBrackets = (fragment.match(/\[/g) || []).length;
            const closeBrackets = (fragment.match(/\]/g) || []).length;
            
            if (openBraces > closeBraces) fragment += '}'.repeat(openBraces - closeBraces);
            if (openBrackets > closeBrackets) fragment += ']'.repeat(openBrackets - closeBrackets);
            
            try {
                return JSON.parse(fragment);
            } catch (e2) {
                // Son çare: String içindeki kaçış karakterlerini temizle
                try {
                    const superCleaned = fragment.replace(/\\n/g, " ").replace(/\\/g, "");
                    return JSON.parse(superCleaned);
                } catch (e3) {
                    throw new Error("AI yanıtı geçerli bir JSON yapısına dönüştürülemedi.");
                }
            }
        }
        throw new Error("Yanıt içinde geçerli bir JSON bloğu tespit edilemedi.");
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun. 
GÖREVİN: Disleksi, Diskalkuli ve DEHB tanılı çocuklar için bilimsel temelli JSON veri yapıları üretmek. 
KESİN KURALLAR:
1. SADECE saf JSON dön. Asla açıklama yapma.
2. Görsel analiz ediyorsan pedagojik mantığı blueprint olarak çıkar.
3. Türkçe karakterleri JSON içinde doğru şekilde kaçır (escape).
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

    // Thinking config is only for Gemini 3 / 2.5
    if (modelName.includes('gemini-3') || modelName.includes('gemini-2.5')) {
        // OCR veya karmaşık analizlerde thinkingBudget artırılır
        config.thinkingConfig = { thinkingBudget: params.isOcr ? 4000 : 0 };
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

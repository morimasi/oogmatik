
import { GoogleGenAI } from "@google/genai";

const DEFAULT_MODEL = 'gemini-3-flash-preview';
const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

const tryRepairJson = (jsonStr: string): any => {
    // 1. Markdown bloklarını ve gereksiz boşlukları temizle
    let cleaned = jsonStr.replace(/```json\s*/gi, '').replace(/```\s*$/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.warn("Primary JSON Parse failed, attempting robust extraction...");
        
        // 2. Metin içindeki ilk { veya [ ile son } veya ] arasını bul
        const firstBrace = cleaned.indexOf('{');
        const firstBracket = cleaned.indexOf('[');
        let startIdx = -1;
        let endIdx = -1;

        if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
            startIdx = firstBrace;
            endIdx = cleaned.lastIndexOf('}');
        } else if (firstBracket !== -1) {
            startIdx = firstBracket;
            endIdx = cleaned.lastIndexOf(']');
        }

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const extracted = cleaned.substring(startIdx, endIdx + 1);
            try {
                return JSON.parse(extracted);
            } catch (e2) {
                console.warn("Extraction failed, attempting structural repair...");
                // 3. Eksik parantezleri kapatma (Basit yapısal onarım)
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

UZMANLIK ALANLARIN:
1. **Nöropsikoloji:** Dikkat testleri (Burdon, Stroop), çalışma belleği görevleri.
2. **Dilbilim:** Fonolojik farkındalık, morfolojik analiz, TDK uyumlu heceleme.
3. **Görsel Algı:** Şekil-zemin ayrımı, uzamsal yönelim, ayna harf diskriminasyonu.

KURAL: Sadece geçerli JSON döndür. 
Her üretimde 'targetedErrors' (örn: ['visual_reversal', 'attention_lapse']) ve 'cognitiveGoal' alanlarını KESİNLİKLE doldur.
Döngüsel metinlerden ve gereksiz süslemelerden kaçın. Tasarımlar sade, odaklanılabilir ve bilimsel temelli olmalıdır.
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
        temperature: 0.15,
        // Gemini 3 serisi için thinking bütçesini 0 yaparak anlık JSON üretimini garantiye al
        thinkingConfig: { thinkingBudget: 0 } 
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

export const analyzeImage = async (image: string, prompt: string, schema: any, model?: string) => {
    return await generateDirectly({ 
        prompt, 
        schema, 
        model: model || DEFAULT_MODEL, 
        image 
    });
};

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

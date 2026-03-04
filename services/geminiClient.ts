import { Type } from "@google/genai";

// Model Seçimi: Google'ın en yeni "Thinking" modeli (Gemini 2.0 Flash Thinking)
// Bu model, karmaşık mantık ve planlama (Chain of Thought) yeteneklerine sahiptir.
const MASTER_MODEL = 'gemini-2.0-flash-thinking-exp-01-21';

// JSON Dengeleyici
const balanceBraces = (str: string): string => {
    let openBraces = (str.match(/\{/g) || []).length;
    let closeBraces = (str.match(/\}/g) || []).length;
    let openBrackets = (str.match(/\[/g) || []).length;
    let closeBrackets = (str.match(/\]/g) || []).length;

    while (openBrackets > closeBrackets) { str += ']'; closeBrackets++; }
    while (openBraces > closeBraces) { str += '}'; closeBraces++; }
    return str;
};

// JSON Onarıcı
const tryRepairJson = (jsonStr: string): any => {
    if (!jsonStr) throw new Error("AI yanıt dönmedi.");
    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    
    // Markdown temizliği
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();

    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIndex = -1;
    
    if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) startIndex = firstBrace;
    else if (firstBracket !== -1) startIndex = firstBracket;

    if (startIndex !== -1) cleaned = cleaned.substring(startIndex);
    cleaned = balanceBraces(cleaned);

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error:", cleaned);
        throw new Error("AI verisi işlenemedi. JSON formatı bozuk.");
    }
};

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun "Nöro-Mimari" motorusun.
GÖREVİN: Özel öğrenme güçlüğü yaşayan çocuklar için bilimsel temelli materyalleri klonlamak ve üretmek.

PRENSİPLER:
1. Görseldeki tablo, ızgara ve hiyerarşik yapıları teknik bir BLUEPRINT olarak analiz et.
2. Klinik çeldiricileri (b-d karışıklığı, ayna etkisi vb.) üretimden önce MUHAKEME ET.
3. Çıktı her zaman geçerli bir JSON olmalıdır.
4. Yanıtında sadece saf JSON döndür, markdown kullanma.
`;

const PEDAGOGICAL_AUDITOR_INSTRUCTION = `
Sen, "Özel Öğrenme Güçlüğü (Disleksi)" alanında uzmanlaşmış kıdemli bir PEDAGOG ve KLİNİK PSİKOLOGSUN.
GÖREVİN: Sana verilen eğitim materyali verisini (JSON) analiz etmek ve dislektik bireyler için uygunluğunu puanlamak.

DENETİM KRİTERLERİ:
1. Negatif Dil: "-me, -ma" ekleri veya "yapma, etme" gibi olumsuz emir kipleri var mı? (Dislektik beyin olumsuzu işlemekte zorlanır).
2. Karmaşıklık: Yönergeler çok mu uzun? (Kısa işleyen bellek yükü).
3. Görsel Yük: Ekran çok mu kalabalık?
4. Hedef Odaklılık: Aktivite tek bir beceriye mi odaklanıyor?

ÇIKTI FORMATI (JSON):
{
    "score": 0-100 arası sayı,
    "verdict": "Mükemmel" | "İyi" | "Riskli" | "Kritik",
    "analysis": [
        { "type": "success" | "warning" | "error", "message": "Tespit edilen durum", "suggestion": "Öneri" }
    ]
}
`;

export interface MultimodalFile {
    data: string;
    mimeType: string;
}

/**
 * AI PEDAGOG: İçerik Denetimi Yapar
 */
export const evaluateContent = async (content: any) => {
    const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY || localStorage.getItem('gemini_api_key');
    if (!apiKey) throw new Error("API Key eksik");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`; // Denetim için hızlı model yeterli

    const prompt = `
    [ANALİZ EDİLECEK İÇERİK]
    ${JSON.stringify(content)}
    
    Lütfen yukarıdaki materyali disleksi dostu tasarım ilkelerine göre acımasızca eleştir ve puanla.
    `;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: PEDAGOGICAL_AUDITOR_INSTRUCTION }] },
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        const rawText = data.candidates[0].content.parts[0].text;
        return tryRepairJson(rawText);
    } catch (e) {
        console.error("Pedagojik analiz hatası:", e);
        return null; // Analiz başarısız olsa bile akışı bozma
    }
};

/**
 * REST API Tabanlı Gemini İstemcisi (Kütüphanesiz & Güvenli)
 */
export const generateCreativeMultimodal = async (params: {
    prompt: string,
    schema?: any, // Schema opsiyonel yapıldı
    files?: MultimodalFile[]
}) => {
    // API Key Önceliği: Environment Variable -> LocalStorage -> Hata
    const apiKey = (import.meta as any).env.VITE_GOOGLE_API_KEY || localStorage.getItem('gemini_api_key');
    
    if (!apiKey) {
        throw new Error("API Anahtarı bulunamadı. Lütfen .env dosyasında VITE_GOOGLE_API_KEY tanımlayın veya ayarlardan ekleyin.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;

    const contents = [];
    
    // Multimodal veri hazırlığı
    const parts = [];
    if (params.files && params.files.length > 0) {
        params.files.forEach(file => {
            const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
            parts.push({
                inline_data: {
                    mime_type: file.mimeType,
                    data: base64Data
                }
            });
        });
    }
    parts.push({ text: params.prompt });
    contents.push({ parts });

    // İstek Gövdesi
    const body: any = {
        contents,
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
        },
        systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
        }
    };

    // Schema varsa ekle (Structured Output)
    if (params.schema) {
        body.generationConfig.responseSchema = params.schema;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API Hatası (${response.status}): ${errText}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("AI geçerli bir aday (candidate) üretmedi.");
        }

        const rawText = data.candidates[0].content.parts[0].text;
        return tryRepairJson(rawText);

    } catch (error: any) {
        console.error("Gemini İstek Hatası:", error);
        throw error; // Hatayı yukarı fırlat ki UI yakalasın
    }
};

export const generateWithSchema = async (prompt: string, schema: any) => {
    return await generateCreativeMultimodal({ prompt, schema });
};

// MIME Type Helper
export const detectMimeType = (base64: string): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' => {
    const raw = base64.split(',')[1] || base64;
    const prefix = raw.substring(0, 8);
    try {
        const bytes = atob(prefix);
        const b0 = bytes.charCodeAt(0);
        const b1 = bytes.charCodeAt(1);
        if (b0 === 0xFF && b1 === 0xD8) return 'image/jpeg';
        if (b0 === 0x89 && b1 === 0x50) return 'image/png';
        if (b0 === 0x52 && b1 === 0x49) return 'image/webp';
        if (b0 === 0x47 && b1 === 0x49) return 'image/gif';
    } catch { 
        if (base64.includes('image/png')) return 'image/png';
    }
    return 'image/jpeg';
};

export const analyzeImage = async (image: string, prompt: string, schema: any) => {
    const mimeType = detectMimeType(image);
    return await generateCreativeMultimodal({
        prompt,
        schema,
        files: [{ data: image, mimeType }]
    });
};

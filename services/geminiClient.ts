import { Type } from "@google/genai";

// Model Seçimi: Gemini 3 Flash — Multimodal thinking ve muhakeme motoru desteği
// NOT: Model adı .env'den okunabilir: VITE_GEMINI_MODEL
const MASTER_MODEL = (import.meta as any).env?.VITE_GEMINI_MODEL || 'gemini-3-flash-preview';

// ============================================================
// JSON ONARIM MOTORU (3 Katmanlı Strateji)
// ============================================================

/**
 * KATMAN 1: Eksik kapanış parantezlerini sayısal olarak tamamlar.
 * Örnek: { "a": [1, 2 → { "a": [1, 2]}
 */
const balanceBraces = (str: string): string => {
    // Önce string içlerindeki parantezleri yoksay
    const stack: string[] = [];
    let inString = false;
    let escaped = false;

    for (let i = 0; i < str.length; i++) {
        const ch = str[i];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\' && inString) { escaped = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;

        if (ch === '{') stack.push('}');
        else if (ch === '[') stack.push(']');
        else if ((ch === '}' || ch === ']') && stack.length > 0) {
            if (stack[stack.length - 1] === ch) stack.pop();
            else stack.pop(); // yanlış kapanış → tüket (tolerans)
        }
    }

    // Açık string varsa kapat
    if (inString) str += '"';
    // Kalan açık parantezleri ters sırayla kapat
    while (stack.length > 0) str += stack.pop();
    return str;
};

/**
 * KATMAN 2: Kesik JSON'ı son geçerli virgülden keser.
 * Örnek: { "a": 1, "b": { → { "a": 1 }
 */
const truncateToLastValidEntry = (str: string): string => {
    // Son tam virgülü bul ve oradan kes
    const lastComma = str.lastIndexOf(',');
    if (lastComma > 0) {
        const candidate = str.substring(0, lastComma);
        return balanceBraces(candidate);
    }
    return balanceBraces(str);
};

/**
 * KATMAN 3: Ana JSON Onarıcı
 * Sırasıyla 3 strateji uygular; birincisi başarısız olursa sonrakine geçer.
 */
const tryRepairJson = (jsonStr: string): any => {
    if (!jsonStr) throw new Error("AI yanıt dönmedi.");

    // 1. Görünmez karakterleri ve markdown bloklarını temizle
    let cleaned = jsonStr.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    cleaned = cleaned
        .replace(/^```json[\s\S]*?\n/, '')  // başındaki ```json ... satırını sil
        .replace(/^```\s*/m, '')             // başındaki ``` sil
        .replace(/```\s*$/m, '')             // sonundaki ``` sil
        .trim();

    // JSON başlangıcını bul (bazen model önüne açıklama ekler)
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIndex = -1;
    if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) startIndex = firstBrace;
    else if (firstBracket !== -1) startIndex = firstBracket;
    if (startIndex > 0) cleaned = cleaned.substring(startIndex);

    // STRATEJİ 1: Direkt parse
    try {
        return JSON.parse(cleaned);
    } catch (_e1) { /* devam */ }

    // STRATEJİ 2: Eksik parantezleri tamamlayarak parse
    try {
        const balanced = balanceBraces(cleaned);
        return JSON.parse(balanced);
    } catch (_e2) { /* devam */ }

    // STRATEJİ 3: Son geçerli girişe kadar kes, sonra tamamla
    try {
        const truncated = truncateToLastValidEntry(cleaned);
        const result = JSON.parse(truncated);
        console.warn('[GeminiClient] JSON truncated & repaired. Yanıt token sınırına çarpmış olabilir.');
        return result;
    } catch (_e3) { /* tüm stratejiler başarısız */ }

    // Tüm stratejiler başarısız → orijinal ham metni logla
    console.error('[GeminiClient] JSON Parse tamamen başarısız. Ham metin:', cleaned.substring(0, 500));
    throw new Error('AI verisi işlenemedi. JSON formatı bozuk veya yanıt çok kısa.');
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

declare var process: any;

const getApiKey = (): string | null => {
    // 1. Vite Env Variables (birincil kaynak)
    try {
        const viteKey = (import.meta as any).env?.VITE_GOOGLE_API_KEY;
        if (viteKey) return viteKey;
    } catch (e) { }

    // 2. Vercel / Build ortam değişkenleri (vite.config.ts define üzerinden)
    try {
        if (process.env.API_KEY) return process.env.API_KEY;
    } catch (e) { }

    // 3. localStorage fallback (ayarlar ekranından kullanıcı tarafından eklenen anahtar)
    try {
        return localStorage.getItem('gemini_api_key');
    } catch (e) { }

    return null;
};

/**
 * AI PEDAGOG: İçerik Denetimi Yapar
 */
export const evaluateContent = async (content: any) => {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API Key eksik");

    const url = `https://generativelanguage.googleapis.com/v1alpha/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;

    const prompt = `
    [ANALİZ EDİLECEK İÇERİK]
    ${JSON.stringify(content)}
    
    Lütfen yukarıdaki materyali disleksi dostu tasarım ilkelerine göre acımasızca eleştir ve puanla.
    `;

    const schema = {
        type: "OBJECT",
        properties: {
            score: { type: "NUMBER" },
            verdict: { type: "STRING", enum: ["Mükemmel", "İyi", "Riskli", "Kritik"] },
            analysis: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        type: { type: "STRING", enum: ["success", "warning", "error"] },
                        message: { type: "STRING" },
                        suggestion: { type: "STRING" }
                    },
                    required: ["type", "message", "suggestion"]
                }
            }
        },
        required: ["score", "verdict", "analysis"]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: PEDAGOGICAL_AUDITOR_INSTRUCTION }] },
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        const rawText = data.candidates[0].content.parts[0].text;
        return tryRepairJson(rawText);
    } catch (e) {
        console.error("Pedagojik analiz hatası:", e);
        return null;
    }
};

/**
 * REST API Tabanlı Gemini İstemcisi (Kütüphanesiz & Güvenli)
 */
export const generateCreativeMultimodal = async (params: {
    prompt: string,
    schema?: any,
    files?: MultimodalFile[],
    temperature?: number,
    thinkingBudget?: number
}) => {
    const apiKey = getApiKey();

    if (!apiKey) {
        throw new Error("API Anahtarı bulunamadı. Lütfen .env dosyasında VITE_GOOGLE_API_KEY tanımlayın veya ayarlardan ekleyin.");
    }

    const url = `https://generativelanguage.googleapis.com/v1alpha/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;

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
    // KRİTİK TOKEN DENGESİ:
    // thinkingBudget, maxOutputTokens'tan ÇIKARILIR.
    // Formül: Gerçek JSON tokeni = maxOutputTokens - thinkingBudget
    // 32000 - 2000 = 30000 token JSON için ayrılır → kesik JSON sorunu çözülür.
    const body: any = {
        contents,
        generationConfig: {
            temperature: params.temperature ?? 0,
            maxOutputTokens: 32000,
            responseMimeType: "application/json",
            thinkingConfig: {
                thinkingBudget: params.thinkingBudget ?? 2000
            }
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

/**
 * Generates raw SVG code from a prompt using Gemini
 */
export const generateSvgCode = async (prompt: string): Promise<string> => {
    const systemPrompt = `
    Sen bir SVG uzmanısın. Kullanıcının istediği konuya uygun, basit, yüksek kontrastlı ve disleksi dostu bir SVG ikonu üret.
    KURALLAR:
    - SADECE ham <svg> kodunu döndür. Açıklama veya markdown ( \`\`\` ) kullanma.
    - Görsel 100x100 viewbox içinde olmalı.
    - Tasarım minimalist, net çizgili ve dolgulu olmalı.
    - Arka plan şeffaf olmalı.
    - Renk paleti: #000000 (siyah) veya #4f46e5 (indigo) kullan.
  `;

    try {
        const apiKey = getApiKey();
        const url = `https://generativelanguage.googleapis.com/v1alpha/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;

        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 2000,
                responseMimeType: "text/plain",
            },
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error("Gemini SVG generation failed");

        const data = await response.json();
        let svgCode = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Clean up markdown if AI accidentally included it
        svgCode = svgCode.replace(/```svg/g, '').replace(/```/g, '').trim();

        if (!svgCode.includes('<svg')) {
            throw new Error("Geçerli bir SVG üretilemedi");
        }

        return svgCode;
    } catch (error) {
        console.error("SVG Generation Error:", error);
        // Generic fallback SVG (a simple circle)
        return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" stroke="#000" stroke-width="4" fill="none"/></svg>';
    }
};

export const analyzeImage = async (image: string, prompt: string, schema: any) => {
    const mimeType = detectMimeType(image);
    return await generateCreativeMultimodal({
        prompt,
        schema,
        files: [{ data: image, mimeType }]
    });
};

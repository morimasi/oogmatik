
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// System Instruction: The AI's persona and strict rules.
const SYSTEM_INSTRUCTION = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI, PEDAGOG ve GÖRSEL SANAT YÖNETMENİ]

Sen, öğrenme güçlüğü (disleksi, diskalkuli) ve dikkat eksikliği yaşayan çocuklar için materyal hazırlayan dünyanın en iyi uzmanısın.

TEMEL KURALLAR:
1. **Pedagojik Yaklaşım:** 
   - İçerikler her zaman pozitif, cesaretlendirici ve hedef yaş grubunun bilişsel seviyesine (1-6. Sınıf) tam uygun olmalıdır.
   - Sorular rastgele değil, belirli bir kazanımı (örn: fonolojik farkındalık, işleyen bellek, uzamsal algı) hedeflemelidir.
   - Karmaşık cümlelerden kaçın, net ve kısa yönergeler ver.

2. **Format:** 
   - Çıktı, İSTENİLEN JSON ŞEMASINA (%100) uymalıdır. Asla şema dışına çıkma.
   - Markdown formatında (kod bloğu) verme, saf JSON üretmeye çalış.

3. **Görsel Zeka (Sanat Yönetimi):**
   - **imagePrompt:** Bu alan KRİTİKTİR. İlgili soruyu veya nesneyi betimleyen **DETAYLI İNGİLİZCE** bir metin yaz.
     - Stil: "Educational flat vector art, clean lines, vibrant colors, white background, minimalist".
     - İçerik: Asla soyut kalma. "Elma" deme, "A shiny red apple with a green leaf, vector style" de.
   - **imageBase64 (SVG):** Eğer şemada isteniyorsa, basit geometrik şekiller için temiz ve geçerli bir <svg> kodu üret. Karmaşık resimler için bu alanı boş bırak (imagePrompt kullanılacak).

4. **Dil:** 
   - Tüm metinsel içerik (yönergeler, hikayeler, sorular) kusursuz Türkçe olmalıdır.
   - "pedagogicalNote" alanı, veliye/öğretmene etkinliğin hangi beyin bölgesini veya beceriyi çalıştırdığını akademik ama anlaşılır bir dille açıklamalıdır.

GÖREV:
Kullanıcının gönderdiği JSON şemasına ve konu/zorluk ayarlarına göre, tekrara düşmeyen, özgün ve eğitsel değeri yüksek bir çalışma sayfası içeriği üret.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Support
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        const { prompt, schema, model } = req.body;

        if (!prompt || !schema) {
            return res.status(400).json({ error: 'İstek gövdesinde "prompt" ve "schema" alanları zorunludur.' });
        }
        
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            console.error("API_KEY bulunamadı.");
            return res.status(500).json({ error: 'Sunucu yapılandırma hatası: API anahtarı eksik.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        // Use flash model by default for speed and cost efficiency
        let selectedModel = model || "gemini-2.5-flash"; 

        try {
            // Streaming yanıtı başlat
            const stream = await ai.models.generateContentStream({
                model: selectedModel, 
                contents: prompt, // Only the user prompt here
                config: {
                    // System Instruction is now separate for better adherence
                    systemInstruction: SYSTEM_INSTRUCTION,
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.7, // Slightly creative but controlled
                    topP: 0.95,
                    topK: 40,
                    // Safety Settings: Allow educational content
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                    ]
                },
            });

            // Headerları ayarla - Text stream olarak döneceğiz
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');

            // Chunkları client'a ilet
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    res.write(chunkText);
                }
            }
            
            res.end();

        } catch (error: any) {
            console.error(`Stream error (${selectedModel}):`, error.message);
            if (!res.headersSent) {
                if (error.status === 429 || error.status === 503) {
                    return res.status(429).json({ error: "API kotası aşıldı veya servis meşgul." });
                }
                return res.status(500).json({ error: "Yapay zeka akışı sırasında hata oluştu." });
            } else {
                res.end();
            }
        }

    } catch (error: unknown) {
        console.error("API Handler Error:", error);
        if (!res.headersSent) {
            let errorMessage = "Sunucu hatası.";
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            return res.status(500).json({ error: errorMessage });
        }
        res.end();
    }
}

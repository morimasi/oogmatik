
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Basit bir bekleme (sleep) yardımcı fonksiyonu
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        
        // API Anahtarı sadece ortam değişkenlerinden alınmalıdır.
        const apiKey = process.env.API_KEY;
        
        if (!apiKey) {
            console.error("API_KEY bulunamadı.");
            return res.status(500).json({ error: 'Sunucuda API anahtarı yapılandırılmamış. Lütfen Vercel ayarlarını kontrol edin.' });
        }

        const ai = new GoogleGenAI({ apiKey });
        const maxRetries = 2; 
        
        // MODEL SEÇİM STRATEJİSİ (Sıfır Maliyet / Hız Odaklı)
        // Guidelines update: Use gemini-2.5-flash for basic text tasks.
        let selectedModel = model || "gemini-2.5-flash"; 

        // Adım 1: İçerik ve Görsel Kodu Üretimi (Tek Seferde)
        let data;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Prompt Zenginleştirme: Profesyonel SVG Sanat Yönetmenliği ve Grafik Mühendisliği
                const enhancedPrompt = `${prompt}
                
                [SİSTEM TALİMATI - EĞİTİM MATERYALİ VE SVG MÜHENDİSİ]
                Sen ödüllü bir "Eğitim Materyali Tasarımcısı" ve "SVG Kodlama Uzmanı"sın.
                Amacın: Çocuklar için "Premium/Ücretli Üyelik" kalitesinde, görsel olarak zengin, işlevsel ve pedagojik olarak kusursuz içerikler üretmek.
                
                GÖREVİN: 
                Şemadaki 'imagePrompt' veya 'imageBase64' alanları için harici resim oluşturmak yerine, doğrudan PROFESYONEL, RENKLİ ve İŞLEVSEL SVG KODU yazacaksın.

                **SVG TASARIM KURALLARI (Stil Rehberi):**
                1.  **CANVAS:** Her zaman <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"> kullan.
                2.  **STİL: "Modern Flat 2.0" (Düz Tasarım)**
                    - "Kawaii" tarzı sevimli, yuvarlak hatlı çizimler.
                    - Canlı, çocuk dostu renk paleti: #4F46E5 (Indigo), #EF4444 (Rose), #F59E0B (Amber), #10B981 (Emerald), #3B82F6 (Blue).
                3.  **İŞLEVSELLİK (ETKİNLİK TÜRÜNE GÖRE):**
                    - **Labirent (Maze) İsteniyorsa:** Sadece ikon çizme! <path> elementleriyle çizilmiş, çözülebilir, duvarları olan, başlangıç (yeşil nokta) ve bitiş (kırmızı nokta) noktası belli olan kuşbakışı bir labirent planı çiz.
                    - **Grafik/Tablo İsteniyorsa:** Verileri temsil eden gerçek bir Bar Chart (Sütun Grafiği) veya Pie Chart (Pasta Grafik) çiz. Eksenleri ve etiketleri (text) ekle.
                    - **Eşleştirme İsteniyorsa:** İki sütun halinde noktalar veya kutular çiz.
                    - **Kesir İsteniyorsa:** Kesri tam olarak temsil eden bölünmüş daire (pasta dilimi) veya dikdörtgen çiz.
                    - **Harita İsteniyorsa:** Basitleştirilmiş, renkli ve bölgeleri belirgin bir harita taslağı çiz.
                4.  **DETAYLANDIRMA:**
                    - Ana şekillerin arkasına soluk renkli "Blob" veya daireler ekleyerek derinlik kat.
                    - Şekillere hafif "Highlight" (beyaz opaklık) ve "Shadow" (siyah opaklık) ekleyerek hacim ver.
                    - Nesneleri tam ortaya hizala ve kenarlardan boşluk bırak.

                **KOD YAPISI:**
                - Karmaşık 'path'ler yerine mümkün olduğunca <circle>, <rect rx="20">, <ellipse>, <line stroke-width="8" stroke-linecap="round"> kombinasyonları kullan.
                - SVG kodunu tek satıra sıkıştırma, okunabilir kalsın.
                - Asla <img> etiketi veya base64 string kullanma, saf vektör çiz.

                Eğer SVG çizimi teknik olarak imkansızsa (çok karmaşık bir fotoğraf gerekiyorsa), en yüksek kalitede, ilgili bir EMOJİ döndür (ancak öncelik her zaman SVG'dir).
                `;

                const textResponse = await ai.models.generateContent({
                    model: selectedModel, 
                    contents: enhancedPrompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                        temperature: 0.7, // Yaratıcılık ve tutarlılık dengesi
                        topP: 0.95,
                        topK: 40
                    },
                });

                const jsonText = textResponse.text;
                if (!jsonText) throw new Error("Yapay zekadan boş bir metin yanıtı alındı.");
                
                const cleanedJsonText = jsonText.replace(/^```json\s*|```\s*$/g, '').trim();
                
                try {
                    data = JSON.parse(cleanedJsonText);
                } catch (parseError) {
                    console.error("JSON Parse Error on AI Response:", cleanedJsonText);
                    throw new Error("Yapay zeka yanıtı geçerli bir JSON formatında değildi.");
                }
                
                break; // Başarılı
            } catch (error: any) {
                console.error(`Attempt ${attempt + 1} failed (${selectedModel}):`, error.message);
                
                if ((error.status === 429 || error.status === 503)) {
                    await sleep(1000);
                    continue;
                }
                
                if (attempt < maxRetries - 1) await sleep(1500);
                else throw error;
            }
        }

        if (!data) return res.status(500).json({ error: "Yapay zeka yanıt vermedi." });
        
        return res.status(200).json(data);

    } catch (error: unknown) {
        console.error("API Handler Error:", error);
        let statusCode = 500;
        let errorMessage = "Sunucu hatası.";

        if (error instanceof Error) {
            if ('status' in error) {
                statusCode = (error as any).status || 500;
            }
            errorMessage = error.message;
            
            if (statusCode === 429) {
                errorMessage = "API kotası aşıldı. Lütfen Hızlı Mod'u kullanın.";
            }
        }
        
        return res.status(statusCode).json({ error: errorMessage });
    }
}

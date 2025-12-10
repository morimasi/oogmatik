
// This function calls our own backend proxy.
export const generateWithSchema = async (prompt: string, schema: any, model?: string) => {
    try {
        const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const enhancedPrompt = `${prompt}\n\n[Context ID: ${uniqueSeed}]`;

        const fetchWithRetry = async (retries = 3, delay = 1000): Promise<Response> => {
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: enhancedPrompt, schema, model }),
                });

                if (response.status === 429 || response.status === 503) {
                     if (retries > 0) {
                         console.warn(`API busy (429/503). Retrying in ${delay}ms...`);
                         await new Promise(res => setTimeout(res, delay));
                         return fetchWithRetry(retries - 1, delay * 2);
                     }
                }
                return response;
            } catch (err) {
                 if (retries > 0) {
                     await new Promise(res => setTimeout(res, delay));
                     return fetchWithRetry(retries - 1, delay * 2);
                 }
                 throw err;
            }
        };

        const response = await fetchWithRetry();

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Sunucu Hatası (Raw):", errorText);
            
            let errorMessage = `API hatası: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error) errorMessage += ` - ${errorJson.error}`;
            } catch (e) {
                errorMessage += ` - Sunucudan beklenmedik bir yanıt alındı.`;
            }
            throw new Error(errorMessage);
        }
        
        // STREAM HANDLER
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (!reader) {
            throw new Error("Yanıt akışı okunamadı.");
        }

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
        }

        fullText += decoder.decode();

        try {
            let cleanedJsonText = fullText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
            const firstOpenBrace = cleanedJsonText.indexOf('{');
            const firstOpenBracket = cleanedJsonText.indexOf('[');
            let startIndex = -1;

            if (firstOpenBrace !== -1 && firstOpenBracket !== -1) {
                startIndex = Math.min(firstOpenBrace, firstOpenBracket);
            } else if (firstOpenBrace !== -1) {
                startIndex = firstOpenBrace;
            } else {
                startIndex = firstOpenBracket;
            }

            if (startIndex !== -1) {
                const lastCloseBrace = cleanedJsonText.lastIndexOf('}');
                const lastCloseBracket = cleanedJsonText.lastIndexOf(']');
                const endIndex = Math.max(lastCloseBrace, lastCloseBracket);
                if (endIndex > startIndex) {
                    cleanedJsonText = cleanedJsonText.substring(startIndex, endIndex + 1);
                }
            }

            return JSON.parse(cleanedJsonText);
        } catch (e) {
            console.error("Yapay zeka yanıtı ayrıştırılamadı. Ham metin:", fullText);
            throw new Error("Yapay zeka yanıtı geçerli bir veri formatında değil. Lütfen tekrar deneyin.");
        }

    } catch (error) {
        console.error("İstemci tarafında API çağrısı sırasında hata:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Yapay zeka sunucusuna bağlanırken bir hata oluştu.");
    }
};

// NEW: Vision API Handler
export const analyzeImage = async (base64Image: string, prompt: string, schema: any) => {
    try {
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

        const fetchWithRetry = async (retries = 3, delay = 1000): Promise<Response> => {
            try {
                 const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        schema,
                        model: 'gemini-2.5-flash',
                        image: cleanBase64 
                    }),
                });

                if (response.status === 429 || response.status === 503) {
                     if (retries > 0) {
                         console.warn(`Vision API busy. Retrying in ${delay}ms...`);
                         await new Promise(res => setTimeout(res, delay));
                         return fetchWithRetry(retries - 1, delay * 2);
                     }
                }
                return response;
            } catch (err) {
                 if (retries > 0) {
                     await new Promise(res => setTimeout(res, delay));
                     return fetchWithRetry(retries - 1, delay * 2);
                 }
                 throw err;
            }
        };

        const response = await fetchWithRetry();

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Vision API Error Details:", errorText);
            throw new Error(`Vision API Failed: ${response.status} ${response.statusText} - ${errorText.substring(0, 150)}...`);
        }
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullText += decoder.decode(value, { stream: true });
            }
        }
        
        const cleaned = fullText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
        return JSON.parse(cleaned);

    } catch (error) {
        console.error("Vision API Error:", error);
        throw error;
    }
};
    
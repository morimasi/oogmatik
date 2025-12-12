
// This function calls our own backend proxy.
export const generateWithSchema = async (prompt: string, schema: any, model?: string) => {
    try {
        const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const enhancedPrompt = `${prompt}\n\n[Context ID: ${uniqueSeed}]`;

        const fetchWithRetry = async (retries = 3, delay = 2000): Promise<Response> => {
            try {
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: enhancedPrompt, 
                        schema, 
                        model: 'gemini-1.5-flash' // Force stable model from client side too
                    }),
                });

                // Retry ONLY for Server Errors (5xx) or Rate Limits (429)
                // DO NOT RETRY for 400 (Bad Request / Invalid Key) or 401/403
                if (response.status === 429 || response.status >= 500) {
                     if (retries > 0) {
                         console.warn(`API meşgul (${response.status}). Tekrar deneniyor... (${delay}ms)`);
                         await new Promise(res => setTimeout(res, delay));
                         return fetchWithRetry(retries - 1, delay * 2); // Exponential backoff
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
            
            let errorMessage = `API hatası: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.error) errorMessage = errorJson.error;
            } catch (e) {
                if (errorText.length < 200) errorMessage += ` - ${errorText}`;
            }
            throw new Error(errorMessage);
        }
        
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

export const analyzeImage = async (base64Image: string, prompt: string, schema: any) => {
    try {
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

        const fetchWithRetry = async (retries = 3, delay = 2000): Promise<Response> => {
            try {
                 const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt,
                        schema,
                        image: cleanBase64,
                        mimeType: 'image/jpeg',
                        model: 'gemini-1.5-flash' // Strictly Force Stable Model
                    }),
                });

                if (response.status === 429 || response.status >= 500) {
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
            let errorMessage = `Vision API Failed: ${response.status}`;
            try {
                 const jsonErr = JSON.parse(errorText);
                 if (jsonErr.error) errorMessage = typeof jsonErr.error === 'string' ? jsonErr.error : JSON.stringify(jsonErr.error);
            } catch {
                 errorMessage += ` - ${errorText.substring(0, 100)}`;
            }
            throw new Error(errorMessage);
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
        fullText += decoder.decode();
        
        const cleaned = fullText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
        return JSON.parse(cleaned);

    } catch (error) {
        console.error("Vision API Error:", error);
        throw error;
    }
};


// This function calls our own backend proxy.
export const generateWithSchema = async (prompt: string, schema: any, model?: string) => {
    try {
        // Yapay zekanın her seferinde farklı çıktı üretmesini sağlamak için benzersiz bir bağlam ekliyoruz.
        const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        // NOTE: System instructions are now handled on the server side (api/generate.ts).
        // We only append specific runtime constraints here.
        const enhancedPrompt = `${prompt}\n\n[Context ID: ${uniqueSeed}]`;

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: enhancedPrompt, schema, model }),
        });

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

        // Final decode flush
        fullText += decoder.decode();

        try {
            // ROBUST JSON PARSING STRATEGY
            // 1. Remove Markdown code blocks if present
            let cleanedJsonText = fullText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```\s*$/, '');
            
            // 2. Sometimes models add text before/after JSON. Find the first '{' or '[' and the last '}' or ']'
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

            const parsed = JSON.parse(cleanedJsonText);
            return parsed;
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

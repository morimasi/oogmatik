
// This function calls our own backend proxy for generating the main worksheet data (text, structure, image prompts).
export const generateWorksheetData = async (prompt: string, schema: any) => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, schema }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen API hatası' }));
            throw new Error(`API hatası: ${response.status} - ${errorData.error}`);
        }

        const parsed = await response.json();
        return parsed;
    } catch (error) {
        console.error("İstemci tarafında API çağrısı sırasında hata:", error);
        throw new Error("Yapay zeka sunucusuna bağlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
};

// This function calls our dedicated backend endpoint for generating a single image.
export const generateImageFromPrompt = async (prompt: string): Promise<{ imageBase64: string }> => {
     try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen resim oluşturma hatası' }));
            throw new Error(`Resim API hatası: ${response.status} - ${errorData.error}`);
        }

        return await response.json();
    } catch (error) {
        console.error("İstemci tarafında resim oluşturma sırasında hata:", error);
        throw new Error("Resim oluşturma sunucusuna bağlanırken bir hata oluştu.");
    }
};

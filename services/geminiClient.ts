
// This function will now call our own backend proxy instead of Google's API directly.
export const generateWithSchema = async (prompt: string, schema: any) => {
    try {
        // Yapay zekanın her seferinde farklı çıktı üretmesini sağlamak için benzersiz bir bağlam ekliyoruz.
        const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const enhancedPrompt = `${prompt}\n\n[SİSTEM TALİMATI: Lütfen önceki çıktıları tekrar etme. Yaratıcı ol ve her seferinde tamamen benzersiz, çeşitlendirilmiş bir içerik üret. Random Seed: ${uniqueSeed}]`;

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: enhancedPrompt, schema }),
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

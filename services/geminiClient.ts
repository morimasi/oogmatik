
// This function will now call our own backend proxy instead of Google's API directly.
export const generateWithSchema = async (prompt: string, schema: any, model?: string) => {
    try {
        // Yapay zekanın her seferinde farklı çıktı üretmesini sağlamak için benzersiz bir bağlam ekliyoruz.
        const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        // Changed visual style instruction to allow variety: drawing, cartoon, vector.
        // Removed 'Standard photograph' to ensure child-friendly aesthetic consistency as requested.
        const enhancedPrompt = `${prompt}\n\n[SİSTEM TALİMATI: \n1. Önceki çıktıları tekrar etme. Benzersiz ol. Random Seed: ${uniqueSeed}.\n2. GÖRSEL TUTARLILIĞI: 'imagePrompt' alanları, metinle BİREBİR uyumlu olmalıdır.\n3. GÖRSEL KALİTESİ: 'imagePrompt'lar kesinlikle çocuk dostu ve estetik olmalıdır. Şunlardan birini kullan: 'Colorful cartoon', 'Vector art', 'Children book illustration'. Fotoğraf gerçekçiliği yerine sanatsal ve eğitici çizim tarzını benimse.]`;

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: enhancedPrompt, schema, model }),
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

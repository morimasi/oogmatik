
// This function will now call our own backend proxy instead of Google's API directly.
export const generateWithSchema = async (prompt: string, schema: any) => {
    try {
        // Yapay zekanın her seferinde farklı çıktı üretmesini sağlamak için benzersiz bir bağlam ekliyoruz.
        const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        // Enhanced system instruction to ensure variety and visual consistency
        const enhancedPrompt = `${prompt}\n\n[SİSTEM TALİMATI: \n1. Önceki çıktıları tekrar etme. Yaratıcı ol ve her seferinde tamamen benzersiz, çeşitlendirilmiş bir içerik üret. Random Seed: ${uniqueSeed}.\n2. GÖRSEL TUTARLILIĞI: Ürettiğin tüm 'imagePrompt' alanları, ilgili nesne, kelime veya sahne açıklamasıyla (text/description) BİREBİR uyumlu olmalıdır. Asla metinle çelişen bir görsel istemi oluşturma.\n3. GÖRSEL KALİTESİ: Tüm 'imagePrompt'lar 'photorealistic, 8k resolution, cinematic lighting, highly detailed, realistic texture' özelliklerini içermelidir. Basit çizim veya vektör stili kullanma.]`;

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

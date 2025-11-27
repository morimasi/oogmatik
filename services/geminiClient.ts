// This function will now call our own backend proxy instead of Google's API directly.
export const generateWithSchema = async (prompt: string, schema: any, model?: string) => {
    try {
        // Yapay zekanın her seferinde farklı çıktı üretmesini sağlamak için benzersiz bir bağlam ekliyoruz.
        const uniqueSeed = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        // Changed visual style instruction to allow variety: drawing, cartoon, vector.
        // Added strict instruction to ALWAYS generate imagePrompt for every possible item to ensure visual richness.
        const enhancedPrompt = `${prompt}\n\n[SİSTEM TALİMATI: \n1. Önceki çıktıları tekrar etme. Benzersiz ol. Random Seed: ${uniqueSeed}.\n2. GÖRSEL ZORUNLULUĞU: Şema içinde 'imagePrompt' alanı tanımlı olan HER ÖĞE için MUTLAKA dolu ve detaylı bir İngilizce görsel betimlemesi yaz. Asla boş bırakma. Bu betimlemeler bir eylem ve bağlam içermelidir (Örn: 'kedi' yerine 'yumakla oynayan sevimli bir kedi').\n3. GÖRSEL STİLİ: Betimlemelere şu stillerden uygun olanı ekle: 'Cute colorful vector art style', 'Children book illustration style', 'Vibrant cartoon style'. Amaç çocukların ilgisini çekecek, pozitif, renkli ve net görseller üretmektir. Korkutucu veya karanlık öğelerden kaçın.]`;

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: enhancedPrompt, schema, model }),
        });

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(`API hatası: ${response.status} - ${errorData.error || 'Bilinmeyen API hatası'}`);
            } catch (e) {
                 throw new Error(`API hatası: ${response.status} - Sunucudan beklenmedik bir yanıt alındı. Lütfen internet bağlantınızı kontrol edin.`);
            }
        }
        
        try {
            const parsed = await response.json();
            return parsed;
        } catch (e) {
            console.error("Yapay zeka yanıtı ayrıştırılamadı:", e);
            throw new Error("Yapay zeka sunucusundan geçersiz veya bozuk bir yanıt alındı. Lütfen tekrar deneyin.");
        }

    } catch (error) {
        console.error("İstemci tarafında API çağrısı sırasında hata:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Yapay zeka sunucusuna bağlanırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    }
};
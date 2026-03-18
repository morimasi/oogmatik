// Pedagojik hedefe özel Sistem Komutları (System Instructions)
const AI_PERSONA = `
Sen Türkiye Cumhuriyeti MEB (Milli Eğitim Bakanlığı) müfredatına tam hakim, 
uzman bir Türkçe sınıf öğretmeni, özel eğitim uzmanı ve pedagogsundur.
Görevin, okuma anlama, dil bilgisi ve mantık etkinlikleri üretmektir.
Çıktıların daima katı bir JSON objesi olmak zorundadır. Asla JSON dışında (markdown vs) metin ekleme.
Vertebileceğin tüm içeriklerin öğrencilerin gelişim düzeyine %100 uygun olduğundan emin ol.
`;

const AUDIENCE_RULES = {
  normal: '',
  hafif_disleksi:
    '\nDİKKAT: Öğrenciler hafif disleksili. Cümleleri çok uzun tutma. Karmaşık dolaylı anlatımlardan kaçın. Net ve somut ifadeler kullan.',
  derin_disleksi:
    '\nKRİTİK DİKKAT: Öğrenciler DERİN DİSLEKSİ tanılıdır. Cümleler en fazla 5-6 kelime olmalı. Asla soyut kavram kullanma. Çok basit, %100 somut, tek yargı bildiren kısa yönergeler oluştur. Eşsesli ve benzer sesli kelimeleri yan yana kullanma.',
};

/**
 * Gemini Proxy üzerinden yapılandırılmış JSON verisi alır.
 */
export const generateActivityWithGemini = async (
  prompt: string,
  audience: 'normal' | 'hafif_disleksi' | 'derin_disleksi' = 'normal',
  formatId: string,
  schema?: any,
  retries: number = 2
): Promise<any> => {
  const systemInstruction = AI_PERSONA + AUDIENCE_RULES[audience];
  const url = '/api/generate';

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction,
          schema,
          model: 'gemini-2.0-flash',
        }),
      });

      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ error: { message: 'Bilinmeyen hata' } }));
        throw new Error(errData.error?.message || `API Hatası (${response.status})`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.warn(`[Gemini Proxy Deneme ${attempt + 1}/${retries}] Başarısız:`, error.message);
      if (attempt === retries - 1) {
        console.error(`Gemini Proxy Activity Generation Failed for Format ${formatId}:`, error);
        throw new Error(`Yapay Zeka üretiminde hata: ${error.message}`);
      }
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
};

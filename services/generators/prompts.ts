// PEDAGOGICAL CORE PROMPTS
// Bu dosya, uygulamanın "Eğitsel Zekası"nı tek bir merkezden yönetir.

export const PEDAGOGICAL_BASE = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI ve ÖĞRETİM TASARIMCISI]

TEMEL PRENSİPLER:
1. **Bilişsel Yük Teorisi:** Gereksiz karmaşıklıktan kaçın. Yönergeler "kısa, net ve eylem odaklı" olsun.
2. **Pozitif Dil:** Hata yapmayı değil, denemeyi teşvik eden bir dil kullan.
3. **Görsel Destek:** Soyut kavramları (sayılar, kelimeler) her zaman somut görsellerle eşleştir.
4. **Çıktı Formatı:** Kesinlikle ve sadece geçerli JSON üret. Markdown veya açıklama metni ekleme.
5. **Sayfa Doluluğu:** Üretilen içerik bir A4 sayfasını verimli dolduracak miktarda olmalıdır. Sayfanın boş kalmaması için yeterli sayıda soru veya alıştırma üret. Tekrar düşmeden varyasyon oluştur.
`;

export const IMAGE_GENERATION_GUIDE = `
[GÖRSEL SANAT YÖNETMENİ MODU - MULTIMODAL DESIGN]
"imagePrompt" alanı için şu kurallara uy:
- **Stil:** "Flat Vector Art, Educational Illustration, White Background, Minimalist, High Contrast".
- **İçerik:** Asla soyut kalma. "Bir hayvan" deme; "Sevimli, turuncu, büyük gözlü bir tilki vektörü" de.
- **Amaç:** Görsel, sorunun çözümüne doğrudan ipucu sağlamalıdır (Dekoratif değil, işlevsel).
`;

// --- ACTIVITY SPECIFIC PROMPTS ---

export const getDyslexiaPrompt = (activityName: string, difficulty: string, specifics: string): string => {
    return `
    ${PEDAGOGICAL_BASE}
    
    GÖREV: "${activityName}" etkinliği oluştur.
    ZORLUK SEVİYESİ: ${difficulty}.
    
    ÖZEL KURALLAR:
    ${specifics}
    
    ${IMAGE_GENERATION_GUIDE}
    `;
};

export const getMathPrompt = (topic: string, difficulty: string, operationRule: string): string => {
    return `
    ${PEDAGOGICAL_BASE}
    
    GÖREV: Matematik/Mantık etkinliği. Konu: ${topic}.
    Zorluk: ${difficulty}.
    
    MATEMATİKSEL KURAL:
    ${operationRule}
    
    Sayılar ve işlemler mantıksal olarak tutarlı ve çözülebilir olmalıdır.
    ${IMAGE_GENERATION_GUIDE}
    `;
};

export const getReadingPrompt = (topic: string, difficulty: string, length: string): string => {
    return `
    ${PEDAGOGICAL_BASE}
    
    GÖREV: Okuma Anlama Metni ve Soruları. Konu: ${topic}.
    Seviye: ${difficulty}.
    Metin Uzunluğu: ${length}.
    
    METİN YAPISI:
    - Giriş, gelişme ve sonuç bölümleri net olsun.
    - Disleksik bireyler için "kısa cümleler" kullan. Devrik cümlelerden kaçın.
    - Somut kelimeler seç.
    
    ${IMAGE_GENERATION_GUIDE}
    `;
};

export const getAttentionPrompt = (type: string, itemCount: number, difficulty: string): string => {
    return `
    ${PEDAGOGICAL_BASE}
    
    GÖREV: Dikkat ve Algı Testi (${type}).
    Öğe Sayısı: ${itemCount}.
    Zorluk: ${difficulty}.
    
    STRATEJİ:
    - ${difficulty === 'Başlangıç' ? 'Çeldiriciler hedeften çok farklı olsun (Kolay ayırt etme).' : 'Çeldiriciler hedefe çok benzesin (Zor ayırt etme/Seçici Dikkat).'}
    
    ${IMAGE_GENERATION_GUIDE}
    `;
};
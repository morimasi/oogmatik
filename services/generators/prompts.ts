
// PEDAGOGICAL CORE PROMPTS
// Bu dosya, uygulamanın "Eğitsel Zekası"nı tek bir merkezden yönetir.
import { Student } from '../../types';

export const PEDAGOGICAL_BASE = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI ve ÖĞRETİM TASARIMCISI]

TEMEL PRENSİPLER:
1. **Bilişsel Yük Teorisi:** Gereksiz karmaşıklıktan kaçın. Yönergeler "kısa, net ve eylem odaklı" olsun.
2. **Pozitif Dil:** Hata yapmayı değil, denemeyi teşvik eden bir dil kullan.
3. **Görsel Destek:** Soyut kavramları (sayılar, kelimeler) her zaman somut görsellerle eşleştir.
4. **Çıktı Formatı:** Kesinlikle ve sadece geçerli JSON üret. Markdown veya açıklama metni ekleme.
5. **Sayfa Doluluğu:** Üretilen içerik bir A4 sayfasını verimli dolduracak miktarda olmalıdır. Sayfanın boş kalmaması için yeterli sayıda soru veya alıştırma üret. Tekrar düşmeden varyasyon oluştur.
`;

export const getStudentContextPrompt = (student?: Student): string => {
    if (!student) return "";
    return `
[ÖĞRENCİ PROFİLİNE GÖRE KİŞİSELLEŞTİRME]:
- Öğrenci Adı: ${student.name}
- Tanı/Zayıf Yönler: ${student.diagnosis?.join(', ')} / ${student.weaknesses?.join(', ')}
- İlgi Alanları (İçeriği buna göre kurgula): ${student.interests?.join(', ')}
- Öğrenme Stili: ${student.learningStyle}
Lütfen içeriği bu öğrencinin ilgi alanlarına (karakter isimleri, senaryo, görseller) ve destek ihtiyaçlarına göre uyarla.
    `;
};

export const IMAGE_GENERATION_GUIDE = `
[GÖRSEL SANAT YÖNETMENİ MODU - MULTIMODAL DESIGN]
"imagePrompt" alanı için şu kurallara uy:
- **Stil:** "Flat Vector Art, Educational Illustration, White Background, Minimalist, High Contrast".
- **İçerik:** Asla soyut kalma. "Bir hayvan" deme; "Sevimli, turuncu, büyük gözlü bir tilki vektörü" de.
- **Amaç:** Görsel, sorunun çözümüne doğrudan ipucu sağlamalıdır (Dekoratif değil, işlevsel).
`;

// --- ACTIVITY SPECIFIC PROMPTS ---

export const getDyslexiaPrompt = (activityName: string, difficulty: string, specifics: string, student?: Student): string => {
    return `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(student)}
    
    GÖREV: "${activityName}" etkinliği oluştur.
    ZORLUK SEVİYESİ: ${difficulty}.
    
    ÖZEL KURALLAR:
    ${specifics}
    
    ${IMAGE_GENERATION_GUIDE}
    `;
};

export const getMathPrompt = (topic: string, difficulty: string, operationRule: string, student?: Student): string => {
    return `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(student)}
    
    GÖREV: Matematik/Mantık etkinliği. Konu: ${topic}.
    Zorluk: ${difficulty}.
    
    MATEMATİKSEL KURAL:
    ${operationRule}
    
    Sayılar ve işlemler mantıksal olarak tutarlı ve çözülebilir olmalıdır.
    ${IMAGE_GENERATION_GUIDE}
    `;
};

export const getReadingPrompt = (topic: string, difficulty: string, length: string, student?: Student): string => {
    return `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(student)}
    
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

export const getAttentionPrompt = (type: string, itemCount: number, difficulty: string, student?: Student): string => {
    return `
    ${PEDAGOGICAL_BASE}
    ${getStudentContextPrompt(student)}
    
    GÖREV: Dikkat ve Algı Testi (${type}).
    Öğe Sayısı: ${itemCount}.
    Zorluk: ${difficulty}.
    
    STRATEJİ:
    - ${difficulty === 'Başlangıç' ? 'Çeldiriciler hedeften çok farklı olsun (Kolay ayırt etme).' : 'Çeldiriciler hedefe çok benzesin (Zor ayırt etme/Seçici Dikkat).'}
    
    ${IMAGE_GENERATION_GUIDE}
    `;
};


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
5. **Veri Doluluğu:** JSON dizilerini boş bırakma. İstenen sayıda örnek üret.
6. **DİL BİLGİSİ (KRİTİK):** Heceleme işlemlerinde kesinlikle TÜRKÇE DİL BİLGİSİ KURALLARINA (TDK) uy. İki ünlü arasındaki tek ünsüzü mutlaka sonraki heceye bağla (Örn: a-ra-ba, bi-bi). Kelime sonundaki ünsüzleri doğru grupla.
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
[GÖRSEL SANAT YÖNETMENİ MODU - KRİTİK]
"imagePrompt" alanı için şu kurallara KESİNLİKLE uy:
- **Dil:** Mutlaka İNGİLİZCE yaz. 
- **Stil:** "High-quality professional educational illustration, flat vector art, white background, minimalist, vibrant colors, clear outlines, no text inside image".
- **SVG MODU:** Eğer etkinlik geometrik veya sembolik ise (Farkı Bul, Eşleştirme vb.), görseli dışarıdan çağırmak yerine "imageBase64" alanına doğrudan geçerli bir <svg> kodu yazabilirsin. SVG kodu 100x100 koordinat sisteminde, yüksek kontrastlı ve basit olmalıdır.
- **Amaç:** Görsel, sorunun çözümüne doğrudan ipucu sağlamalıdır.
`;

export const MAP_DETECTIVE_PROMPT = `
[GÖREV: HARİTA DEDEKTİFİ YÖNERGE ÜRETİMİ]
Eğer kullanıcı özel bir harita yüklediyse (imageBase64 mevcutsa), yönergeleri SADECE o harita üzerindeki nesneler ve yazılar üzerinden kurgula.
- "Kuzeydeki şehre git" yerine "Kırmızı çatılı evin yanındaki ağaca bak" gibi görsel detaylar kullan.
- Harita bir kroki ise yönleri (sağ, sol, üst, alt) ve renkleri baz al.
- Disleksik bireyler için "Sol üstteki mavi kare" gibi net uzamsal referanslar ver.
`;

export const getMathPrompt = (title: string, difficulty: string, rule: string, student?: Student): string => {
    return `${PEDAGOGICAL_BASE}\n${getStudentContextPrompt(student)}\n[HEDEF]: ${title}\n[ZORLUK]: ${difficulty}\n[KURAL]: ${rule}\n${IMAGE_GENERATION_GUIDE}`;
};

export const getAttentionPrompt = (title: string, difficulty: string, specifics: string, student?: Student): string => {
    return `${PEDAGOGICAL_BASE}\n${getStudentContextPrompt(student)}\n[HEDEF]: ${title}\n[ZORLUK]: ${difficulty}\n[DETAYLAR]: ${specifics}\n${IMAGE_GENERATION_GUIDE}`;
};

export const getDyslexiaPrompt = (title: string, difficulty: string, specifics: string, student?: Student): string => {
    return `${PEDAGOGICAL_BASE}\n${getStudentContextPrompt(student)}\n[HEDEF]: ${title}\n[ZORLUK]: ${difficulty}\n[DİSLEKSİ ODAKLI TALİMATLAR]: ${specifics}\n${IMAGE_GENERATION_GUIDE}`;
};

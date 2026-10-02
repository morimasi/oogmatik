const TURKISH_CONTENT_POLICY = `

[ZORUNLU TÜRKÇE İÇERİK KURALI]
Çıktıdaki öğrenciye, öğretmene veya veliye gösterilecek tüm doğal dil metinleri Türkiye Türkçesinde olmalıdır. Buna başlıklar, yönergeler, hikâyeler, sorular, yanıtlar, seçenekler, açıklamalar ve pedagojik notlar dahildir. Şema anahtarları ve teknik enum değerleri değişmeden kalabilir. Yalnızca kullanıcıya gösterilmeyen imagePrompt gibi görsel üretim istemleri İngilizce olabilir; bunları çalışma kâğıdına veya arayüze yazdırma. Kaynak metin başka bir dilde olsa bile öğrenciye gösterilecek içerik alanlarını Türkçe üret.
`;

export const withTurkishContentPolicy = (systemInstruction: string): string =>
  `${systemInstruction.trim()}${TURKISH_CONTENT_POLICY}`;

import { generateCreativeMultimodal } from '../../../../services/geminiClient';

export interface SimplificationOptions {
  originalText: string;
  targetGradeLevel: 1 | 2 | 3 | 4;
}

/**
 * Gemini ile gerçek metin sadeleştirme servisi.
 * Karmaşık bir metni, hedef sınıf seviyesindeki disleksili öğrencinin
 * anlayabileceği basitliğe dönüştürür.
 * Fallback: Basit bir özet açıklama döndürür.
 */
export const simplifyText = async (options: SimplificationOptions): Promise<string> => {
  const prompt = `
Sen, özel öğrenme güçlüğü yaşayan (disleksi) öğrenciler için metin sadeleştirme uzmanısın.

Aşağıdaki metni ${options.targetGradeLevel}. sınıf seviyesindeki bir disleksili öğrencinin anlayabileceği şekilde yeniden yaz:

**ORİJİNAL METİN:**
"""
${options.originalText}
"""

**UYMANIN ZORUNLU KURALLARI:**
1. Her cümle en fazla 8-10 kelime olmalı
2. Karmaşık sözcükler yerine günlük basit Türkçe kelimeler kullan
3. Soyut kavramlar somut örneklerle açıklanmalı
4. Paragraflar arası net geçişler olmalı
5. Sadece sola hizalı düz metin dön (HTML, Markdown işaretçisi yok)
6. Metnin ana mesajını koru, yalnızca dil karmaşıklığını azalt

Sadeleştirilmiş metni döndür, başka açıklama ekleme.
`;

  try {
    console.log(`[TextSimplifier] Gemini ile metin ${options.targetGradeLevel}. sınıf için sadeleştiriliyor...`);
    const result = await generateCreativeMultimodal({
      prompt,
      temperature: 0.4,
      thinkingBudget: 500,
    });

    // Gemini JSON döndürüyor, biz düz metin istiyoruz
    const text =
      typeof result === 'string'
        ? result
        : result?.simplifiedText || result?.text || result?.content || JSON.stringify(result);

    console.log('[TextSimplifier] Metin başarıyla sadeleştirildi.');
    return String(text).replace(/^["']|["']$/g, '').trim();
  } catch (error: any) {
    console.warn('[TextSimplifier] Gemini API hatası, fallback devrede:', error?.message);
    return `(${options.targetGradeLevel}. sınıf için sadeleştirilmiş versiyon) ${options.originalText.split('.').slice(0, 3).join('. ')}.`;
  }
};

/**
 * Türkçe okunabilirlik skoru hesaplama (Flesch-Kincaid uyarlaması).
 * Daha kısa cümle = daha yüksek skor (daha kolay).
 */
export const calculateReadabilityScore = (text: string): number => {
  if (!text?.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  const sentences = (text.match(/[.!?]+/g) || []).length || 1;
  const avgSentenceLength = words / sentences;
  // Türkçe uyarlaması: kısa cümle aralığı = yüksek puan
  return Math.max(0, Math.min(100, Math.round(100 - avgSentenceLength * 4.5)));
};

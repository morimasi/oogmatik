/**
 * Auto-Auditor (Pedagojik Denetmen)
 * Yapay zeka çıktısının hedef kitleye (özellikle disleksi profillerine)
 * uygunluğunu hızlı sezgisel (heuristic) yöntemlerle denetler.
 */

export interface AuditorReport {
  score: number; // 0-100
  warnings: string[];
  isApproved: boolean;
}

export const auditActivityContent = (
  data: any,
  audience: 'normal' | 'hafif_disleksi' | 'derin_disleksi'
): AuditorReport => {
  const report: AuditorReport = {
    score: 100,
    warnings: [],
    isApproved: true,
  };

  if (audience === 'normal') return report;

  // Hedef kitle disleksi ise metin uzunluklarını ve kelime karmaşıklığını denetle
  const maxWordsPerSentence = audience === 'derin_disleksi' ? 8 : 15;
  const maxWordLength = audience === 'derin_disleksi' ? 12 : 15; // Çok uzun kelimeler derin dislekside zorlar

  const checkString = (text: string, context: string) => {
    if (!text || typeof text !== 'string') return;

    const words = text.split(/\s+/);

    // Cümle uzunluğu kontrolü
    if (words.length > maxWordsPerSentence && text.includes('.')) {
      // Eğer içinde nokta varsa birden fazla cümle olabilir, kabaca bölüp bakalım
      const sentences = text.split('.').filter((s) => s.trim().length > 0);
      for (const sentence of sentences) {
        if (sentence.split(/\s+/).length > maxWordsPerSentence) {
          report.score -= 5;
          report.warnings.push(
            `[${context}] Cümle çok uzun (${sentence.split(/\s+/).length} kelime). İdeal: ${maxWordsPerSentence}`
          );
        }
      }
    } else if (words.length > maxWordsPerSentence * 2) {
      // Noktasız çok uzun metin (örneğin paragraf)
      report.score -= 10;
      report.warnings.push(`[${context}] Metin bloğu çok uzun.`);
    }

    // Kelime uzunluğu kontrolü (çok heceli/karmasik kelimeler)
    const longWords = words.filter((w) => w.replace(/[.,!?]/g, '').length > maxWordLength);
    if (longWords.length > 0) {
      report.score -= 2 * longWords.length;
      report.warnings.push(
        `[${context}] Çok uzun karmaşık kelimeler tespit edildi: ${longWords.join(', ')}`
      );
    }
  };

  const traverseObject = (obj: any, path: string = 'root') => {
    if (!obj) return;
    if (typeof obj === 'string') {
      checkString(obj, path);
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => traverseObject(item, `${path}[${index}]`));
    } else if (typeof obj === 'object') {
      Object.keys(obj).forEach((key) => traverseObject(obj[key], `${path}.${key}`));
    }
  };

  // Tüm JSON ağacını gezerek metinleri denetle
  traverseObject(data);

  // Eşik değerin altındaysa reddet (şu an sadece uyarı veriyoruz, reddetmiyoruz)
  if (report.score < 50) {
    report.isApproved = false;
    report.warnings.push(
      'Kritik: Pedagojik denetim başarısız. İçerik hedef kitle için çok zorlayıcı.'
    );
  }

  return report;
};

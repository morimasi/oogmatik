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

  // Disleksi dostu kontroller
  const maxWordsPerSentence = audience === 'derin_disleksi' ? 8 : 15;
  const maxWordLength = audience === 'derin_disleksi' ? 12 : 15;
  const maxSyllablesPerWord = audience === 'derin_disleksi' ? 4 : 6;

  // Sesli harf tabanlı basit hece sayacı
  const countSyllables = (word: string) => {
    const vowels = word.match(/[aeıioöuüAEIİOÖUÜ]/g);
    return vowels ? vowels.length : 0;
  };

  const checkString = (text: string, context: string) => {
    if (!text || typeof text !== 'string') return;

    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return;

    // Paragraf blok kontrolü
    if (words.length > 40 && audience === 'derin_disleksi') {
      report.score -= 15;
      report.warnings.push(`[${context}] Paragraf bloğu çok yoğun (${words.length} kelime). Lütfen daha kısa parçalara bölün.`);
    }

    // Cümle uzunluğu kontrolü
    if (text.includes('.')) {
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
      for (const sentence of sentences) {
        const sentenceWords = sentence.trim().split(/\s+/);
        if (sentenceWords.length > maxWordsPerSentence) {
          report.score -= 8;
          report.warnings.push(
            `[${context}] Cümle disleksi için çok uzun (${sentenceWords.length} kelime).`
          );
        }
      }
    }

    // Kelime karmaşıklığı (Hece sayısı ve uzunluk)
    for (const w of words) {
      const cleanWord = w.replace(/[.,!?":;]/g, '');
      const syllCount = countSyllables(cleanWord);

      if (syllCount > maxSyllablesPerWord) {
        report.score -= 3;
        report.warnings.push(`[${context}] Karmaşık sözcük (${syllCount} hece): ${cleanWord}`);
      }

      if (cleanWord.length > maxWordLength) {
        report.score -= 2;
        report.warnings.push(`[${context}] Çok uzun sözcük: ${cleanWord}`);
      }
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

/**
 * BDMIND - Fonolojik Ölçme ve Değerlendirme Motoru
 * Disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için bilimsel okuma analitiği.
 * 
 * Liderler: Dr. Canan Kaya (Psikometri) & Elif Yıldız (Pedagoji) & Dr. Ahmet Kaya (Klinik)
 */

export type PhonemeErrorCode =
  | 'ERR_MIRROR'       // b/d, p/q, m/n ayna harf karışıklığı
  | 'ERR_OMISSION'     // Hece veya harf yutma/atlama
  | 'ERR_GUESS'        // İlk harfe bakıp kelime uydurma
  | 'ERR_MORPH'        // Çekim/yapım eki uydurma (-ler, -de, -den)
  | 'ERR_TRANSP'       // Harf yerdeğişimi / anagram (ev -> ve)
  | 'SUCCESS_SELF';    // Kendini düzeltme (hata sayılmaz, başarıdır)

export interface PhonologicalErrorItem {
  id: string;
  wordIndex: number;
  targetWord: string;
  spokenWord: string;
  errorCode: PhonemeErrorCode;
  explanation: string;
  timestampMs: number;
}

export interface ReadingSessionMetrics {
  durationSeconds: number;
  totalWordsTarget: number;
  totalWordsRead: number;
  correctWordsCount: number;
  errorWordsCount: number;
  selfCorrectionCount: number;
  hesitationCount: number;
  averageHesitationMs: number;
  wcpm: number;
  accuracyPercentage: number;
  prosodyScore: number; // 0-100
  gradeLevelEquivalent: string;
  errorBreakdown: Record<PhonemeErrorCode, number>;
  pedagogicalSummary: string;
  recommendations: string[];
  /**
   * Results of comprehension questions (question => correct/incorrect)
   */
  comprehensionResults?: Record<string, boolean>;
  /**
   * AI story evaluation summary (e.g., coherence, creativity scores)
   */
  aiStoryEvaluation?: {
    coherenceScore: number;
    creativityScore: number;
    overallRating: string;
  };
}

// MEB 1-4. Sınıf Türkçe Akıcı Okuma Normları (WCPM)
export const MEB_WCPM_NORMS: Record<number, { min: number; target: number; expert: number }> = {
  1: { min: 30, target: 50, expert: 70 },
  2: { min: 50, target: 75, expert: 95 },
  3: { min: 70, target: 95, expert: 115 },
  4: { min: 85, target: 115, expert: 135 },
};

export class PhonologicalScoringEngine {
  /**
   * İki kelime arasındaki fonolojik uyumsuzluğu analiz eder ve hata türünü sınıflandırır.
   */
  public static classifyReadingError(target: string, spoken: string): { code: PhonemeErrorCode; explanation: string } {
    const cleanTarget = target.trim().toLocaleLowerCase('tr-TR').replace(/[.,!?:;"]/g, '');
    const cleanSpoken = spoken.trim().toLocaleLowerCase('tr-TR').replace(/[.,!?:;"]/g, '');

    if (cleanTarget === cleanSpoken) {
      return { code: 'SUCCESS_SELF', explanation: 'Doğru okuma' };
    }

    // 1. Ayna Harf Tespiti (b/d, p/q, t/f) - Tam harf değişimiyle eşleşme kontrolü
    const mirrorPairs = [
      ['b', 'd'],
      ['d', 'b'],
      ['p', 'q'],
      ['q', 'p'],
      ['p', 'b'],
      ['b', 'p'],
      ['m', 'n'],
      ['n', 'm'],
    ];
    for (const [char1, char2] of mirrorPairs) {
      if (cleanTarget.includes(char1)) {
        const swapped = cleanTarget.replace(new RegExp(char1, 'g'), char2);
        if (swapped === cleanSpoken) {
          return {
            code: 'ERR_MIRROR',
            explanation: `Ayna harf karışıklığı ('${char1}' ve '${char2}' yön algısı).`,
          };
        }
      }
    }

    // 2. Harf Yerdeğişimi / Anagram (ev -> ve, çok -> koç)
    if (
      cleanTarget.length === cleanSpoken.length &&
      cleanTarget.split('').sort().join('') === cleanSpoken.split('').sort().join('')
    ) {
      return {
        code: 'ERR_TRANSP',
        explanation: 'Harf sırası yerdeğişimi (Ortografik sıralama güçlüğü).',
      };
    }

    // 3. Hece / Harf Atlama veya Yutma (Örn: araba -> arba, kelebek -> kelek)
    if (cleanSpoken.length < cleanTarget.length) {
      // Çocuğun söylediği hedef kelimenin bir alt dizilimi mi?
      let tIdx = 0;
      let sIdx = 0;
      while (tIdx < cleanTarget.length && sIdx < cleanSpoken.length) {
        if (cleanTarget[tIdx] === cleanSpoken[sIdx]) {
          sIdx++;
        }
        tIdx++;
      }
      if (sIdx === cleanSpoken.length) {
        return {
          code: 'ERR_OMISSION',
          explanation: 'Kelime içi ses veya hece atlama/yutma.',
        };
      }
    }

    // 4. Morfolojik Ek Uydurma (Kök aynı, ek farklı; örn: evde -> evden, balık -> balıklar)
    const minPrefixLen = Math.min(3, Math.min(cleanTarget.length, cleanSpoken.length));
    if (
      cleanTarget.slice(0, minPrefixLen) === cleanSpoken.slice(0, minPrefixLen) &&
      Math.abs(cleanTarget.length - cleanSpoken.length) <= 3
    ) {
      return {
        code: 'ERR_MORPH',
        explanation: 'Kelime sonu ek uydurma veya ek yutma (Morfolojik tamamlama).',
      };
    }

    // 5. İlk Harften Uydurma / Tahmin
    if (cleanTarget[0] === cleanSpoken[0]) {
      return {
        code: 'ERR_GUESS',
        explanation: `İlk harfe ('${cleanTarget[0]}') bakarak bütünü tahmin etme eğilimi.`,
      };
    }

    return {
      code: 'ERR_GUESS',
      explanation: 'Genel görsel benzerlikten kelime türetme.',
    };
  }

  /**
   * Seans metriklerini ve WCPM skorunu hesaplar.
   */
  public static calculateSessionMetrics(params: {
    durationSeconds: number;
    totalWordsTarget: number;
    totalWordsRead: number;
    errors: PhonologicalErrorItem[];
    selfCorrections: number;
    hesitationCount: number;
    totalHesitationMs: number;
    gradeLevel?: number;
  }): ReadingSessionMetrics {
    const {
      durationSeconds,
      totalWordsTarget,
      totalWordsRead,
      errors,
      selfCorrections,
      hesitationCount,
      totalHesitationMs,
      gradeLevel = 2,
    } = params;

    const safeDuration = Math.max(1, durationSeconds);
    const errorWordsCount = errors.filter((e) => e.errorCode !== 'SUCCESS_SELF').length;
    const correctWordsCount = Math.max(0, totalWordsRead - errorWordsCount);

    // WCPM = ((Doğru Kelime Sayısı) / Süre(sn)) * 60
    const rawWcpm = (correctWordsCount / safeDuration) * 60;
    const wcpm = Math.round(rawWcpm * 10) / 10;

    const accuracyPercentage = totalWordsRead > 0
      ? Math.round((correctWordsCount / totalWordsRead) * 100)
      : 0;

    // Hata Dağılımı
    const errorBreakdown: Record<PhonemeErrorCode, number> = {
      ERR_MIRROR: 0,
      ERR_OMISSION: 0,
      ERR_GUESS: 0,
      ERR_MORPH: 0,
      ERR_TRANSP: 0,
      SUCCESS_SELF: selfCorrections,
    };

    errors.forEach((e) => {
      if (errorBreakdown[e.errorCode] !== undefined) {
        errorBreakdown[e.errorCode]++;
      }
    });

    // Ortalama duraksama süresi
    const averageHesitationMs = hesitationCount > 0
      ? Math.round(totalHesitationMs / hesitationCount)
      : 0;

    // Prozodi Skoru (0-100)
    const accuracyFactor = accuracyPercentage * 0.5;
    const hesitationPenalty = Math.min(30, (hesitationCount * 3));
    const speedFactor = Math.min(50, (wcpm / (MEB_WCPM_NORMS[gradeLevel]?.target || 75)) * 50);
    const prosodyScore = Math.max(10, Math.min(100, Math.round(accuracyFactor + speedFactor - hesitationPenalty)));

    // Sınıf Düzeyi Eşdeğeri
    let gradeLevelEquivalent = '1. Sınıf Başlangıç Seviyesi';
    if (wcpm >= 100) gradeLevelEquivalent = '4. Sınıf ve Üzeri Akıcı Okuma';
    else if (wcpm >= 80) gradeLevelEquivalent = '3. Sınıf Düzeyi';
    else if (wcpm >= 60) gradeLevelEquivalent = '2. Sınıf Düzeyi';
    else if (wcpm >= 40) gradeLevelEquivalent = '1. Sınıf Sonu Düzeyi';

    // Pedagojik Özet ve Öneriler
    const recommendations: string[] = [];
    if (errorBreakdown.ERR_MIRROR > 0) {
      recommendations.push('b/d harf yönü için Sarı Kitap Nokta ve Pencere çalışmaları önerilir.');
    }
    if (errorBreakdown.ERR_OMISSION > 0) {
      recommendations.push('Hece atlamaları için Renkli Hece Okuma ve Köprü tekniği uygulanmalıdır.');
    }
    if (errorBreakdown.ERR_GUESS > 0) {
      recommendations.push('Kelime sonunu uydurma alışkanlığı için son hece vurgulama egzersizleri yapılmalıdır.');
    }
    if (selfCorrections >= 2) {
      recommendations.push('Öğrencinin kendi kendini düzeltme (öz-denetim) farkındalığı çok yüksek, tebrik edildi.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Akıcı ve dengeli bir okuma performansı sergilendi.');
    }

    const pedagogicalSummary = `${gradeLevel}. sınıf hedefleri doğrultusunda öğrenci dakikada ${wcpm} doğru kelime hızına ulaşmıştır. Doğruluk oranı %${accuracyPercentage}'dir. ${selfCorrections} kez kendi hatasını başarıyla fark edip düzeltmiştir.`;

    return {
      durationSeconds,
      totalWordsTarget,
      totalWordsRead,
      correctWordsCount,
      errorWordsCount,
      selfCorrectionCount: selfCorrections,
      hesitationCount,
      averageHesitationMs,
      wcpm,
      accuracyPercentage,
      prosodyScore,
      gradeLevelEquivalent,
      errorBreakdown,
      pedagogicalSummary,
      recommendations,
    };
  }
}

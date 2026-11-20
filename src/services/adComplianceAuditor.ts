/**
 * Dr. Ahmet Kaya (Klinik & MEB Direktörü) & Doç. Dr. Leyla Korkmaz (KVKK & Mevzuat)
 * bdmind Reklam Stüdyosu — Otomatik Reklam Uyumluluk ve Kalite Denetim Motoru
 *
 * Kurallar:
 * 1. Tanı koyucu dil mutlak yasak: "disleksili çocuk" yerine "disleksi desteği alan çocuk"
 * 2. MEB 573 KHK ve Özel Eğitim Yönetmeliği uyumu
 * 3. KVKK Madde 6: Öğrenci ismi + tanı + skor kombinasyonunun reklamda ifşa edilmesi yasaktır
 * 4. Bilişsel ergonomi ve okunabilirlik skoru
 */

import { AdScore } from '../types/adStudio';

interface DiagnosticRule {
  pattern: RegExp;
  term: string;
  recommendation: string;
}

const FORBIDDEN_DIAGNOSTIC_RULES: DiagnosticRule[] = [
  {
    pattern: /\bdisleksili\b/gi,
    term: 'disleksili',
    recommendation: "'disleksi desteğine ihtiyacı olan' veya 'öğrenme güçlüğü desteği alan'",
  },
  {
    pattern: /\bdisleksisi var\b/gi,
    term: 'disleksisi var',
    recommendation: "'disleksi desteği alıyor' veya 'öğrenme farklılığı deneyimliyor'",
  },
  {
    pattern: /\bhasta\b|\bhastalık\b|\bhastalığı\b/gi,
    term: 'hasta / hastalık',
    recommendation: "Disleksi bir hastalık değil, nörolojik bir öğrenme farklılığıdır. 'Öğrenme profili' kullanın.",
  },
  {
    pattern: /\btedavi\b|\btedavisi\b/gi,
    term: 'tedavi',
    recommendation: "Disleksi tedavi edilmez, nöro-bilişsel stratejilerle desteklenir. 'Bilişsel destek' veya 'eğitimsel müdahale' kullanın.",
  },
  {
    pattern: /\bözürlü\b|\bengelli çocuk\b/gi,
    term: 'özürlü / engelli çocuk',
    recommendation: "'Özel gereksinimli öğrenci' veya 'bireysel eğitim desteğine ihtiyaç duyan çocuk'",
  },
  {
    pattern: /\bkusur\b|\bkusurlu\b|\bözrü\b/gi,
    term: 'kusur / özür',
    recommendation: "'Gelişimsel farklılık' veya 'destek alanı'",
  },
  {
    pattern: /\banormal\b|\bnormal olmayan\b/gi,
    term: 'anormal',
    recommendation: "'Nöro-çeşitli' veya 'özgün öğrenme stili'",
  },
];

export function auditAdContent(fullText: string, title = '', cta = ''): AdScore {
  const combined = `${title} ${fullText} ${cta}`.trim();
  const lower = combined.toLowerCase();

  // 1. Tanı koyucu dil taraması
  const diagnosticTermsDetected: string[] = [];
  const suggestions: string[] = [];

  for (const rule of FORBIDDEN_DIAGNOSTIC_RULES) {
    if (rule.pattern.test(lower)) {
      diagnosticTermsDetected.push(rule.term);
      suggestions.push(`[Etik Düzeltme] "${rule.term}" ifadesi yerine ${rule.recommendation} kullanın.`);
    }
  }

  // 2. KVKK Madde 6 Denetimi (İsim + Tanı + Skor riski)
  const hasKvkkRisk = /\b(öğrenci|çocuk)\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+(isimli|adlı).*(notu|puanı|skoru)\s+\d+/i.test(combined);
  if (hasKvkkRisk) {
    suggestions.push('[KVKK Uyarısı] Gerçek öğrenci ismi ve sınav skorunu reklam materyallerinde ifşa etmeyiniz.');
  }

  // 3. Kanca (Hook) Skoru Hesaplama (0-100)
  let hookScore = 65;
  const hookWords = ['nasıl', 'neden', 'artık', 'ilk kez', 'özel', 'çözüm', 'keşfet', 'yeni', 'fark', 'başarı', 'zaman', '1 tıkla'];
  for (const w of hookWords) {
    if (lower.includes(w)) hookScore += 4;
  }
  if (title.length >= 10 && title.length <= 60) hookScore += 10;
  if (/[!?]/.test(title)) hookScore += 5;
  hookScore = Math.min(98, Math.max(40, hookScore));

  // 4. Bilişsel Okunabilirlik Skoru (Disleksi Ergonomisi)
  // Cümle uzunluğu ve anlaşılırlık
  const sentences = combined.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgWordsPerSentence = sentences.length > 0
    ? combined.split(/\s+/).length / sentences.length
    : 10;
  
  let readabilityScore = 80;
  if (avgWordsPerSentence > 18) {
    readabilityScore -= 20;
    suggestions.push('[Bilişsel Yük] Cümleler ortalama 18 kelimeden uzun. Disleksi dostu okuma için cümleleri kısaltın.');
  } else if (avgWordsPerSentence <= 12) {
    readabilityScore += 15;
  }
  readabilityScore = Math.min(100, Math.max(35, readabilityScore));

  // 5. Duygusal Rezonans (Empati & Güven)
  let emotionalScore = 70;
  const trustWords = ['güven', 'umut', 'başarı', 'destek', 'birlikte', 'potansiyel', 'sevgi', 'şefkat', 'bilimsel', 'gelişim', 'özgüven'];
  for (const tw of trustWords) {
    if (lower.includes(tw)) emotionalScore += 5;
  }
  emotionalScore = Math.min(96, Math.max(45, emotionalScore));

  // 6. Mevzuat & Etik Uyumluluk Skoru
  let complianceScore = 95;
  if (diagnosticTermsDetected.length > 0) {
    complianceScore -= diagnosticTermsDetected.length * 25;
  }
  if (hasKvkkRisk) {
    complianceScore -= 30;
  }
  complianceScore = Math.max(10, Math.min(100, complianceScore));

  // Genel Ağırlıklı Puan
  const overall = Math.round(
    complianceScore * 0.35 +
    readabilityScore * 0.25 +
    hookScore * 0.20 +
    emotionalScore * 0.20
  );

  let ethicsStatus: 'approved' | 'warning' | 'needs_review' = 'approved';
  if (diagnosticTermsDetected.length > 0 || complianceScore < 60) {
    ethicsStatus = 'needs_review';
  } else if (complianceScore < 85 || overall < 75) {
    ethicsStatus = 'warning';
  }

  // CTA Kontrolü
  if (!cta || cta.length < 3) {
    suggestions.push('[Dönüşüm] Güçlü bir eyleme çağrı (CTA) ekleyiniz (Örn: "Ücretsiz İncele", "Demoyu Başlat").');
  }

  return {
    overall,
    hookScore,
    readabilityScore,
    emotionalScore,
    complianceScore,
    ethicsStatus,
    diagnosticTermsDetected,
    suggestions: suggestions.slice(0, 5),
  };
}

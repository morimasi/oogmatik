/**
 * OOGMATIK — Klinik Doğrulama Motoru (Faz 2, Task 5)
 *
 * Dr. Ahmet Kaya protokolü:
 * 1. Tanı koyucu dil tespiti (regex)
 * 2. PII ayrıştırma kontrolleri (KVKK Madde 6)
 * 3. ApprovalMetadata alan doğrulama
 *
 * @module clinicalValidator
 */

import type { ApprovalMetadata } from '../../../types/activityStudio';

// ─── 1. TANI KOYUCU DİL TESPİTİ ────────────────────────────────

/**
 * Kesin tanı bildiren ifadeler — YASAK
 * "disleksisi var" → "disleksi desteğine ihtiyacı var"
 */
const DIAGNOSTIC_PATTERNS: ReadonlyArray<{ pattern: RegExp; replacement: string }> = [
  // — Doğrudan tanı koyma —
  { pattern: /disleksi(?:si|li)\s+(?:var|olan|sahip)/gi,           replacement: 'disleksi desteğine ihtiyacı var' },
  { pattern: /diskalkuli(?:si|li)\s+(?:var|olan|sahip)/gi,         replacement: 'diskalkuli desteğine ihtiyacı var' },
  { pattern: /dehb['']?(?:si|li)\s+(?:var|olan|sahip)/gi,          replacement: 'dikkat desteğine ihtiyacı var' },
  { pattern: /(?:otizm|osg|ösg)(?:li|i)\s+(?:var|olan|sahip)/gi,  replacement: 'özel öğrenme desteğine ihtiyacı var' },

  // — Etiketleyici kalıplar —
  { pattern: /\bdislektik\b/gi,                                     replacement: 'disleksi belirtileri gösteren' },
  { pattern: /\bdiskalkulik\b/gi,                                   replacement: 'diskalkuli belirtileri gösteren' },
  { pattern: /\bhiperaktif\s+çocuk\b/gi,                            replacement: 'dikkat desteği alan çocuk' },
  { pattern: /\böğrenme\s+güçlüğü\s+olan\b/gi,                     replacement: 'öğrenme desteğine ihtiyaç duyan' },
  { pattern: /\böğrenme\s+engelli\b/gi,                             replacement: 'öğrenme desteğine ihtiyaç duyan' },
  { pattern: /\bengelli\s+öğrenci\b/gi,                             replacement: 'destek ihtiyacı olan öğrenci' },

  // — Klinik teşhis kalıpları —
  { pattern: /\btanısı\s+konulmuş\b/gi,                            replacement: 'değerlendirme sonucu destek önerilen' },
  { pattern: /\btanı\s+almış\b/gi,                                  replacement: 'değerlendirme sürecinden geçmiş' },
  { pattern: /\bhastalığı\s+var\b/gi,                               replacement: 'desteğe ihtiyacı var' },

  // — Tıbbi tavsiye sınırı —
  { pattern: /\bilaç\s+kullan(?:ması|malı|ıyor)\b/gi,              replacement: '[tıbbi tavsiye platformun kapsamı dışındadır]' },
  { pattern: /\btedavi\s+(?:edilmeli|gerekiyor|görmeli)\b/gi,      replacement: '[uzman yönlendirmesi önerilir]' },
];

export interface DiagnosticLanguageViolation {
  matched: string;
  index: number;
  suggestion: string;
}

/**
 * Metni tanı koyucu dil açısından tarar.
 * @returns Tespit edilen ihlaller (boş dizi = temiz)
 */
export function detectDiagnosticLanguage(text: string): DiagnosticLanguageViolation[] {
  if (!text || typeof text !== 'string') return [];

  const violations: DiagnosticLanguageViolation[] = [];

  for (const { pattern, replacement } of DIAGNOSTIC_PATTERNS) {
    // Her aramada regex'i sıfırla
    const re = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;

    while ((match = re.exec(text)) !== null) {
      violations.push({
        matched: match[0],
        index: match.index,
        suggestion: replacement,
      });
    }
  }

  return violations;
}

// ─── 2. PII AYRIŞTIRMA KONTROLLERİ (KVKK Madde 6) ─────────────

/**
 * PII alanları: ad + tanı + skor aynı bağlamda birlikte görünmemeli.
 * Platform çıktısında bunların co-occurrence'ını denetler.
 */

/** TC Kimlik Numarası (11 haneli) */
const TC_KIMLIK_RE = /\b[1-9]\d{10}\b/g;

/** Telefon numarası (Türkiye) */
const PHONE_RE = /(?:\+90|0)\s*(?:\(\d{3}\)|\d{3})[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/g;

/** E-posta */
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** Ad-soyad kalıpları (büyük harfle başlayan 2+ kelime) — heuristic */
const FULL_NAME_RE = /\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\b/g;

/** Sayısal skor/puan gösterimi */
const SCORE_RE = /\b(?:puan|skor|IQ|percentil)\s*[:=]?\s*\d+/gi;

export type PIIType = 'tc_kimlik' | 'phone' | 'email' | 'full_name' | 'score';

export interface PIIDetection {
  type: PIIType;
  value: string;
  index: number;
}

/**
 * Metindeki PII öğelerini tespit eder.
 */
export function detectPII(text: string): PIIDetection[] {
  if (!text || typeof text !== 'string') return [];

  const detections: PIIDetection[] = [];
  const scanners: Array<{ type: PIIType; regex: RegExp }> = [
    { type: 'tc_kimlik',  regex: new RegExp(TC_KIMLIK_RE.source, TC_KIMLIK_RE.flags) },
    { type: 'phone',      regex: new RegExp(PHONE_RE.source, PHONE_RE.flags) },
    { type: 'email',      regex: new RegExp(EMAIL_RE.source, EMAIL_RE.flags) },
    { type: 'full_name',  regex: new RegExp(FULL_NAME_RE.source, FULL_NAME_RE.flags) },
    { type: 'score',      regex: new RegExp(SCORE_RE.source, SCORE_RE.flags) },
  ];

  for (const { type, regex } of scanners) {
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      detections.push({ type, value: m[0], index: m.index });
    }
  }

  return detections;
}

/**
 * KVKK kırmızı çizgi: ad + tanı + skor birlikte mi?
 * Üçü aynı metinde bir arada bulunmamalı.
 */
export function checkPIICoOccurrence(text: string): {
  safe: boolean;
  violations: string[];
} {
  const pii = detectPII(text);
  const hasName = pii.some((d) => d.type === 'full_name');
  const hasScore = pii.some((d) => d.type === 'score');
  const hasDiagnosis = detectDiagnosticLanguage(text).length > 0;

  const violations: string[] = [];

  if (hasName && hasDiagnosis) {
    violations.push('KVKK: Öğrenci adı ve tanı/durum bilgisi aynı çıktıda birlikte görünüyor.');
  }
  if (hasName && hasScore) {
    violations.push('KVKK: Öğrenci adı ve performans skoru aynı çıktıda birlikte görünüyor.');
  }
  if (hasName && hasDiagnosis && hasScore) {
    violations.push('KVKK KRİTİK: Ad + tanı + skor üçlüsü aynı çıktıda. Bu mutlak yasaktır.');
  }

  return { safe: violations.length === 0, violations };
}

// ─── 3. APPROVAL METADATA DOĞRULAMA ────────────────────────────

export interface ApprovalValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * ApprovalMetadata alanlarının tutarlılığını doğrular.
 */
export function validateApprovalMetadata(
  approval: ApprovalMetadata | null | undefined
): ApprovalValidationResult {
  const errors: string[] = [];

  if (!approval) {
    return { valid: false, errors: ['ApprovalMetadata zorunludur.'] };
  }

  // — clinicalApproval kontrolleri —
  const ca = approval.clinicalApproval;
  if (!ca) {
    errors.push('clinicalApproval alanı eksik.');
  } else {
    if (typeof ca.approved !== 'boolean') {
      errors.push('clinicalApproval.approved boolean olmalı.');
    }
    if (!ca.reviewerId || ca.reviewerId.trim().length === 0) {
      errors.push('clinicalApproval.reviewerId boş olamaz.');
    }
    if (!ca.timestamp || !isValidISO8601(ca.timestamp)) {
      errors.push('clinicalApproval.timestamp geçerli ISO 8601 formatında olmalı.');
    }
  }

  // — pedagogicalApproval kontrolleri —
  const pa = approval.pedagogicalApproval;
  if (!pa) {
    errors.push('pedagogicalApproval alanı eksik.');
  } else {
    if (typeof pa.approved !== 'boolean') {
      errors.push('pedagogicalApproval.approved boolean olmalı.');
    }
    if (!pa.reviewerId || pa.reviewerId.trim().length === 0) {
      errors.push('pedagogicalApproval.reviewerId boş olamaz.');
    }
    if (!pa.timestamp || !isValidISO8601(pa.timestamp)) {
      errors.push('pedagogicalApproval.timestamp geçerli ISO 8601 formatında olmalı.');
    }
  }

  // — status tutarlılığı —
  if (approval.status === 'fully_approved') {
    if (!ca?.approved) {
      errors.push('Status "fully_approved" ama clinicalApproval.approved=false.');
    }
    if (!pa?.approved) {
      errors.push('Status "fully_approved" ama pedagogicalApproval.approved=false.');
    }
  }

  if (approval.status === 'clinical_approved' && !ca?.approved) {
    errors.push('Status "clinical_approved" ama clinicalApproval.approved=false.');
  }

  if (approval.status === 'pedagogical_approved' && !pa?.approved) {
    errors.push('Status "pedagogical_approved" ama pedagogicalApproval.approved=false.');
  }

  if (approval.status === 'rejected') {
    if (ca?.approved && pa?.approved) {
      errors.push('Status "rejected" ama her iki onay da true — tutarsızlık.');
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── 4. BİRLEŞİK DOĞRULAMA ─────────────────────────────────────

export interface ClinicalValidationResult {
  passed: boolean;
  valid: boolean;
  errors: string[];
  diagnosticLanguage: DiagnosticLanguageViolation[];
  piiCoOccurrence: { safe: boolean; violations: string[] };
  approvalValidation: ApprovalValidationResult;
}

/**
 * Tüm klinik doğrulamaları tek çağrıda çalıştırır.
 */
export function runClinicalValidation(
  contentText: string,
  approval: ApprovalMetadata | null | undefined
): ClinicalValidationResult {
  const diagnosticLanguage = detectDiagnosticLanguage(contentText);
  const piiCoOccurrence = checkPIICoOccurrence(contentText);
  const approvalValidation = validateApprovalMetadata(approval);
  const errors: string[] = [];

  if (diagnosticLanguage.length > 0) {
    errors.push('Tanı koyucu dil tespit edildi.');
  }
  if (!piiCoOccurrence.safe) {
    errors.push(...piiCoOccurrence.violations.map((item) => `KVKK: ${item}`));
  }
  if (!approvalValidation.valid && approval) {
    errors.push(...approvalValidation.errors);
  }

  const valid =
    diagnosticLanguage.length === 0 &&
    piiCoOccurrence.safe &&
    (approval ? approvalValidation.valid : true);

  return {
    passed: valid,
    valid,
    errors,
    diagnosticLanguage,
    piiCoOccurrence,
    approvalValidation,
  };
}

// ─── YARDIMCI ────────────────────────────────────────────────────

function isValidISO8601(value: string): boolean {
  const d = new Date(value);
  return !isNaN(d.getTime()) && value.includes('T');
}

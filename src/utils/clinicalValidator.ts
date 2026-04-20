/**
 * Clinical Validator — Dr. Ahmet Kaya Klinik Direktif Uygulaması
 *
 * 3 katmanlı denetim:
 *   1. Tanı koyucu dil blacklist (regex)
 *   2. KVKK birlikte-görünmeme kuralı (ad + tanı + skor)
 *   3. Approval metadata kontrolü (klinik onay zorunluluğu)
 *
 * YASAL DAYANAKLAR:
 *   - 6698 sayılı KVKK Madde 6 (özel nitelikli kişisel veriler)
 *   - MEB Özel Eğitim Hizmetleri Yönetmeliği
 *   - 573 sayılı KHK
 */

// ─── 1. TANI KOYUCU DİL BLACKLIST ─────────────────────────────────────────────

export interface DiagnosticLanguageViolation {
  /** Bulunan yasak ifade */
  matched: string;
  /** Metnin hangi kısmında (ilk 80 karakter bağlam) */
  context: string;
  /** Önerilen düzeltme */
  suggestion: string;
  /** Kural kodu */
  ruleCode: string;
}

/**
 * Tanı koyucu dil kalıpları — kesin tanı ima eden ifadeler yasaktır.
 *
 * Platform eğitimsel müdahale sunar, klinik tanı koymaz.
 * "X'si var" → "X desteğine ihtiyacı var" dönüşümü zorunlu.
 */
const DIAGNOSTIC_BLACKLIST: Array<{
  pattern: RegExp;
  suggestion: string;
  ruleCode: string;
}> = [
  // ── Kesin tanı kalıpları ──
  {
    pattern: /\b(disleksi(?:si|li|dir|yi|den|ye)?)\s+(var|olan|sahip|bulunan|gösteren|tespit\s+edil(?:en|miş|di))\b/gi,
    suggestion: '"disleksi desteğine ihtiyacı var" veya "disleksi riski taşıyan"',
    ruleCode: 'DIAG_001',
  },
  {
    pattern: /\b(DEHB|dikkat\s+eksikliği)(?:'?(?:si|li|dir|yi|den|ye))?\s+(var|olan|sahip|bulunan|tespit\s+edil(?:en|miş|di))\b/gi,
    suggestion: '"dikkat desteğine ihtiyacı var" veya "dikkat güçlüğü gözlemlenen"',
    ruleCode: 'DIAG_002',
  },
  {
    pattern: /\b(diskalkuli(?:si|li|dir|yi|den|ye)?)\s+(var|olan|sahip|bulunan|tespit\s+edil(?:en|miş|di))\b/gi,
    suggestion: '"matematik öğrenme desteğine ihtiyacı var"',
    ruleCode: 'DIAG_003',
  },
  {
    pattern: /\b(öğrenme\s+güçlüğü)(?:'?(?:ne|nü|nden|nde))?\s+(tanı(?:sı)?|teşhis(?:i)?)\s*(kon(?:ul)?(?:muş|du|an|ur))\b/gi,
    suggestion: '"öğrenme desteğine ihtiyaç duyan"',
    ruleCode: 'DIAG_004',
  },
  // ── "X hastası", "X rahatsızlığı olan" ──
  {
    pattern: /\b(disleksi|diskalkuli|DEHB|otizm)\s+(hastas[ıi]|rahatsızl[ıi]ğ[ıi]|bozukluğu|engeli)/gi,
    suggestion: '"X desteği alan öğrenci" — hasta/rahatsızlık/bozukluk etiketleri yasaktır',
    ruleCode: 'DIAG_005',
  },
  // ── "Bu çocuk X'dir" ──
  {
    pattern: /\b(?:bu\s+)?(?:çocuk|öğrenci|birey)\s+(?:dislektik|hiperaktif|dikkat\s+eksik(?:li)?|otistik)(?:tir|dir|dır)?\b/gi,
    suggestion: 'Kişiyi tanıyla etiketleme — "disleksi desteği alan öğrenci" kullan',
    ruleCode: 'DIAG_006',
  },
  // ── İlaç/tıbbi tedavi önerisi ──
  {
    pattern: /\b(ilaç|medikasyon|ritalin|concerta|strattera|atenra)\s*(kullan|başla|öner|gerek)/gi,
    suggestion: 'Platform EĞİTİMSEL müdahale sunar — tıbbi tavsiye yasaktır',
    ruleCode: 'DIAG_007',
  },
  // ── Kesin tanı fiilleri ──
  {
    pattern: /\b(tanı\s+kon(?:ul)?(?:muş|du|an|ur|abilir)|teşhis\s+(?:edil(?:miş|di|en)|kon(?:ul)?(?:muş|du)))\b/gi,
    suggestion: '"değerlendirme sonucu destek alanı belirlenen" kullan',
    ruleCode: 'DIAG_008',
  },
];

/**
 * Metni tanı koyucu dil açısından tarar.
 * @returns İhlal listesi (boş ise temiz)
 */
export function checkDiagnosticLanguage(text: string): DiagnosticLanguageViolation[] {
  if (!text || typeof text !== 'string') return [];

  const violations: DiagnosticLanguageViolation[] = [];

  for (const rule of DIAGNOSTIC_BLACKLIST) {
    // Her kural için regex'i sıfırla (global flag)
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = rule.pattern.exec(text)) !== null) {
      const start = Math.max(0, match.index - 20);
      const end = Math.min(text.length, match.index + match[0].length + 20);
      const context = text.slice(start, end);

      violations.push({
        matched: match[0],
        context: context.replace(/\n/g, ' ').trim(),
        suggestion: rule.suggestion,
        ruleCode: rule.ruleCode,
      });
    }
  }

  return violations;
}

// ─── 2. KVKK BİRLİKTE-GÖRÜNMEME KURALI ────────────────────────────────────────

export interface KVKKCoVisibilityResult {
  /** KVKK uyumlu mu? */
  compliant: boolean;
  /** Hangi veri türleri birlikte bulundu? */
  coVisibleFields: string[];
  /** Açıklama */
  reason: string;
}

/**
 * Öğrenci adı + tanı bilgisi + performans skoru — bu üçlü ASLA
 * aynı görünümde/çıktıda birlikte görünmemeli (KVKK Madde 6).
 *
 * İki veri bile birlikte tehlikelidir:
 *   - ad + tanı → kişi tanımlanabilir + özel nitelikli veri
 *   - ad + skor → performans profillemesi
 *   - tanı + skor → küçük gruplarda re-identification riski
 *
 * Güvenli eşik: aynı bağlamda en fazla 1 tür veri.
 */
export function checkKVKKCoVisibility(data: {
  hasStudentName?: boolean;
  hasDiagnosisInfo?: boolean;
  hasPerformanceScore?: boolean;
  hasAssessmentResult?: boolean;
}): KVKKCoVisibilityResult {
  const presentFields: string[] = [];

  if (data.hasStudentName) presentFields.push('studentName');
  if (data.hasDiagnosisInfo) presentFields.push('diagnosisInfo');
  if (data.hasPerformanceScore || data.hasAssessmentResult) {
    presentFields.push('performanceScore');
  }

  // 2+ farklı kategoride veri birlikte bulunmamalı
  if (presentFields.length >= 2) {
    return {
      compliant: false,
      coVisibleFields: presentFields,
      reason: `KVKK Madde 6 ihlali: ${presentFields.join(' + ')} aynı görünümde birlikte bulunamaz. Anonim ID kullanın veya veriyi ayırın.`,
    };
  }

  return {
    compliant: true,
    coVisibleFields: presentFields,
    reason: 'KVKK uyumlu',
  };
}

/**
 * Metin içinde ad + tanı + skor kalıplarının birlikte geçip geçmediğini
 * basit heuristik ile tespit eder. UI render öncesi son savunma hattı.
 */
export function scanTextForKVKKViolation(text: string): KVKKCoVisibilityResult {
  if (!text || typeof text !== 'string') {
    return { compliant: true, coVisibleFields: [], reason: 'Boş metin' };
  }

  // Türk isim kalıpları (2+ kelime, ilk harfler büyük)
  const namePattern = /\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\b/;
  // Tanı / durum kalıpları
  const diagnosisPattern = /\b(disleksi|diskalkuli|DEHB|dikkat\s+eksikliği|öğrenme\s+güçlüğü|otizm|özel\s+eğitim\s+tanı)/gi;
  // Skor / puan kalıpları
  const scorePattern = /\b(\d{1,3}\s*(?:puan|%|skor|doğru|yanlış|başarı)|%\s*\d{1,3}|not:\s*\d)\b/gi;

  const hasName = namePattern.test(text);
  const hasDiagnosis = diagnosisPattern.test(text);
  const hasScore = scorePattern.test(text);

  return checkKVKKCoVisibility({
    hasStudentName: hasName,
    hasDiagnosisInfo: hasDiagnosis,
    hasPerformanceScore: hasScore,
  });
}

// ─── 3. APPROVAL METADATA KONTROLÜ ────────────────────────────────────────────

export interface ClinicalApprovalMeta {
  /** Onaylayan uzman */
  approvedBy: string;
  /** Onay tarihi (ISO 8601) */
  approvedAt: string;
  /** Onay tipi */
  approvalType: 'clinical_content' | 'bep_template' | 'assessment_tool' | 'activity_template';
  /** Versiyon numarası */
  version: string;
  /** Klinik kanıt referansı (opsiyonel ama önerilir) */
  evidenceReference?: string;
}

export interface ApprovalValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Klinik içerik ve şablonlarda onay metadata'sının varlığını ve
 * geçerliliğini kontrol eder.
 *
 * Onaysız klinik içerik yayına alınamaz.
 */
export function validateApprovalMetadata(
  meta: unknown
): ApprovalValidationResult {
  const errors: string[] = [];

  if (!meta || typeof meta !== 'object') {
    return { valid: false, errors: ['Onay metadata eksik — klinik içerik onaysız yayınlanamaz'] };
  }

  const m = meta as Record<string, unknown>;

  // approvedBy kontrolü
  if (!m.approvedBy || typeof m.approvedBy !== 'string' || m.approvedBy.trim().length < 3) {
    errors.push('approvedBy: Onaylayan uzman adı zorunlu (min 3 karakter)');
  }

  // approvedAt kontrolü — geçerli ISO tarih mi?
  if (!m.approvedAt || typeof m.approvedAt !== 'string') {
    errors.push('approvedAt: Onay tarihi (ISO 8601) zorunlu');
  } else {
    const parsed = Date.parse(m.approvedAt);
    if (isNaN(parsed)) {
      errors.push('approvedAt: Geçerli bir ISO 8601 tarihi değil');
    } else {
      // Gelecek tarih olamaz
      if (parsed > Date.now()) {
        errors.push('approvedAt: Onay tarihi gelecekte olamaz');
      }
      // 2 yıldan eski onay → yenilenmeli
      const twoYearsMs = 2 * 365 * 24 * 60 * 60 * 1000;
      if (Date.now() - parsed > twoYearsMs) {
        errors.push('approvedAt: Onay 2 yıldan eski — yenileme gerekli (MEB güncelleme döngüsü)');
      }
    }
  }

  // approvalType kontrolü
  const validTypes = ['clinical_content', 'bep_template', 'assessment_tool', 'activity_template'];
  if (!m.approvalType || !validTypes.includes(m.approvalType as string)) {
    errors.push(`approvalType: Geçerli değerler: ${validTypes.join(', ')}`);
  }

  // version kontrolü — semver benzeri
  if (!m.version || typeof m.version !== 'string') {
    errors.push('version: Versiyon numarası zorunlu');
  } else if (!/^\d+\.\d+(\.\d+)?$/.test(m.version)) {
    errors.push('version: Geçerli format: X.Y veya X.Y.Z');
  }

  return { valid: errors.length === 0, errors };
}

// ─── 4. BİRLEŞİK DOĞRULAMA ───────────────────────────────────────────────────

export interface ClinicalValidationReport {
  /** Genel sonuç — herhangi bir ihlal varsa false */
  passed: boolean;
  /** Tanı koyucu dil ihlalleri */
  diagnosticLanguage: DiagnosticLanguageViolation[];
  /** KVKK birlikte-görünmeme durumu */
  kvkkCompliance: KVKKCoVisibilityResult;
  /** Onay metadata durumu (sadece klinik içerik için) */
  approvalStatus?: ApprovalValidationResult;
  /** Zaman damgası */
  timestamp: string;
}

/**
 * Tek fonksiyonla 3 katmanlı klinik doğrulama.
 *
 * @param text - Denetlenecek metin/içerik
 * @param approvalMeta - Klinik onay bilgisi (varsa)
 * @returns Birleşik doğrulama raporu
 *
 * @example
 * ```typescript
 * const report = runClinicalValidation(
 *   activityOutput.title,
 *   activityOutput.clinicalApproval
 * );
 * if (!report.passed) {
 *   throw new ValidationError(
 *     'Klinik doğrulama başarısız',
 *     'CLINICAL_VALIDATION_FAILED',
 *     400,
 *     report
 *   );
 * }
 * ```
 */
export function runClinicalValidation(
  text: string,
  approvalMeta?: unknown
): ClinicalValidationReport {
  const diagnosticLanguage = checkDiagnosticLanguage(text);
  const kvkkCompliance = scanTextForKVKKViolation(text);
  const approvalStatus = approvalMeta !== undefined
    ? validateApprovalMetadata(approvalMeta)
    : undefined;

  const passed =
    diagnosticLanguage.length === 0 &&
    kvkkCompliance.compliant &&
    (approvalStatus === undefined || approvalStatus.valid);

  return {
    passed,
    diagnosticLanguage,
    kvkkCompliance,
    approvalStatus,
    timestamp: new Date().toISOString(),
  };
}

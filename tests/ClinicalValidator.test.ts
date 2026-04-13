import { describe, it, expect } from 'vitest';
import {
  checkDiagnosticLanguage,
  checkKVKKCoVisibility,
  scanTextForKVKKViolation,
  validateApprovalMetadata,
  runClinicalValidation,
} from '../src/utils/clinicalValidator';

// ─── 1. TANI KOYUCU DİL TESTLERİ ──────────────────────────────────────────────

describe('checkDiagnosticLanguage', () => {
  it('kesin tanı kalıplarını yakalamalı', () => {
    const violations = checkDiagnosticLanguage('Bu öğrencinin disleksisi var.');
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].ruleCode).toBe('DIAG_001');
  });

  it('DEHB tanı ifadesini yakalamalı', () => {
    const violations = checkDiagnosticLanguage('DEHB olan öğrenci için aktivite.');
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].ruleCode).toBe('DIAG_002');
  });

  it('diskalkuli tanı ifadesini yakalamalı', () => {
    const violations = checkDiagnosticLanguage('Diskalkulisi tespit edilen çocuk.');
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].ruleCode).toBe('DIAG_003');
  });

  it('"hasta" ve "bozukluk" etiketlerini yakalamalı', () => {
    const violations = checkDiagnosticLanguage('Disleksi hastası olan çocuk.');
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].ruleCode).toBe('DIAG_005');
  });

  it('"dislektik" kişi etiketini yakalamalı', () => {
    const violations = checkDiagnosticLanguage('Bu çocuk dislektiktir.');
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].ruleCode).toBe('DIAG_006');
  });

  it('ilaç önerilerini yakalamalı', () => {
    const violations = checkDiagnosticLanguage('Ritalin kullanması önerilir.');
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0].ruleCode).toBe('DIAG_007');
  });

  it('güvenli ifadeleri geçirmeli', () => {
    const safeTexts = [
      'Disleksi desteğine ihtiyacı var.',
      'Dikkat desteği alan öğrenci.',
      'Matematik öğrenme desteğine ihtiyaç duyan çocuk.',
      'Disleksi riski taşıyan öğrenci için hece çalışması.',
      'Öğrenci okuma akıcılığı konusunda destek alıyor.',
    ];
    for (const text of safeTexts) {
      const violations = checkDiagnosticLanguage(text);
      expect(violations).toHaveLength(0);
    }
  });

  it('boş ve null değerleri güvenle işlemeli', () => {
    expect(checkDiagnosticLanguage('')).toHaveLength(0);
    expect(checkDiagnosticLanguage(null as unknown as string)).toHaveLength(0);
    expect(checkDiagnosticLanguage(undefined as unknown as string)).toHaveLength(0);
  });
});

// ─── 2. KVKK BİRLİKTE-GÖRÜNMEME TESTLERİ ──────────────────────────────────────

describe('checkKVKKCoVisibility', () => {
  it('ad + tanı birlikte → KVKK ihlali', () => {
    const result = checkKVKKCoVisibility({
      hasStudentName: true,
      hasDiagnosisInfo: true,
    });
    expect(result.compliant).toBe(false);
    expect(result.coVisibleFields).toContain('studentName');
    expect(result.coVisibleFields).toContain('diagnosisInfo');
  });

  it('ad + skor birlikte → KVKK ihlali', () => {
    const result = checkKVKKCoVisibility({
      hasStudentName: true,
      hasPerformanceScore: true,
    });
    expect(result.compliant).toBe(false);
  });

  it('tanı + skor birlikte → KVKK ihlali', () => {
    const result = checkKVKKCoVisibility({
      hasDiagnosisInfo: true,
      hasAssessmentResult: true,
    });
    expect(result.compliant).toBe(false);
  });

  it('tek veri türü → uyumlu', () => {
    expect(checkKVKKCoVisibility({ hasStudentName: true }).compliant).toBe(true);
    expect(checkKVKKCoVisibility({ hasDiagnosisInfo: true }).compliant).toBe(true);
    expect(checkKVKKCoVisibility({ hasPerformanceScore: true }).compliant).toBe(true);
  });

  it('hiç veri yok → uyumlu', () => {
    expect(checkKVKKCoVisibility({}).compliant).toBe(true);
  });
});

describe('scanTextForKVKKViolation', () => {
  it('ad + tanı + skor birlikte geçen metni yakalamalı', () => {
    const text = 'Ahmet Yılmaz disleksi tanısı 85 puan almıştır.';
    const result = scanTextForKVKKViolation(text);
    expect(result.compliant).toBe(false);
  });

  it('anonim metni geçirmeli', () => {
    const text = 'student_7f3a kodlu öğrenci okuma çalışmasını tamamladı.';
    const result = scanTextForKVKKViolation(text);
    expect(result.compliant).toBe(true);
  });

  it('boş metni güvenle işlemeli', () => {
    expect(scanTextForKVKKViolation('').compliant).toBe(true);
  });
});

// ─── 3. APPROVAL METADATA TESTLERİ ─────────────────────────────────────────────

describe('validateApprovalMetadata', () => {
  const validMeta = {
    approvedBy: 'Dr. Ahmet Kaya',
    approvedAt: '2025-06-15T10:00:00Z',
    approvalType: 'clinical_content',
    version: '1.0',
  };

  it('tam ve geçerli metadata → valid', () => {
    const result = validateApprovalMetadata(validMeta);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('eksik metadata → invalid + hata mesajları', () => {
    const result = validateApprovalMetadata({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('null metadata → invalid', () => {
    const result = validateApprovalMetadata(null);
    expect(result.valid).toBe(false);
  });

  it('gelecek tarihli onay → invalid', () => {
    const result = validateApprovalMetadata({
      ...validMeta,
      approvedAt: '2030-01-01T00:00:00Z',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('gelecek'))).toBe(true);
  });

  it('2 yıldan eski onay → yenileme uyarısı', () => {
    const result = validateApprovalMetadata({
      ...validMeta,
      approvedAt: '2020-01-01T00:00:00Z',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('yenileme'))).toBe(true);
  });

  it('geçersiz approvalType → invalid', () => {
    const result = validateApprovalMetadata({
      ...validMeta,
      approvalType: 'random_type',
    });
    expect(result.valid).toBe(false);
  });

  it('geçersiz versiyon formatı → invalid', () => {
    const result = validateApprovalMetadata({
      ...validMeta,
      version: 'abc',
    });
    expect(result.valid).toBe(false);
  });
});

// ─── 4. BİRLEŞİK DOĞRULAMA TESTLERİ ───────────────────────────────────────────

describe('runClinicalValidation', () => {
  it('temiz metin + geçerli onay → passed', () => {
    const report = runClinicalValidation(
      'Disleksi desteği alan öğrenci için hece çalışması.',
      {
        approvedBy: 'Dr. Ahmet Kaya',
        approvedAt: '2025-06-15T10:00:00Z',
        approvalType: 'activity_template',
        version: '1.0',
      }
    );
    expect(report.passed).toBe(true);
    expect(report.timestamp).toBeTruthy();
  });

  it('tanı koyucu dil → failed', () => {
    const report = runClinicalValidation('Bu çocuğun disleksisi var.');
    expect(report.passed).toBe(false);
    expect(report.diagnosticLanguage.length).toBeGreaterThan(0);
  });

  it('KVKK ihlali → failed', () => {
    const report = runClinicalValidation('Mehmet Demir disleksi 90 puan');
    expect(report.passed).toBe(false);
    expect(report.kvkkCompliance.compliant).toBe(false);
  });

  it('onay metadata eksik (gönderilmemişse) → geçer', () => {
    const report = runClinicalValidation('Güvenli metin.');
    expect(report.passed).toBe(true);
    expect(report.approvalStatus).toBeUndefined();
  });

  it('onay metadata geçersiz → failed', () => {
    const report = runClinicalValidation('Güvenli metin.', { approvedBy: '' });
    expect(report.passed).toBe(false);
  });
});

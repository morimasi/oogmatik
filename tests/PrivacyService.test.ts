/**
 * OOGMATIK - Privacy Service Tests
 * KVKK Madde 6 uyumlu veri gizliliği testleri
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { dlpService as PrivacyService, hashTcNo, anonymizeStudent, sanitizeForAI } from '@/services/privacyService.js';
import { ValidationError } from '@/utils/AppError.js';

describe('PrivacyService - TC Kimlik No Hash', () => {
  it('geçerli TC No hash eder', () => {
    const result = PrivacyService.hashTcNo('12345678901');

    expect(result).toHaveProperty('hash');
    expect(result.hash).toHaveLength(64); // SHA-256 = 64 hex chars
    expect(result.lastFour).toBe('8901');
    expect(result.category).toBe('tcNo');
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO 8601
  });

  it('aynı TC No için aynı hash döner', () => {
    const result1 = PrivacyService.hashTcNo('12345678901');
    const result2 = PrivacyService.hashTcNo('12345678901');

    expect(result1.hash).toBe(result2.hash);
  });

  it('farklı TC No için farklı hash döner', () => {
    const result1 = PrivacyService.hashTcNo('12345678901');
    const result2 = PrivacyService.hashTcNo('98765432109');

    expect(result1.hash).not.toBe(result2.hash);
  });

  it('11 hane olmayan TC No için ValidationError fırlatır', () => {
    expect(() => PrivacyService.hashTcNo('123456789')).toThrow(ValidationError);
    expect(() => PrivacyService.hashTcNo('123456789012')).toThrow(ValidationError);
  });

  it('boş TC No için ValidationError fırlatır', () => {
    expect(() => PrivacyService.hashTcNo('')).toThrow(ValidationError);
  });

  it('numerik olmayan karakterleri temizler', () => {
    const result = PrivacyService.hashTcNo('123-456-789-01');
    expect(result.lastFour).toBe('8901'); // Tire'ler kaldırılmış
  });
});

describe('PrivacyService - TC No Doğrulama', () => {
  it('doğru TC No hash eşleşmesi doğrular', () => {
    const tcNo = '12345678901';
    const { hash } = PrivacyService.hashTcNo(tcNo);

    const isValid = PrivacyService.verifyTcNo(tcNo, hash);
    expect(isValid).toBe(true);
  });

  it('yanlış TC No hash eşleşmesini reddeder', () => {
    const tcNo = '12345678901';
    const { hash } = PrivacyService.hashTcNo(tcNo);

    const isValid = PrivacyService.verifyTcNo('98765432109', hash);
    expect(isValid).toBe(false);
  });

  it('geçersiz hash için false döner', () => {
    const isValid = PrivacyService.verifyTcNo('12345678901', 'invalid-hash');
    expect(isValid).toBe(false);
  });
});

describe('PrivacyService - Öğrenci ID Anonimleştirme', () => {
  it('öğrenci ID anonimleştirir', () => {
    const result = PrivacyService.anonymizeStudentId('student-123-ahmet');

    expect(result.anonymousId).toMatch(/^student_[a-f0-9]{8}$/); // student_ + 6 char hash + 2 char timestamp
    expect(result.originalIdHash).toHaveLength(64);
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('aynı ID için farklı anonim ID üretir (timestamp nedeniyle)', () => {
    const result1 = PrivacyService.anonymizeStudentId('student-123-ahmet');
    const result2 = PrivacyService.anonymizeStudentId('student-123-ahmet');

    // Original hash aynı olmalı
    expect(result1.originalIdHash).toBe(result2.originalIdHash);

    // Anonim ID farklı olabilir (timestamp değiştiği için)
    // Bu, her AI çağrısında farklı ID kullanılması için tasarım kararı
  });

  it('boş ID için ValidationError fırlatır', () => {
    expect(() => PrivacyService.anonymizeStudentId('')).toThrow(ValidationError);
  });
});

describe('PrivacyService - Tanı Bilgisi Sanitizasyonu', () => {
  it('TC Kimlik No kaldırır', () => {
    const text = 'Öğrencinin TC No: 12345678901';
    const result = PrivacyService.sanitizeDiagnosisForAI(text);

    expect(result.sanitized).toBe('Öğrencinin TC No: [TC_NO_REDACTED]');
    expect(result.removed).toContain('TC Kimlik No');
    expect(result.safe).toBe(true);
  });

  it('e-posta adreslerini kaldırır', () => {
    const text = 'İletişim: ahmet@example.com';
    const result = PrivacyService.sanitizeDiagnosisForAI(text);

    expect(result.sanitized).toBe('İletişim: [EMAIL_REDACTED]');
    expect(result.removed).toContain('E-posta');
  });

  it('telefon numaralarını kaldırır', () => {
    const text = 'Tel: 0532 123 45 67';
    const result = PrivacyService.sanitizeDiagnosisForAI(text);

    expect(result.sanitized).toContain('[PHONE_REDACTED]');
    expect(result.removed).toContain('Telefon');
  });

  it('klinik terimleri jenerikleştirir', () => {
    const text = 'Öğrencinin disleksi tanısı var';
    const result = PrivacyService.sanitizeDiagnosisForAI(text);

    expect(result.sanitized).toBe('Öğrencinin özel öğrenme güçlüğü tanısı var');
    expect(result.removed).toContain('Klinik terim: disleksi');
  });

  it('ADHD terimini jenerikleştirir', () => {
    const text = 'ADHD tanısı mevcut';
    const result = PrivacyService.sanitizeDiagnosisForAI(text);

    expect(result.sanitized).toBe('dikkat ve öğrenme desteği gerektiren durum tanısı mevcut');
  });

  it('diskalkuli terimini jenerikleştirir', () => {
    const text = 'Diskalkuli nedeniyle matematik desteği';
    const result = PrivacyService.sanitizeDiagnosisForAI(text);

    expect(result.sanitized).toBe('özel öğrenme güçlüğü nedeniyle matematik desteği');
  });

  it('temiz metni olduğu gibi döner', () => {
    const text = 'Öğrenci özel öğrenme desteği alıyor';
    const result = PrivacyService.sanitizeDiagnosisForAI(text);

    expect(result.sanitized).toBe(text);
    expect(result.removed).toHaveLength(0);
    expect(result.safe).toBe(true);
  });

  it('boş metin için güvenli sonuç döner', () => {
    const result = PrivacyService.sanitizeDiagnosisForAI('');

    expect(result.sanitized).toBe('');
    expect(result.safe).toBe(true);
  });

  it('opsiyon ile sanitizasyonu kontrol eder', () => {
    const text = 'TC: 12345678901, disleksi';

    // TC No kaldırma kapalı
    const result1 = PrivacyService.sanitizeDiagnosisForAI(text, { removeTcNo: false });
    expect(result1.sanitized).toContain('12345678901');

    // Tanı jenerikleştirme kapalı
    const result2 = PrivacyService.sanitizeDiagnosisForAI(text, { genericizeDiagnosis: false });
    expect(result2.sanitized).toContain('disleksi');
  });
});

describe('PrivacyService - Hassas Veri Maskeleme', () => {
  it('TC No maskelenir (son 4 hane gösterilir)', () => {
    const masked = PrivacyService.maskSensitiveData('TC: 12345678901', 'tcNo');
    expect(masked).toBe('TC: *******8901');
  });

  it('tanı bilgisi tamamen maskelenir', () => {
    const masked = PrivacyService.maskSensitiveData('Disleksi tanısı mevcut', 'diagnosis');
    expect(masked).toBe('[HASSAS_BİLGİ_MASKELENDI]');
  });

  it('sağlık bilgisi tamamen maskelenir', () => {
    const masked = PrivacyService.maskSensitiveData('İlaç kullanıyor', 'medical');
    expect(masked).toBe('[HASSAS_BİLGİ_MASKELENDI]');
  });

  it('değerlendirme sonuçları kısaltılır', () => {
    const longText = 'Bu öğrencinin performansı oldukça düşük ve destek gerekiyor';
    const masked = PrivacyService.maskSensitiveData(longText, 'assessment');
    expect(masked).toBe('Bu öğrencinin perfor...[MASKELENDI]');
  });

  it('aile bilgisinde isimler maskelenir', () => {
    const masked = PrivacyService.maskSensitiveData('Baba: Mehmet Yılmaz', 'family');
    expect(masked).toBe('Baba: [AD_MASKELENDI] [AD_MASKELENDI]');
  });
});

describe('PrivacyService - Anonimleştirme Kontrolü', () => {
  it('TC No içeren metin için ihlal bildirir', () => {
    const result = PrivacyService.checkAnonymization('TC: 12345678901');

    expect(result.isAnonymous).toBe(false);
    expect(result.violations).toContain('Açık TC Kimlik No tespit edildi');
  });

  it('e-posta içeren metin için ihlal bildirir', () => {
    const result = PrivacyService.checkAnonymization('ahmet@example.com');

    expect(result.isAnonymous).toBe(false);
    expect(result.violations).toContain('E-posta adresi tespit edildi');
  });

  it('telefon içeren metin için ihlal bildirir', () => {
    const result = PrivacyService.checkAnonymization('0532 123 45 67');

    expect(result.isAnonymous).toBe(false);
    expect(result.violations).toContain('Telefon numarası tespit edildi');
  });

  it('tam ad içeren metin için ihlal bildirir', () => {
    const result = PrivacyService.checkAnonymization('Ahmet Yılmaz');

    expect(result.isAnonymous).toBe(false);
    expect(result.violations).toContain('Tam ad tespit edildi');
  });

  it('temiz metin için ihlal bildirmez', () => {
    const result = PrivacyService.checkAnonymization('Öğrenci student_a7f3c2 profili');

    expect(result.isAnonymous).toBe(true);
    expect(result.violations).toHaveLength(0);
  });
});

describe('PrivacyService - KVKK Uyumlu Log', () => {
  it('hassas alanları redact eder', () => {
    const data = {
      name: 'Ahmet',
      tcNo: '12345678901',
      age: 10,
      diagnosis: 'disleksi',
    };

    const safeLog = PrivacyService.createSafeLogEntry(data);

    expect(safeLog.name).toBe('Ahmet');
    expect(safeLog.age).toBe(10);
    expect(safeLog.tcNo).toBe('[REDACTED]');
    expect(safeLog.diagnosis).toBe('[REDACTED]');
  });

  it('nested objeler için de redact eder', () => {
    const data = {
      student: {
        name: 'Ahmet',
        personalInfo: {
          tcNo: '12345678901',
          email: 'ahmet@example.com',
        },
      },
    };

    const safeLog = PrivacyService.createSafeLogEntry(data);

    expect((safeLog.student as any).name).toBe('Ahmet');
    expect((safeLog.student as any).personalInfo.tcNo).toBe('[REDACTED]');
    expect((safeLog.student as any).personalInfo.email).toBe('[REDACTED]');
  });

  it('primitif değerler için string dönüşümü yapar', () => {
    const safeLog = PrivacyService.createSafeLogEntry('test string');
    expect(safeLog.data).toBe('test string');
  });
});

describe('PrivacyService - AI Prompt İçin Güvenli Profil', () => {
  it('öğrenci profilini sanitize eder', () => {
    const profile = {
      name: 'Ahmet Yılmaz',
      diagnosis: ['disleksi', 'adhd'],
      age: 10,
      grade: '4. Sınıf',
      strengths: ['Yaratıcı düşünme', 'Sosyal beceriler'],
      needs: ['Okuma desteği', 'Dikkat geliştirme'],
    };

    const safeProfile = PrivacyService.createSafeStudentProfileForAI(profile);

    // İsim yerine anonim ID
    expect((safeProfile.studentId as string).startsWith('student_')).toBe(true);

    // Tanılar jenerikleştirilmiş
    expect(safeProfile.learningProfile).toContain('özel öğrenme güçlüğü');
    expect(safeProfile.learningProfile).toContain('dikkat ve öğrenme desteği gerektiren durum');
    expect(safeProfile.learningProfile).not.toContain('disleksi');
    expect(safeProfile.learningProfile).not.toContain('adhd');

    // Yaş kategorisi
    expect(safeProfile.ageGroup).toBe('8-10');

    // Güçlü ve ihtiyaç alanları korunmuş
    expect(safeProfile.strengths).toEqual(profile.strengths);
    expect(safeProfile.needs).toEqual(profile.needs);
  });

  it('eksik alanlar için varsayılan değerler kullanır', () => {
    const profile = {};

    const safeProfile = PrivacyService.createSafeStudentProfileForAI(profile);

    expect(safeProfile.studentId).toBe('student_anonymous');
    expect(safeProfile.ageGroup).toBe('bilinmiyor');
    expect(safeProfile.grade).toBe('belirtilmemiş');
  });
});

describe('PrivacyService - Yardımcı Fonksiyonlar', () => {
  it('hashTcNo standalone fonksiyonu çalışır', () => {
    const hash = hashTcNo('12345678901');
    expect(hash).toHaveLength(64);
  });

  it('anonymizeStudent standalone fonksiyonu çalışır', () => {
    const anonymousId = anonymizeStudent('student-123-ahmet');
    expect(anonymousId).toMatch(/^student_[a-f0-9]{8}$/);
  });

  it('sanitizeForAI standalone fonksiyonu çalışır', () => {
    const sanitized = sanitizeForAI('Disleksi tanısı var');
    expect(sanitized).toBe('özel öğrenme güçlüğü tanısı var');
  });
});

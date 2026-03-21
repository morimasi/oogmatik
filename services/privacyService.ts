/**
 * OOGMATIK - Privacy & Data Protection Service
 * KVKK Madde 6 uyumlu öğrenci veri gizliliği servisi
 *
 * Bu servis şunları sağlar:
 * - TC Kimlik No hash'leme (SHA-256 + salt)
 * - Öğrenci ID anonimleştirme (AI çağrılarında kullanım için)
 * - Tanı bilgisi sanitizasyonu (AI'ya gönderilmeden önce)
 * - Hassas veri maskeleme
 *
 * KVKK Uyumluluk:
 * - Madde 6: Özel nitelikli kişisel verilerin işlenmesi (sağlık, tanı)
 * - Madde 12: Verilerin güvenliği
 */

import { createHash } from 'crypto';
import { ValidationError } from '../utils/AppError.js';

/**
 * Hassas veri kategorileri
 */
export type SensitiveDataCategory =
  | 'tcNo'           // TC Kimlik No
  | 'diagnosis'      // Tanı bilgisi (disleksi, DEHB, vb.)
  | 'medical'        // Sağlık bilgisi
  | 'behavioral'     // Davranışsal notlar
  | 'assessment'     // Değerlendirme sonuçları
  | 'family';        // Aile bilgisi

/**
 * Hash'leme sonucu
 */
export interface HashResult {
  hash: string;           // SHA-256 hash
  lastFour?: string;      // Son 4 hane (gösterim için)
  category: SensitiveDataCategory;
  timestamp: string;      // ISO 8601
}

/**
 * Anonimleştirme sonucu
 */
export interface AnonymizationResult {
  anonymousId: string;    // Anonim ID (örn: student_a7f3c2)
  originalIdHash: string; // Orijinal ID'nin hash'i (geri dönüş için)
  timestamp: string;
}

/**
 * Tanı bilgisi sanitizasyon sonucu
 */
export interface SanitizationResult {
  sanitized: string;      // Sanitize edilmiş metin
  removed: string[];      // Kaldırılan hassas bilgiler
  safe: boolean;          // AI'ya gönderilebilir mi?
}

/**
 * Privacy Service - KVKK uyumlu veri gizliliği
 */
export class PrivacyService {
  /**
   * Environment değişkenlerinden salt değerini al
   * Production'da mutlaka .env'de tanımlı olmalı!
   */
  private static readonly TC_HASH_SALT = process.env.TC_HASH_SALT || 'oogmatik-default-salt-CHANGE-IN-PRODUCTION';
  private static readonly STUDENT_ID_SALT = process.env.STUDENT_ID_SALT || 'oogmatik-student-salt-CHANGE-IN-PRODUCTION';

  /**
   * Hassas bilgi pattern'leri (AI'ya gönderilmeden temizlenecek)
   */
  private static readonly SENSITIVE_PATTERNS = {
    // TC Kimlik No (11 hane)
    tcNo: /\b\d{11}\b/g,

    // E-posta adresleri
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

    // Telefon numaraları (Türkiye formatları)
    phone: /\b(\+90|0)?[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{2}[\s\-.]?\d{2}\b/g,

    // Tam adres bilgileri (mahalle, sokak, cadde içerenler)
    address: /\b(mahalle|sokak|cadde|bulvar|apt\.|no:|kat:)\b/gi,

    // Belirgin klinik terimler (değiştirmeden önce etiketle)
    clinicalTerms: /\b(disleksi|diskalkuli|disgrafya|adhd|add|öğrenme güçlüğü|zihinsel yetersizlik)\b/gi,
  };

  /**
   * 1. TC Kimlik No Hash'leme
   *
   * @param tcNo - TC Kimlik No (11 hane, numerik)
   * @returns HashResult - Hash + son 4 hane
   *
   * @example
   * const result = PrivacyService.hashTcNo('12345678901');
   * // result.hash: 'a7f3c2...'
   * // result.lastFour: '8901'
   */
  static hashTcNo(tcNo: string): HashResult {
    // Validation
    if (!tcNo || typeof tcNo !== 'string') {
      throw new ValidationError('TC Kimlik No zorunludur.', { field: 'tcNo' });
    }

    // 11 hane kontrolü
    const cleaned = tcNo.replace(/\D/g, ''); // Sadece rakamları al
    if (cleaned.length !== 11) {
      throw new ValidationError('TC Kimlik No 11 hane olmalıdır.', {
        field: 'tcNo',
        received: cleaned.length
      });
    }

    // SHA-256 + salt ile hash'le
    const hash = createHash('sha256')
      .update(cleaned + this.TC_HASH_SALT)
      .digest('hex');

    return {
      hash,
      lastFour: cleaned.slice(-4),
      category: 'tcNo',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 2. TC Kimlik No Doğrulama (Hash ile)
   *
   * @param tcNo - Doğrulanacak TC Kimlik No
   * @param storedHash - Veritabanında saklanan hash
   * @returns boolean - Hash eşleşiyor mu?
   */
  static verifyTcNo(tcNo: string, storedHash: string): boolean {
    try {
      const { hash } = this.hashTcNo(tcNo);
      return hash === storedHash;
    } catch {
      return false;
    }
  }

  /**
   * 3. Öğrenci ID Anonimleştirme (AI çağrıları için)
   *
   * AI'ya öğrenci verileri gönderirken gerçek ID yerine anonim ID kullanılır.
   * Geri dönüşüm için originalIdHash saklanır.
   *
   * @param studentId - Orijinal öğrenci ID
   * @returns AnonymizationResult
   *
   * @example
   * const anon = PrivacyService.anonymizeStudentId('student-123-ahmet');
   * // anon.anonymousId: 'student_a7f3c2'
   */
  static anonymizeStudentId(studentId: string): AnonymizationResult {
    if (!studentId || typeof studentId !== 'string') {
      throw new ValidationError('Öğrenci ID zorunludur.', { field: 'studentId' });
    }

    // Orijinal ID'yi hash'le (geri dönüş için saklanabilir)
    const originalIdHash = createHash('sha256')
      .update(studentId + this.STUDENT_ID_SALT)
      .digest('hex');

    // Anonim ID oluştur (ilk 6 karakter + timestamp'in son 2 karakteri)
    const shortHash = originalIdHash.slice(0, 6);
    const timestamp = Date.now().toString().slice(-2);
    const anonymousId = `student_${shortHash}${timestamp}`;

    return {
      anonymousId,
      originalIdHash,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 4. Tanı Bilgisi Sanitizasyonu (AI'ya gönderilmeden önce)
   *
   * Öğrenci verileri AI'ya gönderilirken tanı bilgileri jenerik terimlerle değiştirilir.
   * Örnek: "Ahmet'in disleksi tanısı var" → "Öğrencinin özel öğrenme güçlüğü var"
   *
   * @param text - Sanitize edilecek metin
   * @param options - Opsiyonel ayarlar
   * @returns SanitizationResult
   */
  static sanitizeDiagnosisForAI(
    text: string,
    options: {
      removeTcNo?: boolean;       // TC No'ları kaldır (default: true)
      removeContact?: boolean;    // İletişim bilgilerini kaldır (default: true)
      genericizeDiagnosis?: boolean; // Tanıları jenerikleştir (default: true)
    } = {}
  ): SanitizationResult {
    const {
      removeTcNo = true,
      removeContact = true,
      genericizeDiagnosis = true,
    } = options;

    if (!text || typeof text !== 'string') {
      return {
        sanitized: '',
        removed: [],
        safe: true,
      };
    }

    let sanitized = text;
    const removed: string[] = [];

    // 1. TC Kimlik No'ları kaldır
    if (removeTcNo && this.SENSITIVE_PATTERNS.tcNo.test(sanitized)) {
      sanitized = sanitized.replace(this.SENSITIVE_PATTERNS.tcNo, '[TC_NO_REDACTED]');
      removed.push('TC Kimlik No');
    }

    // 2. E-posta adreslerini kaldır
    if (removeContact && this.SENSITIVE_PATTERNS.email.test(sanitized)) {
      sanitized = sanitized.replace(this.SENSITIVE_PATTERNS.email, '[EMAIL_REDACTED]');
      removed.push('E-posta');
    }

    // 3. Telefon numaralarını kaldır
    if (removeContact && this.SENSITIVE_PATTERNS.phone.test(sanitized)) {
      sanitized = sanitized.replace(this.SENSITIVE_PATTERNS.phone, '[PHONE_REDACTED]');
      removed.push('Telefon');
    }

    // 4. Adres bilgilerini kaldır
    if (removeContact && this.SENSITIVE_PATTERNS.address.test(sanitized)) {
      sanitized = sanitized.replace(this.SENSITIVE_PATTERNS.address, '[ADDRESS_INFO]');
      removed.push('Adres bilgisi');
    }

    // 5. Klinik terimler → jenerik terimler
    if (genericizeDiagnosis) {
      const clinicalMap: Record<string, string> = {
        'disleksi': 'özel öğrenme güçlüğü',
        'diskalkuli': 'özel öğrenme güçlüğü',
        'disgrafya': 'özel öğrenme güçlüğü',
        'adhd': 'dikkat ve öğrenme desteği gerektiren durum',
        'add': 'dikkat ve öğrenme desteği gerektiren durum',
        'öğrenme güçlüğü': 'özel öğrenme desteği gerektiren durum',
        'zihinsel yetersizlik': 'bireysel öğrenme profili',
      };

      Object.entries(clinicalMap).forEach(([term, replacement]) => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (regex.test(sanitized)) {
          sanitized = sanitized.replace(regex, replacement);
          removed.push(`Klinik terim: ${term}`);
        }
      });
    }

    // Güvenlik kontrolü
    const safe = removed.length === 0 || genericizeDiagnosis;

    return {
      sanitized,
      removed,
      safe,
    };
  }

  /**
   * 5. Genel Hassas Veri Maskeleme
   *
   * Herhangi bir metindeki hassas verileri maskeler (loglar, raporlar için)
   *
   * @param text - Maskelenecek metin
   * @param category - Veri kategorisi
   * @returns Maskelenmiş metin
   *
   * @example
   * PrivacyService.maskSensitiveData('TC: 12345678901', 'tcNo')
   * // 'TC: *******8901'
   */
  static maskSensitiveData(text: string, category: SensitiveDataCategory): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    switch (category) {
      case 'tcNo':
        // TC No: ilk 7 hane maskele, son 4 göster
        return text.replace(/\b\d{11}\b/g, (match) => {
          return '*'.repeat(7) + match.slice(-4);
        });

      case 'diagnosis':
      case 'medical':
      case 'behavioral':
        // Tanı/sağlık bilgisi: tamamen maskele
        return '[HASSAS_BİLGİ_MASKELENDI]';

      case 'assessment':
        // Değerlendirme: sadece ilk 20 karakter göster
        return text.length > 20 ? text.slice(0, 20) + '...[MASKELENDI]' : text;

      case 'family':
        // Aile bilgisi: isimleri maskele
        return text.replace(/\b[A-ZÇĞIÖŞÜ][a-zçğıöşü]+\b/g, '[AD_MASKELENDI]');

      default:
        return text;
    }
  }

  /**
   * 6. Veri Anonimleştirme Kontrolü
   *
   * Bir metnin anonimleştirilip anonimleştirilmediğini kontrol eder
   *
   * @param text - Kontrol edilecek metin
   * @returns { isAnonymous: boolean, violations: string[] }
   */
  static checkAnonymization(text: string): { isAnonymous: boolean; violations: string[] } {
    if (!text || typeof text !== 'string') {
      return { isAnonymous: true, violations: [] };
    }

    const violations: string[] = [];

    // TC No kontrolü
    if (this.SENSITIVE_PATTERNS.tcNo.test(text)) {
      violations.push('Açık TC Kimlik No tespit edildi');
    }

    // E-posta kontrolü
    if (this.SENSITIVE_PATTERNS.email.test(text)) {
      violations.push('E-posta adresi tespit edildi');
    }

    // Telefon kontrolü
    if (this.SENSITIVE_PATTERNS.phone.test(text)) {
      violations.push('Telefon numarası tespit edildi');
    }

    // Tam ad kontrolü (büyük harfle başlayan 2+ kelime)
    const fullNamePattern = /\b[A-ZÇĞIÖŞÜ][a-zçğıöşü]+\s+[A-ZÇĞIÖŞÜ][a-zçğıöşü]+\b/g;
    if (fullNamePattern.test(text)) {
      violations.push('Tam ad tespit edildi');
    }

    return {
      isAnonymous: violations.length === 0,
      violations,
    };
  }

  /**
   * 7. KVKK Uyumlu Log Formatı
   *
   * Loglarda hassas veri bulunmamasını garanti eder
   *
   * @param data - Loglanacak veri (unknown)
   * @returns KVKK uyumlu log objesi
   */
  static createSafeLogEntry(data: unknown): Record<string, unknown> {
    if (typeof data !== 'object' || data === null) {
      return { data: String(data) };
    }

    const safeData: Record<string, unknown> = {};

    // Hassas alanları filtrele
    const sensitiveFields = [
      'tcNo', 'tcNoHash', 'tcNoLastFour',
      'password', 'passwordHash',
      'diagnosis', 'diagnosisInfo',
      'medicalInfo', 'medications',
      'behavioralNotes',
      'email', 'phone', 'address',
      'parentPhone', 'parentEmail',
    ];

    Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        safeData[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        safeData[key] = this.createSafeLogEntry(value);
      } else {
        safeData[key] = value;
      }
    });

    return safeData;
  }

  /**
   * 8. AI Prompt İçin Güvenli Öğrenci Profili
   *
   * AI'ya gönderilecek öğrenci profilini sanitize eder
   *
   * @param profile - Orijinal öğrenci profili
   * @returns Sanitize edilmiş profil
   */
  static createSafeStudentProfileForAI(profile: {
    name?: string;
    diagnosis?: string[];
    age?: number;
    grade?: string;
    strengths?: string[];
    needs?: string[];
    [key: string]: unknown;
  }): Record<string, unknown> {
    // Öğrenci ID'sini anonimleştir
    const anonymousId = profile.name
      ? this.anonymizeStudentId(profile.name).anonymousId
      : 'student_anonymous';

    // Tanıları jenerikleştir
    const genericDiagnosis = profile.diagnosis?.map(d => {
      if (/disleksi|diskalkuli|disgrafya/i.test(d)) {
        return 'özel öğrenme güçlüğü';
      }
      if (/adhd|add/i.test(d)) {
        return 'dikkat ve öğrenme desteği gerektiren durum';
      }
      return 'bireysel öğrenme profili';
    }) || [];

    return {
      studentId: anonymousId,
      learningProfile: [...new Set(genericDiagnosis)], // Tekrarları kaldır
      ageGroup: profile.age ? this.categorizeAge(profile.age) : 'bilinmiyor',
      grade: profile.grade || 'belirtilmemiş',
      strengths: profile.strengths || [],
      needs: profile.needs || [],
      // Diğer hassas alanları ekleme
    };
  }

  /**
   * Yaşı kategoriye dönüştür (AgeGroup enum'una uygun)
   */
  private static categorizeAge(age: number): string {
    if (age >= 5 && age <= 7) return '5-7';
    if (age >= 8 && age <= 10) return '8-10';
    if (age >= 11 && age <= 13) return '11-13';
    if (age >= 14) return '14+';
    return 'bilinmiyor';
  }
}

/**
 * Export yardımcı fonksiyonlar (standalone kullanım için)
 */

/**
 * Hızlı TC No hash'leme
 */
export const hashTcNo = (tcNo: string): string => {
  return PrivacyService.hashTcNo(tcNo).hash;
};

/**
 * Hızlı öğrenci ID anonimleştirme
 */
export const anonymizeStudent = (studentId: string): string => {
  return PrivacyService.anonymizeStudentId(studentId).anonymousId;
};

/**
 * Hızlı tanı bilgisi sanitizasyonu
 */
export const sanitizeForAI = (text: string): string => {
  return PrivacyService.sanitizeDiagnosisForAI(text).sanitized;
};

/**
 * Default export
 */
export default PrivacyService;

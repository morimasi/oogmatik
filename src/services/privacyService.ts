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

  private static readonly SHA256_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ] as const;

  private static rotateRight(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  private static sha256(input: string): string {
    const bytes = new TextEncoder().encode(input);
    const bitLength = bytes.length * 8;
    const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLength);
    padded.set(bytes);
    padded[bytes.length] = 0x80;

    const view = new DataView(padded.buffer);
    view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
    view.setUint32(paddedLength - 4, bitLength >>> 0, false);

    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    const words = new Uint32Array(64);

    for (let chunkOffset = 0; chunkOffset < paddedLength; chunkOffset += 64) {
      for (let index = 0; index < 16; index += 1) {
        words[index] = view.getUint32(chunkOffset + index * 4, false);
      }

      for (let index = 16; index < 64; index += 1) {
        const s0 = this.rotateRight(words[index - 15], 7)
          ^ this.rotateRight(words[index - 15], 18)
          ^ (words[index - 15] >>> 3);
        const s1 = this.rotateRight(words[index - 2], 17)
          ^ this.rotateRight(words[index - 2], 19)
          ^ (words[index - 2] >>> 10);
        words[index] = (((words[index - 16] + s0) >>> 0) + ((words[index - 7] + s1) >>> 0)) >>> 0;
      }

      let a = h0;
      let b = h1;
      let c = h2;
      let d = h3;
      let e = h4;
      let f = h5;
      let g = h6;
      let h = h7;

      for (let index = 0; index < 64; index += 1) {
        const sigma1 = this.rotateRight(e, 6) ^ this.rotateRight(e, 11) ^ this.rotateRight(e, 25);
        const choice = (e & f) ^ (~e & g);
        const temp1 = (((((h + sigma1) >>> 0) + choice) >>> 0) + ((this.SHA256_K[index] + words[index]) >>> 0)) >>> 0;
        const sigma0 = this.rotateRight(a, 2) ^ this.rotateRight(a, 13) ^ this.rotateRight(a, 22);
        const majority = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (sigma0 + majority) >>> 0;

        h = g;
        g = f;
        f = e;
        e = (d + temp1) >>> 0;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) >>> 0;
      }

      h0 = (h0 + a) >>> 0;
      h1 = (h1 + b) >>> 0;
      h2 = (h2 + c) >>> 0;
      h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0;
      h5 = (h5 + f) >>> 0;
      h6 = (h6 + g) >>> 0;
      h7 = (h7 + h) >>> 0;
    }

    return [h0, h1, h2, h3, h4, h5, h6, h7]
      .map((value) => value.toString(16).padStart(8, '0'))
      .join('');
  }

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

    const hash = this.sha256(cleaned + this.TC_HASH_SALT);

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

    const originalIdHash = this.sha256(studentId + this.STUDENT_ID_SALT);

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
        // Aile bilgisi: isimleri maskele (5+ karakter olan isimleri)
        // "Baba:", "Anne:" gibi aile rollerini korur
        return text.replace(/\b[A-ZÇĞIÖŞÜ][a-zçğıöşü]{4,}\b/g, '[AD_MASKELENDI]');

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

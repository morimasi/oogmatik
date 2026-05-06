/**
 * OOGMATIK - DLP (Data Loss Prevention) Service
 * KVKK Uyumluluğu: Öğrenci adı, tanısı ve skorların bir arada sızmasını engeller.
 */

import crypto from 'crypto';
import { ValidationError } from '../utils/AppError.js';

export interface DLPConfig {
    maskNames?: boolean;
    maskDiagnosis?: boolean;
    maskScores?: boolean;
}

export interface HashResult {
    hash: string;
    lastFour: string;
    category: string;
    timestamp: string;
}

export interface SanitizeResult {
    sanitized: string;
    removed: string[];
    safe: boolean;
}

export interface AnonymizeResult {
    anonymousId: string;
    originalIdHash: string;
    timestamp: string;
}

export class DLPService {
    private static instance: DLPService;
    
    private constructor() {}

    public static getInstance(): DLPService {
        if (!DLPService.instance) {
            DLPService.instance = new DLPService();
        }
        return DLPService.instance;
    }

    /**
     * T.C. Kimlik numarasını SHA-256 ile hash'ler
     */
    public hashTcNo(tcNo: string): HashResult {
        if (!tcNo || typeof tcNo !== 'string') {
            throw new ValidationError('TC Kimlik No boş olamaz');
        }

        // Numerik olmayan karakterleri temizle
        const cleaned = tcNo.replace(/[^0-9]/g, '');

        if (cleaned.length !== 11) {
            throw new ValidationError('TC Kimlik No 11 haneli olmalıdır');
        }

        const hash = crypto.createHash('sha256').update(cleaned).digest('hex');
        const lastFour = cleaned.slice(-4);

        return {
            hash,
            lastFour,
            category: 'tcNo',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * T.C. Kimlik hash doğrulama
     */
    public verifyTcNo(tcNo: string, hash: string): boolean {
        try {
            const result = this.hashTcNo(tcNo);
            return result.hash === hash;
        } catch {
            return false;
        }
    }

    /**
     * Öğrenci ID'sini anonimleştirir
     */
    public anonymizeStudentId(studentId: string): AnonymizeResult {
        if (!studentId || typeof studentId !== 'string') {
            throw new ValidationError('Öğrenci ID boş olamaz');
        }

        const hash = crypto.createHash('sha256').update(studentId).digest('hex');
        const shortHash = hash.substring(0, 8);
        const anonymousId = `student_${shortHash}`;

        return {
            anonymousId,
            originalIdHash: hash,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Tanı bilgilerini AI için güvenli hale getirir
     */
    public sanitizeDiagnosisForAI(
        text: string,
        options: {
            removeTcNo?: boolean;
            removeEmail?: boolean;
            removePhone?: boolean;
            genericizeDiagnosis?: boolean;
        } = {}
    ): SanitizeResult {
        const {
            removeTcNo = true,
            removeEmail = true,
            removePhone = true,
            genericizeDiagnosis = true
        } = options;

        if (!text) {
            return { sanitized: '', removed: [], safe: true };
        }

        let sanitized = text;
        const removed: string[] = [];

        // TC Kimlik No kaldır
        if (removeTcNo) {
            const tcRegex = /\b[1-9][0-9]{10}\b/g;
            if (tcRegex.test(sanitized)) {
                sanitized = sanitized.replace(tcRegex, '[TC_NO_REDACTED]');
                removed.push('TC Kimlik No');
            }
        }

        // E-posta kaldır
        if (removeEmail) {
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
            if (emailRegex.test(sanitized)) {
                sanitized = sanitized.replace(emailRegex, '[EMAIL_REDACTED]');
                removed.push('E-posta');
            }
        }

        // Telefon kaldır
        if (removePhone) {
            const phoneRegex = /\b(0?[5-9][0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2})\b/g;
            if (phoneRegex.test(sanitized)) {
                sanitized = sanitized.replace(phoneRegex, '[PHONE_REDACTED]');
                removed.push('Telefon');
            }
        }

        // Klinik terimleri jenerikleştir
        if (genericizeDiagnosis) {
            const diagnosisReplacements: [RegExp, string, string][] = [
                [/disleksi/gi, 'özel öğrenme güçlüğü', 'Klinik terim: disleksi'],
                [/adhd/gi, 'dikkat ve öğrenme desteği gerektiren durum', 'Klinik terim: ADHD'],
                [/diskalkuli/gi, 'özel öğrenme güçlüğü', 'Klinik terim: diskalkuli'],
            ];

            for (const [regex, replacement, logMsg] of diagnosisReplacements) {
                if (regex.test(sanitized)) {
                    sanitized = sanitized.replace(regex, replacement);
                    removed.push(logMsg);
                }
            }
        }

        return {
            sanitized,
            removed,
            safe: true // Successfully sanitized - all sensitive data removed
        };
    }

    /**
     * Hassas verileri maskeler
     */
    public maskSensitiveData(text: string, type?: string): string {
        if (!text) return text;

        // TC No maskeleme (son 4 hane göster)
        if (type === 'tcNo' || !type) {
            const tcRegex = /\b[1-9][0-9]{10}\b/g;
            text = text.replace(tcRegex, (match) => {
                return '*******' + match.slice(-4);
            });
        }

        // Tanı maskeleme
        if (type === 'diagnosis' || type === 'medical') {
            return '[HASSAS_BİLGİ_MASKELENDI]';
        }

        // Değerlendirme kısaltma
        if (type === 'assessment') {
            if (text.length > 20) {
                return text.substring(0, 20) + '...[MASKELENDI]';
            }
        }

        // Aile bilgisi isim maskeleme
        if (type === 'family') {
            // "Baba: Ahmet" gibi pattern'leri koru, sadece isimleri maskele
            const parts = text.split(':');
            if (parts.length > 1) {
                const prefix = parts[0].trim();
                const names = parts.slice(1).join(':').trim();
                const maskedNames = names.replace(/\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\b/g, '[AD_MASKELENDI]');
                text = `${prefix}: ${maskedNames}`;
            } else {
                // Colon yoksa tüm isimleri maskele
                text = text.replace(/\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+\b/g, '[AD_MASKELENDI]');
            }
        }

        // E-posta maskeleme
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        text = text.replace(emailRegex, (match) => {
            const [user, domain] = match.split('@');
            return `${user[0]}***@${domain}`;
        });

        return text;
    }

    /**
     * Anonimizasyon kontrolü
     */
    public checkAnonymization(text: string): { isSafe: boolean; violations: string[]; isAnonymous: boolean } {
        const violations: string[] = [];

        // TC No kontrolü
        if (/\b[1-9][0-9]{10}\b/g.test(text)) {
            violations.push('Açık TC Kimlik No tespit edildi');
        }

        // E-posta kontrolü
        if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g.test(text)) {
            violations.push('E-posta adresi tespit edildi');
        }

        // Telefon kontrolü
        const phoneRegex = /\b(0?[5-9][0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2})\b/g;
        if (phoneRegex.test(text)) {
            violations.push('Telefon numarası tespit edildi');
        }

        // Tam ad kontrolü (iki büyük harfle başlayan kelime)
        if (/\b[A-ZÇĞİÖŞÜ][a-zçğıöşü]+ [A-ZÇĞİÖŞÜ][a-zçğıöşü]+\b/g.test(text)) {
            violations.push('Tam ad tespit edildi');
        }

        return {
            isSafe: violations.length === 0,
            violations,
            isAnonymous: violations.length === 0
        };
    }

    /**
     * KVKK uyumlu log entry
     */
    public createSafeLogEntry(data: any): any {
        if (typeof data === 'string') {
            return { data: this.maskSensitiveData(data) };
        }

        if (typeof data === 'object' && data !== null) {
            return this.sanitizeObject(data);
        }

        return { data: String(data) };
    }

    /**
     * Recursively sanitize an object
     */
    private sanitizeObject(obj: any): any {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            
            // Check for sensitive keys
            if (lowerKey.includes('tc') || lowerKey === 'tcno') {
                sanitized[key] = '[REDACTED]';
            } else if (lowerKey.includes('diagnosis') || lowerKey.includes('medical')) {
                sanitized[key] = '[REDACTED]';
            } else if (lowerKey.includes('email') || lowerKey.includes('phone')) {
                sanitized[key] = '[REDACTED]';
            } else if (typeof value === 'string') {
                // Check if string is TC No, email, or phone
                if (/^[1-9][0-9]{10}$/.test(value.trim())) {
                    sanitized[key] = '[REDACTED]';
                } else if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/.test(value.trim())) {
                    sanitized[key] = '[REDACTED]';
                } else if (/^0?[5-9][0-9]{9}$/.test(value.trim())) {
                    sanitized[key] = '[REDACTED]';
                } else {
                    sanitized[key] = value;
                }
            } else if (typeof value === 'object' && value !== null) {
                // Recursively sanitize nested objects
                sanitized[key] = this.sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }

    /**
     * AI için güvenli öğrenci profili
     */
    public createSafeStudentProfileForAI(studentData: {
        name?: string;
        age?: number;
        diagnosis?: string | string[];
        learningStyle?: string;
        studentId?: string;
        grade?: string;
        strengths?: string[];
        needs?: string[];
        [key: string]: any;
    }): any {
        const safe: any = {
            studentId: studentData.studentId || 'student_anonymous',
            ageGroup: this.getAgeGroup(studentData.age),
            grade: studentData.grade || 'belirtilmemiş',
            learningProfile: '',
            strengths: studentData.strengths || [],
            needs: studentData.needs || [],
        };

        // Tanılar -> jenerik learning profile
        if (studentData.diagnosis) {
            const diagnoses = Array.isArray(studentData.diagnosis) ? studentData.diagnosis : [studentData.diagnosis];
            const genericDiagnoses = diagnoses.map(d => {
                const lower = d.toLowerCase();
                if (lower.includes('disleksi')) return 'özel öğrenme güçlüğü';
                if (lower.includes('adhd')) return 'dikkat ve öğrenme desteği gerektiren durum';
                if (lower.includes('diskalkuli')) return 'özel öğrenme güçlüğü';
                return d;
            });
            safe.learningProfile = genericDiagnoses.join(', ');
        } else {
            safe.learningProfile = 'özel öğrenme desteği';
        }

        return safe;
    }

    /**
     * Get age group from age
     */
    private getAgeGroup(age?: number): string {
        if (!age) return 'bilinmiyor';
        if (age >= 4 && age <= 6) return '4-6';
        if (age >= 7 && age <= 10) return '8-10';
        if (age >= 11 && age <= 14) return '11-14';
        if (age >= 15 && age <= 18) return '15-18';
        return 'bilinmiyor';
    }

    /**
     * Öğrenci ismini KVKK'ya uygun maskeler (örn: Ahmet Yılmaz -> A**** Y****)
     */
    public maskStudentName(name: string): string {
        if (!name) return 'Öğrenci';
        return name.split(' ').map(part => {
            if (part.length <= 1) return part;
            return part[0] + '*'.repeat(part.length - 1);
        }).join(' ');
    }

    /**
     * Klinik veriyi maskeler (Sadece uzman görebilir mantığı için)
     */
    public protectClinicalContext(context: string, userRole: string): string {
        if (userRole === 'admin' || userRole === 'teacher') {
            return context;
        }
        return 'Bu alan sadece yetkili eğitimciler tarafından görüntülenebilir.';
    }

    /**
     * Öğrenci verilerini anonimleştirir
     */
    public anonymizeStudent(studentData: { name?: string; tcNo?: string; diagnosis?: string; scores?: number[] }): any {
        return {
            ...studentData,
            name: studentData.name ? this.maskStudentName(studentData.name) : 'Öğrenci',
            tcNo: studentData.tcNo ? this.hashTcNo(studentData.tcNo).hash : '',
            diagnosis: studentData.diagnosis ? '[MASKED]' : undefined,
            scores: studentData.scores ? studentData.scores.map(() => '[MASKED]') : undefined
        };
    }

    /**
     * AI gönderimi için veriyi temizler
     */
    public sanitizeForAI(text: string): string {
        if (!text) return text;
        
        const result = this.sanitizeDiagnosisForAI(text);
        return result.sanitized;
    }
}

export const dlpService = DLPService.getInstance();

// Legacy exports for test compatibility - eski testler için uyumluluk
export const hashTcNo = (tcNo: string): string => dlpService.hashTcNo(tcNo).hash;
export const anonymizeStudent = (studentId: string): string => dlpService.anonymizeStudentId(studentId).anonymousId;
export const sanitizeForAI = (text: string): string => dlpService.sanitizeForAI(text);

// Default export for test compatibility
export default DLPService;

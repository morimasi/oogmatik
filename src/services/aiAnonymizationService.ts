/**
 * OOGMATIK — AI Anonymization Service (Sprint 4)
 * @description KVKK uyumlu veri anonimleştirme pipeline'ı
 *
 * [KLINIK DIREKTIF - Dr. Ahmet Kaya]
 * Bu servis, öğrenci verilerinin AI işleme (Gemini/Claude) gönderilmeden önce
 * KVKK Madde 6 kapsamında anonimleştirilmesini sağlar.
 *
 * YASAL DAYANAK:
 * - KVKK Madde 6: Özel nitelikli kişisel verilerin işlenmesi
 * - KVKK Madde 7: Kişisel verilerin silinmesi, yok edilmesi veya anonim hale getirilmesi
 * - KVKK Rehber: Anonimleştirme ve Pseudonimleştirme
 *
 * KRİTİK: Bu fonksiyonlar AI'ya gönderilen her öğrenci verisi için ZORUNLU
 */

import type { AdvancedStudent, StudentPrivacySettings } from '../types/student-advanced';
import { AppError } from '../utils/AppError';

// ═══════════════════════════════════════════════════════════════════════════════
// ANONYMIZED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AI işleme için anonimleştirilmiş öğrenci profili
 * @description Hiçbir kişisel tanımlayıcı bilgi içermez
 */
export interface AnonymizedStudentProfile {
    anonymousId: string; // UUID (öğrenci ID'si ile bağlantısız)
    ageGroup: '5-7' | '8-10' | '11-13' | '14+'; // Yaş grubu (kesin yaş değil)
    gradeRange: 'İlkokul' | 'Ortaokul' | 'Lise'; // Sınıf aralığı (kesin sınıf değil)
    diagnosisProfile: string[]; // Genel tanı kategorileri (detaysız)
    performanceLevel: 'Düşük' | 'Orta' | 'Yüksek'; // Akademik seviye bandı
    learningStyleCategory: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'; // Öğrenme stili
    supportNeeds: string[]; // Genel destek ihtiyaçları (kişiselleştirilmemiş)
    recentTrends: {
        attendance: 'improving' | 'declining' | 'stable';
        academicProgress: 'improving' | 'declining' | 'stable';
        behaviorScore: 'improving' | 'declining' | 'stable';
    };
}

/**
 * Anonimleştirme raporu (audit trail için)
 */
export interface AnonymizationReport {
    originalStudentId: string;
    anonymizedId: string;
    timestamp: string;
    excludedFields: string[]; // Hangi alanlar filtrelendi
    permissionsApplied: string[]; // Hangi izin kuralları uygulandı
    retentionNotice?: string; // Anonimleştirilmiş veri saklama süresi
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANONYMIZATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Öğrenci verisini anonimleştir
 * @description KVKK Madde 6 uyumlu anonimleştirme
 *
 * ASLA GÖNDERİLMEYEN ALANLAR:
 * - name, TC No, address, phone, email
 * - Aile bilgileri (parentName, parentPhone, etc.)
 * - Okul bilgileri (schoolName, teacherName)
 * - Sağlık detayları (medications, allergies)
 * - Finansal bilgiler (transactions, balance)
 * - Profil fotoğrafı URL'leri
 */
export const anonymizeStudent = (
    student: AdvancedStudent,
    permissions?: StudentPrivacySettings
): AnonymizedStudentProfile => {
    // Gizlilik ayarlarını kontrol et
    const excludedDataTypes =
        permissions?.aiProcessing.excludedDataTypes || [
            'diagnosis',
            'medical',
            'family',
            'behavioral',
            'financial',
            'personal_identifiers',
        ];

    // Anonim ID üret (öğrenci ID'si ile ilişkilendirilemez)
    const anonymousId = crypto.randomUUID();

    // Yaş grubu (kesin yaş değil)
    const ageGroup = getAgeGroup(student.age);

    // Sınıf aralığı (kesin sınıf değil)
    const gradeRange = getGradeRange(student.grade);

    // Tanı profili anonimleştir
    const diagnosisProfile = excludedDataTypes.includes('diagnosis')
        ? ['Özel öğrenme ihtiyacı'] // Genel ifade
        : anonymizeDiagnosis(student.healthInfo?.diagnosis || student.diagnosis || []);

    // Akademik performans seviyesi
    const performanceLevel = calculatePerformanceLevel(
        student.academic?.metrics?.gpa || 0,
        excludedDataTypes.includes('behavioral')
    );

    // Öğrenme stili kategorisi
    const learningStyleCategory = mapLearningStyle(student.learningStyle);

    // Destek ihtiyaçları (genel)
    const supportNeeds = generateSupportNeeds(
        diagnosisProfile,
        performanceLevel,
        student.iep?.needs || []
    );

    // Trendler (sayısal değerler değil, yönler)
    const recentTrends = {
        attendance: student.attendance?.stats?.trend || 'stable',
        academicProgress: student.academic?.metrics?.recentTrend || 'flat',
        behaviorScore: determineBehaviorTrend(student.behavior?.score || 0),
    };

    return {
        anonymousId,
        ageGroup,
        gradeRange,
        diagnosisProfile,
        performanceLevel,
        learningStyleCategory,
        supportNeeds,
        recentTrends: {
            attendance: recentTrends.attendance,
            academicProgress:
                recentTrends.academicProgress === 'up'
                    ? 'improving'
                    : recentTrends.academicProgress === 'down'
                      ? 'declining'
                      : 'stable',
            behaviorScore: recentTrends.behaviorScore,
        },
    };
};

/**
 * Yaş grubunu belirle
 */
const getAgeGroup = (age: number): '5-7' | '8-10' | '11-13' | '14+' => {
    if (age <= 7) return '5-7';
    if (age <= 10) return '8-10';
    if (age <= 13) return '11-13';
    return '14+';
};

/**
 * Sınıf aralığını belirle
 */
const getGradeRange = (grade: string): 'İlkokul' | 'Ortaokul' | 'Lise' => {
    const gradeNum = parseInt(grade, 10);
    if (isNaN(gradeNum)) return 'İlkokul';

    if (gradeNum <= 4) return 'İlkokul';
    if (gradeNum <= 8) return 'Ortaokul';
    return 'Lise';
};

/**
 * Tanı bilgilerini anonimleştir
 */
const anonymizeDiagnosis = (diagnosis: string[]): string[] => {
    const anonymizedCategories: string[] = [];

    diagnosis.forEach((d) => {
        const lower = d.toLowerCase();

        // Geniş kategorilere grupla
        if (lower.includes('disleksi') || lower.includes('okuma')) {
            anonymizedCategories.push('Okuma desteği');
        } else if (lower.includes('diskalkuli') || lower.includes('matematik')) {
            anonymizedCategories.push('Matematik desteği');
        } else if (lower.includes('dehb') || lower.includes('dikkat')) {
            anonymizedCategories.push('Dikkat desteği');
        } else if (lower.includes('disgrafi') || lower.includes('yazma')) {
            anonymizedCategories.push('Yazma desteği');
        } else if (lower.includes('otizm') || lower.includes('sosyal')) {
            anonymizedCategories.push('Sosyal beceri desteği');
        } else {
            // Diğer tanılar için genel ifade
            anonymizedCategories.push('Özel öğrenme desteği');
        }
    });

    // Tekrarları kaldır
    return [...new Set(anonymizedCategories)];
};

/**
 * Performans seviyesini hesapla
 */
const calculatePerformanceLevel = (
    gpa: number,
    excludeBehavioral: boolean
): 'Düşük' | 'Orta' | 'Yüksek' => {
    if (gpa === 0) return 'Orta'; // Veri yoksa nötr değer

    // 0-100 skalasında
    if (gpa < 50) return 'Düşük';
    if (gpa < 75) return 'Orta';
    return 'Yüksek';
};

/**
 * Öğrenme stilini kategorize et
 */
const mapLearningStyle = (
    style: string
): 'visual' | 'auditory' | 'kinesthetic' | 'mixed' => {
    const lower = style.toLowerCase();

    if (lower.includes('görsel')) return 'visual';
    if (lower.includes('işitsel')) return 'auditory';
    if (lower.includes('kinestetik') || lower.includes('bedensel')) return 'kinesthetic';
    return 'mixed';
};

/**
 * Genel destek ihtiyaçlarını oluştur
 */
const generateSupportNeeds = (
    diagnosisProfile: string[],
    performanceLevel: string,
    iepNeeds: string[]
): string[] => {
    const needs: string[] = [];

    // Tanı profilinden genel ihtiyaçlar
    if (diagnosisProfile.includes('Okuma desteği')) {
        needs.push('Okuma becerilerini güçlendirme');
    }
    if (diagnosisProfile.includes('Matematik desteği')) {
        needs.push('Matematik kavramlarını pekiştirme');
    }
    if (diagnosisProfile.includes('Dikkat desteği')) {
        needs.push('Konsantrasyon ve odaklanma desteği');
    }

    // Performans seviyesinden genel ihtiyaçlar
    if (performanceLevel === 'Düşük') {
        needs.push('Temel becerileri güçlendirme');
    }

    // IEP ihtiyaçlarından genel kategoriler
    iepNeeds.forEach((need) => {
        const lower = need.toLowerCase();
        if (lower.includes('sosyal')) {
            needs.push('Sosyal beceri geliştirme');
        }
        if (lower.includes('iletişim')) {
            needs.push('İletişim becerileri geliştirme');
        }
    });

    // Tekrarları kaldır ve maksimum 5 ihtiyaç
    return [...new Set(needs)].slice(0, 5);
};

/**
 * Davranış trendi belirle
 */
const determineBehaviorTrend = (score: number): 'improving' | 'declining' | 'stable' => {
    // Davranış skoru: pozitif = iyi, negatif = kötü
    if (score > 10) return 'improving';
    if (score < -10) return 'declining';
    return 'stable';
};

/**
 * Anonimleştirme raporu oluştur (audit trail)
 */
export const generateAnonymizationReport = (
    originalStudent: AdvancedStudent,
    anonymized: AnonymizedStudentProfile,
    permissions?: StudentPrivacySettings
): AnonymizationReport => {
    const excludedFields = [
        'name',
        'personalInfo.tcNoHash',
        'personalInfo.tcNoLastFour',
        'personalInfo.address',
        'personalInfo.phone',
        'personalInfo.email',
        'familyInfo',
        'schoolInfo',
        'healthInfo.medications',
        'healthInfo.allergies',
        'financial',
        'portfolio (içerik URL\'leri)',
    ];

    const permissionsApplied = permissions?.aiProcessing.excludedDataTypes || [];

    return {
        originalStudentId: originalStudent.id,
        anonymizedId: anonymized.anonymousId,
        timestamp: new Date().toISOString(),
        excludedFields,
        permissionsApplied,
        retentionNotice:
            'Anonimleştirilmiş veri AI işleme sonrası 24 saat içinde silinir (KVKK Madde 7)',
    };
};

/**
 * Anonimleştirme gerekli mi kontrol et
 * @throws AppError if anonymization is required but not performed
 */
export const requireAnonymization = (permissions?: StudentPrivacySettings): boolean => {
    if (!permissions) return true; // Varsayılan: her zaman anonimleştir

    return permissions.aiProcessing.requireAnonymization;
};

/**
 * Anonimleştirilmiş veriyi doğrula
 * @description Kişisel tanımlayıcı bilgi içermediğinden emin ol
 * @throws AppError if personal identifiers found
 */
export const validateAnonymizedData = (profile: AnonymizedStudentProfile): void => {
    // Anonim ID'nin UUID formatında olduğunu kontrol et
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(profile.anonymousId)) {
        throw new AppError(
            'Geçersiz anonim ID formatı',
            'INVALID_ANONYMOUS_ID',
            500
        );
    }

    // Tanı profili detaylı bilgi içermemeli
    profile.diagnosisProfile.forEach((d) => {
        if (
            d.length > 50 ||
            /\b(isim|adı|soyadı|tc|kimlik|telefon|adres)\b/i.test(d)
        ) {
            throw new AppError(
                'Tanı profilinde kişisel tanımlayıcı bulundu',
                'PERSONAL_IDENTIFIER_IN_DIAGNOSIS',
                500,
                { diagnosis: d }
            );
        }
    });

    // Destek ihtiyaçları spesifik isim içermemeli
    profile.supportNeeds.forEach((need) => {
        if (need.length > 100 || /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/.test(need)) {
            throw new AppError(
                'Destek ihtiyaçlarında kişisel tanımlayıcı bulundu',
                'PERSONAL_IDENTIFIER_IN_NEEDS',
                500,
                { need }
            );
        }
    });
};

/**
 * AI işleme için anonim profil hazırla
 * @description Tek fonksiyonla anonimleştirme + doğrulama + raporlama
 */
export const prepareForAIProcessing = (
    student: AdvancedStudent
): {
    anonymized: AnonymizedStudentProfile;
    report: AnonymizationReport;
} => {
    // Anonimleştirme gerekli mi kontrol et
    if (!requireAnonymization(student.privacySettings)) {
        throw new AppError(
            'Öğrenci gizlilik ayarları AI anonimleştirme gerektiriyor ama aktif değil',
            'ANONYMIZATION_REQUIRED',
            403
        );
    }

    // Anonimleştir
    const anonymized = anonymizeStudent(student, student.privacySettings);

    // Doğrula
    validateAnonymizedData(anonymized);

    // Rapor oluştur
    const report = generateAnonymizationReport(
        student,
        anonymized,
        student.privacySettings
    );

    return { anonymized, report };
};

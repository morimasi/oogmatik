/**
 * OOGMATIK — AI Validation Service (Sprint 4)
 * @description Validates AI-generated content for IEP goals and cognitive insights
 *
 * [KLINIK DIREKTIF - Dr. Ahmet Kaya]
 * Bu servis, AI'nin ürettiği içeriğin MEB standartlarına, klinik etik kurallara ve
 * ölçülebilirlik kriterlerine uygunluğunu doğrular.
 *
 * YASAL DAYANAK:
 * - MEB Özel Eğitim Hizmetleri Yönetmeliği (573 sayılı KHK)
 * - BEP Hazırlama Rehberi 2024
 * - KVKK Madde 6 (Özel nitelikli kişisel veri işleme)
 */

import type { IEPGoal, StudentAIProfile } from '../types/student-advanced';
import { AppError } from '../utils/AppError';

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ValidationResult {
    isValid: boolean;
    warnings: ValidationWarning[];
    riskScore: number; // 0-100 (0 = güvenli, 100 = kritik risk)
    recommendations?: string[];
}

export interface ValidationWarning {
    type: 'clinical' | 'measurement' | 'terminology' | 'ethical' | 'meb_compliance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    field: string;
    message: string;
    suggestion?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLINICAL TERMINOLOGY FILTERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Tanı koyucu veya etiketleyici dil kalıpları
 * @description Bu kalıplar öğretmen dilinde ASLA kullanılmamalı
 */
const DIAGNOSTIC_LANGUAGE_PATTERNS = [
    /tanı\s+(konulmuştur|koyulmuştur|almıştır)/i,
    /teşhis\s+edilmiştir/i,
    /(disleksi|dehb|otizm)\s+(var|vardır|mevcut)/i,
    /engelli\s+öğrenci/i,
    /zeka\s+seviyesi\s+(düşük|yetersiz)/i,
    /normal\s+(değil|olmayan)/i,
    /hasta/i,
    /bozukluk\s+(var|mevcut)/i,
];

/**
 * Güvenli alternatif dil kalıpları
 */
const SAFE_ALTERNATIVE_PHRASES = {
    'tanı konulmuştur': 'destek ihtiyacı var',
    'disleksisi var': 'okuma desteğine ihtiyacı var',
    'DEHB var': 'dikkat ve konsantrasyon desteğine ihtiyacı var',
    'engelli öğrenci': 'özel öğrenme güçlüğü yaşayan öğrenci',
    'hasta': 'öğrenci',
    'normal değil': 'farklı öğrenme profiline sahip',
};

/**
 * MEB onaylı akademik kazanım anahtar kelimeleri
 * @description BEP hedeflerinin MEB müfredatına bağlanması için
 */
const MEB_CURRICULUM_KEYWORDS = [
    // Türkçe
    'okuma', 'yazma', 'dinleme', 'konuşma', 'sözcük', 'cümle', 'metin', 'anlama',
    // Matematik
    'sayılar', 'işlemler', 'geometri', 'ölçme', 'veri', 'toplama', 'çıkarma', 'çarpma', 'bölme',
    // Sosyal Beceriler
    'iletişim', 'işbirliği', 'problem çözme', 'karar verme', 'empati', 'sorumluluk',
    // Motor Beceriler
    'koordinasyon', 'denge', 'ince motor', 'kaba motor', 'el göz koordinasyonu',
];

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * IEP hedeflerini doğrula
 * @description MEB uyumluluğu, ölçülebilirlik, klinik terminoloji kontrolü
 */
export const validateIEPGoals = (
    goals: IEPGoal[],
    gradeLevel: string,
    studentAge: number
): ValidationResult => {
    const warnings: ValidationWarning[] = [];
    let riskScore = 0;

    // Hedef sayısı kontrolü
    if (goals.length === 0) {
        warnings.push({
            type: 'meb_compliance',
            severity: 'low',
            field: 'goals',
            message: 'En az 1 BEP hedefi oluşturulmalıdır',
            suggestion: 'Öğrencinin en acil ihtiyacı olan alandan başlayın',
        });
        riskScore += 10;
    }

    if (goals.length > 10) {
        warnings.push({
            type: 'clinical',
            severity: 'medium',
            field: 'goals',
            message: 'Çok fazla hedef öğrenciyi bunaltabilir (maksimum 10 önerilir)',
            suggestion: 'En kritik 5-7 hedefi önceliklendirin',
        });
        riskScore += 15;
    }

    // Her hedefi ayrı ayrı doğrula
    goals.forEach((goal, index) => {
        const goalWarnings = validateSingleGoal(goal, gradeLevel, studentAge, index);
        warnings.push(...goalWarnings);
        riskScore += goalWarnings.reduce((sum, w) => sum + getRiskWeight(w.severity), 0);
    });

    // Risk skorunu normalize et (0-100)
    riskScore = Math.min(riskScore, 100);

    return {
        isValid: warnings.filter((w) => w.severity === 'critical').length === 0,
        warnings,
        riskScore,
        recommendations: generateRecommendations(warnings, riskScore),
    };
};

/**
 * Tek bir IEP hedefini doğrula
 */
const validateSingleGoal = (
    goal: IEPGoal,
    gradeLevel: string,
    studentAge: number,
    index: number
): ValidationWarning[] => {
    const warnings: ValidationWarning[] = [];
    const fieldPrefix = `goals[${index}]`;

    // 1. Tanı koyucu dil kontrolü
    const diagnosticCheck = checkDiagnosticLanguage(goal.description, fieldPrefix);
    if (diagnosticCheck) warnings.push(diagnosticCheck);

    const titleCheck = checkDiagnosticLanguage(goal.title, `${fieldPrefix}.title`);
    if (titleCheck) warnings.push(titleCheck);

    // 2. SMART kriterleri kontrolü
    if (!goal.baseline?.description || goal.baseline.description.length < 20) {
        warnings.push({
            type: 'measurement',
            severity: 'high',
            field: `${fieldPrefix}.baseline`,
            message: 'Mevcut durum (baseline) yeterince detaylı değil',
            suggestion: 'Ölçülebilir bir başlangıç seviyesi belirtin (örn: "10 kelimelik metni 5 dakikada okuyabiliyor")',
        });
    }

    if (!goal.successCriteria || goal.successCriteria.length < 15) {
        warnings.push({
            type: 'measurement',
            severity: 'high',
            field: `${fieldPrefix}.successCriteria`,
            message: 'Başarı kriteri ölçülebilir değil',
            suggestion: 'Sayısal veya gözlemlenebilir bir kriter belirtin (örn: "30 kelimelik metni 3 dakikada okuyabilir")',
        });
    }

    if (!goal.shortTermObjective || goal.shortTermObjective.length < 10) {
        warnings.push({
            type: 'measurement',
            severity: 'medium',
            field: `${fieldPrefix}.shortTermObjective`,
            message: 'Kısa vadeli ara hedef belirtilmemiş',
            suggestion: 'Nihai hedefe giden yolda bir ara durak belirleyin',
        });
    }

    // 3. Zaman çizelgesi kontrolü
    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const monthsDiff = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsDiff < 1) {
        warnings.push({
            type: 'meb_compliance',
            severity: 'medium',
            field: `${fieldPrefix}.targetDate`,
            message: 'Hedef süresi çok kısa (minimum 1 ay önerilir)',
            suggestion: 'Gerçekçi bir süre belirleyin',
        });
    }

    if (monthsDiff > 12) {
        warnings.push({
            type: 'meb_compliance',
            severity: 'low',
            field: `${fieldPrefix}.targetDate`,
            message: 'Hedef süresi çok uzun (maksimum 1 yıl önerilir)',
            suggestion: 'Daha kısa vadeli ara hedefler belirleyin',
        });
    }

    // 4. Strateji kontrolü
    if (goal.strategies.length === 0) {
        warnings.push({
            type: 'clinical',
            severity: 'medium',
            field: `${fieldPrefix}.strategies`,
            message: 'Destek stratejisi belirtilmemiş',
            suggestion: 'Hedefe ulaşmak için kullanılacak yöntemleri ekleyin',
        });
    }

    // 5. MEB kazanım bağlantısı kontrolü
    const hasMEBKeyword = MEB_CURRICULUM_KEYWORDS.some((keyword) =>
        goal.description.toLowerCase().includes(keyword)
    );

    if (!hasMEBKeyword) {
        warnings.push({
            type: 'meb_compliance',
            severity: 'low',
            field: `${fieldPrefix}.description`,
            message: 'Hedef MEB müfredatına açıkça bağlanmamış',
            suggestion: 'Hangi kazanımı desteklediğini belirtin',
        });
    }

    return warnings;
};

/**
 * Tanı koyucu dil kontrolü
 */
const checkDiagnosticLanguage = (
    text: string,
    field: string
): ValidationWarning | null => {
    for (const pattern of DIAGNOSTIC_LANGUAGE_PATTERNS) {
        if (pattern.test(text)) {
            const matchedPhrase = text.match(pattern)?.[0] || '';
            const alternative = findSafeAlternative(matchedPhrase);

            return {
                type: 'ethical',
                severity: 'critical',
                field,
                message: `Tanı koyucu dil tespit edildi: "${matchedPhrase}"`,
                suggestion: alternative
                    ? `Şunu kullanın: "${alternative}"`
                    : 'Daha pedagojik bir ifade kullanın',
            };
        }
    }

    return null;
};

/**
 * Güvenli alternatif bul
 */
const findSafeAlternative = (phrase: string): string | undefined => {
    for (const [diagnostic, safe] of Object.entries(SAFE_ALTERNATIVE_PHRASES)) {
        if (phrase.toLowerCase().includes(diagnostic.toLowerCase())) {
            return safe;
        }
    }
    return undefined;
};

/**
 * Bilişsel içgörü (AI profil) doğrulama
 * @description Değer aralıkları, confidence skoru, data quality kontrolü
 */
export const validateCognitiveInsight = (
    insight: StudentAIProfile,
    studentAge: number,
    dataQualityScore: number // 0-100 (kaç oturum verisi var?)
): ValidationResult => {
    const warnings: ValidationWarning[] = [];
    let riskScore = 0;

    // 1. Data quality threshold
    if (dataQualityScore < 30) {
        warnings.push({
            type: 'clinical',
            severity: 'high',
            field: 'dataQualityScore',
            message: 'Yetersiz veri ile AI analizi yapılıyor',
            suggestion: 'En az 3 oturum verisi toplandıktan sonra analiz başlatın',
        });
        riskScore += 40;
    }

    // 2. Risk faktörleri kontrolü
    if (insight.riskFactors.length > 5) {
        warnings.push({
            type: 'clinical',
            severity: 'medium',
            field: 'aiProfile.riskFactors',
            message: 'Çok fazla risk faktörü belirlendi, öğretmeni bunaltabilir',
            suggestion: 'En kritik 3-5 risk faktörünü önceliklendirin',
        });
        riskScore += 15;
    }

    // 3. Tahmini not kontrolü
    if (insight.predictedGrade !== undefined) {
        if (insight.predictedGrade < 0 || insight.predictedGrade > 100) {
            warnings.push({
                type: 'measurement',
                severity: 'critical',
                field: 'aiProfile.predictedGrade',
                message: `Geçersiz tahmin değeri: ${insight.predictedGrade}`,
                suggestion: '0-100 aralığında bir değer olmalı',
            });
            riskScore += 50;
        }

        if (dataQualityScore < 50 && insight.predictedGrade) {
            warnings.push({
                type: 'clinical',
                severity: 'high',
                field: 'aiProfile.predictedGrade',
                message: 'Düşük veri kalitesi ile tahmin yapılıyor',
                suggestion: 'Tahmini öğretmene güvenilir olmadığını belirterek gösterin',
            });
            riskScore += 25;
        }
    }

    // 4. Tanı koyucu dil kontrolü
    const strengthCheck = checkDiagnosticLanguage(
        insight.strengthAnalysis,
        'aiProfile.strengthAnalysis'
    );
    if (strengthCheck) {
        warnings.push(strengthCheck);
        riskScore += 50;
    }

    const struggleCheck = checkDiagnosticLanguage(
        insight.struggleAnalysis,
        'aiProfile.struggleAnalysis'
    );
    if (struggleCheck) {
        warnings.push(struggleCheck);
        riskScore += 50;
    }

    // 5. Önerilen aktivite sayısı
    if (insight.recommendedActivities.length > 10) {
        warnings.push({
            type: 'clinical',
            severity: 'low',
            field: 'aiProfile.recommendedActivities',
            message: 'Çok fazla aktivite öneriliyor',
            suggestion: 'En etkili 5-7 aktiviteyi önceliklendirin',
        });
        riskScore += 5;
    }

    // Risk skorunu normalize et
    riskScore = Math.min(riskScore, 100);

    return {
        isValid: warnings.filter((w) => w.severity === 'critical').length === 0,
        warnings,
        riskScore,
        recommendations: generateRecommendations(warnings, riskScore),
    };
};

/**
 * Uyarı seviyesine göre risk ağırlığı
 */
const getRiskWeight = (severity: ValidationWarning['severity']): number => {
    switch (severity) {
        case 'critical':
            return 50;
        case 'high':
            return 25;
        case 'medium':
            return 10;
        case 'low':
            return 5;
        default:
            return 0;
    }
};

/**
 * Öneriler üret
 */
const generateRecommendations = (
    warnings: ValidationWarning[],
    riskScore: number
): string[] => {
    const recommendations: string[] = [];

    const criticalWarnings = warnings.filter((w) => w.severity === 'critical');
    const highWarnings = warnings.filter((w) => w.severity === 'high');

    if (criticalWarnings.length > 0) {
        recommendations.push(
            '🚨 KRİTİK: Bu içerik öğretmene gösterilmeden önce düzeltilmelidir'
        );
        criticalWarnings.forEach((w) => {
            if (w.suggestion) recommendations.push(`• ${w.suggestion}`);
        });
    }

    if (highWarnings.length > 0 && riskScore > 40) {
        recommendations.push(
            '⚠️ YÜKSEK RİSK: Bu içeriği kullanmadan önce klinik uzman onayı alın'
        );
    }

    if (riskScore < 20) {
        recommendations.push('✅ İçerik güvenli, öğretmene sunulabilir');
    } else if (riskScore < 40) {
        recommendations.push('⚠️ İçerik genelde güvenli, küçük iyileştirmeler yapın');
    } else if (riskScore < 70) {
        recommendations.push('⚠️ İçerik riskli, ciddi düzeltmeler gerekli');
    } else {
        recommendations.push('🚨 İçerik çok riskli, yeniden oluşturun');
    }

    return recommendations;
};

/**
 * Hızlı validasyon kontrolü (API endpoint'lerinde kullanılır)
 * @throws AppError if validation fails critically
 */
export const validateOrThrow = (result: ValidationResult): void => {
    if (!result.isValid) {
        const criticalWarnings = result.warnings.filter((w) => w.severity === 'critical');
        const errorMessages = criticalWarnings.map((w) => `${w.field}: ${w.message}`).join('; ');

        throw new AppError(
            `AI içerik doğrulama başarısız: ${errorMessages}`,
            'AI_VALIDATION_FAILED',
            400,
            { riskScore: result.riskScore, warnings: result.warnings }
        );
    }

    if (result.riskScore > 70) {
        throw new AppError(
            'AI içerik risk skoru çok yüksek (>70). Klinik uzman onayı gerekli.',
            'AI_CONTENT_HIGH_RISK',
            400,
            { riskScore: result.riskScore, warnings: result.warnings }
        );
    }
};

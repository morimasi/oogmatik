export interface CognitiveProfileMetrics {
    studentName: string;
    age: number;
    grade: string;
    diagnosis: string[];
    strengths: string[];
    weaknesses: string[];
    learningStyle?: string;
    notes?: string;
}

export type CognitiveDifficultyLevel = 'very_easy' | 'easy' | 'medium' | 'hard' | 'adaptive_expert';

const difficultyMap: Record<number, CognitiveDifficultyLevel> = {
    1: 'very_easy',
    2: 'easy',
    3: 'medium',
    4: 'hard',
    5: 'adaptive_expert'
};

/** Zorluk puanını (1-5) insan-okur Türkçe etikete çevirir. */
export function difficultyForProfile(complexityScore: number): string {
    switch (Math.max(1, Math.min(5, complexityScore))) {
        case 1: return 'Çok Kolay';
        case 2: return 'Kolay';
        case 3: return 'Orta';
        case 4: return 'İleri';
        default: return 'Uzman';
    }
}

export interface DomainAdaptiveParameters {
    difficultyLevel: CognitiveDifficultyLevel;
    complexityScore: number; // 1 to 5 scale
    targetItemsCount: number;
    timeLimitMultiplier: number; // e.g. 1.3x for ADHD/Dyslexia pacing
    distractorComplexity: 'low' | 'moderate' | 'high';
    guidanceText: string;
    supportNote: string;
    seedSalt: string;
}

/**
 * Öğrencinin sınıf, yaş, tanı, güçlü ve zayıf yönlerini analiz ederek
 * her bilişsel alan için kişiselleştirilmiş zorluk seviyesi ve dinamik parametreleri belirler.
 */
export function calculateDomainAdaptiveParameters(
    domain: string,
    profile: CognitiveProfileMetrics
): DomainAdaptiveParameters {
    const age = profile.age || 8;
    const gradeNum = parseInt(profile.grade?.replace(/[^0-9]/g, '') || '2', 10);
    const diagnoses = (profile.diagnosis || []).map(d => d.toLowerCase());
    const weaknesses = (profile.weaknesses || []).map(w => w.toLowerCase());
    const strengths = (profile.strengths || []).map(s => s.toLowerCase());

    const hasDyslexia = diagnoses.some(d => d.includes('disleksi') || d.includes('okuma'));
    const hasADHD = diagnoses.some(d => d.includes('dehb') || d.includes('dikkat'));
    const hasDyscalculia = diagnoses.some(d => d.includes('diskalkuli') || d.includes('matematik'));
    const hasDisgraphia = diagnoses.some(d => d.includes('disgrafi') || d.includes('yazma'));
    const isGifted = diagnoses.some(d => d.includes('üstün') || d.includes('yetenek'));

    // Temel seviye belirleme (Yaş ve Sınıf tabanlı)
    let baseScore = 2; // Default: 'easy' / 'medium'
    if (age <= 6 || gradeNum <= 1) {
        baseScore = 1; // Çok Kolay / Kolay
    } else if (age <= 9 || gradeNum <= 3) {
        baseScore = 2; // Kolay / Dengeli
    } else if (age <= 12 || gradeNum <= 6) {
        baseScore = 3; // Orta
    } else {
        baseScore = 4; // İleri
    }

    if (isGifted) {
        baseScore = Math.min(5, baseScore + 1);
    }

    // Alana özgü zayıflık ve tanı uyarlamaları (ZPD prensibi)
    let domainScore = baseScore;
    let timeMultiplier = 1.0;
    let distractorLevel: 'low' | 'moderate' | 'high' = 'moderate';
    let support = 'Standart yaş ve sınıf yönergesi.';

    switch (domain) {
        case 'selective_attention':
        case 'visual_search':
            if (hasADHD || weaknesses.some(w => w.includes('dikkat') || w.includes('odak'))) {
                domainScore = Math.max(1, domainScore - 1);
                timeMultiplier = 1.35;
                distractorLevel = 'low';
                support = 'DEHB ve dikkat profiline göre görsel kalabalık azaltıldı ve tempo dengelendi.';
            } else if (strengths.some(s => s.includes('dikkat') || s.includes('görsel'))) {
                domainScore = Math.min(5, domainScore + 1);
                distractorLevel = 'high';
                support = 'Güçlü dikkat profili nedeniyle ayırt edici çeldiriciler eklendi.';
            }
            break;

        case 'phonological_loop':
        case 'verbal_comprehension':
            if (hasDyslexia || weaknesses.some(w => w.includes('okuma') || w.includes('dil') || w.includes('ses') || w.includes('hece'))) {
                domainScore = Math.max(1, domainScore - 1);
                timeMultiplier = 1.4;
                distractorLevel = 'low';
                support = 'Disleksi/fonolojik destek profiline uygun sade ve ritmik kelime havuzu seçildi.';
            } else if (strengths.some(s => s.includes('dil') || s.includes('sözel'))) {
                domainScore = Math.min(5, domainScore + 1);
                support = 'Zengin kelime dağarcığı ve ileri düzey kavramsal ilişkilendirme aktif.';
            }
            break;

        case 'logical_reasoning':
        case 'working_memory':
            if (hasDyscalculia || weaknesses.some(w => w.includes('matematik') || w.includes('mantık') || w.includes('hafıza'))) {
                domainScore = Math.max(1, domainScore - 1);
                timeMultiplier = 1.3;
                distractorLevel = 'low';
                support = 'Matematiksel/hafıza yükü aşamalı olarak azaltıldı, somut örüntüler öne çıkarıldı.';
            } else if (strengths.some(s => s.includes('matematik') || s.includes('mantık'))) {
                domainScore = Math.min(5, domainScore + 1);
                distractorLevel = 'high';
                support = 'Çok adımlı mantıksal çıkarsama ve kural dönüştürme matrisleri dahil edildi.';
            }
            break;

        case 'planning':
            if (hasADHD) {
                timeMultiplier = 1.4;
                support = 'Dürtüselliği dengelemek adına adım adım görselleştirilmiş alt-hedefler tanımlandı.';
            }
            break;

        case 'visual_motor_integration':
            if (hasDisgraphia || age <= 7) {
                domainScore = Math.max(1, domainScore - 1);
                timeMultiplier = 1.3;
                support = 'Motor koordinasyon için temel geometrik figürler ve yüksek kontrastlı hedef şekiller sağlandı.';
            }
            break;

        default:
            break;
    }

    const difficultyLevel = difficultyMap[domainScore] || 'medium';

    return {
        difficultyLevel,
        complexityScore: domainScore,
        targetItemsCount: domainScore === 1 ? 4 : domainScore === 2 ? 5 : domainScore === 3 ? 6 : 8,
        timeLimitMultiplier: timeMultiplier,
        distractorComplexity: distractorLevel,
        guidanceText: `${profile.studentName} için ${domainScore}. seviye (${difficultyLevel}) kişiselleştirilmiş değerlendirme.`,
        supportNote: support,
        seedSalt: `${profile.studentName}_${profile.age}_${profile.grade}_${Date.now()}`
    };
}

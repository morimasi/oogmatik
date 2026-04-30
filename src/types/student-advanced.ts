import { Student } from './core';

// --- ADVANCED STUDENT TYPES ---

// 1. IEP (Bireyselleştirilmiş Eğitim Programı)
export interface IEPGoal {
    id: string;
    category: 'academic' | 'behavioral' | 'social' | 'motor' | 'speech';
    title: string;
    description: string;

    // Sprint 4: SMART Scaffold Fields
    baseline: {
        description: string;
        measurementDate: string;
        measurementMethod: 'observation' | 'test' | 'work_sample';
    };
    shortTermObjective: string;  // Kısa vadeli ara hedef
    successCriteria: string;     // Ölçülebilir başarı kriteri

    targetDate: string;
    status: 'not_started' | 'in_progress' | 'achieved' | 'deferred' | 'needs_revision';
    progress: number; // 0-100
    priority: 'high' | 'medium' | 'low';
    strategies: string[];
    resources: string[];
    evaluationMethod: 'observation' | 'test' | 'portfolio' | 'checklist';
    notes?: string;
    aiAnalysis?: string; // AI generated insight about this goal
    reviews: {
        id: string;
        date: string;
        reviewer: string;
        comment: string;
        progressSnapshot: number;
        nextSteps?: string;
    }[];
}

export interface IEPPlan {
    id: string;
    studentId: string;
    startDate: string;
    endDate: string;
    diagnosis: string[]; // e.g., "Dyslexia", "ADHD"
    strengths: string[];
    needs: string[];
    goals: IEPGoal[];
    accommodations: string[]; // Sınav süresi uzatma, büyük punto vb.
    teamMembers: {
        role: string;
        name: string;
        contact?: string;
    }[]; 
    status: 'active' | 'archived' | 'draft' | 'pending_approval';
    lastUpdated: string;
    aiSummary?: string; // Overall AI summary of the plan
}

// 2. FINANCIALS (Finansal Takip)
export interface Transaction {
    id: string;
    date: string;
    dueDate?: string;
    type: 'payment' | 'charge' | 'scholarship' | 'discount' | 'refund';
    amount: number;
    currency: 'TRY' | 'USD' | 'EUR';
    description: string;
    category: 'tuition' | 'materials' | 'food' | 'transport' | 'activity' | 'other';
    status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'partial';
    paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash' | 'check';
    receiptUrl?: string;
    paidAmount?: number;
}

export interface FinancialProfile {
    studentId: string;
    balance: number; // Current outstanding balance
    totalPaid: number;
    totalDue: number;
    currency: 'TRY' | 'USD' | 'EUR';
    billingCycle: 'monthly' | 'term' | 'annual';
    scholarshipRate: number; // 0-100
    scholarshipType?: 'merit' | 'need_based' | 'sibling' | 'staff' | 'promotional';
    transactions: Transaction[];
    paymentPlan: {
        id: string;
        dueDate: string;
        amount: number;
        status: 'paid' | 'pending' | 'overdue';
        installmentNumber: number;
    }[];
    notes?: string;
}

// 3. ATTENDANCE (Devamsızlık)
export interface AttendanceRecord {
    id: string;
    date: string;
    type: 'school' | 'lesson' | 'activity';
    status: 'present' | 'absent' | 'late' | 'excused' | 'early_leave';
    checkInTime?: string;
    checkOutTime?: string;
    duration?: number; // minutes
    reason?: string; // for excused/absent
    notifiedParent: boolean;
    notes?: string;
}

export interface AttendanceStats {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number; // Percentage
    trend: 'improving' | 'declining' | 'stable';
}

// 4. PERFORMANCE (Notlar ve Değerlendirme)
export interface GradeEntry {
    id: string;
    subject: string;
    topic?: string;
    type: 'exam' | 'quiz' | 'homework' | 'project' | 'participation';
    score: number;
    maxScore: number;
    date: string;
    weight: number; // Ağırlık katsayısı
    teacherFeedback?: string;
    classAverage?: number;
}

export interface PerformanceMetrics {
    gpa: number;
    subjectAverages: Record<string, number>;
    attendanceRate: number; // 0-100
    participationRate: number;
    homeworkCompletionRate: number;
    strongestSubject: string;
    weakestSubject: string;
    recentTrend: 'up' | 'down' | 'flat';
}

// 5. BEHAVIOR & PORTFOLIO
export interface BehaviorIncident {
    id: string;
    date: string;
    type: 'positive' | 'negative' | 'neutral';
    category: 'participation' | 'respect' | 'responsibility' | 'safety' | 'teamwork' | 'focus';
    points: number; // + veya - puan
    title: string;
    description: string;
    actionTaken?: string;
    reportedBy: string;
    location?: string; // Classroom, playground, etc.
    mediaUrls?: string[];
}

export interface PortfolioItem {
    id: string;
    title: string;
    description: string;
    date: string;
    type: 'image' | 'video' | 'document' | 'audio' | 'link';
    url: string;
    thumbnailUrl?: string;
    tags: string[];
    skillsDemonstrated: string[]; // e.g., "Creativity", "Critical Thinking"
    teacherComments?: string;
    studentReflection?: string;
    isPublic: boolean; // Visible to parents?
}

// 6. AI & ANALYTICS
export interface StudentAIProfile {
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
    strengthAnalysis: string;
    struggleAnalysis: string;
    recommendedActivities: string[];
    predictedGrade?: number;
    riskFactors: string[];
    lastUpdated: string;
}

// 7. MAIN AGGREGATE TYPE
export interface AdvancedStudent extends Student {
    // Extended Personal Info
    personalInfo?: {
        tcNoHash?: string;
        tcNoLastFour?: string;
        birthDate?: string;
        gender?: string;
        bloodType?: string;
        address?: string;
        phone?: string;
        email?: string;
    };
    familyInfo?: {
        parentName?: string;
        parentRelation?: string;
        parentPhone?: string;
        parentEmail?: string;
        parentJob?: string;
        emergencyContact?: string;
    };
    schoolInfo?: {
        schoolName?: string;
        studentNumber?: string;
        teacherName?: string;
    };
    healthInfo?: {
        diagnosis?: string[];
        medications?: string;
        allergies?: string;
        reportDate?: string;
        reportEndDate?: string;
    };
    initialNotes?: {
        observations?: string;
        expectations?: string;
        strengths?: string;
        weaknesses?: string;
    };

    // Modules
    iep: IEPPlan;
    financial: FinancialProfile;
    attendance: {
        records: AttendanceRecord[];
        stats: AttendanceStats;
    };
    academic: {
        grades: GradeEntry[];
        metrics: PerformanceMetrics;
    };
    behavior: {
        incidents: BehaviorIncident[];
        score: number; // Net behavior score
    };
    portfolio: PortfolioItem[];
    aiProfile: StudentAIProfile;
    privacySettings?: StudentPrivacySettings;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. STUDENT PRIVACY SETTINGS — KVKK Madde 6 Uyumlu
// ═══════════════════════════════════════════════════════════════════════════════
//
// [KLİNİK DİREKTİF - Dr. Ahmet Kaya]
// YASAL DAYANAK: 6698 sayılı KVKK (Kişisel Verilerin Korunması Kanunu)
//   - Madde 6: Özel nitelikli kişisel verilerin işlenmesi
//   - Madde 7: Kişisel verilerin silinmesi, yok edilmesi veya anonim hale getirilmesi
//   - Madde 11: İlgili kişinin hakları (erişim, düzeltme, silme, itiraz)
//
// KONTRAENDİKASYON: Bu tipler ASLA bypass edilmemeli. Her veri erişimi
// bu ayarlar üzerinden kontrol edilmeli.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Veri sınıflandırma türleri
 * @description KVKK Madde 6 kapsamında hassas veri kategorileri
 */
export type DataClassification =
    | 'encrypted'       // Şifreli saklama (AES-256 önerilir)
    | 'local_only'      // Yalnızca yerel cihazda, sunucuya gönderilmez
    | 'anonymized'      // Anonim hale getirilmiş (hash/pseudonim)
    | 'standard';       // Standart koruma

/**
 * Profil görünürlük seviyeleri
 */
export type ProfileVisibility =
    | 'private'         // Yalnızca öğrenci/veli erişebilir
    | 'teachers_only'   // Yalnızca atanmış öğretmenler
    | 'institution'     // Kurum içi tüm yetkili personel
    | 'shared';         // Paylaşım izni verilen kişiler

/**
 * Hassas veri işleme ayarları
 * @description Her veri türü için ayrı sınıflandırma
 */
export interface SensitiveDataHandling {
    /** Tanı bilgileri (disleksi, DEHB vb.) - KRİTİK */
    diagnosisInfo: 'encrypted' | 'local_only';

    /** Değerlendirme/test sonuçları */
    assessmentResults: 'encrypted' | 'local_only';

    /** Davranış notları ve gözlemler */
    behavioralNotes: 'local_only';

    /** Sağlık bilgileri - KRİTİK (KVKK özel nitelikli veri) */
    medicalInfo: 'local_only';

    /** BEP/IEP belgeleri */
    iepDocuments: 'encrypted' | 'local_only';

    /** Akademik performans verileri */
    academicRecords: 'encrypted' | 'standard';

    /** Aile/veli iletişim bilgileri */
    familyContactInfo: 'encrypted';
}

/**
 * Ebeveyn erişim kontrol ayarları
 */
export interface ParentAccessSettings {
    /** Tam rapora erişim */
    canViewFullReport: boolean;

    /** Akademik ilerleme görüntüleme */
    canViewProgress: boolean;

    /** AI tarafından üretilen analizleri görme */
    canViewAIInsights: boolean;

    /** Öğretmen notlarını görme */
    canViewTeacherNotes: boolean;

    /** Değerlendirme detaylarını görme */
    canViewAssessmentDetails: boolean;

    /** Aktivite geçmişine erişim */
    canViewActivityHistory: boolean;

    /** Davranış raporlarını görme */
    canViewBehaviorReports: boolean;

    /** Bildirim tercihleri */
    notificationPreferences: {
        email: boolean;
        sms: boolean;
        inApp: boolean;
        frequency: 'instant' | 'daily' | 'weekly';
    };
}

/**
 * AI veri işleme izinleri
 * @description Gemini/Claude modelleri ile veri paylaşım ayarları
 */
export interface AIProcessingPermissions {
    /** Kişiselleştirilmiş aktivite üretimi için veri kullanımı */
    allowPersonalization: boolean;

    /** Öğrenme analizi için veri kullanımı */
    allowLearningAnalysis: boolean;

    /** AI model eğitimi için anonim veri kullanımı */
    allowAnonymizedTraining: boolean;

    /** BEP/IEP önerisi için tanı verisi kullanımı */
    allowDiagnosisBasedRecommendations: boolean;

    /** Performans tahmini için geçmiş veri kullanımı */
    allowPredictiveAnalysis: boolean;

    /** AI ile paylaşılamayacak veri türleri */
    excludedDataTypes: Array<
        | 'diagnosis'
        | 'medical'
        | 'family'
        | 'behavioral'
        | 'financial'
        | 'personal_identifiers'
    >;

    /** AI işleme için veri anonimleştirme zorunlu mu? */
    requireAnonymization: boolean;
}

/**
 * Veri saklama ve silme politikası
 * @description KVKK Madde 7 uyumlu veri yaşam döngüsü
 */
export interface DataRetentionPolicy {
    /** Aktif öğrenci verisi saklama süresi (ay) */
    activeDataRetentionMonths: number;

    /** Pasif/mezun öğrenci verisi saklama süresi (ay) - MEB 3 yıl önerir */
    inactiveDataRetentionMonths: number;

    /** Otomatik silme aktif mi? */
    autoDeleteEnabled: boolean;

    /** Silme öncesi uyarı süresi (gün) */
    deletionWarningDays: number;

    /** Silme yerine anonimleştirme tercih edilsin mi? */
    preferAnonymizationOverDeletion: boolean;

    /** Dışa aktarma formatı (silme öncesi) */
    exportFormatBeforeDeletion: 'json' | 'pdf' | 'both';
}

/**
 * Veri silme/düzeltme talepleri (KVKK Madde 11)
 */
export interface DataSubjectRequest {
    id: string;
    requestType:
        | 'access'          // Verilere erişim talebi
        | 'correction'      // Düzeltme talebi
        | 'deletion'        // Silme talebi (unutulma hakkı)
        | 'restriction'     // İşleme kısıtlama
        | 'portability'     // Veri taşınabilirliği
        | 'objection';      // İtiraz hakkı

    requestDate: string;            // ISO 8601
    requestedBy: 'parent' | 'student_adult' | 'legal_guardian';
    requesterId: string;

    status: 'pending' | 'approved' | 'rejected' | 'completed';
    responseDate?: string;
    responseBy?: string;
    responseNotes?: string;

    /** Etkilenen veri kategorileri */
    affectedDataCategories: string[];

    /** KVKK 30 gün yanıt süresi */
    dueDate: string;
}

/**
 * Denetim izi bilgileri
 */
export interface PrivacyAuditLog {
    id: string;
    timestamp: string;              // ISO 8601
    action:
        | 'settings_updated'
        | 'data_accessed'
        | 'data_exported'
        | 'data_deleted'
        | 'consent_given'
        | 'consent_revoked'
        | 'request_submitted'
        | 'request_processed';

    actorId: string;                // Eylemi yapan kullanıcı
    actorRole: 'parent' | 'teacher' | 'admin' | 'system';

    targetDataCategory?: string;
    previousValue?: string;         // Hassas veriler için hash
    newValue?: string;              // Hassas veriler için hash

    ipAddress?: string;             // Anonim hale getirilebilir
    userAgent?: string;

    /** Yasal gerekçe (zorunlu işlemler için) */
    legalBasis?:
        | 'consent'                 // Açık rıza
        | 'legal_obligation'        // Yasal zorunluluk
        | 'vital_interest'          // Hayati menfaat
        | 'public_interest'         // Kamu yararı
        | 'legitimate_interest';    // Meşru menfaat
}

/**
 * Ebeveyn onay kaydı
 */
export interface ParentalConsent {
    /** Onay verildi mi? */
    granted: boolean;

    /** Onay tarihi */
    grantedDate?: string;           // ISO 8601

    /** Onay veren kişi ID */
    grantedBy?: string;

    /** Onay veren kişinin yasal ilişkisi */
    grantorRelation?: 'mother' | 'father' | 'legal_guardian' | 'other';

    /** Dijital imza / onay metni hash'i */
    consentSignatureHash?: string;

    /** Onay kapsamı */
    scope: {
        dataCollection: boolean;
        aiProcessing: boolean;
        thirdPartySharing: boolean;
        researchUse: boolean;
    };

    /** Onay geçerlilik süresi (ay) - yenileme gerekebilir */
    validityMonths: number;

    /** Son yenileme tarihi */
    lastRenewalDate?: string;

    /** Yenileme hatırlatması gönderildi mi? */
    renewalReminderSent?: boolean;
}

/**
 * Ana StudentPrivacySettings interface'i
 * @description KVKK Madde 6 tam uyumlu gizlilik ayarları
 *
 * [KLİNİK DOĞRULAMA]
 * Bu tip RAM değerlendirme süreçlerinde kullanılan tüm hassas verilerin
 * güvenli işlenmesini garanti eder. Her alan, gerçek bir aile toplantısında
 * veliye açıklanabilir ve MEB denetimine sunulabilir durumda olmalı.
 */
export interface StudentPrivacySettings {
    /** Profil görünürlük ayarı */
    profileVisibility: ProfileVisibility;

    /** Hassas veri işleme sınıflandırması */
    sensitiveDataHandling: SensitiveDataHandling;

    /** Ebeveyn erişim kontrolleri */
    parentAccess: ParentAccessSettings;

    /** AI veri işleme izinleri */
    aiProcessing: AIProcessingPermissions;

    /** Veri saklama politikası */
    dataRetention: DataRetentionPolicy;

    /** Ebeveyn onay kaydı - KVKK için zorunlu */
    parentalConsent: ParentalConsent;

    /** Aktif veri talebi varsa */
    pendingDataRequests?: DataSubjectRequest[];

    /** Gizlilik denetim günlüğü (son 100 kayıt) */
    auditLog?: PrivacyAuditLog[];

    /** Ayarların son güncellenme tarihi */
    lastUpdated: string;

    /** Ayarları güncelleyen kişi ID */
    lastUpdatedBy: string;

    /** Versiyon (şema değişikliği takibi için) */
    schemaVersion: '1.0';
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTIONS — Sprint 3: Type Safety
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Varsayılan IEP planı fabrikası
 * @description Boş IEP planı ile başlatır (taslak durumda)
 */
export const createDefaultIEP = (studentId: string): IEPPlan => ({
    id: crypto.randomUUID(),
    studentId,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 yıl sonra
    diagnosis: [],
    strengths: [],
    needs: [],
    goals: [],
    accommodations: [],
    teamMembers: [],
    status: 'draft',
    lastUpdated: new Date().toISOString()
});

/**
 * Varsayılan finansal profil fabrikası
 * @description Boş işlem geçmişi ve sıfır bakiye ile başlatır
 */
export const createDefaultFinancial = (studentId: string): FinancialProfile => ({
    studentId,
    balance: 0,
    totalPaid: 0,
    totalDue: 0,
    currency: 'TRY',
    billingCycle: 'monthly',
    scholarshipRate: 0,
    transactions: [],
    paymentPlan: []
});

/**
 * Varsayılan devamsızlık verisi fabrikası
 * @description Boş kayıt ve sıfır istatistikler
 */
export const createDefaultAttendance = (): {
    records: AttendanceRecord[];
    stats: AttendanceStats;
} => ({
    records: [],
    stats: {
        totalDays: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendanceRate: 100,
        trend: 'stable'
    }
});

/**
 * Varsayılan akademik profil fabrikası
 * @description Boş not listesi ve sıfırlanmış metrikler
 */
export const createDefaultAcademic = (): {
    grades: GradeEntry[];
    metrics: PerformanceMetrics;
} => ({
    grades: [],
    metrics: {
        gpa: 0,
        subjectAverages: {},
        attendanceRate: 100,
        participationRate: 0,
        homeworkCompletionRate: 0,
        strongestSubject: '-',
        weakestSubject: '-',
        recentTrend: 'flat'
    }
});

/**
 * Varsayılan davranış profil fabrikası
 * @description Boş olay listesi ve sıfır puan
 */
export const createDefaultBehavior = (): {
    incidents: BehaviorIncident[];
    score: number;
} => ({
    incidents: [],
    score: 0
});

/**
 * Varsayılan AI profil fabrikası
 * @description Temel öğrenme stili ataması ve boş analizler
 */
export const createDefaultAIProfile = (): StudentAIProfile => ({
    learningStyle: 'visual',
    strengthAnalysis: 'Henüz yeterli veri yok',
    struggleAnalysis: 'Henüz yeterli veri yok',
    recommendedActivities: [],
    riskFactors: [],
    lastUpdated: new Date().toISOString()
});

/**
 * Varsayılan gizlilik ayarları fabrikası
 * @description Yeni öğrenci kaydında kullanılacak güvenli varsayılanlar
 */
export const createDefaultPrivacySettings = (
    updatedBy: string
): StudentPrivacySettings => ({
    profileVisibility: 'teachers_only',

    sensitiveDataHandling: {
        diagnosisInfo: 'local_only',
        assessmentResults: 'encrypted',
        behavioralNotes: 'local_only',
        medicalInfo: 'local_only',
        iepDocuments: 'encrypted',
        academicRecords: 'encrypted',
        familyContactInfo: 'encrypted',
    },

    parentAccess: {
        canViewFullReport: true,
        canViewProgress: true,
        canViewAIInsights: true,
        canViewTeacherNotes: false,
        canViewAssessmentDetails: true,
        canViewActivityHistory: true,
        canViewBehaviorReports: true,
        notificationPreferences: {
            email: true,
            sms: false,
            inApp: true,
            frequency: 'weekly',
        },
    },

    aiProcessing: {
        allowPersonalization: true,
        allowLearningAnalysis: true,
        allowAnonymizedTraining: false,
        allowDiagnosisBasedRecommendations: true,
        allowPredictiveAnalysis: false,
        excludedDataTypes: ['medical', 'family', 'financial', 'personal_identifiers'],
        requireAnonymization: true,
    },

    dataRetention: {
        activeDataRetentionMonths: 36,      // MEB 3 yıl önerisi
        inactiveDataRetentionMonths: 36,
        autoDeleteEnabled: false,
        deletionWarningDays: 30,
        preferAnonymizationOverDeletion: true,
        exportFormatBeforeDeletion: 'both',
    },

    parentalConsent: {
        granted: false,
        scope: {
            dataCollection: false,
            aiProcessing: false,
            thirdPartySharing: false,
            researchUse: false,
        },
        validityMonths: 12,
    },

    lastUpdated: new Date().toISOString(),
    lastUpdatedBy: updatedBy,
    schemaVersion: '1.0',
});

/**
 * Ana AdvancedStudent fabrikası
 * @description Temel Student nesnesini alır ve tüm modülleri ekleyerek AdvancedStudent'a dönüştürür
 *
 * [TEKNIK NOT - Bora Demir]
 * Bu factory, Runtime'da `undefined` hatalarını önlemek için tüm modülleri başlatır.
 * Optional field'lar yerine default value'lar kullanarak TypeScript strict mode uyumluluğu sağlanır.
 *
 * @example
 * ```typescript
 * const baseStudent: Student = {
 *   id: '123',
 *   name: 'Ali Yılmaz',
 *   age: 10,
 *   grade: '4',
 *   teacherId: 'teacher-456',
 *   // ... other required fields
 * };
 *
 * const advancedStudent = createAdvancedStudent(baseStudent);
 * // Artık advancedStudent.iep.goals güvenle erişilebilir
 * ```
 */
export const createAdvancedStudent = (base: Student): AdvancedStudent => ({
    ...base,
    iep: createDefaultIEP(base.id),
    financial: createDefaultFinancial(base.id),
    attendance: createDefaultAttendance(),
    academic: createDefaultAcademic(),
    behavior: createDefaultBehavior(),
    portfolio: [],
    aiProfile: createDefaultAIProfile(),
    privacySettings: createDefaultPrivacySettings(base.teacherId)
});

import { Student } from './core';

// --- ADVANCED STUDENT TYPES ---

// 1. IEP (Bireyselleştirilmiş Eğitim Programı)
export interface IEPGoal {
    id: string;
    category: 'academic' | 'behavioral' | 'social' | 'motor' | 'speech';
    title: string;
    description: string;
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
        tcNo?: string;
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
}

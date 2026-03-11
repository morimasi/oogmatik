
import { Student } from './core';

// --- ADVANCED STUDENT TYPES ---

// 1. IEP (Bireyselleştirilmiş Eğitim Programı)
export interface IEPGoal {
    id: string;
    category: 'academic' | 'behavioral' | 'social' | 'motor';
    description: string;
    targetDate: string;
    status: 'not_started' | 'in_progress' | 'achieved' | 'deferred';
    progress: number; // 0-100
    notes?: string;
    reviews: {
        date: string;
        reviewer: string;
        comment: string;
        progressSnapshot: number;
    }[];
}

export interface IEPPlan {
    id: string;
    studentId: string;
    startDate: string;
    endDate: string;
    goals: IEPGoal[];
    accommodations: string[]; // Sınav süresi uzatma, büyük punto vb.
    teamMembers: string[]; // Rehber öğretmen, sınıf öğretmeni vb.
    status: 'active' | 'archived' | 'draft';
}

// 2. FINANCIALS (Finansal Takip)
export interface Transaction {
    id: string;
    date: string;
    type: 'payment' | 'charge' | 'scholarship' | 'discount';
    amount: number;
    description: string;
    category: 'tuition' | 'materials' | 'food' | 'transport' | 'other';
    status: 'paid' | 'pending' | 'overdue' | 'cancelled';
    paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash';
}

export interface FinancialProfile {
    studentId: string;
    balance: number;
    currency: 'TRY' | 'USD' | 'EUR';
    scholarshipRate: number; // 0-100
    scholarshipType?: 'merit' | 'need_based' | 'sibling' | 'staff';
    transactions: Transaction[];
    paymentPlan: {
        dueDate: string;
        amount: number;
        isPaid: boolean;
    }[];
}

// 3. ATTENDANCE (Devamsızlık)
export interface AttendanceRecord {
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
}

// 4. PERFORMANCE (Notlar ve Değerlendirme)
export interface GradeEntry {
    id: string;
    subject: string;
    type: 'exam' | 'homework' | 'project' | 'participation';
    score: number;
    maxScore: number;
    date: string;
    weight: number; // Ağırlık katsayısı
    teacherFeedback?: string;
}

export interface PerformanceMetrics {
    gpa: number;
    subjectAverages: Record<string, number>;
    attendanceRate: number; // 0-100
    participationRate: number;
    homeworkCompletionRate: number;
}

// 5. BEHAVIOR & PORTFOLIO
export interface BehaviorIncident {
    id: string;
    date: string;
    type: 'positive' | 'negative' | 'neutral';
    category: 'participation' | 'respect' | 'responsibility' | 'safety';
    points: number; // + veya - puan
    description: string;
    reportedBy: string;
}

export interface PortfolioItem {
    id: string;
    title: string;
    type: 'image' | 'document' | 'video' | 'link';
    url: string;
    date: string;
    tags: string[];
    description?: string;
    isPublic: boolean; // Veli görebilir mi?
}

// --- MASTER EXTENDED STUDENT INTERFACE ---
export interface AdvancedStudent extends Student {
    // Basic extensions
    studentNumber?: string;
    classId?: string; // Sınıf/Şube ID
    enrollmentDate?: string;
    status: 'active' | 'graduated' | 'transferred' | 'suspended';
    
    // Modules
    iep?: IEPPlan;
    financials?: FinancialProfile;
    attendance?: AttendanceRecord[];
    grades?: GradeEntry[];
    behaviorLog?: BehaviorIncident[];
    portfolio?: PortfolioItem[];
    
    // Meta
    customFields?: Record<string, any>;
    lastUpdated?: string;
}

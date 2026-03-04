
export type EvaluationCategory = 
  | 'attention'      // Genel Gelişim ve Dikkat
  | 'reading'        // Okuma (Disleksi)
  | 'writing'        // Yazma (Disgrafi)
  | 'math'           // Matematik (Diskalkuli)
  | 'language'       // Dil ve İşitsel
  | 'motor_spatial'; // Organizasyon ve Motor

export interface Question {
  id: string;
  text: string;
  category: EvaluationCategory;
  weight: number; // 1.0 standard, 1.5 critical
  formType: 'parent' | 'teacher' | 'both';
}

export interface ScreeningResult {
  totalScore: number;
  categoryScores: Record<EvaluationCategory, {
    score: number;      // 0-100 normalized score
    rawScore: number;
    maxScore: number;
    riskLevel: 'low' | 'moderate' | 'high';
    riskLabel: string;
    findings: string[];
    color: string;
  }>;
  aiAnalysis?: string;
  generatedAt: string;
  studentName: string;
  respondentRole: 'parent' | 'teacher';
}

export interface ScreeningProfile {
    studentName: string;
    age: number;
    grade: string;
    respondent: 'parent' | 'teacher';
}

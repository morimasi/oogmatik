
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
  id: string;
  studentId: string;
  studentName: string;
  age: number;
  grade: string;
  date: Date;
  totalScore: number;
  overallScore: number; // Alias for totalScore
  riskLevel: 'low' | 'medium' | 'high';
  status: 'completed' | 'pending' | 'archived';
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  categoryScores: Record<EvaluationCategory, {
    score: number;      // 0-100 normalized score
    rawScore: number;
    maxScore: number;
    riskLevel: 'low' | 'moderate' | 'high';
    riskLabel: string;
    findings: string[];
    color: string;
  }>;
  detailedResults: {
    reading: number;
    writing: number;
    attention: number;
    memory: number;
    visual: number;
    auditory: number;
  };
  aiAnalysis?: string;
  generatedAt: string;
  respondentRole: 'parent' | 'teacher';
}

export interface ScreeningProfile {
    studentName: string;
    age: number;
    grade: string;
    respondent: 'parent' | 'teacher';
}

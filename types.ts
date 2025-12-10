
export * from './types/core';
export * from './types/math';
export * from './types/verbal';
export * from './types/visual';

// --- PROFESSIONAL ASSESSMENT TYPES ---

export type CognitiveDomain = 
    | 'visual_spatial_memory' // Görsel-Uzamsal Bellek
    | 'processing_speed'      // İşlemleme Hızı
    | 'selective_attention'   // Seçici Dikkat / İnhibisyon
    | 'phonological_loop'     // Fonolojik Döngü
    | 'logical_reasoning';    // Mantıksal Muhakeme

export interface SubTestResult {
    testId: CognitiveDomain;
    name: string;
    score: number; // 0-100 normalize edilmiş skor
    rawScore: number; // Ham doğru sayısı
    totalItems: number;
    avgReactionTime: number; // Milisaniye cinsinden ortalama tepki süresi
    accuracy: number; // Yüzde
    status: 'completed' | 'skipped' | 'aborted';
    timestamp: number;
}

export interface ClinicalObservation {
    anxietyLevel: 'low' | 'medium' | 'high';
    attentionSpan: 'focused' | 'distracted' | 'hyperactive';
    motorSkills: 'typical' | 'clumsy' | 'tremor';
    notes: string;
}

export interface AssessmentRoadmapItem {
    activityId: string; // ActivityType enum value
    title: string;
    reason: string;
    frequency: string;
    priority: 'high' | 'medium' | 'low';
}

export interface ProfessionalAssessmentReport {
    id: string;
    studentId: string;
    studentName: string;
    examinerId: string;
    date: string;
    duration: number; // Toplam saniye
    subTests: SubTestResult[];
    observations: ClinicalObservation;
    overallRiskAnalysis: {
        dyslexiaRisk: 'low' | 'moderate' | 'high';
        dyscalculiaRisk: 'low' | 'moderate' | 'high';
        attentionDeficitRisk: 'low' | 'moderate' | 'high';
        summary: string;
    };
    recommendations: string[];
    roadmap: AssessmentRoadmapItem[]; // Yeni eklenen akıllı rota
}

// Legacy compatibility for saved assessments
export interface SavedAssessment {
    id: string;
    userId: string;
    studentName: string;
    gender: 'Kız' | 'Erkek';
    age: number;
    grade: string;
    report: any; // Can be Legacy or Professional structure
    createdAt: string;
    sharedBy?: string;
    sharedByName?: string;
    sharedWith?: string;
}

export interface InteractiveTestItem {
    id: string;
    type: 'matrix' | 'stroop' | 'naming' | 'choice';
    stimulus: any; // Grid, Color, Text, Image
    target: any; // Correct answer
    timeout: number; // Max time allowed in ms
    distractors?: any[];
}

// --- CURRICULUM TYPES ---
export interface DailyPlan {
    day: number;
    focus: string; // e.g., "Görsel Dikkat", "Hece Farkındalığı"
    activities: {
        activityId: string;
        title: string;
        duration: number; // minutes
        goal: string;
    }[];
}

export interface Curriculum {
    id: string;
    studentName: string;
    grade: string;
    startDate: string;
    durationDays: number;
    goals: string[];
    schedule: DailyPlan[];
    note: string;
}

// --- OCR TYPES ---
export interface OCRResult {
    rawText: string;
    detectedType: 'worksheet' | 'text' | 'handwriting' | 'unknown';
    suggestedActivity?: string; // ActivityType
    structuredData?: any; // Converted data suitable for generators
}


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
}

export interface InteractiveTestItem {
    id: string;
    type: 'matrix' | 'stroop' | 'naming' | 'choice';
    stimulus: any; // Grid, Color, Text, Image
    target: any; // Correct answer
    timeout: number; // Max time allowed in ms
    distractors?: any[];
}

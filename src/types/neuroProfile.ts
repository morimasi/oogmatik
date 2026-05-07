/**
 * OOGMATIK — Neuro-Student Profile Types
 * 
 * 360° cognitive profile, learning DNA, and clinical tracking
 * Special education (Disleksi, Diskalkuli, DEHB) focused metrics
 */

/**
 * Cognitive Assessment Metrics
 */
export interface CognitiveProfile {
  // Processing Speed
  processingSpeed: {
    score: number; // 0-100
    percentile: number;
    lastAssessed: string;
    trend: 'improving' | 'stable' | 'declining';
  };
  
  // Working Memory
  workingMemory: {
    score: number;
    phonologicalLoop: number;
    visuospatialSketchpad: number;
    centralExecutive: number;
    lastAssessed: string;
  };
  
  // Attention
  attention: {
    score: number;
    sustained: number;
    selective: number;
    divided: number;
    adhdIndicators: boolean;
  };
  
  // Phonological Awareness
  phonologicalAwareness: {
    score: number;
    syllableSegmentation: number;
    phonemeIsolation: number;
    blending: number;
    manipulation: number;
  };
  
  // Visual Processing
  visualProcessing: {
    score: number;
    discrimination: number;
    memory: number;
    sequential: number;
    reversals: number; // b-d confusion frequency
  };
  
  // Reading Skills
  reading: {
    fluency: number;
    accuracy: number;
    comprehension: number;
    wordsPerMinute: number;
    gradeLevel: string;
  };
  
  // Math Skills
  math: {
    numberSense: number;
    calculation: number;
    problemSolving: number;
    dyscalculiaRisk: 'low' | 'moderate' | 'high';
  };
}

/**
 * Learning DNA Profile
 */
export interface LearningDNA {
  // Learning Style Preferences
  learningStyles: {
    visual: number; // 0-100
    auditory: number;
    kinesthetic: number;
    multisensory: number;
  };
  
  // Optimal Learning Conditions
  optimalConditions: {
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    sessionLength: number; // minutes
    breakFrequency: number; // minutes
    scaffoldingNeeded: boolean;
    preferStructured: boolean;
  };
  
  // Intervention Effectiveness
  interventionHistory: {
    intervention: string;
    startDate: string;
    endDate?: string;
    effectiveness: number; // 0-100
    outcome: 'successful' | 'partial' | 'unsuccessful';
  }[];
  
  // Strengths & Challenges
  strengths: string[];
  challenges: string[];
  accommodations: string[];
}

/**
 * Behavioral Analytics
 */
export interface BehavioralMetrics {
  // Engagement
  engagement: {
    averageSessionTime: number; // minutes
    completionRate: number; // percentage
    abandonRate: number;
    peakFocusTime: string;
  };
  
  // Error Patterns
  errorPatterns: {
    visualDiscrimination: number; // b-d, p-q errors
    sequencing: number; // order mistakes
    impulsivity: number; // quick answers without thinking
    memory: number; // forgetting learned content
  };
  
  // Progress Velocity
  progressVelocity: {
    weekly: number; // improvement rate
    monthly: number;
    trajectory: 'on-track' | 'behind' | 'ahead';
    plateauDetected: boolean;
    plateauDuration?: number; // weeks
  };
  
  // Motivation Indicators
  motivation: {
    intrinsic: number;
    extrinsic: number;
    rewardResponsive: boolean;
    frustrationTolerance: 'low' | 'medium' | 'high';
  };
}

/**
 * Clinical Observation Notes
 */
export interface ClinicalNote {
  id: string;
  studentId: string;
  date: string;
  observer: string; // Teacher/Clinician name
  category: 'behavior' | 'academic' | 'social' | 'cognitive' | 'motor';
  observation: string;
  severity?: 'mild' | 'moderate' | 'severe';
  followUp?: string;
  tags?: string[];
}

/**
 * BEP (Bireysel Eğitim Planı) / IEP
 */
export interface BEP {
  id: string;
  studentId: string;
  createdAt: string;
  createdBy: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  
  // SMART Goals
  goals: {
    domain: string; // Reading, Math, Attention, etc.
    objective: string; // Specific, Measurable
    baseline: number; // Current performance
    target: number; // Expected performance
    timeline: string; // By when
    strategies: string[]; // Intervention methods
    accommodations: string[];
    progress: number; // 0-100
  }[];
  
  // Assessment Schedule
  assessments: {
    type: string;
    scheduledDate: string;
    completedDate?: string;
    results?: unknown;
  }[];
  
  // Team Members
  team: {
    name: string;
    role: 'teacher' | 'parent' | 'clinician' | 'admin';
    email?: string;
  }[];
  
  // Review History
  reviews: {
    date: string;
    reviewer: string;
    notes: string;
    adjustments: string[];
  }[];
}

/**
 * Parent-Teacher-Clinician Bridge
 */
export interface CommunicationLog {
  id: string;
  studentId: string;
  date: string;
  participants: string[];
  type: 'meeting' | 'email' | 'phone' | 'report';
  topic: string;
  summary: string;
  actionItems?: string[];
  kvkkCompliant: boolean; // GDPR compliant
}

/**
 * Neuro-Student Profile (Complete)
 */
export interface NeuroStudentProfile {
  // Basic Info
  studentId: string;
  name: string;
  age: number;
  grade: string;
  
  // Clinical Data
  diagnosis: string[];
  cognitiveProfile: CognitiveProfile;
  learningDNA: LearningDNA;
  behavioralMetrics: BehavioralMetrics;
  
  // BEP/IEP
  activeBEP: BEP | null;
  bepHistory: BEP[];
  
  // Clinical Notes
  clinicalNotes: ClinicalNote[];
  
  // Communication
  communicationLog: CommunicationLog[];
  
  // Progress Tracking
  createdAt: string;
  lastUpdated: string;
  lastAssessment: string;
  nextAssessment: string;
}

/**
 * Learning Plateau Detection
 */
export interface PlateauAlert {
  studentId: string;
  detectedAt: string;
  metric: string; // What plateaued
  duration: number; // How long
  severity: 'warning' | 'critical';
  recommendation: string;
  remedialActions: string[];
}

/**
 * Early Warning System
 */
export interface EarlyWarning {
  studentId: string;
  riskType: 'plateau' | 'regression' | 'engagement_drop' | 'behavioral';
  detectedAt: string;
  confidence: number; // 0-100
  evidence: string[];
  suggestedIntervention: string;
  escalated: boolean;
}

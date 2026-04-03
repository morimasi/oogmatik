/**
 * Workbook AI Assistant — JSON Schema Tanimlari
 *
 * OOGMATIK JSON SCHEMA STANDARTLARI:
 * 1. type degerleri BUYUK HARF: 'OBJECT', 'ARRAY', 'STRING', 'NUMBER', 'BOOLEAN'
 * 2. required her zaman tanimli olmali
 * 3. Nullable alanlar icin nullable: true ekle
 * 4. Enum'lar Turkce, disleksi dostu
 *
 * @author Selin Arslan (AI Muhendisi)
 * @created 2026-04-02
 */

// ============================================================
// ENUM TANIMLARI
// ============================================================

export const DIFFICULTY_ENUM = ['Kolay', 'Orta', 'Zor'] as const;
export const VERDICT_ENUM = ['Mukemmel', 'Iyi', 'Iyilestirilebilir', 'Kritik'] as const;
export const SEVERITY_ENUM = ['low', 'medium', 'high'] as const;
export const AGE_GROUP_ENUM = ['5-7', '8-10', '11-13', '14+'] as const;
export const DIAGNOSIS_ENUM = ['dyslexia', 'dyscalculia', 'adhd', 'mixed'] as const;

// ============================================================
// JSON SCHEMA TANIMLARI
// ============================================================

export const WorkbookAISchemas = {
  // --------------------------------------------------------
  // 1. AKTIVITE ONERISI
  // --------------------------------------------------------
  activitySuggestion: {
    type: 'OBJECT',
    properties: {
      suggestions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            activityType: { type: 'STRING' },
            reason: { type: 'STRING' },
            recommendedDifficulty: {
              type: 'STRING',
              enum: ['Kolay', 'Orta', 'Zor'],
            },
            targetSkills: {
              type: 'ARRAY',
              items: { type: 'STRING' },
            },
            zpdJustification: { type: 'STRING' },
            priority: { type: 'NUMBER' },
          },
          required: ['activityType', 'reason', 'recommendedDifficulty', 'targetSkills'],
        },
      },
      analysisNote: { type: 'STRING' },
    },
    required: ['suggestions', 'analysisNote'],
  },

  // --------------------------------------------------------
  // 2. EKSIK BECERI TESPITI
  // --------------------------------------------------------
  skillGap: {
    type: 'OBJECT',
    properties: {
      gaps: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            skillArea: { type: 'STRING' },
            currentCoverage: { type: 'NUMBER' },
            recommendedCoverage: { type: 'NUMBER' },
            suggestedActivities: {
              type: 'ARRAY',
              items: { type: 'STRING' },
            },
          },
          required: ['skillArea', 'currentCoverage', 'recommendedCoverage'],
        },
      },
      overallBalance: { type: 'STRING' },
    },
    required: ['gaps', 'overallBalance'],
  },

  // --------------------------------------------------------
  // 3. SAYFA DENGESI ANALIZI
  // --------------------------------------------------------
  pageBalance: {
    type: 'OBJECT',
    properties: {
      overallScore: { type: 'NUMBER' },
      verdict: {
        type: 'STRING',
        enum: ['Mukemmel', 'Iyi', 'Iyilestirilebilir', 'Kritik'],
      },
      balanceIssues: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            pageIndex: { type: 'NUMBER' },
            issue: { type: 'STRING' },
            severity: {
              type: 'STRING',
              enum: ['low', 'medium', 'high'],
            },
            suggestion: { type: 'STRING' },
          },
          required: ['pageIndex', 'issue', 'severity', 'suggestion'],
        },
      },
      strengths: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      recommendations: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
    },
    required: ['overallScore', 'verdict', 'balanceIssues', 'strengths', 'recommendations'],
  },

  // --------------------------------------------------------
  // 4. ZORLUK DAGILIMI ANALIZI
  // --------------------------------------------------------
  difficultyDistribution: {
    type: 'OBJECT',
    properties: {
      distribution: {
        type: 'OBJECT',
        properties: {
          easy: { type: 'NUMBER' },
          medium: { type: 'NUMBER' },
          hard: { type: 'NUMBER' },
        },
        required: ['easy', 'medium', 'hard'],
      },
      scaffoldingScore: { type: 'NUMBER' },
      issues: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      recommendation: { type: 'STRING' },
    },
    required: ['distribution', 'scaffoldingScore', 'recommendation'],
  },

  // --------------------------------------------------------
  // 5. TEMA TUTARLILIGI
  // --------------------------------------------------------
  themeConsistency: {
    type: 'OBJECT',
    properties: {
      consistencyScore: { type: 'NUMBER' },
      detectedThemes: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      inconsistencies: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            pageIndex: { type: 'NUMBER' },
            issue: { type: 'STRING' },
          },
          required: ['pageIndex', 'issue'],
        },
      },
      suggestion: { type: 'STRING' },
    },
    required: ['consistencyScore', 'detectedThemes', 'suggestion'],
  },

  // --------------------------------------------------------
  // 6. METADATA TAMAMLAMA
  // --------------------------------------------------------
  metadataFill: {
    type: 'OBJECT',
    properties: {
      category: { type: 'STRING' },
      targetSkills: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      cognitiveDomain: { type: 'STRING' },
      estimatedDuration: { type: 'NUMBER' },
      prerequisites: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
      pedagogicalNote: { type: 'STRING' },
    },
    required: ['category', 'targetSkills', 'cognitiveDomain', 'pedagogicalNote'],
  },

  // --------------------------------------------------------
  // 7. PEDAGOJIK NOT
  // --------------------------------------------------------
  pedagogicalNote: {
    type: 'OBJECT',
    properties: {
      pedagogicalNote: { type: 'STRING' },
    },
    required: ['pedagogicalNote'],
  },

  // --------------------------------------------------------
  // 8. ONSOZ
  // --------------------------------------------------------
  preface: {
    type: 'OBJECT',
    properties: {
      preface: { type: 'STRING' },
    },
    required: ['preface'],
  },

  // --------------------------------------------------------
  // 9. SIRALAMA OPTIMIZASYONU
  // --------------------------------------------------------
  sequenceOptimization: {
    type: 'OBJECT',
    properties: {
      optimizedOrder: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            originalIndex: { type: 'NUMBER' },
            newIndex: { type: 'NUMBER' },
            reason: { type: 'STRING' },
          },
          required: ['originalIndex', 'newIndex'],
        },
      },
      improvementScore: { type: 'NUMBER' },
      pedagogicalRationale: { type: 'STRING' },
    },
    required: ['optimizedOrder', 'improvementScore', 'pedagogicalRationale'],
  },

  // --------------------------------------------------------
  // 10. BATCH PEDAGOJIK NOT (5'li grup)
  // --------------------------------------------------------
  batchPedagogicalNotes: {
    type: 'OBJECT',
    properties: {
      notes: {
        type: 'ARRAY',
        items: { type: 'STRING' },
      },
    },
    required: ['notes'],
  },
};

// ============================================================
// TYPE EXPORTS
// ============================================================

export type Difficulty = (typeof DIFFICULTY_ENUM)[number];
export type Verdict = (typeof VERDICT_ENUM)[number];
export type Severity = (typeof SEVERITY_ENUM)[number];
export type AgeGroup = (typeof AGE_GROUP_ENUM)[number];
export type Diagnosis = (typeof DIAGNOSIS_ENUM)[number];

export interface ActivitySuggestion {
  activityType: string;
  reason: string;
  recommendedDifficulty: Difficulty;
  targetSkills: string[];
  zpdJustification?: string;
  priority?: number;
}

export interface ActivitySuggestionResponse {
  suggestions: ActivitySuggestion[];
  analysisNote: string;
}

export interface SkillGap {
  skillArea: string;
  currentCoverage: number;
  recommendedCoverage: number;
  suggestedActivities?: string[];
}

export interface SkillGapResponse {
  gaps: SkillGap[];
  overallBalance: string;
}

export interface BalanceIssue {
  pageIndex: number;
  issue: string;
  severity: Severity;
  suggestion: string;
}

export interface PageBalanceResponse {
  overallScore: number;
  verdict: Verdict;
  balanceIssues: BalanceIssue[];
  strengths: string[];
  recommendations: string[];
}

export interface DifficultyDistributionResponse {
  distribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  scaffoldingScore: number;
  issues?: string[];
  recommendation: string;
}

export interface ThemeInconsistency {
  pageIndex: number;
  issue: string;
}

export interface ThemeConsistencyResponse {
  consistencyScore: number;
  detectedThemes: string[];
  inconsistencies: ThemeInconsistency[];
  suggestion: string;
}

export interface MetadataFillResponse {
  category: string;
  targetSkills: string[];
  cognitiveDomain: string;
  estimatedDuration?: number;
  prerequisites?: string[];
  pedagogicalNote: string;
}

export interface SequenceChange {
  originalIndex: number;
  newIndex: number;
  reason?: string;
}

export interface SequenceOptimizationResponse {
  optimizedOrder: SequenceChange[];
  improvementScore: number;
  pedagogicalRationale: string;
}

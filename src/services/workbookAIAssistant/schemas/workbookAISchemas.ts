/**
 * Workbook AI Assistant — JSON Schema Tanimlari
 *
 * BDMIND JSON SCHEMA STANDARTLARI:
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
        description: 'Önerilen aktiviteler listesi',
        items: {
          type: 'OBJECT',
          properties: {
            activityType: { type: 'STRING', description: 'Aktivite türü adı' },
            reason: { type: 'STRING', description: 'Öneri gerekçesi' },
            recommendedDifficulty: {
              type: 'STRING',
              description: 'Önerilen zorluk seviyesi',
              enum: ['Kolay', 'Orta', 'Zor'],
            },
            targetSkills: {
              type: 'ARRAY',
              description: 'Hedef beceriler',
              items: { type: 'STRING' },
            },
            zpdJustification: { type: 'STRING', description: 'ZPD gerekçesi' },
            priority: { type: 'NUMBER', description: 'Öncelik sırası' },
          },
          required: ['activityType', 'reason', 'recommendedDifficulty', 'targetSkills'],
        },
      },
      analysisNote: { type: 'STRING', description: 'Genel analiz notu' },
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
        description: 'Tespit edilen beceri boşlukları',
        items: {
          type: 'OBJECT',
          properties: {
            skillArea: { type: 'STRING', description: 'Beceri alanı adı' },
            currentCoverage: { type: 'NUMBER', description: 'Mevcut kapsama oranı' },
            recommendedCoverage: { type: 'NUMBER', description: 'Hedef kapsama oranı' },
            suggestedActivities: {
              type: 'ARRAY',
              description: 'Önerilen aktiviteler',
              items: { type: 'STRING' },
            },
          },
          required: ['skillArea', 'currentCoverage', 'recommendedCoverage'],
        },
      },
      overallBalance: { type: 'STRING', description: 'Genel beceri dengesi değerlendirmesi' },
    },
    required: ['gaps', 'overallBalance'],
  },

  // --------------------------------------------------------
  // 3. SAYFA DENGESI ANALIZI
  // --------------------------------------------------------
  pageBalance: {
    type: 'OBJECT',
    properties: {
      overallScore: { type: 'NUMBER', description: 'Genel denge puanı (0-100)' },
      verdict: {
        type: 'STRING',
        description: 'Denge değerlendirme kararı',
        enum: ['Mukemmel', 'Iyi', 'Iyilestirilebilir', 'Kritik'],
      },
      balanceIssues: {
        type: 'ARRAY',
        description: 'Denge sorunları listesi',
        items: {
          type: 'OBJECT',
          properties: {
            pageIndex: { type: 'NUMBER', description: 'Sayfa indeksi' },
            issue: { type: 'STRING', description: 'Sorun açıklaması' },
            severity: {
              type: 'STRING',
              description: 'Sorun şiddeti',
              enum: ['low', 'medium', 'high'],
            },
            suggestion: { type: 'STRING', description: 'Çözüm önerisi' },
          },
          required: ['pageIndex', 'issue', 'severity', 'suggestion'],
        },
      },
      strengths: {
        type: 'ARRAY',
        description: 'Güçlü yönler',
        items: { type: 'STRING' },
      },
      recommendations: {
        type: 'ARRAY',
        description: 'İyileştirme önerileri',
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
        description: 'Zorluk seviyesi dağılımı',
        properties: {
          easy: { type: 'NUMBER', description: 'Kolay aktivite yüzdesi' },
          medium: { type: 'NUMBER', description: 'Orta aktivite yüzdesi' },
          hard: { type: 'NUMBER', description: 'Zor aktivite yüzdesi' },
        },
        required: ['easy', 'medium', 'hard'],
      },
      scaffoldingScore: { type: 'NUMBER', description: 'İskeleleme puanı (0-100)' },
      issues: {
        type: 'ARRAY',
        description: 'Dağılım sorunları',
        items: { type: 'STRING' },
      },
      recommendation: { type: 'STRING', description: 'Dağılım iyileştirme önerisi' },
    },
    required: ['distribution', 'scaffoldingScore', 'recommendation'],
  },

  // --------------------------------------------------------
  // 5. TEMA TUTARLILIGI
  // --------------------------------------------------------
  themeConsistency: {
    type: 'OBJECT',
    properties: {
      consistencyScore: { type: 'NUMBER', description: 'Tema tutarlılık puanı (0-100)' },
      detectedThemes: {
        type: 'ARRAY',
        description: 'Tespit edilen temalar',
        items: { type: 'STRING' },
      },
      inconsistencies: {
        type: 'ARRAY',
        description: 'Tema tutarsızlıkları',
        items: {
          type: 'OBJECT',
          properties: {
            pageIndex: { type: 'NUMBER', description: 'Sayfa indeksi' },
            issue: { type: 'STRING', description: 'Tutarsızlık açıklaması' },
          },
          required: ['pageIndex', 'issue'],
        },
      },
      suggestion: { type: 'STRING', description: 'Tutarlılık iyileştirme önerisi' },
    },
    required: ['consistencyScore', 'detectedThemes', 'suggestion'],
  },

  // --------------------------------------------------------
  // 6. METADATA TAMAMLAMA
  // --------------------------------------------------------
  metadataFill: {
    type: 'OBJECT',
    properties: {
      category: { type: 'STRING', description: 'Aktivite kategorisi' },
      targetSkills: {
        type: 'ARRAY',
        description: 'Hedef beceriler',
        items: { type: 'STRING' },
      },
      cognitiveDomain: { type: 'STRING', description: 'Bilişsel alan adı' },
      estimatedDuration: { type: 'NUMBER', description: 'Tahmini süre (dakika)' },
      prerequisites: {
        type: 'ARRAY',
        description: 'Ön koşul beceriler',
        items: { type: 'STRING' },
      },
      pedagogicalNote: { type: 'STRING', description: 'Pedagojik amaç açıklaması' },
    },
    required: ['category', 'targetSkills', 'cognitiveDomain', 'pedagogicalNote'],
  },

  // --------------------------------------------------------
  // 7. PEDAGOJIK NOT
  // --------------------------------------------------------
  pedagogicalNote: {
    type: 'OBJECT',
    properties: {
      pedagogicalNote: { type: 'STRING', description: 'Etkinliğin pedagojik amacı ve gerekçesi' },
    },
    required: ['pedagogicalNote'],
  },

  // --------------------------------------------------------
  // 8. ONSOZ
  // --------------------------------------------------------
  preface: {
    type: 'OBJECT',
    properties: {
      preface: { type: 'STRING', description: 'Önsöz metni' },
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
        description: 'Optimize edilmiş sıralama',
        items: {
          type: 'OBJECT',
          properties: {
            originalIndex: { type: 'NUMBER', description: 'Orijinal sıra indeksi' },
            newIndex: { type: 'NUMBER', description: 'Yeni sıra indeksi' },
            reason: { type: 'STRING', description: 'Değişiklik gerekçesi' },
          },
          required: ['originalIndex', 'newIndex'],
        },
      },
      improvementScore: { type: 'NUMBER', description: 'İyileştirme puanı (0-100)' },
      pedagogicalRationale: { type: 'STRING', description: 'Pedagojik gerekçe açıklaması' },
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
        description: 'Pedagojik not listesi (5 adet)',
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

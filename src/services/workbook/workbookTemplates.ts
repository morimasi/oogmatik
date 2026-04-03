/**
 * OOGMATIK — Workbook Templates Service
 *
 * 12 Premium Workbook Templates (Pedagojik olarak Elif Yıldız onaylı)
 *
 * @module services/workbook/workbookTemplates
 * @version 2.0.0
 * @author Elif Yıldız (Özel Öğrenme Uzmanı) + Bora Demir (Yazılım Mühendisi)
 *
 * PEDAGOJIK KURALLAR:
 * - Her şablonda ilk aktivite MUTLAKA kolay (güven inşası)
 * - ZPD uyumlu zorluk dağılımı
 * - pedagogicalNote her aktivitede ZORUNLU
 * - Age group uyumu kontrol edilmeli
 */

import type {
  WorkbookTemplate,
  WorkbookTemplateType,
  WorkbookTheme,
  LearningDisabilityProfile,
  AgeGroup,
} from '../../types/workbook';
import { ActivityType } from '../../types/activity';
import { AppError } from '../../utils/AppError';

// ============================================================================
// 12 PREMIUM TEMPLATES (ELİF YILDIZ ONAYLı)
// ============================================================================

/**
 * Tüm premium template'leri döndür
 */
export function getAllTemplates(): WorkbookTemplate[] {
  return [
    TEMPLATE_ACADEMIC_STANDARD,
    TEMPLATE_DYSLEXIA_FRIENDLY,
    TEMPLATE_DYSCALCULIA_SUPPORT,
    TEMPLATE_ADHD_FOCUS,
    TEMPLATE_EXAM_PREP,
    TEMPLATE_SKILL_PRACTICE,
    TEMPLATE_ASSESSMENT_PORTFOLIO,
    TEMPLATE_BEP_ALIGNED,
    TEMPLATE_CREATIVE_JOURNAL,
    TEMPLATE_PROGRESS_TRACKER,
    TEMPLATE_MULTI_SUBJECT,
    TEMPLATE_CUSTOM,
  ];
}

/**
 * Template ID ile getir
 */
export function getTemplateById(templateId: string): WorkbookTemplate {
  const template = getAllTemplates().find((t) => t.id === templateId);
  if (!template) {
    throw new AppError(
      'Şablon bulunamadı',
      'TEMPLATE_NOT_FOUND',
      404,
      { templateId }
    );
  }
  return template;
}

/**
 * Template type'a göre getir
 */
export function getTemplateByType(
  type: WorkbookTemplateType
): WorkbookTemplate {
  const template = getAllTemplates().find((t) => t.type === type);
  if (!template) {
    throw new AppError(
      'Şablon tipi bulunamadı',
      'TEMPLATE_TYPE_NOT_FOUND',
      404,
      { type }
    );
  }
  return template;
}

/**
 * Profile göre önerilen template'leri getir
 */
export function getRecommendedTemplates(
  profile: LearningDisabilityProfile,
  ageGroup: AgeGroup
): WorkbookTemplate[] {
  return getAllTemplates().filter(
    (t) => t.targetProfile === profile && t.ageGroup === ageGroup
  );
}

// ============================================================================
// TEMPLATE 1: ACADEMIC STANDARD
// ============================================================================

const TEMPLATE_ACADEMIC_STANDARD: WorkbookTemplate = {
  id: 'academic-standard-001',
  name: 'Standart Akademik Kitapçık',
  type: 'academic-standard',
  description:
    'Geleneksel akademik çalışma kitapçığı. Tüm dersler için uygun, standart zorluk dağılımı.',

  // Pedagojik yapılandırma
  targetProfile: 'mixed',
  ageGroup: '8-10',
  recommendedActivityCount: 25,
  difficultyDistribution: {
    kolay: 40,
    orta: 40,
    zor: 20,
  },

  // Görsel tasarım
  theme: 'academic',
  coverDesign: {
    backgroundColor: '#f8f9fa',
    textColor: '#212529',
    borderStyle: 'simple',
    illustration: 'educational',
    logoPosition: 'top-left',
  },
  pageLayout: {
    columns: 1,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    headerHeight: 10,
    footerHeight: 10,
    gutterWidth: 10,
  },

  // İçerik yapısı
  sections: [
    {
      title: 'Matematik',
      activityTypes: [
        ActivityType.MATH_BASIC_OPERATIONS,
        ActivityType.MATH_WORD_PROBLEMS,
        ActivityType.MATH_GEOMETRY,
      ],
      minActivities: 5,
      maxActivities: 10,
      allowCustomActivities: true,
    },
    {
      title: 'Türkçe',
      activityTypes: [
        ActivityType.READING_COMPREHENSION,
        ActivityType.GRAMMAR_EXERCISE,
        ActivityType.VOCABULARY_BUILDING,
      ],
      minActivities: 5,
      maxActivities: 10,
      allowCustomActivities: true,
    },
    {
      title: 'Genel Beceriler',
      activityTypes: [
        ActivityType.LOGIC_PUZZLE,
        ActivityType.PATTERN_RECOGNITION,
        ActivityType.VISUAL_PERCEPTION,
      ],
      minActivities: 3,
      maxActivities: 8,
      allowCustomActivities: true,
    },
  ],
  includeTableOfContents: true,
  includeDividerPages: true,
  includeAnswerKey: true,

  // Metadata
  isPremium: false,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.5,
};

// ============================================================================
// TEMPLATE 2: DYSLEXIA FRIENDLY
// ============================================================================

const TEMPLATE_DYSLEXIA_FRIENDLY: WorkbookTemplate = {
  id: 'dyslexia-friendly-001',
  name: 'Disleksi Dostu Kitapçık',
  type: 'dyslexia-friendly',
  description:
    'Disleksi desteğine ihtiyaç duyan öğrenciler için optimize edilmiş. Lexend font, geniş satır aralığı, hece vurgulama.',

  targetProfile: 'dyslexia',
  ageGroup: '8-10',
  recommendedActivityCount: 20,
  difficultyDistribution: {
    kolay: 50, // Daha fazla kolay aktivite (güven inşası)
    orta: 35,
    zor: 15,
  },

  theme: 'playful',
  coverDesign: {
    backgroundColor: '#fff8e1',
    textColor: '#212529',
    borderStyle: 'decorative',
    illustration: 'playful',
    logoPosition: 'center',
  },
  pageLayout: {
    columns: 1,
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 25,
    marginRight: 25,
    headerHeight: 15,
    footerHeight: 15,
    gutterWidth: 0,
  },

  sections: [
    {
      title: 'Okuma Alıştırmaları',
      activityTypes: [
        ActivityType.DYSLEXIA_SYLLABLE_BREAK,
        ActivityType.DYSLEXIA_WORD_RECOGNITION,
        ActivityType.READING_COMPREHENSION,
      ],
      minActivities: 8,
      maxActivities: 12,
      allowCustomActivities: true,
    },
    {
      title: 'Kelime Oyunları',
      activityTypes: [
        ActivityType.WORD_SEARCH,
        ActivityType.ANAGRAM_PUZZLE,
        ActivityType.VOCABULARY_BUILDING,
      ],
      minActivities: 5,
      maxActivities: 8,
      allowCustomActivities: true,
    },
  ],
  includeTableOfContents: true,
  includeDividerPages: false,
  includeAnswerKey: true,

  isPremium: true,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.9,
};

// ============================================================================
// TEMPLATE 3: DYSCALCULIA SUPPORT
// ============================================================================

const TEMPLATE_DYSCALCULIA_SUPPORT: WorkbookTemplate = {
  id: 'dyscalculia-support-001',
  name: 'Diskalkuli Destek Kitapçığı',
  type: 'dyscalculia-support',
  description:
    'Sayı algısı ve matematik desteği için özel tasarlanmış. Görsel araçlar, somut modeller, adım adım çözüm.',

  targetProfile: 'dyscalculia',
  ageGroup: '8-10',
  recommendedActivityCount: 22,
  difficultyDistribution: {
    kolay: 45,
    orta: 40,
    zor: 15,
  },

  theme: 'geometric',
  coverDesign: {
    backgroundColor: '#e3f2fd',
    textColor: '#01579b',
    borderStyle: 'geometric',
    illustration: 'abstract',
    logoPosition: 'top-right',
  },
  pageLayout: {
    columns: 1,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 22,
    marginRight: 22,
    headerHeight: 12,
    footerHeight: 12,
    gutterWidth: 0,
  },

  sections: [
    {
      title: 'Sayı Duyusu',
      activityTypes: [
        ActivityType.DYSCALCULIA_NUMBER_SENSE,
        ActivityType.DYSCALCULIA_MAGNITUDE_COMPARISON,
        ActivityType.MATH_BASIC_OPERATIONS,
      ],
      minActivities: 8,
      maxActivities: 12,
      allowCustomActivities: true,
    },
    {
      title: 'Görsel Matematik',
      activityTypes: [
        ActivityType.MATH_GEOMETRY,
        ActivityType.PATTERN_RECOGNITION,
        ActivityType.VISUAL_PERCEPTION,
      ],
      minActivities: 6,
      maxActivities: 10,
      allowCustomActivities: true,
    },
  ],
  includeTableOfContents: true,
  includeDividerPages: true,
  includeAnswerKey: true,

  isPremium: true,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.8,
};

// ============================================================================
// TEMPLATE 4: ADHD FOCUS
// ============================================================================

const TEMPLATE_ADHD_FOCUS: WorkbookTemplate = {
  id: 'adhd-focus-001',
  name: 'DEHB Odak Artırıcı Kitapçık',
  type: 'adhd-focus',
  description:
    'DEHB desteğine ihtiyaç duyan öğrenciler için kısa, odak artırıcı aktiviteler. Çeşitlilik, görsel net, hızlı tamamlanabilir.',

  targetProfile: 'adhd',
  ageGroup: '8-10',
  recommendedActivityCount: 30,
  difficultyDistribution: {
    kolay: 40,
    orta: 50,
    zor: 10,
  },

  theme: 'cyber',
  coverDesign: {
    backgroundColor: '#1a1a2e',
    textColor: '#ffffff',
    borderStyle: 'geometric',
    illustration: 'abstract',
    logoPosition: 'bottom',
  },
  pageLayout: {
    columns: 1,
    marginTop: 18,
    marginBottom: 18,
    marginLeft: 18,
    marginRight: 18,
    headerHeight: 8,
    footerHeight: 8,
    gutterWidth: 0,
  },

  sections: [
    {
      title: 'Hızlı Aktiviteler',
      activityTypes: [
        ActivityType.ATTENTION_FOCUS,
        ActivityType.MEMORY_GAME,
        ActivityType.QUICK_RECALL,
      ],
      minActivities: 10,
      maxActivities: 15,
      allowCustomActivities: true,
    },
    {
      title: 'Bulmaca ve Oyunlar',
      activityTypes: [
        ActivityType.LOGIC_PUZZLE,
        ActivityType.PATTERN_RECOGNITION,
        ActivityType.WORD_SEARCH,
      ],
      minActivities: 8,
      maxActivities: 12,
      allowCustomActivities: true,
    },
  ],
  includeTableOfContents: false,
  includeDividerPages: false,
  includeAnswerKey: false,

  isPremium: true,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.7,
};

// ============================================================================
// TEMPLATE 5: EXAM PREP
// ============================================================================

const TEMPLATE_EXAM_PREP: WorkbookTemplate = {
  id: 'exam-prep-001',
  name: 'Sınav Hazırlık Kitapçığı',
  type: 'exam-prep',
  description:
    'LGS, PISA ve okul sınavlarına hazırlık. Gerçek sınav formatında sorular, zaman yönetimi.',

  targetProfile: 'mixed',
  ageGroup: '11-13',
  recommendedActivityCount: 40,
  difficultyDistribution: {
    kolay: 25,
    orta: 50,
    zor: 25,
  },

  theme: 'modern',
  coverDesign: {
    backgroundColor: '#ffffff',
    textColor: '#212529',
    borderStyle: 'simple',
    illustration: 'educational',
    logoPosition: 'top-left',
  },
  pageLayout: {
    columns: 1,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    headerHeight: 10,
    footerHeight: 10,
    gutterWidth: 0,
  },

  sections: [
    {
      title: 'Matematik Deneme',
      activityTypes: [
        ActivityType.MATH_BASIC_OPERATIONS,
        ActivityType.MATH_WORD_PROBLEMS,
        ActivityType.MATH_GEOMETRY,
        ActivityType.MATH_ALGEBRA,
      ],
      minActivities: 15,
      maxActivities: 20,
      allowCustomActivities: false,
    },
    {
      title: 'Türkçe Deneme',
      activityTypes: [
        ActivityType.READING_COMPREHENSION,
        ActivityType.GRAMMAR_EXERCISE,
        ActivityType.TEXT_ANALYSIS,
      ],
      minActivities: 10,
      maxActivities: 15,
      allowCustomActivities: false,
    },
    {
      title: 'Fen Bilimleri',
      activityTypes: [
        ActivityType.SCIENCE_EXPERIMENT,
        ActivityType.LOGIC_REASONING,
      ],
      minActivities: 5,
      maxActivities: 10,
      allowCustomActivities: false,
    },
  ],
  includeTableOfContents: true,
  includeDividerPages: true,
  includeAnswerKey: true,

  isPremium: true,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.8,
};

// ============================================================================
// TEMPLATE 6: SKILL PRACTICE
// ============================================================================

const TEMPLATE_SKILL_PRACTICE: WorkbookTemplate = {
  id: 'skill-practice-001',
  name: 'Beceri Pratiği Kitapçığı',
  type: 'skill-practice',
  description:
    'Belirli bir beceriyi (örn: çarpım tablosu, okuma akıcılığı) yoğun pratik yapma.',

  targetProfile: 'mixed',
  ageGroup: '8-10',
  recommendedActivityCount: 35,
  difficultyDistribution: {
    kolay: 35,
    orta: 45,
    zor: 20,
  },

  theme: 'minimal',
  coverDesign: {
    backgroundColor: '#fafafa',
    textColor: '#424242',
    borderStyle: 'simple',
    logoPosition: 'center',
  },
  pageLayout: {
    columns: 2,
    marginTop: 18,
    marginBottom: 18,
    marginLeft: 18,
    marginRight: 18,
    headerHeight: 8,
    footerHeight: 8,
    gutterWidth: 12,
  },

  sections: [
    {
      title: 'Temel Pratik',
      activityTypes: [
        ActivityType.MATH_BASIC_OPERATIONS,
        ActivityType.VOCABULARY_BUILDING,
        ActivityType.SPELLING_PRACTICE,
      ],
      minActivities: 15,
      maxActivities: 20,
      allowCustomActivities: true,
    },
    {
      title: 'İleri Pratik',
      activityTypes: [
        ActivityType.MATH_WORD_PROBLEMS,
        ActivityType.READING_COMPREHENSION,
        ActivityType.WRITING_PROMPT,
      ],
      minActivities: 10,
      maxActivities: 15,
      allowCustomActivities: true,
    },
  ],
  includeTableOfContents: false,
  includeDividerPages: false,
  includeAnswerKey: true,

  isPremium: false,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.6,
};

// ============================================================================
// TEMPLATE 7: ASSESSMENT PORTFOLIO
// ============================================================================

const TEMPLATE_ASSESSMENT_PORTFOLIO: WorkbookTemplate = {
  id: 'assessment-portfolio-001',
  name: 'Değerlendirme Portfolyosu',
  type: 'assessment-portfolio',
  description:
    'Öğrenci gelişimini izlemek için periyodik değerlendirme aktiviteleri.',

  targetProfile: 'mixed',
  ageGroup: '8-10',
  recommendedActivityCount: 18,
  difficultyDistribution: {
    kolay: 30,
    orta: 40,
    zor: 30,
  },

  theme: 'academic',
  coverDesign: {
    backgroundColor: '#e8f5e9',
    textColor: '#2e7d32',
    borderStyle: 'decorative',
    illustration: 'educational',
    logoPosition: 'top-left',
  },
  pageLayout: {
    columns: 1,
    marginTop: 22,
    marginBottom: 22,
    marginLeft: 22,
    marginRight: 22,
    headerHeight: 12,
    footerHeight: 12,
    gutterWidth: 0,
  },

  sections: [
    {
      title: 'Ön Değerlendirme',
      activityTypes: [
        ActivityType.DIAGNOSTIC_TEST,
        ActivityType.SKILL_ASSESSMENT,
      ],
      minActivities: 5,
      maxActivities: 8,
      allowCustomActivities: false,
    },
    {
      title: 'Gelişim Takibi',
      activityTypes: [
        ActivityType.PROGRESS_MONITORING,
        ActivityType.SELF_ASSESSMENT,
      ],
      minActivities: 5,
      maxActivities: 8,
      allowCustomActivities: false,
    },
  ],
  includeTableOfContents: true,
  includeDividerPages: true,
  includeAnswerKey: false,

  isPremium: true,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.7,
};

// ============================================================================
// TEMPLATE 8: BEP ALIGNED
// ============================================================================

const TEMPLATE_BEP_ALIGNED: WorkbookTemplate = {
  id: 'bep-aligned-001',
  name: 'BEP Uyumlu Kitapçık',
  type: 'bep-aligned',
  description:
    'Bireyselleştirilmiş Eğitim Programı hedeflerine uyumlu aktiviteler. SMART hedef takibi.',

  targetProfile: 'mixed',
  ageGroup: '8-10',
  recommendedActivityCount: 20,
  difficultyDistribution: {
    kolay: 40,
    orta: 40,
    zor: 20,
  },

  theme: 'nature',
  coverDesign: {
    backgroundColor: '#f1f8e9',
    textColor: '#33691e',
    borderStyle: 'decorative',
    illustration: 'nature',
    logoPosition: 'top-right',
  },
  pageLayout: {
    columns: 1,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    headerHeight: 10,
    footerHeight: 10,
    gutterWidth: 0,
  },

  sections: [
    {
      title: 'BEP Hedef 1',
      activityTypes: [], // Dinamik — BEP hedefine göre seçilir
      minActivities: 5,
      maxActivities: 10,
      allowCustomActivities: true,
    },
    {
      title: 'BEP Hedef 2',
      activityTypes: [],
      minActivities: 5,
      maxActivities: 10,
      allowCustomActivities: true,
    },
  ],
  includeTableOfContents: true,
  includeDividerPages: true,
  includeAnswerKey: false,

  isPremium: true,
  isPublic: false, // BEP özel — public paylaşım yasak (KVKV)
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 5.0,
};

// ============================================================================
// TEMPLATE 9: CREATIVE JOURNAL
// ============================================================================

const TEMPLATE_CREATIVE_JOURNAL: WorkbookTemplate = {
  id: 'creative-journal-001',
  name: 'Yaratıcı Günlük',
  type: 'creative-journal',
  description:
    'Serbest yazma, çizim, yaratıcı ifade için alan. Haftalık/aylık yansıtma.',

  targetProfile: 'mixed',
  ageGroup: '8-10',
  recommendedActivityCount: 15,
  difficultyDistribution: {
    kolay: 60,
    orta: 30,
    zor: 10,
  },

  theme: 'artistic',
  coverDesign: {
    backgroundColor: '#fce4ec',
    textColor: '#880e4f',
    borderStyle: 'decorative',
    illustration: 'playful',
    logoPosition: 'center',
  },
  pageLayout: {
    columns: 1,
    marginTop: 25,
    marginBottom: 25,
    marginLeft: 25,
    marginRight: 25,
    headerHeight: 15,
    footerHeight: 15,
    gutterWidth: 0,
  },

  sections: [
    {
      title: 'Yazma Alanı',
      activityTypes: [
        ActivityType.WRITING_PROMPT,
        ActivityType.CREATIVE_WRITING,
        ActivityType.STORY_STARTER,
      ],
      minActivities: 8,
      maxActivities: 12,
      allowCustomActivities: true,
    },
    {
      title: 'Görsel İfade',
      activityTypes: [
        ActivityType.DRAWING_EXERCISE,
        ActivityType.COLLAGE_ACTIVITY,
      ],
      minActivities: 3,
      maxActivities: 6,
      allowCustomActivities: true,
    },
  ],
  includeTableOfContents: false,
  includeDividerPages: false,
  includeAnswerKey: false,

  isPremium: false,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.6,
};

// ============================================================================
// TEMPLATE 10: PROGRESS TRACKER
// ============================================================================

const TEMPLATE_PROGRESS_TRACKER: WorkbookTemplate = {
  id: 'progress-tracker-001',
  name: 'İlerleme Takip Kitapçığı',
  type: 'progress-tracker',
  description:
    'Haftalık/aylık hedef takibi, öz değerlendirme, motivasyon aktiviteleri.',

  targetProfile: 'mixed',
  ageGroup: '8-10',
  recommendedActivityCount: 12,
  difficultyDistribution: {
    kolay: 50,
    orta: 40,
    zor: 10,
  },

  theme: 'space',
  coverDesign: {
    backgroundColor: '#1a237e',
    textColor: '#ffffff',
    borderStyle: 'geometric',
    illustration: 'space',
    logoPosition: 'bottom',
  },
  pageLayout: {
    columns: 1,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    headerHeight: 10,
    footerHeight: 10,
    gutterWidth: 0,
  },

  sections: [
    {
      title: 'Hedefler',
      activityTypes: [
        ActivityType.GOAL_SETTING,
        ActivityType.PROGRESS_MONITORING,
      ],
      minActivities: 4,
      maxActivities: 6,
      allowCustomActivities: false,
    },
    {
      title: 'Yansıtma',
      activityTypes: [
        ActivityType.SELF_ASSESSMENT,
        ActivityType.REFLECTION_PROMPT,
      ],
      minActivities: 4,
      maxActivities: 6,
      allowCustomActivities: false,
    },
  ],
  includeTableOfContents: false,
  includeDividerPages: false,
  includeAnswerKey: false,

  isPremium: true,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.8,
};

// ============================================================================
// TEMPLATE 11: MULTI-SUBJECT
// ============================================================================

const TEMPLATE_MULTI_SUBJECT: WorkbookTemplate = {
  id: 'multi-subject-001',
  name: 'Çok Dersli Kitapçık',
  type: 'multi-subject',
  description:
    'Matematik, Türkçe, Fen, Sosyal dengelenerek birden fazla ders.',

  targetProfile: 'mixed',
  ageGroup: '8-10',
  recommendedActivityCount: 40,
  difficultyDistribution: {
    kolay: 35,
    orta: 45,
    zor: 20,
  },

  theme: 'modern',
  coverDesign: {
    backgroundColor: '#ffffff',
    textColor: '#212529',
    borderStyle: 'simple',
    illustration: 'educational',
    logoPosition: 'top-left',
  },
  pageLayout: {
    columns: 1,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    headerHeight: 10,
    footerHeight: 10,
    gutterWidth: 0,
  },

  sections: [
    {
      title: 'Matematik',
      activityTypes: [ActivityType.MATH_BASIC_OPERATIONS, ActivityType.MATH_WORD_PROBLEMS],
      minActivities: 10,
      maxActivities: 12,
      allowCustomActivities: true,
    },
    {
      title: 'Türkçe',
      activityTypes: [ActivityType.READING_COMPREHENSION, ActivityType.GRAMMAR_EXERCISE],
      minActivities: 10,
      maxActivities: 12,
      allowCustomActivities: true,
    },
    {
      title: 'Fen Bilimleri',
      activityTypes: [ActivityType.SCIENCE_EXPERIMENT, ActivityType.OBSERVATION_TASK],
      minActivities: 5,
      maxActivities: 8,
      allowCustomActivities: true,
    },
    {
      title: 'Sosyal Bilgiler',
      activityTypes: [ActivityType.HISTORY_TIMELINE, ActivityType.MAP_READING],
      minActivities: 5,
      maxActivities: 8,
      allowCustomActivities: true,
    },
  ],
  includeTableOfContents: true,
  includeDividerPages: true,
  includeAnswerKey: true,

  isPremium: false,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.7,
};

// ============================================================================
// TEMPLATE 12: CUSTOM
// ============================================================================

const TEMPLATE_CUSTOM: WorkbookTemplate = {
  id: 'custom-001',
  name: 'Özel Tasarım Kitapçık',
  type: 'custom',
  description:
    'Tamamen özelleştirilebilir boş şablon. Tüm ayarlar kullanıcı kontrolünde.',

  targetProfile: 'mixed',
  ageGroup: '8-10',
  recommendedActivityCount: 20,
  difficultyDistribution: {
    kolay: 40,
    orta: 40,
    zor: 20,
  },

  theme: 'minimal',
  coverDesign: {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    borderStyle: 'none',
    logoPosition: 'center',
  },
  pageLayout: {
    columns: 1,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    headerHeight: 10,
    footerHeight: 10,
    gutterWidth: 0,
  },

  sections: [], // Boş — kullanıcı ekleyecek
  includeTableOfContents: false,
  includeDividerPages: false,
  includeAnswerKey: false,

  isPremium: false,
  isPublic: true,
  createdBy: 'system',
  createdAt: '2026-01-01T00:00:00Z',
  usageCount: 0,
  rating: 4.5,
};

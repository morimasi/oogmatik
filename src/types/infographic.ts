/**
 * @file src/types/infographic.ts
 * @description İnfografik Stüdyosu v3 — Tip Sistemi
 *
 * ⚠️ DÜZELTME NOTU (v3.1.0):
 *   1. ActivityOutput projede TANIMLI DEĞİL → BaseInfographicResult kullanıldı
 *   2. InfographicTemplate → InfographicActivityTemplate
 *      (src/data/infographicTemplates.ts çakışması önlendi)
 *   3. InfographicContent → InfographicActivityContent (isim çakışması önlendi)
 *   4. InfographicGenerationMode: enum değil type alias
 *      (GeneratorOptions.mode: 'fast'|'ai' ile uyumlu)
 *   5. Import: ActivityType → './activity' (DOĞRU YOL)
 */

import { ActivityType } from './activity';

// ── BASE SONUÇ TİPİ ─────────────────────────────────────────────────────────

export type InfographicAgeGroup = '5-7' | '8-10' | '11-13' | '14+';
export type InfographicDifficulty = 'Kolay' | 'Orta' | 'Zor';
export type InfographicProfile = 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed' | 'general';

export interface BaseInfographicResult {
  difficultyLevel: InfographicDifficulty;
  targetSkills: string[];
  ageGroup: InfographicAgeGroup;
  profile: InfographicProfile;
}

// ── ANA SONUÇ TİPİ ──────────────────────────────────────────────────────────

export interface InfographicActivityResult extends BaseInfographicResult {
  title: string;
  syntax: string; // @antv/infographic declarative syntax
  templateType: InfographicActivityTemplate; // ⚠️ InfographicActivity prefix!
  activityContent: InfographicActivityContent; // ⚠️ Activity prefix!
  svgDataUrl?: string; // Pre-rendered SVG (hızlı mod önbellek)
  estimatedDuration: number; // dakika
  category: InfographicCategory;
  generationMode: InfographicGenerationMode;
  mebKazanim?: string; // MEB kazanım kodu (Kat.1-6 önerilir)
}

// ── ÜRETİM MODU ─────────────────────────────────────────────────────────────
// ⚠️ GeneratorOptions.mode: 'fast'|'ai' ile uyumlu — enum kullanılmadı

export type InfographicGenerationMode = 'fast' | 'ai' | 'hybrid';

// ── KATEGORİ TİPİ ───────────────────────────────────────────────────────────

export type InfographicCategory =
  | 'visual-spatial' // Görsel & Mekansal
  | 'reading-comprehension' // Okuduğunu Anlama
  | 'language-literacy' // Okuma & Dil
  | 'math-logic' // Matematik & Mantık
  | 'science' // Fen Bilimleri
  | 'social-studies' // Sosyal Bilgiler & Tarih
  | 'creative-thinking' // Yaratıcı Düşünme
  | 'learning-strategies' // Öğrenme Stratejileri
  | 'spld-support' // SpLD / Özel Destek
  | 'clinical-bep'; // Klinik & BEP — Dr. Ahmet Kaya onayı

// ── TEMPLATE TİPİ ────────────────────────────────────────────────────────────
// ⚠️ "InfographicActivityTemplate" — src/data/infographicTemplates.ts ile ÇAKIŞMIYOR

export type InfographicActivityTemplate =
  | 'sequence-steps'
  | 'list-row-simple-horizontal-arrow'
  | 'compare-binary-horizontal'
  | 'hierarchy-structure'
  | 'sequence-timeline'
  | 'activity-5w1h-grid'
  | 'activity-math-steps'
  | 'activity-syllable-breakdown'
  | 'activity-vocab-card'
  | 'activity-venn'
  | 'activity-cause-effect'
  | 'activity-fishbone'
  | 'activity-radar'
  | 'activity-cornell'
  | 'activity-kwl'
  | 'activity-story-map'
  | 'activity-emotion-wheel'
  | 'activity-bep-goals'
  | 'activity-life-cycle'
  | 'activity-food-chain'
  | 'activity-strengths-wheel';

// ── İÇERİK YAPILARI ─────────────────────────────────────────────────────────
// ⚠️ "InfographicActivityContent" — mevcut InfographicContent ile çakışmıyor

export interface InfographicActivityContent {
  questions?: InfographicQuestion[];
  steps?: InfographicStep[];
  comparisons?: InfographicComparison;
  vocabulary?: InfographicVocabItem[];
  timeline?: InfographicTimelineEvent[];
  hierarchy?: InfographicHierarchyNode;
  bepGoals?: InfographicBEPGoal[];
  radarData?: InfographicRadarSegment[];
  emotions?: InfographicEmotionItem[];
  storyElements?: InfographicStoryMap;
  scienceData?: InfographicScienceContent;
  strategicContent?: InfographicLearningStrategy;
  supportingDrill?: any; // [NEW] Destekleyici alıştırma verisi
}

export interface InfographicQuestion {
  question: string;
  questionType: '5W1H' | 'true-false' | 'fill-blank' | 'multiple-choice' | 'open-ended';
  answer?: string;
  visualCue?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  colorCode?: string; // renk kodlu soru kutuları (disleksi desteği)
  wcagRole?: string; // erişilebilirlik rolü
}

export interface InfographicStep {
  stepNumber: number;
  label: string;
  description: string;
  visualSymbol?: string; // emoji veya ikon kodu
  isCheckpoint: boolean;
  scaffoldHint?: string; // DEHB/diskalkuli desteği için ipucu
  timeEstimate?: string; // "2 dakika" gibi
}

export interface InfographicComparison {
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
  commonGround?: string[]; // Venn ortak alan öğeleri
  criteria?: string[]; // Karşılaştırma kriterleri
}

export interface InfographicVocabItem {
  word: string;
  syllables: string[]; // ['ke', 'le', 'bek'] gibi
  meaning: string;
  exampleSentence: string;
  rootWord?: string;
  relatedWords?: string[];
  visualRepresentation?: string; // emoji/ikon
}

export interface InfographicTimelineEvent {
  date: string; // yıl, dönem veya "1. Adım" gibi
  title: string;
  description: string;
  icon?: string;
  isKeyEvent?: boolean; // önemli olay vurgulama
  source?: string; // alıntı kaynağı (tarih eğitimi)
}

export interface InfographicHierarchyNode {
  label: string;
  description?: string;
  color?: string;
  children?: InfographicHierarchyNode[];
  level?: number; // hiyerarşi derinliği
}

export interface InfographicBEPGoal {
  domain: string; // 'Okuma', 'Matematik', 'Sosyal Beceri' vb.
  objective: string; // SMART format hedef
  targetDate: string; // ISO tarih
  measurableIndicator: string;
  supportStrategies: string[];
  progress: 'not_started' | 'in_progress' | 'achieved';
  reviewDate?: string;
}

export interface InfographicRadarSegment {
  skill: string; // 'Okuma', 'Yazma', 'Dikkat' vb.
  currentLevel: number; // 1-10
  targetLevel: number; // 1-10
  color?: string;
}

export interface InfographicEmotionItem {
  emotion: string;
  intensity: number; // 1-5
  bodyLocation?: string; // "göğüs", "karın" gibi beden haritası
  color?: string;
  strategy?: string; // baş etme stratejisi
}

export interface InfographicStoryMap {
  title: string;
  setting: string; // yer/zaman
  characters: string[];
  problem: string;
  events: string[];
  resolution: string;
  theme?: string;
  authorPurpose?: string;
}

export interface InfographicScienceContent {
  topic: string;
  stages?: string[]; // yaşam döngüsü aşamaları
  components?: string[]; // hücre organelleri vb.
  relationships?: { from: string; to: string; label: string }[];
  properties?: Record<string, string>;
}

export interface InfographicLearningStrategy {
  strategyName: string;
  steps: string[];
  useWhen: string;
  benefits: string[];
  example?: string;
  mnemonic?: string; // hatırlatıcı kısaltma/kelime
}

// ── AKTİVİTE META ────────────────────────────────────────────────────────────

export interface InfographicActivityMeta {
  id: ActivityType;
  title: string;
  description: string;
  category: InfographicCategory;
  template: InfographicActivityTemplate; // ⚠️ InfographicActivityTemplate!
  offlineAvailable: boolean;
  aiOptimized: boolean;
  icon: string;
  spldProfile?: InfographicProfile[];
  minAgeGroup: InfographicAgeGroup;
  mebCategory?: string; // MEB ders alanı
  estimatedMinutes: { min: number; max: number };
  premiumFeatures?: string[];
  mebKazanim?: string; // Kat.1-6 için önerilir
}

// ── ULTRA PREMIUM: CUSTOMIZATION SCHEMA ──────────────────────────────────────

export interface CustomizationSchemaParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum';
  label: string;
  defaultValue: unknown;
  options?: unknown[];
  description: string;
}

export interface CustomizationSchema {
  parameters: CustomizationSchemaParameter[];
}

// ── ULTRA PREMIUM: CUSTOMIZATION PARAMS ──────────────────────────────────────

export interface UltraCustomizationParams {
  topic: string;
  ageGroup: InfographicAgeGroup;
  difficulty: InfographicDifficulty;
  profile: InfographicProfile;
  itemCount: number;
  activityParams: Record<string, unknown>;
}

// ── ULTRA PREMIUM: GENERATOR RESULT ──────────────────────────────────────────

export interface InfographicGeneratorResult {
  title: string;
  content: InfographicActivityContent;
  layoutHints: {
    orientation: string;
    fontSize: number;
    colorScheme: string;
    columnCount?: number;
  pedagogicalNote?: string;
  };
  targetSkills: string[];
  estimatedDuration: number;
  difficultyLevel: InfographicDifficulty;
  ageGroup: InfographicAgeGroup;
  profile: InfographicProfile;
}

// ── ULTRA PREMIUM: GENERATOR PAIR ────────────────────────────────────────────

export interface InfographicGeneratorPair {
  activityType: ActivityType;
  aiGenerator: (params: UltraCustomizationParams) => Promise<InfographicGeneratorResult>;
  offlineGenerator: (params: UltraCustomizationParams) => InfographicGeneratorResult;
  customizationSchema: CustomizationSchema;
}

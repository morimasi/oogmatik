// ==========================================
// SÜPER TÜRKÇE V2 - ULTRA PREMIUM MODÜLLER
// ==========================================

export type SuperTurkceModuleId =
  | 'st_fluency_pyramid' // 1. Okuma Akıcılığı Piramidi
  | 'st_scaffolded_reading' // 2. Nöro-Uyumlu Mikro Metin
  | 'st_semantic_mapping' // 3. Görsel 5N1K Zihin Haritası
  | 'st_guided_cloze' // 4. Elkonin Kutulu Yönlendirmeli Boşluk
  | 'st_dual_coding_match' // 5. Dual-Coding Eşleştirme
  | 'st_story_sequencing' // 6. Yürütücü İşlev Sıralaması
  | 'st_cause_effect_analysis' // 7. LGS Tarzı Sebep-Sonuç Muhakemesi
  | 'st_radar_true_false' // 8. Radar Testi (Büyük ✅/❌)
  | 'st_spot_highlight' // 9. Seçici Dikkat Dedektifliği
  | 'st_scaffolded_open'; // 10. Destekli Açık Uçlu Soru

// ==========================================
// MİKRO-AYARLAR (SETTINGS) İÇİN ARAYÜZLER
// ==========================================

export interface STBaseModuleSettings {
  id: string;
  type: SuperTurkceModuleId;
}

export interface STFluencyPyramidSettings extends STBaseModuleSettings {
  type: 'st_fluency_pyramid';
  linesCount: number; // 3, 4, 5
}

export interface STScaffoldedReadingSettings extends STBaseModuleSettings {
  type: 'st_scaffolded_reading';
  maxWords: number;
  syllableColoring: boolean;
  focusBar: boolean;
}

export interface STSemanticMappingSettings extends STBaseModuleSettings {
  type: 'st_semantic_mapping';
  askWho: boolean;
  askWhat: boolean;
  askWhere: boolean;
  askWhen: boolean;
  askHow: boolean;
  askWhy: boolean;
}

export interface STGuidedClozeSettings extends STBaseModuleSettings {
  type: 'st_guided_cloze';
  distractorCount: number; // 0, 1, 2
}

export interface STDualCodingMatchSettings extends STBaseModuleSettings {
  type: 'st_dual_coding_match';
  matchType: 'synonym' | 'antonym' | 'concept_definition';
  pairCount: number; // 3-5
}

export interface STStorySequencingSettings extends STBaseModuleSettings {
  type: 'st_story_sequencing';
  stepCount: number; // 3-5
}

export interface STCauseEffectAnalysisSettings extends STBaseModuleSettings {
  type: 'st_cause_effect_analysis';
  difficulty: 'direct' | 'inferential';
}

export interface STRadarTrueFalseSettings extends STBaseModuleSettings {
  type: 'st_radar_true_false';
  statementCount: number;
  forbidNegativePhrasing: boolean; // default true for dyslexia
}

export interface STSpotHighlightSettings extends STBaseModuleSettings {
  type: 'st_spot_highlight';
  targetType: 'word' | 'antonym' | 'synonym' | 'letter';
  targetCount: number;
}

export interface STScaffoldedOpenSettings extends STBaseModuleSettings {
  type: 'st_scaffolded_open';
  includeStarter: boolean;
}

export type SuperTurkceModuleSettings =
  | STFluencyPyramidSettings
  | STScaffoldedReadingSettings
  | STSemanticMappingSettings
  | STGuidedClozeSettings
  | STDualCodingMatchSettings
  | STStorySequencingSettings
  | STCauseEffectAnalysisSettings
  | STRadarTrueFalseSettings
  | STSpotHighlightSettings
  | STScaffoldedOpenSettings;

// ==========================================
// YAPAY ZEKA VERİ ÇIKTISI (DATA) İÇİN ARAYÜZLER
// ==========================================

export interface STFluencyPyramidData {
  targetWord: string;
  pyramidLines: string[]; // ["Ali", "Ali top", "Ali top at"]
}

export interface STScaffoldedReadingData {
  title: string;
  text: string;
}

export interface STSemanticMappingData {
  centralEvent: string;
  nodes: { question: string; answer: string; icon: string }[];
}

export interface STGuidedClozeData {
  sentence: string; // "[BLANK]"
  wordPool: string[]; // contains distractors too
  correctWord: string;
}

export interface STDualCodingMatchData {
  pairs: { left: string; rightIcon: string; rightText?: string; matchId: string }[];
}

export interface STStorySequencingData {
  steps: { text: string; order: number }[];
}

export interface STCauseEffectAnalysisData {
  scenario: string;
  cause: string;
  effect: string;
  inferenceQuestion: string; // e.g. "Eğer X olmasaydı ne olurdu?"
  inferenceAnswer: string;
}

export interface STRadarTrueFalseData {
  statements: { text: string; isTrue: boolean }[];
}

export interface STSpotHighlightData {
  instruction: string;
  target: string;
  content: string;
}

export interface STScaffoldedOpenData {
  question: string;
  sentenceStarter?: string;
}

export interface SuperTurkceActivityData {
  modules: Record<string, any>;
}

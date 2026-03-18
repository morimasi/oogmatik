export type PremiumModuleId =
  | 'scaffolded_reading' // 1. Mikro-Öğrenme Metni
  | 'concept_matching' // 2. Görsel - Kavram Eşleştirme
  | 'guided_cloze' // 3. Yönlendirmeli Boşluk Doldurma
  | 'true_false_logic' // 4. Mantık Ağacı / Doğru-Yanlış
  | 'step_sequencing' // 5. Algoritmik Sıralama
  | 'scaffolded_open_ended' // 6. Destekli Açık Uçlu Soru
  | 'visual_multiple_choice' // 7. Görsel Çoktan Seçmeli
  | 'spot_and_highlight' // 8. Odaklı Bul / İşaretle
  | 'mini_mind_map' // 9. Mini Zihin Haritası
  | 'exit_ticket'; // 10. Öz-Değerlendirme Çıkış Bileti

// ==========================================
// MİKRO-AYARLAR (SETTINGS) İÇİN ARAYÜZLER
// ==========================================

export interface BaseModuleSettings {
  id: string; // Benzersiz instance id (Ekranda aynı modülden 2 tane olabilir)
  type: PremiumModuleId;
}

export interface ScaffoldedReadingSettings extends BaseModuleSettings {
  type: 'scaffolded_reading';
  maxWords: number;
  syllableColoring: boolean;
  highlightKeywords: boolean;
}

export interface ConceptMatchingSettings extends BaseModuleSettings {
  type: 'concept_matching';
  pairCount: number;
  hasDistractors: boolean;
}

export interface GuidedClozeSettings extends BaseModuleSettings {
  type: 'guided_cloze';
  showWordPool: boolean;
  useElkoninBoxes: boolean;
}

export interface TrueFalseLogicSettings extends BaseModuleSettings {
  type: 'true_false_logic';
  questionCount: number;
  allowNegativePhrasing: boolean; // Disleksikler için genelde false olmalı
}

export interface StepSequencingSettings extends BaseModuleSettings {
  type: 'step_sequencing';
  stepCount: number;
  useVisuals: boolean; // Sadece metin mi yoksa olay görselleri mi
}

export interface ScaffoldedOpenEndedSettings extends BaseModuleSettings {
  type: 'scaffolded_open_ended';
  provideSentenceStarter: boolean;
  lineCount: number;
}

export interface VisualMultipleChoiceSettings extends BaseModuleSettings {
  type: 'visual_multiple_choice';
  optionCount: number; // 2, 3, 4
  layoutDirection: 'vertical' | 'horizontal';
}

export interface SpotAndHighlightSettings extends BaseModuleSettings {
  type: 'spot_and_highlight';
  targetType: 'letter' | 'word' | 'punctuation';
  targetCount: number;
}

export interface MiniMindMapSettings extends BaseModuleSettings {
  type: 'mini_mind_map';
  branchCount: number;
  partialFill: boolean; // AI bazı dalları dolu versin mi?
}

export interface ExitTicketSettings extends BaseModuleSettings {
  type: 'exit_ticket';
  showEmojisOnly: boolean;
  includeReflectionQuestion: boolean;
}

export type PremiumModuleSettings =
  | ScaffoldedReadingSettings
  | ConceptMatchingSettings
  | GuidedClozeSettings
  | TrueFalseLogicSettings
  | StepSequencingSettings
  | ScaffoldedOpenEndedSettings
  | VisualMultipleChoiceSettings
  | SpotAndHighlightSettings
  | MiniMindMapSettings
  | ExitTicketSettings;

// ==========================================
// YAPAY ZEKA VERİ ÇIKTISI (DATA) İÇİN ARAYÜZLER
// ==========================================

export interface ScaffoldedReadingData {
  title: string;
  text: string;
  keywords: string[];
}

export interface ConceptMatchingData {
  pairs: { left: string; rightIcon: string; matchId: string }[];
  distractors?: { left?: string; rightIcon?: string }[];
}

export interface GuidedClozeData {
  sentence: string; // Boşluklar "[BLANK]" şeklinde işaretlenmiş olabilir
  wordPool: string[];
  correctWord: string;
}

export interface TrueFalseLogicData {
  statements: { text: string; isTrue: boolean }[];
}

export interface StepSequencingData {
  steps: { text: string; order: number; iconHint?: string }[];
}

export interface ScaffoldedOpenEndedData {
  question: string;
  sentenceStarter?: string;
}

export interface VisualMultipleChoiceData {
  question: string;
  options: { text: string; icon?: string; isCorrect: boolean }[];
}

export interface SpotAndHighlightData {
  target: string;
  content: string; // İçinde hedeflerin bulunduğu metin veya harf dizisi
}

export interface MiniMindMapData {
  centralTopic: string;
  branches: { text: string; isFilledByAI: boolean }[];
}

export interface ExitTicketData {
  reflectionQuestion?: string;
}

export interface PremiumActivityData {
  // Dinamik olarak oluşturulan modül datalarının barındığı obje (Instance ID'ye göre)
  modules: Record<string, any>;
}

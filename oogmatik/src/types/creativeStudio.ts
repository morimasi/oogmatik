
// Creative Studio — Merkezi Tip Sistemi

// ÖÖG (Özel Öğrenme Güçlüğü) Profil Tipleri
export type LearningDisabilityProfile = 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed';

export type AgeGroup = '5-7' | '8-10' | '11-13' | '14+';

export type TargetSkill =
    | 'phonological_awareness'
    | 'visual_discrimination'
    | 'working_memory'
    | 'executive_function'
    | 'math_logic'
    | 'reading_fluency'
    | 'attention_focus'
    | 'motor_skills';

export type OutputFormat = 'bento_grid' | 'classic_page' | 'lined_notebook' | 'flashcard' | 'quiz_card';

export type DistractorMatrix = 'visual_reversal' | 'sequencing' | 'phonological' | 'morphological' | 'numerical';

export type ClinicalTemplateCategory = 'dyslexia' | 'dyscalculia' | 'adhd' | 'general';

// ÖÖG Profil Konfigürasyonu
export interface TargetProfile {
    disability: LearningDisabilityProfile;
    ageGroup: AgeGroup;
    targetSkills: TargetSkill[];
    distractorTypes: DistractorMatrix[];
}

// Klinik Şablon
export interface ClinicalTemplate {
    id: string;
    title: string;
    category: ClinicalTemplateCategory;
    description: string;
    icon: string;
    targetSkills: TargetSkill[];
    basePrompt: string;
    sampleBlocks: string[]; // Önerilen blok tipleri
    difficulty: 'easy' | 'medium' | 'hard';
}

// Creative Studio Üretim Konfigürasyonu
export interface CreativeStudioConfig {
    // Temel parametreler
    difficulty: string;
    itemCount: number;
    distractionLevel: string;
    fontSizePreference: string;

    // Klinik parametreler (FAZ 1)
    targetProfile: TargetProfile;
    outputFormat: OutputFormat;
    clinicalIntensity: number;   // 0-100
    visualLoad: number;          // 0-100

    // Şablon seçimi (opsiyonel)
    selectedTemplate?: ClinicalTemplate;
}

// Blok Tipleri (Genişletilmiş)
export type CreativeBlockType =
    | 'header'
    | 'text'
    | 'grid'
    | 'table'
    | 'logic_card'
    | 'footer_validation'
    | 'image'
    | 'cloze_test'
    | 'categorical_sorting'
    | 'match_columns'
    | 'visual_clue_card'
    | 'neuro_marker'
    // Yeni blok tipleri
    | 'fill_blank'
    | 'true_false'
    | 'ordering'
    | 'comparison'
    | 'syllable_box'
    | 'morpheme_tree'
    | 'number_line'
    | 'clock_face';

// Snippet Kategorileri (Genişletilmiş)
export type SnippetCategory =
    | 'Clinical'
    | 'Linguistic'
    | 'Visual'
    | 'Gamification'
    | 'Assessment'
    | 'Motor'
    | 'Executive-Function'
    | 'Custom';

// Metodoloji Listesi (Genişletilmiş)
export type ClinicalMethodology =
    | 'Orton-Gillingham'
    | 'Feuerstein'
    | 'Wilson'
    | 'Lindamood-Bell'
    | 'Sensory-Integration'
    // Yeni metodolojiler
    | 'Davis'
    | 'Fernald'
    | 'VAKT'
    | 'Structured-Literacy'
    | 'Barton'
    | 'Neurological-Impress'
    | 'Precision-Teaching'
    | 'Gillingham-Adams';

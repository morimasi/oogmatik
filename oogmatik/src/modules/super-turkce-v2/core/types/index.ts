export type GradeLevel = 4 | 5 | 6 | 7 | 8;

export type TargetAudience = 'normal' | 'hafif_disleksi' | 'derin_disleksi';

export type EngineMode = 'fast' | 'ai';

// =========================================
// 1. STUDIO (Fabrika) TANIMLARI
// =========================================
export interface StudioDef {
    id: string; // Örn: 'okuma-anlama'
    title: string;
    description: string;
    icon: string; // FontAwesome class
    colorHex: string; // Tema rengi
}

// =========================================
// 2. TEMPLATE (Şablon) TANIMLARI
// =========================================
export type DifficultyLevel = 'kolay' | 'orta' | 'zor' | 'lgs';

export interface TemplateSettingDef {
    key: string;
    label: string;
    type: 'select' | 'range' | 'toggle' | 'text';
    defaultValue: any;
    options?: string[]; // Sadece 'select' için
    min?: number; // Sadece 'range' için
    max?: number; // Sadece 'range' için
}

export interface TemplateDef {
    id: string; // Örn: '5N1K_HABER'
    studioId: string; // Hangi Stüdyoya Ait?
    label: string;
    description: string;
    icon: string;
    difficulty: DifficultyLevel | 'all';

    // Sol Panel (Cockpit) Konfigürasyon Ayarları
    settings: TemplateSettingDef[];

    // Çıktı Formatı (AI'dan beklenen)
    schema: Record<string, any>;

    // AI Prompt Jeneratörü (Dinamik)
    buildAiPrompt: (settings: Record<string, any>, grade: GradeLevel, topic: string) => string;

    // Fast(Offline) Motor İçin Örnek Data Dönderen Fonksiyon
    fastGenerate: (settings: Record<string, any>, grade: GradeLevel, topic: string) => any;
}

// =========================================
// 3. BASKI VE GÖRÜNÜM (A4 Print Settings)
// =========================================
export type FontStyle = 'OpenDyslexic' | 'Arial' | 'Verdana' | 'ComicSans';
export type SpacingLevel = 'dar' | 'normal' | 'genis' | 'ultra_genis';

export interface PrintSettings {
    watermarkText: string;
    showWatermark: boolean;
    institutionName: string;

    // Pedagoji & Disleksi Ayarları
    fontFamily: FontStyle;
    lineHeight: SpacingLevel;
    letterSpacing: SpacingLevel;
    wordSpacing: SpacingLevel;

    // Görsel
    b_d_spacing: boolean; // b, d, p, q harfleri arasında ekstra boşluk
    highContrast: boolean; // Siyah/Sarı gibi zıtlıklar? PDF'te renge dönüşür
}

// =========================================
// 4. MÜFREDAT & KAZANIM YAPISI
// =========================================
export interface Objective {
    id: string; // Örn: 'T(4).3.7'
    title: string;
    description?: string;
    tier2Words?: string[]; // Akademik (orta seviye) kelimeler
    tier3Words?: string[]; // Alana özgü (terim) kelimeler
}

export interface Unit {
    id: string;
    title: string;
    objectives: Objective[];
}

export interface GradeCurriculum {
    grade: GradeLevel;
    units: Unit[];
}

// =========================================
// 5. ÜRETİM SONUCU (Draft Instance)
// =========================================
// Sol panelde "Üret" tuşuna basıldıktan sonra oluşan "Canlı Kağıt" verisi
export interface WorksheetInstance {
    id: string; // Benzersiz
    templateId: string;
    engineMode: EngineMode;
    createdAt: number;

    // Ayarların o anki "snapshot"ı
    settingsSnapshot: Record<string, any>;
    printSettingsSnapshot: PrintSettings;

    data: any; // AI veya Fast motordan dönen JSON
}

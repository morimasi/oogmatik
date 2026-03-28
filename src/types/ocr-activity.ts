/**
 * OOGMATIK — OCR Tabanlı Etkinlik Üretim Modülü Tip Tanımları
 *
 * 3 üretim modu:
 *   1. architecture_clone — Görsel → Blueprint → Varyant
 *   2. prompt_generation  — Doğal dil prompt → Sıfırdan etkinlik
 *   3. exact_clone        — Görsel → Birebir klonlama + içerik yenileme
 *
 * Elif Yıldız: pedagogicalNote her şablonda zorunlu.
 * Dr. Ahmet Kaya: Tanı koyucu dil yok, KVKK uyumlu.
 * Bora Demir: TypeScript strict, any yasak.
 * Selin Arslan: Gemini 2.5 Flash sabit model.
 */

import type { LearningDisabilityProfile, AgeGroup } from './creativeStudio';
import type { _OCRResult, OCRDetectedType } from './core';

// ─── Temel Enumlar ──────────────────────────────────────────────────────

/** Etkinlik üretim modları */
export type ProductionMode = 'architecture_clone' | 'prompt_generation' | 'exact_clone';

/** Onay durumu akış diyagramı: draft → pending_review → approved | rejected */
export type ApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'rejected';

/** Zorluk seviyesi (Türkçe — tutarlılık için) */
export type Difficulty = 'Kolay' | 'Orta' | 'Zor';

/** Soru tipleri */
export type QuestionType =
    | 'multiple_choice'
    | 'fill_in_the_blank'
    | 'matching'
    | 'true_false'
    | 'open_ended'
    | 'ordering'
    | 'classification'
    | 'diagram_labeling';

// ─── Şablon Yapısı ──────────────────────────────────────────────────────

/** A4 sayfa düzeni tanımı */
export interface TemplateLayout {
    pageSize: 'A4';
    orientation: 'portrait' | 'landscape';
    columns: number;
    margin: { top: number; right: number; bottom: number; left: number };
    gap: number;
}

/** Bölüm türleri — şablonun yapıtaşları */
export type SectionType =
    | 'header'
    | 'instruction'
    | 'question_block'
    | 'image_area'
    | 'answer_key'
    | 'footer'
    | 'divider';

/** Tek bir şablon bölümü */
export interface TemplateSection {
    id: string;
    type: SectionType;
    content: string;
    position: { row: number; col: number; span?: number };
    style?: Record<string, string>;
    questionType?: QuestionType;
    /** Alt bölümler (iç içe yapı desteği) */
    children?: TemplateSection[];
}

// ─── Metadata ────────────────────────────────────────────────────────────

/** Etkinlik metadata'sı — her üretimde zorunlu */
export interface ActivityMetadata {
    title: string;
    subject: string;
    gradeLevel: number;
    ageGroup: AgeGroup;
    difficulty: Difficulty;
    estimatedDuration: number;
    targetSkills: string[];
    learningObjectives: string[];
    /** Öğretmene yönelik pedagojik not — ZORUNLU */
    pedagogicalNote: string;
    profile?: LearningDisabilityProfile;
    productionMode: ProductionMode;
    /** Mod 1 & 3 için kaynak blueprint hash'i */
    sourceBlueprint?: string;
    /** MEB müfredat kazanım kodu */
    curriculumCode?: string;
}

/** Onay bilgileri */
export interface ApprovalInfo {
    status: ApprovalStatus;
    reviewedBy?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    /** Red gerekçesi öğrenme sinyali olarak kaydedilir */
    feedbackSignals?: string[];
}

/** Versiyon geçmişi kaydı */
export interface TemplateVersion {
    version: string;
    createdAt: string;
    createdBy: string;
    changeLog: string;
    snapshot: string;
}

// ─── Ana Şablon Arayüzü ─────────────────────────────────────────────────

/** JSON tabanlı etkinlik şablonu — tüm modların ortak çıktı formatı */
export interface ActivityTemplate {
    id: string;
    version: string;
    mode: ProductionMode;
    status: ApprovalStatus;

    /** Yapısal tanım */
    layout: TemplateLayout;
    sections: TemplateSection[];

    /** Metadata */
    metadata: ActivityMetadata;

    /** Cevap anahtarı */
    answerKey?: AnswerKeyItem[];

    /** Onay bilgileri */
    approval?: ApprovalInfo;

    /** Versiyon geçmişi */
    history: TemplateVersion[];

    /** Oluşturulma ve güncellenme zamanları */
    createdAt: string;
    updatedAt: string;
}

/** Cevap anahtarı maddesi */
export interface AnswerKeyItem {
    questionId: string;
    questionNumber: number;
    correctAnswer: string;
    explanation?: string;
}

// ─── Mod 2: Prompt Tabanlı Üretim ───────────────────────────────────────

/** Prompt analiz sonucu */
export interface PromptAnalysis {
    detectedSubject: string;
    detectedGradeLevel: number;
    detectedObjectives: string[];
    suggestedQuestionTypes: QuestionType[];
    suggestedDifficulty: Difficulty;
    suggestedDuration: number;
    suggestedImageUsage: boolean;
    confidence: number;
}

/** Mod 2 üretim isteği */
export interface PromptGenerationRequest {
    prompt: string;
    gradeLevel: number;
    subject: string;
    questionTypes: QuestionType[];
    difficulty: Difficulty;
    questionCount?: number;
    estimatedDuration?: number;
    profile?: LearningDisabilityProfile;
    includeAnswerKey: boolean;
    includeImages: boolean;
    mode: 'fast' | 'advanced';
    /** Opsiyonel: öğrenci bağlamı */
    studentContext?: Record<string, unknown>;
}

// ─── Mod 3: Birebir Klonlama ────────────────────────────────────────────

/** Klonlama modu */
export type CloneMode = 'minor_variation' | 'full_content_refresh';

/** Mod 3 klonlama isteği */
export interface ExactCloneRequest {
    image: string;
    cloneMode: CloneMode;
    preserveStyle: boolean;
    targetProfile?: LearningDisabilityProfile;
    ageGroup?: AgeGroup;
    difficulty?: Difficulty;
}

/** Derin analiz sonucu (Mod 3) */
export interface DeepAnalysisResult {
    /** Çıkarılan metin içerikleri */
    texts: {
        title: string;
        instructions: string[];
        questions: string[];
        footerText?: string;
    };
    /** Stil bilgileri */
    style: StyleTemplate;
    /** Yapısal bilgi */
    structure: {
        type: OCRDetectedType;
        columns: number;
        questionCount: number;
        hasImages: boolean;
        sectionOrder: SectionType[];
    };
    /** Kaynak blueprint */
    blueprint: string;
    /** Analiz güven skoru (0-100) */
    confidence: number;
}

/** Stil şablonu (font, renk, yerleşim bilgileri) */
export interface StyleTemplate {
    fontFamily?: string;
    fontSize?: string;
    headerStyle?: Record<string, string>;
    bodyStyle?: Record<string, string>;
    borderStyle?: string;
    colorPalette?: string[];
    iconUsage?: boolean;
}

// ─── Onay Kuyruğu ───────────────────────────────────────────────────────

/** Onay kuyruğu filtre parametreleri */
export interface ApprovalQueueFilter {
    status?: ApprovalStatus;
    mode?: ProductionMode;
    createdBy?: string;
    dateRange?: { start: string; end: string };
    sortBy?: 'newest' | 'oldest' | 'priority';
}

/** Otomatik ayar önerisi (onay sonrası oluşturulur) */
export interface AutoSettings {
    fastModeDefaults: {
        difficulty: Difficulty;
        questionCount: number;
        estimatedDuration: number;
    };
    advancedModeDefaults: {
        difficulty: Difficulty;
        questionCount: number;
        questionTypes: QuestionType[];
        estimatedDuration: number;
        includeImages: boolean;
    };
}

// ─── Validasyon Sonuçları ────────────────────────────────────────────────

/** Şablon validasyon sonucu */
export interface TemplateValidationResult {
    isValid: boolean;
    errors: TemplateValidationError[];
    warnings: string[];
    qualityScore: number;
}

/** Validasyon hatası */
export interface TemplateValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

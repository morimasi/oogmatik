import { z } from 'zod';
import type { AgeGroup, LearningDisabilityProfile } from './creativeStudio.js';

// ─── Zorluk Seviyeleri (Disleksi spesifik) ───────────────────────
export type SariKitapDifficulty = 'Başlangıç' | 'Orta' | 'İleri' | 'Uzman';
export const SariKitapDifficultySchema = z.enum(['Başlangıç', 'Orta', 'İleri', 'Uzman']);

// ─── 6 Etkinlik Tipi ─────────────────────────────────────────────
export const SariKitapActivityTypeSchema = z.enum([
  'pencere', 'nokta', 'kopru', 'cift_metin', 'hizli_okuma', 'bellek'
]);
export type SariKitapActivityType = z.infer<typeof SariKitapActivityTypeSchema>;

// ─── Kaynak Kitap Veri Yapısı ────────────────────────────────────
export interface SariKitapSourceEntry {
  id: string;
  title: string;
  text: string;
  ageGroup: AgeGroup;
  difficulty: SariKitapDifficulty;
}

export interface SariKitapContent {
  title: string;
  category: string;
  content: string;
  difficulty: SariKitapDifficulty;
  tags: string[];
}

// ─── Temel Hece Verisi ───────────────────────────────────────────
export interface HeceData {
  syllable: string;
  isHighlighted: boolean;
  dotBelow: boolean;
  bridgeNext: boolean;
}

export interface HeceRow {
  syllables: HeceData[];
  lineIndex: number;
}

// ─── Tipografi Ayarları ──────────────────────────────────────────
export interface SariKitapTypography {
  fontSize: number;       // pt — min 14, max 28
  lineHeight: number;     // min 1.6 (Elif Yıldız koşulu)
  letterSpacing: number;  // em — min 0.02
  wordSpacing: number;    // em
}

const TypographySchema = z.object({
  fontSize: z.number().min(12).max(32),
  lineHeight: z.number().min(1.0).max(4.0),
  letterSpacing: z.number().min(0.02).max(0.4),
  wordSpacing: z.number().min(0.1).max(3.0),
});

// ─── Ortak Config ────────────────────────────────────────────────
export interface SariKitapBaseConfig {
  ageGroup: AgeGroup;
  difficulty: SariKitapDifficulty;
  profile: LearningDisabilityProfile;
  durationMins: number;
  topics: string[];
  learningObjectives: string[];
  targetSkills: string[];
  typography: SariKitapTypography;
  pageNumber: number; // Sayfa numarası (dinamik)
  pedagogicalNote?: string;
}

const SariKitapBaseConfigSchema = z.object({
  ageGroup: z.enum(['5-7', '8-10', '11-13', '14+']),
  difficulty: SariKitapDifficultySchema,
  profile: z.enum(['dyslexia', 'dyscalculia', 'adhd', 'mixed']),
  durationMins: z.number().min(5).max(60),
  topics: z.array(z.string()).min(1).max(5),
  learningObjectives: z.array(z.string()).min(1),
  targetSkills: z.array(z.string()).min(1),
  typography: TypographySchema,
  pageNumber: z.number().min(1).max(999).default(1),
  pedagogicalNote: z.string().optional(),
});

// ─── Tip-Spesifik Config'ler (Discriminated Union) ───────────────

export interface PencereConfig extends SariKitapBaseConfig {
  type: 'pencere';
  windowSize: 1 | 2 | 3;
  revealSpeed: 'yavaş' | 'orta' | 'hızlı';
  maskOpacity: number;
  maskColor: string;
  showSequential: boolean;
}

export interface NoktaConfig extends SariKitapBaseConfig {
  type: 'nokta';
  dotPlacement: 'kelime' | 'hece';
  dotDensity: 1 | 2 | 3;
  dotStyle: 'yuvarlak' | 'kare' | 'elips';
  dotSize: number;
  dotColor: string;
  showGuideLine: boolean;
  compactFontSize: number;
  wordGap: number;
}

export interface KopruConfig extends SariKitapBaseConfig {
  type: 'kopru';
  bridgePlacement: 'kelime' | 'hece';
  bridgeHeight: number;
  bridgeGap: number;
  bridgeWidth: number;
  charGap: number;
  bridgeStyle: 'yay' | 'düz' | 'noktalı';
  bridgeColor: string;
  bridgeThickness: number;
  textDensity: 'düşük' | 'orta' | 'yüksek';
}

export interface CiftMetinConfig extends SariKitapBaseConfig {
  type: 'cift_metin';
  interleaveMode: 'kelime' | 'satir' | 'paragraf';
  interleaveRatio: number;
  sourceAColor: string;
  sourceBColor: string;
  sourceAStyle: 'bold' | 'normal' | 'italic';
  sourceBStyle: 'bold' | 'normal' | 'italic';
  showSourceLabels: boolean;
}

export interface BellekConfig extends SariKitapBaseConfig {
  type: 'bellek';
  blockCount: number;
  blockSize: 'küçük' | 'orta' | 'büyük';
  gridColumns: 2 | 3 | 4 | 5;
  showNumbers: boolean;
  repetitionCount: number;
  phases: ('A' | 'B' | 'C' | 'D')[];
  blankRatio: number;
  distractorRatio: 'düşük' | 'orta' | 'yüksek';
  category: 'hayvanlar' | 'doğa' | 'okul' | 'karışık';
  sentenceLines: number;
}

export interface HizliOkumaConfig extends SariKitapBaseConfig {
  type: 'hizli_okuma';
  wordsPerBlock: number;
  blockRows: number;
  showTimer: boolean;
  rhythmicMode: boolean;
  autoFill: boolean;
  columnMode: 'tek' | 'cift';
  lineSpacing: 'sıkı' | 'normal' | 'geniş';
}

// ─── Discriminated Union ─────────────────────────────────────────
export type SariKitapConfig =
  | PencereConfig
  | NoktaConfig
  | KopruConfig
  | CiftMetinConfig
  | BellekConfig
  | HizliOkumaConfig;

// ─── Zod Discriminated Union Şeması ─────────────────────────────

const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const SariKitapConfigSchema = z.discriminatedUnion('type', [
  SariKitapBaseConfigSchema.extend({
    type: z.literal('pencere'),
    windowSize: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    revealSpeed: z.enum(['yavaş', 'orta', 'hızlı']),
    maskOpacity: z.number().min(0.3).max(0.9),
    maskColor: HexColorSchema,
    showSequential: z.boolean(),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('nokta'),
    dotPlacement: z.enum(['kelime', 'hece']),
    dotDensity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    dotStyle: z.enum(['yuvarlak', 'kare', 'elips']),
    dotSize: z.number().min(2).max(22),
    dotColor: HexColorSchema,
    showGuideLine: z.boolean(),
    compactFontSize: z.number().min(12).max(32),
    wordGap: z.number().min(0.1).max(3.0),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('kopru'),
    bridgePlacement: z.enum(['kelime', 'hece']),
    bridgeHeight: z.number().min(8).max(40),
    bridgeGap: z.number().min(4).max(20),
    bridgeWidth: z.number().min(2).max(8),
    charGap: z.number().min(0.5).max(4),
    bridgeStyle: z.enum(['yay', 'düz', 'noktalı']),
    bridgeColor: HexColorSchema,
    bridgeThickness: z.number().min(1).max(4),
    textDensity: z.enum(['düşük', 'orta', 'yüksek']),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('cift_metin'),
    interleaveMode: z.enum(['kelime', 'satir', 'paragraf']),
    interleaveRatio: z.number().min(1).max(5),
    sourceAColor: HexColorSchema,
    sourceBColor: HexColorSchema,
    sourceAStyle: z.enum(['bold', 'normal', 'italic']),
    sourceBStyle: z.enum(['bold', 'normal', 'italic']),
    showSourceLabels: z.boolean(),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('bellek'),
    blockCount: z.number().min(4).max(30),
    blockSize: z.enum(['küçük', 'orta', 'büyük']),
    gridColumns: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    showNumbers: z.boolean(),
    repetitionCount: z.number().min(1).max(5),
    phases: z.array(z.enum(['A', 'B', 'C', 'D'])).min(1),
    blankRatio: z.number().min(0.1).max(0.9),
    distractorRatio: z.enum(['düşük', 'orta', 'yüksek']),
    category: z.enum(['hayvanlar', 'doğa', 'okul', 'karışık']),
    sentenceLines: z.number().min(2).max(8),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('hizli_okuma'),
    wordsPerBlock: z.number().min(1).max(5),
    blockRows: z.number().min(3).max(45),
    showTimer: z.boolean(),
    rhythmicMode: z.boolean(),
    autoFill: z.boolean(),
    columnMode: z.enum(['tek', 'cift']),
    lineSpacing: z.enum(['sıkı', 'normal', 'geniş']),
  }),
]);

// ─── AI Çıktı Tipleri ────────────────────────────────────────────

export interface MemoryPhaseData {
  studyWords: string[];
  blankIndices: number[];
  distractors: string[];
  sentencePrompts: string[];
}

export interface SariKitapGeneratedContent {
  title: string;
  instructions: string;
  instruction?: string; // Bazı generatörler tekil kullanıyor
  targetSkills: string[];
  rawText: string;
  text?: string;        // Bazı generatörler 'text' kullanıyor
  heceRows: HeceRow[];
  words?: Array<{
    word: string;
    hasDot: boolean;
    dotPosition?: number;
  }>;
  sourceTexts?: {
    a: { title: string; text: string };
    b: { title: string; text: string };
  };
  wordBlocks?: string[][];
  memoryData?: MemoryPhaseData;
  pedagogicalNote?: string;
  generatedAt: string;
  model: 'gemini-2.5-flash';
  tokenUsage?: { input: number; output: number };
}

// ─── Firestore Dokümanı ──────────────────────────────────────────

export interface SariKitapDocument {
  id: string;
  userId: string;
  config: SariKitapConfig;
  content: SariKitapGeneratedContent;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isFavorite: boolean;
  workbookId?: string;
}

// ─── Generation Request Şeması ───────────────────────────────────

export const SariKitapGenerationRequestSchema = z.object({
  config: SariKitapConfigSchema,
  sourcePdfReference: z.string().max(200).optional(),
});

import type React from 'react';
import type { ActivityType } from './activity';
import type { AgeGroup, LearningDisabilityProfile } from './creativeStudio';
import type { Difficulty } from './common';

export type { AgeGroup, LearningDisabilityProfile } from './creativeStudio';
export type { Difficulty } from './common';

export type bdmindModel = 'gemini-3.8-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.5-pro' | 'gemini-2.5-flash';
export type MaxBatchSize = 5;

export type AgentId =
  | 'ideation'
  | 'content'
  | 'visual'
  | 'flow'
  | 'evaluation'
  | 'integration';

export interface AgentOutput {
  agentId: AgentId;
  data: Record<string, unknown>;
  pedagogicalNote?: string;
  tokenUsage: { input: number; output: number };
  timestamp: string;
}

export interface AgentStatus {
  agentId: AgentId;
  status: 'idle' | 'running' | 'completed' | 'error';
  result?: AgentOutput;
  error?: { message: string; code: string };
  startedAt?: string;
  completedAt?: string;
}

export interface OrchestratorResult {
  success: boolean;
  agentOutputs: Record<AgentId, AgentOutput>;
  pipelineStatuses: Record<AgentId, AgentStatus>;
  totalTokens: { input: number; output: number };
  cached: boolean;
  batchCount: number;
  timestamp: string;
}

export type WizardStepId = 'goal' | 'content' | 'customize' | 'preview' | 'approval';

export interface WizardStep {
  id: WizardStepId;
  status: 'pending' | 'active' | 'completed' | 'error';
  validationErrors?: string[];
}

export interface UltraDifficultyConfig {
  displayLevel: Difficulty;
  internalLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  scaffoldIntensity: 'full' | 'partial' | 'minimal';
}

export interface StudioGoalConfig {
  ageGroup: AgeGroup;
  profile: LearningDisabilityProfile;
  difficulty: Difficulty;
  internalLevel: UltraDifficultyConfig['internalLevel'];
  activityType: ActivityType | string;
  customCategory?: string;
  topic: string;
  targetSkills: string[];
  gradeLevel: number;
  duration: number;
  format: 'online' | 'yuz-yuze' | 'hibrit';
  participantRange: { min: number; max: number };
}

export type BlockType = 'title' | 'question' | 'explanation' | 'activity' | 'spacing' | 'resource';

export interface ContentBlock {
  id: string;
  type: string;
  content: React.ReactNode;
  order?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  style?: Record<string, unknown>;
  pedagogicalNote?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  bgPaper?: string;
  textColor?: string;
  bgColor?: string;
  fontFamily?: string;
  contrastChecks?: {
    primary_bgPaper: number;
    secondary_bgPaper: number;
    accent_bgPaper: number;
    textColor_bgPaper: number;
  };
}

export interface CompactA4Config {
  densityLevel?: 0 | 1 | 2 | 3 | 4 | 5;
  fontSize?: number;
  lineHeight?: number;
  margin?: number;
  marginMM?: number;
  effectiveMinFontPT?: number;
}

export interface ExportSettings {
  format: 'pdf' | 'png' | 'json';
  pageSize: 'A4' | 'Letter' | 'B5';
  fileName: string;
  includeMetadata: boolean;
  sanitizeForPrivacy: boolean;
}

export interface ActivityStudioState {
  pedagogicalNote: string;
  setPedagogicalNote: (note: string) => void;
  currentStep: WizardStepId;
  steps: WizardStep[];
  isGenerating: boolean;
  error: string | null;
  selectedLibraryItemId?: string;
  enhancementTopic?: string;
  wizardData: {
    goal: StudioGoalConfig | null;
    promptInput: unknown;
    generatedContent: Record<string, unknown> | null;
    customization: Record<string, unknown> | null;
    preview: Record<string, unknown> | null;
    approval: unknown;
  };
  content: ContentBlock[] | null;
  themeConfig: ThemeConfig | null;
  compactA4Config: CompactA4Config | null;
  exportSettings: ExportSettings | null;
  setStep: (step: WizardStepId) => void;
  updateGoal: (data: Partial<StudioGoalConfig>) => void;
  setSelectedLibraryItem: (id: string, topic?: string) => void;
  setContent: (blocks: ContentBlock[]) => void;
  setThemeConfig: (config: Partial<ThemeConfig>) => void;
  setCompactA4Config: (config: Partial<CompactA4Config>) => void;
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  setGenerating: (value: boolean) => void;
  setError: (message: string | null) => void;
  resetStudio: () => void;
}

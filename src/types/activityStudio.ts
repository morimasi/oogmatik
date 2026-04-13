import type { ActivityType } from './activity';
import type { AgeGroup, Difficulty, LearningDisabilityProfile } from './creativeStudio';

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
  /** KVKK: Bu modelde ogrenci kimlik verisi tutulmaz. */
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

export interface SanitizedPromptInput {
  rawTopic: string;
  sanitizedTopic: string;
  inputHash: string;
}

export interface AIGenerationConfig {
  model: 'gemini-2.5-flash';
  batchSize: number;
  useCache: boolean;
  temperature?: number;
  maxRetries: number;
}

export type AgentPipelineStatus =
  | 'idle'
  | 'sanitizing'
  | 'generating'
  | 'validating'
  | 'repairing'
  | 'done'
  | 'error';

export interface ApprovalMetadata {
  clinicalApproval: {
    approved: boolean;
    reviewerId: string;
    timestamp: string;
    notes?: string;
  };
  pedagogicalApproval: {
    approved: boolean;
    reviewerId: string;
    timestamp: string;
    notes?: string;
  };
  status:
    | 'pending_review'
    | 'clinical_approved'
    | 'pedagogical_approved'
    | 'fully_approved'
    | 'rejected';
}

export interface ActivityStudioState {
  currentStep: WizardStepId;
  steps: WizardStep[];
  isGenerating: boolean;
  error: string | null;
  wizardData: {
    goal: StudioGoalConfig | null;
    promptInput: SanitizedPromptInput | null;
    generatedContent: Record<string, unknown> | null;
    customization: Record<string, unknown> | null;
    preview: Record<string, unknown> | null;
    approval: ApprovalMetadata | null;
  };
  setStep: (step: WizardStepId) => void;
  updateGoal: (data: Partial<StudioGoalConfig>) => void;
  setGenerating: (value: boolean) => void;
  setError: (message: string | null) => void;
  resetStudio: () => void;
}

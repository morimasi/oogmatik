import type { ActivityType } from './activity';
import type { AgeGroup, LearningDisabilityProfile } from './creativeStudio';

export type Difficulty = 'Kolay' | 'Orta' | 'Zor';

// ─── AI Model Literal ───────────────────────────────────────────────
/** Sabit model — değiştirme (Selin Arslan direktifi) */
export type OogmatikModel = 'gemini-2.5-flash';

/** Batch üst limiti — 5'ten büyük count asla tek çağrıda gitmez */
export type MaxBatchSize = 5;

// ─── 6 AI Ajan Tipleri ──────────────────────────────────────────────
export type AgentId =
  | 'ideation'
  | 'content'
  | 'visual'
  | 'flow'
  | 'evaluation'
  | 'integration';

export interface AgentInput {
  goal: StudioGoalConfig;
  sanitizedPrompt: SanitizedPromptInput;
  model: OogmatikModel;
  previousOutputs: Partial<Record<AgentId, AgentOutput>>;
}

export interface AgentOutput {
  agentId: AgentId;
  data: Record<string, unknown>;
  pedagogicalNote: string;
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

// ─── Orchestrator Contract ──────────────────────────────────────────
export interface OrchestratorConfig {
  model: OogmatikModel;
  maxBatchSize: MaxBatchSize;
  cacheEnabled: boolean;
  enabledAgents: AgentId[];
  mode: 'sequential' | 'parallel-partial';
  temperature?: number;
  maxRetries: number;
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

export interface CacheKeyParams {
  agentId: AgentId;
  ageGroup: AgeGroup;
  profile: LearningDisabilityProfile;
  difficulty: Difficulty;
  activityType: string;
  topic: string;
  gradeLevel: number;
}

// ─── Sanitize Contract ──────────────────────────────────────────────
/** sanitizeInput() çıktısı — prompt injection koruması */
export interface SanitizedPromptInput {
  rawTopic: string;
  sanitizedTopic: string;
  inputHash: string;
  truncated: boolean;
}

// ─── Agent Runner Interface ─────────────────────────────────────────
/** Her ajan bu interface'i implemente eder — test edilebilir pure contract */
export interface AgentRunner {
  readonly id: AgentId;
  run(input: AgentInput): Promise<AgentOutput>;
  buildPrompt(input: AgentInput): string;
  validateOutput(raw: unknown): raw is AgentOutput;
}

// ─── Orchestrator Pure Function Signatures ──────────────────────────
/**
 * Bu fonksiyon imzaları test edilebilir pure kontrat tanımlarıdır.
 * Gerçek implementasyon `services/agents/orchestrator.ts` içinde olacak.
 */
export interface OrchestratorFunctions {
  sanitizeInput(raw: string, maxLength?: number): SanitizedPromptInput;
  buildCacheKey(params: CacheKeyParams): string;
  splitIntoBatches<T>(items: T[], maxSize: MaxBatchSize): T[][];
  runAgent(runner: AgentRunner, input: AgentInput): Promise<AgentOutput>;
  orchestrate(config: OrchestratorConfig, goal: StudioGoalConfig): Promise<OrchestratorResult>;
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

export interface AIGenerationConfig {
  model: OogmatikModel;
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

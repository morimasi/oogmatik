import { AppError } from '../../utils/AppError';
import type {
  AgentId,
  AgentInput,
  AgentOutput,
  AgentStatus,
  CacheKeyParams,
  OrchestratorConfig,
  OrchestratorResult,
  SanitizedPromptInput,
  StudioGoalConfig,
} from '../../types/activityStudio';
import { ContentAgent } from './agents/ContentAgent';
import { EvaluationAgent } from './agents/EvaluationAgent';
import { FlowAgent } from './agents/FlowAgent';
import { IdeationAgent } from './agents/IdeationAgent';
import { IntegrationAgent } from './agents/IntegrationAgent';
import { VisualAgent } from './agents/VisualAgent';
import type { AgentDependencies } from './agents/types';

const defaultConfig: OrchestratorConfig = {
  model: 'gemini-2.5-flash',
  maxBatchSize: 5,
  cacheEnabled: true,
  enabledAgents: ['ideation', 'content', 'visual', 'flow', 'evaluation', 'integration'],
  mode: 'parallel-partial',
  maxRetries: 2,
  temperature: 0.2,
};

const memoryCache = new Map<string, OrchestratorResult>();

export class AgentOrchestrator {
  private readonly config: OrchestratorConfig;
  private readonly deps: AgentDependencies;

  constructor(config: Partial<OrchestratorConfig> = {}, deps?: Partial<AgentDependencies>) {
    this.config = { ...defaultConfig, ...config };
    this.deps = {
      now: deps?.now ?? (() => new Date().toISOString()),
      runModel: deps?.runModel ?? (async (prompt: string) => ({ summary: prompt.slice(0, 120) })),
    };
  }

  sanitizeInput(raw: string, maxLength = 2000): SanitizedPromptInput {
    const cleaned = raw
      .replace(/ignore\s+(all\s+)?previous\s+instructions/gi, '')
      .replace(/you\s+are\s+now/gi, '')
      .replace(/forget\s+(your|all)\s+rules/gi, '')
      .replace(/system\s*:\s*/gi, '')
      .replace(/<\/?[a-z][^>]*>/gi, '')
      .trim();

    const truncated = cleaned.length > maxLength;
    const sanitizedTopic = cleaned.slice(0, maxLength);

    return {
      rawTopic: raw,
      sanitizedTopic,
      inputHash: this.hashValue(sanitizedTopic),
      truncated,
    };
  }

  buildCacheKey(params: CacheKeyParams): string {
    return [
      'og',
      'studio',
      params.agentId,
      params.activityType,
      params.profile,
      params.ageGroup,
      params.difficulty,
      String(params.gradeLevel),
      params.topic.slice(0, 50),
    ].join(':');
  }

  splitIntoBatches<T>(items: T[], maxSize: number): T[][] {
    const output: T[][] = [];
    for (let i = 0; i < items.length; i += maxSize) {
      output.push(items.slice(i, i + maxSize));
    }
    return output;
  }

  async orchestrate(goal: StudioGoalConfig): Promise<OrchestratorResult> {
    const sanitized = this.sanitizeInput(goal.topic);
    if (!sanitized.sanitizedTopic) {
      throw new AppError('Konu bos olamaz.', 'VALIDATION_ERROR', 400);
    }

    const cacheKey = this.buildCacheKey({
      agentId: 'integration',
      activityType: String(goal.activityType),
      profile: goal.profile,
      ageGroup: goal.ageGroup,
      difficulty: goal.difficulty,
      topic: sanitized.sanitizedTopic,
      gradeLevel: goal.gradeLevel,
    });

    if (this.config.cacheEnabled && memoryCache.has(cacheKey)) {
      const cached = memoryCache.get(cacheKey);
      if (cached) {
        return { ...cached, cached: true, timestamp: this.deps.now() };
      }
    }

    const previousOutputs: Partial<Record<AgentId, AgentOutput>> = {};
    const statuses = this.createInitialStatuses();

    const ideation = await this.runAgent(new IdeationAgent(this.deps), goal, sanitized, previousOutputs, statuses);
    previousOutputs.ideation = ideation;

    const [content, visual] = await Promise.all([
      this.runAgent(new ContentAgent(this.deps), goal, sanitized, previousOutputs, statuses),
      this.runAgent(new VisualAgent(this.deps), goal, sanitized, previousOutputs, statuses),
    ]);
    previousOutputs.content = content;
    previousOutputs.visual = visual;

    const flow = await this.runAgent(new FlowAgent(this.deps), goal, sanitized, previousOutputs, statuses);
    previousOutputs.flow = flow;

    const evaluation = await this.runAgent(new EvaluationAgent(this.deps), goal, sanitized, previousOutputs, statuses);
    previousOutputs.evaluation = evaluation;

    const integration = await this.runAgent(new IntegrationAgent(this.deps), goal, sanitized, previousOutputs, statuses);
    previousOutputs.integration = integration;

    const result = this.toResult(previousOutputs, statuses);

    if (this.config.cacheEnabled) {
      memoryCache.set(cacheKey, result);
    }

    return result;
  }

  private async runAgent(
    runner: { id: AgentId; run: (input: AgentInput) => Promise<AgentOutput> },
    goal: StudioGoalConfig,
    sanitizedPrompt: SanitizedPromptInput,
    previousOutputs: Partial<Record<AgentId, AgentOutput>>,
    statuses: Record<AgentId, AgentStatus>
  ): Promise<AgentOutput> {
    statuses[runner.id] = {
      ...statuses[runner.id],
      status: 'running',
      startedAt: this.deps.now(),
    };

    try {
      const output = await runner.run({
        goal,
        sanitizedPrompt,
        model: this.config.model,
        previousOutputs,
      });
      statuses[runner.id] = {
        ...statuses[runner.id],
        status: 'completed',
        completedAt: this.deps.now(),
        result: output,
      };
      return output;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Ajan calismasi basarisiz oldu.';
      statuses[runner.id] = {
        ...statuses[runner.id],
        status: 'error',
        completedAt: this.deps.now(),
        error: { message, code: 'AGENT_FAILURE' },
      };
      throw new AppError(message, 'AGENT_FAILURE', 500);
    }
  }

  private toResult(
    outputs: Partial<Record<AgentId, AgentOutput>>,
    statuses: Record<AgentId, AgentStatus>
  ): OrchestratorResult {
    const required: AgentId[] = ['ideation', 'content', 'visual', 'flow', 'evaluation', 'integration'];
    const missing = required.filter((id) => !outputs[id]);

    if (missing.length > 0) {
      throw new AppError(`Eksik ajan ciktilari: ${missing.join(', ')}`, 'INTERNAL_ERROR', 500);
    }

    const finalOutputs = outputs as Record<AgentId, AgentOutput>;
    const totalTokens = Object.values(finalOutputs).reduce(
      (acc, item) => ({
        input: acc.input + item.tokenUsage.input,
        output: acc.output + item.tokenUsage.output,
      }),
      { input: 0, output: 0 }
    );

    return {
      success: true,
      agentOutputs: finalOutputs,
      pipelineStatuses: statuses,
      totalTokens,
      cached: false,
      batchCount: 1,
      timestamp: this.deps.now(),
    };
  }

  private createInitialStatuses(): Record<AgentId, AgentStatus> {
    return {
      ideation: { agentId: 'ideation', status: 'idle' },
      content: { agentId: 'content', status: 'idle' },
      visual: { agentId: 'visual', status: 'idle' },
      flow: { agentId: 'flow', status: 'idle' },
      evaluation: { agentId: 'evaluation', status: 'idle' },
      integration: { agentId: 'integration', status: 'idle' },
    };
  }

  private hashValue(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return String(Math.abs(hash));
  }
}

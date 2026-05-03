import { AppError } from '../../utils/AppError.js';
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
} from '../../types/activityStudio.js';
import { ContentAgent } from './agents/ContentAgent.js';
import { EvaluationAgent } from './agents/EvaluationAgent.js';
import { FlowAgent } from './agents/FlowAgent.js';
import { IdeationAgent } from './agents/IdeationAgent.js';
import { IntegrationAgent } from './agents/IntegrationAgent.js';
import { VisualAgent } from './agents/VisualAgent.js';
import type { AgentDependencies } from './agents/types.js';

const defaultConfig: OrchestratorConfig = {
  model: 'gemini-2.5-flash',
  maxBatchSize: 5,
  cacheEnabled: true,
  enabledAgents: ['ideation', 'content', 'visual', 'flow', 'evaluation', 'integration'],
  mode: 'parallel-partial',
  maxRetries: 3,
  temperature: 0.1, // Halüsinasyonları engellemek için düşük temperature
};

const memoryCache = new Map<string, OrchestratorResult>();

/**
 * OOGMATIK - AI AGENT ORCHESTRATOR (v2 Professional)
 * Bu sınıf, tüm ajanları otomatik olarak devreye sokar, birbirlerini denetlemelerini sağlar
 * ve halüsinasyonları engelleyerek ultra-premium çıktılar üretir.
 */
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

  /**
   * SELF-CORRECTION & VALIDATION LAYER
   * Ajan çıktılarını denetler ve halüsinasyon veya pedagojik ihlal varsa düzeltir.
   */
  private async validateAndCorrect(
    agentId: AgentId,
    output: AgentOutput,
    goal: StudioGoalConfig,
    sanitized: SanitizedPromptInput
  ): Promise<AgentOutput> {
    const rawContent = JSON.stringify(output.data);
    
    // 1. Yapısal Kontrol (Empty/Bozuk JSON)
    const isMalformed = !rawContent || rawContent.length < 10 || rawContent.includes('null') || rawContent.includes('undefined');
    
    // 2. Pedagojik Kontrol (Tanı koyucu dil vb.)
    const hasForbiddenPhrases = /disleksisi var|dehb'si var|ozurlu|engelli/gi.test(rawContent);

    // 3. ZPD Kontrolü (Zorluk seviyesi uyumu - basit kontrol)
    const difficultyMismatch = goal.difficulty === 'Kolay' && (rawContent.length > 5000 || (rawContent.match(/zor/gi) || []).length > 5);

    if (isMalformed || hasForbiddenPhrases || difficultyMismatch) {
        console.warn(`[Orchestrator] Issue detected in ${agentId}. Retrying with strict correction...`);
        
        // AUTO-CORRECTION PROMPT
        const correctionPrompt = `
          AZ ONCE URETTIGIN ICERIKTE HATALAR TESPIT EDILDI.
          HATA: ${isMalformed ? 'Bozuk veya eksik veri.' : ''} ${hasForbiddenPhrases ? 'Tanı koyucu dil kullanıldı.' : ''} ${difficultyMismatch ? 'Zorluk seviyesi hedefle uyumsuz.' : ''}
          LUTFEN ASAGIDAKI KURALLARA UYARAK YENIDEN URET:
          1. Tanı koyucu dil YASAK (örn: "disleksisi var" yerine "disleksi desteğine ihtiyacı var" kullan).
          2. JSON formatı tam ve hatasız olmalı.
          3. Hedef zorluk seviyesi: ${goal.difficulty}.
          
          ORIJINAL KONU: ${sanitized.sanitizedTopic}
          HATALI CIKTI: ${rawContent.slice(0, 500)}...
        `;

        // Retry mechanism (1 attempt for now)
        const correctedResult = await this.deps.runModel(correctionPrompt);
        // Basit bir şekilde data'yı güncelle (Gerçekte daha karmaşık bir parsing gerekir)
        try {
            const parsed = JSON.parse(correctedResult.summary);
            return {
                ...output,
                data: parsed,
                timestamp: this.deps.now(),
            };
        } catch {
            console.error(`[Orchestrator] Self-correction failed for ${agentId}. Using original output.`);
            return output;
        }
    }

    return output;
  }

  public sanitizeInput(raw: string, maxLength = 2000): SanitizedPromptInput {
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

  private buildCacheKey(params: CacheKeyParams): string {
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

  /**
   * AUTOMATIC ORCHESTRATION
   * Her çağrıda tüm ekibi otomatik olarak devreye sokar.
   */
  async orchestrate(goal: StudioGoalConfig): Promise<OrchestratorResult> {
    const sanitized = this.sanitizeInput(goal.topic);
    if (!sanitized.sanitizedTopic) {
      throw new AppError('Konu bos olamaz.', 'VALIDATION_ERROR', 400);
    }

    console.log(`[Orchestrator] Starting Ultra-Premium Pipeline for: ${sanitized.sanitizedTopic}`);

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

    // 1. IDEATION (Konsept Tasarımı)
    const ideation = await this.runAgent(new IdeationAgent(this.deps), goal, sanitized, previousOutputs, statuses);
    previousOutputs.ideation = await this.validateAndCorrect('ideation', ideation, goal, sanitized);

    // 2. CONTENT & VISUAL (Paralel Üretim)
    const [content, visual] = await Promise.all([
      this.runAgent(new ContentAgent(this.deps), goal, sanitized, previousOutputs, statuses),
      this.runAgent(new VisualAgent(this.deps), goal, sanitized, previousOutputs, statuses),
    ]);
    previousOutputs.content = await this.validateAndCorrect('content', content, goal, sanitized);
    previousOutputs.visual = await this.validateAndCorrect('visual', visual, goal, sanitized);

    // 3. FLOW (Deneyim Akışı)
    const flow = await this.runAgent(new FlowAgent(this.deps), goal, sanitized, previousOutputs, statuses);
    previousOutputs.flow = await this.validateAndCorrect('flow', flow, goal, sanitized);

    // 4. EVALUATION (Ölçme Değerlendirme)
    const evaluation = await this.runAgent(new EvaluationAgent(this.deps), goal, sanitized, previousOutputs, statuses);
    previousOutputs.evaluation = await this.validateAndCorrect('evaluation', evaluation, goal, sanitized);

    // 5. INTEGRATION (Final Sentez ve Denetim)
    const integration = await this.runAgent(new IntegrationAgent(this.deps), goal, sanitized, previousOutputs, statuses);
    previousOutputs.integration = await this.validateAndCorrect('integration', integration, goal, sanitized);

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

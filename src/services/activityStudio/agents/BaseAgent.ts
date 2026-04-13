import type { AgentId, AgentInput, AgentOutput } from '../../../types/activityStudio';
import type { AgentDependencies } from './types';

export abstract class BaseAgent {
  public readonly id: AgentId;
  protected readonly deps: AgentDependencies;

  constructor(id: AgentId, deps: AgentDependencies) {
    this.id = id;
    this.deps = deps;
  }

  abstract buildPrompt(input: AgentInput): string;

  protected abstract toPedagogicalNote(input: AgentInput): string;

  async run(input: AgentInput): Promise<AgentOutput> {
    const prompt = this.buildPrompt(input);
    const raw = await this.deps.runModel(prompt);

    return {
      agentId: this.id,
      data: {
        raw,
        prompt,
      },
      pedagogicalNote: this.toPedagogicalNote(input),
      tokenUsage: { input: prompt.length, output: JSON.stringify(raw).length },
      timestamp: this.deps.now(),
    };
  }
}

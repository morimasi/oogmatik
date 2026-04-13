import type { AgentInput } from '../../../types/activityStudio';

export interface AgentDependencies {
  now: () => string;
  runModel: (prompt: string) => Promise<unknown>;
}

export interface ParsedModelData {
  raw: unknown;
  summary: string;
}

export interface AgentRunnerContract {
  readonly id: AgentInput['previousOutputs'] extends Record<infer K, unknown> ? K : string;
  run(input: AgentInput): Promise<import('../../../types/activityStudio').AgentOutput>;
}

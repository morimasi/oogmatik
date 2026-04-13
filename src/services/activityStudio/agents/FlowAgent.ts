import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class FlowAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('flow', deps);
  }

  buildPrompt(input: AgentInput): string {
    return `Sure: ${input.goal.duration} dk. Etkinligi kolaydan zora adimla.`;
  }

  protected toPedagogicalNote(): string {
    return 'ZPD uyumlu akis ogrencinin adim adim ilerlemesini destekler.';
  }
}

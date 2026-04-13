import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class EvaluationAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('evaluation', deps);
  }

  buildPrompt(input: AgentInput): string {
    return `Hedef beceri: ${input.goal.targetSkills.join(', ')}. Olculebilir degerlendirme kriterleri yaz.`;
  }

  protected toPedagogicalNote(): string {
    return 'Olculebilir kriterler sureci izlenebilir ve geribildirime acik hale getirir.';
  }
}

import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class IdeationAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('ideation', deps);
  }

  buildPrompt(input: AgentInput): string {
    return `Konu: ${input.sanitizedPrompt.sanitizedTopic}. Yas grubu: ${input.goal.ageGroup}. 3 etkinlik fikri uret.`;
  }

  protected toPedagogicalNote(): string {
    return 'Ilk fikirler ogrenci guvenini artiracak sekilde kolaydan baslatilir.';
  }
}

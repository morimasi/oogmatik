import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class VisualAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('visual', deps);
  }

  buildPrompt(input: AgentInput): string {
    return `Profil: ${input.goal.profile}. Gorsel yuk dusuk, okunabilir layout oner.`;
  }

  protected toPedagogicalNote(): string {
    return 'Gorsel destekler bilissel yuku azaltir ve odaklanmayi artirir.';
  }
}

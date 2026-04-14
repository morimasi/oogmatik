import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class ContentAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('content', deps);
  }

  buildPrompt(input: AgentInput): string {
    return `Konu: ${input.goal.topic}. Hedef beceriler: ${input.goal.targetSkills.join(', ')}. Kısa ve adımlı içerik üret. Lütfen yanıtını sadece 'blocks' dizisi barındıran geçerli bir JSON olarak ver.`;
  }

  protected toPedagogicalNote(input: AgentInput): string {
    return `${input.goal.targetSkills.join(', ')} becerileri icin adimli icerik iskeleleme saglar.`;
  }
}

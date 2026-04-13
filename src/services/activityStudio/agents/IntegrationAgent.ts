import type { AgentInput } from '../../../types/activityStudio';
import { BaseAgent } from './BaseAgent';
import type { AgentDependencies } from './types';

export class IntegrationAgent extends BaseAgent {
  constructor(deps: AgentDependencies) {
    super('integration', deps);
  }

  buildPrompt(input: AgentInput): string {
    return `Ajan ciktilarini tek formatta birlestir. Toplam ajan: ${Object.keys(input.previousOutputs).length}.`;
  }

  protected toPedagogicalNote(): string {
    return 'Birlesik cikti ogretmene tutarli bir uygulama akisi sunar.';
  }
}

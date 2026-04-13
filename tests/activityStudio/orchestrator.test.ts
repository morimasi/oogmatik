import { describe, expect, it } from 'vitest';
import { AgentOrchestrator } from '../../src/services/activityStudio/AgentOrchestrator';
import type { StudioGoalConfig } from '../../src/types/activityStudio';

const goal: StudioGoalConfig = {
  ageGroup: '8-10',
  profile: 'dyslexia',
  difficulty: 'Kolay',
  internalLevel: 2,
  activityType: 'HECE_PARKURU',
  topic: 'hece ayrimi',
  targetSkills: ['okuma', 'dikkat'],
  gradeLevel: 3,
  duration: 20,
  format: 'online',
  participantRange: { min: 1, max: 6 },
};

describe('AgentOrchestrator', () => {
  it('sanitizeInput metni 2000 karaktere kirpar', () => {
    const orchestrator = new AgentOrchestrator();
    const longText = 'a'.repeat(2500);
    const sanitized = orchestrator.sanitizeInput(longText);

    expect(sanitized.sanitizedTopic.length).toBe(2000);
    expect(sanitized.truncated).toBe(true);
  });

  it('orchestrate tum ajan ciktilarini dondurur', async () => {
    const orchestrator = new AgentOrchestrator();
    const result = await orchestrator.orchestrate(goal);

    expect(result.success).toBe(true);
    expect(result.agentOutputs.content).toBeDefined();
    expect(result.agentOutputs.integration).toBeDefined();
  });
});

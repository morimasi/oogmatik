import { describe, expect, it } from 'vitest';
import { generateActivityStudio } from '../../src/services/activityStudioService';
import type { StudioGoalConfig } from '../../src/types/activityStudio';

const validGoal: StudioGoalConfig = {
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

describe('activityStudioService', () => {
  it('gecerli hedef ile success doner', async () => {
    const result = await generateActivityStudio(validGoal);
    expect(result.success).toBe(true);
    expect(result.agentOutputs.integration).toBeDefined();
  });

  it('bos topic icin hata firlatir', async () => {
    await expect(
      generateActivityStudio({
        ...validGoal,
        topic: '   ',
      })
    ).rejects.toThrow();
  });
});

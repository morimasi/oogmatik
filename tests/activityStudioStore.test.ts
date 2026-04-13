import { beforeEach, describe, expect, it } from 'vitest';
import { useActivityStudioStore } from '../src/store/useActivityStudioStore';

describe('useActivityStudioStore', () => {
  beforeEach(() => {
    useActivityStudioStore.getState().resetStudio();
  });

  it('varsayilan wizard adimi goal olmalidir', () => {
    const state = useActivityStudioStore.getState();
    expect(state.currentStep).toBe('goal');
    expect(state.steps).toHaveLength(5);
    expect(state.wizardData.goal).toBeNull();
  });

  it('adim degistirme ve guncelleme aksiyonlari calismalidir', () => {
    const store = useActivityStudioStore.getState();
    store.setStep('content');

    store.updateGoal({
      ageGroup: '8-10',
      profile: 'dyslexia',
      difficulty: 'Kolay',
      internalLevel: 2,
      activityType: 'HECE_PARKURU',
      topic: 'hece ayrimi',
      targetSkills: ['fonolojik farkindalik'],
      gradeLevel: 3,
      duration: 20,
      format: 'online',
      participantRange: { min: 1, max: 6 },
    });

    const nextState = useActivityStudioStore.getState();
    expect(nextState.currentStep).toBe('content');
    expect(nextState.wizardData.goal?.activityType).toBe('HECE_PARKURU');
    expect(nextState.wizardData.goal?.profile).toBe('dyslexia');
  });
});

import { validatePedagogicRules } from '@/components/ActivityStudio/validation/pedagogicValidator';
import type { StudioGoalConfig } from '@/types/activityStudio';

export function usePedagogicGates() {
  const validateGoal = (goal: StudioGoalConfig | null) => {
    if (!goal) {
      return { valid: false, errors: ['Goal bilgisi eksik.'], warnings: [] as string[] };
    }

    return validatePedagogicRules({
      ageGroup: goal.ageGroup,
      difficulty: goal.difficulty,
      targetSkills: goal.targetSkills,
      pedagogicalNote: 'Bu etkinlik ogrencinin hedef becerilerini adim adim destekler.',
      itemDifficulties: ['Kolay', 'Kolay', goal.difficulty],
    });
  };

  return { validateGoal };
}

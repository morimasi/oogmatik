import type { WizardStepId } from '@/types/activityStudio';

export const WIZARD_ORDER: WizardStepId[] = ['goal', 'content', 'customize', 'preview', 'approval'];

export const STEP_TITLES: Record<WizardStepId, string> = {
  goal: '1. Hedef ve Kapsam',
  content: '2. Icerik ve Bilesen',
  customize: '3. Ozellestirme',
  preview: '4. Onizleme',
  approval: '5. Admin Onayi',
};

export const DEFAULT_TARGET_SKILLS = ['okuma_anlama', 'dikkat'];

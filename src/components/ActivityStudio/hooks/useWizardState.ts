import { WIZARD_ORDER } from '@/components/ActivityStudio/constants';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import type { WizardStepId } from '@/types/activityStudio';

export function useWizardState() {
  const { currentStep, setStep } = useActivityStudioStore();

  const currentIndex = WIZARD_ORDER.indexOf(currentStep);

  const goNext = () => {
    const nextStep = WIZARD_ORDER[currentIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  const goBack = () => {
    const prevStep = WIZARD_ORDER[currentIndex - 1];
    if (prevStep) setStep(prevStep);
  };

  const goTo = (step: WizardStepId) => setStep(step);

  return {
    currentStep,
    currentIndex,
    canGoBack: currentIndex > 0,
    canGoNext: currentIndex < WIZARD_ORDER.length - 1,
    goNext,
    goBack,
    goTo,
  };
}

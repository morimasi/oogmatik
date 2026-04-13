import React from 'react';
import { STEP_TITLES } from '@/components/ActivityStudio/constants';
import { useWizardState } from '@/components/ActivityStudio/hooks/useWizardState';
import { StepGoal } from './StepGoal';
import { StepContent } from './StepContent';
import { StepCustomize } from './StepCustomize';
import { StepPreview } from './StepPreview';
import { StepApproval } from './StepApproval';

export const WizardContainer: React.FC = () => {
  const { currentStep, currentIndex, canGoBack, goBack, goNext, goTo } = useWizardState();

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-5">
        {(Object.keys(STEP_TITLES) as Array<keyof typeof STEP_TITLES>).map((step, index) => (
          <button
            key={step}
            type="button"
            onClick={() => goTo(step)}
            className={`rounded-xl border px-3 py-2 text-left text-xs ${index === currentIndex ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]' : 'border-[var(--border-color)] bg-white'}`}
          >
            {STEP_TITLES[step]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] bg-white p-4">
        {currentStep === 'goal' && <StepGoal onNext={goNext} />}
        {currentStep === 'content' && <StepContent onNext={goNext} onBack={goBack} />}
        {currentStep === 'customize' && <StepCustomize onNext={goNext} onBack={goBack} />}
        {currentStep === 'preview' && <StepPreview onNext={goNext} onBack={goBack} />}
        {currentStep === 'approval' && <StepApproval onBack={goBack} />}
      </div>

      {canGoBack && currentStep !== 'approval' && (
        <button type="button" onClick={goBack} className="rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm">
          Bir Onceki Adim
        </button>
      )}
    </div>
  );
};

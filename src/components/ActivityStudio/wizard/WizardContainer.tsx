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
            className={`rounded-xl border px-3 py-2 text-left text-xs transition-colors ${index === currentIndex ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 font-bold' : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 font-medium'}`}
          >
            {STEP_TITLES[step]}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-[#121214] p-6 shadow-xl shadow-black/20 text-zinc-200">
        {currentStep === 'goal' && <StepGoal onNext={goNext} />}
        {currentStep === 'content' && <StepContent onNext={goNext} onBack={goBack} />}
        {currentStep === 'customize' && <StepCustomize onNext={goNext} onBack={goBack} />}
        {currentStep === 'preview' && <StepPreview onNext={goNext} onBack={goBack} />}
        {currentStep === 'approval' && <StepApproval onBack={goBack} />}
      </div>

      {canGoBack && currentStep !== 'approval' && (
        <button type="button" onClick={goBack} className="rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
          Bir Önceki Adım
        </button>
      )}
    </div>
  );
};

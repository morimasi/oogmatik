import React from 'react';

interface StepWizardProps {
  step: number;
  stepLabels: string[];
  onNext: () => void;
  onPrev: () => void;
  onStepClick: (step: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  hasOutput: boolean;
  onReset: () => void;
}

export const StepWizard: React.FC<StepWizardProps> = ({
  step, stepLabels, onNext, onPrev, onStepClick,
  isGenerating, onGenerate, hasOutput, onReset,
}) => {
  const isLastStep = step === stepLabels.length;

  return (
    <div className="space-y-4">
      {/* Step Indicators */}
      <div className="flex items-center gap-2">
        {stepLabels.map((label, i) => {
          const idx = i + 1;
          const isActive = idx === step;
          const isDone = idx < step;
          return (
            <React.Fragment key={idx}>
              <button
                onClick={() => onStepClick(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/5 text-zinc-500 border border-white/5'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                  isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-indigo-500 text-white' : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {isDone ? <i className="fa-solid fa-check" /> : idx}
                </span>
                {label}
              </button>
              {i < stepLabels.length - 1 && (
                <i className={`fa-solid fa-chevron-right text-[8px] ${isDone ? 'text-emerald-500/50' : 'text-zinc-700'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-2">
          {step > 1 && (
            <button
              onClick={onPrev}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <i className="fa-solid fa-arrow-left text-[10px]" />
              Geri
            </button>
          )}
          {hasOutput && (
            <button
              onClick={onReset}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200 text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <i className="fa-solid fa-rotate text-[10px]" />
              Sıfırla
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {!isLastStep && (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 text-[11px] font-bold uppercase tracking-widest transition-all"
            >
              İleri
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </button>
          )}
          {isLastStep && (
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 text-[11px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {isGenerating ? (
                <><i className="fa-solid fa-circle-notch fa-spin" /> Üretiliyor...</>
              ) : (
                <><i className="fa-solid fa-wand-magic-sparkles" /> Reklamı Oluştur</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

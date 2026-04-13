import React from 'react';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import { useAgentOrchestration } from '@/components/ActivityStudio/hooks/useAgentOrchestration';

interface StepContentProps {
  onNext: () => void;
  onBack: () => void;
}

export const StepContent: React.FC<StepContentProps> = ({ onNext, onBack }) => {
  const { isGenerating, wizardData } = useActivityStudioStore();
  const { generate } = useAgentOrchestration();

  const handleGenerate = async () => {
    await generate();
    onNext();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Icerik ve Bilesen Tasarimi</h3>
      <p className="text-sm text-[var(--text-secondary)]">Konu: {wizardData.goal?.topic ?? '-'}</p>
      <div className="flex gap-2">
        <button type="button" onClick={onBack} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm">Geri</button>
        <button type="button" onClick={handleGenerate} disabled={isGenerating} className="rounded-xl bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-white">
          {isGenerating ? 'Uretiliyor...' : 'AI ile Uret ve Devam Et'}
        </button>
      </div>
    </div>
  );
};

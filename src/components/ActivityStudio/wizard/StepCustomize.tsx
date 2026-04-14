import React, { useState } from 'react';
import { ComponentFactory } from '@/components/ActivityStudio/factory/ComponentFactory';
import { ThemeSyncPanel } from '@/components/ActivityStudio/wizard/panels/ThemeSyncPanel';
import { CompactA4LayoutPanel } from '@/components/ActivityStudio/wizard/panels/CompactA4LayoutPanel';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import type { FactoryComponent } from '@/types/activityStudio';

interface StepCustomizeProps {
  onNext: () => void;
  onBack: () => void;
}

export const StepCustomize: React.FC<StepCustomizeProps> = ({ onNext, onBack }) => {
  const [components, setComponents] = useState<FactoryComponent[]>([]);
  const goal = useActivityStudioStore((state) => state.wizardData.goal);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">Ultra Özelleştirme</h3>
      <CompactA4LayoutPanel ageGroup={goal?.ageGroup} profile={goal?.profile} />
      <ThemeSyncPanel />
      <ComponentFactory components={components} onChange={setComponents} />
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
        >
          Geri
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
        >
          Önizlemeye Geç
        </button>
      </div>
    </div>
  );
};

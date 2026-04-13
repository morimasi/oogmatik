import React, { useState } from 'react';
import { ComponentFactory } from '@/components/ActivityStudio/factory/ComponentFactory';
import type { FactoryComponent } from '@/types/activityStudio';

interface StepCustomizeProps {
  onNext: () => void;
  onBack: () => void;
}

export const StepCustomize: React.FC<StepCustomizeProps> = ({ onNext, onBack }) => {
  const [components, setComponents] = useState<FactoryComponent[]>([]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Ultra Ozellestirme</h3>
      <ComponentFactory components={components} onChange={setComponents} />
      <div className="flex gap-2">
        <button type="button" onClick={onBack} className="rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm">Geri</button>
        <button type="button" onClick={onNext} className="rounded-xl bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-white">Onizlemeye Gec</button>
      </div>
    </div>
  );
};

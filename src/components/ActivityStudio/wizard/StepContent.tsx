import React, { useState } from 'react';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import { useAgentOrchestration } from '@/components/ActivityStudio/hooks/useAgentOrchestration';
import { sanitizeMaterialsList, extractContentBlocks } from '@/services/activityStudioContentService';
import { ComponentFactory } from '@/components/ActivityStudio/factory/ComponentFactory';
import type { FactoryComponent } from '@/types/activityStudio';

interface StepContentProps {
  onNext: () => void;
  onBack: () => void;
}

export const StepContent: React.FC<StepContentProps> = ({ onNext, onBack }) => {
  const { isGenerating, wizardData } = useActivityStudioStore();
  const store = useActivityStudioStore();
  const { generate } = useAgentOrchestration();
  const [materials, setMaterials] = useState<string>('');
  const [components, setComponents] = useState<FactoryComponent[]>([]);

  const handleGenerate = async () => {
    const _sanitizedMaterials = sanitizeMaterialsList(
      materials.split('\n').filter((line) => line.trim().length > 0)
    );

    const result = await generate();
    if (!result) return;

    const { blocks, pedagogicalNote } = extractContentBlocks(result);

    store.setContent(blocks);
    store.setPedagogicalNote(pedagogicalNote);
    onNext();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend']">İçerik & Bileşen Tasarımı</h3>

      {/* Library Item Preview */}
      <div className="rounded-2xl border border-[var(--border-color)] p-4 bg-blue-50/10 backdrop-blur-sm">
        <p className="text-sm text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">Kütüphane Ögesi:</strong>{' '}
          {wizardData.goal?.topic ?? '—'}
        </p>
      </div>

      {/* Materials Input */}
      <div>
        <label className="block text-sm font-semibold mb-2 font-['Lexend']">
          Malzemeler (satır başına bir madde)
        </label>
        <textarea
          placeholder={'Malzeme 1\nMalzeme 2\n(Maks. 5 madde, 500 karakter)'}
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
          className="w-full border border-[var(--border-color)] p-3 rounded-xl text-sm font-['Lexend'] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          rows={4}
        />
      </div>

      {/* Content Blueprint Editor (ComponentFactory) */}
      <ComponentFactory components={components} onChange={setComponents} />

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-[var(--border-color)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--bg-secondary)] transition-colors"
        >
          Geri
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="rounded-xl bg-[var(--accent-color)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:brightness-110 transition-all"
        >
          {isGenerating ? 'Üretiliyor...' : 'Üret & Devam'}
        </button>
      </div>
    </div>
  );
};

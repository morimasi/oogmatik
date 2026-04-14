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
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">İçerik & Bileşen Tasarımı</h3>

      {/* Library Item Preview */}
      <div className="rounded-2xl border border-zinc-800 p-4 bg-zinc-900/50 backdrop-blur-sm">
        <p className="text-sm text-zinc-400">
          <strong className="text-amber-500/80">Kütüphane Ögesi:</strong>{' '}
          <span className="text-zinc-200">{wizardData.goal?.topic ?? '—'}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 font-['Lexend'] text-zinc-300">
          Malzemeler (satır başına bir madde)
        </label>
        <textarea
          placeholder={'Malzeme 1\nMalzeme 2\n(Maks. 5 madde, 500 karakter)'}
          value={materials}
          onChange={(e) => setMaterials(e.target.value)}
          className="w-full border border-zinc-700 bg-zinc-800/40 p-3 rounded-xl text-sm font-['Lexend'] text-zinc-200 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder:text-zinc-600 transition-all"
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
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
        >
          Geri
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex-1 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
        >
          {isGenerating ? 'Yapay Zeka Hazırlıyor...' : 'İçerik Üret'}
        </button>
      </div>
    </div>
  );
};

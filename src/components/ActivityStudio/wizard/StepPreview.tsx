import React from 'react';
import { useActivityStudioStore } from '../../../store/useActivityStudioStore';
import type { ContentBlock } from '../../../types/activityStudio';

interface StepPreviewProps {
  onNext: () => void;
  onBack: () => void;
}

export const StepPreview: React.FC<StepPreviewProps> = ({ onNext, onBack }) => {
  const { wizardData, content, pedagogicalNote } = useActivityStudioStore();

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">Önizleme</h3>

      <div className="rounded-2xl border border-zinc-800 p-6 bg-white dark:bg-zinc-900">
        <h1 className="text-2xl font-black text-amber-600 mb-4">
          {wizardData.goal?.topic || 'Etkinlik'}
        </h1>
        
        <div className="space-y-4">
          {content?.map((block: ContentBlock, index: number) => (
            <div key={block.id} className={`p-4 rounded-xl ${
              block.type === 'title' ? 'bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500/30' :
              block.type === 'question' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-500/30' :
              'bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-black">
                  {index + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {block.type}
                </span>
              </div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-relaxed">
                {block.content}
              </p>
              {block.pedagogicalNote && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 italic">
                  <i className="fa-solid fa-graduation-cap mr-1"></i>
                  {block.pedagogicalNote}
                </p>
              )}
            </div>
          ))}
        </div>

        {pedagogicalNote && (
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-500/30">
            <p className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 leading-relaxed">
              <i className="fa-solid fa-lightbulb mr-1.5"></i>
              {pedagogicalNote}
            </p>
          </div>
        )}
      </div>

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
          Kaydet
        </button>
      </div>
    </div>
  );
};

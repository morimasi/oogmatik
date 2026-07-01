import React, { useState } from 'react';
import { useActivityStudioStore } from '../../../store/useActivityStudioStore';
import type { ContentBlock, BlockType } from '../../../types/activityStudio';

interface StepContentProps {
  onNext: () => void;
  onBack: () => void;
}

export const StepContent: React.FC<StepContentProps> = ({ onNext, onBack }) => {
  const { isGenerating, wizardData } = useActivityStudioStore();
  const store = useActivityStudioStore();
  const [contentText, setContentText] = useState('');

  const handleGenerate = () => {
    const goal = wizardData.goal;
    if (!goal || !goal.topic?.trim()) {
      store.setError('Lütfen önce bir konu belirleyin.');
      return;
    }

    const blocks: ContentBlock[] = [
      {
        id: 'block_1',
        type: 'explanation' as BlockType,
        order: 0,
        content: `Bugün ${goal.topic} konusunda çalışacağız. Bu etkinlik ${goal.targetSkills.join(', ')} becerilerini geliştirecek.`,
      },
      {
        id: 'block_2',
        type: 'activity' as BlockType,
        order: 1,
        content: '1. Adım: Konu ile ilgili kısa bir metin okuyun.',
      },
      {
        id: 'block_3',
        type: 'question' as BlockType,
        order: 2,
        content: 'Soru: Metinde en çok neyi sevdiniz? Neden?',
      },
      {
        id: 'block_4',
        type: 'activity' as BlockType,
        order: 3,
        content: '2. Adım: Kendi cümlenizi yazın.',
      }
    ];

    store.setContent(blocks);
    onNext();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">İçerik Oluşturma</h3>

      <div className="rounded-2xl border border-zinc-800 p-4 bg-zinc-900/50 backdrop-blur-sm">
        <p className="text-sm text-zinc-400">
          <strong className="text-amber-500/80">Konu:</strong> {wizardData.goal?.topic ?? '—'}<br />
          <strong className="text-amber-500/80">Yaş Grubu:</strong> {wizardData.goal?.ageGroup ?? '—'}<br />
          <strong className="text-amber-500/80">Zorluk:</strong> {wizardData.goal?.difficulty ?? '—'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 font-['Lexend'] text-zinc-300">
          Özel İçerik (İsteğe Bağlı)
        </label>
        <textarea
          placeholder="Buraya özel içerik yazabilirsiniz..."
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
          className="w-full border border-zinc-700 bg-zinc-800/40 p-3 rounded-xl text-sm font-['Lexend'] text-zinc-200 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder:text-zinc-600 transition-all"
          rows={6}
        />
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
          onClick={handleGenerate}
          className="flex-1 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
        >
          İçerik Hazırla
        </button>
      </div>
    </div>
  );
};

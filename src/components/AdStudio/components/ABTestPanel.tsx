import React, { useState } from 'react';
import { AdStudioSettings, AdOutput } from '../../../types/adStudio';
import { useBrandKit } from '../../../hooks/useBrandKit';
import { useAdHistory } from '../../../hooks/useAdHistory';
import { generateABVariation } from '../../../services/adGeneratorService';
import { PreviewPanel } from './PreviewPanel';

interface ABTestPanelProps {
  settings: AdStudioSettings;
}

export const ABTestPanel: React.FC<ABTestPanelProps> = ({ settings }) => {
  const { activeBrandKit } = useBrandKit();
  const { addToHistory } = useAdHistory();
  const [variations, setVariations] = useState<{ a: AdOutput | null; b: AdOutput | null }>({ a: null, b: null });
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async () => {
    setIsGenerating(true);
    try {
      const [a, b] = await Promise.all([
        generateABVariation(settings, activeBrandKit, 'a'),
        generateABVariation(settings, activeBrandKit, 'b'),
      ]);
      setVariations({ a, b });
      addToHistory(a);
      addToHistory(b);
    } catch {
      // Silent
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <i className="fa-solid fa-not-equal text-indigo-500" />
          A/B Test
        </h3>
        <button
          onClick={generate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <><i className="fa-solid fa-circle-notch fa-spin" /> Üretiliyor...</>
          ) : (
            <><i className="fa-solid fa-flask" /> Varyasyon Üret</>
          )}
        </button>
      </div>

      {variations.a && variations.b ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">A</span>
              <span className="text-[10px] text-zinc-500">Ton: {variations.a.tone}</span>
            </div>
            <div className="max-h-60 overflow-y-auto rounded-xl bg-white/5 border border-white/5 p-3">
              <PreviewPanel output={variations.a} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[9px] font-bold">B</span>
              <span className="text-[10px] text-zinc-500">Ton: {variations.b.tone}</span>
            </div>
            <div className="max-h-60 overflow-y-auto rounded-xl bg-white/5 border border-white/5 p-3">
              <PreviewPanel output={variations.b} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-20 text-[10px] text-zinc-500">
          A/B testi için iki farklı varyasyon üret
        </div>
      )}
    </div>
  );
};

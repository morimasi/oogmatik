import React, { useState } from 'react';
import { AdStudioTarget, AdOutput, AD_TARGET_LABELS } from '../../../types/adStudio';
import { useAdGenerator } from '../../../hooks/useAdGenerator';
import { useBrandKit } from '../../../hooks/useBrandKit';
import { useAdHistory } from '../../../hooks/useAdHistory';
import { generateBatch } from '../../../services/adGeneratorService';

const ALL_TARGETS: AdStudioTarget[] = [
  'dashboard', 'activities', 'prompts', 'approvals', 'static_content',
  'math_studio', 'reading_studio', 'screening_assessment', 'sari_kitap', 'infographic_studio',
];

export const BatchGenerator: React.FC = () => {
  const { settings } = useAdGenerator();
  const { activeBrandKit } = useBrandKit();
  const { addToHistory } = useAdHistory();
  const [selected, setSelected] = useState<AdStudioTarget[]>([]);
  const [results, setResults] = useState<AdOutput[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = (target: AdStudioTarget) => {
    setSelected(prev =>
      prev.includes(target) ? prev.filter(t => t !== target) : [...prev, target]
    );
  };

  const run = async () => {
    if (selected.length === 0) return;
    setIsGenerating(true);
    setProgress(0);
    setResults([]);
    try {
      const outputs = await generateBatch(selected, settings, activeBrandKit, (current, total) => {
        setProgress(Math.round((current / total) * 100));
      });
      setResults(outputs);
      outputs.forEach(ad => addToHistory(ad));
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
          <i className="fa-solid fa-layer-group text-indigo-500" />
          Toplu Üretim
        </h3>
        <button
          onClick={run}
          disabled={selected.length === 0 || isGenerating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
        >
          {isGenerating ? (
            <><i className="fa-solid fa-circle-notch fa-spin" /> {progress}%</>
          ) : (
            <><i className="fa-solid fa-play" /> {selected.length} Modül için Üret</>
          )}
        </button>
      </div>

      {/* Target Selection */}
      <div className="grid grid-cols-3 gap-1.5 mb-4">
        {ALL_TARGETS.map(target => (
          <button
            key={target}
            onClick={() => toggle(target)}
            className={`text-left p-2 rounded-lg border text-[9px] font-medium transition-all ${
              selected.includes(target)
                ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400'
                : 'bg-white/5 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
            }`}
          >
            {AD_TARGET_LABELS[target]}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {results.map(ad => (
            <div key={ad.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-[10px]">
              <i className="fa-solid fa-circle-check text-emerald-500 text-[8px]" />
              <span className="font-bold text-zinc-300 truncate">{ad.title}</span>
              <span className="text-zinc-500">· {ad.format}</span>
              <span className="text-zinc-600 ml-auto">{ad.scenes.length} sahne</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

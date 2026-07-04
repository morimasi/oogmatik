import React from 'react';
import { GeneratorOptions } from '../../types';

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 mb-4">
    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

export const NumberPyramidConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: string, v: unknown) => void }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Section title="Piramit Yüksekliği">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Katman</span>
            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{options.pyramidHeight || 5}</span>
          </div>
          <input type="range" min="3" max="8" step="1" value={options.pyramidHeight || 5}
            onChange={(e) => onChange('pyramidHeight', parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        </div>
      </Section>
      <Section title="Zorluk">
        <div className="grid grid-cols-3 gap-2">
          {[{ v: 'Başlangıç', l: 'Kolay' }, { v: 'Orta', l: 'Orta' }, { v: 'Zor', l: 'Zor' }].map(opt => (
            <button key={opt.v} onClick={() => onChange('difficulty', opt.v)}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${options.difficulty === opt.v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>{opt.l}</button>
          ))}
        </div>
      </Section>
    </div>
  );
};

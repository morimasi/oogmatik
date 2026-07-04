import React from 'react';
import { GeneratorOptions } from '../../types';

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 mb-4">
    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

export const KendokuConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: string, v: unknown) => void }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Section title="Izgara Boyutu">
        <div className="grid grid-cols-3 gap-2">
          {[{ v: '3', l: '3×3' }, { v: '4', l: '4×4' }, { v: '5', l: '5×5' }].map(opt => (
            <button key={opt.v} onClick={() => onChange('gridSize', parseInt(opt.v))}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${(options.gridSize || 4) === parseInt(opt.v) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>{opt.l}</button>
          ))}
        </div>
      </Section>
      <Section title="İşlem Türü">
        <div className="grid grid-cols-2 gap-2">
          {[{ v: 'toplama', l: 'Toplama' }, { v: 'dört_işlem', l: 'Dört İşlem' }].map(opt => (
            <button key={opt.v} onClick={() => onChange('operationType', opt.v)}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${(options.operationType as string || 'toplama') === opt.v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}>{opt.l}</button>
          ))}
        </div>
      </Section>
    </div>
  );
};

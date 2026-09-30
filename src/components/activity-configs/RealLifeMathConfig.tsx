import React from 'react';
import { GeneratorOptions } from '../../types';

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="p-4 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] border-[var(--border-color)] mb-4">
    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

export const RealLifeMathConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: string, v: unknown) => void }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Section title="Problem Adedi">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Soru</span>
            <span className="text-xs font-black text-[var(--accent-color)] bg-[var(--accent-muted)] px-2 py-0.5 rounded">{options.itemCount || 5}</span>
          </div>
          <input type="range" min="2" max="15" step="1" value={options.itemCount || 5}
            onChange={(e) => onChange('itemCount', parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        </div>
      </Section>
      <Section title="Zorluk">
        <div className="grid grid-cols-2 gap-2">
          {[{ v: 'Başlangıç', l: 'Basit' }, { v: 'Orta', l: 'Orta' }, { v: 'Zor', l: 'Karmaşık' }].map(opt => (
            <button key={opt.v} onClick={() => onChange('difficulty', opt.v)}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${options.difficulty === opt.v ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-indigo-600' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] border-[var(--border-color)]'}`}>{opt.l}</button>
          ))}
        </div>
      </Section>
    </div>
  );
};

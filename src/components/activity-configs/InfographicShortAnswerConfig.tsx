import React from 'react';
import { GeneratorOptions } from '../../types';

const Section = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="p-4 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] mb-4">
    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">{title}</h4>
    <div className="space-y-4">{children}</div>
  </div>
);

export const InfographicShortAnswerConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: string, v: unknown) => void }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <Section title="Soru Yapısı">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Soru Sayısı</span>
            <span className="text-xs font-black text-[var(--accent-color)] bg-[var(--accent-muted)] px-2 py-0.5 rounded">{options.itemCount || 12}</span>
          </div>
          <input type="range" min="4" max="30" step="1" value={options.itemCount || 12}
            onChange={(e) => onChange('itemCount', parseInt(e.target.value))}
            className="w-full h-1.5 bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Konu</span>
            <span className="text-[9px] text-[var(--text-muted)]">{options.topic as string || 'Genel Kültür'}</span>
          </div>
          <input type="text" value={options.topic as string || 'Genel Kültür'}
            onChange={(e) => onChange('topic', e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)]" />
        </div>
      </Section>
      <Section title="Görünüm">
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: 'small', l: 'Küçük' }, { v: 'medium', l: 'Orta' }, { v: 'large', l: 'Büyük' }
          ].map(opt => (
            <button key={opt.v} onClick={() => onChange('fontSize', opt.v)}
              className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${(options.fontSize as string) === opt.v ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-[var(--accent-color)]' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>{opt.l}</button>
          ))}
        </div>
      </Section>
    </div>
  );
};

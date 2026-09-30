
import React from 'react';
import { GeneratorOptions } from '../../types';

export const FamilyLogicConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-800/30">
                <label className="text-[10px] font-black text-rose-600 uppercase mb-3 block text-center">İlişki Derinliği</label>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        { v: 'basic', l: '1. Derece (Anne-Baba-Kardeş)' },
                        { v: 'extended', l: '2. Derece (Hala-Amca-Kuzen)' },
                        { v: 'complex', l: 'Tam Soy Ağacı Mantığı' }
                    ].map((t: { v: string; l: string }) => (
                        <button
                            key={t.v}
                            onClick={() => onChange('variant', t.v)}
                            className={`w-full py-2.5 rounded-xl text-xs font-black border transition-all ${options.variant === t.v ? 'bg-rose-600 text-[var(--text-primary)] border-rose-600 shadow-md' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)]">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Soru Sayısı</label>
                    <input type="range" min={4} max={12} value={options.itemCount || 8} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('itemCount', parseInt(e.target.value))} className="w-full h-1.5 bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-lg appearance-none accent-rose-500" />
                    <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-bold mt-1"><span>Az</span><span>Yoğun</span></div>
                </div>
            </div>
        </div>
    );
};

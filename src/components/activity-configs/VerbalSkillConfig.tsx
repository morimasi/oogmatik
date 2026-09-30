
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map((opt: { value: string; label: string }) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-secondary)]'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);

export const VerbalSkillConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-emerald-900/10 rounded-[2rem] border border-[var(--border-color)] dark:border-emerald-800/30">
                <CompactToggleGroup 
                    label="Çalışma Türü" 
                    selected={options.variant || 'mixed'} 
                    onChange={(v: string) => onChange('variant', v)} 
                    options={[
                        { value: 'synonym', label: 'Eş Anlam' },
                        { value: 'antonym', label: 'Zıt Anlam' },
                        { value: 'mixed', label: 'Karışık' }
                    ]} 
                />
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)]">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Öğe Sayısı</label>
                    <div className="flex gap-2">
                        {[6, 12, 18].map(n => (
                            <button 
                                key={n} 
                                onClick={() => onChange('itemCount', n)}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg border ${options.itemCount === n ? 'bg-[var(--accent-color)] text-[var(--text-primary)]' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)]'}`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

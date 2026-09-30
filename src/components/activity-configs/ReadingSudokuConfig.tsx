
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: string | number; onChange: (v: string | number) => void; options: { value: string | number; label: string }[] }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map((opt) => (
                <button key={String(opt.value)} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-secondary)]'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);

export const ReadingSudokuConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-emerald-900/10 rounded-[2rem] border border-[var(--border-color)] dark:border-emerald-800/30">
                <CompactToggleGroup 
                    label="İçerik Türü" 
                    selected={options.variant || 'letters'} 
                    onChange={(v) => onChange('variant', v)} 
                    options={[
                        { value: 'letters', label: 'Harf' },
                        { value: 'words', label: 'Kelime' },
                        { value: 'visuals', label: 'Görsel' }
                    ]} 
                />
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-4 shadow-inner">
                <CompactToggleGroup 
                    label="Izgara Boyutu" 
                    selected={options.gridSize || 4} 
                    onChange={(v) => onChange('gridSize', v)} 
                    options={[
                        { value: 4, label: '4x4 (Kolay)' },
                        { value: 6, label: '6x6 (Orta)' },
                        { value: 9, label: '9x9 (Zor)' }
                    ]} 
                />
                <div className="pt-2">
                    <p className="text-[9px] text-[var(--text-muted)] italic leading-tight text-center">
                        "Görsel" modunda yapay zeka sembolik piktogramlar seçer.
                    </p>
                </div>
            </div>
        </div>
    );
};


import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map((opt: { value: string; label: string }) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[9px] font-black rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);

export const ReadingStroopConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-800/30">
                <CompactToggleGroup 
                    label="Kelime Havuzu" 
                    selected={options.variant || 'colors'} 
                    onChange={(v: string) => onChange('variant', v)} 
                    options={[
                        { value: 'colors', label: 'RENK' },
                        { value: 'semantic', label: 'DOĞA' },
                        { value: 'mirror_chars', label: 'AYNA' },
                        { value: 'verbs', label: 'FİİL' }
                    ]} 
                />
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] uppercase">
                    <span>Sütun Sayısı</span>
                    <span className="text-[var(--accent-color)] font-black">{options.gridSize || 4}x</span>
                </div>
                <input type="range" min={3} max={6} value={options.gridSize || 4} onChange={e => onChange('gridSize', parseInt(e.target.value))} className="w-full h-1.5 bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-lg appearance-none accent-[var(--accent-color)]" />
                
                <CompactToggleGroup 
                    label="Sayfa Yoğunluğu" 
                    selected={options.itemCount === 48 ? 'high' : 'standard'} 
                    onChange={(v: string) => onChange('itemCount', v === 'high' ? 48 : 24)} 
                    options={[
                        { value: 'standard', label: 'Seyrek' },
                        { value: 'high', label: 'Yoğun (A4)' }
                    ]} 
                />
            </div>
        </div>
    );
};

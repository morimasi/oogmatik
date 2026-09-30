import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map((opt: { value: string; label: string }) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-fuchsia-600 dark:text-fuchsia-300' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-secondary)]'}`}>
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: unknown) => void;
}

export const LogicErrorHunterConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-fuchsia-50/50 dark:bg-fuchsia-900/10 rounded-[2rem] border border-fuchsia-100 dark:border-fuchsia-800/30">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-fuchsia-800 uppercase tracking-widest"><i className="fa-solid fa-magnifying-glass-chart mr-1"></i> Absürtlük Ayarları</h4>
                </div>

                <CompactToggleGroup
                    label="Absürtlük / Gizlilik Derecesi"
                    selected={options.absurdityDegree || 'obvious'}
                    onChange={(v: string) => onChange('absurdityDegree', v)}
                    options={[
                        { value: 'minimal', label: 'Basit / Günlük' },
                        { value: 'obvious', label: 'Açık Mantıksızlık' },
                        { value: 'surreal', label: 'Sürreal / Rüyamsı' }
                    ]}
                />

                <div className="mt-5 space-y-4">
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase">
                            <span>Metin İçindeki Hata Sayısı (Uzunluğu Etkiler)</span>
                            <span className="text-fuchsia-600 font-black">{options.errorCount || 3} HATA</span>
                        </div>
                        <input
                            type="range" min={1} max={7} step={1}
                            value={options.errorCount || 3}
                            onChange={e => onChange('errorCount', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-fuchsia-600 mt-2"
                        />
                        <p className="text-[9px] text-[var(--text-muted)] mt-2 leading-relaxed">Daha fazla hata talebi, hikayenin daha uzun olmasını gerektirecektir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

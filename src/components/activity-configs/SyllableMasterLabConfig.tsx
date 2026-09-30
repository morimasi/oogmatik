import React from 'react';
import { GeneratorOptions } from '../../types';

const ToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">{label}</label>
        <div className="flex bg-[var(--surface-elevated)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map(opt => (
                <button key={opt.value} onClick={() => onChange(opt.value)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export const SyllableMasterLabConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)]/50 rounded-[2rem] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-sliders text-purple-500 text-sm"></i>
                    <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">Çalışma Modu</span>
                </div>
                <ToggleGroup
                    label="Mod"
                    selected={options.variant || 'split'}
                    onChange={(v) => onChange('variant', v)}
                    options={[
                        { value: 'split', label: 'Ayır' },
                        { value: 'combine', label: 'Birleştir' },
                        { value: 'rainbow', label: 'Gökkuşağı' },
                        { value: 'scrambled', label: 'Karışık' }
                    ]}
                />
                <ToggleGroup
                    label="Hece Yoğunluğu"
                    selected={options.syllableRange || '2-3'}
                    onChange={(v) => onChange('syllableRange', v)}
                    options={[
                        { value: '1-2', label: 'Kısa' },
                        { value: '2-3', label: 'Orta' },
                        { value: '3-5', label: 'Uzun' }
                    ]}
                />
            </div>

            <div className="p-4 bg-rose-50/50 rounded-[2rem] border border-rose-100 space-y-3">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-font text-rose-500 text-sm"></i>
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Harf & Tema</span>
                </div>
                <ToggleGroup
                    label="Harf Büyüklüğü"
                    selected={options.case || 'lower'}
                    onChange={(v) => onChange('case', v)}
                    options={[
                        { value: 'upper', label: 'Büyük' },
                        { value: 'lower', label: 'Küçük' }
                    ]}
                />
                <ToggleGroup
                    label="Tema Alanı"
                    selected={options.topic || 'karma'}
                    onChange={(v) => onChange('topic', v)}
                    options={[
                        { value: 'animals', label: 'Hayvanlar' },
                        { value: 'fruits_veggies', label: 'Meyveler' },
                        { value: 'nature', label: 'Doğa' },
                        { value: 'karma', label: 'Karma' }
                    ]}
                />
            </div>

            <div className="p-4 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-table text-[var(--text-muted)] text-sm"></i>
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Sütun Sayısı</span>
                </div>
                <div className="flex gap-2">
                    {[4, 5, 6].map(n => (
                        <button key={n} onClick={() => onChange('gridCols' as keyof GeneratorOptions, n)}
                            className={`flex-1 py-2 text-xs font-black rounded-xl border-2 transition-all ${(options.gridCols || 5) === n ? 'bg-[var(--accent-muted)]0 border-purple-500 text-[var(--text-primary)] shadow-lg' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>
                            {n} Sütun
                        </button>
                    ))}
                </div>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                    <label className="text-[10px] font-black text-amber-600 uppercase mb-2 block text-center">Öğe Adedi</label>
                    <div className="flex gap-1.5">
                        {[12, 24, 32, 40].map(n => (
                            <button key={n} onClick={() => onChange('itemCount', n)}
                                className={`flex-1 py-2 text-xs font-black rounded-xl border-2 transition-all ${options.itemCount === n ? 'bg-amber-500 border-amber-500 text-[var(--text-primary)] shadow-lg' : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-muted)]'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

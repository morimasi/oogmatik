
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: unknown; onChange: (val: unknown) => void; options: { value: unknown; label: string }[] }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block tracking-wider">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
            {options.map((opt: { value: unknown; label: string }, idx: number) => (
                <button
                    key={idx}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-md text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-muted)] dark:hover:text-[var(--text-secondary)]'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export const FutoshikiConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-5 bg-[var(--accent-muted)]/30 dark:bg-[var(--accent-muted)] rounded-[2.5rem] border border-[var(--border-color)] dark:border-[var(--accent-color)] shadow-sm">
                <CompactToggleGroup
                    label="Izgara Boyutu (Zorluk Etkisi)"
                    selected={options.gridSize || 4}
                    onChange={(v: unknown) => onChange('gridSize', v as number)}
                    options={[
                        { value: 4, label: '4x4' },
                        { value: 5, label: '5x5' },
                        { value: 6, label: '6x6' },
                        { value: 7, label: '7x7' }
                    ]}
                />
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-5 shadow-inner">
                <CompactToggleGroup
                    label="İşaret Yoğunluğu"
                    selected={options.density || 'medium'}
                    onChange={(v: unknown) => onChange('density', v as string)}
                    options={[
                        { value: 'low', label: 'Az' },
                        { value: 'medium', label: 'Orta' },
                        { value: 'high', label: 'Çok' }
                    ]}
                />

                <CompactToggleGroup
                    label="Başlangıç İpuçları"
                    selected={options.hintLevel || 'medium'}
                    onChange={(v: unknown) => onChange('hintLevel', v as string)}
                    options={[
                        { value: 'low', label: 'Minimum' },
                        { value: 'medium', label: 'Standart' },
                        { value: 'high', label: 'Kolaylaştırıcı' }
                    ]}
                />
            </div>

            <div className="px-4">
                <p className="text-[10px] text-[var(--text-muted)] italic leading-relaxed text-center">
                    Futoşhiki'de ultra profesyonel modda, 7x7 boyutunda mantıksal kısıtlar maksimum seviyeye çıkarılır.
                </p>
            </div>
        </div>
    );
};

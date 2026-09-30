import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-zinc-100 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)] border-[var(--border-color)]">
            {options.map((opt: { value: string; label: string }) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-zinc-700 dark:hover:text-[var(--text-secondary)]'}`}>
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

export const FamilyTreeMatrixConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-emerald-900/10 rounded-[2rem] border border-[var(--border-color)] dark:border-emerald-800/30">
                <CompactToggleGroup
                    label="Aile Genişliği (Matris Büyüklüğü)"
                    selected={options.familySize || 'nuclear'}
                    onChange={(v: string) => onChange('familySize', v)}
                    options={[
                        { value: 'nuclear', label: 'Çekirdek Aile (3-4 Kişi)' },
                        { value: 'extended', label: 'Geniş Aile (+Dede/Nine, 6-8 Kişi)' }
                    ]}
                />

                <CompactToggleGroup
                    label="İpucu Karmaşıklığı"
                    selected={options.clueComplexity || 'direct'}
                    onChange={(v: string) => onChange('clueComplexity', v)}
                    options={[
                        { value: 'direct', label: 'Doğrudan İpuçları (Babası Ali\'dir)' },
                        { value: 'logical', label: 'Dolaylı / Mantıksal (Ayşe\'nin Eşi)' }
                    ]}
                />
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-[var(--border-color)] shadow-inner">
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase">
                        <span>Bulunacak / Gizlenen Kişi Sayısı</span>
                        <span className="text-[var(--accent-color)] font-black">{options.emptyNodesCount || 2} Kişi</span>
                    </div>
                    <input
                        type="range" min={1} max={options.familySize === 'extended' ? 5 : 3} step={1}
                        value={options.emptyNodesCount || 2}
                        onChange={e => onChange('emptyNodesCount', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-emerald-600 mt-2"
                    />
                </div>
            </div>
        </div>
    );
};

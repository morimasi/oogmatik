
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactSlider = ({ label, value, onChange, min, max, icon, unit = '' }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; icon?: string; unit?: string }) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] uppercase">
            <span className="flex items-center gap-1">{icon && <i className={`fa-solid ${icon}`}></i>}{label}</span>
            <span className="text-[var(--accent-color)] font-black">{value}{unit}</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-200 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-indigo-600" />
    </div>
);

const CompactToggleGroup = ({ label, selected, onChange, options }: { label: string; selected: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-zinc-100 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)] border-[var(--border-color)]">
            {options.map((opt: { value: string; label: string }) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-zinc-700 dark:hover:text-[var(--text-secondary)]'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);

export const FamilyRelationsConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: string, v: unknown) => void }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-indigo-800/30 space-y-4">
                <CompactToggleGroup
                    label="İlişki Kapsamı"
                    selected={options.difficulty || 'Orta'}
                    onChange={(v: string) => onChange('difficulty', v)}
                    options={[
                        { value: 'Başlangıç', label: 'Çekirdek' },
                        { value: 'Orta', label: 'Geniş' },
                        { value: 'Zor', label: 'Karmaşık' }
                    ]}
                />
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-[var(--border-color)] space-y-5 shadow-inner">
                <CompactSlider
                    label="Soru Sayısı"
                    value={options.itemCount || 8}
                    onChange={(v: number) => onChange('itemCount', v)}
                    min={4} max={12} icon="fa-list-ol"
                />

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">Alt Bölüm Düzeni</label>
                    <select
                        value={options.variant || 'categorize'}
                        onChange={e => onChange('variant', e.target.value)}
                        className="w-full p-2 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] border-[var(--border-color)] rounded-lg text-xs font-bold outline-none focus:border-[var(--accent-color)] text-[var(--text-primary)]"
                    >
                        <option value="categorize">Anne/Baba Tarafı Gruplama</option>
                        <option value="matching">Sadece Tanım Eşleştirme</option>
                        <option value="writing">Açık Uçlu Yazma</option>
                    </select>
                </div>

                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase">Görsel İpucu</span>
                    <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${options.showImage !== false ? 'bg-[var(--accent-color)]' : 'bg-zinc-300'}`} onClick={() => onChange('showImage', options.showImage === false)}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-[var(--bg-paper)] rounded-full transition-all ${options.showImage !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

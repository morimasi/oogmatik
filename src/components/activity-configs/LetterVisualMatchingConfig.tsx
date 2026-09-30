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

export const LetterVisualMatchingConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-violet-50/50 rounded-[2rem] border border-violet-100 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-palette text-violet-500 text-sm"></i>
                    <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Harf & Görsel Ayarları</span>
                </div>

                <ToggleGroup
                    label="Harf Tipi"
                    selected={options.case || 'upper'}
                    onChange={(v) => onChange('case', v)}
                    options={[
                        { value: 'upper', label: 'Büyük Harf' },
                        { value: 'lower', label: 'Küçük Harf' },
                    ]}
                />

                <ToggleGroup
                    label="Görsel Stil"
                    selected={options.imageStyle || 'colorful'}
                    onChange={(v) => onChange('imageStyle', v)}
                    options={[
                        { value: 'colorful', label: 'Renkli' },
                        { value: 'bw', label: 'BW' },
                        { value: 'outline', label: 'Outline' },
                    ]}
                />

                <div className="flex items-center gap-2 p-2 bg-[var(--bg-paper)] rounded-xl border border-[var(--border-color)]">
                    <input type="checkbox" id="showTracing" checked={options.showTracing !== false}
                        onChange={(e) => onChange('showTracing', e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--accent-color)]" />
                    <label htmlFor="showTracing" className="text-[10px] font-bold text-[var(--text-muted)]">İzleme Çizgisi Göster</label>
                </div>

                <ToggleGroup
                    label="Sütun Düzeni"
                    selected={options.columnLayout || '3-col'}
                    onChange={(v) => onChange('columnLayout', v)}
                    options={[
                        { value: '2-col', label: '2 Sütun' },
                        { value: '3-col', label: '3 Sütun' },
                        { value: '4-col', label: '4 Sütun' },
                    ]}
                />
            </div>

            <div className="p-4 bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)]">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-2 block text-center">Çift Sayısı</label>
                <div className="flex gap-1.5">
                    {[8, 12, 16, 20].map(n => (
                        <button key={n} onClick={() => onChange('itemCount', n)}
                            className={`flex-1 py-2 text-xs font-black rounded-xl border-2 transition-all ${options.itemCount === n ? 'bg-violet-500 border-violet-500 text-[var(--text-primary)] shadow-lg' : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-muted)]'}`}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

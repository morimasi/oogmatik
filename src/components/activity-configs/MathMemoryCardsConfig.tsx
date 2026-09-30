
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

const CheckboxTile = ({ label, checked, onChange, icon }: { label: string; checked: boolean; onChange: (v: boolean) => void; icon?: string }) => (
    <button
        onClick={() => onChange(!checked)}
        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${checked ? 'bg-[var(--accent-muted)] border-indigo-600 text-[var(--accent-color)] dark:bg-indigo-900/20' : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-muted)] bg-[var(--bg-secondary)] border-[var(--border-color)]'}`}
    >
        <i className={`fa-solid ${icon} text-lg mb-1`}></i>
        <span className="text-[9px] font-black uppercase">{label}</span>
    </button>
);

export const MathMemoryCardsConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: string, v: unknown) => void }) => {
    const toggleOp = (op: string) => {
        const current = options.selectedOperations || [];
        const next = current.includes(op) ? current.filter((o: string) => o !== op) : [...current, op];
        onChange('selectedOperations', next.length > 0 ? next : ['add']);
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Eşleştirme Modu */}
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-indigo-800/30">
                <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-3 block text-center">Eşleştirme Mantığı</label>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        { v: 'op-res', l: 'İşlem - Sonuç (Klasik)', icon: 'fa-equals' },
                        { v: 'vis-num', l: 'Görsel Miktar - Rakam', icon: 'fa-eye' },
                        { v: 'eq-eq', l: 'Denk İşlemler (Zor)', icon: 'fa-scale-balanced' }
                    ].map(t => (
                        <button
                            key={t.v}
                            onClick={() => onChange('variant', t.v)}
                            className={`flex items-center gap-3 p-3 rounded-xl text-[11px] font-black border transition-all ${options.variant === t.v ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-indigo-600 shadow-md' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] border-[var(--border-color)]'}`}
                        >
                            <i className={`fa-solid ${t.icon}`}></i>
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            {/* İşlem Seçimi */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">İşlem Havuzu</label>
                <div className="grid grid-cols-4 gap-2">
                    <CheckboxTile label="Topla" icon="fa-plus" checked={(options.selectedOperations || []).includes('add')} onChange={() => toggleOp('add')} />
                    <CheckboxTile label="Çıkar" icon="fa-minus" checked={(options.selectedOperations || []).includes('sub')} onChange={() => toggleOp('sub')} />
                    <CheckboxTile label="Çarp" icon="fa-xmark" checked={(options.selectedOperations || []).includes('mult')} onChange={() => toggleOp('mult')} />
                    <CheckboxTile label="Böl" icon="fa-divide" checked={(options.selectedOperations || []).includes('div')} onChange={() => toggleOp('div')} />
                </div>
            </div>

            {/* Kart & Görsel Ayarları */}
            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-[var(--border-color)] space-y-5 shadow-inner">
                <CompactSlider
                    label="Kart Sayısı"
                    value={options.itemCount || 16}
                    onChange={(v: number) => onChange('itemCount', v)}
                    min={8} max={32} icon="fa-clone" unit=" Kart"
                />

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Somutlaştırma Stili</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['ten-frame', 'dice', 'blocks'].map(style => (
                            <button
                                key={style}
                                onClick={() => onChange('visualStyle', style)}
                                className={`py-2 rounded-lg text-[9px] font-black border transition-all ${options.visualStyle === style ? 'bg-[var(--bg-inset)] text-[var(--text-primary)] border-[var(--border-color)]' : 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'}`}
                            >
                                {style.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase">Kontrol Kodlarını Göster</span>
                    <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${options.showNumbers !== false ? 'bg-[var(--accent-color)]' : 'bg-zinc-300'}`} onClick={() => onChange('showNumbers', options.showNumbers === false)}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-[var(--bg-paper)] rounded-full transition-all ${options.showNumbers !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase flex items-center gap-1">⚡ Hızlı Mod</span>
                    <div
                        className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${(options.fastMode as boolean) ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                        onClick={() => onChange('fastMode', !(options.fastMode as boolean))}
                    >
                        <div className={`absolute top-0.5 w-3 h-3 bg-[var(--bg-paper)] rounded-full transition-all ${(options.fastMode as boolean) ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

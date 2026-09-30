import React from 'react';
import { GeneratorOptions } from '../../types';

export const MorphologyConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    const affixTypes = ['çekim', 'yapım', 'ses_olayları'];
    const selectedAffixes = options.selectedAffixTypes || ['çekim'];

    const toggleAffix = (val: string) => {
        const current = new Set(selectedAffixes as string[]);
        if (current.has(val)) current.delete(val);
        else current.add(val);
        onChange('selectedAffixTypes' as keyof GeneratorOptions, Array.from(current));
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <i className="fa-solid fa-layer-group text-[var(--accent-color)] text-sm"></i>
                    <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">Yapısal Derinlik</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { v: 'Başlangıç', l: 'Bileşik Kelimeler' },
                        { v: 'Orta', l: 'Çekim Ekleri' },
                        { v: 'Zor', l: 'Yapım Ekleri' },
                        { v: 'Uzman', l: 'Ses Olayları' }
                    ].map(t => (
                        <button key={t.v} onClick={() => onChange('difficulty', t.v)}
                            className={`py-2 px-1 rounded-xl text-[9px] font-black border transition-all ${options.difficulty === t.v ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-[var(--accent-color)] shadow-md' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] space-y-3">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-pen-fancy text-[var(--accent-color)] text-sm"></i>
                    <span className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">Ek Türleri</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {affixTypes.map(t => (
                        <button key={t} onClick={() => toggleAffix(t)}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black border transition-all ${selectedAffixes.includes(t) ? 'bg-emerald-600 text-[var(--text-primary)] border-emerald-600 shadow' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>
                            {t === 'çekim' ? 'Çekim Eki' : t === 'yapım' ? 'Yapım Eki' : 'Ses Olayları'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-[2rem] border border-amber-100 space-y-3">
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-book text-amber-500 text-sm"></i>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Tema</span>
                </div>
                <div className="flex gap-2">
                    {['isimler', 'fiiller', 'sıfatlar'].map(t => (
                        <button key={t} onClick={() => onChange('topic' as keyof GeneratorOptions, t)}
                            className={`flex-1 py-2 rounded-xl text-[9px] font-black border transition-all ${(options.topic || 'isimler') === t ? 'bg-amber-500 text-[var(--text-primary)] border-amber-500 shadow' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-[var(--bg-paper)] rounded-xl border border-[var(--border-color)]">
                    <input type="checkbox" id="showSuffixBuilding" checked={options.showSuffixBuilding !== false}
                        onChange={(e) => onChange('showSuffixBuilding', e.target.checked)}
                        className="w-4 h-4 rounded text-[var(--accent-color)]" />
                    <label htmlFor="showSuffixBuilding" className="text-[10px] font-bold text-[var(--text-muted)]">Ek Yapımını Göster</label>
                </div>

                <div className="p-3 bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)]">
                    <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">
                        <span>Öğe Sayısı</span>
                        <span className="text-[var(--accent-color)] font-black">{options.itemCount || 10}</span>
                    </div>
                    <input type="range" min={8} max={16}
                        value={options.itemCount || 10}
                        onChange={e => onChange('itemCount', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-[var(--surface-elevated)] rounded-lg appearance-none accent-[var(--accent-color)]" />
                </div>

                <div className="flex gap-2">
                    {[
                        { v: 'single', l: '1 Sütun' },
                        { v: 'grid_2x1', l: '2 Sütun' }
                    ].map(t => (
                        <button key={t.v} onClick={() => onChange('layout', t.v)}
                            className={`flex-1 py-2 text-[10px] font-black rounded-xl border-2 transition-all ${(options.layout || 'grid_2x1') === t.v ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-[var(--accent-color)] shadow' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

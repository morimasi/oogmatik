import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: string | number;
    label: string;
}

interface CompactToggleGroupProps {
    label: string;
    selected: string | number;
    onChange: (value: unknown) => void;
    options: ToggleOption[];
}

const CompactToggleGroup: React.FC<CompactToggleGroupProps> = ({ label, selected, onChange, options }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-zinc-100 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)] border-[var(--border-color)]">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-zinc-700 dark:hover:text-[var(--text-secondary)]'}`}
                >
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

/**
 * Hikaye Sıralama - Ultra Profesyonel Ayar Paneli
 */
export const StorySequencingConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30 space-y-4">
                <div>
                    <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2 block">Sırlama Teması</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                        placeholder="Örn: Yemek tarifi, Tohumun büyümesi, Sabah rutini..."
                        className="w-full p-4 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border-2 border-amber-100 border-[var(--border-color)] rounded-2xl text-sm font-bold outline-none focus:border-amber-500 text-[var(--text-primary)] placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Panel Sayısı</label>
                        <input
                            type="number"
                            min={3}
                            max={8}
                            value={((options as Record<string, unknown>).panelCount as number) || 4}
                            onChange={(e) => onChange('panelCount', parseInt(e.target.value))}
                            className="w-full p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] border-[var(--border-color)] rounded-xl text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Zorluk Seviyesi</label>
                        <select
                            value={options.difficulty || 'Orta'}
                            onChange={(e) => onChange('difficulty', e.target.value)}
                            className="w-full p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] border-[var(--border-color)] rounded-xl text-xs font-bold"
                        >
                            <option value="Kolay">Temel (3-4 Adım)</option>
                            <option value="Orta">Standart (5-6 Adım)</option>
                            <option value="Zor">Uzman (7+ Adım)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] border-[var(--border-color)] space-y-5 shadow-inner">
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/20">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">Geçiş Kelimeleri</span>
                        <span className="text-[9px] text-[var(--text-muted)]">Önce, sonra, daha sonra gibi ipuçlarını ekler.</span>
                    </div>
                    <button
                        onClick={() => onChange('showTransitionWords', !(options as Record<string, unknown>).showTransitionWords)}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black transition-all ${(options as Record<string, unknown>).showTransitionWords ? 'bg-amber-500 text-[var(--text-primary)] shadow-md' : 'bg-zinc-200 text-[var(--text-muted)]'}`}
                    >
                        {(options as Record<string, unknown>).showTransitionWords ? 'AKTİF' : 'PASİF'}
                    </button>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">Görselleştirme</label>
                    <select
                        value={options.visualStyle || 'cards'}
                        className="w-full p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--border-color)] border-[var(--border-color)] rounded-xl text-xs font-bold"
                    >
                        <option value="cards">Sıralama Kartları</option>
                        <option value="comic">Çizgi Roman Akışı</option>
                        <option value="list">Numaralı Liste</option>
                    </select>
                </div>

                <div className="space-y-4 pt-2 border-t border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-zinc-700 text-[var(--text-primary)]">Kompakt Akış (A4)</span>
                            <span className="text-[10px] text-[var(--text-muted)]">Maksimum panel yoğunluğu sağlar.</span>
                        </div>
                        <button 
                            onClick={() => onChange('compact', !(options as Record<string, unknown>).compact)}
                            className={`w-12 h-6 rounded-full transition-all relative ${(options as Record<string, unknown>).compact ? 'bg-amber-500' : 'bg-zinc-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-[var(--bg-paper)] rounded-full transition-all ${(options as Record<string, unknown>).compact ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-zinc-700 text-[var(--text-primary)]">Yardımcı Görseller</span>
                            <span className="text-[10px] text-[var(--text-muted)]">Adımlara göre AI görseli üretir.</span>
                        </div>
                        <button 
                            onClick={() => onChange('useIcons', !options.useIcons)}
                            className={`w-12 h-6 rounded-full transition-all relative ${options.useIcons ? 'bg-amber-500' : 'bg-zinc-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-[var(--bg-paper)] rounded-full transition-all ${options.useIcons ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-[1.5rem] border border-amber-100 dark:border-amber-800/30">
                    <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-[var(--text-primary)] shadow-lg">
                        <i className="fa-solid fa-list-ol text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter">Ultra Pro Sıralama</span>
                        <span className="text-[9px] text-[var(--text-muted)] text-[var(--text-primary)]">Mantıksal akış ve kronoloji uzmanı.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

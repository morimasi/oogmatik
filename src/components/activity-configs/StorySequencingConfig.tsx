import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: string | number;
    label: string;
}

interface CompactToggleGroupProps {
    label: string;
    selected: string | number;
    onChange: (value: any) => void;
    options: ToggleOption[];
}

const CompactToggleGroup: React.FC<CompactToggleGroupProps> = ({ label, selected, onChange, options }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: any) => void;
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
                        className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-amber-100 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-amber-500 dark:text-zinc-100 placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Panel Sayısı</label>
                        <input
                            type="number"
                            min={3}
                            max={8}
                            value={options.panelCount || 4}
                            onChange={(e) => onChange('panelCount', parseInt(e.target.value))}
                            className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Zorluk Seviyesi</label>
                        <select
                            value={options.difficulty || 'Orta'}
                            onChange={(e) => onChange('difficulty', e.target.value)}
                            className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                        >
                            <option value="Kolay">Temel (3-4 Adım)</option>
                            <option value="Orta">Standart (5-6 Adım)</option>
                            <option value="Zor">Uzman (7+ Adım)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/20">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">Geçiş Kelimeleri</span>
                        <span className="text-[9px] text-zinc-500">Önce, sonra, daha sonra gibi ipuçlarını ekler.</span>
                    </div>
                    <button
                        onClick={() => onChange('showTransitionWords', !options.showTransitionWords)}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black transition-all ${options.showTransitionWords ? 'bg-amber-500 text-white shadow-md' : 'bg-zinc-200 text-zinc-500'}`}
                    >
                        {options.showTransitionWords ? 'AKTİF' : 'PASİF'}
                    </button>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">Görselleştirme</label>
                    <select
                        value={options.visualStyle || 'cards'}
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                    >
                        <option value="cards">Sıralama Kartları</option>
                        <option value="comic">Çizgi Roman Akışı</option>
                        <option value="list">Numaralı Liste</option>
                    </select>
                </div>

                <div className="space-y-4 pt-2 border-t border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Kompakt Akış (A4)</span>
                            <span className="text-[10px] text-zinc-500">Maksimum panel yoğunluğu sağlar.</span>
                        </div>
                        <button 
                            onClick={() => onChange('compact', !options.compact)}
                            className={`w-12 h-6 rounded-full transition-all relative ${options.compact ? 'bg-amber-500' : 'bg-zinc-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${options.compact ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Yardımcı Görseller</span>
                            <span className="text-[10px] text-zinc-500">Adımlara göre AI görseli üretir.</span>
                        </div>
                        <button 
                            onClick={() => onChange('useIcons', !options.useIcons)}
                            className={`w-12 h-6 rounded-full transition-all relative ${options.useIcons ? 'bg-amber-500' : 'bg-zinc-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${options.useIcons ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-[1.5rem] border border-amber-100 dark:border-amber-800/30">
                    <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <i className="fa-solid fa-list-ol text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter">Ultra Pro Sıralama</span>
                        <span className="text-[9px] text-zinc-500 dark:text-zinc-400">Mantıksal akış ve kronoloji uzmanı.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

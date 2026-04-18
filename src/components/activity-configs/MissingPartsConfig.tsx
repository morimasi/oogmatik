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
 * Eksik Parçaları Tamamlama - Ultra Profesyonel Ayar Paneli
 */
export const MissingPartsConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30 space-y-4">
                <div>
                    <label className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 block">Metin Teması</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay yolculuğu, Deniz altı dünyası, Hayvanlar..."
                        className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-emerald-100 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 dark:text-zinc-100 placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Boşluk Türü</label>
                        <select
                            value={options.blankType || 'word'}
                            onChange={(e) => onChange('blankType', e.target.value)}
                            className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                        >
                            <option value="word">Tek Kelime</option>
                            <option value="phrase">Kelime Grubu</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Zorluk</label>
                        <select
                            value={options.difficulty || 'Orta'}
                            onChange={(e) => onChange('difficulty', e.target.value)}
                            className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                        >
                            <option value="Kolay">Başlangıç</option>
                            <option value="Orta">Gelişmiş</option>
                            <option value="Zor">Uzman</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <CompactToggleGroup
                    label="Semantik İpucu"
                    selected={options.showWordBank ? 'true' : 'false'}
                    onChange={(v: string) => onChange('showWordBank', v === 'true')}
                    options={[
                        { value: 'true', label: 'Kelime Havuzu Olsun' },
                        { value: 'false', label: 'Tamamen Açık Uçlu' }
                    ]}
                />

                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/20">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Hece Renklendirme</span>
                        <span className="text-[9px] text-zinc-500">Okumayı kolaylaştırmak için heceleri renklendirir.</span>
                    </div>
                    <button
                        onClick={() => onChange('syllableColoring', !options.syllableColoring)}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black transition-all ${options.syllableColoring ? 'bg-emerald-500 text-white shadow-md' : 'bg-zinc-200 text-zinc-500'}`}
                    >
                        {options.syllableColoring ? 'AKTİF' : 'PASİF'}
                    </button>
                </div>

                <div className="space-y-4 pt-2 border-t border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Kompakt Metin (A4)</span>
                            <span className="text-[10px] text-zinc-500">Maksimum metin yoğunluğu sağlar.</span>
                        </div>
                        <button 
                            onClick={() => onChange('compact', !options.compact)}
                            className={`w-12 h-6 rounded-full transition-all relative ${options.compact ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${options.compact ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">Görsel Destek</span>
                            <span className="text-[10px] text-zinc-500">Metinle ilgili yardımcı ikonlar.</span>
                        </div>
                        <button 
                            onClick={() => onChange('useIcons', !options.useIcons)}
                            className={`w-12 h-6 rounded-full transition-all relative ${options.useIcons ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${options.useIcons ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-800/30">
                    <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <i className="fa-solid fa-puzzle-piece text-xs"></i>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">Ultra Pro Cloze</span>
                        <span className="text-[9px] text-zinc-500 dark:text-zinc-400">Okuma akıcılığı ve bağlam analisti.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

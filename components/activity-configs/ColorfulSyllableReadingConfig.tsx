import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
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

export const ColorfulSyllableReadingConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-[2rem] border border-rose-100 dark:border-rose-800/30 space-y-4">
                <div>
                    <label className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2 block">Özel İlgi Alanı / Tema</label>
                    <input
                        type="text"
                        value={options.topic || ''}
                        onChange={e => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay, Hayvanlar..."
                        className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-rose-100 dark:border-zinc-700 rounded-2xl text-sm font-bold outline-none focus:border-rose-500 dark:text-zinc-100 placeholder-zinc-400 shadow-inner"
                    />
                </div>

                <CompactToggleGroup
                    label="Metin Uzunluğu"
                    selected={options.textLength || 'kısa'}
                    onChange={(v: string) => onChange('textLength', v)}
                    options={[
                        { value: 'kısa', label: 'Çok Kısa' },
                        { value: 'orta', label: 'Orta' },
                        { value: 'uzun', label: 'Uzun' }
                    ]}
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">

                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                        <span>Hedef WPM (Kelime/Dakika)</span>
                        <span className="text-rose-600 font-black">{options.wpmTarget || 60} Kelime</span>
                    </div>
                    <input
                        type="range" min={20} max={160} step={10}
                        value={options.wpmTarget || 60}
                        onChange={e => onChange('wpmTarget', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
                    />
                </div>

                <div className="space-y-1 mt-4">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">Vurgu Türü (Highlight)</label>
                    <select
                        value={options.highlightType || 'syllables'}
                        onChange={e => onChange('highlightType', e.target.value)}
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-rose-500 dark:text-zinc-200"
                    >
                        <option value="syllables">Hece Hece Boyama (Di-kkat)</option>
                        <option value="vowels_only">Sadece Sesli Harfler (dİkkAt)</option>
                        <option value="words">Kelime Bazlı Zıt Renk</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">Renk Paleti Seçimi</label>
                    <div className="grid grid-cols-3 gap-2">
                        <div
                            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${(!options.colorPalette || options.colorPalette === 'red_blue') ? 'border-zinc-900 shadow-md scale-105' : 'border-black/5 opacity-60'}`}
                            onClick={() => onChange('colorPalette', 'red_blue')}
                        >
                            <div className="flex h-10 w-full"><div className="flex-1 bg-red-600"></div><div className="flex-1 bg-blue-600"></div></div>
                            <div className="text-[8px] font-black text-center py-1 uppercase bg-white">Klasik</div>
                        </div>
                        <div
                            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${options.colorPalette === 'contrast' ? 'border-zinc-900 shadow-md scale-105' : 'border-black/5 opacity-60'}`}
                            onClick={() => onChange('colorPalette', 'contrast')}
                        >
                            <div className="flex h-10 w-full"><div className="flex-1 bg-zinc-900"></div><div className="flex-1 bg-white"></div></div>
                            <div className="text-[8px] font-black text-center py-1 uppercase bg-white">Zıtlık</div>
                        </div>
                        <div
                            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${options.colorPalette === 'pastel' ? 'border-zinc-900 shadow-md scale-105' : 'border-black/5 opacity-60'}`}
                            onClick={() => onChange('colorPalette', 'pastel')}
                        >
                            <div className="flex h-10 w-full"><div className="flex-1 bg-teal-400"></div><div className="flex-1 bg-orange-400"></div></div>
                            <div className="text-[8px] font-black text-center py-1 uppercase bg-white">Pastel</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

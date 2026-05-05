import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-black text-zinc-400 uppercase block tracking-widest">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
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

export const DirectionalCodeReadingConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 font-['Lexend']">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center shadow-inner">
                            <i className="fa-solid fa-map-location-dot"></i>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Rota & Algoritma</h4>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Premium Yapılandırma</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <CompactToggleGroup
                        label="Kodlama / Şifre Protokolü"
                        selected={options.cipherType || 'arrows'}
                        onChange={(v: string) => onChange('cipherType', v)}
                        options={[
                            { value: 'arrows', label: 'OKLAR' },
                            { value: 'letters', label: 'HARFLER' },
                            { value: 'colors', label: 'RENKLER' }
                        ]}
                    />

                    {/* Aesthetic Style */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase block tracking-widest">Görünüm Stili</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'standard', label: 'STANDART' },
                                { id: 'premium', label: 'PREMIUM' },
                                { id: 'glassmorphism', label: 'GLASS' },
                                { id: 'ultra-compact', label: 'ULTRA KOMPAKT' },
                            ].map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => onChange('aestheticMode' as any, style.id)}
                                    className={`py-2 text-[9px] font-black rounded-xl border-2 transition-all ${
                                        (options.aestheticMode || 'standard') === style.id
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                                            : 'border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-200'
                                    }`}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase mb-2">
                                <span>Matris</span>
                                <span className="text-indigo-600">{options.gridSize || 8}x{options.gridSize || 8}</span>
                            </div>
                            <input
                                type="range" min={3} max={10} step={1}
                                value={options.gridSize || 8}
                                onChange={e => onChange('gridSize', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase mb-2">
                                <span>Bulmaca</span>
                                <span className="text-indigo-600">{options.puzzleCount || 3} Adet</span>
                            </div>
                            <input
                                type="range" min={1} max={4} step={1}
                                value={options.puzzleCount || 3}
                                onChange={e => onChange('puzzleCount', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>

                    {/* Ultra Compact Mode Toggle */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-compress text-purple-500"></i>
                                <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">Ultra Kompakt Mod</span>
                            </div>
                            <button
                                onClick={() => onChange('compactMode' as any, !(options as any).compactMode)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    (options as any).compactMode !== false ? 'bg-purple-600' : 'bg-zinc-300 dark:bg-zinc-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        (options as any).compactMode !== false ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        <p className="text-[8px] text-purple-600 dark:text-purple-400 mt-2 italic">
                            A4 sayfasında maksimum puzzle yoğunluğu için minimal boşluk
                        </p>
                    </div>

                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex justify-between items-center text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-2">
                            <span>Bilişsel Yük (Engel): % {options.obstacleDensity || 20}</span>
                        </div>
                        <input
                            type="range" min={0} max={60} step={10}
                            value={options.obstacleDensity || 20}
                            onChange={e => onChange('obstacleDensity', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-indigo-200/50 dark:bg-indigo-700/50 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30 shadow-sm shadow-amber-900/5">
                <i className="fa-solid fa-sparkles text-amber-500"></i>
                <p className="text-[9px] font-bold text-amber-800 dark:text-amber-300 leading-tight italic">
                    🚀 Ultra Premium: 8x8 grid, 3-4 puzzle, kompakt layout ve dolu A4 sayfası!
                </p>
            </div>
        </div>
    );
};

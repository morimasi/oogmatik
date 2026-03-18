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
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center shadow-inner">
                        <i className="fa-solid fa-map-location-dot"></i>
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Rota & Algoritma</h4>
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Premium Yapılandırma</p>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase mb-2">
                                <span>Matris</span>
                                <span className="text-indigo-600">{options.gridSize || 5}x{options.gridSize || 5}</span>
                            </div>
                            <input
                                type="range" min={3} max={10} step={1}
                                value={options.gridSize || 5}
                                onChange={e => onChange('gridSize', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase mb-2">
                                <span>Bulmaca</span>
                                <span className="text-indigo-600">{options.puzzleCount || 1} Adet</span>
                            </div>
                            <input
                                type="range" min={1} max={4} step={1}
                                value={options.puzzleCount || 1}
                                onChange={e => onChange('puzzleCount', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                        <div className="flex justify-between items-center text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-2">
                            <span>Bilişsel Yük: % {options.obstacleDensity || 20}</span>
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

            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                <i className="fa-solid fa-circle-info text-amber-500"></i>
                <p className="text-[9px] font-bold text-amber-700 dark:text-amber-300 leading-tight italic">
                    Zorluk seviyesi arttıkça, algoritmaların yönerge karmaşıklığı matematiksel ve mantıksal şifrelerle otomatik olarak derinleşir.
                </p>
            </div>
        </div>
    );
};

import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1 mt-4">
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

export const DirectionalCodeReadingConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest"><i className="fa-solid fa-map-location-dot mr-1"></i> Labirent ve Kod Ayarları</h4>
                </div>

                <CompactToggleGroup
                    label="Kodlama / Şifre Tipi"
                    selected={options.cipherType || 'arrows'}
                    onChange={(v: string) => onChange('cipherType', v)}
                    options={[
                        { value: 'arrows', label: 'Oklar (1↑, 2→)' },
                        { value: 'letters', label: 'Harfler (1K, 2D)' },
                        { value: 'colors', label: 'Renklerle (ZOR)' }
                    ]}
                />

                <div className="mt-5 space-y-4">
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                            <span>Izgara Boyutu (Matris)</span>
                            <span className="text-indigo-600 font-black">{options.gridSize || 5}x{options.gridSize || 5}</span>
                        </div>
                        <input
                            type="range" min={3} max={10} step={1}
                            value={options.gridSize || 5}
                            onChange={e => onChange('gridSize', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                            <span>Engel (Yasaklı Kutu) Yoğunluğu</span>
                            <span className="text-indigo-600 font-black">% {options.obstacleDensity || 20}</span>
                        </div>
                        <input
                            type="range" min={0} max={50} step={10}
                            value={options.obstacleDensity || 20}
                            onChange={e => onChange('obstacleDensity', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

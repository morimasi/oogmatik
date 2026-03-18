import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-fuchsia-600 dark:text-fuchsia-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
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

export const LogicErrorHunterConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-fuchsia-50/50 dark:bg-fuchsia-900/10 rounded-[2rem] border border-fuchsia-100 dark:border-fuchsia-800/30">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-fuchsia-800 uppercase tracking-widest"><i className="fa-solid fa-magnifying-glass-chart mr-1"></i> Absürtlük Ayarları</h4>
                </div>

                <CompactToggleGroup
                    label="Absürtlük / Gizlilik Derecesi"
                    selected={options.absurdityDegree || 'obvious'}
                    onChange={(v: string) => onChange('absurdityDegree', v)}
                    options={[
                        { value: 'minimal', label: 'Basit / Günlük' },
                        { value: 'obvious', label: 'Açık Mantıksızlık' },
                        { value: 'surreal', label: 'Sürreal / Rüyamsı' }
                    ]}
                />

                <div className="mt-5 space-y-4">
                    <div>
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                            <span>Metin İçindeki Hata Sayısı (Uzunluğu Etkiler)</span>
                            <span className="text-fuchsia-600 font-black">{options.errorCount || 3} HATA</span>
                        </div>
                        <input
                            type="range" min={1} max={7} step={1}
                            value={options.errorCount || 3}
                            onChange={e => onChange('errorCount', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-fuchsia-600 mt-2"
                        />
                        <p className="text-[9px] text-zinc-400 mt-2 leading-relaxed">Daha fazla hata talebi, hikayenin daha uzun olmasını gerektirecektir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

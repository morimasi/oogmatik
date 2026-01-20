
import React from 'react';
import { GeneratorOptions } from '../../types';

const RangeSelector = ({ label, value, onChange, options }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase flex justify-between">
            <span>{label}</span>
            <span className="text-indigo-600">{value}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition-all ${value === opt.value ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export const MathLogicRiddleConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Seviye Ayarı */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-800/30">
                <RangeSelector 
                    label="Sayı Aralığı" 
                    value={options.numberRange || '1-20'} 
                    onChange={(v: string) => onChange('numberRange', v)}
                    options={[
                        { value: '1-20', label: '1-20 (Kolay)' },
                        { value: '1-50', label: '1-50 (Orta)' },
                        { value: '1-100', label: '1-100 (Zor)' }
                    ]}
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2rem] border border-zinc-100 dark:border-zinc-700 space-y-5">
                
                {/* İpucu Sayısı */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase">
                        <span>İpucu Sayısı</span>
                        <span className="text-indigo-600">{options.gridSize || 3} Adet</span>
                    </div>
                    <input 
                        type="range" 
                        min="2" max="5" step="1"
                        value={options.gridSize || 3} 
                        onChange={e => onChange('gridSize', parseInt(e.target.value))} 
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    />
                </div>

                {/* Görsel Destek Toggle */}
                <label className="flex items-center justify-between cursor-pointer group p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900">
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 transition-colors">
                        <i className="fa-solid fa-ruler-horizontal mr-2"></i>Sayı Doğrusu Ekle
                    </span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${options.showVisualAid !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
                        <input 
                            type="checkbox" 
                            checked={options.showVisualAid !== false} 
                            onChange={e => onChange('showVisualAid', e.target.checked)} 
                            className="hidden" 
                        />
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${options.showVisualAid !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </label>

                {/* Toplam Kontrolü Toggle */}
                <label className="flex items-center justify-between cursor-pointer group p-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900">
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-indigo-600 transition-colors">
                        <i className="fa-solid fa-calculator mr-2"></i>Toplam Kontrolü
                    </span>
                    <div className={`w-8 h-4 rounded-full relative transition-colors ${options.showSumTarget !== false ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
                        <input 
                            type="checkbox" 
                            checked={options.showSumTarget !== false} 
                            onChange={e => onChange('showSumTarget', e.target.checked)} 
                            className="hidden" 
                        />
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${options.showSumTarget !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </label>

            </div>
        </div>
    );
};

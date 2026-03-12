import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: any;
    label: string;
}

interface ToggleGroupProps {
    label: string;
    selected: any;
    onChange: (val: any) => void;
    options: ToggleOption[];
}

const CompactToggleGroup = ({ label, selected, onChange, options }: ToggleGroupProps) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt) => (
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

export const ApartmentLogicConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-[2rem] border border-orange-100 dark:border-orange-800/30">

                <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Kat Sayısı</label>
                        <select
                            value={options.apartmentFloors || 2}
                            onChange={e => onChange('apartmentFloors', parseInt(e.target.value))}
                            className="w-full p-2 bg-white border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                        >
                            <option value={1}>1 Kat (Müstakil)</option>
                            <option value={2}>2 Kat</option>
                            <option value={3}>3 Kat</option>
                        </select>
                    </div>

                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Kattaki Daire</label>
                        <select
                            value={options.apartmentRoomsPerFloor || 3}
                            onChange={e => onChange('apartmentRoomsPerFloor', parseInt(e.target.value))}
                            className="w-full p-2 bg-white border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                        >
                            <option value={2}>2 Daire</option>
                            <option value={3}>3 Daire</option>
                            <option value={4}>4 Daire</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-white/50 border border-orange-200/50 rounded-xl flex items-center justify-between">
                    <div>
                        <div className="text-sm font-black text-orange-800">Toplam Hane: {(options.apartmentFloors || 2) * (options.apartmentRoomsPerFloor || 3)}</div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase">SVG Apartman Şablonunda Çizilecek</div>
                    </div>
                    <i className="fa-solid fa-building text-2xl text-orange-200"></i>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 shadow-inner">
                <CompactToggleGroup
                    label="Değişken Karmaşıklığı (Her Dairedeki Özellik)"
                    selected={options.variableCount || 2}
                    onChange={(v: number) => onChange('variableCount', v)}
                    options={[
                        { value: 1, label: 'Sadece İsim (1D)' },
                        { value: 2, label: 'İsim + Meslek/Hayvan (2D)' },
                        { value: 3, label: 'İsim + Meslek + Hayvan (3D ZOR)' }
                    ]}
                />

                <div className="mt-4 flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Negatif İpuçları İçer ("-değildir")</label>
                    <button
                        onClick={() => onChange('negativeClues', !options.negativeClues)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${options.negativeClues ? 'bg-orange-500' : 'bg-zinc-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${options.negativeClues ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

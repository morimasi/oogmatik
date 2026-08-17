import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: unknown;
    label: string;
}

interface ToggleGroupProps {
    label: string;
    selected: unknown;
    onChange: (val: unknown) => void;
    options: ToggleOption[];
}

const CompactToggleGroup = ({ label, selected, onChange, options }: ToggleGroupProps) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt, idx) => (
                <button key={idx} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
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

export const ApartmentLogicConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 rounded-[2rem] border border-orange-100 dark:border-orange-800/30">

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Kat Sayısı</label>
                        <select
                            value={options.apartmentFloors || 2}
                            onChange={e => onChange('apartmentFloors', parseInt(e.target.value))}
                            className="w-full p-2 bg-white border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                        >
                            <option value={1}>1 Kat (Müstakil)</option>
                            <option value={2}>2 Kat (Standart)</option>
                            <option value={3}>3 Kat (Zorlu)</option>
                            <option value={4}>4 Kat (Gelişmiş Rezidans)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Kattaki Daire</label>
                        <select
                            value={options.apartmentRoomsPerFloor || 3}
                            onChange={e => onChange('apartmentRoomsPerFloor', parseInt(e.target.value))}
                            className="w-full p-2 bg-white border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                        >
                            <option value={2}>2 Daire (Geniş)</option>
                            <option value={3}>3 Daire (Standart)</option>
                            <option value={4}>4 Daire (Kompakt)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Mimari Bina Teması</label>
                        <select
                            value={(options as any).buildingTheme || 'modern'}
                            onChange={e => onChange('buildingTheme' as any, e.target.value)}
                            className="w-full p-2 bg-white border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                        >
                            <option value="modern">Modern Cam (Sky)</option>
                            <option value="classic">Klasik Tuğla (Amber)</option>
                            <option value="colorful">Renkli Konutlar (Emerald)</option>
                            <option value="vintage">Antik Ahşap (Stone)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">A4 Bulmaca Sayısı</label>
                        <select
                            value={(options as any).puzzleCount || 1}
                            onChange={e => onChange('puzzleCount' as any, parseInt(e.target.value))}
                            className="w-full p-2 bg-white border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                        >
                            <option value={1}>1 Büyük Bina (Tam Detaylı)</option>
                            <option value={2}>2 Bina (A4 Kompakt Tam Dolgu)</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-white/60 border border-orange-200/50 rounded-xl flex items-center justify-between shadow-xs">
                    <div>
                        <div className="text-sm font-black text-orange-900">
                            Bina Hanesi: {(options.apartmentFloors || 2) * (options.apartmentRoomsPerFloor || 3)} Daire
                        </div>
                        <div className="text-[9px] font-bold text-zinc-500 uppercase">SVG Vektörel Kat Mimarisi</div>
                    </div>
                    <i className="fa-solid fa-building text-2xl text-orange-400"></i>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 shadow-inner">
                <CompactToggleGroup
                    label="Daire İçi Değişken Tipi (Karmaşıklık)"
                    selected={options.variableCount || 2}
                    onChange={(v: unknown) => onChange('variableCount', v as number)}
                    options={[
                        { value: 1, label: 'Sadece İsim (1D)' },
                        { value: 2, label: 'İsim + Hayvan (2D)' },
                        { value: 3, label: 'İsim + Hayvan + Meslek (3D)' },
                        { value: 4, label: 'İsim + Hayvan + Meslek + Renk (4D)' }
                    ]}
                />

                <div className="mt-4 flex items-center justify-between pt-2 border-t border-zinc-200/40">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase">Olumsuz İpuçları ("-değildir / -oturmamaktadır")</label>
                        <span className="text-[9px] text-zinc-400">Çıkarım yapma ve analitik mantık becerisini artırır</span>
                    </div>
                    <button
                        onClick={() => onChange('negativeClues', !options.negativeClues)}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${options.negativeClues ? 'bg-orange-500' : 'bg-zinc-300'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${options.negativeClues ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

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
        <label className="text-[10px] font-bold text-[var(--text-muted)] text-[var(--text-primary)] uppercase block">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map((opt, idx) => (
                <button key={idx} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] bg-[var(--bg-secondary)] shadow-sm text-[var(--accent-color)] dark:text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-[var(--text-secondary)]'}`}>
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
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Kat Sayısı</label>
                        <select
                            value={options.apartmentFloors || 2}
                            onChange={e => onChange('apartmentFloors', parseInt(e.target.value))}
                            className="w-full p-2 bg-[var(--bg-paper)] border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                        >
                            <option value={1}>1 Kat (Müstakil)</option>
                            <option value={2}>2 Kat (Standart)</option>
                            <option value={3}>3 Kat (Zorlu)</option>
                            <option value={4}>4 Kat (Gelişmiş Rezidans)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Kattaki Daire</label>
                        <select
                            value={options.apartmentRoomsPerFloor || 3}
                            onChange={e => onChange('apartmentRoomsPerFloor', parseInt(e.target.value))}
                            className="w-full p-2 bg-[var(--bg-paper)] border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                        >
                            <option value={2}>2 Daire (Geniş)</option>
                            <option value={3}>3 Daire (Standart)</option>
                            <option value={4}>4 Daire (Kompakt)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Mimari Bina Teması</label>
                        <select
                            value={(options as any).buildingTheme || 'modern'}
                            onChange={e => onChange('buildingTheme' as any, e.target.value)}
                            className="w-full p-2 bg-[var(--bg-paper)] border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
                        >
                            <option value="modern">Modern Cam (Sky)</option>
                            <option value="classic">Klasik Tuğla (Amber)</option>
                            <option value="colorful">Renkli Konutlar (Emerald)</option>
                            <option value="vintage">Antik Ahşap (Stone)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">A4 Bulmaca Sayısı</label>
                        <select
                            value={(options as any).puzzleCount || 1}
                            onChange={e => onChange('puzzleCount' as any, parseInt(e.target.value))}
                            className="w-full p-2 bg-[var(--bg-paper)] border border-orange-200 rounded-xl text-sm font-bold outline-none focus:border-orange-500"
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
                        <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase">SVG Vektörel Kat Mimarisi</div>
                    </div>
                    <i className="fa-solid fa-building text-2xl text-orange-400"></i>
                </div>
            </div>

            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] shadow-inner">
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

                <div className="mt-4 flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Olumsuz İpuçları ("-değildir / -oturmamaktadır")</label>
                        <span className="text-[9px] text-[var(--text-muted)]">Çıkarım yapma ve analitik mantık becerisini artırır</span>
                    </div>
                    <button
                        onClick={() => onChange('negativeClues', !options.negativeClues)}
                        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${options.negativeClues ? 'bg-orange-500' : 'bg-[var(--surface-elevated)]'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-[var(--bg-paper)] absolute top-1 transition-transform ${options.negativeClues ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};

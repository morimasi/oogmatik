
import React, { useState } from 'react';
import { Activity, ActivityType, GeneratorOptions, StudentProfile } from '../types';
import { DIFFICULTY_OPTIONS } from '../constants';

interface GeneratorViewProps {
    activity: Activity;
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
    isExpanded?: boolean;
    onOpenStudentModal?: () => void;
    studentProfile?: StudentProfile | null;
}

// --- COMPACT CONTROL COMPONENTS ---

const CompactSlider = ({ label, value, onChange, min, max, icon, unit = '' }: any) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
            <span className="flex items-center gap-1">
                {icon && <i className={`fa-solid ${icon}`}></i>}
                {label}
            </span>
            <span className="text-indigo-600 font-black">{value}{unit}</span>
        </div>
        <input 
            type="range" min={min} max={max} value={value} 
            onChange={e => onChange(parseInt(e.target.value))} 
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
        />
    </div>
);

const CompactSelect = ({ label, value, onChange, options, icon }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">
            {icon && <i className={`fa-solid ${icon} mr-1`}></i>}
            {label}
        </label>
        <select 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 dark:text-zinc-200"
        >
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const CompactCounter = ({ label, value, onChange, min, max, icon }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">
            {icon && <i className={`fa-solid ${icon} mr-1`}></i>}
            {label}
        </label>
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1">
            <button 
                onClick={() => onChange(Math.max(min, value - 1))} 
                className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-colors"
                disabled={value <= min}
            >
                <i className="fa-solid fa-minus text-[10px]"></i>
            </button>
            <span className="flex-1 text-center text-xs font-bold dark:text-zinc-200">{value}</span>
            <button 
                onClick={() => onChange(Math.min(max, value + 1))} 
                className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-colors"
                disabled={value >= max}
            >
                <i className="fa-solid fa-plus text-[10px]"></i>
            </button>
        </div>
    </div>
);

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
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

const MultiSelectButtons = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-2">{label}</label>
        <div className="flex flex-wrap gap-1.5">
            {options.map((opt: any) => (
                <button 
                    key={opt.value}
                    onClick={() => {
                        const newSelected = selected.includes(opt.value) 
                            ? selected.filter((v: string) => v !== opt.value) 
                            : [...selected, opt.value];
                        if (newSelected.length > 0) onChange(newSelected);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${selected.includes(opt.value) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading, isExpanded = true, onOpenStudentModal, studentProfile }) => {
    const [options, setOptions] = useState<GeneratorOptions>({
        mode: 'fast',
        difficulty: 'Orta',
        worksheetCount: 1,
        itemCount: 8,
        gridSize: 5,
        case: 'upper',
        variant: 'square',
        topic: '',
        // Map Detective Defaults
        mapInstructionTypes: ['spatial_logic', 'linguistic_geo', 'attribute_search', 'neighbor_path'],
        showCityNames: false,
        markerStyle: 'circle',
        emphasizedRegion: 'all'
    });

    const handleChange = (key: keyof GeneratorOptions, value: any) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const renderActivityControls = () => {
        if (activity.id === ActivityType.HIDDEN_PASSWORD_GRID) {
            return (
                <div className="space-y-5">
                    <CompactSlider label="Izgara Boyutu" value={options.gridSize || 5} onChange={(v:number) => handleChange('gridSize', v)} min={3} max={6} icon="fa-border-all" unit="x" />
                    <CompactSlider label="Sayfa Başı Blok" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={1} max={12} icon="fa-table-cells" />
                    <CompactSelect label="Hücre Tasarımı" value={options.variant} onChange={(v:string) => handleChange('variant', v)} options={[{ value: 'square', label: 'Keskin Kare' }, { value: 'rounded', label: 'Yumuşak Köşe' }, { value: 'minimal', label: 'Sadece Çizgi' }]} icon="fa-palette" />
                    <CompactToggleGroup label="Harf Tipi" selected={options.case} onChange={(v: string) => handleChange('case', v)} options={[{ value: 'upper', label: 'BÜYÜK' }, { value: 'lower', label: 'küçük' }]} />
                </div>
            );
        }
        
        if (activity.id === ActivityType.NUMBER_LOGIC_RIDDLES) {
            return (
                <div className="space-y-5">
                    <CompactSlider 
                        label="Soru Sayısı (Blok)" 
                        value={options.itemCount} 
                        onChange={(v:number) => handleChange('itemCount', v)} 
                        min={1} max={12} 
                        icon="fa-list-ol" 
                    />
                    <CompactSelect 
                        label="Sayı Aralığı" 
                        value={options.numberRange || '1-50'} 
                        onChange={(v:string) => handleChange('numberRange', v)} 
                        options={[
                            { value: '1-20', label: '1 - 20 (Kolay)' },
                            { value: '1-50', label: '1 - 50 (Standart)' },
                            { value: '1-100', label: '1 - 100 (Zor)' },
                            { value: '100-1000', label: '100 - 1000 (Uzman)' }
                        ]} 
                        icon="fa-arrow-up-9-1" 
                    />
                </div>
            );
        }

        if (activity.id === ActivityType.MAP_INSTRUCTION) {
            return (
                <div className="space-y-5">
                    <MultiSelectButtons 
                        label="Yönerge Odakları"
                        selected={options.mapInstructionTypes}
                        onChange={(v: string[]) => handleChange('mapInstructionTypes', v)}
                        options={[
                            { value: 'spatial_logic', label: 'Yönler' },
                            { value: 'linguistic_geo', label: 'Harf/Ses' },
                            { value: 'attribute_search', label: 'Bölge/Deniz' },
                            { value: 'neighbor_path', label: 'Rotalar' }
                        ]}
                    />

                    <div className="grid grid-cols-2 gap-3">
                         <CompactSlider label="Yönerge Adedi" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={4} max={16} icon="fa-list-check" />
                         <CompactSelect 
                            label="Odak Bölge" 
                            value={options.emphasizedRegion} 
                            onChange={(v:string) => handleChange('emphasizedRegion', v)} 
                            options={[
                                { value: 'all', label: 'Tüm Türkiye' },
                                { value: 'Marmara', label: 'Marmara' },
                                { value: 'Ege', label: 'Ege' },
                                { value: 'İç Anadolu', label: 'İç Anadolu' },
                                { value: 'Akdeniz', label: 'Akdeniz' },
                                { value: 'Karadeniz', label: 'Karadeniz' }
                            ]}
                            icon="fa-location-dot"
                         />
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactToggleGroup 
                            label="Şehir İsimleri" 
                            selected={options.showCityNames ? 'on' : 'off'} 
                            onChange={(v: string) => handleChange('showCityNames', v === 'on')} 
                            options={[{ value: 'on', label: 'AÇIK' }, { value: 'off', label: 'KAPALI' }]} 
                        />
                        <CompactSelect 
                            label="İşaretçi Stili" 
                            value={options.markerStyle} 
                            onChange={(v:string) => handleChange('markerStyle', v)} 
                            options={[
                                { value: 'dot', label: 'Küçük Nokta' },
                                { value: 'circle', label: 'Halkalı Daire' },
                                { value: 'star', label: 'Yıldız İkonu' },
                                { value: 'target', label: 'Hedef İkonu' }
                            ]} 
                            icon="fa-crosshairs"
                        />
                    </div>
                </div>
            );
        }
        
        return null;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden w-full transition-all duration-300">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm shrink-0 flex items-center justify-between z-10 h-[60px]">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <h3 className="font-bold text-sm dark:text-white truncate max-w-[150px]">{activity.title}</h3>
                </div>
                {isLoading && <i className="fa-solid fa-circle-notch fa-spin text-indigo-500"></i>}
            </div>

            <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <CompactCounter label="Sayfa" value={options.worksheetCount} onChange={(v: number) => handleChange('worksheetCount', v)} min={1} max={10} icon="fa-copy" />
                    <div className="col-span-1">
                        <CompactSelect label="Zorluk" value={options.difficulty} onChange={(v: string) => handleChange('difficulty', v)} options={DIFFICULTY_OPTIONS} icon="fa-gauge-high" />
                    </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-700 pt-4 mb-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Etkinlik Ayarları</h4>
                    {renderActivityControls()}
                </div>
                
                <div className="mt-8 space-y-3">
                    <button 
                        onClick={() => onGenerate({ ...options, mode: 'fast' })}
                        disabled={isLoading}
                        className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700"
                    >
                        <i className="fa-solid fa-bolt"></i> Hızlı Üret (Offline)
                    </button>
                    <button 
                        onClick={() => onGenerate({ ...options, mode: 'ai' })}
                        disabled={isLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI ile Üret (Online)
                    </button>
                </div>
            </div>
        </div>
    );
};

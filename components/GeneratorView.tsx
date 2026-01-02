
import React, { useState } from 'react';
import { Activity, ActivityType, GeneratorOptions, StudentProfile } from '../types';
import { DIFFICULTY_OPTIONS } from '../constants';

// --- HELPER UI COMPONENTS ---

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

const CompactSlider = ({ label, value, onChange, min, max, step, icon }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                {icon && <i className={`fa-solid ${icon}`}></i>}
                {label}
            </label>
            <span className="text-[10px] font-mono font-bold text-indigo-500">{value}</span>
        </div>
        <input 
            type="range" min={min} max={max} step={step} value={value} 
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
    </div>
);

const CompactSelect = ({ label, value, onChange, options, icon }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
            {icon && <i className={`fa-solid ${icon}`}></i>}
            {label}
        </label>
        <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2.5 bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const CompactCheckboxGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</label>
        <div className="grid grid-cols-2 gap-2">
            {options.map((opt: any) => (
                <label key={opt.value} className={`flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer ${selected.includes(opt.value) ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700'}`}>
                    <input 
                        type="checkbox" 
                        checked={selected.includes(opt.value)} 
                        onChange={() => {
                            const next = selected.includes(opt.value) ? selected.filter((v:any) => v !== opt.value) : [...selected, opt.value];
                            onChange(next);
                        }}
                        className="hidden"
                    />
                    <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${selected.includes(opt.value) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-zinc-300'}`}>
                        {selected.includes(opt.value) && <i className="fa-solid fa-check text-[6px]"></i>}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">{opt.label}</span>
                </label>
            ))}
        </div>
    </div>
);

const CompactCounter = ({ label, value, onChange, min, max, icon }: any) => (
    <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
            {icon && <i className={`fa-solid ${icon}`}></i>}
            {label}
        </label>
        <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button onClick={() => onChange(Math.max(min, value - 1))} className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-500 shadow-sm"><i className="fa-solid fa-minus text-[8px]"></i></button>
            <span className="text-xs font-mono font-bold w-4 text-center text-zinc-700 dark:text-zinc-200">{value}</span>
            <button onClick={() => onChange(Math.min(max, value + 1))} className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center text-zinc-500 shadow-sm"><i className="fa-solid fa-plus text-[8px]"></i></button>
        </div>
    </div>
);

// Added missing GeneratorViewProps interface
interface GeneratorViewProps {
    activity: Activity;
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
    isExpanded?: boolean;
    onOpenStudentModal?: () => void;
    studentProfile?: StudentProfile | null;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading, isExpanded = true, onOpenStudentModal, studentProfile }) => {
    const [options, setOptions] = useState<GeneratorOptions>({
        mode: 'fast',
        difficulty: 'Orta',
        worksheetCount: 1,
        itemCount: 4,
        gridSize: 3,
        topic: '',
        distractionLevel: 'medium',
        visualType: 'identity',
        logicModel: 'identity',
        numberRange: '1-50',
        findDiffType: 'linguistic',
        showSumTarget: true,
        mapInstructionTypes: ['spatial_logic', 'linguistic_geo', 'attribute_search'],
        emphasizedRegion: 'all',
        showCityNames: true,
        markerStyle: 'circle'
    });

    const handleChange = (key: keyof GeneratorOptions, value: any) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const renderActivityControls = () => {
        // --- SÖZDE KELİME OKUMA ---
        if (activity.id === ActivityType.PSEUDOWORD_READING) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactToggleGroup 
                        label="Görsel Okuma Desteği" 
                        selected={options.visualMode || 'standard'} 
                        onChange={(v: string) => handleChange('visualMode', v)} 
                        options={[
                            { value: 'standard', label: 'STANDART' },
                            { value: 'bionic', label: 'BİYONİK' },
                            { value: 'rainbow', label: 'RENKLİ' }
                        ]} 
                    />
                    
                    <CompactSlider 
                        label="Kelime Sayısı" 
                        value={options.itemCount || 40} 
                        onChange={(v:number) => handleChange('itemCount', v)} 
                        min={20} max={60} step={10} icon="fa-list-ol" 
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                            <i className="fa-solid fa-info-circle mr-1"></i>
                            Sözde kelimeler, seçilen zorluk seviyesine göre fonetik yapıları (CVC, CCVC vb.) otomatik ayarlanır.
                        </p>
                    </div>
                </div>
            );
        }

        // --- HARİTA DEDEKTİFİ ---
        if (activity.id === ActivityType.MAP_INSTRUCTION) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="Odak Bölge" 
                        value={options.emphasizedRegion} 
                        onChange={(v:any) => handleChange('emphasizedRegion', v)}
                        options={[
                            { value: 'all', label: 'Tüm Türkiye' },
                            { value: 'Marmara', label: 'Marmara Bölgesi' },
                            { value: 'Ege', label: 'Ege Bölgesi' },
                            { value: 'Akdeniz', label: 'Akdeniz Bölgesi' },
                            { value: 'İç Anadolu', label: 'İç Anadolu' },
                            { value: 'Karadeniz', label: 'Karadeniz Bölgesi' },
                            { value: 'Doğu Anadolu', label: 'Doğu Anadolu' },
                            { value: 'Güneydoğu', label: 'Güneydoğu Anadolu' }
                        ]}
                        icon="fa-earth-americas"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactCheckboxGroup 
                            label="Yönerge Türleri" 
                            selected={options.mapInstructionTypes || []}
                            onChange={(v:string[]) => handleChange('mapInstructionTypes', v)}
                            options={[
                                { value: 'spatial_logic', label: 'Konum Mantığı' },
                                { value: 'linguistic_geo', label: 'Harf & Bölge' },
                                { value: 'attribute_search', label: 'Özellik Arama' },
                                { value: 'neighbor_path', label: 'Komşu & Yol' }
                            ]}
                        />
                        <CompactCounter label="Yönerge Sayısı" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={4} max={12} icon="fa-list-ol" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <CompactToggleGroup 
                            label="Şehir İsimleri" 
                            selected={options.showCityNames ? 'on' : 'off'} 
                            onChange={(v: string) => handleChange('showCityNames', v === 'on')} 
                            options={[{ value: 'on', label: 'GÖSTER' }, { value: 'off', label: 'GİZLE' }]} 
                        />
                         <CompactSelect 
                            label="İşaretçi Stili" 
                            value={options.markerStyle} 
                            onChange={(v:any) => handleChange('markerStyle', v)}
                            options={[
                                { value: 'circle', label: 'Daire' },
                                { value: 'star', label: 'Yıldız' },
                                { value: 'target', label: 'Hedef' },
                                { value: 'dot', label: 'Nokta' }
                            ]}
                            icon="fa-location-dot"
                        />
                    </div>
                </div>
            );
        }
        return null;
    }

    if (!isExpanded) {
        return (
            <div className="flex flex-col items-center py-4 gap-4">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500"><i className="fa-solid fa-arrow-left"></i></button>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg"><i className={activity.icon}></i></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-900">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={onBack} className="text-zinc-400 hover:text-zinc-600 transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <button onClick={() => handleChange('mode', 'fast')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${options.mode === 'fast' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-500'}`}>HIZLI</button>
                        <button onClick={() => handleChange('mode', 'ai')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${options.mode === 'ai' ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm' : 'text-zinc-500'}`}>AI</button>
                    </div>
                </div>
                
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-xl shrink-0 shadow-inner">
                        <i className={activity.icon}></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-100 leading-tight">{activity.title}</h2>
                        <p className="text-[10px] text-zinc-500 mt-1 font-medium">{activity.description}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Zorluk Seviyesi</label>
                    <div className="grid grid-cols-2 gap-2">
                        {DIFFICULTY_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleChange('difficulty', opt.value)}
                                className={`py-2 px-3 text-[11px] font-bold rounded-xl border-2 transition-all text-left flex items-center justify-between ${options.difficulty === opt.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-zinc-100 dark:border-zinc-800 text-zinc-500'}`}
                            >
                                {opt.label}
                                {options.difficulty === opt.value && <i className="fa-solid fa-check-circle text-indigo-500"></i>}
                            </button>
                        ))}
                    </div>
                </div>

                {renderActivityControls()}

                <CompactCounter 
                    label="Sayfa Adedi" 
                    value={options.worksheetCount} 
                    onChange={(v:number) => handleChange('worksheetCount', v)} 
                    min={1} max={5} 
                />
            </div>

            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                <button 
                    onClick={() => onGenerate(options)}
                    disabled={isLoading}
                    className="w-full py-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 transform active:scale-95"
                >
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            <span className="uppercase tracking-widest text-xs">Hazırlanıyor...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span className="uppercase tracking-widest text-xs">MATERYAL ÜRET</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

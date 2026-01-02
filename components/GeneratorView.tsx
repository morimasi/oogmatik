
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

const CompactCheckboxGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="grid grid-cols-2 gap-2">
            {options.map((opt: any) => (
                <button 
                    key={opt.value} 
                    onClick={() => {
                        const next = selected.includes(opt.value) 
                            ? selected.filter((v:string) => v !== opt.value)
                            : [...selected, opt.value];
                        if (next.length > 0) onChange(next);
                    }} 
                    className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border-2 transition-all flex items-center gap-2 ${selected.includes(opt.value) ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500'}`}
                >
                    <div className={`w-3 h-3 rounded flex items-center justify-center border ${selected.includes(opt.value) ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300'}`}>
                        {selected.includes(opt.value) && <i className="fa-solid fa-check text-[7px] text-white"></i>}
                    </div>
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

        // --- SAYISAL MANTIK BİLMECELERİ ---
        if (activity.id === ActivityType.NUMBER_LOGIC_RIDDLES) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="Düşünme Modeli" 
                        value={options.logicModel} 
                        onChange={(v:any) => handleChange('logicModel', v)}
                        options={[
                            { value: 'identity', label: 'Sayı Kimliği (Önerme Bazlı)' },
                            { value: 'exclusion', label: 'Eleme / Dışlama Mantığı' },
                            { value: 'sequence', label: 'Dizi ve Örüntü Çıkarımı' },
                            { value: 'cryptarithmetic', label: 'Şifreli İşlem Çözme' }
                        ]}
                        icon="fa-brain-circuit"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactSelect 
                            label="Sayı Evreni" 
                            value={options.numberRange} 
                            onChange={(v:string) => handleChange('numberRange', v)}
                            options={[
                                { value: '1-10', label: 'Tek Basamak (1-10)' },
                                { value: '1-20', label: 'Küçük Onluk (1-20)' },
                                { value: '1-50', label: 'Orta Ölçek (1-50)' },
                                { value: '10-100', label: 'İki Basamak (10-100)' },
                                { value: '100-999', label: 'Üç Basamak (100-999)' }
                            ]}
                            icon="fa-infinity"
                        />
                        <CompactSlider label="İpucu (Önerme) Sayısı" value={options.gridSize || 3} onChange={(v:number) => handleChange('gridSize', v)} min={2} max={6} icon="fa-list-check" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <CompactCounter label="Bilmece Adedi" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={1} max={12} icon="fa-hashtag" />
                        <CompactToggleGroup 
                            label="Toplam Hedefi" 
                            selected={options.showSumTarget ? 'on' : 'off'} 
                            onChange={(v: string) => handleChange('showSumTarget', v === 'on')} 
                            options={[{ value: 'on', label: 'AKTİF' }, { value: 'off', label: 'KAPALI' }]} 
                        />
                    </div>
                </div>
            );
        }

        if (activity.id === ActivityType.FIND_THE_DIFFERENCE) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="Ayrıştırma Odak Alanı" 
                        value={options.findDiffType} 
                        onChange={(v:any) => handleChange('findDiffType', v)}
                        options={[
                            { value: 'linguistic', label: 'Dilsel (Ayna Harfler)' },
                            { value: 'numeric', label: 'Sayısal (Benzer Rakamlar)' },
                            { value: 'semantic', label: 'Semantik (Kelime Avı)' },
                            { value: 'pictographic', label: 'Sembolik (Piktogram)' }
                        ]}
                        icon="fa-bullseye"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactToggleGroup 
                            label="Fark Belirginliği" 
                            selected={options.distractionLevel} 
                            onChange={(v: string) => handleChange('distractionLevel', v)} 
                            options={[
                                { value: 'low', label: 'BELİRGİN' },
                                { value: 'medium', label: 'ORTA' },
                                { value: 'high', label: 'HASSAS' },
                                { value: 'extreme', label: 'MİKRO' }
                            ]} 
                        />
                        <CompactSlider label="Satır Başı Öğe" value={options.gridSize || 4} onChange={(v:number) => handleChange('gridSize', v)} min={3} max={6} icon="fa-table-cells" />
                    </div>

                    <CompactSlider 
                        label="Görev Adedi (Satır)" 
                        value={options.itemCount} 
                        onChange={(v:number) => handleChange('itemCount', v)} 
                        min={4} max={12} 
                        icon="fa-list-ol" 
                    />
                </div>
            );
        }

        if (activity.id === ActivityType.VISUAL_ODD_ONE_OUT) {
            return (
                <div className="space-y-5">
                    <CompactSelect 
                        label="İçerik Mimarisi" 
                        value={options.visualType} 
                        onChange={(v:any) => handleChange('visualType', v)}
                        options={[
                            { value: 'geometric', label: 'Geometrik Formlar' },
                            { value: 'abstract', label: 'Soyut Desenler' },
                            { value: 'character', label: 'Ayna Harf/Rakam' },
                            { value: 'complex', label: 'Karmaşık Çizgiler' }
                        ]}
                        icon="fa-shapes"
                    />

                    <CompactSlider 
                        label="Görev Sayısı (Satır)" 
                        value={options.itemCount} 
                        onChange={(v:number) => handleChange('itemCount', v)} 
                        min={4} max={12} 
                        icon="fa-list" 
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactToggleGroup 
                            label="Fark Belirginliği" 
                            selected={options.distractionLevel} 
                            onChange={(v: string) => handleChange('distractionLevel', v)} 
                            options={[
                                { value: 'low', label: 'Belirgin' },
                                { value: 'medium', label: 'Orta' },
                                { value: 'high', label: 'Hassas' },
                                { value: 'extreme', label: 'Minimal' }
                            ]} 
                        />
                        <CompactSlider label="Satır Başı Öğe" value={options.gridSize || 4} onChange={(v:number) => handleChange('gridSize', v)} min={3} max={6} icon="fa-table-cells" />
                    </div>
                </div>
            );
        }

        if (activity.id === ActivityType.GRID_DRAWING || activity.id === ActivityType.SYMMETRY_DRAWING) {
            const isSymmetry = activity.id === ActivityType.SYMMETRY_DRAWING;
            return (
                <div className="space-y-5">
                    <CompactSlider 
                        label="Izgara Boyutu" 
                        value={options.gridSize || 6} 
                        onChange={(v:number) => handleChange('gridSize', v)} 
                        min={3} max={12} icon="fa-border-all" unit="x" 
                    />
                    
                    {!isSymmetry && (
                        <CompactSelect 
                            label="Dönüşüm Modu" 
                            value={options.concept || 'copy'} 
                            onChange={(v:any) => handleChange('concept', v)}
                            options={[
                                { value: 'copy', label: 'Birebir Kopyalama' },
                                { value: 'mirror_v', label: 'Dikey Simetri (Ayna)' },
                                { value: 'mirror_h', label: 'Yatay Simetri' },
                                { value: 'rotate_90', label: '90 Derece Rotasyon' },
                                { value: 'rotate_180', label: '180 Derece Rotasyon' }
                            ]}
                            icon="fa-arrows-spin"
                        />
                    )}

                    {isSymmetry && (
                        <CompactToggleGroup 
                            label="Simetri Ekseni" 
                            selected={options.visualType || 'vertical'} 
                            onChange={(v: string) => handleChange('visualType', v)} 
                            options={[{ value: 'vertical', label: 'DİKEY' }, { value: 'horizontal', label: 'YATAY' }]} 
                        />
                    )}

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactToggleGroup 
                            label="Koordinat Sistemi" 
                            selected={options.useSearch ? 'on' : 'off'} 
                            onChange={(v: string) => handleChange('showCoords', v === 'on')} 
                            options={[{ value: 'on', label: 'GÖSTER' }, { value: 'off', label: 'GİZLE' }]} 
                        />
                        <CompactSlider label="Desen Karmaşıklığı" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={2} max={10} icon="fa-wand-magic-sparkles" />
                    </div>
                </div>
            );
        }

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

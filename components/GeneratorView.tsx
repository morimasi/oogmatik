
import React, { useState, useEffect, useCallback } from 'react';
import { Activity, GeneratorOptions, ActivityType, StudentProfile } from '../types';
import { statsService } from '../services/statsService';

interface GeneratorViewProps {
    activity: Activity;
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
    isExpanded?: boolean;
    onOpenStudentModal?: () => void;
    studentProfile?: StudentProfile | null;
}

// --- MODULAR INPUT COMPONENTS ---

const SettingLabel = ({ label, icon, tooltip }: { label: string, icon?: string, tooltip?: string }) => (
    <div className="flex items-center gap-2 mb-1.5 group">
        {icon && <i className={`fa-solid ${icon} text-zinc-400 group-hover:text-indigo-500 transition-colors`}></i>}
        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wide">{label}</span>
        {tooltip && <i className="fa-solid fa-circle-info text-zinc-300 text-[10px] cursor-help" title={tooltip}></i>}
    </div>
);

const CounterInput = ({ label, value, onChange, min = 1, max = 20, icon }: any) => (
    <div className="flex flex-col">
        <SettingLabel label={label} icon={icon} />
        <div className="flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg h-9 px-1 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <button onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-30" disabled={value <= min}><i className="fa-solid fa-minus text-[10px]"></i></button>
            <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
                className="flex-1 text-center bg-transparent font-bold text-sm outline-none appearance-none text-zinc-800 dark:text-zinc-100"
            />
            <button onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-30" disabled={value >= max}><i className="fa-solid fa-plus text-[10px]"></i></button>
        </div>
    </div>
);

const SelectInput = ({ label, value, onChange, options, icon }: any) => (
    <div className="flex flex-col">
        <SettingLabel label={label} icon={icon} />
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-9 pl-3 pr-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-sm transition-all"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none"></i>
        </div>
    </div>
);

const SliderInput = ({ label, value, onChange, min, max, step = 1, icon, unit = '' }: any) => (
    <div className="flex flex-col">
        <div className="flex justify-between items-center mb-1.5">
            <SettingLabel label={label} icon={icon} />
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">{value}{unit}</span>
        </div>
        <input 
            type="range" 
            min={min} 
            max={max} 
            step={step} 
            value={value} 
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
    </div>
);

const ToggleGroup = ({ label, options, selected, onChange, icon, multi = false }: any) => (
    <div className="flex flex-col">
        <SettingLabel label={label} icon={icon} />
        <div className="flex flex-wrap gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => {
                const isActive = multi ? selected.includes(opt.value) : selected === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => {
                            if (multi) {
                                const newSel = isActive ? selected.filter((v: any) => v !== opt.value) : [...selected, opt.value];
                                if (newSel.length > 0) onChange(newSel); // Prevent empty selection
                            } else {
                                onChange(opt.value);
                            }
                        }}
                        className={`flex-1 py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                            isActive 
                            ? 'bg-white dark:bg-zinc-600 text-indigo-600 shadow-sm ring-1 ring-black/5' 
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/50'
                        }`}
                        title={opt.label}
                    >
                        {opt.icon && <i className={`fa-solid ${opt.icon} mr-1`}></i>}
                        {opt.shortLabel || opt.label}
                    </button>
                );
            })}
        </div>
    </div>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer group p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-100">
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-zinc-300 text-transparent'}`}>
            <i className="fa-solid fa-check text-[10px]"></i>
        </div>
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 select-none group-hover:text-indigo-600">{label}</span>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="hidden" />
    </label>
);

// --- CONFIGURATION MAPPING ---

const DIFFICULTY_OPTIONS = [
    { value: 'Başlangıç', label: 'Başlangıç' },
    { value: 'Orta', label: 'Orta' },
    { value: 'Zor', label: 'Zor' },
    { value: 'Uzman', label: 'Uzman' }
];

// Activity specific configurations
const getActivityConfig = (type: ActivityType) => {
    // Default Config
    const baseConfig = {
        sections: [
            {
                id: 'general', title: 'Genel Ayarlar',
                fields: ['worksheetCount', 'difficulty']
            },
            {
                id: 'content', title: 'İçerik Detayları',
                fields: ['itemCount']
            }
        ]
    };

    // Math Activities Config
    if (['BASIC_OPERATIONS', 'MATH_PUZZLE', 'KENDOKU', 'NUMBER_PYRAMID'].includes(type)) {
        return {
            sections: [
                { id: 'general', title: 'Genel', fields: ['worksheetCount', 'difficulty'] },
                { id: 'math', title: 'Matematik Ayarları', fields: ['operationType', 'numberRange', 'itemCount'] },
                { id: 'advanced', title: 'İşlem Kuralları', fields: ['allowCarry', 'allowBorrow', 'allowRemainder'] }
            ]
        };
    }

    // Word Search & Grids
    if (['WORD_SEARCH', 'WORD_SEARCH_WITH_PASSWORD', 'LETTER_GRID_WORD_FIND'].includes(type)) {
        return {
            sections: [
                { id: 'general', title: 'Genel', fields: ['worksheetCount', 'difficulty'] },
                { id: 'grid', title: 'Izgara ve Kelimeler', fields: ['gridSize', 'itemCount', 'wordDirections', 'case'] },
                { id: 'topic', title: 'Konu', fields: ['topic'] }
            ]
        };
    }

    // Visual Perception
    if (['FIND_THE_DIFFERENCE', 'VISUAL_ODD_ONE_OUT', 'SHAPE_MATCHING'].includes(type)) {
        return {
            sections: [
                { id: 'general', title: 'Genel', fields: ['worksheetCount', 'difficulty'] },
                { id: 'visual', title: 'Görsel Ayarları', fields: ['itemCount', 'visualComplexity'] }
            ]
        };
    }

    return baseConfig;
};

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading, isExpanded = true, onOpenStudentModal, studentProfile }) => {
    const [options, setOptions] = useState<GeneratorOptions>({
        mode: 'fast',
        difficulty: 'Orta',
        worksheetCount: 1,
        itemCount: 10,
        gridSize: 10,
        operationType: 'mixed',
        selectedOperations: ['+','-'],
        numberRange: '1-20',
        allowCarry: true,
        allowBorrow: true,
        allowRemainder: false,
        wordLength: { min: 3, max: 8 },
        case: 'upper',
        directions: 'diagonal',
        customInput: '',
        topic: ''
    });

    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        setIsFavorite(statsService.isFavorite(activity.id));
    }, [activity.id]);

    const handleToggleFavorite = () => {
        statsService.toggleFavorite(activity.id);
        setIsFavorite(!isFavorite);
    };

    const handleChange = (key: string, value: any) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    const config = getActivityConfig(activity.id);

    // --- RENDER HELPERS ---

    const renderField = (fieldId: string) => {
        switch (fieldId) {
            case 'worksheetCount':
                return <CounterInput label="Sayfa Sayısı" value={options.worksheetCount} onChange={(v: number) => handleChange('worksheetCount', v)} min={1} max={20} icon="fa-copy" />;
            
            case 'itemCount':
                return <CounterInput label="Soru / Öğe Sayısı" value={options.itemCount} onChange={(v: number) => handleChange('itemCount', v)} min={1} max={50} icon="fa-list-ol" />;
            
            case 'difficulty':
                return <SelectInput label="Zorluk Seviyesi" value={options.difficulty} onChange={(v: string) => handleChange('difficulty', v)} options={DIFFICULTY_OPTIONS} icon="fa-gauge-high" />;
            
            case 'gridSize':
                return <SliderInput label="Izgara Boyutu" value={options.gridSize} onChange={(v: number) => handleChange('gridSize', v)} min={5} max={20} icon="fa-border-all" unit="x" />;
            
            case 'operationType':
                return <ToggleGroup 
                    label="İşlem Türü" 
                    icon="fa-calculator"
                    selected={options.operationType} 
                    onChange={(v: string) => handleChange('operationType', v)} 
                    options={[
                        { value: 'mixed', label: 'Karışık', shortLabel: 'Karışık' },
                        { value: 'add', label: 'Toplama', shortLabel: '+' },
                        { value: 'sub', label: 'Çıkarma', shortLabel: '-' },
                        { value: 'mult', label: 'Çarpma', shortLabel: 'x' },
                        { value: 'div', label: 'Bölme', shortLabel: '÷' }
                    ]} 
                />;

            case 'numberRange':
                return <SelectInput 
                    label="Sayı Aralığı" 
                    value={options.numberRange} 
                    onChange={(v: string) => handleChange('numberRange', v)} 
                    icon="fa-arrow-up-9-1"
                    options={[
                        { value: '1-10', label: '1 - 10 Arası' },
                        { value: '1-20', label: '1 - 20 Arası' },
                        { value: '1-50', label: '1 - 50 Arası' },
                        { value: '1-100', label: '1 - 100 Arası' },
                        { value: '100-1000', label: '100 - 1000 Arası' }
                    ]} 
                />;

            case 'allowCarry':
                return <Checkbox label="Eldeli Toplama Olsun" checked={options.allowCarry} onChange={(v: boolean) => handleChange('allowCarry', v)} />;
            
            case 'allowBorrow':
                return <Checkbox label="Onluk Bozma Olsun" checked={options.allowBorrow} onChange={(v: boolean) => handleChange('allowBorrow', v)} />;
            
            case 'allowRemainder':
                return <Checkbox label="Kalanlı Bölme Olsun" checked={options.allowRemainder} onChange={(v: boolean) => handleChange('allowRemainder', v)} />;

            case 'wordDirections':
                return <ToggleGroup 
                    label="Yönler" 
                    selected={options.directions} 
                    onChange={(v: string) => handleChange('directions', v)} 
                    icon="fa-arrows-up-down-left-right"
                    options={[
                        { value: 'simple', label: 'Basit (→ ↓)' },
                        { value: 'diagonal', label: 'Çapraz Dahil' },
                        { value: 'all', label: 'Tüm Yönler' }
                    ]} 
                />;

            case 'case':
                return <ToggleGroup 
                    label="Harf Durumu" 
                    selected={options.case} 
                    onChange={(v: string) => handleChange('case', v)} 
                    icon="fa-font"
                    options={[
                        { value: 'upper', label: 'BÜYÜK' },
                        { value: 'lower', label: 'küçük' }
                    ]} 
                />;

            case 'topic':
                return (
                    <div>
                        <SettingLabel label="Konu / Tema" icon="fa-tag" />
                        <input type="text" value={options.topic} onChange={(e) => handleChange('topic', e.target.value)} placeholder="Örn: Doğa, Uzay..." className="w-full h-9 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                );

            case 'visualComplexity':
                return <SelectInput label="Görsel Karmaşıklık" value={options.difficulty} onChange={(v: string) => handleChange('difficulty', v)} options={[{value:'Başlangıç', label:'Basit'}, {value:'Orta', label:'Normal'}, {value:'Zor', label:'Detaylı'}]} icon="fa-image" />;

            default:
                return null;
        }
    };

    // Minimal View (Collapsed Sidebar)
    if (!isExpanded) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-zinc-800 items-center py-2 border-r border-zinc-200 dark:border-zinc-700 w-[72px]">
                <button onClick={onBack} className="mb-4 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-2" title="Geri"><i className="fa-solid fa-arrow-left"></i></button>
                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-lg mb-4 shadow-sm"><i className={activity.icon}></i></div>
                <div className="mt-auto pb-4">
                     <button onClick={() => onGenerate(options)} disabled={isLoading} className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg flex items-center justify-center transition-all disabled:opacity-50">
                        {isLoading ? <i className="fa-solid fa-circle-notch fa-spin text-sm"></i> : <i className="fa-solid fa-play text-sm"></i>}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden w-80">
            {/* Header */}
            <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/90 backdrop-blur-sm shrink-0 flex items-center justify-between z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={onBack} className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate uppercase tracking-tight">{activity.title}</h2>
                </div>
                <button onClick={handleToggleFavorite} className={`text-sm transition-all p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isFavorite ? 'text-rose-500' : 'text-zinc-300 hover:text-zinc-500'}`}><i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`}></i></button>
            </div>

            {/* Settings Body */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                
                {/* Mode Switcher */}
                <div>
                    <SettingLabel label="Üretim Modu" icon="fa-robot" />
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        {['fast', 'ai', 'manual'].map((m) => (
                            <button
                                key={m}
                                onClick={() => handleChange('mode', m)}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-[4px] transition-all flex items-center justify-center gap-1.5 ${options.mode === m 
                                    ? 'bg-white dark:bg-zinc-600 text-indigo-600 shadow-sm ring-1 ring-black/5' 
                                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                            >
                                <i className={`fa-solid ${m === 'fast' ? 'fa-bolt' : m === 'ai' ? 'fa-wand-magic-sparkles' : 'fa-keyboard'}`}></i>
                                {m === 'fast' ? 'Hızlı' : m === 'ai' ? 'AI' : 'Manuel'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Configuration Sections */}
                {options.mode !== 'manual' && config.sections.map((section: any) => (
                    <div key={section.id} className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">{section.title}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {section.fields.map((fieldId: string) => (
                                <div key={fieldId}>{renderField(fieldId)}</div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Manual Input Mode */}
                {options.mode === 'manual' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 pb-1 border-b border-zinc-100 dark:border-zinc-800">
                            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Manuel Veri</span>
                        </div>
                        <textarea
                            className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none h-40 resize-none font-mono text-xs leading-relaxed text-zinc-700 dark:text-zinc-200"
                            placeholder="Her satıra bir kelime veya virgülle ayırarak yazın..."
                            value={options.customInput}
                            onChange={(e) => handleChange('customInput', e.target.value)}
                        ></textarea>
                        <p className="text-[10px] text-zinc-400"><i className="fa-solid fa-circle-info mr-1"></i>En az 2 öğe giriniz.</p>
                        
                        {/* Common settings for manual mode too */}
                        {renderField('worksheetCount')}
                        {['WORD_SEARCH', 'CROSSWORD'].includes(activity.id) && renderField('gridSize')}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 space-y-3 z-20">
                {onOpenStudentModal && (
                    <button 
                        onClick={onOpenStudentModal}
                        className={`w-full py-2 rounded-lg border border-dashed transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider ${studentProfile ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-zinc-300 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600'}`}
                    >
                        <i className={`fa-solid ${studentProfile ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                        {studentProfile ? studentProfile.name : 'Öğrenci Bilgisi Ekle'}
                    </button>
                )}

                <button
                    onClick={() => onGenerate(options)}
                    disabled={isLoading || (options.mode === 'manual' && (!options.customInput || options.customInput.trim().length < 2))}
                    className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            <span>Hazırlanıyor...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span>OLUŞTUR</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

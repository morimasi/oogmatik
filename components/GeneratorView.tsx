
import React, { useState, useEffect } from 'react';
import { Activity, GeneratorOptions, ActivityType, StudentProfile, Student } from '../types';
import { statsService } from '../services/statsService';
import { useStudent } from '../context/StudentContext';

interface GeneratorViewProps {
    activity: Activity | undefined; 
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
    isExpanded?: boolean;
    onOpenStudentModal?: () => void;
    studentProfile?: StudentProfile | null;
}

const Label = ({ children, icon }: { children?: React.ReactNode, icon?: string }) => (
    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">
        {icon && <i className={`fa-solid ${icon}`}></i>}
        <span>{children}</span>
    </div>
);

const CompactCounter = ({ label, value, onChange, min = 1, max = 50, icon }: any) => (
    <div className="flex flex-col">
        <Label icon={icon}>{label}</Label>
        <div className="flex items-center bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded h-8 px-0.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
            <button onClick={() => onChange(Math.max(min, value - 1))} className="w-6 h-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-30 flex items-center justify-center" disabled={value <= min}><i className="fa-solid fa-minus text-[9px]"></i></button>
            <input
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
                className="flex-1 text-center bg-transparent font-bold text-xs outline-none appearance-none text-zinc-700 dark:text-zinc-200"
            />
            <button onClick={() => onChange(Math.min(max, value + 1))} className="w-6 h-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors disabled:opacity-30 flex items-center justify-center" disabled={value >= max}><i className="fa-solid fa-plus text-[9px]"></i></button>
        </div>
    </div>
);

const CompactSelect = ({ label, value, onChange, options, icon }: any) => (
    <div className="flex flex-col w-full">
        <Label icon={icon}>{label}</Label>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-8 pl-2 pr-6 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-sm transition-all"
            >
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 pointer-events-none"></i>
        </div>
    </div>
);

const CompactSlider = ({ label, value, onChange, min, max, step = 1, icon, unit = '' }: any) => (
    <div className="flex flex-col w-full">
        <div className="flex justify-between items-center mb-1">
            <Label icon={icon}>{label}</Label>
            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">{value}{unit}</span>
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

const CompactToggleGroup = ({ label, options, selected, onChange, icon, multi = false }: any) => (
    <div className="flex flex-col w-full">
        <Label icon={icon}>{label}</Label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => {
                const isActive = multi ? selected.includes(opt.value) : selected === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => {
                            if (multi) {
                                const newSel = isActive ? selected.filter((v: any) => v !== opt.value) : [...selected, opt.value];
                                if (newSel.length > 0) onChange(newSel); 
                            } else {
                                onChange(opt.value);
                            }
                        }}
                        className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-tight rounded-[3px] transition-all flex items-center justify-center gap-1 ${
                            isActive 
                            ? 'bg-white dark:bg-zinc-600 text-indigo-600 shadow-sm ring-1 ring-black/5' 
                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200/50'
                        }`}
                        title={opt.label}
                    >
                        {opt.icon && <i className={`fa-solid ${opt.icon}`}></i>}
                        {opt.shortLabel || opt.label}
                    </button>
                );
            })}
        </div>
    </div>
);

const CompactCheckbox = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer group p-1.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-100">
        <div className={`w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-all ${checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-zinc-300 text-transparent'}`}>
            <i className="fa-solid fa-check text-[8px]"></i>
        </div>
        <span className={`text-[11px] font-medium select-none ${checked ? 'text-zinc-800 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'}`}>{label}</span>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="hidden" />
    </label>
);

const DIFFICULTY_OPTIONS = [
    { value: 'Başlangıç', label: 'Başlangıç' },
    { value: 'Orta', label: 'Orta' },
    { value: 'Zor', label: 'Zor' },
    { value: 'Uzman', label: 'Uzman' }
];

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading, isExpanded = true, onOpenStudentModal, studentProfile }) => {
    const { activeStudent } = useStudent();
    
    const [options, setOptions] = useState<GeneratorOptions>({
        mode: 'fast',
        difficulty: 'Orta',
        worksheetCount: 1,
        itemCount: 4,
        gridSize: 10,
        operationType: 'mixed',
        selectedOperations: ['add','sub'],
        numberRange: '1-50',
        allowCarry: true,
        allowBorrow: true,
        allowRemainder: false,
        pyramidType: 'add',
        num1Digits: 2,
        num2Digits: 1,
        useThirdNumber: false,
        topic: '',
        useSearch: false,
        codeLength: 3, // For hints per riddle in logic riddles
    });

    useEffect(() => {
        if (activity) {
            const defaults: any = {
                BASIC_OPERATIONS: 25,
                MATH_PUZZLE: 12,
                NUMBER_SEARCH: 30,
                NUMBER_PYRAMID: 2,
                KENDOKU: 4,
                ODD_EVEN_SUDOKU: 1,
                CLOCK_READING: 8,
                MONEY_COUNTING: 4,
                MATH_MEMORY_CARDS: 6,
                NUMBER_LOGIC_RIDDLES: 4
            };
            setOptions(prev => ({...prev, itemCount: defaults[activity.id] || 20}));
        }
    }, [activity?.id]);

    const handleChange = (key: string, value: any) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    if (!activity) return null;

    const renderMathControls = () => (
        <div className="space-y-5">
            {activity.id === ActivityType.NUMBER_LOGIC_RIDDLES && (
                <>
                    <CompactSelect 
                        label="Sayı Aralığı" 
                        value={options.numberRange} 
                        onChange={(v:string) => handleChange('numberRange', v)} 
                        options={[
                            { value: '1-20', label: '1 - 20 (Starter)' },
                            { value: '1-50', label: '1 - 50 (Standard)' },
                            { value: '1-100', label: '1 - 100 (Advanced)' },
                            { value: '1-200', label: '1 - 200 (Expert)' }
                        ]} 
                        icon="fa-arrow-up-9-1"
                    />
                    <CompactSlider 
                        label="Bilmece Başına İpucu" 
                        value={options.codeLength} 
                        onChange={(v:number) => handleChange('codeLength', v)} 
                        min={2} max={5} 
                        icon="fa-list-ul"
                    />
                    <div className="bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
                        <CompactCheckbox 
                            label="Büyük Toplam Yarışı" 
                            checked={options.useThirdNumber} 
                            onChange={(v:boolean) => handleChange('useThirdNumber', v)} 
                        />
                        <p className="text-[9px] text-zinc-500 px-1.5 italic">Cevapların toplamı alt kutudaki sayıya eşit olur.</p>
                    </div>
                </>
            )}

            {activity.id === ActivityType.BASIC_OPERATIONS && (
                <>
                    <CompactToggleGroup 
                        label="İşlem Türü" 
                        multi
                        selected={options.selectedOperations} 
                        onChange={(v: string[]) => handleChange('selectedOperations', v)} 
                        options={[
                            { value: 'add', label: 'Toplama', shortLabel: '+' },
                            { value: 'sub', label: 'Çıkarma', shortLabel: '-' },
                            { value: 'mult', label: 'Çarpma', shortLabel: 'x' },
                            { value: 'div', label: 'Bölme', shortLabel: '÷' }
                        ]} 
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <CompactCounter label="Üst Sayı Basamak" value={options.num1Digits} onChange={(v:number)=>handleChange('num1Digits', v)} min={1} max={4} />
                        <CompactCounter label="Alt Sayı Basamak" value={options.num2Digits} onChange={(v:number)=>handleChange('num2Digits', v)} min={1} max={4} />
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
                        <CompactCheckbox label="Eldeli Toplama" checked={options.allowCarry} onChange={(v:boolean)=>handleChange('allowCarry', v)} />
                        <CompactCheckbox label="Onluk Bozma" checked={options.allowBorrow} onChange={(v:boolean)=>handleChange('allowBorrow', v)} />
                        <CompactCheckbox label="Kalanlı Bölme" checked={options.allowRemainder} onChange={(v:boolean)=>handleChange('allowRemainder', v)} />
                        <CompactCheckbox label="3 Sayı Topla (Zincir)" checked={options.useThirdNumber} onChange={(v:boolean)=>handleChange('useThirdNumber', v)} />
                    </div>
                </>
            )}

            {activity.id === ActivityType.NUMBER_PYRAMID && (
                <CompactToggleGroup 
                    label="Piramit Türü" 
                    selected={options.pyramidType} 
                    onChange={(v: string) => handleChange('pyramidType', v)} 
                    options={[
                        { value: 'add', label: 'Toplama' },
                        { value: 'sub', label: 'Çıkarma' },
                        { value: 'mult', label: 'Çarpma' }
                    ]} 
                />
            )}

            {(activity.id === ActivityType.KENDOKU || activity.id === ActivityType.ODD_EVEN_SUDOKU) && (
                <CompactSlider label="Izgara Boyutu" value={options.gridSize} onChange={(v:number)=>handleChange('gridSize', v)} min={3} max={9} icon="fa-border-all" />
            )}

            {activity.id === ActivityType.NUMBER_PATTERN && (
                <CompactSelect 
                    label="Örüntü Tipi" 
                    value={options.patternType} 
                    onChange={(v:string)=>handleChange('patternType', v)} 
                    options={[
                        {value: 'arithmetic', label: 'Artimetik (+/-)'},
                        {value: 'geometric', label: 'Geometrik (x/÷)'},
                        {value: 'complex', label: 'Karmaşık Adımlı'}
                    ]} 
                />
            )}
            
            {activity.id === ActivityType.CLOCK_READING && (
                <CompactSelect 
                    label="Saat Formatı" 
                    value={options.visualStyle} 
                    onChange={(v:string)=>handleChange('visualStyle', v)} 
                    options={[
                        {value: 'analog', label: 'Analog -> Dijital'},
                        {value: 'digital', label: 'Dijital -> Analog'},
                        {value: 'mixed', label: 'Karışık'}
                    ]} 
                />
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden w-80">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm shrink-0 flex items-center justify-between z-10 h-[60px]">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={onBack} className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate uppercase tracking-tight">{activity.title}</h2>
                </div>
                <i className="fa-solid fa-sliders text-zinc-300"></i>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                {/* Mode Switcher */}
                <div className="mb-6">
                    <Label icon="fa-robot">Üretim Modu</Label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                        {['fast', 'ai'].map((m) => (
                            <button
                                key={m}
                                onClick={() => handleChange('mode', m)}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-[3px] transition-all flex items-center justify-center gap-1.5 ${options.mode === m 
                                    ? 'bg-white dark:bg-zinc-600 text-indigo-600 shadow-sm' 
                                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                            >
                                <i className={`fa-solid ${m === 'fast' ? 'fa-bolt' : 'fa-wand-magic-sparkles'}`}></i>
                                {m === 'fast' ? 'Hızlı (Offline)' : 'AI (Zeki)'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <CompactCounter label="Sayfa Sayısı" value={options.worksheetCount} onChange={(v: number) => handleChange('worksheetCount', v)} min={1} max={10} icon="fa-copy" />
                    <CompactCounter label="Soru Adedi" value={options.itemCount} onChange={(v: number) => handleChange('itemCount', v)} min={1} max={60} icon="fa-list-ol" />
                    <div className="col-span-2">
                        <CompactSelect label="Zorluk Seviyesi" value={options.difficulty} onChange={(v: string) => handleChange('difficulty', v)} options={DIFFICULTY_OPTIONS} icon="fa-gauge-high" />
                    </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-700 pt-4 mb-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Etkinlik Ayarları</h4>
                    {renderMathControls()}
                </div>

                {options.mode === 'ai' && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm"><i className="fa-brands fa-google"></i></div>
                                <div>
                                    <label className="text-[10px] font-bold text-blue-800 dark:text-blue-200 uppercase block">Google Arama</label>
                                    <p className="text-[9px] text-blue-600 dark:text-blue-300">İnternet verisi kullan.</p>
                                </div>
                            </div>
                            <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${options.useSearch ? 'bg-blue-600' : 'bg-zinc-300'}`} onClick={() => handleChange('useSearch', !options.useSearch)}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${options.useSearch ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
                <button
                    onClick={() => onGenerate(options)}
                    disabled={isLoading}
                    className="w-full h-11 bg-zinc-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-50 text-white font-black rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 text-sm uppercase"
                >
                    {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                    {isLoading ? 'HAZIRLANIYOR' : 'OLUŞTUR'}
                </button>
            </div>
        </div>
    );
};

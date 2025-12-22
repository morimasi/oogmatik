
import React, { useState, useEffect } from 'react';
import { Activity, GeneratorOptions, ActivityType, StudentProfile, Student } from '../types';
import { statsService } from '../services/statsService';
import { useStudent } from '../context/StudentContext';

interface GeneratorViewProps {
    activity: Activity | undefined; // Allow undefined
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
    isExpanded?: boolean;
    onOpenStudentModal?: () => void;
    studentProfile?: StudentProfile | null;
}

// --- ULTRA COMPACT INPUT COMPONENTS ---

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
    const { students, setActiveStudent, activeStudent } = useStudent();
    
    const getDefaultCount = (type: string) => {
        if (['BASIC_OPERATIONS', 'MATH_PUZZLE'].includes(type)) return 40; 
        if (['NUMBER_SEARCH', 'FIND_THE_DIFFERENCE', 'VISUAL_ODD_ONE_OUT'].includes(type)) return 24;
        if (['WORD_SEARCH', 'CROSSWORD'].includes(type)) return 20; 
        if (['STORY_COMPREHENSION', 'READING_FLOW'].includes(type)) return 1; 
        return 20;
    };

    const [options, setOptions] = useState<GeneratorOptions>({
        mode: 'fast',
        difficulty: 'Orta',
        worksheetCount: 1,
        itemCount: activity ? getDefaultCount(activity.id) : 20,
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
        topic: '',
        useSearch: false
    });

    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if(activity) setIsFavorite(statsService.isFavorite(activity.id));
    }, [activity]);
    
    useEffect(() => {
        if (activity && options.mode === 'fast') {
            setOptions(prev => ({...prev, itemCount: getDefaultCount(activity.id)}));
        }
    }, [options.mode, activity]);

    const handleToggleFavorite = () => {
        if (!activity) return;
        statsService.toggleFavorite(activity.id);
        setIsFavorite(!isFavorite);
    };

    const handleChange = (key: string, value: any) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
    };

    const handleQuickStudentSelect = (studentId: string) => {
        const student = students.find(s => s.id === studentId);
        if (student) {
            setActiveStudent(student);
            handleChange('topic', student.interests?.[0] || '');
        } else {
            setActiveStudent(null);
        }
    };

    if (!activity) return null;

    // --- CONTROLS RENDERER ---
    
    const CommonControls = () => (
        <div className="grid grid-cols-2 gap-3 mb-4">
            <CompactCounter label="Varyasyon Sayısı" value={options.worksheetCount} onChange={(v: number) => handleChange('worksheetCount', v)} min={1} max={20} icon="fa-copy" />
            <CompactCounter label="Öğe Sayısı (Adet)" value={options.itemCount} onChange={(v: number) => handleChange('itemCount', v)} min={1} max={60} icon="fa-list-ol" />
            <div className="col-span-2">
                <CompactSelect label="Zorluk Seviyesi" value={options.difficulty} onChange={(v: string) => handleChange('difficulty', v)} options={DIFFICULTY_OPTIONS} icon="fa-gauge-high" />
            </div>
        </div>
    );

    const MathControls = () => (
        <div className="space-y-4">
            <div className="col-span-2">
                <CompactToggleGroup 
                    label="İşlem Türü" 
                    icon="fa-calculator"
                    selected={options.operationType} 
                    onChange={(v: string) => handleChange('operationType', v)} 
                    options={[
                        { value: 'mixed', label: 'Karışık' },
                        { value: 'add', label: 'Toplama', shortLabel: '+' },
                        { value: 'sub', label: 'Çıkarma', shortLabel: '-' },
                        { value: 'mult', label: 'Çarpma', shortLabel: 'x' },
                        { value: 'div', label: 'Bölme', shortLabel: '÷' }
                    ]} 
                />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <CompactSelect 
                    label="Sayı Aralığı" 
                    value={options.numberRange} 
                    onChange={(v: string) => handleChange('numberRange', v)} 
                    icon="fa-arrow-up-9-1"
                    options={[
                        { value: '1-10', label: '1 - 10' },
                        { value: '1-20', label: '1 - 20' },
                        { value: '1-50', label: '1 - 50' },
                        { value: '1-100', label: '1 - 100' },
                        { value: '100-1000', label: '100+' }
                    ]} 
                />
                
                <div className="flex flex-col gap-1 pt-4">
                    {['add', 'mixed', 'addsub'].includes(options.operationType || '') && (
                        <CompactCheckbox label="Eldeli Toplama" checked={options.allowCarry} onChange={(v: boolean) => handleChange('allowCarry', v)} />
                    )}
                    {['sub', 'mixed', 'addsub'].includes(options.operationType || '') && (
                        <CompactCheckbox label="Onluk Bozma" checked={options.allowBorrow} onChange={(v: boolean) => handleChange('allowBorrow', v)} />
                    )}
                    {['div', 'mixed', 'multdiv'].includes(options.operationType || '') && (
                        <CompactCheckbox label="Kalanlı Bölme" checked={options.allowRemainder} onChange={(v: boolean) => handleChange('allowRemainder', v)} />
                    )}
                </div>
            </div>
        </div>
    );

    const WordControls = () => (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <CompactSlider label="Izgara Boyutu" value={options.gridSize} onChange={(v: number) => handleChange('gridSize', v)} min={5} max={20} icon="fa-border-all" unit="x" />
                <div className="pt-4">
                    <CompactToggleGroup 
                        label="Harf Durumu" 
                        selected={options.case} 
                        onChange={(v: string) => handleChange('case', v)} 
                        icon="fa-font"
                        options={[
                            { value: 'upper', label: 'BÜYÜK' },
                            { value: 'lower', label: 'küçük' }
                        ]} 
                    />
                </div>
            </div>
            
            <CompactToggleGroup 
                label="Yönler" 
                selected={options.directions} 
                onChange={(v: string) => handleChange('directions', v)} 
                icon="fa-arrows-up-down-left-right"
                options={[
                    { value: 'simple', label: 'Basit (→ ↓)' },
                    { value: 'diagonal', label: 'Çapraz Dahil' },
                    { value: 'all', label: 'Tüm Yönler' }
                ]} 
            />

            <div>
                <Label icon="fa-tag">Konu / Tema</Label>
                <input type="text" value={options.topic} onChange={(e) => handleChange('topic', e.target.value)} placeholder="Örn: Doğa, Uzay..." className="w-full h-8 px-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
        </div>
    );

    const VisualControls = () => (
        <div className="space-y-3">
             <CompactSelect label="Görsel Karmaşıklık" value={options.difficulty} onChange={(v: string) => handleChange('difficulty', v)} options={[{value:'Başlangıç', label:'Basit (Az Detay)'}, {value:'Orta', label:'Normal'}, {value:'Zor', label:'Detaylı'}, {value:'Uzman', label:'Çok Karmaşık'}]} icon="fa-image" />
        </div>
    );

    const renderControls = () => {
        if (options.mode === 'manual') {
            return (
                <div className="space-y-3">
                    <Label icon="fa-keyboard">Manuel Veri Girişi</Label>
                    <textarea
                        className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 focus:ring-1 focus:ring-indigo-500 outline-none h-40 resize-none font-mono text-xs leading-relaxed text-zinc-700 dark:text-zinc-200"
                        placeholder="Her satıra bir kelime veya virgülle ayırarak yazın..."
                        value={options.customInput}
                        onChange={(e) => handleChange('customInput', e.target.value)}
                    ></textarea>
                    <p className="text-[9px] text-zinc-400"><i className="fa-solid fa-circle-info mr-1"></i>En az 2 öğe giriniz.</p>
                    <div className="border-t border-zinc-100 dark:border-zinc-700 pt-3">
                        <CompactCounter label="Sayfa Sayısı" value={options.worksheetCount} onChange={(v: number) => handleChange('worksheetCount', v)} min={1} max={20} icon="fa-copy" />
                        {['WORD_SEARCH', 'CROSSWORD'].includes(activity.id) && (
                            <div className="mt-3">
                                <CompactSlider label="Izgara Boyutu" value={options.gridSize} onChange={(v: number) => handleChange('gridSize', v)} min={5} max={20} icon="fa-border-all" unit="x" />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        const type = activity.id;
        
        return (
            <div className="animate-in fade-in slide-in-from-top-2">
                {type === 'STORY_CREATION_PROMPT' ? (
                    <div className="mb-4">
                        <CompactSelect
                            label="Hikaye Teması"
                            value={options.topic || 'Rastgele'}
                            onChange={(v: string) => handleChange('topic', v)}
                            icon="fa-book-open"
                            options={[
                                { value: 'Rastgele', label: 'Rastgele Sürpriz' },
                                { value: 'school', label: 'Okul Maceraları' },
                                { value: 'animals', label: 'Hayvanlar Alemi' },
                                { value: 'space', label: 'Uzay Yolculuğu' },
                                { value: 'nature', label: 'Doğa Gezisi' },
                                { value: 'fantasy', label: 'Masal Diyarı' }
                            ]}
                        />
                    </div>
                ) : null}

                <CommonControls />
                <div className="border-t border-zinc-100 dark:border-zinc-700 my-4"></div>
                
                {['BASIC_OPERATIONS', 'MATH_PUZZLE', 'KENDOKU', 'NUMBER_PYRAMID', 'REAL_LIFE_MATH_PROBLEMS'].includes(type) && <MathControls />}
                {['WORD_SEARCH', 'WORD_SEARCH_WITH_PASSWORD', 'LETTER_GRID_WORD_FIND', 'CROSSWORD', 'ANAGRAM'].includes(type) && <WordControls />}
                {['FIND_THE_DIFFERENCE', 'VISUAL_ODD_ONE_OUT', 'SHAPE_MATCHING', 'GRID_DRAWING'].includes(type) && <VisualControls />}
                
                {!['BASIC_OPERATIONS', 'MATH_PUZZLE', 'KENDOKU', 'NUMBER_PYRAMID', 'REAL_LIFE_MATH_PROBLEMS', 'WORD_SEARCH', 'WORD_SEARCH_WITH_PASSWORD', 'LETTER_GRID_WORD_FIND', 'CROSSWORD', 'ANAGRAM', 'FIND_THE_DIFFERENCE', 'VISUAL_ODD_ONE_OUT', 'SHAPE_MATCHING', 'GRID_DRAWING', 'STORY_CREATION_PROMPT'].includes(type) && (
                     <div className="mt-2">
                        <Label icon="fa-tag">Konu / Tema (Opsiyonel)</Label>
                        <input type="text" value={options.topic} onChange={(e) => handleChange('topic', e.target.value)} placeholder="Örn: Doğa, Uzay..." className="w-full h-8 px-2 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>
                )}

                {options.mode === 'ai' && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                                    <i className="fa-brands fa-google"></i>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-blue-800 dark:text-blue-200 uppercase block">Google ile Araştır</label>
                                    <p className="text-[9px] text-blue-600 dark:text-blue-300">Güncel bilgiler kullanılsın mı?</p>
                                </div>
                            </div>
                            <div className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${options.useSearch ? 'bg-blue-600' : 'bg-zinc-300'}`} onClick={() => handleChange('useSearch', !options.useSearch)}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${options.useSearch ? 'left-6' : 'left-1'}`}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (!isExpanded) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-zinc-900 items-center py-2 border-r border-zinc-200 dark:border-zinc-800 w-[72px]">
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
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm shrink-0 flex items-center justify-between z-10 h-[60px]">
                <div className="flex items-center gap-3 overflow-hidden">
                    <button onClick={onBack} className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shrink-0"><i className="fa-solid fa-arrow-left"></i></button>
                    <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate uppercase tracking-tight">{activity.title}</h2>
                </div>
                <button onClick={handleToggleFavorite} className={`text-sm transition-all p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isFavorite ? 'text-rose-500' : 'text-zinc-300 hover:text-zinc-500'}`}><i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`}></i></button>
            </div>

            {/* Settings Body */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0">
                
                {/* Quick Student Selector */}
                {students.length > 0 && (
                    <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <Label icon="fa-user-graduate">Öğrenci Seç / Ata</Label>
                        <div className="relative">
                            <select 
                                value={activeStudent?.id || "anonymous"}
                                onChange={(e) => handleQuickStudentSelect(e.target.value)}
                                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded p-1.5 text-xs font-bold outline-none cursor-pointer appearance-none"
                            >
                                <option value="anonymous">Anonim (Atanmamış)</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-400 pointer-events-none"></i>
                        </div>
                    </div>
                )}

                {/* Mode Switcher */}
                <div className="mb-6">
                    <Label icon="fa-robot">Üretim Modu</Label>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                        {['fast', 'ai', 'manual'].map((m) => (
                            <button
                                key={m}
                                onClick={() => handleChange('mode', m)}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wide rounded-[3px] transition-all flex items-center justify-center gap-1.5 ${options.mode === m 
                                    ? 'bg-white dark:bg-zinc-600 text-indigo-600 shadow-sm ring-1 ring-black/5' 
                                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                            >
                                <i className={`fa-solid ${m === 'fast' ? 'fa-bolt' : m === 'ai' ? 'fa-wand-magic-sparkles' : 'fa-keyboard'}`}></i>
                                {m === 'fast' ? 'Hızlı' : m === 'ai' ? 'AI' : 'Manuel'}
                            </button>
                        ))}
                    </div>
                </div>

                {renderControls()}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 space-y-3 z-20">
                {onOpenStudentModal && (
                    <button 
                        onClick={onOpenStudentModal}
                        className={`w-full py-2 rounded border border-dashed transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider ${studentProfile ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-zinc-300 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600'}`}
                    >
                        <i className={`fa-solid ${studentProfile ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                        {studentProfile ? studentProfile.name : 'Öğrenci Yönetimi'}
                    </button>
                )}

                <button
                    onClick={() => onGenerate(options)}
                    disabled={isLoading || (options.mode === 'manual' && (!options.customInput || (typeof options.customInput === 'string' ? options.customInput.trim().length < 2 : options.customInput.length < 1)))}
                    className="w-full h-10 bg-zinc-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold rounded shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                >
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            <span>Hazırlanıyor</span>
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


import React, { useState, useRef } from 'react';
import { Activity, ActivityType, GeneratorOptions, StudentProfile } from '../types';
import { DIFFICULTY_OPTIONS } from '../constants';
import { useStudent } from '../context/StudentContext';

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

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading, isExpanded = true, onOpenStudentModal }) => {
    const { students, activeStudent, setActiveStudent } = useStudent();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    
    const [options, setOptions] = useState<GeneratorOptions>({
        mode: 'fast',
        difficulty: 'Orta',
        worksheetCount: 1,
        itemCount: 10,
        gridSize: 4,
        topic: '',
        distractionLevel: 'medium',
        visualType: 'geometric',
        logicModel: 'identity',
        numberRange: '1-50',
        findDiffType: 'linguistic',
        showSumTarget: true,
        mapInstructionTypes: ['spatial_logic', 'linguistic_geo', 'attribute_search'],
        emphasizedRegion: 'all',
        showCityNames: true,
        markerStyle: 'circle',
        customInput: '',
        variant: 'mixed', // Focus side for family relations
        case: 'upper',
        fontFamily: 'OpenDyslexic',
        familyTaskType: 'matching', // matching, tree_logic, naming
        familyDepth: 'extended' // basic, extended, expert
    });

    const handleChange = (key: keyof GeneratorOptions, value: any) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                setUploadedImage(base64);
                handleChange('customInput', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStudentChange = (id: string) => {
        if (id === 'anonymous') {
            setActiveStudent(null);
        } else {
            const student = students.find(s => s.id === id);
            if (student) setActiveStudent(student);
        }
    };

    const renderActivityControls = () => {
        // --- FAMILY RELATIONS ---
        if (activity.id === ActivityType.FAMILY_RELATIONS || activity.id === ActivityType.FAMILY_LOGIC_TEST) {
            const isLogic = activity.id === ActivityType.FAMILY_LOGIC_TEST;
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactToggleGroup 
                        label="Odak Taraf" 
                        selected={options.variant || 'mixed'} 
                        onChange={(v: string) => handleChange('variant', v)} 
                        options={[
                            { value: 'mom', label: 'ANNE' }, 
                            { value: 'dad', label: 'BABA' },
                            { value: 'mixed', label: 'KARMA' }
                        ]} 
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactSelect 
                            label="İlişki Derinliği" 
                            value={options.familyDepth} 
                            onChange={(v:string) => handleChange('familyDepth', v)}
                            options={[
                                { value: 'basic', label: 'Temel (1. Derece)' },
                                { value: 'extended', label: 'Geniş (Hala/Teyze...)' },
                                { value: 'expert', label: 'Uzman (Elti/Bacanak...)' }
                            ]}
                            icon="fa-sitemap"
                        />

                        {!isLogic && (
                            <CompactSelect 
                                label="Görev Türü" 
                                value={options.familyTaskType} 
                                onChange={(v:string) => handleChange('familyTaskType', v)}
                                options={[
                                    { value: 'matching', label: 'Tanım Eşleştirme' },
                                    { value: 'naming', label: 'İsimlendirme' },
                                    { value: 'identification', label: 'Kimin Neyi?' }
                                ]}
                                icon="fa-list-check"
                            />
                        )}

                        <CompactCounter label="Soru/İfade Sayısı" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={4} max={15} icon="fa-list-ol" />
                    </div>

                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <i className="fa-solid fa-lightbulb"></i> Bilişsel İpucu
                        </p>
                        <p className="text-[10px] text-zinc-500 italic leading-tight">Akrabalık ilişkileri, çocukların soyut hiyerarşik yapıları anlama ve sosyal muhakeme becerilerini test eder.</p>
                    </div>
                </div>
            );
        }

        // --- CLOCK READING ---
        if (activity.id === ActivityType.CLOCK_READING) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="Çalışma Türü" 
                        value={options.variant || 'analog-to-digital'} 
                        onChange={(v:any) => handleChange('variant', v)}
                        options={[
                            { value: 'analog-to-digital', label: 'Analog -> Dijital' },
                            { value: 'digital-to-analog', label: 'Dijital -> Analog' },
                            { value: 'verbal-match', label: 'Sözel Eşleştirme' },
                            { value: 'elapsed-time', label: 'Zaman Problemleri (AI)' }
                        ]}
                        icon="fa-clock"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactCounter label="Saat Sayısı" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={2} max={12} icon="fa-list-ol" />
                        
                        <div className="grid grid-cols-2 gap-2">
                            <CompactToggleGroup 
                                label="Format" 
                                selected={options.is24Hour ? '24h' : '12h'} 
                                onChange={(v: string) => handleChange('is24Hour', v === '24h')} 
                                options={[{ value: '12h', label: '12S' }, { value: '24h', label: '24S' }]} 
                            />
                            <CompactToggleGroup 
                                label="Seçenekler" 
                                selected={options.showOptions ? 'on' : 'off'} 
                                onChange={(v: string) => handleChange('showOptions', v === 'on')} 
                                options={[{ value: 'on', label: 'VAR' }, { value: 'off', label: 'YOK' }]} 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                             <CompactToggleGroup 
                                label="Sayılar" 
                                selected={options.showNumbers ? 'on' : 'off'} 
                                onChange={(v: string) => handleChange('showNumbers', v === 'on')} 
                                options={[{ value: 'on', label: 'VAR' }, { value: 'off', label: 'YOK' }]} 
                            />
                             <CompactToggleGroup 
                                label="Çizgiler" 
                                selected={options.showTicks ? 'on' : 'off'} 
                                onChange={(v: string) => handleChange('showTicks', v === 'on')} 
                                options={[{ value: 'on', label: 'VAR' }, { value: 'off', label: 'YOK' }]} 
                            />
                        </div>

                        <CompactToggleGroup 
                            label="Akrep ve Yelkovan" 
                            selected={options.showHands ? 'on' : 'off'} 
                            onChange={(v: string) => handleChange('showHands', v === 'on')} 
                            options={[{ value: 'on', label: 'GÖSTER' }, { value: 'off', label: 'GİZLE' }]} 
                        />
                    </div>
                    
                    {options.variant === 'elapsed-time' && (
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <i className="fa-solid fa-wand-magic-sparkles"></i> AI Senaryo Desteği
                            </p>
                            <p className="text-[10px] text-zinc-500 italic leading-tight">Zaman aritmetiği için yapay zeka kişiselleştirilmiş hikayeler kurgulayacaktır.</p>
                        </div>
                    )}
                </div>
            );
        }

        // --- MATH MEMORY CARDS ---
        if (activity.id === ActivityType.MATH_MEMORY_CARDS) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="Eşleştirme Modu" 
                        value={options.variant || 'op-res'} 
                        onChange={(v:any) => handleChange('variant', v)}
                        options={[
                            { value: 'op-res', label: 'İşlem - Sonuç' },
                            { value: 'vis-num', label: 'Görsel Temsil - Sayı' },
                            { value: 'eq-eq', label: 'Denk İşlemler (Zor)' },
                            { value: 'mixed', label: 'Karma Mod' }
                        ]}
                        icon="fa-clone"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactCounter label="Kart Sayısı (Toplam)" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={8} max={32} icon="fa-layer-group" />
                        <p className="text-[9px] text-zinc-400 italic leading-tight">* Kart sayısı çift olmalıdır. A4 sayfasını doldurmak için 24 veya 32 önerilir.</p>
                        
                        <CompactCheckboxGroup 
                            label="Kullanılacak İşlemler" 
                            selected={options.selectedOperations || ['add']}
                            onChange={(v:string[]) => handleChange('selectedOperations', v)}
                            options={[
                                { value: 'add', label: 'Toplama' },
                                { value: 'sub', label: 'Çıkarma' },
                                { value: 'mult', label: 'Çarpma' },
                                { value: 'div', label: 'Bölme' }
                            ]}
                        />

                        <CompactSelect 
                            label="Görsel Stil" 
                            value={options.visualStyle || 'mixed'} 
                            onChange={(v:any) => handleChange('visualStyle', v)}
                            options={[
                                { value: 'ten-frame', label: '10\'luk Çerçeve' },
                                { value: 'blocks', label: 'Taban Bloklar' },
                                { value: 'dice', label: 'Domino / Zar' },
                                { value: 'mixed', label: 'Karışık' }
                            ]}
                            icon="fa-shapes"
                        />
                    </div>
                </div>
            );
        }

        // --- SYLLABLE MASTER LAB ---
        if (activity.id === ActivityType.SYLLABLE_MASTER_LAB) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="Çalışma Modu" 
                        value={options.variant || 'split'} 
                        onChange={(v:any) => handleChange('variant', v)}
                        options={[
                            { value: 'split', label: 'Hecelere Ayırma' },
                            { value: 'combine', label: 'Hece Birleştirme' },
                            { value: 'complete', label: 'Eksik Hece Tamamlama' },
                            { value: 'rainbow', label: 'Renkli Heceler (Akıcılık)' },
                            { value: 'scrambled', label: 'Karışık Heceden Kelime' }
                        ]}
                        icon="fa-shapes"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactCounter label="Kelime Sayısı" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={4} max={60} icon="fa-list-ol" />
                        <CompactSelect 
                            label="Hece Sayısı Aralığı" 
                            value={options.syllableRange || '2-3'} 
                            onChange={(v:any) => handleChange('syllableRange', v)}
                            options={[
                                { value: '1-1', label: 'Sadece 1 Heceli' },
                                { value: '2-2', label: 'Sadece 2 Heceli' },
                                { value: '3-3', label: 'Sadece 3 Heceli' },
                                { value: '1-2', label: '1 - 2 Heceli' },
                                { value: '2-3', label: '2 - 3 Heceli' },
                                { value: '3-4', label: '3 - 4 Heceli' },
                                { value: '1-4', label: 'Karma (1-4 Hece)' }
                            ]}
                            icon="fa-layer-group"
                        />
                        <CompactSelect 
                            label="Kelime Havuzu" 
                            value={options.topic || 'animals'} 
                            onChange={(v:any) => handleChange('topic', v)}
                            options={[
                                { value: 'animals', label: 'Hayvanlar' },
                                { value: 'fruits_veggies', label: 'Meyve & Sebze' },
                                { value: 'school', label: 'Okul Eşyaları' },
                                { value: 'items_household', label: 'Ev Eşyaları' },
                                { value: 'abstract', label: 'Soyut Kavramlar' },
                                { value: 'mixed', label: 'Karma Havuz' }
                            ]}
                            icon="fa-box-archive"
                        />
                         <CompactToggleGroup 
                            label="Harf Tipi" 
                            selected={options.case || 'upper'} 
                            onChange={(v: string) => handleChange('case', v)} 
                            options={[{ value: 'upper', label: 'BÜYÜK' }, { value: 'lower', label: 'küçük' }]} 
                        />
                    </div>
                </div>
            );
        }

        // --- READING SUDOKU ---
        if (activity.id === ActivityType.READING_SUDOKU) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="İçerik Türü" 
                        value={options.variant || 'letters'} 
                        onChange={(v:any) => handleChange('variant', v)}
                        options={[
                            { value: 'letters', label: 'Harfler (Disleksi Odaklı)' },
                            { value: 'words', label: 'Kelimeler (Tematik)' },
                            { value: 'visuals', label: 'Görsel Semboller' },
                            { value: 'numbers', label: 'Sayısal' }
                        ]}
                        icon="fa-shapes"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactToggleGroup 
                            label="Izgara Boyutu" 
                            selected={options.gridSize?.toString() || "4"} 
                            onChange={(v: string) => handleChange('gridSize', parseInt(v))} 
                            options={[{ value: '4', label: '4x4 (Kolay)' }, { value: '6', label: '6x6' }, { value: '9', label: '9x9 (Zor)' }]} 
                        />
                        <CompactSelect 
                            label="Yazı Tipi" 
                            value={options.fontFamily || 'OpenDyslexic'} 
                            onChange={(v:string) => handleChange('fontFamily', v)}
                            options={[
                                { value: 'OpenDyslexic', label: 'Disleksi Fontu' },
                                { value: 'Lexend', label: 'Okunaklı' },
                                { value: 'Inter', label: 'Standart' }
                            ]}
                            icon="fa-font"
                        />
                    </div>
                </div>
            );
        }

        // --- READING STROOP TEST ---
        if (activity.id === ActivityType.READING_STROOP) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="Renk Kelime Tipi" 
                        value={options.variant || 'colors'} 
                        onChange={(v:any) => handleChange('variant', v)}
                        options={[
                            { value: 'colors', label: 'Renk Adları (Klasik)' },
                            { value: 'semantic', label: 'Anlamsal (Limon, Deniz)' },
                            { value: 'confusing', label: 'Çeldiriciler (Mavi-Mani)' },
                            { value: 'shapes', label: 'Geometrik Şekiller' },
                            { value: 'animals', label: 'Hayvan İsimleri' },
                            { value: 'verbs', label: 'Eylem Fiilleri' },
                            { value: 'mirror_chars', label: 'Ayna Harf Odaklı (b/d)' }
                        ]}
                        icon="fa-spell-check"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactSlider label="Kelime Yoğunluğu" value={options.itemCount || 48} onChange={(v:number) => handleChange('itemCount', v)} min={20} max={80} icon="fa-table-cells" />
                        <CompactSlider label="Sütun Sayısı" value={options.gridSize || 4} onChange={(v:number) => handleChange('gridSize', v)} min={2} max={6} icon="fa-grip-lines-vertical" />
                    </div>

                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <i className="fa-solid fa-wand-magic-sparkles"></i> Zamanlayıcı Modu
                        </p>
                        <p className="text-[10px] text-zinc-500 italic leading-tight">Bu çalışma klinik süre tutma kutusu ile birlikte oluşturulacaktır.</p>
                    </div>
                </div>
            );
        }

        // --- SYNONYM ANTONYM MATCH ---
        if (activity.id === ActivityType.SYNONYM_ANTONYM_MATCH) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="Çalışma Odağı" 
                        value={options.variant || 'mixed'} 
                        onChange={(v:any) => handleChange('variant', v)}
                        options={[
                            { value: 'synonym', label: 'Eş Anlamlılar' },
                            { value: 'antonym', label: 'Zıt Anlamlılar' },
                            { value: 'mixed', label: 'Karışık (Eş + Zıt)' }
                        ]}
                        icon="fa-arrows-left-right"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactSlider label="Kelime Çifti Sayısı" value={options.itemCount || 8} onChange={(v:number) => handleChange('itemCount', v)} min={4} max={12} icon="fa-list-ol" />
                        <CompactToggleGroup 
                            label="Yazı Stili" 
                            selected={options.case} 
                            onChange={(v: string) => handleChange('case', v)} 
                            options={[{ value: 'upper', label: 'BÜYÜK' }, { value: 'lower', label: 'küçük' }]} 
                        />
                    </div>
                </div>
            );
        }

        // --- LETTER VISUAL MATCHING ---
        if (activity.id === ActivityType.LETTER_VISUAL_MATCHING) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Hedef Harfler (Virgülle ayırın)</label>
                        <input 
                            type="text" 
                            value={options.targetLetters} 
                            onChange={e => handleChange('targetLetters', e.target.value)}
                            placeholder="Örn: B,D,P,Q"
                            className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 dark:text-zinc-200"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         <CompactToggleGroup 
                            label="Harf Durumu" 
                            selected={options.case} 
                            onChange={(v: string) => handleChange('case', v)} 
                            options={[{ value: 'upper', label: 'BÜYÜK' }, { value: 'lower', label: 'küçük' }]} 
                        />
                        <CompactSelect 
                            label="Yazı Tipi" 
                            value={options.fontFamily} 
                            onChange={(v:string) => handleChange('fontFamily', v)}
                            options={[
                                { value: 'OpenDyslexic', label: 'Disleksi' },
                                { value: 'Comic Neue', label: 'Eğlenceli' },
                                { value: 'Lexend', label: 'Okunaklı' },
                                { value: 'Times New Roman', label: 'Serif' }
                            ]}
                            icon="fa-font"
                        />
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactSlider label="Öğe Sayısı" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={3} max={12} icon="fa-list-ol" />
                        <CompactSlider label="Sütun Sayısı" value={options.gridSize || 2} onChange={(v:number) => handleChange('gridSize', v)} min={1} max={3} icon="fa-table-columns" />
                    </div>
                </div>
            );
        }

        // --- SYLLABLE WORD BUILDER ---
        if (activity.id === ActivityType.SYLLABLE_WORD_BUILDER) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactSelect 
                        label="Kelime Havuzu" 
                        value={options.topic || 'animals'} 
                        onChange={(v:any) => handleChange('topic', v)}
                        options={[
                            { value: 'animals', label: 'Hayvanlar' },
                            { value: 'fruits_veggies', label: 'Meyveler' },
                            { value: 'items_household', label: 'Ev Eşyaları' },
                            { value: 'jobs', label: 'Meslekler' }
                        ]}
                        icon="fa-box-archive"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactCounter label="Kelime Sayısı" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={4} max={12} icon="fa-list-ol" />
                        <CompactToggleGroup 
                            label="Hece Bankası Zorluğu" 
                            selected={options.distractionLevel} 
                            onChange={(v: string) => handleChange('distractionLevel', v)} 
                            options={[
                                { value: 'low', label: 'KOLAY' },
                                { value: 'medium', label: 'ORTA' },
                                { value: 'high', label: 'ZOR' }
                            ]} 
                        />
                    </div>
                </div>
            );
        }

        // --- AI WORKSHEET CONVERTER ---
        if (activity.id === ActivityType.AI_WORKSHEET_CONVERTER) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-video border-2 border-dashed border-indigo-200 dark:border-zinc-700 rounded-2xl bg-indigo-50/50 dark:bg-zinc-800/50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-all group overflow-hidden relative"
                    >
                        {uploadedImage ? (
                            <>
                                <img src={uploadedImage} className="w-full h-full object-cover opacity-60" alt="Preview" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i className="fa-solid fa-rotate text-white text-2xl mb-2"></i>
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Görseli Değiştir</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-camera-retro text-indigo-400 group-hover:scale-110 transition-transform text-2xl mb-3"></i>
                                <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Görsel (JPG/PNG) Yükle</span>
                                <p className="text-[8px] text-zinc-400 mt-2 px-6 text-center">AI bu görseldeki mimariyi analiz edip yepyeni bir varyasyon üretecek.</p>
                            </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700">
                         <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Dönüştürme Notu</label>
                         <textarea 
                            value={options.topic} 
                            onChange={e => handleChange('topic', e.target.value)} 
                            placeholder="AI'ya özel talimat verin (örn: Meyve yerine hayvanları kullan)..."
                            className="w-full h-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-xs outline-none focus:border-indigo-500 resize-none dark:text-zinc-200"
                        />
                    </div>
                </div>
            );
        }

        // --- HARİTA DEDEKTİFİ ---
        if (activity.id === ActivityType.MAP_INSTRUCTION) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Gerçek Harita Kaynağı (Opsiyonel)</span>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full py-2 px-3 rounded-lg border-2 border-dashed text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${uploadedImage ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-400 hover:border-indigo-300 hover:text-indigo-500'}`}
                            >
                                <i className={`fa-solid ${uploadedImage ? 'fa-check-circle' : 'fa-map'}`}></i>
                                {uploadedImage ? 'Harita Yüklendi' : 'Ekteki Haritayı Kullan'}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
                    </div>

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

        // --- ALGORITHM GENERATOR ---
        if (activity.id === ActivityType.ALGORITHM_GENERATOR) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Problem Senaryosu</label>
                        <input 
                            type="text" 
                            value={options.topic} 
                            onChange={e => handleChange('topic', e.target.value)}
                            placeholder="Örn: Kek yapımı, Okula hazırlık..."
                            className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 dark:text-zinc-200"
                        />
                    </div>
                    
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactSlider label="Adım Sayısı" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={5} max={10} icon="fa-list-ol" />
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Görsel Kaynak (Opsiyonel)</span>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full py-2 px-3 rounded-lg border-2 border-dashed text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${uploadedImage ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-zinc-200 text-zinc-400 hover:border-indigo-300 hover:text-indigo-500'}`}
                            >
                                <i className={`fa-solid ${uploadedImage ? 'fa-check-circle' : 'fa-camera'}`}></i>
                                {uploadedImage ? 'Mantık Analiz Edilecek' : 'Görselden Klonla'}
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        </div>
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
                        <CompactSlider label="İpucu Sayısı" value={options.gridSize || 3} onChange={(v:number) => handleChange('gridSize', v)} min={2} max={6} icon="fa-list-check" />
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
                            { value: 'complex', label: 'Karmaşık Çizgiler' },
                            { value: 'fractal', label: 'Fraktal / Kristal' },
                            { value: 'glint', label: 'Minimalist Glint' }
                        ]}
                        icon="fa-shapes"
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <CompactToggleGroup 
                            label="Fark Belirginliği (Saliency)" 
                            selected={options.distractionLevel} 
                            onChange={(v: string) => handleChange('distractionLevel', v)} 
                            options={[
                                { value: 'low', label: 'Belirgin' },
                                { value: 'medium', label: 'Orta' },
                                { value: 'high', label: 'Hassas' },
                                { value: 'extreme', label: 'Mikro (Zor)' }
                            ]} 
                        />
                        <CompactSlider label="Satır Başı Öğe" value={options.gridSize || 4} onChange={(v:number) => handleChange('gridSize', v)} min={3} max={20} icon="fa-table-cells" />
                    </div>

                    <CompactCounter label="Toplam Görev (Satır)" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={1} max={15} icon="fa-list" />
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
                {isLoading && <i className="fa-solid fa-circle-notch fa-spin text-indigo-50"></i>}
            </div>

            <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-[1.5rem] border border-amber-100 dark:border-amber-800/30">
                    <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-user-graduate"></i> Aktif Öğrenci
                    </h4>
                    <select 
                        value={activeStudent?.id || "anonymous"}
                        onChange={(e) => handleStudentChange(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-700 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-amber-500/20"
                    >
                        <option value="anonymous">Misafir / Atanmamış</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                    </select>
                </div>

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
                        disabled={isLoading || (activity.id === ActivityType.AI_WORKSHEET_CONVERTER)}
                        className={`w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 ${activity.id === ActivityType.AI_WORKSHEET_CONVERTER ? 'hidden' : ''}`}
                    >
                        <i className="fa-solid fa-bolt"></i> Hızlı Üret (Offline)
                    </button>
                    <button 
                        onClick={() => onGenerate({ ...options, mode: 'ai' })}
                        disabled={isLoading}
                        className="w-full px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI ile Üret (Online)
                    </button>
                </div>
            </div>
        </div>
    );
};

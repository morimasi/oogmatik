
import React, { useState } from 'react';
import { Activity, ActivityType, GeneratorOptions, StudentProfile } from '../types';
import { DIFFICULTY_OPTIONS } from '../constants';

// --- MICRO UI COMPONENTS ---

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-x-auto no-scrollbar">
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 min-w-[70px] py-2 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap px-2 ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

const CompactSlider = ({ label, value, onChange, min, max, step, icon, unit = "" }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                {icon && <i className={`fa-solid ${icon}`}></i>}
                {label}
            </label>
            <span className="text-xs font-mono font-bold text-indigo-600">{value}{unit}</span>
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

const CheckboxControl = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700 cursor-pointer group hover:bg-zinc-100 transition-colors">
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-300 dark:border-zinc-600'}`}>
            {checked && <i className="fa-solid fa-check text-[10px]"></i>}
        </div>
        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-900">{label}</span>
        <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
    </label>
);

interface GeneratorViewProps {
    activity: Activity;
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
    isExpanded?: boolean;
    onOpenStudentModal?: () => void;
    studentProfile?: StudentProfile | null;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ 
    activity, onGenerate, onBack, isLoading, isExpanded = true, onOpenStudentModal, studentProfile 
}) => {
    const [options, setOptions] = useState<GeneratorOptions>({
        mode: 'fast',
        difficulty: 'Orta',
        worksheetCount: 1,
        itemCount: 6,
        gridSize: 5,
        case: 'upper',
        variant: 'square',
        numberRange: '1-50',
        logicModel: 'identity',
        showSumTarget: true
    });

    const handleChange = (key: string, value: any) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const renderActivityControls = () => {
        // --- GİZLİ ŞİFRE MATRİSİ (HIDDEN PASSWORD GRID) ---
        if (activity.id === ActivityType.HIDDEN_PASSWORD_GRID) {
            return (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                        <CompactSlider 
                            label="Izgara Boyutu" 
                            value={options.gridSize} 
                            onChange={(v:number) => handleChange('gridSize', v)} 
                            min={3} max={8} step={1} icon="fa-border-all" unit="x" 
                        />
                        <CompactSlider 
                            label="Kelime Sayısı" 
                            value={options.itemCount} 
                            onChange={(v:number) => handleChange('itemCount', v)} 
                            min={1} max={12} step={1} icon="fa-list-ol" 
                        />
                    </div>

                    <CompactToggleGroup 
                        label="Harf Tipi" 
                        selected={options.case} 
                        onChange={(v: string) => handleChange('case', v)} 
                        options={[
                            { value: 'upper', label: 'BÜYÜK HARF' },
                            { value: 'lower', label: 'küçük harf' }
                        ]} 
                    />

                    <CompactToggleGroup 
                        label="Görsel Stil" 
                        selected={options.variant} 
                        onChange={(v: string) => handleChange('variant', v)} 
                        options={[
                            { value: 'square', label: 'KLASİK' },
                            { value: 'rounded', label: 'YUVARLAK' },
                            { value: 'minimal', label: 'SADE' }
                        ]} 
                    />

                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 leading-relaxed font-medium">
                            <i className="fa-solid fa-lightbulb mr-1"></i>
                            {options.difficulty === 'Uzman' ? 'Uzman modunda birbirine benzeyen (b-d, m-n) harfler çeldirici olarak seçilir.' : 
                             'Izgara boyutunu artırmak görsel tarama yükünü artırır.'}
                        </p>
                    </div>
                </div>
            );
        }

        // --- SAYISAL MANTIK BİLMECELERİ ---
        if (activity.id === ActivityType.NUMBER_LOGIC_RIDDLES) {
            return (
                <div className="space-y-6">
                    <CompactToggleGroup label="Mantık Kurgusu" selected={options.logicModel} onChange={(v: string) => handleChange('logicModel', v)} options={[{ value: 'identity', label: 'KİMLİK' }, { value: 'exclusion', label: 'ELEME' }, { value: 'sequence', label: 'DİZİ' }]} />
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sayı Aralığı</label>
                             <select value={options.numberRange} onChange={e => handleChange('numberRange', e.target.value)} className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"><option value="1-20">1-20</option><option value="1-50">1-50</option><option value="1-100">1-100</option></select>
                        </div>
                        <CompactSlider label="Bilmeceler" value={options.itemCount} onChange={(v:number) => handleChange('itemCount', v)} min={2} max={9} step={1} icon="fa-list-ol" />
                    </div>
                    <CompactSlider label="İpucu Derinliği" value={options.gridSize} onChange={(v:number) => handleChange('gridSize', v)} min={2} max={5} step={1} icon="fa-brain" />
                </div>
            );
        }

        return (
            <div className="space-y-5">
                <CompactSlider label="Öğe Adedi" value={options.itemCount} onChange={(v: number) => handleChange('itemCount', v)} min={1} max={30} step={1} icon="fa-list-ol" />
            </div>
        );
    };

    if (!isExpanded) {
        return (
            <div className="flex flex-col items-center py-4 gap-4">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg"><i className={activity.icon}></i></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-900 animate-in slide-in-from-left-4 duration-300">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <button onClick={onBack} className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-zinc-800 dark:text-zinc-100 truncate uppercase tracking-tight">{activity.title}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase truncate">{activity.id}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                <CompactToggleGroup label="Üretim Modu" selected={options.mode} onChange={(v: string) => handleChange('mode', v)} options={[{ value: 'fast', label: 'HIZLI (Yerel)' }, { value: 'ai', label: 'AKILLI (Yapay Zeka)' }]} />
                <CompactToggleGroup label="Zorluk Seviyesi" selected={options.difficulty} onChange={(v: string) => handleChange('difficulty', v)} options={DIFFICULTY_OPTIONS} />
                <div className="pt-4 border-t border-dashed border-zinc-100 dark:border-zinc-800">
                    {renderActivityControls()}
                </div>
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <button onClick={() => onGenerate(options)} disabled={isLoading} className="w-full py-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black rounded-2xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                    {isLoading ? <><i className="fa-solid fa-circle-notch fa-spin"></i><span className="uppercase tracking-widest text-xs">Oluşturuluyor...</span></> : <><i className="fa-solid fa-wand-magic-sparkles"></i><span className="uppercase tracking-widest text-xs">İçeriği Üret</span></>}
                </button>
            </div>
        </div>
    );
};

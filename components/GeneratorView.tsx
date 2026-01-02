
import React, { useState } from 'react';
import { Activity, ActivityType, GeneratorOptions, StudentProfile } from '../types';
import { DIFFICULTY_OPTIONS } from '../constants';

// --- MICRO UI COMPONENTS ---

const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-white' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}`}
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
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                {icon && <i className={`fa-solid ${icon}`}></i>}
                {label}
            </label>
            <span className="text-xs font-mono font-bold text-indigo-600">{value}</span>
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
        itemCount: 10,
        visualStyle: 'architect'
    });

    const handleChange = (key: string, value: any) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    };

    const renderActivityControls = () => {
        // --- KELİME MİMARİSİ (MORPHOLOGICAL ANALYSIS) ---
        if (activity.id === ActivityType.MORPHOLOGICAL_ANALYSIS) {
            return (
                <div className="space-y-5 animate-in fade-in duration-300">
                    <CompactToggleGroup 
                        label="Görsel Stil" 
                        selected={options.visualStyle || 'architect'} 
                        onChange={(v: string) => handleChange('visualStyle', v)} 
                        options={[
                            { value: 'architect', label: 'MİMARİ' },
                            { value: 'tree', label: 'AĞAÇ' },
                            { value: 'blocks', label: 'BLOK' }
                        ]} 
                    />
                    
                    <CompactSlider 
                        label="Kök Sayısı" 
                        value={options.itemCount || 3} 
                        onChange={(v:number) => handleChange('itemCount', v)} 
                        min={2} max={5} step={1} icon="fa-list-ol" 
                    />

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 space-y-4">
                        <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                            <i className="fa-solid fa-info-circle mr-1"></i>
                            Bu çalışma, öğrencinin kelime köklerini tanımasını sağlayarak okuma hızını ve anlama derinliğini artırır.
                        </p>
                    </div>
                </div>
            );
        }

        // --- VARSAYILAN KONTROLLER (Diğer aktiviteler için) ---
        return (
            <div className="space-y-5">
                <CompactSlider 
                    label="Öğe Adedi" 
                    value={options.itemCount} 
                    onChange={(v: number) => handleChange('itemCount', v)} 
                    min={1} max={30} step={1} icon="fa-list-ol" 
                />
            </div>
        );
    };

    if (!isExpanded) {
        return (
            <div className="flex flex-col items-center py-4 gap-4">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center"><i className="fa-solid fa-arrow-left"></i></button>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><i className={activity.icon}></i></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-900 animate-in slide-in-from-left-4 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <button onClick={onBack} className="w-8 h-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors flex items-center justify-center">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-zinc-800 dark:text-zinc-100 truncate uppercase tracking-tight">{activity.title}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase truncate">{activity.id}</p>
                </div>
            </div>

            {/* Controls Scroll Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                
                {/* Generation Mode */}
                <CompactToggleGroup 
                    label="Üretim Modu" 
                    selected={options.mode} 
                    onChange={(v: string) => handleChange('mode', v)} 
                    options={[
                        { value: 'fast', label: 'HIZLI (Local)' },
                        { value: 'ai', label: 'AKILLI (AI)' }
                    ]} 
                />

                {/* Difficulty */}
                <CompactToggleGroup 
                    label="Zorluk Seviyesi" 
                    selected={options.difficulty} 
                    onChange={(v: string) => handleChange('difficulty', v)} 
                    options={DIFFICULTY_OPTIONS} 
                />

                {/* Dynamic Controls */}
                <div className="pt-4 border-t border-dashed border-zinc-100 dark:border-zinc-800">
                    {renderActivityControls()}
                </div>

                {/* Student Context Shortcut */}
                <div className="pt-4">
                    <button 
                        onClick={onOpenStudentModal}
                        className={`w-full p-4 rounded-2xl border-2 border-dashed transition-all flex items-center gap-3 text-left ${studentProfile ? 'bg-indigo-50/50 border-indigo-200' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${studentProfile ? 'bg-indigo-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                            <i className="fa-solid fa-user-graduate"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Hedef Öğrenci</p>
                            <p className={`text-xs font-bold truncate ${studentProfile ? 'text-indigo-900' : 'text-zinc-500'}`}>
                                {studentProfile?.name || 'Seçilmedi (Anonim)'}
                            </p>
                        </div>
                        <i className="fa-solid fa-chevron-right text-[10px] text-zinc-300"></i>
                    </button>
                </div>
            </div>

            {/* Generate Action */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <button 
                    onClick={() => onGenerate(options)}
                    disabled={isLoading}
                    className="w-full py-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 transform active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            <span className="uppercase tracking-widest text-xs">Oluşturuluyor...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span className="uppercase tracking-widest text-xs">İçeriği Üret</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
